import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { TaskComment } from '../types';

export interface CommentsModalProps {
  visible: boolean;
  taskTitle: string;
  dueDateSubtitle: string;
  comments: TaskComment[];
  onClose: () => void;
  onAddComment?: (text: string) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  taskTitle,
  dueDateSubtitle,
  comments,
  onClose,
  onAddComment,
}) => {
  const insets = useSafeAreaInsets();
  const [commentList, setCommentList] = useState<TaskComment[]>(comments);
  const [inputText, setInputText] = useState('');

  React.useEffect(() => {
    setCommentList(comments);
  }, [comments, visible]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      authorInitial: 'P',
      avatarBg: '#5C3A21',
      avatarColor: '#F0913A',
      time: 'Just now',
      text: inputText.trim(),
      isYou: true,
    };

    setCommentList((prev) => [...prev, newComment]);
    onAddComment?.(inputText.trim());
    setInputText('');
  };

  const renderCommentText = (text: string) => {
    // Highlight @mentions in orange
    const parts = text.split(/(@\w+)/g);
    return (
      <Text style={styles.bubbleText}>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            return (
              <Text key={i} style={styles.mentionText}>
                {part}{' '}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color="#CAD4DF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Task Snapshot Card */}
          <View style={styles.taskCard}>
            <View style={styles.taskCardLeft}>
              <View style={styles.redDot} />
              <Text style={styles.taskTitle} numberOfLines={1}>
                {taskTitle}
              </Text>
            </View>
            <Text style={styles.dueDateText}>{dueDateSubtitle}</Text>
          </View>

          {/* Comments List */}
          {commentList.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: c.avatarBg || '#1E3A66' },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: c.avatarColor || '#8DB8F5' },
                  ]}
                >
                  {c.authorInitial}
                </Text>
              </View>

              <View style={styles.commentBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.authorText}>{c.author}</Text>
                  <Text style={styles.timeText}>{c.time}</Text>
                </View>

                <View
                  style={[
                    styles.bubble,
                    c.isYou && styles.bubbleYou,
                  ]}
                >
                  {renderCommentText(c.text)}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          ]}
        >
          <TextInput
            style={styles.inputField}
            placeholder="Write a comment. Use @ to mention."
            placeholderTextColor="#8A97AB"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length > 0 && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#0B1A2F" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  spacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 8,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CAD4DF',
    flex: 1,
  },
  dueDateText: {
    fontSize: 13,
    color: '#8A97AB',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  timeText: {
    fontSize: 12,
    color: '#8A97AB',
  },
  bubble: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
  },
  bubbleYou: {
    borderColor: '#F0913A',
  },
  bubbleText: {
    fontSize: 14,
    color: '#CAD4DF',
    lineHeight: 20,
  },
  mentionText: {
    color: '#F0913A',
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  inputField: {
    flex: 1,
    height: 48,
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    color: '#CAD4DF',
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8A97AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#F0913A',
  },
});

