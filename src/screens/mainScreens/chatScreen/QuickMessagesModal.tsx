import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { QuickMessageItem } from './types';

export interface QuickMessagesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectQuickMessage: (text: string) => void;
  onSaveQuickMessages?: (updatedList: string[]) => void;
  customMessages?: string[];
}

const DEFAULT_QUICK_MESSAGES_LIST: string[] = [
  'On my way',
  'Running 10 minutes late',
  'Reached safely',
  'Can someone pick me up?',
  'Call me when you’re free',
  'Dinner’s ready',
];

export const QuickMessagesModal: React.FC<QuickMessagesModalProps> = ({
  visible,
  onClose,
  onSelectQuickMessage,
  onSaveQuickMessages,
  customMessages,
}) => {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [messagesList, setMessagesList] = useState<string[]>(DEFAULT_QUICK_MESSAGES_LIST);
  const [newText, setNewText] = useState('');

  // Sync custom messages from props/Redux
  useEffect(() => {
    if (customMessages && customMessages.length > 0) {
      setMessagesList(customMessages);
    } else {
      setMessagesList(DEFAULT_QUICK_MESSAGES_LIST);
    }
  }, [customMessages]);

  // Reset edit state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
      setNewText('');
    }
  }, [visible]);

  const handleSelect = (title: string) => {
    onSelectQuickMessage(title);
    onClose();
  };

  const handleAddMessage = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    if (messagesList.includes(trimmed)) {
      Alert.alert('Duplicate', 'This quick message already exists.');
      return;
    }
    setMessagesList((prev) => [...prev, trimmed]);
    setNewText('');
  };

  const handleDeleteMessage = (index: number) => {
    setMessagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (messagesList.length === 0) {
      Alert.alert('Empty', 'You must have at least one quick message.');
      return;
    }
    if (onSaveQuickMessages) {
      onSaveQuickMessages(messagesList);
    }
    setIsEditing(false);
    Alert.alert('Saved', 'Quick messages updated successfully.');
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

              {/* Header Row */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.sheetTitle}>
                    {isEditing ? 'Edit quick messages' : 'Quick messages'}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {isEditing
                      ? 'Add, edit or delete your quick messages.'
                      : 'Tap one to send it to Family chat.'}
                  </Text>
                </View>

                {isEditing && (
                  <TouchableOpacity
                    style={styles.doneHeaderBtn}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.doneHeaderBtnText}>Save</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Edit Mode: Add New Message Bar */}
              {isEditing && (
                <View style={styles.addInputRow}>
                  <TextInput
                    style={styles.addInput}
                    value={newText}
                    onChangeText={setNewText}
                    placeholder="Type new quick message..."
                    placeholderTextColor={Colors.textSecondary}
                    onSubmitEditing={handleAddMessage}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      !newText.trim() && styles.addBtnDisabled,
                    ]}
                    onPress={handleAddMessage}
                    disabled={!newText.trim()}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Messages Container Card */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.cardContainer}
                showsVerticalScrollIndicator={false}
              >
                {messagesList.map((msg, index) => (
                  <View
                    key={`qm-${index}-${msg}`}
                    style={[
                      styles.rowItem,
                      index > 0 && styles.rowDivider,
                    ]}
                  >
                    {/* Left Icon */}
                    <View style={styles.iconBox}>
                      <Feather
                        name={isEditing ? 'message-circle' : 'send'}
                        size={16}
                        color={Colors.primary}
                      />
                    </View>

                    {/* Text Title */}
                    <TouchableOpacity
                      style={styles.textGroup}
                      onPress={() => {
                        if (!isEditing) handleSelect(msg);
                      }}
                      activeOpacity={isEditing ? 1 : 0.7}
                    >
                      <Text style={styles.itemTitle}>{msg}</Text>
                    </TouchableOpacity>

                    {/* Right Action: Delete icon in edit mode, or send icon in selection mode */}
                    {isEditing ? (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteMessage(index)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleSelect(msg)}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="send"
                          size={16}
                          color={Colors.primary}
                          style={styles.sendIcon}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Bottom Actions */}
              {isEditing ? (
                <View style={styles.editActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setIsEditing(false);
                      setNewText('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <Feather name="check" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
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
              )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  doneHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  doneHeaderBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  addInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: Colors.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  scrollArea: {
    maxHeight: 360,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textGroup: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: Colors.white,
  },
  sendIcon: {
    marginLeft: 12,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editIcon: {
    marginRight: 8,
  },
  editText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: Colors.primary,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
});

export default QuickMessagesModal;
