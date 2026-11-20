import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import ImagePicker from 'react-native-image-crop-picker';
import {
  CommonBtn,
  SelectedImage,
  ThreeDotsLoader,
  formatDate,
  AppConfirmationModal,
} from '../../../components';
import { useAppDispatch, useAppSelector, scanDocumentThunk } from '../../../redux';
import { getMyMemberId } from '../../../units/asyncStorageManager';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const formatIsoToDisplayDate = (
  dateVal?: string | Date | null
): string => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // 1. Already in "DD MMM YYYY" (e.g. "22 Aug 2017")
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    // 2. YYYY-MM-DD or YYYY/MM/DD (e.g. "2017-08-22")
    const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const monthIdx = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
      }
    }
    // 3. DD-MM-YYYY or DD/MM/YYYY (e.g. "22/08/2017" or "22-08-2017")
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const monthIdx = parseInt(dmyMatch[2], 10) - 1;
      const year = dmyMatch[3];
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
      }
    }
    // 4. Fallback to Date object parsing
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = MONTH_NAMES[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return trimmed;
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const day = dateVal.getDate();
    const month = MONTH_NAMES[dateVal.getMonth()];
    const year = dateVal.getFullYear();
    return `${day} ${month} ${year}`;
  }
  return '';
};

export interface DocumentScanResult {
  scanId?: string;
  type?: string;
  number?: string;
  nameOnDocument?: string;
  issuedOn?: string;
  expiresOn?: string;
  dateOfBirth?: string;
  country?: string;
  visaType?: string;
  visaEntries?: string;
  vehicleClasses?: string[];
  insurer?: string;
  planName?: string;
  sumInsured?: number;
  annualPremium?: number;
  [key: string]: any;
}

export interface DocumentPhotoUploadFieldProps {
  documentType:
    | 'PASSPORT'
    | 'VISA'
    | 'DRIVING_LICENCE'
    | 'AADHAAR'
    | 'PAN'
    | 'INSURANCE'
    | 'OTHER';
  documentTitle: string;
  memberId?: string;
  scanId?: string;
  hasFrontImage?: boolean;
  hasBackImage?: boolean;
  onScanSuccess: (extractedData: DocumentScanResult, scanId: string) => void;
  onPhotosChange?: (
    front: SelectedImage | null,
    back: SelectedImage | null
  ) => void;
}

