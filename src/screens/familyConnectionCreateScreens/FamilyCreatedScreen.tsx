import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import AppDialog from '../../components/AppDialog';
import AppDateTimePicker, { formatDate } from '../../components/AppDateTimePicker';
import { useAppDispatch, useAppSelector } from '../../redux';
import {
  addFamilyMemberThunk,
  clearAddMemberError,
  getMyFamilyThunk,
} from '../../redux/features/family/familySlice';
import {
  FamilyHeader,
  SuccessCheckmarkCircle,
  FamilyIdCard,
  InviteFamilyBottomSheet,
} from './components';

export interface FamilyCreatedScreenProps {
  familyName?: string;
  familyId?: string;
  inviterName?: string;
  onBack?: () => void;
  onShareInvite?: () => void;
  onGoHome?: () => void;
  onGoToProfileComplete?: () => void;
  goToProfileText?: string;
}

const formatIsoDate = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const FamilyCreatedScreen: React.FC<FamilyCreatedScreenProps> = ({
  familyName = 'The Sharma Family',
  familyId = 'HSQ-4821',
  inviterName = 'Priya',
  onBack,
  onShareInvite,
  onGoHome,
  onGoToProfileComplete,
  goToProfileText = 'Go to profile complete',
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);
  const familyState = useAppSelector((state) => state.family);
  const { addMemberLoading, addMemberError } = familyState;

  const currentInviterName =
    inviterName !== 'Priya'
      ? inviterName
      : baseProfile?.fullName?.split(' ')[0] ||
        authUser?.name?.split(' ')[0] ||
        'Priya';

  const [isInviteSheetVisible, setIsInviteSheetVisible] = useState(false);

  // Prompt Dialog State: opens on mount
  const [showPromptDialog, setShowPromptDialog] = useState(true);

  // Add Member Bottom Sheet State
  const [isAddMemberSheetVisible, setIsAddMemberSheetVisible] = useState(false);
  const [childFullName, setChildFullName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState<Date | null>(null);
  const [childFamilyRole, setChildFamilyRole] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleOpenInviteSheet = () => {
    setIsInviteSheetVisible(true);
  };

  const handleCloseInviteSheet = () => {
    setIsInviteSheetVisible(false);
  };

  const handlePromptYes = () => {
    setShowPromptDialog(false);
    setChildFullName('');
    setChildBirthDate(null);
    setChildFamilyRole('');
    setModalError(null);
    dispatch(clearAddMemberError());
    setIsAddMemberSheetVisible(true);
  };

  const handlePromptNo = () => {
    setShowPromptDialog(false);
  };

  const handleConfirmAddMember = async () => {
    if (!childFullName.trim()) {
      setModalError('Please enter full name');
      return;
    }
    if (!childBirthDate) {
      setModalError('Please select birth date');
      return;
    }
    if (!childFamilyRole.trim()) {
      setModalError('Please enter role / relation');
      return;
    }

    setModalError(null);
    dispatch(clearAddMemberError());

    try {
      await dispatch(
        addFamilyMemberThunk({
          role: 'DEPENDENT_CHILD_PROFILE',
          personal: {
            fullName: childFullName.trim(),
            birthDate: formatIsoDate(childBirthDate),
            familyRole: childFamilyRole.trim(),
          },
        })
      ).unwrap();

      // Refresh family data
      await dispatch(getMyFamilyThunk());

      setIsAddMemberSheetVisible(false);
      setChildFullName('');
      setChildBirthDate(null);
      setChildFamilyRole('');
    } catch (err: any) {
      setModalError(typeof err === 'string' ? err : 'Failed to add member');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with 100% progress */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={100}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerContent}>
          {/* Success Checkmark Circle */}
          <SuccessCheckmarkCircle size={96} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {familyName}
            {'\n'}is ready
          </Text>

          <Text style={styles.subtitle}>
            Share your Family ID so everyone can join. You'll approve each
            request before they're in.
          </Text>

          {/* Family ID Box */}
          <FamilyIdCard familyId={familyId} />
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Share invite"
            onPress={handleOpenInviteSheet}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
            leftComponent={
              <Feather
                name="upload"
                size={18}
                color="#FFFFFF"
                style={styles.uploadIcon}
              />
            }
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onGoToProfileComplete || onGoHome}
            style={styles.goHomeButton}
            accessibilityRole="button"
            accessibilityLabel={goToProfileText}
          >
            <Text style={styles.goHomeText}>{goToProfileText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Invite Your Family Bottom Sheet */}
      <InviteFamilyBottomSheet
        visible={isInviteSheetVisible}
        onClose={handleCloseInviteSheet}
        familyName={familyName}
        familyId={familyId}
        inviterName={currentInviterName}
        onShareLink={onShareInvite}
      />

      {/* Dialog Popup on Screen Mount */}
      <AppDialog
        visible={showPromptDialog}
        type="confirmation"
        iconName="users"
        title="Add members without phones?"
        description="Is there someone in your home who doesn't have a phone? You can add them here."
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onPrimaryPress={handlePromptYes}
        onSecondaryPress={handlePromptNo}
        onClose={handlePromptNo}
      />

      {/* Add Dependent Member Bottom Sheet */}
      <Modal
        visible={isAddMemberSheetVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsAddMemberSheetVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboardAvoid}
        >
          <Pressable
            style={[
              styles.modalOverlay,
              Platform.OS === 'android' && keyboardHeight > 0
                ? { paddingBottom: keyboardHeight }
                : null,
            ]}
            onPress={() => setIsAddMemberSheetVisible(false)}
          >
            <Pressable
              style={[
                styles.modalContent,
                { paddingBottom: insets.bottom + 16 },
                keyboardHeight > 0 ? { maxHeight: '78%' } : null,
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.sheetHandle} />

                <Text style={styles.modalTitle}>Add Member</Text>
                <Text style={styles.modalSubtitle}>
                  Enter details for the member without a phone.
                </Text>

                {/* Full Name */}
                <CommonInput
                  label="Full Name"
                  value={childFullName}
                  onChangeText={(text) => {
                    setChildFullName(text);
                    if (modalError) setModalError(null);
                  }}
                  placeholder="e.g. Myra"
                  containerStyle={styles.inputSpacing}
                  activeBorderColor={Colors.primary}
                />

                {/* Birth Date Picker Trigger */}
                <View style={styles.inputSpacing}>
                  <Text style={styles.fieldLabel}>Birth Date</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowDatePicker(true)}
                    style={styles.datePickerInput}
                  >
                    <View style={styles.datePickerContent}>
                      <Feather
                        name="calendar"
                        size={18}
                        color="#8E9BAE"
                        style={styles.dateIcon}
                      />
                      <Text
                        style={[
                          styles.datePickerText,
                          !childBirthDate && styles.placeholderText,
                        ]}
                      >
                        {childBirthDate
                          ? formatDate(childBirthDate, 'DD MMM YYYY')
                          : 'Select birth date'}
                      </Text>
                    </View>
                    <Feather name="chevron-down" size={16} color="#8E9BAE" />
                  </TouchableOpacity>
                </View>

                {/* Role / Relation */}
                <CommonInput
                  label="Role / Relation"
                  value={childFamilyRole}
                  onChangeText={(text) => {
                    setChildFamilyRole(text);
                    if (modalError) setModalError(null);
                  }}
                  placeholder="e.g. Daughter, Son, Grandparent"
                  containerStyle={styles.inputSpacing}
                  activeBorderColor={Colors.primary}
                />

                {/* Modal Error */}
                {modalError || addMemberError ? (
                  <View style={styles.modalErrorContainer}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#EF4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>
                      {modalError || addMemberError}
                    </Text>
                  </View>
                ) : null}

                {/* Buttons Row */}
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.modalCancelBtn}
                    onPress={() => setIsAddMemberSheetVisible(false)}
                    disabled={addMemberLoading}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.modalAddBtn,
                      addMemberLoading && styles.modalAddBtnDisabled,
                    ]}
                    onPress={handleConfirmAddMember}
                    disabled={addMemberLoading}
                  >
                    {addMemberLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalAddText}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker Component */}
      <AppDateTimePicker
        visible={showDatePicker}
        date={childBirthDate || new Date(2020, 0, 1)}
        maximumDate={new Date()}
        mode="date"
        title="Select Birth Date"
        onConfirm={(d) => {
          setChildBirthDate(d);
          setShowDatePicker(false);
          if (modalError) setModalError(null);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

export default FamilyCreatedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  centerContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  title: {
    fontSize: RFValue(22),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 22,
    lineHeight: RFValue(28),
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  uploadIcon: {
    marginRight: 8,
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  goHomeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  goHomeText: {
    color: Colors.textSecondary,
    fontSize: RFValue(14.5),
    fontFamily: 'Roboto-SemiBold',
    textAlign: 'center',
  },
  // Modal / Bottom Sheet Styles
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(18),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 8,
  },
  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    marginRight: 10,
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: RFValue(14),
    fontFamily: 'Roboto-SemiBold',
  },
  modalAddBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAddBtnDisabled: {
    opacity: 0.7,
  },
  modalAddText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-Bold',
  },
  modalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
});

