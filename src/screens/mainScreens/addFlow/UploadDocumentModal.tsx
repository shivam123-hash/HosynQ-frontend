import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export type UploadErrorType = 'unsupported' | 'too_large';
export type PhotosPermissionStatus = 'prompt' | 'granted';

export interface UploadDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (fileName: string) => void;
  onScanWithCamera?: () => void;
  initialError?: UploadErrorType;
  initialPermissionStatus?: PhotosPermissionStatus;
}

interface UploadableFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'document' | 'photo';
  detailType?: string;
  unsupported?: boolean;
  tooLarge?: boolean;
}

const UPLOADABLE_FILES: UploadableFile[] = [
  {
    id: '1',
    name: "St. Mary's School circular.pdf",
    size: '1.2 MB',
    date: '28 Oct',
    type: 'document',
    detailType: 'PDF',
  },
  {
    id: '2',
    name: 'IMG_2041.jpg',
    size: '2.1 MB',
    date: '29 Oct',
    type: 'photo',
    detailType: 'Photo',
  },
  {
    id: '3',
    name: 'Electricity_bills.xlsx',
    size: '240 KB',
    date: '27 Oct',
    type: 'document',
    detailType: 'Excel spreadsheet',
    unsupported: true,
  },
  {
    id: '4',
    name: 'School_report_full_scan.pdf',
    size: '48 MB',
    date: '26 Oct',
    type: 'document',
    detailType: 'PDF',
    tooLarge: true,
  },
  {
    id: '5',
    name: 'Vaccination_certificate.pdf',
    size: '850 KB',
    date: '25 Oct',
    type: 'document',
    detailType: 'PDF',
  },
  {
    id: '6',
    name: 'IMG_1998_rent_receipt.jpg',
    size: '1.8 MB',
    date: '24 Oct',
    type: 'photo',
    detailType: 'Photo',
  },
  {
    id: '7',
    name: 'Car_insurance_policy.pdf',
    size: '3.4 MB',
    date: '22 Oct',
    type: 'document',
    detailType: 'PDF',
  },
  {
    id: '8',
    name: 'IMG_1982.jpg',
    size: '4.2 MB',
    date: '21 Oct',
    type: 'photo',
    detailType: 'Photo',
  },
  {
    id: '9',
    name: 'CBSE_Exam_Schedule.pdf',
    size: '890 KB',
    date: '20 Oct',
    type: 'document',
    detailType: 'PDF',
  },
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  visible,
  onClose,
  onFileSelected,
  onScanWithCamera,
  initialError,
  initialPermissionStatus = 'granted',
}) => {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState<PhotosPermissionStatus>(
    initialPermissionStatus
  );
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'photos'>(
    'all'
  );
  const [errorState, setErrorState] = useState<{
    type: UploadErrorType;
    file: { name: string; detail: string };
  } | null>(() => {
    if (initialError === 'unsupported') {
      return {
        type: 'unsupported',
        file: {
          name: 'Electricity_bills.xlsx',
          detail: 'Excel spreadsheet · 240 KB',
        },
      };
    }
    if (initialError === 'too_large') {
      return {
        type: 'too_large',
        file: {
          name: 'School_report_full_scan.pdf',
          detail: 'PDF · 48 MB',
        },
      };
    }
    return null;
  });

  const handleFileSelect = (file: UploadableFile) => {
    if (file.unsupported || file.name.endsWith('.xlsx')) {
      setErrorState({
        type: 'unsupported',
        file: {
          name: file.name,
          detail: `${file.detailType || 'Excel spreadsheet'} · ${file.size}`,
        },
      });
      return;
    }
    if (file.tooLarge || file.size.includes('48 MB')) {
      setErrorState({
        type: 'too_large',
        file: {
          name: file.name,
          detail: `${file.detailType || 'PDF'} · ${file.size}`,
        },
      });
      return;
    }
    onFileSelected(file.name);
    onClose();
  };

  const filteredFiles = UPLOADABLE_FILES.filter((file) => {
    if (activeTab === 'documents') return file.type === 'document';
    if (activeTab === 'photos') return file.type === 'photo';
    return true;
  });

  return (
    <Modal
      visible={visible}
      transparent={permissionStatus === 'prompt' || !errorState}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* =========================================================================
          STAGE 1: PHOTOS / FILES PERMISSION (ADD-06)
      ========================================================================= */}
      {permissionStatus === 'prompt' && !errorState ? (
        <View style={styles.promptOverlay}>
          <View style={styles.permissionCard}>
            <Text style={styles.promptKicker}>SYSTEM PROMPT · SHOWN BY THE PHONE</Text>
            <Text style={styles.promptTitle}>“HosynQ” would like to access your photos</Text>
            <Text style={styles.promptBody}>
              The phone writes this prompt. If the person picks “Selected photos”, only those are shared.
            </Text>

            {/* Inset Orange Bordered Callout */}
            <View style={styles.hosynqLineCard}>
              <Text style={styles.hosynqLineKicker}>HOSYNQ WRITES THIS LINE</Text>
              <Text style={styles.hosynqLineText}>
                HosynQ only looks at a photo when you choose it to upload.
              </Text>
            </View>

            {/* System Actions */}
            <View style={styles.promptBtnGroup}>
              <TouchableOpacity
                onPress={() => setPermissionStatus('granted')}
                activeOpacity={0.7}
                style={styles.promptActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Select Photos..."
              >
                <Text style={styles.promptActionBlueText}>Select Photos...</Text>
              </TouchableOpacity>
              <View style={styles.promptDivider} />

              <TouchableOpacity
                onPress={() => setPermissionStatus('granted')}
                activeOpacity={0.7}
                style={styles.promptActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Allow Access to All Photos"
              >
                <Text style={styles.promptActionBoldBlueText}>Allow Access to All Photos</Text>
              </TouchableOpacity>
              <View style={styles.promptDivider} />

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.promptActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Don't Allow"
              >
                <Text style={styles.promptActionMutedText}>Don’t Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : errorState ? (
        /* =========================================================================
            STAGE 3: ERROR SCREENS (ADD-08 / ADD-09)
        ========================================================================= */
        <View style={[styles.errorScreenContainer, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.errorHeader}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.circleBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={20} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.errorHeaderTitle}>Upload</Text>
            <View style={styles.circleBtnPlaceholder} />
          </View>

          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.errorScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Dashed Dropzone Card */}
            <TouchableOpacity
              onPress={() => setErrorState(null)}
              activeOpacity={0.8}
              style={styles.dashedDropzone}
              accessibilityRole="button"
              accessibilityLabel="Choose a photo or PDF"
            >
              <View style={styles.dropzoneIconCircle}>
                <Feather name="upload" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.dropzoneTitle}>Choose a photo or PDF</Text>
              <Text style={styles.dropzoneSubtitle}>
                PDF, JPG or JPEG · up to 25 MB
              </Text>
            </TouchableOpacity>

            {/* Selected File Card in Error State */}
            <View style={styles.errorFileCard}>
              <Feather
                name="file-text"
                size={22}
                color={Colors.accentRed}
                style={styles.mr12}
              />
              <View style={styles.errorFileInfo}>
                <Text style={styles.errorFileName} numberOfLines={1}>
                  {errorState.file.name}
                </Text>
                <Text style={styles.errorFileDetail} numberOfLines={1}>
                  {errorState.file.detail}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setErrorState(null)}
                activeOpacity={0.7}
                style={styles.removeFileBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove file"
              >
                <Feather name="x" size={18} color={Colors.textSubtle} />
              </TouchableOpacity>
            </View>

            {/* Error Banner Callout */}
            <View style={styles.errorBannerCard}>
              <View style={styles.errorBannerHeaderRow}>
                <Feather
                  name="alert-circle"
                  size={18}
                  color={Colors.accentRed}
                  style={styles.mr8}
                />
                <Text style={styles.errorBannerTitle}>
                  {errorState.type === 'unsupported'
                    ? 'This file type isn’t supported'
                    : 'This file is too large'}
                </Text>
              </View>
              <Text style={styles.errorBannerBody}>
                {errorState.type === 'unsupported'
                  ? 'HosynQ can read PDF, JPG and JPEG files. Save the sheet as a PDF and try again.'
                  : 'Files can be up to 25 MB. Try scanning fewer pages, or split the PDF.'}
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View
            style={[
              styles.errorBottomBar,
              { paddingBottom: Math.max(insets.bottom + 8, 20) },
            ]}
          >
            <TouchableOpacity
              onPress={() => setErrorState(null)}
              activeOpacity={0.8}
              style={styles.chooseAnotherBtn}
              accessibilityRole="button"
              accessibilityLabel="Choose another file"
            >
              <Text style={styles.chooseAnotherBtnText}>
                Choose another file
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onScanWithCamera?.();
              }}
              activeOpacity={0.7}
              style={styles.scanCameraBtn}
              accessibilityRole="button"
              accessibilityLabel="Scan with camera instead"
            >
              <Text style={styles.scanCameraText}>
                Scan with camera instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* =========================================================================
            STAGE 2: GALLERY OR FILE PICKER (ADD-07)
        ========================================================================= */
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
                  The phone shows its own picker. HosynQ accepts PDF, JPG and JPEG files up to 25 MB.
                </Text>

                {/* Dashed Inset Preview Box */}
                <View style={styles.systemPlaceholderBox}>
                  <Text style={styles.systemPlaceholderText}>
                    Photos and Files appear here
                  </Text>
                </View>

                {/* Quick Action Buttons: Photos & Browse Files */}
                <View style={styles.quickActionRow}>
                  <TouchableOpacity
                    onPress={() => {
                      onFileSelected('IMG_2041.jpg');
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={styles.quickActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from Photos"
                  >
                    <View style={styles.photoIconCircle}>
                      <Feather name="image" size={18} color={Colors.accentRed} />
                    </View>
                    <Text style={styles.quickActionText}>Choose from Photos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      onFileSelected("St. Mary's School circular.pdf");
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={styles.quickActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Browse Files"
                  >
                    <View style={styles.docIconCircle}>
                      <Feather name="file-text" size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Browse Files</Text>
                  </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.tabsRow}>
                  <TouchableOpacity
                    onPress={() => setActiveTab('all')}
                    activeOpacity={0.8}
                    style={[
                      styles.tabPill,
                      activeTab === 'all' && styles.tabPillActive,
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'all' }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'all' && styles.tabTextActive,
                      ]}
                    >
                      All ({UPLOADABLE_FILES.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('documents')}
                    activeOpacity={0.8}
                    style={[
                      styles.tabPill,
                      activeTab === 'documents' && styles.tabPillActive,
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'documents' }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'documents' && styles.tabTextActive,
                      ]}
                    >
                      Documents (
                      {
                        UPLOADABLE_FILES.filter((f) => f.type === 'document')
                          .length
                      }
                      )
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('photos')}
                    activeOpacity={0.8}
                    style={[
                      styles.tabPill,
                      activeTab === 'photos' && styles.tabPillActive,
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'photos' }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'photos' && styles.tabTextActive,
                      ]}
                    >
                      Photos (
                      {UPLOADABLE_FILES.filter((f) => f.type === 'photo').length}
                      )
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Scrollable File List */}
                <ScrollView
                  style={styles.scrollList}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.fileList}>
                    {filteredFiles.map((file) => {
                      const isPhoto = file.type === 'photo';
                      return (
                        <TouchableOpacity
                          key={file.id}
                          onPress={() => handleFileSelect(file)}
                          activeOpacity={0.7}
                          style={styles.fileCard}
                          accessibilityRole="button"
                          accessibilityLabel={`Upload ${file.name}`}
                        >
                          <View
                            style={[
                              styles.fileIconCircle,
                              isPhoto
                                ? styles.photoIconBg
                                : styles.documentIconBg,
                            ]}
                          >
                            <Feather
                              name={isPhoto ? 'image' : 'file-text'}
                              size={18}
                              color={isPhoto ? Colors.accentRed : Colors.primary}
                            />
                          </View>
                          <View style={styles.fileInfo}>
                            <Text style={styles.fileName}>{file.name}</Text>
                            <Text style={styles.fileSize}>
                              {file.size} · {file.date}
                            </Text>
                          </View>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color={Colors.textTertiary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={styles.cancelBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionCard: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderMuted,
    borderRadius: 22,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  promptKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  promptBody: {
    fontSize: 13,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  hosynqLineCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  hosynqLineKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  hosynqLineText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.white,
    lineHeight: 18,
  },
  promptBtnGroup: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
    marginHorizontal: -18,
  },
  promptActionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
  },
  promptActionBlueText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accentBlueLight,
  },
  promptActionBoldBlueText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accentBlueLight,
  },
  promptActionMutedText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderBold,
    maxHeight: '88%',
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  systemKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  systemPlaceholderBox: {
    height: 64,
    backgroundColor: Colors.surfaceNavyDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  systemPlaceholderText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 74, 95, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textSubtle,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  scrollList: {
    maxHeight: 200,
    marginBottom: 14,
  },
  fileList: {
    gap: 10,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  fileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  photoIconBg: {
    backgroundColor: 'rgba(232, 74, 95, 0.12)',
  },
  documentIconBg: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  errorScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSubtle,
  },
  errorHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPlaceholder: {
    width: 36,
  },
  errorScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  dashedDropzone: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 36, 64, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropzoneIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 14,
  },
  dropzoneSubtitle: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginTop: 4,
  },
  errorFileCard: {
    backgroundColor: Colors.errorSurfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.bannerErrorBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorFileInfo: {
    flex: 1,
  },
  errorFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  errorFileDetail: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginTop: 3,
  },
  removeFileBtn: {
    padding: 4,
  },
  errorBannerCard: {
    backgroundColor: Colors.errorSurface,
    borderWidth: 1,
    borderColor: Colors.bannerErrorBg,
    borderRadius: 14,
    padding: 16,
  },
  errorBannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dangerRed,
  },
  errorBannerBody: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textLightMuted,
    marginTop: 8,
  },
  errorBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSubtle,
  },
  chooseAnotherBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chooseAnotherBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  scanCameraBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  scanCameraText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  mr12: {
    marginRight: 12,
  },
  mr8: {
    marginRight: 8,
  },
  flex1: {
    flex: 1,
  },
});
