import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface PrivacyNoticeScreenProps {
  onBack?: () => void;
  onOlderVersions?: () => void;
  onShare?: () => void;
}

export const PrivacyNoticeScreen: React.FC<PrivacyNoticeScreenProps> = ({
  onBack,
  onOlderVersions,
  onShare,
}) => {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    try {
      await Share.share({
        message: 'HosynQ Privacy Notice: https://hosynq.com/privacy',
        title: 'HosynQ Privacy Notice',
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Privacy notice</Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Share privacy notice"
        >
          <Feather name="share-2" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Version 1.2 Card */}
        <View style={styles.versionCard}>
          <View style={styles.versionCardContent}>
            <View style={styles.versionLeftCol}>
              <Text style={styles.versionTitle}>Version 1.2</Text>
              <Text style={styles.versionSubtitle}>In effect from 1 Oct 2026</Text>
            </View>

            <View style={styles.versionRightCol}>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
              <TouchableOpacity
                onPress={onOlderVersions}
                activeOpacity={0.7}
                style={styles.olderVersionsBtn}
                accessibilityRole="button"
                accessibilityLabel="Older versions"
              >
                <Text style={styles.olderVersionsText}>Older versions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Changelog Card */}
        <View style={styles.changelogCard}>
          <View style={styles.changelogIconBox}>
            <Feather name="star" size={16} color="#F0923A" />
          </View>
          <View style={styles.changelogInfo}>
            <Text style={styles.changelogTitle}>What changed in 1.2</Text>
            <Text style={styles.changelogSubtitle}>
              Added Compass location history, and how long we keep scanned documents.
            </Text>
          </View>
        </View>

        {/* Language Segmented Toggle */}
        <View style={styles.languageToggleContainer}>
          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'en' && styles.langButtonActive,
            ]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.langButtonText,
                language === 'en' && styles.langButtonTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'hi' && styles.langButtonActive,
            ]}
            onPress={() => setLanguage('hi')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.langButtonText,
                language === 'hi' && styles.langButtonTextActive,
              ]}
            >
              Hindi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notice Content */}
        {language === 'en' ? (
          <View style={styles.contentSection}>
            <Text style={styles.sectionHeading}>What we collect</Text>
            <Text style={styles.paragraph}>
              Your name, mobile number and the things your family adds: tasks,
              events, lists, chats, documents and, if you allow it, location.
            </Text>

            <Text style={styles.sectionHeading}>How we use it</Text>
            <Text style={styles.paragraph}>
              To run HosynQ for your family, send reminders and write your AI
              brief. We don’t sell your data.
            </Text>

            <Text style={styles.sectionHeading}>Who can see it</Text>
            <Text style={styles.paragraph}>
              Only members of your family, based on their role. Just Us is
              visible only to the two of you.
            </Text>
          </View>
        ) : (
          <View style={styles.contentSection}>
            <Text style={styles.sectionHeading}>हम क्या एकत्र करते हैं</Text>
            <Text style={styles.paragraph}>
              आपका नाम, मोबाइल नंबर और आपके परिवार द्वारा जोड़ी गई जानकारी: कार्य,
              कार्यक्रम, सूचियां, चैट, दस्तावेज़ और अनुमति होने पर स्थान।
            </Text>

            <Text style={styles.sectionHeading}>हम इसका उपयोग कैसे करते हैं</Text>
            <Text style={styles.paragraph}>
              आपके परिवार के लिए HosynQ चलाने, अनुस्मारक भेजने और आपकी AI ब्रीफ
              लिखने के लिए। हम आपका डेटा नहीं बेचते हैं।
            </Text>

            <Text style={styles.sectionHeading}>इसे कौन देख सकता है</Text>
            <Text style={styles.paragraph}>
              केवल आपके परिवार के सदस्य, उनकी भूमिका के अनुसार। Just Us केवल आप दोनों
              को ही दिखाई देता है।
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  versionCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  versionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionLeftCol: {
    justifyContent: 'center',
  },
  versionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  versionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  versionRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#6FD9A6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  currentBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
    textAlign: 'center',
  },
  olderVersionsBtn: {
    paddingVertical: 4,
  },
  olderVersionsText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#F0923A',
  },
  changelogCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 20,
  },
  changelogIconBox: {
    marginTop: 2,
    marginRight: 10,
  },
  changelogInfo: {
    flex: 1,
  },
  changelogTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changelogSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  languageToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#3A4555',
    padding: 4,
    height: 52,
    marginBottom: 28,
  },
  langButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langButtonActive: {
    backgroundColor: '#F0923A',
  },
  langButtonText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#C8D1DC',
  },
  langButtonTextActive: {
    color: '#0A1320',
    fontFamily: 'Roboto-Bold',
  },
  contentSection: {
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 22,
    marginBottom: 24,
  },
});
