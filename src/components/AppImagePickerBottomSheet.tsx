import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import ImagePicker from 'react-native-image-crop-picker';
import Colors from '../units/Colors';

export interface SelectedImage {
  path: string;
  mime?: string;
  fileName?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface AppImagePickerBottomSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  cropping?: boolean;
  cropperCircleOverlay?: boolean;
  width?: number;
  height?: number;
  cameraButtonText?: string;
  galleryButtonText?: string;
  onSelectImage: (image: SelectedImage) => void;
  onClose: () => void;
}

/**
 * AppImagePickerBottomSheet
 * Reusable modal bottom sheet for choosing photos from Camera or Gallery.
 * Can be used anywhere across the app for certificates, documents, avatars, milestones, etc.
 */
const AppImagePickerBottomSheet: React.FC<AppImagePickerBottomSheetProps> = ({
  visible,
  title = 'Upload Certificate',
  subtitle = 'Take a photo or choose an image from your gallery',
  cropping = false,
  cropperCircleOverlay = false,
  width = 1200,
  height = 1600,
  cameraButtonText = 'Take photo',
  galleryButtonText = 'Choose from gallery',
  onSelectImage,
  onClose,
}) => {
  const handleTakePhoto = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width,
        height,
        cropping,
        cropperCircleOverlay,
        mediaType: 'photo',
        compressImageQuality: 0.85,
      });

      if (image?.path) {
        const extension = image.mime?.split('/')[1] || 'jpg';
        const fileName =
          image.filename || `Photo_${Date.now()}.${extension}`;

        onSelectImage({
          path: image.path,
          mime: image.mime || 'image/jpeg',
          fileName,
          size: image.size,
          width: image.width,
          height: image.height,
        });
        onClose();
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('[AppImagePicker] Camera error:', error);
        const isPermission =
          String(error?.message || '').toLowerCase().includes('permission') ||
          error?.code === 'E_NO_CAMERA_PERMISSION';
        if (isPermission) {
          Alert.alert(
            'Camera Permission Required',
            'HosynQ needs access to your Camera. Please allow camera access in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          Alert.alert(
            'Camera Notice',
            error?.message || 'Could not open camera. Please check permissions.',
          );
        }
      }
    }
  };

  const handleFromGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width,
        height,
        cropping,
        cropperCircleOverlay,
        mediaType: 'photo',
        compressImageQuality: 0.85,
      });

      if (image?.path) {
        const extension = image.mime?.split('/')[1] || 'jpg';
        const fileName =
          image.filename || `Image_${Date.now()}.${extension}`;

        onSelectImage({
          path: image.path,
          mime: image.mime || 'image/jpeg',
          fileName,
          size: image.size,
          width: image.width,
          height: image.height,
        });
        onClose();
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('[AppImagePicker] Gallery error:', error);
        const isPermission =
          String(error?.message || '').toLowerCase().includes('permission') ||
          error?.code === 'E_NO_LIBRARY_PERMISSION';
        if (isPermission) {
          Alert.alert(
            'Photo Library Permission Required',
            'HosynQ needs access to your Photos. Please allow photo access in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          Alert.alert(
            'Gallery Notice',
            error?.message || 'Could not open gallery. Please check permissions.',
          );
        }
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {/* Action Cards Row */}
          <View style={styles.optionsContainer}>
            {/* Camera Option */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleTakePhoto}
              style={styles.optionCard}
              accessibilityRole="button"
              accessibilityLabel={cameraButtonText}
            >
              <View style={styles.optionIconBox}>
                <Feather
                  name="camera"
                  size={22}
                  color={Colors.primary || '#F0913A'}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{cameraButtonText}</Text>
                <Text style={styles.optionSubText}>
                  Use your device camera
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Gallery Option */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFromGallery}
              style={styles.optionCard}
              accessibilityRole="button"
              accessibilityLabel={galleryButtonText}
            >
              <View style={styles.optionIconBox}>
                <Feather
                  name="image"
                  size={22}
                  color={Colors.primary || '#F0913A'}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{galleryButtonText}</Text>
                <Text style={styles.optionSubText}>
                  Select from photos library
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.cancelBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel picker"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AppImagePickerBottomSheet;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F1D30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: '#8E9BAE',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132338',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1E3552',
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 2,
  },
  optionSubText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1728',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#182B42',
  },
  cancelBtnText: {
    color: '#8E9BAE',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
});

