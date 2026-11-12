import React, { useState } from 'react';
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
import Colors from '../../../units/Colors';

export interface ReactionPackModalProps {
  visible: boolean;
  targetTitle?: string;
  selectedReactionId?: string;
  onClose: () => void;
  onSelectReaction: (reactionId: string) => void;
  onRemoveReaction?: () => void;
}

const REACTIONS: {
  id: string;
  label: string;
  iconName: string;
}[] = [
  { id: 'love', label: 'Love it', iconName: 'heart' },
  { id: 'proud', label: 'So proud', iconName: 'star' },
  { id: 'welldone', label: 'Well done', iconName: 'thumbs-up' },
  { id: 'haha', label: 'Haha', iconName: 'smile' },
  { id: 'treat', label: 'Treat time', iconName: 'gift' },
  { id: 'shabash', label: 'Shabash!', iconName: 'zap' },
];

export const ReactionPackModal: React.FC<ReactionPackModalProps> = ({
  visible,
  targetTitle = 'To Rohan’s thanks for Dadi',
  selectedReactionId = 'proud',
  onClose,
  onSelectReaction,
  onRemoveReaction,
}) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>(selectedReactionId);

  const handlePick = (id: string) => {
    setSelected(id);
    onSelectReaction(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
              <Text style={styles.subtitle}>{targetTitle}</Text>

              <Text style={styles.sectionKicker}>FAMILY PACK</Text>

              {/* 2x3 Grid */}
              <View style={styles.grid}>
                {REACTIONS.map((item) => {
                  const isPicked = selected === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handlePick(item.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.reactionCard,
                        isPicked && styles.reactionCardSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          isPicked && styles.iconCircleSelected,
                        ]}
                      >
                        <Feather
                          name={item.iconName as any}
                          size={22}
                          color={isPicked ? Colors.primary : Colors.white}
                        />
                      </View>
                      <Text
                        style={[
                          styles.reactionLabel,
                          isPicked && styles.reactionLabelSelected,
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
                <View style={styles.avatarCluster}>
                  <View style={[styles.avatarDot, { backgroundColor: Colors.avatarBrown }]}>
                    <Text style={styles.avatarDotText}>P</Text>
                  </View>
                  <View style={[styles.avatarDot, styles.avatarOverlap, { backgroundColor: Colors.avatarWine }]}>
                    <Text style={styles.avatarDotText}>A</Text>
                  </View>
                  <View style={[styles.avatarDot, styles.avatarOverlap, { backgroundColor: Colors.avatarOlive }]}>
                    <Text style={styles.avatarDotText}>Aa</Text>
                  </View>
                </View>
                <Text style={styles.reactorsText}>
                  You, Anaya and 3 more reacted
                </Text>
              </View>

              {/* Remove reaction link */}
              <TouchableOpacity
                onPress={() => {
                  onRemoveReaction?.();
                  onClose();
                }}
                activeOpacity={0.7}
                style={styles.removeBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove my reaction"
              >
                <Text style={styles.removeBtnText}>Remove my reaction</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
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
    borderColor: Colors.borderBold,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSubtle,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: 12,
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
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.transparent,
  },
  reactionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceNavyDark,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
  },
  reactionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  reactionLabelSelected: {
    color: Colors.primary,
  },
  reactorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBackground,
  },
  avatarOverlap: {
    marginLeft: -6,
  },
  avatarDotText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  reactorsText: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  removeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
});

export default ReactionPackModal;

