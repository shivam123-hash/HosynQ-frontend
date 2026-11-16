import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export type CameraPermissionStatus = 'not_determined' | 'granted' | 'denied';

export interface ScanDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onItemsAdded: (count: number) => void;
  onOpenUpload?: () => void;
  onTypeDetailsMyself?: () => void;
  onOpenVault?: () => void;
  onIgnore?: () => void;
  initialPermission?: CameraPermissionStatus;
  scannedFileName?: string;
  forceOutcome?: 'success' | 'noActionsFound' | 'couldNotRead';
  initialStage?: ScanStage;
  readingDurationMs?: number;
}

export type ScanStage =
  | 'permission_prompt'
  | 'permission_denied'
  | 'camera'
  | 'reading'
  | 'noActionsFound'
  | 'couldNotRead'
  | 'readSummary'
  | 'checkDate'
  | 'reviewEdit'
  | 'success';

export const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({
  visible,
  onClose,
  onItemsAdded,
  onOpenUpload,
  onTypeDetailsMyself,
  onOpenVault,
  onIgnore,
  initialPermission,
  scannedFileName,
  forceOutcome,
  initialStage,
  readingDurationMs = 1200,
}) => {
  const insets = useSafeAreaInsets();
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>(initialPermission || 'not_determined');
  const [stage, setStage] = useState<ScanStage>(() => {
    if (initialStage) return initialStage;
    if (scannedFileName) return 'reading';
    if (initialPermission === 'granted') return 'camera';
    if (initialPermission === 'denied') return 'permission_denied';
    return 'permission_prompt';
  });
  const [scanMode, setScanMode] = useState<'Auto' | 'Manual'>('Auto');

  // Item selections
  const [selectedItems, setSelectedItems] = useState({
    event: true,
    task: true,
    reminder: false,
  });

  // Date selection for 11/12/2026
  const [selectedDateFormat, setSelectedDateFormat] = useState<'DDMM' | 'MMDD'>('DDMM');

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const determineTargetStage = useCallback(
    (fileName?: string): ScanStage => {
      if (forceOutcome === 'couldNotRead') return 'couldNotRead';
      if (forceOutcome === 'noActionsFound') return 'noActionsFound';
      if (forceOutcome === 'success') return 'readSummary';

      if (fileName) {
        const lower = fileName.toLowerCase();
        if (
          lower.includes('blurry') ||
          lower.includes('dark') ||
          lower.includes('cant_read') ||
          lower.includes('unreadable')
        ) {
          return 'couldNotRead';
        }
        if (
          lower.includes('img_2041') ||
          lower.includes('2041') ||
          lower.includes('no_action') ||
          lower.includes('empty')
        ) {
          return 'noActionsFound';
        }
      }
      return 'readSummary';
    },
    [forceOutcome]
  );

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      if (initialStage) {
        setStage(initialStage);
      } else if (scannedFileName) {
        setStage('reading');
        timerRef.current = setTimeout(() => {
          setStage(determineTargetStage(scannedFileName));
        }, readingDurationMs);
      } else if (cameraPermission === 'granted') {
        setStage('camera');
      } else if (cameraPermission === 'denied') {
        setStage('permission_denied');
      } else {
        setStage('permission_prompt');
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    visible,
    cameraPermission,
    scannedFileName,
    initialStage,
    readingDurationMs,
    determineTargetStage,
  ]);

  const handleDoneScan = (outcome?: 'success' | 'noActionsFound' | 'couldNotRead') => {
    setStage('reading');
    const target = outcome
      ? outcome === 'success'
        ? 'readSummary'
        : outcome
      : determineTargetStage(scannedFileName);

    timerRef.current = setTimeout(() => {
      setStage(target);
    }, readingDurationMs);
  };

  const handleAddItems = () => {
    setStage('success');
  };

  const handleFinish = () => {
    onItemsAdded(selectedCount);
    onClose();
  };

  const handleFinishNoActions = () => {
    onClose();
  };

  const handleOpenVault = () => {
    if (onOpenVault) {
      onOpenVault();
    } else {
      Alert.alert('Family Vault', 'Opened Family Vault › Photos');
    }
    onClose();
  };

  const handleScanAgain = () => {
    if (cameraPermission === 'granted') {
      setStage('camera');
    } else {
      setStage('permission_prompt');
    }
  };

  const handleTypeDetailsMyself = () => {
    onClose();
    onTypeDetailsMyself?.();
  };

  const handleIgnore = () => {
    onClose();
    onIgnore?.();
  };

  const handleCancelAll = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancelAll}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* =========================================================================
            STAGE: CAMERA PERMISSION PROMPT (ADD-04)
        ========================================================================= */}
        {stage === 'permission_prompt' && (
          <View style={styles.permissionContainer}>
            {/* Top Bar with Dismiss Button */}
            <View style={styles.permissionTopBar}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
                accessibilityRole="button"
                accessibilityLabel="Close permission prompt"
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
            </View>

            {/* Central Visual & Content */}
            <View style={styles.permissionCenterContent}>
              {/* Concentric Circle Icon Ring */}
              <View style={styles.permissionIconRingOuter}>
                <View style={styles.permissionIconRingInner}>
                  <Feather name="camera" size={38} color={Colors.primary} />
                </View>
              </View>

              <Text style={styles.permissionTitle}>
                Let HosynQ use your camera
              </Text>

              <Text style={styles.permissionSubtitle}>
                Scan bills, school circulars and reports. HosynQ reads them and
                suggests the reminders. Scans stay private to your family.
              </Text>
            </View>

            {/* Bottom Action Buttons */}
            <View
              style={[
                styles.permissionBottomArea,
                { paddingBottom: Math.max(insets.bottom + 8, 24) },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setCameraPermission('granted');
                  setStage('camera');
                }}
                activeOpacity={0.8}
                style={styles.permissionPrimaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Allow camera"
              >
                <Text style={styles.permissionPrimaryBtnText}>Allow camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCameraPermission('denied');
                  onClose();
                }}
                activeOpacity={0.7}
                style={styles.permissionSecondaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Not now"
              >
                <Text style={styles.permissionSecondaryBtnText}>Not now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE: CAMERA PERMISSION DENIED (ADD-04b)
        ========================================================================= */}
        {stage === 'permission_denied' && (
          <View style={styles.permissionContainer}>
            {/* Top Bar with Dismiss Button */}
            <View style={styles.permissionTopBar}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
                accessibilityRole="button"
                accessibilityLabel="Close camera denied screen"
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
            </View>

            {/* Central Visual & Content */}
            <View style={styles.permissionCenterContent}>
              {/* Concentric Circle Icon Ring (Red/Coral) */}
              <View style={styles.deniedIconRingOuter}>
                <View style={styles.deniedIconRingInner}>
                  <Feather name="camera-off" size={38} color={Colors.dangerRed} />
                </View>
              </View>

              <Text style={styles.permissionTitle}>
                Camera is off for HosynQ
              </Text>

              <Text style={styles.permissionSubtitle}>
                To scan documents, turn on Camera for HosynQ in your phone’s
                Settings. You can still upload a photo or PDF.
              </Text>
            </View>

            {/* Bottom Action Buttons */}
            <View
              style={[
                styles.permissionBottomArea,
                { paddingBottom: Math.max(insets.bottom + 8, 24) },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  Linking.openSettings().catch(() => {});
                  Alert.alert(
                    'Camera Settings',
                    'Would you like to enable camera access for HosynQ?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Allow Camera',
                        onPress: () => {
                          setCameraPermission('granted');
                          setStage('camera');
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.8}
                style={styles.permissionPrimaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Open Settings"
              >
                <Text style={styles.permissionPrimaryBtnText}>Open Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenUpload?.();
                }}
                activeOpacity={0.7}
                style={styles.permissionSecondaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Upload a file instead"
              >
                <Text style={styles.uploadInsteadText}>Upload a file instead</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 1: CAMERA SCANNER (ADD-05)
        ========================================================================= */}
        {stage === 'camera' && (
          <View style={styles.flex}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan document</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.circleBtn}>
                <Feather name="zap" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Status Pill */}
            <View style={styles.statusPillWrapper}>
              <View style={styles.statusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.statusPillText}>
                  Edges found. Hold steady...
                </Text>
              </View>
            </View>

            {/* Camera Viewfinder with Corner Brackets */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.documentFrame}>
                {/* 4 Corner Markers */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                {/* Simulated Paper Graphic */}
                <View style={styles.paperSheet}>
                  <View style={styles.paperLineHeader} />
                  <View style={styles.paperLineLong} />
                  <View style={styles.paperLineMedium} />
                  <View style={styles.paperLineLong} />
                  <View style={styles.paperLineShort} />
                  <View style={styles.spacer16} />
                  <View style={styles.paperLineLong} />
                  <View style={styles.paperLineMedium} />
                  <View style={styles.paperLineShort} />
                  <View style={styles.spacer16} />
                  <View style={styles.paperLineMedium} />
                  <View style={styles.paperLineShort} />
                </View>
              </View>
            </View>

            {/* Mode Toggle: Auto / Manual */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                onPress={() => setScanMode('Auto')}
                activeOpacity={0.8}
                style={[
                  styles.modeBtn,
                  scanMode === 'Auto' && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    scanMode === 'Auto' && styles.modeBtnTextActive,
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setScanMode('Manual')}
                activeOpacity={0.8}
                style={[
                  styles.modeBtn,
                  scanMode === 'Manual' && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    scanMode === 'Manual' && styles.modeBtnTextActive,
                  ]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls Bar */}
            <View
              style={[
                styles.cameraBottomBar,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              {/* Thumbnail with badge */}
              <View style={styles.thumbWrap}>
                <View style={styles.thumbBox} />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>2</Text>
                </View>
              </View>

              {/* Shutter Button */}
              <TouchableOpacity
                onPress={() => handleDoneScan()}
                activeOpacity={0.7}
                style={styles.shutterOuter}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              {/* Done button */}
              <TouchableOpacity
                onPress={() => handleDoneScan()}
                activeOpacity={0.7}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 2: READING DOCUMENT (ADD-10)
        ========================================================================= */}
        {stage === 'reading' && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reading your document</Text>
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <View style={styles.readingContent}>
              {/* Document with scanning beam line */}
              <TouchableOpacity
                onPress={() => {
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                  }
                  setStage(determineTargetStage(scannedFileName));
                }}
                activeOpacity={0.9}
                style={styles.readingDocCard}
                accessibilityRole="button"
                accessibilityLabel="Complete reading document"
              >
                <View style={styles.readingDocLineHeader} />
                <View style={styles.readingDocLine} />
                <View style={styles.readingDocHighlight} />
                <View style={styles.readingDocLine} />
                {/* Horizontal glowing orange beam */}
                <View style={styles.orangeScanBeam} />
                <View style={styles.readingDocLine} />
                <View style={styles.readingDocLine} />
              </TouchableOpacity>

              {/* Status List */}
              <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <Feather name="check-circle" size={18} color={Colors.accentTeal} />
                  <Text style={styles.statusRowText}>Uploaded securely</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusRow}>
                  <Feather name="check-circle" size={18} color={Colors.accentTeal} />
                  <Text style={styles.statusRowText}>Reading the text</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusRow}>
                  <Feather name="loader" size={18} color={Colors.primary} />
                  <Text style={styles.statusFindingText}>
                    Finding dates, people and actions
                  </Text>
                </View>
              </View>

              {/* Progress Bar 70% */}
              <View style={styles.progressRow}>
                <View style={styles.progressBarTrack}>
                  <View style={styles.progressBarFill} />
                </View>
                <Text style={styles.progressPct}>70%</Text>
              </View>

              {/* Lock Privacy Note */}
              <View style={styles.lockRow}>
                <Feather name="lock" size={14} color={Colors.textSubtle} />
                <Text style={styles.lockText}>
                  Only your family can see this file. You can leave this screen;
                  we’ll let you know when it’s ready.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.bottomBar,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 2B: SAVED, NO ACTIONS FOUND (ADD-11)
        ========================================================================= */}
        {stage === 'noActionsFound' && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <View style={styles.outcomeCenterContent}>
              {/* Dual Concentric Rings in Teal/Mint */}
              <View style={styles.mintRingOuter}>
                <View style={styles.mintRingInner}>
                  <Feather name="image" size={28} color={Colors.accentTeal} />
                </View>
              </View>

              <Text style={styles.outcomeTitle}>Saved. Nothing to add.</Text>

              <Text style={styles.outcomeSubtitle}>
                We didn’t find any dates, tasks or reminders in this photo. It’s
                saved in Family Vault › Photos.
              </Text>

              {/* Saved File Card */}
              <View style={styles.savedFileCard}>
                <View style={styles.docMiniThumb}>
                  <View style={styles.docMiniLineH} />
                  <View style={styles.docMiniLine} />
                  <View style={styles.docMiniLine} />
                </View>
                <View style={styles.savedFileTextCol}>
                  <Text style={styles.savedFileName} numberOfLines={1}>
                    {scannedFileName || 'IMG_2041.jpg'}
                  </Text>
                  <Text style={styles.savedFileMeta} numberOfLines={1}>
                    Photo · Saved just now · Only your family can see
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Actions */}
            <View
              style={[
                styles.outcomeBottomBar,
                { paddingBottom: Math.max(insets.bottom + 8, 20) },
              ]}
            >
              <TouchableOpacity
                onPress={handleFinishNoActions}
                activeOpacity={0.8}
                style={styles.primaryOrangeBtn}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.primaryOrangeBtnText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenVault}
                activeOpacity={0.7}
                style={styles.secondaryDarkBtn}
                accessibilityRole="button"
                accessibilityLabel="Open in Family Vault"
              >
                <Text style={styles.secondaryDarkBtnText}>
                  Open in Family Vault
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTypeDetailsMyself}
                activeOpacity={0.7}
                style={styles.textLinkBtn}
                accessibilityRole="button"
                accessibilityLabel="Add a task anyway"
              >
                <Text style={styles.orangeLinkText}>Add a task anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 2C: COULDN'T READ THIS (ADD-12)
        ========================================================================= */}
        {stage === 'couldNotRead' && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <View style={styles.outcomeCenterContent}>
              {/* Dual Concentric Rings in Red/Coral */}
              <View style={styles.coralRingOuter}>
                <View style={styles.coralRingInner}>
                  <Feather name="file-text" size={28} color={Colors.dangerRed} />
                </View>
              </View>

              <Text style={styles.outcomeTitle}>We couldn’t read this</Text>

              <Text style={styles.outcomeSubtitle}>
                The photo looks blurry or too dark. Scan it again in better
                light, or type in the details yourself.
              </Text>
            </View>

            {/* Bottom Actions */}
            <View
              style={[
                styles.outcomeBottomBar,
                { paddingBottom: Math.max(insets.bottom + 8, 20) },
              ]}
            >
              <TouchableOpacity
                onPress={handleScanAgain}
                activeOpacity={0.8}
                style={styles.primaryOrangeBtn}
                accessibilityRole="button"
                accessibilityLabel="Scan again"
              >
                <Text style={styles.primaryOrangeBtnText}>Scan again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTypeDetailsMyself}
                activeOpacity={0.7}
                style={styles.secondaryDarkBtn}
                accessibilityRole="button"
                accessibilityLabel="Type the details myself"
              >
                <Text style={styles.secondaryDarkBtnText}>
                  Type the details myself
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 3: READ SUMMARY (ADD-14)
        ========================================================================= */}
        {(stage === 'readSummary' || stage === 'checkDate') && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancelAll}
                activeOpacity={0.7}
                style={styles.circleBtn}
              >
                <Feather name="x" size={20} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
              <TouchableOpacity
                onPress={handleIgnore}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Ignore"
              >
                <Text style={styles.ignoreText}>Ignore</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.orangeKicker}>✦ I READ THIS FOR YOU</Text>

              {/* Document Header Card */}
              <View style={styles.docInfoCard}>
                <View style={styles.docIconBox}>
                  <Feather name="file-text" size={24} color={Colors.textLightMuted} />
                </View>
                <View style={styles.docTextCol}>
                  <Text style={styles.docTitle}>St. Mary's School circular</Text>
                  <Text style={styles.docSub}>1 page · Scanned just now</Text>
                </View>
              </View>

              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>SUMMARY</Text>
                <Text style={styles.summaryBody}>
                  Parent-teacher meeting for Class 4 on Friday 6 November, 3:00 to
                  3:45 PM in Room 12. Bring the report card. Term 2 fee is due on
                  11/12/2026.
                </Text>
              </View>

              {/* Section Header */}
              <View style={styles.itemsHeaderRow}>
                <Text style={styles.itemsSectionTitle}>
                  I found 3 things to add
                </Text>
                <Text style={styles.itemsSelectedCount}>
                  {selectedCount} selected
                </Text>
              </View>

              {/* Items Card */}
              <View style={styles.itemsContainerCard}>
                {/* 1. Event */}
                <TouchableOpacity
                  onPress={() =>
                    setSelectedItems({
                      ...selectedItems,
                      event: !selectedItems.event,
                    })
                  }
                  activeOpacity={0.8}
                  style={styles.foundItemRow}
                >
                  <View style={styles.foundItemLeft}>
                    <View
                      style={[
                        styles.checkBoxSquare,
                        selectedItems.event && styles.checkBoxSquareChecked,
                      ]}
                    >
                      {selectedItems.event && (
                        <Feather name="check" size={14} color={Colors.cardInsetDark} />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="calendar" size={12} color={Colors.accentBlue} />
                        <Text style={styles.eventTag}>EVENT</Text>
                      </View>
                      <Text style={styles.foundItemTitle}>Aarav's PTM</Text>
                      <Text style={styles.foundItemSub}>
                        Fri, 6 Nov · 3:00–3:45 PM · Room 12
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pillGreen}>
                    <Text style={styles.pillGreenText}>Looks right</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.foundItemDivider} />

                {/* 2. Task */}
                <TouchableOpacity
                  onPress={() =>
                    setSelectedItems({
                      ...selectedItems,
                      task: !selectedItems.task,
                    })
                  }
                  activeOpacity={0.8}
                  style={styles.foundItemRow}
                >
                  <View style={styles.foundItemLeft}>
                    <View
                      style={[
                        styles.checkBoxSquare,
                        selectedItems.task && styles.checkBoxSquareChecked,
                      ]}
                    >
                      {selectedItems.task && (
                        <Feather name="check" size={14} color={Colors.cardInsetDark} />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="check-square" size={12} color={Colors.primary} />
                        <Text style={styles.taskTag}>TASK</Text>
                      </View>
                      <Text style={styles.foundItemTitle}>
                        Pay term 2 school fee
                      </Text>
                      <Text style={styles.foundItemSub}>
                        Due{' '}
                        {selectedDateFormat === 'DDMM'
                          ? '11/12/2026'
                          : '12/11/2026'}{' '}
                        · date needs checking
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setStage('checkDate')}
                    activeOpacity={0.7}
                    style={styles.pillOrange}
                  >
                    <Text style={styles.pillOrangeText}>Check this</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.foundItemDivider} />

                {/* 3. Reminder */}
                <TouchableOpacity
                  onPress={() =>
                    setSelectedItems({
                      ...selectedItems,
                      reminder: !selectedItems.reminder,
                    })
                  }
                  activeOpacity={0.8}
                  style={styles.foundItemRow}
                >
                  <View style={styles.foundItemLeft}>
                    <View
                      style={[
                        styles.checkBoxSquare,
                        selectedItems.reminder && styles.checkBoxSquareChecked,
                      ]}
                    >
                      {selectedItems.reminder && (
                        <Feather name="check" size={14} color={Colors.cardInsetDark} />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="bell" size={12} color={Colors.accentPurple} />
                        <Text style={styles.reminderTag}>REMINDER</Text>
                      </View>
                      <Text style={styles.foundItemTitle}>
                        Bring the report card
                      </Text>
                      <Text style={styles.foundItemSub}>
                        Thu, 5 Nov · 7:00 PM
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pillGrey}>
                    <Text style={styles.pillGreyText}>Not sure</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View
              style={[
                styles.bottomBarRow,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                onPress={() => setStage('reviewEdit')}
                activeOpacity={0.7}
                style={styles.reviewEditBtn}
              >
                <Text style={styles.reviewEditBtnText}>Review and edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddItems}
                activeOpacity={0.8}
                style={styles.addItemsBtn}
              >
                <Text style={styles.addItemsBtnText}>
                  Add {selectedCount} items
                </Text>
              </TouchableOpacity>
            </View>

            {/* =========================================================================
                STAGE 4: PLEASE CHECK THIS DATE SHEET (ADD-15)
            ========================================================================= */}
            {stage === 'checkDate' && (
              <View style={styles.dateSheetBackdrop}>
                <View style={styles.dateSheet}>
                  <View style={styles.dragHandle} />
                  <Text style={styles.dateSheetTitle}>Please check this date</Text>
                  <Text style={styles.dateSheetSub}>
                    The circular says 11/12/2026. That could mean two different
                    days.
                  </Text>

                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>
                      “Term 2 fee must be paid by{' '}
                      <Text style={styles.quoteHighlightedDate}>
                        11/12/2026
                      </Text>
                      .”
                    </Text>
                  </View>

                  {/* Option 1 */}
                  <TouchableOpacity
                    onPress={() => setSelectedDateFormat('DDMM')}
                    activeOpacity={0.7}
                    style={[
                      styles.dateOptionCard,
                      selectedDateFormat === 'DDMM' &&
                        styles.dateOptionCardActive,
                    ]}
                  >
                    <View style={styles.dateOptionTextCol}>
                      <Text style={styles.dateOptionTitle}>
                        Friday, 11 December 2026
                      </Text>
                      <Text style={styles.dateOptionSub}>
                        Day first (DD/MM), the usual format in India
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedDateFormat === 'DDMM' &&
                          styles.radioCircleActive,
                      ]}
                    >
                      {selectedDateFormat === 'DDMM' && (
                        <View style={styles.radioInnerDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Option 2 */}
                  <TouchableOpacity
                    onPress={() => setSelectedDateFormat('MMDD')}
                    activeOpacity={0.7}
                    style={[
                      styles.dateOptionCard,
                      selectedDateFormat === 'MMDD' &&
                        styles.dateOptionCardActive,
                    ]}
                  >
                    <View style={styles.dateOptionTextCol}>
                      <Text style={styles.dateOptionTitle}>
                        Thursday, 12 November 2026
                      </Text>
                      <Text style={styles.dateOptionSub}>
                        Month first (MM/DD)
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedDateFormat === 'MMDD' &&
                          styles.radioCircleActive,
                      ]}
                    >
                      {selectedDateFormat === 'MMDD' && (
                        <View style={styles.radioInnerDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStage('readSummary')}
                    activeOpacity={0.8}
                    style={styles.useDateBtn}
                  >
                    <Text style={styles.useDateBtnText}>Use this date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStage('readSummary')}
                    activeOpacity={0.7}
                    style={styles.pickAnotherDateBtn}
                  >
                    <Text style={styles.pickAnotherDateText}>
                      Pick another date
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* =========================================================================
            STAGE 5: REVIEW AND EDIT ACTIONS (ADD-16)
        ========================================================================= */}
        {stage === 'reviewEdit' && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setStage('readSummary')}
                activeOpacity={0.7}
                style={styles.circleBtn}
              >
                <Feather name="chevron-left" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Review and edit</Text>
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.reviewSub}>
                Change anything that’s wrong. Untick what you don’t want.
              </Text>

              {/* Event card */}
              <View style={styles.reviewGroupCard}>
                <View style={styles.reviewGroupHeader}>
                  <View style={styles.checkBoxSquareChecked}>
                    <Feather name="check" size={14} color={Colors.cardInsetDark} />
                  </View>
                  <Text style={[styles.eventTag, styles.ml8]}>EVENT</Text>
                  <View style={styles.flex1} />
                  <View style={styles.pillGreen}>
                    <Text style={styles.pillGreenText}>Looks right</Text>
                  </View>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Title</Text>
                  <Text style={styles.reviewRowVal}>Aarav's PTM</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>When</Text>
                  <Text style={styles.reviewRowVal}>
                    Fri, 6 Nov · 3:00–3:45 PM
                  </Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Where</Text>
                  <Text style={styles.reviewRowVal}>
                    St. Mary's School, Room 12
                  </Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Invite</Text>
                  <Text style={styles.reviewRowVal}>Rohan, Priya</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
              </View>

              {/* Task card */}
              <View style={[styles.reviewGroupCard, styles.mt16]}>
                <View style={styles.reviewGroupHeader}>
                  <View style={styles.checkBoxSquareChecked}>
                    <Feather name="check" size={14} color={Colors.cardInsetDark} />
                  </View>
                  <Text style={[styles.taskTag, styles.ml8]}>TASK</Text>
                  <View style={styles.flex1} />
                  <View style={styles.pillOrange}>
                    <Text style={styles.pillOrangeText}>Check this</Text>
                  </View>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Title</Text>
                  <Text style={styles.reviewRowVal}>Pay term 2 school fee</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={[styles.reviewRow, styles.reviewRowDue]}>
                  <Text style={styles.reviewRowLabel}>Due</Text>
                  <Text style={[styles.reviewRowVal, styles.reviewRowValOrange]}>
                    Fri, 11 Dec 2026
                  </Text>
                  <Feather
                    name="alert-circle"
                    size={16}
                    color={Colors.primary}
                    style={styles.ml6}
                  />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Assign to</Text>
                  <Text style={styles.reviewRowVal}>Rohan</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
              </View>

              {/* Reminder card */}
              <View style={[styles.reviewGroupCard, styles.mt16]}>
                <View style={styles.reviewGroupHeader}>
                  <View style={styles.checkBoxSquare} />
                  <Text style={[styles.reminderTag, styles.ml8]}>
                    REMINDER
                  </Text>
                  <View style={styles.flex1} />
                  <View style={styles.pillGrey}>
                    <Text style={styles.pillGreyText}>Not sure</Text>
                  </View>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Remind</Text>
                  <Text style={styles.reviewRowVal}>Bring the report card</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>When</Text>
                  <Text style={styles.reviewRowVal}>Thu, 5 Nov · 7:00 PM</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.bottomBar,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                onPress={handleAddItems}
                activeOpacity={0.8}
                style={styles.addItemsBtn}
              >
                <Text style={styles.addItemsBtnText}>
                  Add {selectedCount} items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            STAGE 6: ADDED TO YOUR FAMILY CONFIRMATION (ADD-17)
        ========================================================================= */}
        {stage === 'success' && (
          <View style={styles.flex}>
            <View style={styles.header}>
              <View style={styles.circleBtnPlaceholder} />
              <View style={styles.circleBtnPlaceholder} />
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <View style={styles.successContent}>
              {/* Double green circle with checkmark */}
              <View style={styles.successOuterCircle}>
                <View style={styles.successInnerCircle}>
                  <Feather name="check" size={28} color={Colors.accentTeal} />
                </View>
              </View>

              <Text style={styles.successTitle}>Added to your family</Text>
              <Text style={styles.successSubtitle}>
                Rohan and Priya have been told.
              </Text>

              {/* Items Summary Card */}
              <View style={styles.successItemsCard}>
                {selectedItems.event && (
                  <View style={styles.successItemRow}>
                    <View style={styles.eventIconCircle}>
                      <Feather name="calendar" size={18} color={Colors.accentBlue} />
                    </View>
                    <View style={styles.successItemTextCol}>
                      <Text style={styles.successItemTitle}>Aarav's PTM</Text>
                      <Text style={styles.successItemSub}>
                        Fri, 6 Nov · 3:00 PM
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleFinish}
                      activeOpacity={0.7}
                      style={styles.navLinkRow}
                    >
                      <Text style={styles.navLinkText}>Calendar</Text>
                      <Feather name="chevron-right" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedItems.task && (
                  <>
                    <View style={styles.foundItemDivider} />
                    <View style={styles.successItemRow}>
                      <View style={styles.taskIconCircle}>
                        <Feather name="check-square" size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.successItemTextCol}>
                        <Text style={styles.successItemTitle}>
                          Pay term 2 school fee
                        </Text>
                        <Text style={styles.successItemSub}>
                          Due Fri, 11 Dec · Rohan
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleFinish}
                        activeOpacity={0.7}
                        style={styles.navLinkRow}
                      >
                        <Text style={styles.navLinkText}>Tasks</Text>
                        <Feather name="chevron-right" size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenVault?.();
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Open Family Vault"
              >
                <Text style={styles.vaultNote}>
                  The circular is saved in Family Vault › School.
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.bottomBar,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                onPress={handleFinish}
                activeOpacity={0.8}
                style={styles.donePrimaryBtn}
              >
                <Text style={styles.donePrimaryBtnText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStage('camera')}
                activeOpacity={0.7}
                style={styles.scanAnotherBtn}
              >
                <Text style={styles.scanAnotherText}>Scan another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSubtle,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  ignoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusPillWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 35, 51, 0.9)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentTeal,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  documentFrame: {
    width: '100%',
    aspectRatio: 0.72,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  paperSheet: {
    width: '84%',
    height: '88%',
    backgroundColor: Colors.docBg,
    borderRadius: 8,
    padding: 16,
    transform: [{ rotate: '1.5deg' }],
  },
  paperLineHeader: {
    height: 12,
    width: '65%',
    backgroundColor: Colors.docText,
    borderRadius: 3,
    marginBottom: 16,
  },
  paperLineLong: {
    height: 6,
    width: '90%',
    backgroundColor: Colors.docLine,
    borderRadius: 2,
    marginBottom: 8,
  },
  paperLineMedium: {
    height: 6,
    width: '75%',
    backgroundColor: Colors.docLine,
    borderRadius: 2,
    marginBottom: 8,
  },
  paperLineShort: {
    height: 6,
    width: '50%',
    backgroundColor: Colors.docLine,
    borderRadius: 2,
    marginBottom: 8,
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 20,
    padding: 3,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  modeBtnTextActive: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  cameraBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumbBox: {
    width: 44,
    height: 54,
    backgroundColor: Colors.docBg,
    borderRadius: 6,
  },
  thumbBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  readingContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingDocCard: {
    width: 200,
    height: 240,
    backgroundColor: Colors.docBg,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    marginBottom: 24,
    overflow: 'hidden',
  },
  readingDocLineHeader: {
    height: 12,
    width: '60%',
    backgroundColor: Colors.docText,
    borderRadius: 3,
    marginBottom: 14,
  },
  readingDocLine: {
    height: 6,
    width: '90%',
    backgroundColor: Colors.docLine,
    borderRadius: 2,
    marginBottom: 8,
  },
  readingDocHighlight: {
    height: 12,
    width: '45%',
    backgroundColor: 'rgba(240, 145, 58, 0.4)',
    borderRadius: 3,
    marginBottom: 8,
  },
  orangeScanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 4,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  statusCard: {
    width: '100%',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusRowText: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginLeft: 12,
    fontWeight: '500',
  },
  statusDivider: {
    height: 1,
    backgroundColor: Colors.surfaceNavy,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceNavy,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  lockText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
  outcomeCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mintRingOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(46, 196, 182, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 196, 182, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mintRingInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(46, 196, 182, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 196, 182, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coralRingOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(232, 74, 95, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 74, 95, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  coralRingInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(232, 74, 95, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 74, 95, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  outcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSubtle,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  savedFileCard: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docMiniThumb: {
    width: 36,
    height: 44,
    backgroundColor: Colors.textNearWhite,
    borderRadius: 4,
    padding: 6,
    justifyContent: 'center',
    marginRight: 14,
  },
  docMiniLineH: {
    width: 14,
    height: 3,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1.5,
    marginBottom: 4,
  },
  docMiniLine: {
    width: '90%',
    height: 2,
    backgroundColor: Colors.textMutedLight,
    borderRadius: 1,
    marginBottom: 3,
  },
  savedFileTextCol: {
    flex: 1,
  },
  savedFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  savedFileMeta: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginTop: 3,
  },
  outcomeBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryOrangeBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryOrangeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryDarkBtn: {
    height: 50,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryDarkBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  textLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  orangeLinkText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceCardAlt,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  orangeKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  docInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceElevated3,
    marginBottom: 14,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.surfaceNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docTextCol: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  docSub: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceElevated3,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 13,
    color: Colors.textLightMuted,
    lineHeight: 19,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  itemsSelectedCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  itemsContainerCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
  },
  foundItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  foundItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 8,
  },
  checkBoxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLightAlt,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSquareChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  foundItemInfo: {
    flex: 1,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  taskTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  reminderTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentPurple,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  foundItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 3,
  },
  foundItemSub: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  foundItemDivider: {
    height: 1,
    backgroundColor: Colors.surfaceElevated2,
  },
  pillGreen: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accentTeal,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillGreenText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentTeal,
  },
  pillOrange: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillOrangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  pillGrey: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillGreyText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceCardAlt,
  },
  reviewEditBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceMutedAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewEditBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  addItemsBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  dateSheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  dateSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  dateSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  dateSheetSub: {
    fontSize: 13,
    color: Colors.textSubtle,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  quoteBox: {
    backgroundColor: Colors.docBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    color: Colors.surfaceNavy,
    textAlign: 'center',
    fontWeight: '500',
  },
  dateOptionCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
    marginBottom: 10,
  },
  dateOptionCardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  dateOptionTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  dateOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  dateOptionSub: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderLightAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  useDateBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  useDateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  pickAnotherDateBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pickAnotherDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewSub: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginBottom: 16,
  },
  reviewGroupCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
    overflow: 'hidden',
  },
  reviewGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceElevated2,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  reviewRowLabel: {
    fontSize: 13,
    color: Colors.textSubtle,
    width: 70,
  },
  reviewRowVal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  successContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: Colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginBottom: 24,
  },
  successItemsCard: {
    width: '100%',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceNavy,
    marginBottom: 16,
  },
  successItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  eventIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(58, 142, 240, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  successItemTextCol: {
    flex: 1,
  },
  successItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  successItemSub: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  navLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 2,
  },
  vaultNote: {
    fontSize: 12,
    color: Colors.textPlaceholderAlt,
    textAlign: 'center',
  },
  donePrimaryBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  donePrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  scanAnotherBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  scanAnotherText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  spacer16: {
    height: 16,
  },
  statusFindingText: {
    fontSize: 14,
    marginLeft: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  quoteHighlightedDate: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  ml8: {
    marginLeft: 8,
  },
  ml6: {
    marginLeft: 6,
  },
  mt16: {
    marginTop: 16,
  },
  flex1: {
    flex: 1,
  },
  reviewRowDue: {
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
  },
  reviewRowValOrange: {
    color: Colors.primary,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  permissionTopBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  permissionCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -30,
  },
  permissionIconRingOuter: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(240, 145, 58, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  permissionIconRingInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deniedIconRingOuter: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(232, 74, 95, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 74, 95, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  deniedIconRingInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(232, 74, 95, 0.14)',
    borderWidth: 1.5,
    borderColor: Colors.dangerRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionSubtitle: {
    fontSize: 14.5,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  permissionBottomArea: {
    paddingHorizontal: 24,
  },
  permissionPrimaryBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  permissionPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  permissionSecondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  uploadInsteadText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});
