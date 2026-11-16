import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface FamilyVaultModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFile?: (fileName: string) => void;
}

interface VaultFile {
  id: string;
  title: string;
  category: 'School' | 'Bills' | 'Photos' | 'Health' | 'IDs';
  dateMeta: string;
  uploader: 'Priya' | 'Rohan';
  iconType: 'document' | 'photo';
  themeColor: string;
}

const VAULT_FILES: VaultFile[] = [
  {
    id: '1',
    title: 'St. Mary’s circular',
    category: 'School',
    dateMeta: 'Scanned 28 Oct · 2 items added',
    uploader: 'Priya',
    iconType: 'document',
    themeColor: Colors.accentBlue,
  },
  {
    id: '2',
    title: 'Electricity bill · October',
    category: 'Bills',
    dateMeta: 'Uploaded 27 Oct',
    uploader: 'Rohan',
    iconType: 'document',
    themeColor: Colors.accentRed,
  },
  {
    id: '3',
    title: 'IMG_2041.jpg',
    category: 'Photos',
    dateMeta: 'Today',
    uploader: 'Priya',
    iconType: 'photo',
    themeColor: Colors.accentTeal,
  },
  {
    id: '4',
    title: 'Aarav · Vaccination certificate',
    category: 'Health',
    dateMeta: '12 Sep',
    uploader: 'Priya',
    iconType: 'document',
    themeColor: Colors.accentPurpleLight,
  },
  {
    id: '5',
    title: 'Car insurance policy',
    category: 'Bills',
    dateMeta: '18 Nov 2025',
    uploader: 'Rohan',
    iconType: 'document',
    themeColor: Colors.accentRed,
  },
];

const CATEGORIES = ['All 24', 'Bills', 'School', 'Health', 'IDs'] as const;

export const FamilyVaultModal: React.FC<FamilyVaultModalProps> = ({
  visible,
  onClose,
  onSelectFile,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>('All 24');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = VAULT_FILES.filter((file) => {
    const matchesCategory =
      selectedCategory === 'All 24' || file.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      file.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.circleBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Vault</Text>
          <View style={styles.circleBtnPlaceholder} />
        </View>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 16, 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Proposed Callout Card */}
          <View style={styles.calloutCard}>
            <View style={styles.calloutIconBox}>
              <Feather name="inbox" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.calloutText}>
              Proposed: every scan and upload is kept here, sorted by type.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={Colors.textSubtle} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search files"
              placeholderTextColor={Colors.textSubtle}
              style={styles.searchInput}
            />
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                  style={[styles.catPill, isActive && styles.catPillActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      isActive && styles.catPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section: RECENT */}
          <Text style={styles.sectionHeading}>RECENT</Text>

          {/* File Card Container */}
          <View style={styles.fileContainerCard}>
            {filteredFiles.map((file, idx) => {
              const isPriya = file.uploader === 'Priya';
              return (
                <React.Fragment key={file.id}>
                  {idx > 0 && <View style={styles.fileDivider} />}
                  <TouchableOpacity
                    onPress={() => {
                      onSelectFile?.(file.title);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={styles.fileRow}
                    accessibilityRole="button"
                    accessibilityLabel={file.title}
                  >
                    {/* Colored outlined icon box */}
                    <View
                      style={[
                        styles.iconBox,
                        {
                          borderColor: file.themeColor,
                          backgroundColor: `${file.themeColor}18`,
                        },
                      ]}
                    >
                      <Feather
                        name={file.iconType === 'photo' ? 'image' : 'file-text'}
                        size={18}
                        color={file.themeColor}
                      />
                    </View>

                    {/* File Meta Col */}
                    <View style={styles.fileInfoCol}>
                      <Text style={styles.fileTitle} numberOfLines={1}>
                        {file.title}
                      </Text>
                      <Text style={styles.fileMeta} numberOfLines={1}>
                        {file.category} · {file.dateMeta}
                      </Text>
                    </View>

                    {/* Uploader Avatar Circle */}
                    <View
                      style={[
                        styles.avatarCircle,
                        isPriya ? styles.priyaAvatarBg : styles.rohanAvatarBg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          isPriya
                            ? styles.priyaAvatarText
                            : styles.rohanAvatarText,
                        ]}
                      >
                        {isPriya ? 'P' : 'R'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSubtle,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPlaceholder: {
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  calloutCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.4)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calloutIconBox: {
    marginRight: 10,
  },
  calloutText: {
    flex: 1,
    fontSize: 13,
    color: Colors.amberLight,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceDropzone,
    borderWidth: 1,
    borderColor: Colors.surfaceNavyDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  catPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  catPillTextActive: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  fileContainerCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  fileDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fileInfoCol: {
    flex: 1,
  },
  fileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 3,
  },
  fileMeta: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  priyaAvatarBg: {
    backgroundColor: Colors.avatarBrown,
  },
  priyaAvatarText: {
    color: Colors.amberLight,
  },
  rohanAvatarBg: {
    backgroundColor: Colors.cardElevated,
  },
  rohanAvatarText: {
    color: Colors.accentBlueLight,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
