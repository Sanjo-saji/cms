import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import API from "../../API/api";
import moment from 'moment';
import { router } from 'expo-router';

const ChatScreen = () => {
  const { id, name, image } = useLocalSearchParams(); // id = anonId
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await API.get(`/chat/teacher/chat/${id}`);
        const serverMessages = Array.isArray(response.data?.messages) ? response.data.messages : [];
        setMessages(
          serverMessages.map((msg) => ({
            _id: msg._id || Math.random().toString(),
            text: msg.text,
            timestamp: msg.timestamp,
            sender: msg.sender === 'teacher' ? 'me' : 'student',
            anonId: msg.anonId,
            isActive: msg.isActive,
            createdAt: msg.createdAt,
            lastActivity: msg.lastActivity,
          }))
        );
      } catch (error) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const trimmed = message.trim();
      try {
        // Optimistic add
        const optimistic = {
          _id: Date.now().toString(),
          text: trimmed,
          timestamp: new Date().toISOString(),
          sender: 'me',
        };
        setMessages((prev) => [...prev, optimistic]);
        setMessage("");

        await API.post("/chat/teacher/send", {
          anonId: id,
          message: trimmed,
        });
      } catch (error) {
        // Revert optimistic on failure
        setMessages((prev) => prev.filter((m) => m.text !== message.trim()));
        console.error(error);
      }
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconArrow}>{'←'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerImageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.headerImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
        </View>
      </View>

      {/* Chat + Input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-1}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.chatWrapper}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => {
                const isMe = item.sender === 'me';
                const isHistorical = item.anonId && item.anonId !== id;
                const isInactive = item.isActive === false;
                
                return (
                  <View
                    style={[
                      styles.messageContainer,
                      isMe ? styles.myMessage : styles.otherMessage,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe ? styles.myMessageBubble : styles.otherMessageBubble,
                      ]}
                    >
                      {/* Show anonId info for historical messages inline */}
                      {!isMe && (isHistorical || isInactive) && (
                        <Text style={styles.anonIdText}>
                          {isHistorical ? `[Previous ID: ${item.anonId}] ` : `[ID: ${item.anonId}] `}
                          {isInactive && '[Inactive] '}
                        </Text>
                      )}
                      
                      <Text
                        style={[
                          styles.messageText,
                          isMe ? styles.myMessageText : styles.otherMessageText,
                        ]}
                      >
                        {item.text}
                      </Text>
                      <Text
                        style={[
                          styles.timestamp,
                          isMe ? styles.myTimestamp : styles.otherTimestamp,
                        ]}
                      >
                        {moment(item.timestamp).format('h:mm A')}
                      </Text>
                    </View>
                  </View>
                );
              }}
              keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#888"
                multiline={true}
                maxLength={1000}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !message.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 0, // Remove white bar
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#23272F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  headerImageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },
  chatWrapper: {
    flex: 1,
    padding: 10,
    backgroundColor: '#121212',
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  myMessageBubble: {
    backgroundColor: '#4F8EF7',
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#23272F',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#e0e0e0',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    opacity: 0.6,
  },
  myTimestamp: {
    color: '#cce0ff',
  },
  otherTimestamp: {
    color: '#aaa',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272F',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  sendButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#888',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    marginLeft: 10,
    padding: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconReset: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 1,
  },
  anonIdText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});


export default ChatScreen;