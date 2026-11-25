import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { TaskComment } from '../types';
import { tasksServices } from '../../../../services';
import { Colors, Fonts, Typography } from '../../../../units';

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
    avatarBg: c.author?.avatarColor || Colors.avatarNavy,
    avatarColor: Colors.accentBlueSoft,
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
  const scrollViewRef = useRef<any>(null);
  const [commentList, setCommentList] = useState<TaskComment[]>(comments);
  const [totalCount, setTotalCount] = useState<number>(comments?.length || 0);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);

  const fetchAllComments = useCallback(
    async (isSilent = false) => {
      if (!taskId || !isUUID(taskId)) {
        setCommentList(comments);
        setTotalCount(comments?.length || 0);
        return;
      }
      try {
        if (!isSilent) {
          setLoading(true);
        }
        console.log('[CommentsModal] Fetching all comments for task:', taskId, 'silent:', isSilent);
        const res = await tasksServices.getComments(taskId, undefined, 50);
        const rawList = Array.isArray(res) ? res : res?.comments || [];
        const uiComments: TaskComment[] = rawList.map(mapApiCommentToUiComment);

        // Sort oldest to newest so conversation reads top to bottom
        uiComments.sort((a, b) => {
          const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
          const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
          return timeA - timeB;
        });

        setCommentList((prev) => {
          const prevIds = prev.map((c) => c.id).join(',');
          const newIds = uiComments.map((c) => c.id).join(',');
          if (prevIds !== newIds || prev.length !== uiComments.length) {
            return uiComments;
          }
          return prev;
        });
        setTotalCount(res?.pagination?.total ?? uiComments.length);
        setHasOlder(Boolean(res?.pagination?.hasOlder));
        setOlderCursor(res?.pagination?.olderCursor || null);
      } catch (err) {
        console.log('[CommentsModal] ❌ Error fetching comments:', err);
        if (!isSilent && comments && comments.length > 0) {
          setCommentList(comments);
          setTotalCount(comments.length);
        }
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    },
    [taskId, comments]
  );

  // Initial fetch when opened
  useEffect(() => {
    if (visible) {
      fetchAllComments(false);
    }
  }, [visible, fetchAllComments]);

  // Sync if taskId is not a UUID (mock data or offline fallback)
  useEffect(() => {
    if (!isUUID(taskId) && comments) {
      setCommentList(comments);
      setTotalCount(comments.length);
    }
  }, [comments, taskId]);

  // Real-time auto-sync: Poll every 5s silently while modal is open so comments posted by others (e.g. Rupesh) appear automatically
  useEffect(() => {
    if (!visible || !taskId || !isUUID(taskId)) return;

    const interval = setInterval(() => {
      fetchAllComments(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [visible, taskId, fetchAllComments]);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    if (commentList.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [commentList.length]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAllComments(true);
    } finally {
      setRefreshing(false);
    }
  };

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
      setTotalCount(res?.pagination?.total ?? totalCount);
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
      authorInitial: 'Y',
      avatarBg: Colors.avatarBrown,
      avatarColor: Colors.primary,
      time: 'Just now',
      text: trimmed,
      isYou: true,
      rawCreatedAt: new Date().toISOString(),
    };

    setCommentList((prev) => [...prev, tempComment]);
    setTotalCount((prev) => prev + 1);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      if (onAddComment) {
        await onAddComment(trimmed);
      }
      if (taskId && isUUID(taskId)) {
        await fetchAllComments(true);
      }
    } catch (err) {
      console.log('[CommentsModal] Error sending comment:', err);
    }
  };

  const renderCommentText = (text: string) => {
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
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0}
      >
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Comments</Text>

          <View style={styles.rightHeaderContainer}>
            {totalCount > 0 ? (
              <View style={styles.countBadge}>
                <Feather name="message-square" size={12} color={Colors.primary} />
                <Text style={styles.countBadgeText}>{totalCount}</Text>
              </View>
            ) : (
              <View style={styles.spacer} />
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
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
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.loadOlderText}>Load older comments</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Comments List / Loading / Empty State */}
          {loading && commentList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : commentList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={32} color={Colors.borderMutedAlt} />
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
                    { backgroundColor: c.avatarBg || Colors.avatarNavy },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: c.avatarColor || Colors.accentBlueSoft },
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
            { paddingBottom: Math.max(insets.bottom, 12) + (Platform.OS === 'android' ? 6 : 4) },
          ]}
        >
          <TextInput
            style={styles.inputField}
            placeholder="Write a comment. Use @ to mention."
            placeholderTextColor={Colors.textSecondaryMuted}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 250);
            }}
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
              color={Colors.white}
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
    backgroundColor: Colors.background,
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
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  rightHeaderContainer: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tasksTrackBg,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  countBadgeText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
    color: Colors.white,
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
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
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
    backgroundColor: Colors.dangerCoral,
  },
  taskTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
    flex: 1,
  },
  dueDateText: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
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
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
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
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
  },
  timeText: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
  },
  bubble: {
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 14,
  },
  bubbleYou: {
    borderColor: Colors.primary,
  },
  bubbleText: {
    fontSize: Typography.size.body,
    color: Colors.textLightMutedAlt,
    lineHeight: 20,
  },
  mentionText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  inputField: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.transparent,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    paddingHorizontal: 18,
    color: Colors.white,
    fontSize: Typography.size.body,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    marginBottom: 16,
  },
  loadOlderText: {
    fontSize: Typography.size.bodySmall,
    fontWeight: '600',
    color: Colors.accentBlueSoft,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: Typography.size.subtitle,
    fontWeight: '600',
    color: Colors.textLightMutedAlt,
  },
  emptySubtext: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
  },
});
