import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { TaskComment } from '../types';
import { tasksServices } from '../../../../services';

export interface CommentsModalProps {
  visible: boolean;
  taskId?: string;
  taskTitle: string;
  dueDateSubtitle: string;
  comments: TaskComment[];
  onClose: () => void;
  onAddComment?: (text: string) => Promise<void> | void;
}

const isUUID = (id?: string): boolean =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const mapApiCommentToUiComment = (c: any): TaskComment => {
  const authorName = c.author?.fullName || (c.isMine ? 'You' : 'Member');
  const authorInitial = ((authorName.trim()[0] || 'M')).toUpperCase();
  return {
    id: c.id,
    author: authorName,
    authorInitial,
    avatarBg: c.author?.avatarColor || '#1E3A66',
    avatarColor: '#8DB8F5',
    time: c.createdAt
      ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now',
    text: c.body || '',
    isYou: Boolean(c.isMine),
    rawCreatedAt: c.createdAt,
  };
};

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  taskId,
  taskTitle,
  dueDateSubtitle,
  comments,
  onClose,
  onAddComment,
}) => {
  const insets = useSafeAreaInsets();
  const [commentList, setCommentList] = useState<TaskComment[]>(comments);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);

  const fetchAllComments = useCallback(async () => {
    if (!taskId || !isUUID(taskId)) {
      setCommentList(comments);
      return;
    }
    try {
      setLoading(true);
      console.log('[CommentsModal] Fetching all comments for task:', taskId);
      const res = await tasksServices.getComments(taskId, undefined, 50);
      const rawList = Array.isArray(res) ? res : res?.comments || [];
      const uiComments: TaskComment[] = rawList.map(mapApiCommentToUiComment);

      // Sort oldest to newest so conversation reads top to bottom
      uiComments.sort((a, b) => {
        const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
        const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
        return timeA - timeB;
      });

      setCommentList(uiComments);
      setHasOlder(Boolean(res?.pagination?.hasOlder));
      setOlderCursor(res?.pagination?.olderCursor || null);
    } catch (err) {
      console.log('[CommentsModal] ❌ Error fetching comments:', err);
      if (comments && comments.length > 0) {
        setCommentList(comments);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId, comments]);

  useEffect(() => {
    if (visible) {
      fetchAllComments();
    }
  }, [visible, fetchAllComments]);

  const handleLoadOlder = async () => {
    if (!taskId || !olderCursor || loadingOlder) return;
    try {
      setLoadingOlder(true);
      console.log('[CommentsModal] Loading older comments before cursor:', olderCursor);
      const res = await tasksServices.getComments(taskId, olderCursor, 30);
      const rawList = Array.isArray(res) ? res : res?.comments || [];
      const olderComments: TaskComment[] = rawList.map(mapApiCommentToUiComment);
      olderComments.sort((a, b) => {
        const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
        const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
        return timeA - timeB;
      });

      setCommentList((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const filteredOlder = olderComments.filter((c) => !existingIds.has(c.id));
        return [...filteredOlder, ...prev];
      });
      setHasOlder(Boolean(res?.pagination?.hasOlder));
      setOlderCursor(res?.pagination?.olderCursor || null);
    } catch (err) {
      console.log('[CommentsModal] Error loading older comments:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const tempComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      authorInitial: 'P',
      avatarBg: '#5C3A21',
      avatarColor: '#F0913A',
      time: 'Just now',
      text: trimmed,
      isYou: true,
      rawCreatedAt: new Date().toISOString(),
    };

    setCommentList((prev) => [...prev, tempComment]);
    setInputText('');

    try {
      if (onAddComment) {
        await onAddComment(trimmed);
      }
      // Re-fetch all comments from server to sync official IDs and pagination
      if (taskId && isUUID(taskId)) {
        const res = await tasksServices.getComments(taskId, undefined, 50);
        const rawList = Array.isArray(res) ? res : res?.comments || [];
        if (rawList.length > 0) {
          const uiComments: TaskComment[] = rawList.map(mapApiCommentToUiComment);
          uiComments.sort((a, b) => {
            const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
            const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
            return timeA - timeB;
          });
          setCommentList(uiComments);
          setHasOlder(Boolean(res?.pagination?.hasOlder));
          setOlderCursor(res?.pagination?.olderCursor || null);
        }
      }
    } catch (err) {
      console.log('[CommentsModal] Error sending comment:', err);
    }
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
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
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

          {/* Load Older Comments Button */}
          {hasOlder && (
            <TouchableOpacity
              style={styles.loadOlderBtn}
              onPress={handleLoadOlder}
              disabled={loadingOlder}
              activeOpacity={0.7}
            >
              {loadingOlder ? (
                <ActivityIndicator size="small" color="#F0913A" />
              ) : (
                <Text style={styles.loadOlderText}>Load older comments</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Comments List / Loading / Empty State */}
          {loading && commentList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#F0913A" />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : commentList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={32} color="#3A4556" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>
                Start the conversation or ask a question.
              </Text>
            </View>
          ) : (
            commentList.map((c) => (
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
            ))
          )}
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
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            <Feather
              name="send"
              size={18}
              color="#FFFFFF"
              style={styles.sendIcon}
            />
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
    color: '#FFFFFF',
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
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1.5,
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
    backgroundColor: '#F06A6A',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
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
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    marginRight: 1,
    marginTop: 1,
  },
  loadOlderBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    marginBottom: 16,
  },
  loadOlderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8DB8F5',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#8A97AB',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
  },
});

