import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import QRCodeView from '../../../components/QRCodeView';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { createInvitationThunk } from '../../../redux/features/family/familySlice';

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
  const dispatch = useAppDispatch();
  const { invitation, inviteLoading } = useAppSelector((state) => state.family);

  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  // Fetch or generate the invite link when the bottomsheet opens
  useEffect(() => {
    if (visible && !invitation?.url && !inviteLoading) {
      console.log('[InviteFamilyBottomSheet] Fetching / generating invite link...');
      dispatch(createInvitationThunk());
    }
  }, [visible, invitation?.url, inviteLoading, dispatch]);

  const inviteUrl = invitation?.url || '';

  const previewMessage = inviteUrl
    ? `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}, or tap ${inviteUrl}`
    : `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}, or tap [invite link].`;

  // 1. Share invite link via native system share dialog
  const handleShareInviteLink = async () => {
    let currentUrl = invitation?.url;
    if (!currentUrl) {
      try {
        const res = await dispatch(createInvitationThunk()).unwrap();
        currentUrl = res.invitation.url;
      } catch (error) {
        console.warn('Failed to get invite link for share dialog:', error);
      }
    }

    const finalUrl = currentUrl || '';
    const shareMessage = finalUrl
      ? `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}, or tap ${finalUrl}`
      : `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}`;

    try {
      await Share.share({
        message: shareMessage,
        url: finalUrl || undefined,
      });
      onShareLink?.();
    } catch (error) {
      console.log('Error sharing invite link:', error);
    }
  };

  // 2. Send via SMS
  const handleSendSms = () => {
    const finalUrl = invitation?.url || '';
    const shareMessage = finalUrl
      ? `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}, or tap ${finalUrl}`
      : `${inviterName} invited you to join ${familyName} on HosynQ. Open the app and enter Family ID ${familyId}`;

    Linking.openURL(`sms:?body=${encodeURIComponent(shareMessage)}`).catch(
      (err) => {
        console.log('Error opening SMS application:', err);
      }
    );
    onSendSms?.();
  };

  // 3. Copy message to clipboard
  const handleCopyMessage = () => {
    setCopiedFeedback(true);
    onCopyMessage?.();
    setTimeout(() => {
      setCopiedFeedback(false);
    }, 2000);
  };

  // 4. Open QR Code modal
  const handleShowQrCode = async () => {
    if (!invitation?.url && !inviteLoading) {
      try {
        await dispatch(createInvitationThunk()).unwrap();
      } catch (error) {
        console.warn('Failed to get invite link for QR Code:', error);
      }
    }
    setIsQrModalVisible(true);
    onShowQrCode?.();
  };

  return (
    <>
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
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewLabel}>MESSAGE THEY'LL GET</Text>
                {inviteLoading && (
                  <ActivityIndicator size="small" color={Colors.primary} />
                )}
              </View>
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

      {/* QR Code Presentation Modal */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <Pressable
          style={styles.qrModalOverlay}
          onPress={() => setIsQrModalVisible(false)}
        >
          <Pressable
            style={styles.qrModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header Close button */}
            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.qrTitle}>Scan to Join Family</Text>
            <Text style={styles.qrSubtitle}>
              Scan this QR code with any phone to join {familyName}
            </Text>

            {/* QR Code Wrapper */}
            <View style={styles.qrWrapper}>
              {inviteLoading && !inviteUrl ? (
                <View style={styles.qrLoadingBox}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.qrLoadingText}>Generating QR Code...</Text>
                </View>
              ) : (
                <QRCodeView
                  value={inviteUrl || `http://192.168.1.8:5000/invite/${familyId}`}
                  size={200}
                  padding={12}
                />
              )}
            </View>

            {/* Family ID Box */}
            <View style={styles.qrFamilyIdBadge}>
              <Text style={styles.qrFamilyIdLabel}>FAMILY ID</Text>
              <Text style={styles.qrFamilyIdText}>{familyId}</Text>
            </View>

            <Text style={styles.qrHintText}>
              Point any camera to scan and open the invitation link.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
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

  // QR Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F2238',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  qrCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  qrTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  qrSubtitle: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    marginBottom: 18,
  },
  qrLoadingBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLoadingText: {
    marginTop: 12,
    color: '#0F2238',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  qrFamilyIdBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qrFamilyIdLabel: {
    color: Colors.textSecondary,
    fontSize: RFValue(10),
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  qrFamilyIdText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  qrHintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: RFValue(11),
    textAlign: 'center',
  },
});
