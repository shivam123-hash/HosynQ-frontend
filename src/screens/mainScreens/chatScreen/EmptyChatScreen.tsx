import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface EmptyChatScreenProps {
  onBack?: () => void;
  onOptionsPress?: () => void;
  onSendMessage?: (text: string) => void;
  onPlusPress?: () => void;
  onCameraPress?: () => void;
  onMicPress?: () => void;
  title?: string;
  memberCountText?: string;
}

export const EmptyChatScreen: React.FC<EmptyChatScreenProps> = ({
  onBack,
  onOptionsPress,
  onSendMessage,
  onPlusPress,
  onCameraPress,
  onMicPress,
  title = 'Family chat',
  memberCountText = '5 members',
}) => {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (onSendMessage) {
      onSendMessage(text);
    }
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{memberCountText}</Text>
          </View>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={onOptionsPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Center Content: Concentric Rings + Copy + Structured Prompt Chips */}
        <View style={styles.centerContent}>
          {/* Concentric Circles Illustration */}
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <Feather name="message-square" size={32} color={Colors.primary} />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Say hello to your family</Text>

          {/* Subtitle with exact Figma line breaks */}
          <Text style={styles.subtitle}>
            Everyone in The Sharma Family sees{'\n'}messages here. You can
            share tasks, events{'\n'}and lists too.
          </Text>

          {/* Structured Prompt Chips */}
          <View style={styles.chipsContainer}>
            {/* Top row: 1 centered chip */}
            <View style={styles.topChipRow}>
              <TouchableOpacity
                style={styles.promptChip}
                onPress={() => handleSend('Good morning, everyone!')}
                activeOpacity={0.7}
              >
                <Text style={styles.promptChipText}>Good morning, everyone!</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom row: 2 chips side-by-side */}
            <View style={styles.bottomChipsRow}>
              <TouchableOpacity
                style={styles.promptChip}
                onPress={() => handleSend('What’s for dinner?')}
                activeOpacity={0.7}
              >
                <Text style={styles.promptChipText}>What’s for dinner?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.promptChip}
                onPress={() => handleSend('Who’s home tonight?')}
                activeOpacity={0.7}
              >
                <Text style={styles.promptChipText}>Who’s home tonight?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Input Dock */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {/* Plus Button */}
          <TouchableOpacity
            style={styles.plusButton}
            onPress={onPlusPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share options"
          >
            <Feather name="plus" size={20} color={Colors.white} />
          </TouchableOpacity>

          {/* Message Input Pill */}
          <View style={styles.inputPill}>
            <TextInput
              style={styles.messageInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message"
              placeholderTextColor={Colors.textPlaceholder}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={onCameraPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Camera"
            >
              <Feather name="camera" size={18} color={Colors.textPlaceholder} />
            </TouchableOpacity>
          </View>

          {/* Voice Mic / Send Button */}
          {inputText.trim().length > 0 ? (
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => handleSend()}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Feather name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPress={onMicPress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Voice message"
            >
              <Feather name="mic" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  outerRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(29, 50, 82, 0.4)',
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  innerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  chipsContainer: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  topChipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  promptChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptChipText: {
    color: Colors.textNearWhite,
    fontSize: 14,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    gap: 10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  cameraIconBtn: {
    padding: 4,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmptyChatScreen;
