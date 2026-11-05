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

export const AVATAR_COLORS = [
  '#4E2F1D', // Brown
  '#233E67', // Slate Blue
  '#4E1E34', // Plum / Maroon
  '#55441A', // Olive / Mustard
  '#1D4325', // Forest Green
  '#392654', // Indigo / Purple
  '#14443A', // Teal
  '#562B21', // Brick Red
];

export type AvatarSelection =
  | { type: 'image'; uri: string }
  | { type: 'color'; color: string; initial: string };

export interface ChooseAvatarBottomSheetProps {
  visible: boolean;
  fullName?: string;
  currentAvatar?: AvatarSelection | null;
  onClose: () => void;
  onSaveAvatar: (avatar: AvatarSelection) => void;
}

const ChooseAvatarBottomSheet: React.FC<ChooseAvatarBottomSheetProps> = ({
  visible,
  fullName = '',
  currentAvatar,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(
    currentAvatar || null
  );

  const trimmedName = fullName.trim();
  const hasName = trimmedName.length > 0;
  const initialLetter = hasName ? trimmedName.charAt(0).toUpperCase() : '';

  useEffect(() => {
    if (visible) {
      if (currentAvatar) {
        setSelectedAvatar(currentAvatar);
      } else if (hasName) {
        // Default to first color circle if no avatar selected
        setSelectedAvatar({
          type: 'color',
          color: AVATAR_COLORS[0],
          initial: initialLetter,
        });
      } else {
        setSelectedAvatar(null);
      }
    }
  }, [visible, currentAvatar, hasName, initialLetter]);

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
        setSelectedAvatar({ type: 'image', uri: image.path });
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
        setSelectedAvatar({ type: 'image', uri: image.path });
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery picker error:', error);
      }
    }
  };

  // Handle Color Circle Selection
  const handleSelectColor = (color: string) => {
    if (hasName) {
      setSelectedAvatar({
        type: 'color',
        color,
        initial: initialLetter,
      });
    }
  };

  // Save selected avatar
  const handleSave = () => {
    if (selectedAvatar) {
      onSaveAvatar(selectedAvatar);
    }
    onClose();
  };

  const row1Colors = AVATAR_COLORS.slice(0, 5);
  const row2Colors = AVATAR_COLORS.slice(5, 8);

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

          {/* Color Initial Circles or Name Prompt */}
          {hasName ? (
            <View style={styles.colorsPaletteContainer}>
              {/* Row 1: 5 Circles */}
              <View style={styles.colorRow}>
                {row1Colors.map((color) => {
                  const isSelected =
                    selectedAvatar?.type === 'color' && selectedAvatar.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      activeOpacity={0.8}
                      onPress={() => handleSelectColor(color)}
                      style={[
                        styles.colorCircleWrapper,
                        isSelected && styles.selectedColorRing,
                      ]}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color }]}>
                        <Text style={styles.initialText}>{initialLetter}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Row 2: 3 Circles */}
              <View style={[styles.colorRow, styles.colorRowMargin]}>
                {row2Colors.map((color) => {
                  const isSelected =
                    selectedAvatar?.type === 'color' && selectedAvatar.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      activeOpacity={0.8}
                      onPress={() => handleSelectColor(color)}
                      style={[
                        styles.colorCircleWrapper,
                        isSelected && styles.selectedColorRing,
                      ]}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color }]}>
                        <Text style={styles.initialText}>{initialLetter}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.noNameNoticeContainer}>
              <Feather name="info" size={18} color={Colors.primary} style={styles.infoIcon} />
              <Text style={styles.noNameNoticeTitle}>Full name required for initial avatar</Text>
              <Text style={styles.noNameNoticeSub}>
                Please enter your name on the profile screen first to generate personalized initial avatars.
              </Text>
            </View>
          )}

          {/* Save Avatar Button */}
          <CommonBtn
            title="Save avatar"
            onPress={handleSave}
            disabled={!selectedAvatar}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
            fontSize={RFValue(14.5)}
            marginTop={hasName ? 26 : 18}
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
    backgroundColor: '#101E31',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#1C2F46',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#273C54',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#1F3249',
    backgroundColor: '#13233A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: RFValue(13),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A2E44',
  },
  dividerText: {
    fontSize: RFValue(10.5),
    color: '#607287',
    fontWeight: '600',
    letterSpacing: 1.2,
    marginHorizontal: 12,
  },
  colorsPaletteContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  colorRowMargin: {
    marginTop: 12,
  },
  colorCircleWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  selectedColorRing: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  colorCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  noNameNoticeContainer: {
    backgroundColor: '#0D1A2A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#182C42',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 4,
  },
  infoIcon: {
    marginBottom: 6,
  },
  noNameNoticeTitle: {
    fontSize: RFValue(12.5),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  noNameNoticeSub: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(16),
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelText: {
    color: '#8E9AA8',
    fontSize: RFValue(13.5),
    fontWeight: '500',
  },
});
