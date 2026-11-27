import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import ImagePicker from 'react-native-image-crop-picker';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  deleteMilestoneThunk,
  fetchLifeProfileMilestonesThunk,
  fetchMilestonesThunk,
  reactToMilestoneThunk,
  removeMilestoneReactionThunk,
  saveMilestoneInLifeProfileThunk,
  uploadMilestonePhotoThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { PulseMilestoneType } from '../../../services/pulseServices';
import { MilestoneDetailSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import PulseModalContainer from './PulseModalContainer';
import ReactionPackModal from './ReactionPackModal';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
  mapApiMilestoneToUi,
  PULSE_REACTIONS,
  reactionApiToUiId,
  scheduleAfterTransition,
} from './pulseApiHelpers';
import { FamilyMemberPulse, MilestoneItem } from './types';

export interface MilestoneDetailModalProps {
  visible: boolean;
  asModal?: boolean;
  milestone: MilestoneItem | null;
  members?: FamilyMemberPulse[];
  onClose: () => void;
  onMilestoneDeleted?: (id: string) => void;
  onMilestoneUpdated?: () => void;
}

const VISIBILITY_OPTIONS: Array<{
  id: 'EVERYONE' | 'PARENTS' | 'RESTRICTED';
  label: string;
}> = [
  { id: 'EVERYONE', label: 'Everyone' },
  { id: 'PARENTS', label: 'Parents' },
  { id: 'RESTRICTED', label: 'Private' },
];

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  visible,
  asModal = true,
  milestone,
  members: membersProp,
  onClose,
  onMilestoneDeleted,
  onMilestoneUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);

  const [refreshing, setRefreshing] = useState(false);
  const [showReactionPack, setShowReactionPack] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [visibility, setVisibility] = useState<'EVERYONE' | 'PARENTS' | 'RESTRICTED'>('EVERYONE');
  const [savedLifeProfileLocally, setSavedLifeProfileLocally] = useState<boolean | null>(null);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  const membersList = useMemo(() => {
    if (membersProp && membersProp.length > 0) return membersProp;
    return extractPulseMembersFromFamilyState(familyState);
  }, [membersProp, familyState]);

  const memberLookup = useMemo(() => {
    const map = new Map<string, FamilyMemberPulse>();
    membersList.forEach((m) => map.set(m.id, m));
    return map;
  }, [membersList]);

  const myMemberId = useMemo(
    () => membersList.find((m) => m.isYou)?.id || null,
    [membersList]
  );

  // Sync with live Redux store milestone when available
  const activeMilestone: MilestoneItem | null = useMemo(() => {
    if (!milestone) return null;
    const live = pulseState?.milestones?.find((m) => m.id === milestone.id);
    if (live) {
      return mapApiMilestoneToUi(live, memberLookup, myMemberId);
    }
    return milestone;
  }, [milestone, pulseState?.milestones, memberLookup, myMemberId]);

  const targetMember = useMemo(() => {
    if (!activeMilestone?.memberId) return undefined;
    return memberLookup.get(activeMilestone.memberId);
  }, [activeMilestone?.memberId, memberLookup]);

  const canModifyLifeProfile = useMemo(() => {
    if (!activeMilestone || activeMilestone.isFamily || !activeMilestone.memberId) {
      return false;
    }
    if (!targetMember) return true;
    return Boolean(targetMember.isYou || !targetMember.hasAccount || !targetMember.isAdult);
  }, [activeMilestone, targetMember]);

  useEffect(() => {
    if (!visible || !activeMilestone) return;
    setSavedLifeProfileLocally(null);
    if (
      activeMilestone.memberId &&
      isUUID(activeMilestone.memberId) &&
      !isJestTestEnv()
    ) {
      return scheduleAfterTransition(() => {
        dispatch(fetchLifeProfileMilestonesThunk(activeMilestone.memberId!));
      });
    }
  }, [visible, activeMilestone?.id, activeMilestone?.memberId, dispatch]);

  const handleRefresh = useCallback(async () => {
    if (!activeMilestone) return;
    setRefreshing(true);
    try {
      await dispatch(fetchMilestonesThunk({ limit: 50 })).unwrap();
      if (activeMilestone.memberId && isUUID(activeMilestone.memberId)) {
        await dispatch(fetchLifeProfileMilestonesThunk(activeMilestone.memberId)).unwrap();
      }
    } catch {
      // handled gracefully
    } finally {
      setRefreshing(false);
    }
  }, [activeMilestone, dispatch]);

  const uploadSinglePhoto = async (path: string, filename?: string, mime?: string) => {
    if (!activeMilestone || !isUUID(activeMilestone.id)) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'info',
        title: 'Saved locally',
        description: 'Photos can be uploaded once synced with a live milestone.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: path,
      name: filename || `milestone-${Date.now()}.jpg`,
      type: mime || 'image/jpeg',
    } as any);

    const res = await dispatch(
      uploadMilestonePhotoThunk({
        milestoneId: activeMilestone.id,
        formData,
      })
    );
    if (uploadMilestonePhotoThunk.rejected.match(res)) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Photo upload failed',
        description: (res.payload as string) || 'Unable to upload photo.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    } else {
      onMilestoneUpdated?.();
    }
  };

  const handleTakePhoto = async () => {
    try {
      setShowPhotoOptions(false);
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: false,
      });
      if (image?.path) {
        await uploadSinglePhoto(image.path, image.filename, image.mime);
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Camera unavailable',
          description: 'Could not capture a photo right now.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const handleFromGallery = async () => {
    try {
      setShowPhotoOptions(false);
      const res = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
      });
      const picked = Array.isArray(res) ? res[0] : res;
      if (picked?.path) {
        await uploadSinglePhoto(picked.path, picked.filename, picked.mime);
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Gallery unavailable',
          description: 'Could not select a photo right now.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const handleSelectReaction = async (_reactionId: string, apiCode: string) => {
    if (!activeMilestone) return;
    if (!isUUID(activeMilestone.id)) return;
    const currentMine = activeMilestone.reactions?.mine?.toUpperCase();
    if (currentMine === apiCode.toUpperCase()) {
      const res = await dispatch(removeMilestoneReactionThunk(activeMilestone.id));
      if (removeMilestoneReactionThunk.fulfilled.match(res)) {
        onMilestoneUpdated?.();
      }
      return;
    }
    const res = await dispatch(
      reactToMilestoneThunk({ id: activeMilestone.id, reaction: apiCode })
    );
    if (reactToMilestoneThunk.fulfilled.match(res)) {
      onMilestoneUpdated?.();
    }
  };

  const handleRemoveReaction = async () => {
    if (!activeMilestone || !isUUID(activeMilestone.id)) return;
    const res = await dispatch(removeMilestoneReactionThunk(activeMilestone.id));
    if (removeMilestoneReactionThunk.fulfilled.match(res)) {
      onMilestoneUpdated?.();
    }
  };

  const handleSaveToLifeProfile = async () => {
    if (!activeMilestone?.memberId || !isUUID(activeMilestone.memberId)) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'info',
        title: 'Life Profile',
        description: 'Select a valid member milestone to sync with Life Profile.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const res = await dispatch(
      saveMilestoneInLifeProfileThunk({
        memberId: activeMilestone.memberId,
        payload: {
          vaccination: { visibility },
          milestones: [
            {
              title: activeMilestone.title,
              achievedOn:
                activeMilestone.achievedOn || new Date().toISOString().slice(0, 10),
              type: (activeMilestone.milestoneType as PulseMilestoneType) || 'OTHER',
              sharedToPulse: activeMilestone.sharedToPulse ?? true,
            },
          ],
        },
      })
    );

    if (saveMilestoneInLifeProfileThunk.rejected.match(res)) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Could not update Life Profile',
        description:
          (res.payload as string) || 'Failed to save milestone in Life Profile.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    setSavedLifeProfileLocally(true);
    dispatch(fetchLifeProfileMilestonesThunk(activeMilestone.memberId));
    onMilestoneUpdated?.();
    setDialog({
      visible: true,
      type: 'warning',
      iconName: 'check',
      title: 'Saved to Life Profile',
      description: `Visibility set to ${visibility.toLowerCase()}.`,
      primaryButtonText: 'OK',
      secondaryButtonText: '',
    });
  };

  const handleConfirmDeleteOrUnshare = () => {
    if (!activeMilestone) return;
    const isUnshare = activeMilestone.removal === 'UNSHARE';

    setDialog({
      visible: true,
      type: 'danger',
      iconName: isUnshare ? 'eye-off' : 'trash-2',
      title: isUnshare ? 'Unshare milestone?' : 'Delete milestone?',
      description: isUnshare
        ? 'This will remove the milestone from Family Pulse while keeping it safely in the Life Profile.'
        : 'This will permanently delete this milestone and its photos.',
      primaryButtonText: isUnshare ? 'Unshare' : 'Delete',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setDialog(INITIAL_PULSE_DIALOG_STATE);
        if (!isUUID(activeMilestone.id)) {
          onMilestoneDeleted?.(activeMilestone.id);
          onClose();
          return;
        }
        const res = await dispatch(deleteMilestoneThunk(activeMilestone.id));
        if (deleteMilestoneThunk.rejected.match(res)) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Action failed',
            description: (res.payload as string) || 'Unable to remove milestone.',
            primaryButtonText: 'OK',
            secondaryButtonText: '',
          });
          return;
        }
        onMilestoneDeleted?.(activeMilestone.id);
        onClose();
      },
    });
  };

  if (!activeMilestone) {
    return null;
  }

  const photos = activeMilestone.photos || [];
  const canAddMorePhotos = photos.length < 6;
  const currentReactionUiId = reactionApiToUiId(activeMilestone.reactions?.mine);
  const currentReactionDef = PULSE_REACTIONS.find((r) => r.id === currentReactionUiId);
  const isSavedInLifeProfile =
    savedLifeProfileLocally !== null
      ? savedLifeProfileLocally
      : Boolean(activeMilestone.inLifeProfile);
  const lifeProfileList = pulseState?.lifeProfileMilestones || [];
  const isUnshareMode = activeMilestone.removal === 'UNSHARE';
  const showManageButton =
    activeMilestone.canManage !== false ||
    activeMilestone.removal === 'DELETE' ||
    activeMilestone.removal === 'UNSHARE';

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="push"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milestone</Text>
          {showManageButton ? (
            <TouchableOpacity
              style={styles.deleteIconBtn}
              onPress={handleConfirmDeleteOrUnshare}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={isUnshareMode ? 'Unshare milestone' : 'Delete milestone'}
            >
              <Feather
                name={isUnshareMode ? 'eye-off' : 'trash-2'}
                size={18}
                color={Colors.accentRed}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Main Milestone Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.personBadge}>
                <View
                  style={[
                    styles.personAvatar,
                    { backgroundColor: activeMilestone.personColor },
                  ]}
                >
                  <Text style={styles.personInitial}>
                    {activeMilestone.personInitial}
                  </Text>
                </View>
                <View>
                  <Text style={styles.personName}>{activeMilestone.personName}</Text>
                  <Text style={styles.dateText}>{activeMilestone.dateText}</Text>
                </View>
              </View>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>
                  {String(activeMilestone.milestoneType || 'OTHER').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.titleText}>{activeMilestone.title}</Text>
            <Text style={styles.metaText}>{activeMilestone.authorText}</Text>

            {/* Reactions Bar */}
            <View style={styles.reactionsRow}>
              <TouchableOpacity
                style={[
                  styles.reactButton,
                  Boolean(activeMilestone.reactions?.mine) && styles.reactButtonActive,
                ]}
                onPress={() => setShowReactionPack(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="React to milestone"
              >
                <Feather
                  name={(currentReactionDef?.iconName as any) || 'heart'}
                  size={15}
                  color={
                    activeMilestone.reactions?.mine
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.reactButtonText,
                    Boolean(activeMilestone.reactions?.mine) && styles.reactButtonTextActive,
                  ]}
                >
                  {currentReactionDef?.label || 'React'} · {activeMilestone.reactionsCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Photos Gallery (#20) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>PHOTOS</Text>
            <Text style={styles.sectionMeta}>{photos.length} / 6</Text>
          </View>

          <View style={styles.photosGrid}>
            {photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoCard}>
                <Image
                  source={{ uri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              </View>
            ))}

            {canAddMorePhotos ? (
              <TouchableOpacity
                style={styles.addPhotoSlot}
                onPress={() => setShowPhotoOptions(true)}
                disabled={pulseState?.uploadingPhoto}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Add milestone photo"
              >
                {pulseState?.uploadingPhoto ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Feather name="plus" size={20} color={Colors.primary} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>

          {photos.length === 0 && !canAddMorePhotos ? (
            <Text style={styles.emptyPhotosText}>No photos added yet.</Text>
          ) : null}

          {/* Life Profile Sync & Visibility (#18 & #19) */}
          {!activeMilestone.isFamily && activeMilestone.memberId ? (
            <View style={styles.lifeProfileCard}>
              <View style={styles.lifeHeaderRow}>
                <View style={styles.lifeTitleGroup}>
                  <MaterialIcons name="verified-user" size={18} color={Colors.accentTeal} />
                  <Text style={styles.lifeTitle}>Life Profile</Text>
                </View>
                <View
                  style={[
                    styles.statusChip,
                    isSavedInLifeProfile ? styles.statusChipSaved : styles.statusChipPulse,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isSavedInLifeProfile
                        ? styles.statusChipTextSaved
                        : styles.statusChipTextPulse,
                    ]}
                  >
                    {isSavedInLifeProfile ? 'Saved' : 'Pulse only'}
                  </Text>
                </View>
              </View>

              <Text style={styles.lifeSubtitle}>
                {canModifyLifeProfile
                  ? `Control who can see ${activeMilestone.personName}'s Life Profile milestones.`
                  : 'You can view Pulse details; only parents/admins or the member can edit this Life Profile.'}
              </Text>

              {canModifyLifeProfile ? (
                <>
                  <Text style={styles.visibilityLabel}>VISIBILITY</Text>
                  <View style={styles.visibilityRow}>
                    {VISIBILITY_OPTIONS.map((opt) => {
                      const active = visibility === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.visibilityChip,
                            active && styles.visibilityChipActive,
                          ]}
                          onPress={() => setVisibility(opt.id)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.visibilityChipText,
                              active && styles.visibilityChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.lifeActionBtn}
                    onPress={handleSaveToLifeProfile}
                    disabled={pulseState?.submittingAction}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Save in Life Profile"
                  >
                    {pulseState?.submittingAction ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.lifeActionBtnText}>
                        {isSavedInLifeProfile
                          ? 'Update Life Profile visibility'
                          : 'Save to Life Profile'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}

              {!isJestTestEnv() && pulseState?.loadingLifeProfile ? (
                <MilestoneDetailSkeleton />
              ) : lifeProfileList.length > 0 ? (
                <View style={styles.lifeListContainer}>
                  <Text style={styles.lifeListHeader}>
                    LIFE PROFILE MILESTONES ({lifeProfileList.length})
                  </Text>
                  {lifeProfileList.slice(0, 4).map((lp: any, idx: number) => (
                    <View key={`${lp.id || lp.title || idx}`} style={styles.lifeListItem}>
                      <Feather name="bookmark" size={13} color={Colors.accentTeal} />
                      <Text style={styles.lifeListItemText} numberOfLines={1}>
                        {lp.title}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        {/* Photo Picker Action Sheet */}
        <Modal
          visible={showPhotoOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhotoOptions(false)}
        >
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setShowPhotoOptions(false)}
          >
            <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add Photo</Text>
              <Text style={styles.sheetSubtitle}>Choose an option</Text>

              <View style={styles.sheetActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleTakePhoto}
                  style={styles.sheetActionButton}
                >
                  <View style={styles.sheetIconCircle}>
                    <Feather name="camera" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetActionText}>Take a photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleFromGallery}
                  style={styles.sheetActionButton}
                >
                  <View style={styles.sheetIconCircle}>
                    <Feather name="image" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetActionText}>Choose from library</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setShowPhotoOptions(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <ReactionPackModal
          visible={showReactionPack}
          asModal={false}
          targetTitle={activeMilestone.title}
          selectedReactionId={currentReactionUiId}
          reactionsSummary={activeMilestone.reactions}
          members={membersList}
          onClose={() => setShowReactionPack(false)}
          onSelectReaction={handleSelectReaction}
          onRemoveReaction={handleRemoveReaction}
        />

        <PulseDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
        />
      </View>
    </PulseModalContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  deleteIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#4A2531',
    backgroundColor: 'rgba(232, 92, 92, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginBottom: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  personBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  personInitial: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  personName: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
    marginTop: 2,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.35)',
  },
  typePillText: {
    fontSize: 10.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    lineHeight: 27,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
    marginBottom: 14,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1B2D47',
  },
  reactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#15253E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253957',
  },
  reactButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
  },
  reactButtonText: {
    fontSize: 13.5,
    fontFamily: 'Roboto-Medium',
    color: Colors.textSecondary,
  },
  reactButtonTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.8,
  },
  sectionMeta: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoCard: {
    width: 104,
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#132238',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoSlot: {
    width: 104,
    height: 104,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
  },
  emptyPhotosText: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 20,
  },
  lifeProfileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
  },
  lifeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lifeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lifeTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusChipSaved: {
    backgroundColor: 'rgba(30, 198, 179, 0.14)',
    borderColor: 'rgba(30, 198, 179, 0.45)',
  },
  statusChipPulse: {
    backgroundColor: 'rgba(138, 151, 171, 0.14)',
    borderColor: '#3A4556',
  },
  statusChipText: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
  },
  statusChipTextSaved: {
    color: Colors.accentTeal,
  },
  statusChipTextPulse: {
    color: '#A7B4C4',
  },
  lifeSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8A97AB',
    marginBottom: 14,
  },
  visibilityLabel: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  visibilityChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
  },
  visibilityChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.16)',
  },
  visibilityChipText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
  visibilityChipTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
  lifeActionBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifeActionBtnText: {
    fontSize: 14.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  lifeListContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1B2D47',
    gap: 8,
  },
  lifeListHeader: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  lifeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lifeListItemText: {
    fontSize: 13.5,
    color: Colors.white,
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 20,
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  sheetActionButton: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sheetActionText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
  },
  sheetCancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  sheetCancelText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
  },
});

export default MilestoneDetailModal;
