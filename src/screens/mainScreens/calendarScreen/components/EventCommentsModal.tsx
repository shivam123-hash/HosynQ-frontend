import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CalendarEvent, EventComment } from '../types';

export interface EventCommentsModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onAddComment: (eventId: string, commentText: string) => void;
  asModal?: boolean;
}

export const EventCommentsModal: React.FC<EventCommentsModalProps> = ({
  visible,
  event: eventProp,
  onClose,
  onAddComment,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [commentText, setCommentText] = useState('');
  const [cachedEvent, setCachedEvent] = useState<CalendarEvent | null>(
    eventProp
  );

  useEffect(() => {
    if (eventProp) {
      setCachedEvent(eventProp);
    }
  }, [eventProp]);

  const event = eventProp || cachedEvent;

  if (!visible || !event) return null;

  const handleSend = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onAddComment(event.id, trimmed);
    setCommentText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getInitialStyle = (initial: string) => {
    switch (initial) {
      case 'R':
        return styles.initialRohan;
      case 'P':
        return styles.initialPriya;
      case 'D':
        return styles.initialDadi;
      case 'Aa':
        return styles.initialAarav;
      case 'A':
        return styles.initialAnaya;
      default:
        return styles.initialDefault;
    }
  };

  // Helper to render text with @mentions highlighted in orange
  const renderCommentText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return (
      <Text style={styles.commentText}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('@')) {
            return (
              <Text key={pIdx} style={styles.mentionText}>
                {part}
              </Text>
            );
          }
          return <Text key={pIdx}>{part}</Text>;
        })}
      </Text>
    );
  };

  const content = (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header (CAL-07) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to event"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Comments</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Event Context Capsule Card (CAL-07) */}
      <View style={styles.eventCapsule}>
        <View style={styles.capsuleLeft}>
          <Text style={styles.capsuleTime}>{event.startTime}</Text>
          <Text style={styles.capsuleTitle}>{event.title}</Text>
        </View>
        <Text style={styles.capsuleDate}>Today</Text>
      </View>

      {/* Comments List */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.commentsList}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {event.comments.map((c: EventComment) => {
          const isUser = Boolean(c.isCurrentUser);
          return (
            <View key={c.id} style={styles.commentItem}>
              {/* Author Avatar */}
              <View
                style={[
                  styles.commentAvatar,
                  { backgroundColor: c.authorColor || '#1E3A66' },
                ]}
              >
                <Text
                  style={[
                    styles.avatarInitial,
                    getInitialStyle(c.authorInitial),
                  ]}
                >
                  {c.authorInitial}
                </Text>
              </View>

              {/* Comment Content Column */}
              <View style={styles.commentBodyCol}>
                <View style={styles.commentHeaderRow}>
                  <Text style={styles.authorName}>{c.authorName}</Text>
                  <Text style={styles.commentTime}>{c.time}</Text>
                </View>

                <View
                  style={[
                    styles.commentBubble,
                    isUser && styles.commentBubbleUser,
                  ]}
                >
                  {renderCommentText(c.text)}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Input Row (CAL-07) */}
      <View style={styles.bottomBar}>
        <TextInput
          style={styles.textInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment. Use @ to mention."
          placeholderTextColor="#8A97AB"
          selectionColor="#F0913A"
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSend}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
        >
          <Feather name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  if (asModal) {
    return (
      <Modal
        visible={visible && Boolean(eventProp)}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  return <View style={styles.embeddedContainer}>{content}</View>;
};

export default EventCommentsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  embeddedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B1A2F',
    zIndex: 999,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
  },
  eventCapsule: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16284A',
    borderWidth: 1.5,
    borderColor: '#3B6AB3',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capsuleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capsuleTime: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#5B9BF0',
    marginRight: 8,
  },
  capsuleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  capsuleDate: {
    fontSize: 13.5,
    color: '#8A97AB',
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  initialRohan: {
    color: '#8DB8F5',
  },
  initialPriya: {
    color: '#F6C08E',
  },
  initialDadi: {
    color: '#9BD3A8',
  },
  initialAarav: {
    color: '#F2C14D',
  },
  initialAnaya: {
    color: '#F3A3CC',
  },
  initialDefault: {
    color: '#FFFFFF',
  },
  commentBodyCol: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentTime: {
    fontSize: 13,
    color: '#78869A',
    marginLeft: 10,
  },
  commentBubble: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  commentBubbleUser: {
    backgroundColor: '#122440',
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  commentText: {
    fontSize: 14.5,
    color: '#CAD4DF',
    lineHeight: 21,
  },
  mentionText: {
    color: '#F0913A',
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    backgroundColor: '#0B1A2F',
  },
  textInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#243A5E',
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
