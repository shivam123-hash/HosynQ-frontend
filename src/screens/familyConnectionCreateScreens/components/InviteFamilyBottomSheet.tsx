import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface InviteFamilyBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  familyName?: string;
  familyId?: string;
  inviterName?: string;
  onShareLink?: () => void;
  onSendSms?: () => void;
  onCopyMessage?: () => void;
  onShowQrCode?: () => void;
}

const InviteFamilyBottomSheet: React.FC<InviteFamilyBottomSheetProps> = ({
  visible,
  onClose,
  familyName = 'The Sharma Family',
  familyId = 'HSQ-4821',
  inviterName = 'Priya',
  onShareLink,
  onSendSms,
  onCopyMessage,
  onShowQrCode,
}) => {
  const insets = useSafeAreaInsets();
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const previewMessage = `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}, or tap [invite link].`;

  const handleShareInviteLink = async () => {
    try {
      await Share.share({
        message: previewMessage,
      });
      onShareLink?.();
    } catch (error) {
      console.log('Error sharing invite link:', error);
    }
  };

  const handleCopyMessage = () => {
    setCopiedFeedback(true);
    onCopyMessage?.();
    setTimeout(() => {
      setCopiedFeedback(false);
    }, 2000);
  };

  const handleSendSms = () => {
    console.log('Send by SMS clicked');
    onSendSms?.();
  };

  const handleShowQrCode = () => {
    console.log('Show QR code clicked');
    onShowQrCode?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Drag Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.sheetTitle}>Invite your family</Text>

          {/* Message Preview Box */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>MESSAGE THEY'LL GET</Text>
            <Text style={styles.previewBody}>{previewMessage}</Text>
          </View>

          {/* Options Group Container */}
          <View style={styles.optionsContainer}>
            {/* 1. Share invite link */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionRow}
              onPress={handleShareInviteLink}
            >
              <View style={styles.iconCircle}>
                <Feather name="upload" size={17} color={Colors.primary} />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Share invite link</Text>
                <Text style={styles.optionSubtitle}>
                  Opens your phone's share options
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color="rgba(255, 255, 255, 0.3)"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 2. Send by SMS */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionRow}
              onPress={handleSendSms}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={17}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Send by SMS</Text>
                <Text style={styles.optionSubtitle}>
                  Pick a contact from your phone
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color="rgba(255, 255, 255, 0.3)"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 3. Copy message */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionRow}
              onPress={handleCopyMessage}
            >
              <View style={styles.iconCircle}>
                <Feather
                  name={copiedFeedback ? 'check' : 'copy'}
                  size={17}
                  color={copiedFeedback ? '#2DD4BF' : Colors.primary}
                />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>
                  {copiedFeedback ? 'Message Copied!' : 'Copy message'}
                </Text>
                <Text style={styles.optionSubtitle}>Paste it in any chat</Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color="rgba(255, 255, 255, 0.3)"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 4. Show QR code */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionRow}
              onPress={handleShowQrCode}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="qr-code-outline"
                  size={17}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Show QR code</Text>
                <Text style={styles.optionSubtitle}>
                  Scan from a phone next to you
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color="rgba(255, 255, 255, 0.3)"
              />
            </TouchableOpacity>
          </View>

          {/* Done Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default InviteFamilyBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F2238',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  previewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  previewBody: {
    color: '#E2E8F0',
    fontSize: RFValue(13),
    lineHeight: RFValue(19),
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 18,
  },
  doneText: {
    color: Colors.primary,
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});

