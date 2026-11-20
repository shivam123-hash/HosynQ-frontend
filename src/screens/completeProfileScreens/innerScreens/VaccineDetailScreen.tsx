import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  AppDateTimePicker,
  AppImagePickerBottomSheet,
  AppConfirmationModal,
  ThreeDotsLoader,
} from '../../../components';
import { VaccineRecord } from './VaccinationScreen';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  updateLifeProfileSectionThunk,
  fetchLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
  deleteVaccineThunk,
} from '../../../redux/features/lifeProfile/lifeProfileSlice';
import { getMyMemberId } from '../../../units/asyncStorageManager';
import {
  mapDoseToEnum,
  mapEnumToDoseLabel,
  toIsoDateString,
  formatDisplayDate,
  isValidUuid,
} from './vaccinationPayloadUtils';
import lifeProfileServices from '../../../services/lifeProfileServices';

export interface VaccineDoseItem {
  id: string;
  yearTitle: string; // e.g. "Dose 1" or "2025 dose"
  doseEnum?: string;
  givenDate: string; // e.g. "19 Nov 2025"
  rawGivenDate?: string; // ISO date e.g. "2025-11-19"
  clinicOrPlace: string; // e.g. "Little Steps Clinic" or "No certificate"
  hasCertificate: boolean;
  batchNumber?: string;
  scanId?: string;
  nextDue?: string;
}

export interface VaccineDetailScreenProps {
  memberId?: string;
  vaccineId?: string;
  vaccine?: Partial<VaccineRecord> | any;
  childName?: string;
  onBack?: () => void;
  onEditVaccine?: () => void;
  onBookAppointment?: () => void;
  onSaveDose?: (newDose: VaccineDoseItem) => void;
}

const DEFAULT_DOSES: VaccineDoseItem[] = [
  {
    id: 'dose-2025',
    yearTitle: '2025 dose',
    givenDate: '14 Nov 2025',
    rawGivenDate: '2025-11-14',
    clinicOrPlace: 'Little Steps Clinic',
    hasCertificate: true,
    batchNumber: 'FLU25-8841',
  },
  {
    id: 'dose-2024',
    yearTitle: '2024 dose',
    givenDate: '10 Nov 2024',
    rawGivenDate: '2024-11-10',
    clinicOrPlace: 'Little Steps Clinic',
    hasCertificate: true,
    batchNumber: 'FLU24-7120',
  },
  {
    id: 'dose-2023',
    yearTitle: '2023 dose',
    givenDate: '6 Nov 2023',
    rawGivenDate: '2023-11-06',
    clinicOrPlace: 'No certificate',
    hasCertificate: false,
  },
];

const formatModalDate = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  return `Today, ${dayName} ${dayNum} ${monthName}`;
};

