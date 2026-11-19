import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  StatusBar,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export type ChildRelationship = 'Daughter' | 'Son' | 'Grandchild' | 'Other';

export interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  onAddChild?: (childData: {
    name: string;
    dob: string;
    relationship: ChildRelationship;
    selectedColor: string;
    canSignIn: boolean;
  }) => void;
  isScreen?: boolean;
}

const AVATAR_COLORS = [
  '#F7A8C8', // Pink
  '#8EB7F5', // Soft Blue
  '#9BD4AA', // Mint
  '#F3C049', // Warm Yellow
  '#C9A8EF', // Lavender
  '#80D0D1', // Soft Teal
];

export const AddChildModal: React.FC<AddChildModalProps> = ({
  visible,
  onClose,
  onAddChild,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedColor, setSelectedColor] = useState<string>('#F7A8C8');
  const [name, setName] = useState('Myra');
  const [dob, setDob] = useState('14 Mar 2022');
  const [relationship, setRelationship] =
    useState<ChildRelationship>('Daughter');
  const [canSignIn, setCanSignIn] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(true);
  const [isDobFocused, setIsDobFocused] = useState(false);

  const handleAddChild = () => {
    if (onAddChild) {
      onAddChild({
        name,
        dob,
        relationship,
        selectedColor,
        canSignIn,
      });
    } else {
      Alert.alert(
        'Child Added',
        `${name} has been added as your ${relationship.toLowerCase()}.`
      );
      onClose();
    }
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButtonLeft}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add a child</Text>
      </View>

      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Picker & Color Palette Row */}
        <View style={styles.avatarSectionRow}>
          <TouchableOpacity
            style={styles.cameraCircle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add child photo"
          >
            <Feather name="camera" size={22} color="#F0913A" />
          </TouchableOpacity>

          <View style={styles.colorPaletteGroup}>
            <Text style={styles.colorPaletteLabel}>
              Add a photo or pick a colour
            </Text>

            <View style={styles.dotsRow}>
              {AVATAR_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      isSelected && styles.colorDotSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Pick color ${color}`}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Input 1: Name */}
        <Text style={styles.inputLabel}>Name</Text>
        <View
          style={[
            styles.inputWrapper,
            isNameFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Child's name"
            placeholderTextColor="#6E8096"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            accessibilityLabel="Name"
          />
        </View>

        {/* Input 2: Date of birth */}
        <Text style={styles.inputLabel}>Date of birth</Text>
        <View
          style={[
            styles.inputWrapper,
            isDobFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={dob}
            onChangeText={setDob}
            placeholder="e.g. 14 Mar 2022"
            placeholderTextColor="#6E8096"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsDobFocused(true)}
            onBlur={() => setIsDobFocused(false)}
            accessibilityLabel="Date of birth"
          />
          <Feather name="calendar" size={18} color="#8997AB" />
        </View>

        {/* Age Helper Text */}
        <Text style={styles.ageHelperText}>{`${name || 'Child'} is 4 years old.`}</Text>

        {/* RELATIONSHIP Section */}
        <Text style={styles.roleSectionLabel}>RELATIONSHIP</Text>
        <View style={styles.roleChipsRow}>
          {(['Daughter', 'Son', 'Grandchild', 'Other'] as ChildRelationship[]).map(
            (rel) => {
              const isSelected = relationship === rel;
              return (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.roleChip,
                    isSelected ? styles.roleChipActive : styles.roleChipInactive,
                  ]}
                  onPress={() => setRelationship(rel)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Relationship ${rel}`}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected
                        ? styles.roleChipTextActive
                        : styles.roleChipTextInactive,
                    ]}
                  >
                    {rel}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Info Notice Box */}
        <View style={styles.infoNoticeBox}>
          <Feather
            name="shield"
            size={18}
            color="#8997AB"
            style={styles.infoNoticeIcon}
          />
          <Text style={styles.infoNoticeText}>
            Children don't need a phone. Parents manage their profile, location
            and reminders.
          </Text>
        </View>

        {/* Toggle Card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleTitle}>
              Can sign in on their own phone
            </Text>
            <Text style={styles.toggleSubtitle}>Needs decision for V1</Text>
          </View>

          <Switch
            value={canSignIn}
            onValueChange={setCanSignIn}
            trackColor={{ false: '#24364D', true: '#F0913A' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Can sign in on their own phone toggle"
          />
        </View>
      </ScrollView>

      {/* Pinned Bottom Button */}
      <View
        style={[
          styles.pinnedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        <TouchableOpacity
          style={styles.addChildButton}
          onPress={handleAddChild}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add child"
        >
          <Text style={styles.addChildButtonText}>Add child</Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  colorPaletteGroup: {
    flex: 1,
  },
  colorPaletteLabel: {
    fontSize: 13,
    color: '#CAD4DF',
    fontWeight: '500',
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 14,
    color: '#CAD4DF',
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0,
  },
  ageHelperText: {
    fontSize: 13,
    color: '#8997AB',
    marginTop: 6,
    marginBottom: 6,
  },
  roleSectionLabel: {
    fontSize: 12,
    color: '#8997AB',
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
  },
  roleChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleChip: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipActive: {
    backgroundColor: '#F0913A',
  },
  roleChipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  roleChipText: {
    fontSize: 14,
  },
  roleChipTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  roleChipTextInactive: {
    color: '#C8D1DC',
    fontWeight: '500',
  },
  infoNoticeBox: {
    backgroundColor: '#122440',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoNoticeIcon: {
    marginRight: 12,
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#CAD4DF',
    lineHeight: 18,
  },
  toggleCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#8997AB',
    marginTop: 2,
  },
  pinnedBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#17273F',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addChildButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddChildModal;
