import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import { transferOwnershipThunk } from '../../../redux/features/family/familySlice';

export interface TransferOwnershipModalProps {
  visible?: boolean;
  isScreen?: boolean;
  onClose: () => void;
  onTransferComplete?: (newOwnerId: string) => void;
}

interface TransferCandidate {
  id: string;
  name: string;
  role: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  disabled?: boolean;
  subtext?: string;
}

const DEFAULT_FALLBACK_CANDIDATES: TransferCandidate[] = [
  {
    id: 'rohan',
    name: 'Rohan',
    role: 'Admin',
    initial: 'R',
    avatarBg: '#1F3A66',
    avatarColor: '#8EB7F5',
  },
  {
    id: 'dadi',
    name: 'Dadi',
    role: 'Adult',
    initial: 'D',
    avatarBg: '#253F2D',
    avatarColor: '#9BD4AA',
  },
  {
    id: 'anaya',
    name: 'Anaya',
    role: 'Child',
    initial: 'A',
    avatarBg: '#4B1F3A',
    avatarColor: '#C9A8EF',
    disabled: true,
    subtext: 'Child · Children can’t be Owners',
  },
];

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  visible = true,
  isScreen = false,
  onClose,
  onTransferComplete,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { family, myFamilyData, actionLoading } = useAppSelector(
    (state) => state.family
  );

  const currentFamily = myFamilyData?.family || family;
  const rawMembers = currentFamily?.members || [];

  // Build candidate list: other members of the family
  const candidates: TransferCandidate[] =
    rawMembers.length > 0
      ? rawMembers
          .filter((m) => !m.isYou && m.role !== 'FAMILY_OWNER')
          .map((m: any, index: number) => {
            const isChild = m.role === 'DEPENDENT_CHILD_PROFILE';
            const roleDisplay =
              m.role === 'FAMILY_ADMIN'
                ? 'Admin'
                : isChild
                ? 'Child'
                : 'Adult';

            const initial = m.fullName
              ? m.fullName.trim().charAt(0).toUpperCase()
              : '?';

            const candidateId = m.id || m.memberId || m._id || m.userId || `candidate-${index}`;

            return {
              id: String(candidateId),
              name: m.fullName,
              role: roleDisplay,
              initial,
              avatarBg: m.avatarColor || '#1F3A66',
              avatarColor: '#FFFFFF',
              disabled: isChild,
              subtext: isChild ? 'Child · Children can’t be Owners' : undefined,
            };
          })
      : DEFAULT_FALLBACK_CANDIDATES;

  const firstEligible = candidates.find((c) => !c.disabled);
  const [selectedId, setSelectedId] = useState<string>(firstEligible?.id || '');
  const [isTransferring, setIsTransferring] = useState(false);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedId) || firstEligible || candidates[0];

  const handleTransfer = () => {
    if (!selectedCandidate) {
      Alert.alert(
        'No Candidate Selected',
        'Please select an adult member to transfer ownership to.'
      );
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer family ownership to ${selectedCandidate.name}? You will become a Family Admin.`,
      [
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            setIsTransferring(true);
            try {
              await dispatch(
                transferOwnershipThunk(selectedCandidate.id)
              ).unwrap();
              setIsTransferring(false);
              Alert.alert(
                'Ownership Transferred',
                `${selectedCandidate.name} is now the Family Owner.`
              );
              if (onTransferComplete) {
                onTransferComplete(selectedCandidate.id);
              }
              onClose();
            } catch (err: any) {
              setIsTransferring(false);
              Alert.alert('Transfer Failed', err || 'Could not transfer ownership.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const isBusy = isTransferring || actionLoading;

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44
  );

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Transfer ownership</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Pick an adult to become the new Owner. You’ll become an Admin.
        </Text>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>NEW OWNER</Text>

        {/* Candidates Card */}
        <View style={styles.candidatesCard}>
          {candidates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No other members found in your family. Invite an adult member first.
              </Text>
            </View>
          ) : (
            candidates.map((candidate, index) => {
              const isLast = index === candidates.length - 1;
              const isSelected = selectedId === candidate.id;
              const isDisabled = candidate.disabled;

              return (
                <React.Fragment key={candidate.id || `candidate-${index}`}>
                  <TouchableOpacity
                    style={[
                      styles.candidateRow,
                      isDisabled && styles.candidateRowDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        setSelectedId(candidate.id);
                      }
                    }}
                    disabled={isDisabled || isBusy}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: isSelected,
                      disabled: isDisabled,
                    }}
                    accessibilityLabel={`${candidate.name}, ${candidate.role}`}
                  >
                    {/* Avatar */}
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: candidate.avatarBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          { color: candidate.avatarColor },
                        ]}
                      >
                        {candidate.initial}
                      </Text>
                    </View>

                    {/* Candidate Info */}
                    <View style={styles.candidateInfo}>
                      <Text
                        style={[
                          styles.candidateName,
                          isDisabled && styles.candidateNameDisabled,
                        ]}
                      >
                        {candidate.name}
                      </Text>
                      <Text
                        style={[
                          styles.candidateRole,
                          isDisabled && styles.candidateRoleDisabled,
                        ]}
                      >
                        {candidate.subtext || candidate.role}
                      </Text>
                    </View>

                    {/* Radio Button */}
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                        isDisabled && styles.radioCircleDisabled,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>

                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })
          )}
        </View>

        {/* What changes Warning Box */}
        {selectedCandidate && (
          <View style={styles.warningBox}>
            <View style={styles.warningHeaderRow}>
              <Feather name="alert-circle" size={17} color="#F0923A" />
              <Text style={styles.warningTitle}>What changes</Text>
            </View>
            <Text style={styles.warningBody}>
              {`${selectedCandidate.name} will control billing and can delete the family. Only ${selectedCandidate.name} can undo this.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Pinned Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <Text style={styles.bottomHintText}>
          We’ll send an OTP to your phone to confirm.
        </Text>
        <TouchableOpacity
          style={[
            styles.transferButton,
            (!selectedCandidate || isBusy || selectedCandidate.disabled) &&
              styles.transferButtonDisabled,
          ]}
          onPress={handleTransfer}
          disabled={!selectedCandidate || isBusy || selectedCandidate.disabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            selectedCandidate
              ? `Transfer to ${selectedCandidate.name}`
              : 'Transfer ownership'
          }
        >
          {isTransferring ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.transferButtonText}>
              {selectedCandidate
                ? `Transfer to ${selectedCandidate.name}`
                : 'Transfer ownership'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A9BAE',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8997AB',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  candidatesCard: {
    backgroundColor: '#11223A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 20,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  candidateRowDisabled: {
    opacity: 0.5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  candidateInfo: {
    flex: 1,
    marginLeft: 14,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  candidateNameDisabled: {
    color: '#8A9BAE',
  },
  candidateRole: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  candidateRoleDisabled: {
    color: '#55667E',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3B4D66',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    borderColor: '#F0923A',
    borderWidth: 2.5,
  },
  radioCircleDisabled: {
    borderColor: '#24344A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#192C45',
    marginLeft: 16,
  },
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    color: '#8A9BAE',
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: 'rgba(240, 146, 58, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 146, 58, 0.3)',
    padding: 16,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0923A',
  },
  warningBody: {
    fontSize: 13,
    color: '#CAD4DF',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bottomHintText: {
    fontSize: 12,
    color: '#8A9BAE',
    textAlign: 'center',
    marginBottom: 10,
  },
  transferButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#3A4B60',
  },
  transferButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TransferOwnershipModal;