const DocumentPhotoUploadField: React.FC<DocumentPhotoUploadFieldProps> = ({
  documentType,
  documentTitle,
  memberId,
  scanId,
  hasFrontImage = false,
  hasBackImage = false,
  onScanSuccess,
  onPhotosChange,
}) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(
    (state) => state.auth?.user || state.emailAuth?.user
  );
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [frontImage, setFrontImage] = useState<SelectedImage | null>(null);
  const [backImage, setBackImage] = useState<SelectedImage | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Picker modal state
  const [pickerTarget, setPickerTarget] = useState<'front' | 'back' | null>(
    null
  );
  const [permissionModal, setPermissionModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const isUploaded = Boolean(scanId || frontImage || hasFrontImage);

  const handleOpenPicker = (target: 'front' | 'back') => {
    setPickerTarget(target);
  };

  const handleSelectImage = (img: SelectedImage, target?: 'front' | 'back') => {
    const effectiveTarget = target || pickerTarget;
    if (effectiveTarget === 'front') {
      setFrontImage(img);
      if (onPhotosChange) onPhotosChange(img, backImage);
    } else if (effectiveTarget === 'back') {
      setBackImage(img);
      if (onPhotosChange) onPhotosChange(frontImage, img);
    }
    setPickerTarget(null);
  };

  const pickFromCamera = async (target: 'front' | 'back') => {
    try {
      const image = await ImagePicker.openCamera({
        width: 1200,
        height: 1600,
        cropping: false,
        mediaType: 'photo',
        compressImageQuality: 0.85,
      });

      if (image?.path) {
        const extension = image.mime?.split('/')[1] || 'jpg';
        const fileName =
          image.filename || `${target}_${Date.now()}.${extension}`;

        const selected: SelectedImage = {
          path: image.path,
          mime: image.mime || 'image/jpeg',
          fileName,
          size: image.size,
          width: image.width,
          height: image.height,
        };

        handleSelectImage(selected, target);
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('[DocumentPhotoUpload] Camera error:', error);
        const isPermissionError =
          String(error?.message || '').toLowerCase().includes('permission') ||
          error?.code === 'E_NO_CAMERA_PERMISSION';
        if (isPermissionError) {
          setPermissionModal({
            visible: true,
            title: 'Camera Permission Required',
            message:
              'HosynQ needs access to your Camera to capture document photos. Please enable camera access in Settings.',
          });
        } else {
          Alert.alert(
            'Camera Notice',
            error?.message || 'Could not open camera. Please check permissions.',
          );
        }
      }
    }
  };

  const pickFromGallery = async (target: 'front' | 'back') => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1200,
        height: 1600,
        cropping: false,
        mediaType: 'photo',
        compressImageQuality: 0.85,
      });

      if (image?.path) {
        const extension = image.mime?.split('/')[1] || 'jpg';
        const fileName =
          image.filename || `${target}_${Date.now()}.${extension}`;

        const selected: SelectedImage = {
          path: image.path,
          mime: image.mime || 'image/jpeg',
          fileName,
          size: image.size,
          width: image.width,
          height: image.height,
        };

        handleSelectImage(selected, target);
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('[DocumentPhotoUpload] Gallery error:', error);
        const isPermissionError =
          String(error?.message || '').toLowerCase().includes('permission') ||
          error?.code === 'E_NO_LIBRARY_PERMISSION';
        if (isPermissionError) {
          setPermissionModal({
            visible: true,
            title: 'Photo Library Permission Required',
            message:
              'HosynQ needs access to your Photos to select and upload document photos. Please enable photo access in Settings.',
          });
        } else {
          Alert.alert(
            'Gallery Notice',
            error?.message || 'Could not open photo gallery. Please check permissions.',
          );
        }
      }
    }
  };

  const handleScanAndSave = async () => {
    if (!frontImage && !hasFrontImage) {
      Alert.alert(
        'Front Photo Required',
        'Please upload or take a photo of the front page of your document to scan and extract details.'
      );
      return;
    }

    setIsScanning(true);

    try {
      const storedMemberId = await getMyMemberId();
      const resolvedMemberId =
        memberId ||
        lifeProfileFull?.member?.memberId ||
        lifeProfileFull?.data?.member?.memberId ||
        (authUser as any)?.lifeProfile?.memberId ||
        familyState?.myMemberId ||
        familyState?.family?.myMemberId ||
        storedMemberId ||
        authUser?.memberId ||
        authUser?.id;

      if (!resolvedMemberId) {
        Alert.alert('Error', 'Member ID not found to scan document.');
        setIsScanning(false);
        return;
      }

      const formData = new FormData();

      if (frontImage) {
        formData.append('file', {
          uri: frontImage.path.startsWith('file://')
            ? frontImage.path
            : `file://${frontImage.path}`,
          name: frontImage.fileName || `front_${Date.now()}.jpg`,
          type: frontImage.mime || 'image/jpeg',
        } as any);
      }

      if (backImage) {
        formData.append('backFile', {
          uri: backImage.path.startsWith('file://')
            ? backImage.path
            : `file://${backImage.path}`,
          name: backImage.fileName || `back_${Date.now()}.jpg`,
          type: backImage.mime || 'image/jpeg',
        } as any);
      }

      formData.append('type', documentType);
      // skipRead='false' instructs backend OCR engine to read and extract document field values
      formData.append('skipRead', 'false');

      console.log('====================================');
      console.log(`[DocumentUpload] Submitting POST /documents/scan for ${documentType}:`);
      console.log(`[DocumentUpload] MemberId: ${resolvedMemberId}`);
      console.log(`[DocumentUpload] HasFront: ${Boolean(frontImage)}, HasBack: ${Boolean(backImage)}`);
      console.log('====================================');

      const result = await dispatch(
        scanDocumentThunk({
          memberId: resolvedMemberId,
          formData,
        })
      ).unwrap();

      console.log('[DocumentUpload] Scan Response:', JSON.stringify(result, null, 2));

      const docData: DocumentScanResult =
        result?.document ||
        result?.data?.document ||
        result?.data ||
        result?.fields ||
        (result?.scanId || result?.nameOnDocument || result?.number ? result : {}) ||
        {};
      const newScanId =
        docData.scanId ||
        result?.scanId ||
        result?.data?.scanId ||
        result?.document?.scanId ||
        '';

      setIsScanning(false);
      setIsModalVisible(false);

      if (onScanSuccess) {
        onScanSuccess(docData, newScanId || '');
      }

      Alert.alert(
        'Scan Completed',
        'Document details extracted and pre-filled successfully!'
      );
    } catch (err: any) {
      console.log('[DocumentUpload] Scan Error:', err);
      setIsScanning(false);
      Alert.alert(
        'Upload / Scan Error',
        err?.message ||
          'Failed to scan document photo. You can fill fields manually or try another clearer photo.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>DOCUMENT PHOTO</Text>

      {/* Top Field Box (First field on document screen - Matches Image 2 & Image 8) */}
      {frontImage || hasFrontImage ? (
        <View style={styles.photoUploadRow}>
          {/* Front Added Card (Green Tinted & Bordered) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setPickerTarget('front');
              setIsModalVisible(true);
            }}
            style={[styles.uploadPhotoBox, styles.uploadPhotoBoxSuccess]}
          >
            <View style={styles.checkCircle}>
              <Feather name="check" size={14} color="#10B981" />
            </View>
            <Text style={styles.uploadPhotoTitle}>Front added</Text>
            <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
          </TouchableOpacity>

          {/* Back Page Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setPickerTarget('back');
              setIsModalVisible(true);
            }}
            style={[
              styles.uploadPhotoBox,
              backImage || hasBackImage
                ? styles.uploadPhotoBoxSuccess
                : styles.uploadPhotoBoxEmpty,
            ]}
          >
            {backImage || hasBackImage ? (
              <>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#10B981" />
                </View>
                <Text style={styles.uploadPhotoTitle}>Back added</Text>
                <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
              </>
            ) : (
              <>
                <Feather name="camera" size={20} color="#F0913A" />
                <Text style={styles.uploadPhotoTitle}>Add back page</Text>
                <Text style={styles.uploadPhotoSub}>Optional</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
          style={[styles.fieldBox, styles.fieldBoxDefault]}
        >
          <View style={styles.iconCircle}>
            <Feather name="camera" size={20} color="#F0913A" />
          </View>

          <View style={styles.fieldContent}>
            <Text style={styles.fieldTitle}>
              {`Upload ${documentTitle} photo`}
            </Text>
            <Text style={styles.fieldSubtitle}>
              Auto-fills document details · Tap to scan
            </Text>
          </View>

          <Feather name="chevron-right" size={18} color="#64748B" />
        </TouchableOpacity>
      )}

      {/* Upload BottomSheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isScanning) setIsModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => {
            if (!isScanning) setIsModalVisible(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />

            {pickerTarget ? (
              /* Photo Source Picker View (Camera vs Gallery) */
              <View>
                <Text style={styles.modalTitle}>
                  Upload {pickerTarget === 'front' ? 'Front' : 'Back'} of {documentTitle}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Take a clear photo with camera or choose from your gallery
                </Text>

                <View style={styles.pickerOptionsContainer}>
                  {/* Camera Option */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => pickFromCamera(pickerTarget)}
                    style={styles.pickerOptionCard}
                  >
                    <View style={styles.pickerOptionIconBox}>
                      <Feather name="camera" size={22} color="#F0913A" />
                    </View>
                    <View style={styles.pickerOptionTextContainer}>
                      <Text style={styles.pickerOptionTitle}>Take photo</Text>
                      <Text style={styles.pickerOptionSub}>
                        Use camera to photograph document
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#64748B" />
                  </TouchableOpacity>

                  {/* Gallery Option */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => pickFromGallery(pickerTarget)}
                    style={styles.pickerOptionCard}
                  >
                    <View
                      style={[
                        styles.pickerOptionIconBox,
                        { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
                      ]}
                    >
                      <Feather name="image" size={22} color="#38BDF8" />
                    </View>
                    <View style={styles.pickerOptionTextContainer}>
                      <Text style={styles.pickerOptionTitle}>Choose from gallery</Text>
                      <Text style={styles.pickerOptionSub}>
                        Select image from your photo album
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Back to Document Upload View */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPickerTarget(null)}
                  style={styles.cancelPickerBtn}
                >
                  <Text style={styles.cancelPickerText}>Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Document Front & Back Upload Overview View */
              <View>
                <Text style={styles.modalTitle}>
                  Upload {documentTitle} Photos
                </Text>
                <Text style={styles.modalSubtitle}>
                  Add clear photos of your {documentTitle.toLowerCase()}. Our OCR
                  will read the numbers and auto-fill your form.
                </Text>

                {/* Front and Back photo upload row */}
                <View style={styles.photoUploadRow}>
                  {/* Front Page Card */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenPicker('front')}
                    style={[
                      styles.uploadPhotoBox,
                      frontImage || hasFrontImage
                        ? styles.uploadPhotoBoxSuccess
                        : styles.uploadPhotoBoxEmpty,
                    ]}
                  >
                    {frontImage ? (
                      <>
                        <Image
                          source={{ uri: frontImage.path }}
                          style={styles.thumbnailPreview}
                          resizeMode="cover"
                        />
                        <Text style={styles.uploadPhotoTitle}>Front added</Text>
                        <Text style={styles.uploadPhotoSub}>Tap to change</Text>
                      </>
                    ) : hasFrontImage ? (
                      <>
                        <View style={styles.checkCircle}>
                          <Feather name="check" size={14} color="#10B981" />
                        </View>
                        <Text style={styles.uploadPhotoTitle}>Front added</Text>
                        <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
                      </>
                    ) : (
                      <>
                        <Feather name="camera" size={22} color="#F0913A" />
                        <Text style={styles.uploadPhotoTitle}>Add front page</Text>
                        <Text style={styles.uploadPhotoSub}>Required</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Back Page Card */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenPicker('back')}
                    style={[
                      styles.uploadPhotoBox,
                      backImage || hasBackImage
                        ? styles.uploadPhotoBoxSuccess
                        : styles.uploadPhotoBoxEmpty,
                    ]}
                  >
                    {backImage ? (
                      <>
                        <Image
                          source={{ uri: backImage.path }}
                          style={styles.thumbnailPreview}
                          resizeMode="cover"
                        />
                        <Text style={styles.uploadPhotoTitle}>Back added</Text>
                        <Text style={styles.uploadPhotoSub}>Tap to change</Text>
                      </>
                    ) : hasBackImage ? (
                      <>
                        <View style={styles.checkCircle}>
                          <Feather name="check" size={14} color="#10B981" />
                        </View>
                        <Text style={styles.uploadPhotoTitle}>Back added</Text>
                        <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
                      </>
                    ) : (
                      <>
                        <Feather name="camera" size={22} color="#F0913A" />
                        <Text style={styles.uploadPhotoTitle}>Add back page</Text>
                        <Text style={styles.uploadPhotoSub}>Optional</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Scan and Save Button */}
                {isScanning ? (
                  <View style={styles.scanningContainer}>
                    <ThreeDotsLoader color="#F0913A" size={6} spacing={4} />
                    <Text style={styles.scanningText}>
                      Scanning and extracting document details...
                    </Text>
                  </View>
                ) : (
                  <CommonBtn
                    title="Save & Scan Document"
                    onPress={handleScanAndSave}
                    backgroundColor={Colors.primary || '#F0913A'}
                    textColor="#FFFFFF"
                    height={50}
                    borderRadius={25}
                    marginTop={16}
                  />
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isScanning}
                  onPress={() => setIsModalVisible(false)}
                  style={styles.skipButton}
                >
                  <Text style={styles.skipText}>Close / Fill Manually</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <AppConfirmationModal
        visible={permissionModal.visible}
        title={permissionModal.title}
        message={permissionModal.message}
        confirmText="Open Settings"
        cancelText="Cancel"
        isDestructive={false}
        confirmColor="#F0913A"
        iconName="image"
        onConfirm={() => {
          setPermissionModal((p) => ({ ...p, visible: false }));
          Linking.openSettings();
        }}
        onCancel={() => setPermissionModal((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
};

export default DocumentPhotoUploadField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#8E9BAE',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  fieldBoxDefault: {
    backgroundColor: '#131F35',
    borderColor: 'rgba(240, 145, 58, 0.3)',
    borderStyle: 'dashed',
  },
  fieldBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  fieldSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginBottom: 16,
    lineHeight: 18,
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  uploadPhotoBox: {
    flex: 1,
    height: 110,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  uploadPhotoBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  uploadPhotoBoxEmpty: {
    backgroundColor: '#131F35',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  thumbnailPreview: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginBottom: 4,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadPhotoTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  uploadPhotoSub: {
    color: '#8E9BAE',
    fontSize: RFValue(10),
    marginTop: 2,
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 10,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    borderRadius: 25,
    gap: 10,
  },
  scanningText: {
    color: '#F0913A',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 14,
    padding: 6,
  },
  skipText: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
  },
  pickerOptionsContainer: {
    gap: 12,
    marginBottom: 16,
    marginTop: 6,
  },
  pickerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132338',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1E3552',
  },
  pickerOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pickerOptionTextContainer: {
    flex: 1,
  },
  pickerOptionTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginBottom: 2,
  },
  pickerOptionSub: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
  },
  cancelPickerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1728',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#182B42',
    marginTop: 4,
  },
  cancelPickerText: {
    color: '#8E9BAE',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
});
