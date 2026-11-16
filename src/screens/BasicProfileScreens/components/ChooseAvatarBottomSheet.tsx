import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import ImagePicker from 'react-native-image-crop-picker';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface AvatarColorOption {
  key: string;
  hex: string;
  name: string;
}

export const AVATAR_COLOR_OPTIONS: AvatarColorOption[] = [
  { key: 'amber', hex: '#4E2F1D', name: 'Amber' },
  { key: 'blue', hex: '#233E67', name: 'Blue' },
  { key: 'rose', hex: '#4E1E34', name: 'Rose' },
  { key: 'olive', hex: '#55441A', name: 'Olive' },
  { key: 'green', hex: '#1D4325', name: 'Green' },
  { key: 'purple', hex: '#392654', name: 'Purple' },
  { key: 'teal', hex: '#14443A', name: 'Teal' },
  { key: 'brick', hex: '#562B21', name: 'Brick' },
];

export const AVATAR_COLORS = AVATAR_COLOR_OPTIONS.map((item) => item.hex);

export type AvatarSelection =
  | { type: 'image'; uri: string; mime?: string; fileName?: string }
  | { type: 'color'; color: string; colorKey: string; initial: string };

export interface ChooseAvatarBottomSheetProps {
  visible: boolean;
  fullName?: string;
  currentAvatar?: AvatarSelection | null;
  loading?: boolean;
  onClose: () => void;
  onSaveAvatar: (avatar: AvatarSelection) => void | Promise<void>;
}

const ChooseAvatarBottomSheet: React.FC<ChooseAvatarBottomSheetProps> = ({
  visible,
  fullName = '',
  currentAvatar,
  loading = false,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(
    currentAvatar || null
  );

  const trimmedName = fullName.trim();
  const hasName = trimmedName.length > 0;
  const initialLetter = hasName ? trimmedName.charAt(0).toUpperCase() : 'R';

  useEffect(() => {
    if (visible) {
      if (currentAvatar) {
        setSelectedAvatar(currentAvatar);
      } else {
        const defaultOption = AVATAR_COLOR_OPTIONS[0];
        setSelectedAvatar({
          type: 'color',
          color: defaultOption.hex,
          colorKey: defaultOption.key,
          initial: initialLetter,
        });
      }
    }
  }, [visible, currentAvatar, initialLetter]);

  // Handle Photo from Camera
  const handleTakePhoto = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });
      if (image?.path) {
        setSelectedAvatar({
          type: 'image',
          uri: image.path,
          mime: image.mime || 'image/jpeg',
          fileName: 'avatar.jpg',
        });
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
      }
    }
  };

  // Handle Photo from Gallery
  const handleFromGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });
      if (image?.path) {
        setSelectedAvatar({
          type: 'image',
          uri: image.path,
          mime: image.mime || 'image/jpeg',
          fileName: 'avatar.jpg',
        });
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery picker error:', error);
      }
    }
  };

  // Handle Color Circle Selection
  const handleSelectColor = (option: AvatarColorOption) => {
    setSelectedAvatar({
      type: 'color',
      color: option.hex,
      colorKey: option.key,
      initial: initialLetter,
    });
  };

  // Save selected avatar
  const handleSave = async () => {
    if (selectedAvatar) {
      await onSaveAvatar(selectedAvatar);
    }
  };

  const row1Options = AVATAR_COLOR_OPTIONS.slice(0, 5);
  const row2Options = AVATAR_COLOR_OPTIONS.slice(5, 8);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        {/* Bottom Sheet Card */}
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>Choose an avatar</Text>
          <Text style={styles.subtitle}>
            Use a photo, or keep your initial on a colour.
          </Text>

          {/* Take photo & From gallery Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleTakePhoto}
              style={styles.actionButton}
            >
              <Feather name="camera" size={18} color={Colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionButtonText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFromGallery}
              style={styles.actionButton}
            >
              <Feather name="image" size={18} color={Colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionButtonText}>From gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR PICK A COLOUR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Color Initial Circles */}
          <View style={styles.colorsPaletteContainer}>
            {/* Row 1: 5 Circles */}
            <View style={styles.colorRow}>
              {row1Options.map((opt) => {
                const isSelected =
                  selectedAvatar?.type === 'color' && selectedAvatar.colorKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelectColor(opt)}
                    style={[
                      styles.colorCircleWrapper,
                      isSelected && styles.selectedColorRing,
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: opt.hex }]}>
                      <Text style={styles.initialText}>{initialLetter}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Row 2: 3 Circles */}
            <View style={[styles.colorRow, styles.colorRowMargin]}>
              {row2Options.map((opt) => {
                const isSelected =
                  selectedAvatar?.type === 'color' && selectedAvatar.colorKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelectColor(opt)}
                    style={[
                      styles.colorCircleWrapper,
                      isSelected && styles.selectedColorRing,
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: opt.hex }]}>
                      <Text style={styles.initialText}>{initialLetter}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Avatar Button */}
          <CommonBtn
            title="Save avatar"
            onPress={handleSave}
            disabled={!selectedAvatar || loading}
            loading={loading}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
            fontSize={RFValue(14.5)}
            marginTop={26}
          />

          {/* Cancel Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ChooseAvatarBottomSheet;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0D1B2A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: '#193049',
  },
  handleBar: {
    width: 44,
    height: 4,
    backgroundColor: '#354D69',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(19),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(17),
    marginBottom: 22,
    paddingHorizontal: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#132338',
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1D3552',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#192E47',
  },
  dividerText: {
    color: '#657B96',
    fontSize: RFValue(10.5),
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  colorsPaletteContainer: {
    alignItems: 'center',
    width: '100%',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  colorRowMargin: {
    marginTop: 14,
  },
  colorCircleWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  selectedColorRing: {
    borderColor: Colors.primary,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  cancelButton: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    fontWeight: '500',
  },
});
