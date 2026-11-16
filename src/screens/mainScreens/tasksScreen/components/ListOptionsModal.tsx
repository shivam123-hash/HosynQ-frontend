import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { ListGroup } from '../types';

export interface ListOptionsModalProps {
  visible: boolean;
  list: ListGroup | null;
  onClose: () => void;
  onRenameList: (listId: string, newTitle: string) => void;
  onDuplicateList: (list: ListGroup) => void;
  onClearDoneItems: (listId: string) => void;
  onArchiveList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
}

const ListOptionsModal: React.FC<ListOptionsModalProps> = ({
  visible,
  list,
  onClose,
  onRenameList,
  onDuplicateList,
  onClearDoneItems,
  onArchiveList,
  onDeleteList,
}) => {
  const insets = useSafeAreaInsets();
  const [titleInput, setTitleInput] = useState<string>('');

  useEffect(() => {
    if (list) {
      setTitleInput(list.title);
    }
  }, [list, visible]);

  if (!list) return null;

  const doneCount = list.items.filter((i) => i.isCompleted).length;

  const handleSaveName = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== list.title) {
      onRenameList(list.id, trimmed);
    }
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicateList(list);
    onClose();
  };

  const handleClearDone = () => {
    if (doneCount === 0) {
      Alert.alert('No items to clear', 'There are no completed items on this list.');
      return;
    }
    Alert.alert(
      'Clear done items?',
      `Are you sure you want to remove ${doneCount} completed items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            onClearDoneItems(list.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive list?',
      `"${list.title}" will be moved to archived lists.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            onArchiveList(list.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete list?',
      `"${list.title}" will be permanently deleted for all family members.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteList(list.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close list options"
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.sheetTitle}>List options</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* List Name Input */}
            <Text style={styles.inputLabel}>List name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={titleInput}
                onChangeText={setTitleInput}
                placeholder="List name..."
                placeholderTextColor="#8A97AB"
                selectionColor="#F0913A"
              />
            </View>

            {/* Actions Card */}
            <View style={styles.actionsCard}>
              {/* Duplicate List */}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleDuplicate}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Duplicate list"
              >
                <View style={styles.actionIconBox}>
                  <Feather name="copy" size={20} color="#F0913A" />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={styles.actionTitle}>Duplicate list</Text>
                  <Text style={styles.actionSub}>Reuse it for next year</Text>
                </View>
              </TouchableOpacity>

              {/* Clear Done Items */}
              <TouchableOpacity
                style={[styles.actionRow, styles.rowDivider]}
                onPress={handleClearDone}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Clear done items, removes ${doneCount} items`}
              >
                <View style={styles.actionIconBox}>
                  <Feather name="check-circle" size={20} color="#F0913A" />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={styles.actionTitle}>Clear done items</Text>
                  <Text style={styles.actionSub}>
                    {doneCount > 0
                      ? `Removes the ${doneCount} ticked items`
                      : 'No ticked items yet'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Archive List */}
              <TouchableOpacity
                style={[styles.actionRow, styles.rowDivider]}
                onPress={handleArchive}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Archive list"
              >
                <View style={styles.actionIconBox}>
                  <Feather name="archive" size={20} color="#F0913A" />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={styles.actionTitle}>Archive list</Text>
                  <Text style={styles.actionSub}>Hide it, keep the history</Text>
                </View>
              </TouchableOpacity>

              {/* Delete List */}
              <TouchableOpacity
                style={[styles.actionRow, styles.rowDivider]}
                onPress={handleDelete}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Delete list"
              >
                <View style={styles.actionIconBox}>
                  <Feather name="trash-2" size={20} color="#EF4444" />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={[styles.actionTitle, styles.destructiveText]}>
                    Delete list
                  </Text>
                  <Text style={styles.actionSub}>Removes it for everyone</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Save Name Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveName}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save name"
          >
            <Text style={styles.saveBtnText}>Save name</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ListOptionsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    color: '#8A97AB',
  },
  destructiveText: {
    color: '#EF4444',
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

