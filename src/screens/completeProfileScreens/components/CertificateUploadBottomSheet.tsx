import React from 'react';
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

export interface CertificateUploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  title?: string;
  subtitle?: string;
}

const CertificateUploadBottomSheet: React.FC<CertificateUploadBottomSheetProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Upload Certificate',
  subtitle = 'Take a photo or choose from your gallery',
}) => {
  const handleTakePhoto = async () => {
    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
      });
      if (image?.path) {
        onImageSelected(image.path);
        onClose();
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
      }
    }
  };

  const handleFromGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
      });
      if (image?.path) {
        onImageSelected(image.path);
        onClose();
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery picker error:', error);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Top Drag Handle */}
          <View style={styles.handleBar} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* 2 Options: Take photo & From gallery */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleTakePhoto}
              style={styles.actionButton}
            >
              <View style={styles.iconCircle}>
                <Feather name="camera" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleFromGallery}
              style={styles.actionButton}
            >
              <View style={styles.iconCircle}>
                <Feather name="image" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>From gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
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

export default CertificateUploadBottomSheet;

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
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: '#1F3249',
    backgroundColor: '#13233A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: RFValue(13.5),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  cancelText: {
    color: '#8E9AA8',
    fontSize: RFValue(13.5),
    fontWeight: '500',
  },
});

