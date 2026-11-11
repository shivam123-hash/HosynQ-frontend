import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface ScanDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onItemsAdded: (count: number) => void;
}

type ScanStage =
  | 'camera'
  | 'reading'
  | 'readSummary'
  | 'checkDate'
  | 'reviewEdit'
  | 'success';

export const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({
  visible,
  onClose,
  onItemsAdded,
}) => {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<ScanStage>('camera');
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

  useEffect(() => {
    if (!visible) {
      setStage('camera');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const handleDoneScan = () => {
    setStage('reading');
    timerRef.current = setTimeout(() => {
      setStage('readSummary');
    }, 1200);
  };

  const handleAddItems = () => {
    setStage('success');
  };

  const handleFinish = () => {
    onItemsAdded(selectedCount);
    onClose();
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
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan document</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.circleBtn}>
                <Feather name="zap" size={20} color="#FFFFFF" />
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
                onPress={handleDoneScan}
                activeOpacity={0.7}
                style={styles.shutterOuter}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              {/* Done button */}
              <TouchableOpacity
                onPress={handleDoneScan}
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
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reading your document</Text>
              <View style={styles.circleBtnPlaceholder} />
            </View>

            <View style={styles.readingContent}>
              {/* Document with scanning beam line */}
              <View style={styles.readingDocCard}>
                <View style={styles.readingDocLineHeader} />
                <View style={styles.readingDocLine} />
                <View style={styles.readingDocHighlight} />
                <View style={styles.readingDocLine} />
                {/* Horizontal glowing orange beam */}
                <View style={styles.orangeScanBeam} />
                <View style={styles.readingDocLine} />
                <View style={styles.readingDocLine} />
              </View>

              {/* Status List */}
              <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <Feather name="check-circle" size={18} color="#2EC4B6" />
                  <Text style={styles.statusRowText}>Uploaded securely</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusRow}>
                  <Feather name="check-circle" size={18} color="#2EC4B6" />
                  <Text style={styles.statusRowText}>Reading the text</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusRow}>
                  <Feather name="loader" size={18} color="#F0913A" />
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
                <Feather name="lock" size={14} color="#8E9BAE" />
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
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.circleBtnPlaceholder} />
              <TouchableOpacity onPress={handleCancelAll} activeOpacity={0.7}>
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
                  <Feather name="file-text" size={24} color="#C4D1DF" />
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
                        <Feather name="check" size={14} color="#0A131F" />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="calendar" size={12} color="#3A8EF0" />
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
                        <Feather name="check" size={14} color="#0A131F" />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="check-square" size={12} color="#F0913A" />
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
                        <Feather name="check" size={14} color="#0A131F" />
                      )}
                    </View>
                    <View style={styles.foundItemInfo}>
                      <View style={styles.typeBadgeRow}>
                        <Feather name="bell" size={12} color="#9D65E5" />
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
                <Feather name="chevron-left" size={20} color="#FFFFFF" />
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
                    <Feather name="check" size={14} color="#0A131F" />
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
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>When</Text>
                  <Text style={styles.reviewRowVal}>
                    Fri, 6 Nov · 3:00–3:45 PM
                  </Text>
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Where</Text>
                  <Text style={styles.reviewRowVal}>
                    St. Mary's School, Room 12
                  </Text>
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Invite</Text>
                  <Text style={styles.reviewRowVal}>Rohan, Priya</Text>
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
                </View>
              </View>

              {/* Task card */}
              <View style={[styles.reviewGroupCard, styles.mt16]}>
                <View style={styles.reviewGroupHeader}>
                  <View style={styles.checkBoxSquareChecked}>
                    <Feather name="check" size={14} color="#0A131F" />
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
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
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
                    color="#F0913A"
                    style={styles.ml6}
                  />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Assign to</Text>
                  <Text style={styles.reviewRowVal}>Rohan</Text>
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
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
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
                </View>
                <View style={styles.foundItemDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>When</Text>
                  <Text style={styles.reviewRowVal}>Thu, 5 Nov · 7:00 PM</Text>
                  <Feather name="chevron-right" size={16} color="#5C6E82" />
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
                  <Feather name="check" size={28} color="#2EC4B6" />
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
                      <Feather name="calendar" size={18} color="#3A8EF0" />
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
                      <Feather name="chevron-right" size={14} color="#F0913A" />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedItems.task && (
                  <>
                    <View style={styles.foundItemDivider} />
                    <View style={styles.successItemRow}>
                      <View style={styles.taskIconCircle}>
                        <Feather name="check-square" size={18} color="#F0913A" />
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
                        <Feather name="chevron-right" size={14} color="#F0913A" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <Text style={styles.vaultNote}>
                The circular is saved in Family Vault › School.
              </Text>
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
    backgroundColor: '#0B1A2F',
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
    borderBottomColor: '#162434',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPlaceholder: {
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ignoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
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
    borderColor: '#1D3045',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2EC4B6',
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    borderColor: '#F0913A',
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
    backgroundColor: '#EBE7DF',
    borderRadius: 8,
    padding: 16,
    transform: [{ rotate: '1.5deg' }],
  },
  paperLineHeader: {
    height: 12,
    width: '65%',
    backgroundColor: '#7A766F',
    borderRadius: 3,
    marginBottom: 16,
  },
  paperLineLong: {
    height: 6,
    width: '90%',
    backgroundColor: '#B5B1A8',
    borderRadius: 2,
    marginBottom: 8,
  },
  paperLineMedium: {
    height: 6,
    width: '75%',
    backgroundColor: '#B5B1A8',
    borderRadius: 2,
    marginBottom: 8,
  },
  paperLineShort: {
    height: 6,
    width: '50%',
    backgroundColor: '#B5B1A8',
    borderRadius: 2,
    marginBottom: 8,
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#112030',
    borderRadius: 20,
    padding: 3,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1A2C3E',
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  modeBtnActive: {
    backgroundColor: '#F0913A',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E9BAE',
  },
  modeBtnTextActive: {
    color: '#0A131F',
    fontWeight: '700',
  },
  cameraBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
  },
  thumbWrap: {
    position: 'relative',
  },
  thumbBox: {
    width: 44,
    height: 54,
    backgroundColor: '#EBE7DF',
    borderRadius: 6,
  },
  thumbBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F0913A',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F0913A',
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
    backgroundColor: '#EBE7DF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    marginBottom: 24,
    overflow: 'hidden',
  },
  readingDocLineHeader: {
    height: 12,
    width: '60%',
    backgroundColor: '#7A766F',
    borderRadius: 3,
    marginBottom: 14,
  },
  readingDocLine: {
    height: 6,
    width: '90%',
    backgroundColor: '#B5B1A8',
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
    backgroundColor: '#F0913A',
    shadowColor: '#F0913A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  statusCard: {
    width: '100%',
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
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
    color: '#8E9BAE',
    marginLeft: 12,
    fontWeight: '500',
  },
  statusDivider: {
    height: 1,
    backgroundColor: '#17283B',
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
    backgroundColor: '#16273A',
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    width: '70%',
    height: '6%',
    backgroundColor: '#F0913A',
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0913A',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  lockText: {
    fontSize: 12,
    color: '#7D8B9B',
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#142232',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0913A',
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
    color: '#F0913A',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  docInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112030',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#192C3E',
    marginBottom: 14,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#16273B',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  docSub: {
    fontSize: 12,
    color: '#7D8B9B',
  },
  summaryCard: {
    backgroundColor: '#112030',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#192C3E',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7D8B9B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 13,
    color: '#C4D1DF',
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
    color: '#FFFFFF',
  },
  itemsSelectedCount: {
    fontSize: 12,
    color: '#7D8B9B',
    fontWeight: '500',
  },
  itemsContainerCard: {
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
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
    borderColor: '#4A5B70',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSquareChecked: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
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
    color: '#3A8EF0',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  taskTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0913A',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  reminderTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9D65E5',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  foundItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  foundItemSub: {
    fontSize: 12,
    color: '#7D8B9B',
  },
  foundItemDivider: {
    height: 1,
    backgroundColor: '#18293B',
  },
  pillGreen: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2EC4B6',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillGreenText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2EC4B6',
  },
  pillOrange: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0913A',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillOrangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F0913A',
  },
  pillGrey: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D5066',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillGreyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E9BAE',
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#142232',
  },
  reviewEditBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A3D54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewEditBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addItemsBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateSheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  dateSheet: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
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
  dateSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateSheetSub: {
    fontSize: 13,
    color: '#8E9BAE',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  quoteBox: {
    backgroundColor: '#EBE7DF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    color: '#1A2432',
    textAlign: 'center',
    fontWeight: '500',
  },
  dateOptionCard: {
    backgroundColor: '#112030',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1B2C3E',
    marginBottom: 10,
  },
  dateOptionCardActive: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  dateOptionTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  dateOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateOptionSub: {
    fontSize: 12,
    color: '#7D8B9B',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4A5B70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#F0913A',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0913A',
  },
  useDateBtn: {
    backgroundColor: '#F0913A',
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
    color: '#FFFFFF',
  },
  pickAnotherDateBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pickAnotherDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
  },
  reviewSub: {
    fontSize: 13,
    color: '#8E9BAE',
    marginBottom: 16,
  },
  reviewGroupCard: {
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
    overflow: 'hidden',
  },
  reviewGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#18293B',
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
    color: '#8E9BAE',
    width: 70,
  },
  reviewRowVal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
    borderColor: '#2EC4B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#2EC4B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#8E9BAE',
    marginBottom: 24,
  },
  successItemsCard: {
    width: '100%',
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  successItemSub: {
    fontSize: 12,
    color: '#7D8B9B',
  },
  navLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F0913A',
    marginRight: 2,
  },
  vaultNote: {
    fontSize: 12,
    color: '#65778C',
    textAlign: 'center',
  },
  donePrimaryBtn: {
    backgroundColor: '#F0913A',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  donePrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scanAnotherBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  scanAnotherText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
  },
  spacer16: {
    height: 16,
  },
  statusFindingText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quoteHighlightedDate: {
    color: '#F0913A',
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
    color: '#F0913A',
  },
});
