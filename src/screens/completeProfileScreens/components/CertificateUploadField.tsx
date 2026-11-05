import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CertificateUploadBottomSheet from './CertificateUploadBottomSheet';

export interface CertificateUploadFieldProps {
  label?: string;
  placeholder?: string;
  imageUri?: string | null;
  onImageChange: (uri: string) => void;
}

const CertificateUploadField: React.FC<CertificateUploadFieldProps> = ({
  label = 'Certificate upload',
  placeholder = 'Certificate upload',
  imageUri,
  onImageChange,
}) => {
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const handleOpenSheet = () => {
    setIsSheetVisible(true);
  };

  const handleRemoveImage = () => {
    onImageChange('');
  };

  const hasImage = Boolean(imageUri && imageUri.trim().length > 0);

  return (
    <View style={styles.container}>
      {/* Upload Input Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleOpenSheet}
        style={[
          styles.inputContainer,
          hasImage ? styles.activeBorder : styles.inactiveBorder,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.inputText,
            hasImage ? styles.inputTextFilled : styles.inputTextPlaceholder,
          ]}
        >
          {hasImage ? 'Certificate attached' : placeholder || label}
        </Text>

        <View style={styles.uploadIconWrapper}>
          <Feather
            name={hasImage ? 'check-circle' : 'upload'}
            size={18}
            color={hasImage ? Colors.primary : '#8E9AA8'}
          />
        </View>
      </TouchableOpacity>

      {/* UI-Friendly Image Preview Card right below the input */}
      {hasImage && imageUri ? (
        <View style={styles.previewCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenSheet}
            style={styles.previewContentRow}
          >
            {/* Thumbnail */}
            <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />

            {/* Document Info */}
            <View style={styles.infoColumn}>
              <Text style={styles.fileNameText} numberOfLines={1}>
                Certificate Document
              </Text>
              <Text style={styles.fileSubText}>
                Tap to change certificate
              </Text>
            </View>
          </TouchableOpacity>

          {/* Remove Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRemoveImage}
            style={styles.removeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Camera / Gallery Picker Bottom Sheet */}
      <CertificateUploadBottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onImageSelected={(uri) => {
          onImageChange(uri);
        }}
      />
    </View>
  );
};

export default CertificateUploadField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  inputContainer: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13233A',
  },
  inactiveBorder: {
    borderColor: '#1F3249',
  },
  activeBorder: {
    borderColor: Colors.primary,
  },
  inputText: {
    fontSize: RFValue(13.5),
    flex: 1,
  },
  inputTextPlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  inputTextFilled: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  uploadIconWrapper: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    marginTop: 10,
    backgroundColor: '#101E31',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C2F46',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewContentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1A2E44',
  },
  infoColumn: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileNameText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileSubText: {
    fontSize: RFValue(11),
    color: Colors.textSecondary,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#241B26',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
