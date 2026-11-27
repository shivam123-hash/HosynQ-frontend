import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Colors from '../../../units/Colors';
import { PulseReactionsSummary } from '../../../services/pulseServices';
import { FamilyMemberPulse } from './types';
import PulseModalContainer from './PulseModalContainer';
import {
  PULSE_REACTIONS,
  reactionApiToUiId,
  reactionUiIdToApi,
} from './pulseApiHelpers';

export interface ReactionPackModalProps {
  visible: boolean;
  asModal?: boolean;
  targetTitle?: string;
  selectedReactionId?: string | null;
  reactionsSummary?: PulseReactionsSummary | null;
  members?: FamilyMemberPulse[];
  onClose: () => void;
  onSelectReaction: (reactionId: string, apiCode: string) => void;
  onRemoveReaction?: () => void;
}

export const ReactionPackModal: React.FC<ReactionPackModalProps> = ({
  visible,
  asModal = true,
  targetTitle = 'React to this post',
  selectedReactionId,
  reactionsSummary,
  members = [],
  onClose,
  onSelectReaction,
  onRemoveReaction,
}) => {
  const insets = useSafeAreaInsets();
  const resolvedInitial =
    reactionApiToUiId(reactionsSummary?.mine || selectedReactionId || '') || '';
  const [selected, setSelected] = useState<string>(resolvedInitial);

  useEffect(() => {
    if (visible) {
      setSelected(
        reactionApiToUiId(reactionsSummary?.mine || selectedReactionId || '') || ''
      );
    }
  }, [visible, reactionsSummary?.mine, selectedReactionId]);

  const handlePick = (id: string, apiCode: string) => {
    setSelected(id);
    onSelectReaction(id, apiCode);
    onClose();
  };

  const countByCode = new Map<string, number>();
  (reactionsSummary?.counts || []).forEach((c) => {
    if (c.reaction) {
      countByCode.set(c.reaction.toUpperCase(), c.count || 0);
    }
  });

  const reactorIds = reactionsSummary?.memberIds || [];
  const totalReactions = reactionsSummary?.total ?? reactorIds.length;
  const memberLookup = new Map(members.map((m) => [m.id, m]));
  const myMember = members.find((m) => m.isYou);

  const visibleReactors =
    reactorIds.length > 0
      ? reactorIds.slice(0, 3).map((mId, idx) => {
          const m = memberLookup.get(mId);
          return {
            id: mId || `r-${idx}`,
            initial: m?.initial || 'M',
            bgColor: m?.bgColor || Colors.avatarNavy,
            name: m?.displayName || m?.name || 'Member',
          };
        })
      : reactionsSummary?.mine && totalReactions > 0
      ? [
          {
            id: myMember?.id || 'you',
            initial: myMember?.initial || 'Y',
            bgColor: myMember?.bgColor || Colors.avatarBrown,
            name: 'You',
          },
        ]
      : [];

  const reactorNames = visibleReactors.map((r) => r.name);
  const extraCount = Math.max(0, totalReactions - reactorNames.length);
  const reactorsCaption =
    totalReactions === 0
      ? 'No reactions yet — be the first!'
      : reactorNames.length > 0 && extraCount > 0
      ? `${reactorNames.join(', ')} and ${extraCount} more reacted`
      : reactorNames.length > 0
      ? `${reactorNames.join(', ')} reacted`
      : `${totalReactions} family reaction${totalReactions === 1 ? '' : 's'}`;

  const hasMine = Boolean(selected);

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="sheet"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              <View style={styles.dragHandle} />

              <Text style={styles.title}>React</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {targetTitle}
              </Text>

              <Text style={styles.sectionKicker}>FAMILY PACK</Text>

              {/* 2x3 Grid */}
              <View style={styles.grid}>
                {PULSE_REACTIONS.map((item) => {
                  const isPicked =
                    selected === item.id ||
                    (Boolean(selected) && reactionUiIdToApi(selected) === item.apiCode);
                  const countForItem = countByCode.get(item.apiCode) || 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handlePick(item.id, item.apiCode)}
                      activeOpacity={0.75}
                      style={[
                        styles.reactionCard,
                        isPicked && {
                          borderWidth: 1.5,
                          borderColor: item.color,
                          backgroundColor: item.tintBg,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: isPicked }}
                    >
                      {isPicked && (
                        <View
                          style={[
                            styles.selectedCheckDot,
                            { backgroundColor: item.color },
                          ]}
                        >
                          <Feather name="check" size={10} color={Colors.background} />
                        </View>
                      )}

                      {countForItem > 0 && (
                        <View style={styles.cardCountBadge}>
                          <Text style={styles.cardCountText}>{countForItem}</Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: isPicked
                              ? item.tintBg
                              : 'rgba(255, 255, 255, 0.06)',
                          },
                        ]}
                      >
                        {item.iconType === 'material' ? (
                          <MaterialIcons
                            name={item.iconName as any}
                            size={22}
                            color={item.color}
                          />
                        ) : (
                          <Feather
                            name={item.iconName as any}
                            size={22}
                            color={item.color}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.reactionLabel,
                          isPicked && { color: item.color, fontFamily: 'Roboto-Bold' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Reactors Row */}
              <View style={styles.reactorsRow}>
                {visibleReactors.length > 0 && (
                  <View style={styles.avatarCluster}>
                    {visibleReactors.map((r, idx) => (
                      <View
                        key={r.id}
                        style={[
                          styles.avatarDot,
                          idx > 0 && styles.avatarOverlap,
                          { backgroundColor: r.bgColor },
                        ]}
                      >
                        <Text style={styles.avatarDotText}>{r.initial}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.reactorsText}>{reactorsCaption}</Text>
              </View>

              {/* Remove reaction link */}
              <TouchableOpacity
                onPress={() => {
                  if (!hasMine) return;
                  setSelected('');
                  onRemoveReaction?.();
                  onClose();
                }}
                disabled={!hasMine}
                activeOpacity={0.7}
                style={[styles.removeBtn, !hasMine && styles.removeBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Remove my reaction"
                accessibilityState={{ disabled: !hasMine }}
              >
                <Text
                  style={[
                    styles.removeBtnText,
                    hasMine && styles.removeBtnTextActive,
                  ]}
                >
                  Remove my reaction
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </PulseModalContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
    textAlign: 'left',
    marginBottom: 20,
  },
  sectionKicker: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.8,
    textAlign: 'left',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 20,
  },
  reactionCard: {
    width: '31%',
    backgroundColor: '#101F36',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  selectedCheckDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: '#1B2E4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCountText: {
    fontSize: 10.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.textLightMuted,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  reactionLabel: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    textAlign: 'center',
  },
  reactorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBackground,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarDotText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  reactorsText: {
    fontSize: 13.5,
    color: '#8A97AB',
  },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  removeBtnDisabled: {
    opacity: 0.4,
  },
  removeBtnText: {
    fontSize: 14.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#8A97AB',
  },
  removeBtnTextActive: {
    color: Colors.dangerCoral,
  },
});

export default ReactionPackModal;
