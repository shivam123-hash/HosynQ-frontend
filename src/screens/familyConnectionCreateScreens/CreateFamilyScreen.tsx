import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import CommonDropdown from '../../components/CommonDropdown';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import { useAppDispatch, useAppSelector } from '../../redux';
import { createFamilyThunk, clearFamilyError } from '../../redux/features/family/familySlice';
import { mapFamilyTypeToBackend } from '../../services/familyServices';
import {
  FamilyHeader,
  FamilyMemberItem,
  DashedActionButton,
} from './components';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  initial: string;
  badge?: string;
  avatarColor?: string;
}

export interface CreateFamilyData {
  familyName: string;
  familyType: string;
  members: FamilyMember[];
  familyCode?: string;
  family?: any;
}

export interface CreateFamilyScreenProps {
  initialData?: Partial<CreateFamilyData>;
  onBack?: () => void;
  onCreateFamily?: (data: CreateFamilyData) => void;
}

const FAMILY_TYPE_OPTIONS = [
  'Nuclear Family',
  'Joint Family',
  'Single Parent',
  'Extended Family',
  'Couple',
  'Other',
];

const CreateFamilyScreen: React.FC<CreateFamilyScreenProps> = ({
  initialData,
  onBack,
  onCreateFamily,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);
  const [localError, setLocalError] = useState<string | null>(null);

  const [familyName, setFamilyName] = useState(
    initialData?.familyName || 'The Sharma Family'
  );
  const [familyType, setFamilyType] = useState(
    initialData?.familyType || ''
  );

  const [members, setMembers] = useState<FamilyMember[]>(
    initialData?.members || [
      {
        id: '1',
        name: 'Priya Sharma',
        role: 'You · Mother',
        initial: 'P',
        badge: 'Owner',
        avatarColor: '#6E4327',
      },
    ]
  );

  // Add Member Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'adult' | 'child'>('adult');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const handleOpenAddModal = (type: 'adult' | 'child') => {
    setModalType(type);
    setNewMemberName('');
    setNewMemberRole(type === 'adult' ? 'Father' : 'Child');
    setIsModalVisible(true);
  };

  const handleConfirmAddMember = () => {
    if (!newMemberName.trim()) return;

    const trimmedName = newMemberName.trim();
    const firstInitial = trimmedName.charAt(0).toUpperCase();

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: trimmedName,
      role: newMemberRole.trim() || (modalType === 'adult' ? 'Adult' : 'Child'),
      initial: firstInitial,
      avatarColor: modalType === 'adult' ? '#1E40AF' : '#059669',
    };

    setMembers((prev) => [...prev, newMember]);
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    const trimmedName = familyName.trim();
    if (trimmedName.length < 2) {
      setLocalError('Family name must be at least 2 characters');
      return;
    }

    setLocalError(null);
    dispatch(clearFamilyError());

    try {
      const backendFamilyType = mapFamilyTypeToBackend(familyType);
      const res = await dispatch(
        createFamilyThunk({
          name: trimmedName,
          familyType: backendFamilyType,
          expectedMemberCount: 5,
        })
      ).unwrap();

      onCreateFamily?.({
        familyName: res.family?.name || trimmedName,
        familyType: res.family?.familyType || familyType,
        members,
        familyCode: res.family?.familyCode,
        family: res.family,
      });
    } catch (err) {
      console.log('[CreateFamilyScreen] Failed to create family:', err);
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

      {/* Header */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <KeyboardAvoidingWrapper
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        extraHeight={20}
      >
        <View>
          {/* Title & Subtitle */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Create your family</Text>
            <Text style={styles.subtitle}>
              You can change these details later.
            </Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formSection}>
            {/* Family Name Input */}
            <CommonInput
              label="Family name"
              value={familyName}
              onChangeText={(text) => {
                setFamilyName(text);
                if (localError || error) {
                  setLocalError(null);
                  dispatch(clearFamilyError());
                }
              }}
              placeholder="The Sharma Family"
              containerStyle={styles.inputSpacing}
              activeBorderColor={Colors.primary}
            />

            {/* Family Type Dropdown */}
            <CommonDropdown
              label="Family type"
              value={familyType}
              options={FAMILY_TYPE_OPTIONS}
              onSelect={(val) => {
                setFamilyType(val);
                if (localError || error) {
                  setLocalError(null);
                  dispatch(clearFamilyError());
                }
              }}
              placeholder="Select family type"
              containerStyle={styles.inputSpacing}
            />
          </View>

          {/* Members Section */}
          <View style={styles.membersSection}>
            <View style={styles.membersHeaderRow}>
              <Text style={styles.membersLabel}>Members</Text>
              <Text style={styles.optionalLabel}>Optional now</Text>
            </View>

            {/* Members List */}
            {members.map((member) => (
              <FamilyMemberItem
                key={member.id}
                name={member.name}
                relationRole={member.role}
                initial={member.initial}
                badge={member.badge}
                avatarColor={member.avatarColor}
              />
            ))}

            {/* Dashed Buttons: + Invite adult & + Add child */}
            <View style={styles.actionButtonsRow}>
              <DashedActionButton
                title="Invite adult"
                onPress={() => handleOpenAddModal('adult')}
                style={styles.actionButtonLeft}
              />
              <DashedActionButton
                title="Add child"
                onPress={() => handleOpenAddModal('child')}
                style={styles.actionButtonRight}
              />
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          {localError || error ? (
            <View style={styles.errorContainer}>
              <Feather
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          ) : null}

          <CommonBtn
            title="Create Family"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </KeyboardAvoidingWrapper>

      {/* Add Member Interactive Bottom Sheet / Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>
              {modalType === 'adult' ? 'Invite Adult' : 'Add Child'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalType === 'adult'
                ? 'Enter name and role of the family member to invite.'
                : 'Enter details for the child.'}
            </Text>

            <CommonInput
              label="Full Name"
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="e.g. Rahul Sharma"
              containerStyle={styles.inputSpacing}
              activeBorderColor={Colors.primary}
            />

            <CommonInput
              label="Role / Relation"
              value={newMemberRole}
              onChangeText={setNewMemberRole}
              placeholder={modalType === 'adult' ? 'e.g. Father, Spouse' : 'e.g. Son, Daughter'}
              containerStyle={styles.inputSpacing}
              activeBorderColor={Colors.primary}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalCancelBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalAddBtn}
                onPress={handleConfirmAddMember}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CreateFamilyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 8,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  membersSection: {
    marginTop: 8,
  },
  membersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membersLabel: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  optionalLabel: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  actionButtonLeft: {
    marginRight: 8,
  },
  actionButtonRight: {
    marginLeft: 8,
  },
  bottomSection: {
    marginTop: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F2238',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
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
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
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
    fontWeight: '600',
  },
  modalAddBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAddText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  errorContainer: {
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
    fontWeight: '500',
    textAlign: 'center',
  },
});
