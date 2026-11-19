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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import type { FamilyMemberItem } from './MembersModal';

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

const CANDIDATES: TransferCandidate[] = [
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
  const [selectedId, setSelectedId] = useState<string>('rohan');

  const selectedCandidate = CANDIDATES.find((c) => c.id === selectedId) || CANDIDATES[0];

  const handleTransfer = () => {
    Alert.alert(
      'OTP Sent',
      `We sent a 6-digit confirmation code to verify transferring ownership to ${selectedCandidate.name}.`,
      [
        {
          text: 'Confirm',
          onPress: () => {
            if (onTransferComplete) {
              onTransferComplete(selectedCandidate.id);
            }
            onClose();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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
          {CANDIDATES.map((candidate, index) => {
            const isLast = index === CANDIDATES.length - 1;
            const isSelected = selectedId === candidate.id;
            const isDisabled = candidate.disabled;

            return (
              <React.Fragment key={candidate.id}>
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
                  disabled={isDisabled}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, disabled: isDisabled }}
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
          })}
        </View>

        {/* What changes Warning Box */}
        <View style={styles.warningBox}>
          <View style={styles.warningHeaderRow}>
            <Feather name="alert-circle" size={17} color="#F0923A" />
            <Text style={styles.warningTitle}>What changes</Text>
          </View>
          <Text style={styles.warningBody}>
            {`${selectedCandidate.name} will control billing and can delete the family. Only ${selectedCandidate.name} can undo this.`}
          </Text>
        </View>
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
          style={styles.transferButton}
          onPress={handleTransfer}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Transfer to ${selectedCandidate.name}`}
        >
          <Text style={styles.transferButtonText}>
            {`Transfer to ${selectedCandidate.name}`}
          </Text>
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#8A9BAE',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BAE',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  candidatesCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 18,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  candidateRowDisabled: {
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  candidateNameDisabled: {
    color: '#6E8096',
  },
  candidateRole: {
    fontSize: 13,
    color: '#8A9BAE',
    marginTop: 2,
  },
  candidateRoleDisabled: {
    color: '#4E5F76',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A5870',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    borderColor: '#F0923A',
  },
  radioCircleDisabled: {
    borderColor: '#243447',
  },
  radioDot: {
    width: 10.5,
    height: 10.5,
    borderRadius: 5.5,
    backgroundColor: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    width: '100%',
  },
  warningBox: {
    backgroundColor: 'rgba(240, 146, 58, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240, 146, 58, 0.35)',
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
    lineHeight: 19,
    color: '#8A9BAE',
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
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TransferOwnershipModal;
