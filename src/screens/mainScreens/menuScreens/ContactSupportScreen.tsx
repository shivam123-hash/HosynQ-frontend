import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface ContactSupportScreenProps {
  onClose?: () => void;
  onSubmit?: (data: {
    category: string;
    description: string;
    includeDeviceInfo: boolean;
    hasScreenshots: boolean;
  }) => void;
  onAddScreenshot?: () => void;
  userEmail?: string;
  deviceInfo?: string;
}

export const ContactSupportScreen: React.FC<ContactSupportScreenProps> = ({
  onClose,
  onSubmit,
  onAddScreenshot,
  userEmail = 'priya.sharma@example.com',
  deviceInfo = 'Pixel 8 · Android 15 · HosynQ 1.0.0',
}) => {
  const insets = useSafeAreaInsets();
  const categories = [
    'Something isn’t working',
    'Billing',
    'Account',
    'Privacy',
    'Other',
  ];
  const [selectedCategory, setSelectedCategory] = useState('Something isn’t working');
  const [description, setDescription] = useState(
    'The Scan button closes the app after I take a photo.'
  );
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.innerContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Contact support</Text>

          <View style={styles.circlePlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section: WHAT'S IT ABOUT? */}
          <Text style={styles.sectionLabel}>WHAT’S IT ABOUT?</Text>
          <View style={styles.chipsRow}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipActive : styles.chipInactive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={cat}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Label & Textarea */}
          <Text style={styles.inputLabel}>Tell us what happened</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            selectionColor="#F0913A"
            placeholder="Describe the issue..."
            placeholderTextColor="#8A97AB"
          />

          {/* Section: SCREENSHOTS */}
          <View style={styles.screenshotsHeader}>
            <Text style={styles.sectionLabelInline}>SCREENSHOTS</Text>
            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.screenshotsRow}>
            {/* Sample thumbnail box */}
            <View style={styles.screenshotThumbnail} />

            {/* Add screenshot button */}
            <TouchableOpacity
              style={styles.addScreenshotBox}
              onPress={onAddScreenshot}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Add screenshot"
            >
              <Feather name="plus" size={22} color="#F0913A" />
            </TouchableOpacity>
          </View>

          {/* Include device info card */}
          <View style={styles.deviceInfoCard}>
            <View style={styles.deviceInfoTextColumn}>
              <Text style={styles.deviceInfoTitle}>Include device and app info</Text>
              <Text style={styles.deviceInfoSubtitle}>{deviceInfo}</Text>
            </View>
            <Switch
              value={includeDeviceInfo}
              onValueChange={setIncludeDeviceInfo}
              trackColor={{ false: Colors.borderBold, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </ScrollView>
      </View>

      {/* Fixed Bottom Action Container */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <Text style={styles.replyNotice}>We’ll reply to {userEmail}</Text>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() =>
            onSubmit?.({
              category: selectedCategory,
              description,
              includeDeviceInfo,
              hasScreenshots: true,
            })
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <Feather name="send" size={18} color="#FFFFFF" style={styles.sendIcon} />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.handleMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: 44,
    height: 44,
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipInactive: {
    backgroundColor: '#132235',
    borderWidth: 1,
    borderColor: '#22354A',
  },
  chipText: {
    fontSize: 14,
  },
  chipTextActive: {
    color: '#0A111E',
    fontFamily: 'Roboto-Bold',
  },
  chipTextInactive: {
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    marginTop: 18,
    marginBottom: 10,
  },
  textArea: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  screenshotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionLabelInline: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
  },
  optionalText: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
  },
  screenshotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenshotThumbnail: {
    width: 64,
    height: 96,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    marginRight: 12,
  },
  addScreenshotBox: {
    width: 64,
    height: 96,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.handleMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
  },
  deviceInfoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfoTextColumn: {
    flex: 1,
    paddingRight: 12,
  },
  deviceInfoTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  deviceInfoSubtitle: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
    marginTop: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
    backgroundColor: Colors.background,
  },
  replyNotice: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  sendButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
});
