// viewProfile.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Header from '../../components/Header';
import Avatar from '../../components/Avatar';
import { getUserData } from '../../services/userService';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../assets/icons';
import ScreenWrapper from '../../components/ScreenWrapper';

const ViewProfile = () => {
    const { userId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            const [userRes, postsRes] = await Promise.all([
                getUserData(userId),
                fetchPosts(50, userId)
            ]);

            if (userRes.success) {
                setProfile(userRes.data);
            }
            if (postsRes.success) {
                setPosts(postsRes.data);
            }
        } catch (error) {
            console.error('Profile loading error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Loading />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>User not found</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <Header style={styles.header}
                    title={profile.name}
                    rightIcon={
                        user?.id === profile.id && (
                            <TouchableOpacity onPress={() => router.push('editProfile')}>
                                <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
                            </TouchableOpacity>
                        )
                    }
                />

                <View style={styles.profileHeader}>
                    <Avatar
                        uri={profile.image}
                        size={hp(12)}
                        rounded={theme.radius.full}
                    />
                    <Text style={styles.name}>{profile.name}</Text>
                    {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
                </View>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{posts.length}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                </View>

                <FlatList
                    data={posts}
                    renderItem={({ item }) => (
                        <PostCard
                            item={item}
                            currentUser={user}
                            router={router}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.postsList}
                    ListEmptyComponent={
                        <Text style={styles.noPosts}>No posts yet</Text>
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: wp(4)
    },
    header: {
        marginVertical: wp(4),
        marginHorizontal: wp(4),
    }
    ,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    errorText: {
        fontSize: hp(2.2),
        color: theme.colors.text
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: hp(3),
        paddingHorizontal: wp(4)
    },
    name: {
        fontSize: hp(2.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        marginTop: hp(1.5)
    },
    bio: {
        fontSize: hp(1.8),
        color: theme.colors.textLight,
        marginTop: hp(1),
        textAlign: 'center'
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: hp(2),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: wp(4)
    },
    statNumber: {
        fontSize: hp(2.2),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text
    },
    statLabel: {
        fontSize: hp(1.8),
        color: theme.colors.textLight
    },
    postsList: {
        padding: wp(4),
        gap: hp(2)
    },
    noPosts: {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: hp(2),
        marginTop: hp(4)
    }
});

export default ViewProfile;