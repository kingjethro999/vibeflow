// search.jsx
import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Input from '../../components/Input';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { searchContent } from '../../services/searchService';
import PostCard from '../../components/PostCard';
import Avatar from '../../components/Avatar';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import ScreenWrapper from '../../components/ScreenWrapper';

const Search = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (text) => {
        setQuery(text);
        if (!text.trim()) {
            setResults({ users: [], posts: [] });
            return;
        }

        setLoading(true);
        const res = await searchContent(text);
        setLoading(false);
        
        if (res.success) {
            setResults(res.data);
        }
    }, []);

    const renderUserItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.userItem}
            onPress={() => router.push({
                pathname: 'viewProfile',
                params: { userId: item.id }
            })}
        >
            <Avatar uri={item.image} size={hp(6)} />
            <Text style={styles.userName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderPostItem = ({ item }) => (
        <PostCard
            item={item}
            currentUser={user}
            router={router}
        />
    );

    const hasNoResults = !loading && query && !results.users.length && !results.posts.length;

    return (
        <ScreenWrapper bg="white">
        <View style={styles.container}>
            <Header title="Search" mb={20} />
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Search posts and users..."
                    onChangeText={handleSearch}
                    value={query}
                />
            </View>

            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={[
                        ...(results.users.length ? [{ header: 'Users' }] : []),
                        ...results.users,
                        ...(results.posts.length ? [{ header: 'Posts' }] : []),
                        ...results.posts
                    ]}
                    renderItem={({ item }) => {
                        if (item.header) {
                            return <Text style={styles.sectionHeader}>{item.header}</Text>;
                        }
                        return item.description ? renderPostItem({ item }) : renderUserItem({ item });
                    }}
                    keyExtractor={(item) => (item.header || `${item.id}-${item.description ? 'post' : 'user'}`)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        hasNoResults && (
                            <Text style={styles.noResults}>No results found</Text>
                        )
                    }
                />
            )}
        </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginVertical: wp(4),
        paddingHorizontal: wp(4)
    },
    searchContainer: {
        marginBottom: hp(2)
    },
    list: {
        gap: hp(2)
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        padding: wp(2)
    },
    userName: {
        fontSize: hp(2),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium
    },
    sectionHeader: {
        fontSize: hp(2.2),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        marginTop: hp(1)
    },
    noResults: {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: hp(2),
        marginTop: hp(4)
    }
});

export default Search;