import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { theme } from '../constants/theme';

const RichTextEditor = ({ onChange, initialContent = '', editorRef, ...props }) => {
  const webViewRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(240);

  const editorHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: -apple-system, system-ui;
            font-size: 16px;
            color: ${theme.colors.text};
            margin: 0;
            padding: 8px;
          }
          #editor {
            min-height: 200px;
            outline: none;
          }
        </style>
        <script>
          function updateHTML() {
            const content = document.getElementById('editor').innerHTML;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'content',
              content: content
            }));
          }

          function setContent(html) {
            document.getElementById('editor').innerHTML = html;
          }

          function updateHeight() {
            const height = document.documentElement.scrollHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'height',
              height: height
            }));
          }
        </script>
      </head>
      <body>
        <div id="editor" contenteditable="true" onkeyup="updateHTML()" oninput="updateHeight()" placeholder="What's on your mind?"></div>
      </body>
    </html>
  `;

  useEffect(() => {
    if (webViewRef.current && initialContent) {
      webViewRef.current.injectJavaScript(`
        setContent(\`${initialContent}\`);
      `);
    }
  }, [initialContent]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'content') {
        onChange(data.content);
      } else if (data.type === 'height') {
        setEditorHeight(Math.max(240, data.height));
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  React.useImperativeHandle(editorRef, () => ({
    setContentHTML: (html) => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          setContent(\`${html}\`);
        `);
      }
    },
    getContentHtml: () => {
      return new Promise((resolve) => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'content',
              content: document.getElementById('editor').innerHTML
            }));
          `);
        }
      });
    }
  }));

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: editorHTML }}
        style={[styles.webview, { height: editorHeight }]}
        onMessage={handleMessage}
        scrollEnabled={false}
        hideKeyboardAccessoryView={true}
        keyboardDisplayRequiresUserAction={false}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  }
});

export default RichTextEditor;