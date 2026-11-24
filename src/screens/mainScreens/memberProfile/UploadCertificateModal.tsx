import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface UploadCertificateModalProps {
  visible?: boolean;
  vaccineName?: string;
  vaccineDate?: string;
  fileName?: string;
  onClose: () => void;
  onSaveCertificate: (certData: any) => void;
}

export const UploadCertificateModal: React.FC<UploadCertificateModalProps> = ({
  visible = true,
  vaccineName = 'Typhoid booster',
  vaccineDate = '12 Sep 2026',
  fileName: customFileName,
  onClose,
  onSaveCertificate,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'scan' | 'photo' | 'pdf'>('pdf');
  const [saveToVault, setSaveToVault] = useState(true);

  const fileName =
    customFileName ||
    (vaccineName.toLowerCase().includes('typhoid')
      ? 'Typhoid_certificate.pdf'
      : `${vaccineName.replace(/\s+/g, '_')}_certificate.pdf`);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 20) + 16 },
              ]}
            >
              {/* Grab Handle */}
              <View style={styles.grabHandle} />

              {/* Title & Subtitle */}
              <Text style={styles.sheetTitle}>Add a certificate</Text>
              <Text style={styles.sheetSubtitle}>
                {`For ${vaccineName} · ${vaccineDate}`}
              </Text>

              {/* Upload Methods (Scan, Photo, PDF) */}
              <View style={styles.methodsRow}>
                {/* Scan */}
                <TouchableOpacity
                  style={[
                    styles.methodBox,
                    selectedMethod === 'scan' && styles.methodBoxActive,
                  ]}
                  onPress={() => setSelectedMethod('scan')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Scan certificate"
                >
                  <Feather name="camera" size={22} color="#F0923A" />
                  <Text style={styles.methodLabel}>Scan</Text>
                </TouchableOpacity>

                {/* Photo */}
                <TouchableOpacity
                  style={[
                    styles.methodBox,
                    selectedMethod === 'photo' && styles.methodBoxActive,
                  ]}
                  onPress={() => setSelectedMethod('photo')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Upload photo"
                >
                  <Feather name="image" size={22} color="#F0923A" />
                  <Text style={styles.methodLabel}>Photo</Text>
                </TouchableOpacity>

                {/* PDF */}
                <TouchableOpacity
                  style={[
                    styles.methodBox,
                    selectedMethod === 'pdf' && styles.methodBoxActive,
                  ]}
                  onPress={() => setSelectedMethod('pdf')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Upload PDF"
                >
                  <Feather name="file-text" size={22} color="#F0923A" />
                  <Text style={styles.methodLabel}>PDF</Text>
                </TouchableOpacity>
              </View>

              {/* Uploaded File Preview Card */}
              <View style={styles.uploadedCard}>
                <Feather
                  name="file-text"
                  size={22}
                  color="#4CC38A"
                  style={styles.uploadedIcon}
                />
                <View style={styles.uploadedInfo}>
                  <Text style={styles.uploadedFileName}>{fileName}</Text>
                  <Text style={styles.uploadedFileSize}>1.2 MB · Uploaded</Text>
                </View>
                <Feather name="check-circle" size={20} color="#4CC38A" />
              </View>

              {/* Toggle: Also save in Family Vault */}
              <View style={styles.vaultCard}>
                <View style={styles.vaultTextContainer}>
                  <Text style={styles.vaultTitle}>Also save in Family Vault</Text>
                  <Text style={styles.vaultSubtitle}>Vault › Health</Text>
                </View>
                <Switch
                  value={saveToVault}
                  onValueChange={setSaveToVault}
                  trackColor={{ false: '#26354B', true: '#F0923A' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#26354B"
                />
              </View>

              {/* Save Certificate Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  onSaveCertificate({
                    method: selectedMethod,
                    fileName,
                    saveToVault,
                  });
                  onClose();
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Save certificate"
              >
                <Text style={styles.saveButtonText}>Save certificate</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#394658',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 14.5,
    color: '#8A97AB',
    marginTop: 6,
    marginBottom: 20,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodBox: {
    flex: 1,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#12253E',
    borderWidth: 1,
    borderColor: '#1E314D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBoxActive: {
    borderColor: '#F0923A',
    borderWidth: 2,
    backgroundColor: '#12253E',
  },
  methodLabel: {
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  uploadedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 195, 138, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3D7C60',
    padding: 16,
    marginBottom: 16,
  },
  uploadedIcon: {
    marginRight: 12,
  },
  uploadedInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  uploadedFileSize: {
    fontSize: 13,
    color: '#8A97AB',
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 22,
  },
  vaultTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  vaultTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  vaultSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 3,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default UploadCertificateModal;
