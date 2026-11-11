import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface UploadDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (fileName: string) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  visible,
  onClose,
  onFileSelected,
}) => {
  const insets = useSafeAreaInsets();

  const mockFiles = [
    { id: '1', name: "St. Mary's School circular.pdf", size: '1.2 MB' },
    { id: '2', name: 'Electricity_bill_Oct.pdf', size: '480 KB' },
    { id: '3', name: 'Doctor_prescription.jpg', size: '2.4 MB' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              <View style={styles.dragHandle} />

              <Text style={styles.systemKicker}>
                SYSTEM SHEET · SHOWN BY THE PHONE
              </Text>
              <Text style={styles.title}>Photos or Files</Text>
              <Text style={styles.subtitle}>
                The phone shows its own picker. HosynQ accepts PDF, JPG and JPEG
                files up to 25 MB.
              </Text>

              {/* Picker Area */}
              <View style={styles.pickerBox}>
                <Text style={styles.pickerHint}>
                  Tap any file below to test upload:
                </Text>
                <View style={styles.fileList}>
                  {mockFiles.map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      onPress={() => {
                        onFileSelected(file.name);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      style={styles.fileCard}
                    >
                      <View style={styles.fileIconCircle}>
                        <Feather name="file-text" size={18} color="#F0913A" />
                      </View>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName}>{file.name}</Text>
                        <Text style={styles.fileSize}>{file.size}</Text>
                      </View>
                      <Feather name="chevron-right" size={16} color="#7D8B9B" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#1C2B3D',
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334457',
    alignSelf: 'center',
    marginBottom: 16,
  },
  systemKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9BAE',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E9BAE',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  pickerBox: {
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
    padding: 16,
    marginBottom: 16,
  },
  pickerHint: {
    fontSize: 12,
    color: '#7D8B9B',
    marginBottom: 12,
  },
  fileList: {
    gap: 10,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152538',
    borderRadius: 12,
    padding: 12,
  },
  fileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#7D8B9B',
  },
  cancelBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#152538',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
