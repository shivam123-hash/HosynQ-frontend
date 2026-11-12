import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { QuickMessageItem } from './types';

export interface QuickMessagesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectQuickMessage: (text: string) => void;
  onEditQuickMessages?: () => void;
}

const QUICK_MESSAGES: QuickMessageItem[] = [
  {
    id: 'qm-1',
    title: 'On my way',
    subtitle: 'Adds your ETA',
    iconName: 'navigation',
    iconColor: Colors.accentBlue,
  },
  {
    id: 'qm-2',
    title: 'Running 10 minutes late',
    iconName: 'clock',
    iconColor: Colors.textSecondary,
  },
  {
    id: 'qm-3',
    title: 'Reached safely',
    iconName: 'check-circle',
    iconColor: Colors.accentTeal,
  },
  {
    id: 'qm-4',
    title: 'Can someone pick me up?',
    iconName: 'truck',
    iconColor: Colors.textSecondary,
  },
  {
    id: 'qm-5',
    title: 'Call me when you’re free',
    iconName: 'phone',
    iconColor: Colors.textSecondary,
  },
  {
    id: 'qm-6',
    title: 'Dinner’s ready',
    iconName: 'home',
    iconColor: Colors.primary,
  },
];

export const QuickMessagesModal: React.FC<QuickMessagesModalProps> = ({
  visible,
  onClose,
  onSelectQuickMessage,
  onEditQuickMessages,
}) => {
  const insets = useSafeAreaInsets();

  const handleSelect = (item: QuickMessageItem) => {
    onSelectQuickMessage(item.title);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleBar} />

              {/* Header */}
              <Text style={styles.sheetTitle}>Quick messages</Text>
              <Text style={styles.sheetSubtitle}>
                Tap one to send it to Family chat.
              </Text>

              {/* Messages Container Card */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.cardContainer}
                showsVerticalScrollIndicator={false}
              >
                {QUICK_MESSAGES.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rowItem,
                      index > 0 && styles.rowDivider,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    {/* Icon */}
                    <View style={styles.iconBox}>
                      <Feather
                        name={item.iconName as any}
                        size={18}
                        color={item.iconColor}
                      />
                    </View>

                    {/* Text */}
                    <View style={styles.textGroup}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.subtitle ? (
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      ) : null}
                    </View>

                    {/* Send Arrow Icon */}
                    <Feather
                      name="send"
                      size={16}
                      color={Colors.primary}
                      style={styles.sendIcon}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Edit Quick Messages Link */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditQuickMessages || onClose}
                activeOpacity={0.7}
              >
                <Feather
                  name="edit-2"
                  size={16}
                  color={Colors.primary}
                  style={styles.editIcon}
                />
                <Text style={styles.editText}>Edit quick messages</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 380,
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textGroup: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sendIcon: {
    transform: [{ rotate: '45deg' }],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  editIcon: {
    marginRight: 8,
  },
  editText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default QuickMessagesModal;