const formatNextDueDate = (date: Date): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const VaccineDetailScreen: React.FC<VaccineDetailScreenProps> = ({
  memberId,
  vaccineId: propVaccineId,
  vaccine,
  childName = 'Aarav',
  onBack,
  onEditVaccine,
  onBookAppointment,
  onSaveDose,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const familyState = useAppSelector((state: any) => state.family);
  const rawMembers: any[] =
    familyState?.myFamilyData?.family?.members ||
    familyState?.family?.members ||
    familyState?.familyData?.family?.members ||
    [];
  const familyMembers = useMemo(() => rawMembers, [familyState]);

  const resolvedVaccineId = propVaccineId || vaccine?.id || vaccine?._id || '';

  const [vaccineName, setVaccineName] = useState<string>(vaccine?.name || 'Vaccine');
  const [scheduleLabel, setScheduleLabel] = useState<string>(
    vaccine?.dose ? mapEnumToDoseLabel(vaccine.dose) : 'Yearly dose'
  );
  const [reminderText, setReminderText] = useState<string>('2 weeks before');
  const [reminderAvatars, setReminderAvatars] = useState<
    { initial: string; color: string }[]
  >([]);
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);

  // Doses array initialized with default doses for new view, overwritten by API
  const [doses, setDoses] = useState<VaccineDoseItem[]>(DEFAULT_DOSES);
  const [selectedDoseId, setSelectedDoseId] = useState<string | null>(null);
  const [selectedDoseYearTitle, setSelectedDoseYearTitle] = useState<string>('');
  const [pendingDoseData, setPendingDoseData] = useState<VaccineDoseItem | null>(null);

  const [isDue, setIsDue] = useState<boolean>(vaccine?.status !== 'done');
  const [dueBannerText, setDueBannerText] = useState<string>(
    'Due Sun, 15 Nov · in 3 days'
  );
  const [dueSubtext, setDueSubtext] = useState<string>(
    'Yearly dose. Book with Little Steps Clinic.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingCert, setIsUploadingCert] = useState<boolean>(false);

  // Modal State
  const [isMarkModalVisible, setIsMarkModalVisible] = useState<boolean>(false);
  const [dateGiven, setDateGiven] = useState<Date>(new Date());
  const [whereClinic, setWhereClinic] = useState<string>('Little Steps Clinic');
  const [batchNumber, setBatchNumber] = useState<string>('FLU26-0931');
  const [hasCertificate, setHasCertificate] = useState<boolean>(false);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [certificateScanId, setCertificateScanId] = useState<string>('');

  // Next Due Date state
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const [nextDueDate, setNextDueDate] = useState<Date>(nextYearDate);

  // Date Pickers state
  const [showGivenDatePicker, setShowGivenDatePicker] = useState<boolean>(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);

  // Delete Confirmation Modal state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * Apply raw vaccine record from backend / props
   */
  const applyVaccineRecord = useCallback(
    (v: any) => {
      if (!v) return;
      if (v.name) setVaccineName(v.name);
      if (v.dose) setScheduleLabel(mapEnumToDoseLabel(v.dose));

      // 1. Reminders parsing
      const leadDays =
        Array.isArray(v.reminderLeadDays) && v.reminderLeadDays.length > 0
          ? v.reminderLeadDays[0]
          : 14;
      const leadText =
        leadDays === 14
          ? '2 weeks before'
          : leadDays === 7
          ? '1 week before'
          : `${leadDays} days before`;

      const remindIds: string[] = Array.isArray(v.remindMemberIds)
        ? v.remindMemberIds
        : [];
      setAssignedMemberIds(remindIds);

      const assignedMembers = familyMembers.filter((m: any) =>
        remindIds.includes(m.memberId || m.id)
      );

      if (assignedMembers.length > 0) {
        const names = assignedMembers
          .map((m: any) => m.fullName || m.name)
          .join(', ');
        setReminderText(`${leadText} · ${names}`);
        setReminderAvatars(
          assignedMembers.map((m: any) => ({
            initial: (m.fullName || m.name || 'U').charAt(0).toUpperCase(),
            color: m.avatarColor || '#7C2D12',
          }))
        );
      } else {
        setReminderText(`${leadText} · No family member assigned`);
        setReminderAvatars([]);
      }

      // 2. Next due calculation
      if (v.nextDueOn) {
        const nextDate = new Date(v.nextDueOn);
        if (!isNaN(nextDate.getTime())) {
          setNextDueDate(nextDate);
          const daysLeft = Math.ceil(
            (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysLeft < 0) {
            setDueBannerText(`Overdue · was due ${formatDisplayDate(v.nextDueOn)}`);
          } else {
            setDueBannerText(`Due ${formatDisplayDate(v.nextDueOn)} · in ${daysLeft} days`);
          }
          setDueSubtext(
            `${v.dose ? mapEnumToDoseLabel(v.dose) : 'Dose 1'}. Book with Little Steps Clinic.`
          );
          setIsDue(true);
        }
      } else if (v.status === 'DUE' || v.status === 'due') {
        setIsDue(true);
        setDueBannerText('Due Sun, 15 Nov · in 3 days');
        setDueSubtext(
          `${v.dose ? mapEnumToDoseLabel(v.dose) : 'Yearly dose'}. Book with Little Steps Clinic.`
        );
      } else {
        setIsDue(false);
        setDueBannerText('All doses complete · Up to date');
        setDueSubtext('Next dose scheduled or complete');
      }

      // 3. Doses history mapping (strictly from API)
      if (Array.isArray(v.doses)) {
        const mapped: VaccineDoseItem[] = v.doses.map((d: any, idx: number) => ({
          id: d.id || d._id || `dose-${idx}`,
          doseEnum: d.dose,
          yearTitle: d.dose
            ? mapEnumToDoseLabel(d.dose)
            : d.givenOn
            ? `${new Date(d.givenOn).getFullYear()} dose`
            : `Dose ${idx + 1}`,
          givenDate: formatDisplayDate(d.givenOn) || d.givenOn || '',
          rawGivenDate: d.givenOn,
          clinicOrPlace:
            d.givenAt ||
            (d.certificateScanId || d.certificateFile || d.fileId
              ? 'Certificate attached'
              : 'No certificate'),
          hasCertificate: Boolean(
            d.certificateScanId || d.certificateFile || d.fileId
          ),
          batchNumber: d.batchNumber || '',
          scanId: d.certificateScanId || d.fileId || '',
        }));
        setDoses(mapped);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadVaccineData = useCallback(async () => {
    try {
      setIsLoading(true);
      let targetMemberId = memberId;
      if (!targetMemberId || targetMemberId === 'me') {
        const stored = await getMyMemberId();
        if (stored) targetMemberId = stored;
      }
      const targetVaccineId = resolvedVaccineId;

      if (targetMemberId && targetVaccineId) {
        console.log(
          `[VaccineDetail] GET /api/v1/family/members/${targetMemberId}/life-profile?section=vaccination&vaccineId=${targetVaccineId}`
        );
        const res = await lifeProfileServices.getLifeProfile(targetMemberId, {
          section: 'vaccination',
          vaccineId: targetVaccineId,
        });

        console.log('[VaccineDetail] Raw Response data:', res?.data);

        const v =
          res?.data?.vaccination?.vaccine ||
          res?.data?.vaccine ||
          res?.vaccine ||
          res?.data?.vaccination?.vaccines?.find(
            (item: any) =>
              item.id === targetVaccineId || item._id === targetVaccineId
          ) ||
          res?.data?.vaccination?.vaccines?.[0] ||
          res?.vaccination?.vaccines?.[0];

        if (v) {
          applyVaccineRecord(v);
        }
      }
    } catch (e) {
      console.log('[VaccineDetail] Failed to load vaccine details from API:', e);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, resolvedVaccineId]);

  useEffect(() => {
    if (vaccine) {
      applyVaccineRecord(vaccine);
    }
    loadVaccineData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedVaccineId]);

  // Handle hardware back press on Android when dose sheet is open
  useEffect(() => {
    if (!isMarkModalVisible) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setIsMarkModalVisible(false);
        return true;
      }
    );
    return () => subscription.remove();
  }, [isMarkModalVisible]);

  const handleOpenCertificate = (dose: VaccineDoseItem) => {
    Alert.alert(
      'Vaccine Certificate',
      `Certificate for ${dose.yearTitle} (${vaccineName}) at ${dose.clinicOrPlace}.${
        dose.scanId ? `\nScan ID: ${dose.scanId}` : ''
      }`,
      [{ text: 'OK' }]
    );
  };

  const handleBook = () => {
    if (onBookAppointment) {
      onBookAppointment();
    } else {
      Alert.alert(
        'Book Appointment',
        `Book appointment for ${vaccineName} with Little Steps Clinic.`,
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Tap on a Dose History Card:
   * Selects that dose card (highlights with darker background and orange indicator)
   * and opens the modal pre-populated with this dose's data.
   */
  const handleDoseCardPress = (doseItem: VaccineDoseItem) => {
    setSelectedDoseId(doseItem.id);
    setSelectedDoseYearTitle(doseItem.yearTitle);

    if (doseItem.rawGivenDate) {
      const parsed = new Date(doseItem.rawGivenDate);
      if (!isNaN(parsed.getTime())) {
        setDateGiven(parsed);
      }
    } else {
      setDateGiven(new Date());
    }

    setWhereClinic(
      doseItem.clinicOrPlace && doseItem.clinicOrPlace !== 'No certificate'
        ? doseItem.clinicOrPlace
        : 'Little Steps Clinic'
    );
    setBatchNumber(doseItem.batchNumber || '');
    setHasCertificate(doseItem.hasCertificate);
    setCertificateScanId(doseItem.scanId || '');
    setCertificateName(doseItem.hasCertificate ? 'Certificate attached' : null);

    setIsMarkModalVisible(true);
  };

  /**
   * Tap on bottom "Mark this year's dose as given":
   * If pending data exists or selected, calls PATCH.
   * Otherwise opens modal for new dose entry.
   */
  const handleOpenNewDoseModal = () => {
    setSelectedDoseId(null);
    setSelectedDoseYearTitle(scheduleLabel || `${new Date().getFullYear()} dose`);
    setDateGiven(new Date());
    setWhereClinic('Little Steps Clinic');
    setBatchNumber('');
    setHasCertificate(false);
    setCertificateScanId('');
    setCertificateName(null);

    const nextYr = new Date();
    nextYr.setFullYear(nextYr.getFullYear() + 1);
    setNextDueDate(nextYr);

    setIsMarkModalVisible(true);
  };

  /**
   * Modal Save Dose:
   * Stores entered dose info, marks as pending, and closes modal.
   */
  const handleSaveModalDose = () => {
    const formattedGivenDate = `${dateGiven.getDate()} ${
      [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ][dateGiven.getMonth()]
    } ${dateGiven.getFullYear()}`;

    const newDose: VaccineDoseItem = {
      id: selectedDoseId || `pending-${Date.now()}`,
      yearTitle: selectedDoseYearTitle || scheduleLabel || `${dateGiven.getFullYear()} dose`,
      doseEnum: mapDoseToEnum(selectedDoseYearTitle || scheduleLabel),
      givenDate: formattedGivenDate,
      rawGivenDate: toIsoDateString(dateGiven) || new Date().toISOString().slice(0, 10),
      clinicOrPlace: whereClinic.trim() || 'Little Steps Clinic',
      hasCertificate: Boolean(certificateScanId || hasCertificate || certificateName),
      batchNumber: batchNumber.trim() || 'FLU26-0931',
      scanId: isValidUuid(certificateScanId) ? certificateScanId : undefined,
      nextDue: formatNextDueDate(nextDueDate),
    };

    setPendingDoseData(newDose);

    setDoses((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === newDose.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newDose;
        return updated;
      }
      return [newDose, ...prev];
    });

    setIsMarkModalVisible(false);
    onSaveDose?.(newDose);
  };

  /**
   * Bottom button: "Mark this year's dose as given"
   * Triggers the PATCH /life-profile API with the scanId and dose data.
   */
  const handleMarkGivenPress = async () => {
    // If no pending dose entered yet, open modal first so user can fill dose & certificate
    if (!pendingDoseData) {
      handleOpenNewDoseModal();
      return;
    }

    setIsSaving(true);
    try {
      let targetMemberId = memberId;
      if (!targetMemberId || targetMemberId === 'me') {
        const stored = await getMyMemberId();
        if (stored) targetMemberId = stored;
      }

      const targetVaccineId = resolvedVaccineId || vaccine?.id || 'v-vaccine';
      const doseEnum = mapDoseToEnum(
        pendingDoseData?.yearTitle || scheduleLabel || 'DOSE_1'
      );
      const givenOnIso =
        pendingDoseData?.rawGivenDate ||
        toIsoDateString(dateGiven) ||
        new Date().toISOString().slice(0, 10);
      const nextDueOnIso = toIsoDateString(nextDueDate) || null;

      const doseItemPayload: Record<string, any> = {
        dose: doseEnum,
        givenOn: givenOnIso,
      };

      if (selectedDoseId && isValidUuid(selectedDoseId)) {
        doseItemPayload.id = selectedDoseId;
      }

      const clinic = pendingDoseData?.clinicOrPlace || whereClinic.trim();
      if (clinic && clinic !== 'No certificate') {
        doseItemPayload.givenAt = clinic;
      }
      const bNumber = pendingDoseData?.batchNumber || batchNumber.trim();
      if (bNumber) {
        doseItemPayload.batchNumber = bNumber;
      }
      const scanId = pendingDoseData?.scanId || certificateScanId;
      if (isValidUuid(scanId)) {
        doseItemPayload.certificateScanId = scanId;
      }

      const vaccinePatchItem: Record<string, any> = {
        id: targetVaccineId,
        dose: doseEnum,
        nextDueOn: nextDueOnIso,
        doses: [doseItemPayload],
      };

      console.log('====================================');
      console.log(
        `[VaccineDetail] Executing PATCH /api/v1/family/members/${targetMemberId}/life-profile:`
      );
      console.log(
        JSON.stringify(
          {
            vaccination: {
              vaccines: [vaccinePatchItem],
            },
          },
          null,
          2
        )
      );
      console.log('====================================');

      if (targetMemberId) {
        await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload: {
              vaccination: {
                vaccines: [vaccinePatchItem],
              },
            },
          })
        ).unwrap();

        // Refresh Redux & full life profile in background
        dispatch(
          fetchLifeProfileSectionThunk({
            memberId: targetMemberId,
            section: 'vaccination',
          })
        );
        dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId }));

        // Refresh vaccine details from GET API
        await loadVaccineData();
      }

      setIsDue(false);
      setPendingDoseData(null);
      Alert.alert('Success', 'Vaccine dose marked as given successfully.');
    } catch (err: any) {
      console.log('[VaccineDetail] Error saving dose via PATCH:', err);
      Alert.alert('Error', err?.message || 'Failed to update vaccine dose.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCertificate = () => {
    setShowImagePicker(true);
  };

  const handleConfirmDeleteVaccine = async () => {
    const vId = resolvedVaccineId || vaccine?.id;
    if (!vId) {
      setIsDeleteModalVisible(false);
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`[VaccineDetail] Executing DELETE /api/v1/family/vaccines/${vId}`);
      await dispatch(deleteVaccineThunk({ vaccineId: vId })).unwrap();

      let targetMemberId = memberId;
      if (!targetMemberId || targetMemberId === 'me') {
        const stored = await getMyMemberId();
        if (stored) targetMemberId = stored;
      }

      if (targetMemberId) {
        dispatch(
          fetchLifeProfileSectionThunk({
            memberId: targetMemberId,
            section: 'vaccination',
          })
        );
        dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId }));
      }

      setIsDeleteModalVisible(false);
      if (onBack) {
        onBack();
      }
    } catch (err: any) {
      console.log('[VaccineDetail] Delete vaccine error:', err);
      setIsDeleteModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Main Screen Content */}
      <View
        style={[
          styles.mainContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Top Header */}
        <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.headerCircleBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {vaccineName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {`${childName} · Vaccination`}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDeleteModalVisible(true)}
          style={[styles.headerCircleBtn, styles.headerDeleteBtn]}
          accessibilityRole="button"
          accessibilityLabel="Delete vaccine"
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Due Banner Card (Orange Border) */}
        <View style={[styles.dueCard, !isDue && styles.dueCardCompleted]}>
          <View style={styles.dueCardLeft}>
            <View style={styles.dueIconBadge}>
              <Ionicons
                name="eyedrop-outline"
                size={18}
                color={isDue ? '#F0913A' : '#10B981'}
                style={styles.syringeIcon}
              />
            </View>

            <View style={styles.dueTextContainer}>
              <Text style={styles.dueTitleText}>{dueBannerText}</Text>
              <Text style={styles.dueSubText}>{dueSubtext}</Text>
            </View>
          </View>

          {isDue && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBook}
              style={styles.bookBtn}
              accessibilityRole="button"
              accessibilityLabel="Book appointment"
            >
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule & Reminder Group Card */}
        <View style={styles.groupCard}>
          {/* Row 1: Schedule */}
          <View style={styles.groupCardRow}>
            <View style={styles.groupCardIconCol}>
              <Feather name="repeat" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.groupCardContentCol}>
              <Text style={styles.groupCardLabel}>Schedule</Text>
              <Text style={styles.groupCardValue}>{scheduleLabel}</Text>
            </View>
          </View>

          {/* Row Divider */}
          <View style={styles.groupCardDivider} />

          {/* Row 2: Reminder */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.groupCardRow}
            onPress={() => {
              Alert.alert('Reminder Settings', reminderText);
            }}
          >
            <View style={styles.groupCardIconCol}>
              <Feather name="bell" size={17} color="#8E9BAE" />
            </View>

            <View style={styles.groupCardContentCol}>
              <Text style={styles.groupCardLabel}>Reminder</Text>
              <View style={styles.reminderDetailsRow}>
                {reminderAvatars.map((av, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.avatarPill,
                      { backgroundColor: av.color || '#1E3A5F' },
                    ]}
                  >
                    <Text style={styles.avatarPillText}>{av.initial}</Text>
                  </View>
                ))}
                <Text style={styles.reminderValueText} numberOfLines={1}>
                  {reminderText}
                </Text>
              </View>
            </View>

            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Section Heading: DOSE HISTORY */}
        <Text style={styles.sectionHeader}>DOSE HISTORY</Text>

        {/* Dose History List */}
        <View style={styles.doseHistoryCard}>
          {doses.length > 0 ? (
            doses.map((doseItem, index) => {
              const hasCert = doseItem.hasCertificate;
              const isSelected = selectedDoseId === doseItem.id;

              return (
                <View key={doseItem.id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDoseCardPress(doseItem)}
                    style={[
                      styles.doseItemRow,
                      isSelected && styles.doseItemRowSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Dose history for ${doseItem.yearTitle}`}
                  >
                    {/* Syringe Badge Icon */}
                    <View
                      style={[
                        styles.doseBadge,
                        hasCert ? styles.doseBadgeTeal : styles.doseBadgeMuted,
                        isSelected && styles.doseBadgeSelected,
                      ]}
                    >
                      <Ionicons
                        name="eyedrop-outline"
                        size={18}
                        color={
                          hasCert ? '#10B981' : isSelected ? '#F0913A' : '#64748B'
                        }
                        style={styles.syringeIcon}
                      />
                    </View>

                    {/* Dose Title & Clinic Details */}
                    <View style={styles.doseTextCol}>
                      <Text
                        style={[
                          styles.doseYearTitle,
                          isSelected && styles.doseYearTitleSelected,
                        ]}
                      >
                        {doseItem.yearTitle}
                      </Text>
                      <Text style={styles.doseSubtitle}>
                        {`Given ${doseItem.givenDate}${
                          doseItem.clinicOrPlace ? ` · ${doseItem.clinicOrPlace}` : ''
                        }`}
                      </Text>
                    </View>

                    {/* Paperclip Certificate Action */}
                    {hasCert ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleOpenCertificate(doseItem);
                        }}
                        style={styles.paperclipCircleBtn}
                        accessibilityRole="button"
                        accessibilityLabel={`View certificate for ${doseItem.yearTitle}`}
                      >
                        <Feather name="paperclip" size={15} color="#F0913A" />
                      </TouchableOpacity>
                    ) : null}
                  </TouchableOpacity>

                  {index < doses.length - 1 && (
                    <View style={styles.doseItemDivider} />
                  )}
                </View>
              );
            })
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenNewDoseModal}
              style={styles.emptyDosesCard}
            >
              <Ionicons
                name="eyedrop-outline"
                size={22}
                color="#F0913A"
                style={styles.syringeIcon}
              />
              <Text style={styles.emptyDosesTitle}>No doses recorded yet</Text>
              <Text style={styles.emptyDosesSubtext}>
                Tap here or the button below to record your first dose.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Area */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleMarkGivenPress}
          disabled={isSaving}
          style={styles.markGivenBtn}
          accessibilityRole="button"
          accessibilityLabel="Mark this year's dose as given"
        >
          {isSaving ? (
            <ThreeDotsLoader color="#FFFFFF" size={6} spacing={4} />
          ) : (
            <>
              <Feather
                name="check"
                size={18}
                color="#FFFFFF"
                style={styles.checkIcon}
              />
              <Text style={styles.markGivenBtnText}>
                Mark this year's dose as given
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEditVaccine}
          style={styles.editVaccineBtn}
          accessibilityRole="button"
          accessibilityLabel="Edit vaccine"
        >
          <Text style={styles.editVaccineText}>Edit vaccine</Text>
        </TouchableOpacity>
      </View>
      </View>

      {/* ============================================================== */}
      {/* OVERLAY: Mark dose as given (In-screen sheet avoids iOS modal lock) */}
      {/* ============================================================== */}
      {isMarkModalVisible && (
        <View style={styles.modalOverlayWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsMarkModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalKeyboardAvoid}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.modalSheet,
                  { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
                onPress={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <View style={styles.modalHandle} />

                {/* Title & Subtitle */}
                <Text style={styles.modalTitle}>
                  {selectedDoseYearTitle
                    ? selectedDoseYearTitle.toLowerCase().includes('dose')
                      ? `Mark ${selectedDoseYearTitle} as given`
                      : `Mark ${selectedDoseYearTitle} dose as given`
                    : `Mark ${dateGiven.getFullYear()} dose as given`}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {`${vaccineName} · ${childName}`}
                </Text>

                {/* Field 1: Date given */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowGivenDatePicker(true)}
                  style={styles.modalDateCard}
                  accessibilityRole="button"
                  accessibilityLabel="Select date given"
                >
                  <View style={styles.modalDateIconCol}>
                    <Feather name="calendar" size={18} color="#8E9BAE" />
                  </View>

                  <View style={styles.modalDateTextCol}>
                    <Text style={styles.modalFieldLabel}>Date given</Text>
                    <Text style={styles.modalFieldValue}>
                      {formatModalDate(dateGiven)}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color="#64748B" />
                </TouchableOpacity>

                {/* Field 2: Where (optional) */}
                <Text style={styles.modalSectionLabel}>Where (optional)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={whereClinic}
                  onChangeText={setWhereClinic}
                  placeholder="Little Steps Clinic"
                  placeholderTextColor="#64748B"
                />

                {/* Field 3: Batch number (optional) */}
                <Text style={styles.modalSectionLabel}>
                  Batch number (optional)
                </Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={batchNumber}
                  onChangeText={setBatchNumber}
                  placeholder="FLU26-0931"
                  placeholderTextColor="#64748B"
                />
                <Text style={styles.modalHelperText}>
                  On the vaccine sticker or card
                </Text>

                {/* Field 4: Add certificate (Document Scanner Flow) */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddCertificate}
                  disabled={isUploadingCert}
                  style={[
                    styles.addCertBtn,
                    (hasCertificate || certificateName || certificateScanId) &&
                      styles.addCertBtnActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add certificate"
                >
                  {isUploadingCert ? (
                    <>
                      <ThreeDotsLoader
                        color="#F0913A"
                        size={5}
                        spacing={3}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.addCertBtnText}>
                        Uploading certificate...
                      </Text>
                    </>
                  ) : hasCertificate || certificateName || certificateScanId ? (
                    <>
                      <Feather
                        name="check"
                        size={16}
                        color="#10B981"
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.addCertBtnText,
                          { color: '#10B981', flex: 1 },
                        ]}
                        numberOfLines={1}
                      >
                        {certificateName || 'Certificate attached'}
                      </Text>
                      <Feather name="paperclip" size={15} color="#10B981" />
                    </>
                  ) : (
                    <>
                      <Feather name="paperclip" size={16} color="#F0913A" />
                      <Text style={styles.addCertBtnText}>Add certificate</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Field 5: Next due · suggested */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowNextDatePicker(true)}
                  style={styles.modalNextDueCard}
                  accessibilityRole="button"
                  accessibilityLabel="Select next due date"
                >
                  <View style={styles.modalDateIconCol}>
                    <Ionicons
                      name="sparkles-outline"
                      size={17}
                      color="#8E9BAE"
                    />
                  </View>

                  <View style={styles.modalDateTextCol}>
                    <Text style={styles.modalFieldLabel}>
                      Next due · suggested
                    </Text>
                    <Text style={styles.modalFieldValue}>
                      {formatNextDueDate(nextDueDate)}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color="#64748B" />
                </TouchableOpacity>

                {/* Action Button: Save dose */}
                <CommonBtn
                  title="Save dose"
                  onPress={handleSaveModalDose}
                  containerStyle={styles.saveDoseBtn}
                />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Picker for Date Given */}
      <AppDateTimePicker
        visible={showGivenDatePicker}
        mode="date"
        date={dateGiven}
        maximumDate={new Date()}
        onConfirm={(selectedDate) => {
          setShowGivenDatePicker(false);
          setDateGiven(selectedDate);
        }}
        onCancel={() => setShowGivenDatePicker(false)}
      />

      {/* Date Picker for Next Due */}
      <AppDateTimePicker
        visible={showNextDatePicker}
        mode="date"
        date={nextDueDate}
        minimumDate={new Date()}
        onConfirm={(selectedDate) => {
          setShowNextDatePicker(false);
          setNextDueDate(selectedDate);
        }}
        onCancel={() => setShowNextDatePicker(false)}
      />

      {/* Reusable Image/Certificate Picker Bottom Sheet (Document Scan integration) */}
      <AppImagePickerBottomSheet
        visible={showImagePicker}
        title="Upload Vaccine Certificate"
        subtitle="Take a photo or choose an image from your gallery"
        onSelectImage={async (image) => {
          setShowImagePicker(false);
          setIsUploadingCert(true);
          const fileName = image.fileName || 'Vaccine_Certificate.jpg';
          setCertificateName(fileName);

          try {
            let targetMemberId = memberId;
            if (!targetMemberId || targetMemberId === 'me') {
              const stored = await getMyMemberId();
              if (stored) targetMemberId = stored;
            }

            if (targetMemberId) {
              const formData = new FormData();
              formData.append('file', {
                uri: image.path.startsWith('file://')
                  ? image.path
                  : `file://${image.path}`,
                name: fileName,
                type: image.mime || 'image/jpeg',
              } as any);
              formData.append('type', 'OTHER');
              formData.append('skipRead', 'true');

              console.log(
                `[VaccineDetail] Uploading certificate file to /documents/scan for member ${targetMemberId}...`
              );
              const result = await lifeProfileServices.scanDocument(
                targetMemberId,
                formData
              );
              console.log('[VaccineDetail] Certificate scan response:', result);

              const newScanId =
                result?.scanId ||
                result?.data?.scanId ||
                result?.document?.scanId ||
                result?.data?.document?.scanId ||
                result?.id ||
                result?.data?.id ||
                '';

              if (isValidUuid(newScanId)) {
                setCertificateScanId(newScanId);
              } else {
                setCertificateScanId('');
              }
              setHasCertificate(true);
            } else {
              setCertificateScanId('');
              setHasCertificate(true);
            }
          } catch (uploadErr) {
            console.log('[VaccineDetail] Upload certificate failed:', uploadErr);
            setCertificateScanId('');
            setHasCertificate(true);
          } finally {
            setIsUploadingCert(false);
          }
        }}
        onClose={() => setShowImagePicker(false)}
      />

      {/* Delete Vaccine Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete vaccine?"
        message={`Are you sure you want to delete "${vaccineName}"? This will remove all its doses and reminders.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        iconName="trash-2"
        onConfirm={handleConfirmDeleteVaccine}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default VaccineDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08111E',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1D30',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dueCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  dueCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueIconBadge: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syringeIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  dueTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  dueTitleText: {
    fontSize: RFValue(14.5),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dueSubText: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
    lineHeight: 17,
  },
  bookBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookBtnText: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupCard: {
    backgroundColor: '#0F1D30',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingVertical: 4,
    marginBottom: 20,
  },
  groupCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupCardIconCol: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  groupCardContentCol: {
    flex: 1,
  },
  groupCardLabel: {
    fontSize: RFValue(11.5),
    color: '#8E9BAE',
    marginBottom: 2,
  },
  groupCardValue: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupCardDivider: {
    height: 1,
    backgroundColor: '#1E324A',
    marginLeft: 52,
  },
  reminderDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  avatarPillText: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderValueText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    flex: 1,
  },
  sectionHeader: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  doseHistoryCard: {
    backgroundColor: '#0F1D30',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingVertical: 4,
    overflow: 'hidden',
  },
  doseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  doseItemRowSelected: {
    backgroundColor: '#060E1A',
    borderLeftWidth: 3.5,
    borderLeftColor: '#F0913A',
  },
  doseBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  doseBadgeTeal: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  doseBadgeMuted: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  doseBadgeSelected: {
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
    borderColor: '#F0913A',
  },
  doseTextCol: {
    flex: 1,
  },
  doseYearTitle: {
    fontSize: RFValue(14.5),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  doseYearTitleSelected: {
    color: '#F0913A',
  },
  doseSubtitle: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
  },
  paperclipCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16273C',
    borderWidth: 1,
    borderColor: '#223852',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  doseItemDivider: {
    height: 1,
    backgroundColor: '#1E324A',
    marginLeft: 72,
  },
  emptyDosesCard: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDosesTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyDosesSubtext: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#08111E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  markGivenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary || '#F0913A',
  },
  checkIcon: {
    marginRight: 8,
  },
  markGivenBtnText: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editVaccineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  editVaccineText: {
    fontSize: RFValue(13.5),
    fontWeight: '600',
    color: Colors.primary || '#F0913A',
  },

  // Modal styles
  modalOverlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    width: '100%',
  },
  modalSheet: {
    backgroundColor: '#0F1D30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: RFValue(13),
    color: '#8E9BAE',
    marginTop: 4,
    marginBottom: 16,
  },
  modalDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12243F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalDateIconCol: {
    marginRight: 14,
  },
  modalDateTextCol: {
    flex: 1,
  },
  modalFieldLabel: {
    fontSize: RFValue(11),
    color: '#8E9BAE',
    marginBottom: 2,
  },
  modalFieldValue: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSectionLabel: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
    marginTop: 14,
    marginBottom: 6,
  },
  modalTextInput: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingHorizontal: 16,
    fontSize: RFValue(13.5),
    color: '#FFFFFF',
  },
  modalHelperText: {
    fontSize: RFValue(11),
    color: '#60728B',
    marginTop: 6,
    marginBottom: 4,
    marginLeft: 2,
  },
  addCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#1E3A5F',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(240, 145, 58, 0.04)',
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  addCertBtnActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  addCertBtnText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: Colors.primary || '#F0913A',
  },
  modalNextDueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12243F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E324A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  saveDoseBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary || '#F0913A',
  },
});
