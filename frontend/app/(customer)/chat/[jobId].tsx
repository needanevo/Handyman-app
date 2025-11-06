import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isCurrentUser: boolean;
  attachments?: string[];
}

// Mock messages - would come from API/WebSocket
const mockMessages: Message[] = [
  {
    id: '1',
    text: "Hi! I'm Mike Johnson, your contractor for the drywall repair job. I'll be starting work tomorrow morning.",
    senderId: 'contractor1',
    senderName: 'Mike Johnson',
    timestamp: '2025-11-02 09:30 AM',
    isCurrentUser: false,
  },
  {
    id: '2',
    text: 'Great! What time should I expect you?',
    senderId: 'customer1',
    senderName: 'You',
    timestamp: '2025-11-02 09:45 AM',
    isCurrentUser: true,
  },
  {
    id: '3',
    text: "I'll be there around 10 AM. I've already picked up the materials - uploading receipts now.",
    senderId: 'contractor1',
    senderName: 'Mike Johnson',
    timestamp: '2025-11-02 10:15 AM',
    isCurrentUser: false,
  },
  {
    id: '4',
    text: 'Sounds good. See you then!',
    senderId: 'customer1',
    senderName: 'You',
    timestamp: '2025-11-02 10:20 AM',
    isCurrentUser: true,
  },
  {
    id: '5',
    text: "I've completed the patch and tape work. Here are some progress photos. Ready for texturing next.",
    senderId: 'contractor1',
    senderName: 'Mike Johnson',
    timestamp: '2025-11-05 02:30 PM',
    isCurrentUser: false,
    attachments: [
      'https://via.placeholder.com/300x200/2563EB/FFFFFF?text=Progress+Photo+1',
      'https://via.placeholder.com/300x200/2563EB/FFFFFF?text=Progress+Photo+2',
    ],
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom on mount and when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'customer1',
      senderName: 'You',
      timestamp: new Date().toLocaleString(),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate sending to server
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleAttachment = () => {
    // Implement photo/file attachment
    console.log('Attachment button pressed');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.isCurrentUser ? styles.messageContainerUser : styles.messageContainerOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isCurrentUser ? styles.messageBubbleUser : styles.messageBubbleOther,
          ]}
        >
          {!item.isCurrentUser && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              item.isCurrentUser ? styles.messageTextUser : styles.messageTextOther,
            ]}
          >
            {item.text}
          </Text>

          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachments}>
              {item.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    /* Open image viewer */
                  }}
                >
                  <Image source={{ uri: attachment }} style={styles.attachmentImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text
            style={[
              styles.messageTime,
              item.isCurrentUser ? styles.messageTimeUser : styles.messageTimeOther,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Mike Johnson</Text>
            <Text style={styles.headerSubtitle}>Contractor</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => router.push(`/(customer)/job-detail/${params.jobId}`)}
        >
          <Ionicons name="information-circle-outline" size={28} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Ionicons name="camera" size={24} color={colors.primary.main} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isSending ? colors.background.primary : colors.neutral[400]}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  headerSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  infoButton: {
    padding: spacing.sm,
  },
  messagesList: {
    padding: spacing.base,
    gap: spacing.md,
  },
  messageContainer: {
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
  messageContainerUser: {
    alignItems: 'flex-end',
  },
  messageContainerOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: spacing.xs,
  },
  messageBubbleOther: {
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: spacing.xs,
  },
  senderName: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.sizes.base,
    lineHeight: 22,
  },
  messageTextUser: {
    color: colors.background.primary,
  },
  messageTextOther: {
    color: colors.neutral[900],
  },
  messageTime: {
    ...typography.sizes.xs,
    marginTop: spacing.xs,
  },
  messageTimeUser: {
    color: colors.primary.lighter,
  },
  messageTimeOther: {
    color: colors.neutral[500],
  },
  attachments: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  attachmentImage: {
    width: 150,
    height: 100,
    borderRadius: borderRadius.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...typography.sizes.base,
    color: colors.neutral[900],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
});
