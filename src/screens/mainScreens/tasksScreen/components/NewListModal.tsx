import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ListGroup, ListType } from '../types';
import { LIST_TYPE_CONFIG } from '../mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface NewListModalProps {
  visible: boolean;
  prefillType?: ListType;
  onClose: () => void;
  onCreateList: (newList: ListGroup) => void;
}

const LIST_TYPES: ListType[] = [
  'grocery',
  'packing',
  'school',
  'party',
  'custom',
];

const renderTypeIcon = (type: ListType, color: string) => {
  switch (type) {
    case 'grocery':
      return <Ionicons name="cart-outline" size={20} color={color} />;
    case 'packing':
      return <Ionicons name="bag-handle-outline" size={18} color={color} />;
    case 'school':
      return <Ionicons name="school-outline" size={18} color={color} />;
    case 'party':
      return <Ionicons name="sparkles-outline" size={18} color={color} />;
    case 'custom':
      return <Ionicons name="list-outline" size={20} color={color} />;
  }
};

const NewListModal: React.FC<NewListModalProps> = ({
  visible,
  prefillType = 'grocery',
  onClose,
  onCreateList,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<ListType>(prefillType);
  const [listName, setListName] = useState<string>('Weekend groceries');
  const [shareWithFamily, setShareWithFamily] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      setSelectedType(prefillType);
      const config = LIST_TYPE_CONFIG[prefillType];
      setListName(
        prefillType === 'grocery'
          ? 'Weekend groceries'
          : prefillType === 'packing'
          ? 'Goa trip packing'
          : `${config.label} list`
      );
      setShareWithFamily(true);
    }
  }, [prefillType, visible]);

  const handleSelectType = (type: ListType) => {
    setSelectedType(type);
    const config = LIST_TYPE_CONFIG[type];
    if (
      listName === 'Weekend groceries' ||
      listName === 'Goa trip packing' ||
      listName.endsWith(' list')
    ) {
      setListName(
        type === 'grocery'
          ? 'Weekend groceries'
          : type === 'packing'
          ? 'Goa trip packing'
          : `${config.label} list`
      );
    }
  };

  const handleCreate = () => {
    const trimmed = listName.trim();
    if (!trimmed) return;

    const config = LIST_TYPE_CONFIG[selectedType];
    const newList: ListGroup = {
      id: `lst-${Date.now()}`,
      title: trimmed,
      type: selectedType,
      typeLabel: config.label,
      items: [],
      sharedWith: shareWithFamily
        ? ['Priya', 'Rohan', 'Dadi', 'Anaya', 'Aarav']
        : ['Priya'],
      isSharedWithAll: shareWithFamily,
    };

    onCreateList(newList);
    onClose();
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
          accessibilityLabel="Close new list modal"
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
          <Text style={styles.sheetTitle}>New list</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section Eyebrow */}
            <Text style={styles.sectionEyebrow}>WHAT KIND OF LIST?</Text>

            {/* 2-Column Grid of 5 Types matching design */}
            <View style={styles.typesGrid}>
              {LIST_TYPES.map((type) => {
                const config = LIST_TYPE_CONFIG[type];
                const isSelected = selectedType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                    ]}
                    onPress={() => handleSelectType(type)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${config.label}: ${config.subtitle}`}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { borderColor: config.color },
                      ]}
                    >
                      {renderTypeIcon(type, config.color)}
                    </View>

                    <View style={styles.typeTextCol}>
                      <Text style={styles.typeLabel}>{config.label}</Text>
                      <Text style={styles.typeSubtitle}>{config.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* List Name Input */}
            <Text style={styles.inputLabel}>List name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={listName}
                onChangeText={setListName}
                placeholder="Enter list name..."
                placeholderTextColor="#8A97AB"
                selectionColor="#F0913A"
              />
            </View>

            {/* Share with whole family switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Share with the whole family</Text>
              <Switch
                value={shareWithFamily}
                onValueChange={setShareWithFamily}
                trackColor={{ false: '#3A4556', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreate}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create list"
          >
            <Text style={styles.createBtnText}>Create list</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NewListModal;

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
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
  },
  typeCardSelected: {
    borderColor: '#F0913A',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  typeTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#8A97AB',
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#122440',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    paddingHorizontal: 18,
    height: 52,
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    padding: 0,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
