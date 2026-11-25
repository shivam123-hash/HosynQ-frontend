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
import { useAppDispatch } from '../../../../redux';
import { createList } from '../../../../redux/features/lists/listsSlice';
import { ListGroup, ListType } from '../types';
import { LIST_TYPE_CONFIG } from '../constants';
import { mapUiListTypeToBackend, mapApiListDetailToUiList } from '../listApiHelpers';
import CommonBtn from '../../../../components/CommonBtn';

import { Colors, Fonts, Typography } from '../../../../units';

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
  const dispatch = useAppDispatch();
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

  const handleCreate = async () => {
    const trimmed = listName.trim();
    if (!trimmed) return;

    const config = LIST_TYPE_CONFIG[selectedType];
    const backendType = mapUiListTypeToBackend(selectedType);

    try {
      const res = await dispatch(
        createList({
          name: trimmed,
          type: backendType,
          sharedWithAll: shareWithFamily,
        })
      ).unwrap();

      const uiList = mapApiListDetailToUiList(res);
      onCreateList(uiList);
      onClose();
    } catch (e) {
      console.log('[NewListModal] API creation failed, fallback to local list:', e);
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
    }
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
                placeholderTextColor={Colors.textSecondaryMuted}
                selectionColor={Colors.primary}
              />
            </View>

            {/* Share with whole family switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Share with the whole family</Text>
              <Switch
                value={shareWithFamily}
                onValueChange={setShareWithFamily}
                trackColor={{ false: Colors.borderMutedAlt, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </ScrollView>

          {/* Create Button */}
          <CommonBtn
            title="Create list"
            onPress={handleCreate}
            backgroundColor={Colors.primary}
            height={52}
            borderRadius={26}
            marginTop={16}
            fontSize={16}
          />
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
    backgroundColor: Colors.tasksDarkOverlay,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMutedAlt,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionEyebrow: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
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
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
  },
  typeCardSelected: {
    borderColor: Colors.primary,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Colors.transparent,
  },
  typeTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  typeSubtitle: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.transparent,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 18,
    height: 52,
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.medium,
    color: Colors.white,
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
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  createBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
