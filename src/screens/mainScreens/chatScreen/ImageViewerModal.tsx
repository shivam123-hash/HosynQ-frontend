import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  senderName?: string;
  timestamp?: string;
  caption?: string;
  onSaveToVault?: () => void;
  onReply?: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  onClose,
  senderName = 'Dadi',
  timestamp = 'Today, 1:15 PM',
  caption = 'Diyas for tonight. Anaya, help me light them at 7?',
  onSaveToVault,
  onReply,
}) => {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${senderName}: ${caption}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleSaveToPhone = () => {
    Alert.alert('Saved', 'Photo saved to your device camera roll.');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.senderNameText}>{senderName}</Text>
            <Text style={styles.timestampText}>{timestamp}</Text>
          </View>

          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Center Image / Illustration Preview */}
        <View style={styles.imageStage}>
          <View style={styles.diyasStage}>
            {/* 5 Warm Diya lamps */}
            {[0, 1, 2, 3, 4].map((idx) => (
              <View key={`diya-${idx}`} style={styles.diyaContainer}>
                <View style={styles.diyaFlameGlow} />
                <View style={styles.diyaBowl} />
              </View>
            ))}
          </View>
        </View>

        {/* Caption & Carousel Dots & Bottom Action Buttons */}
        <View
          style={[
            styles.bottomControls,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          {/* Caption */}
          <Text style={styles.captionText}>{caption}</Text>

          {/* Dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* 4 Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Save to Vault */}
            <TouchableOpacity
              style={styles.actionBtnItem}
              onPress={onSaveToVault || (() => Alert.alert('Saved to Vault'))}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Feather name="folder" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionBtnLabel}>Save to Vault</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={styles.actionBtnItem}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Feather name="share" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionBtnLabel}>Share</Text>
            </TouchableOpacity>

            {/* Reply */}
            <TouchableOpacity
              style={styles.actionBtnItem}
              onPress={onReply || onClose}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Feather name="corner-up-left" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionBtnLabel}>Reply</Text>
            </TouchableOpacity>

            {/* Save to phone */}
            <TouchableOpacity
              style={styles.actionBtnItem}
              onPress={handleSaveToPhone}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Feather name="download" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionBtnLabel}>Save to phone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  senderNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  timestampText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  imageStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  diyasStage: {
    width: '100%',
    height: 320,
    backgroundColor: '#28170D',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  diyaContainer: {
    alignItems: 'center',
  },
  diyaFlameGlow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE2B8',
    opacity: 0.9,
    shadowColor: '#FFB04A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    marginBottom: 6,
  },
  diyaBowl: {
    width: 38,
    height: 14,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#7A3F1D',
  },
  bottomControls: {
    paddingHorizontal: 24,
  },
  captionText: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: Colors.white,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtnItem: {
    alignItems: 'center',
    width: 74,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionBtnLabel: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ImageViewerModal;
