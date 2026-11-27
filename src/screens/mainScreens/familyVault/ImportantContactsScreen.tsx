import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { fetchVaultItemsThunk } from '../../../redux/features/vault/vaultSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import VaultDialog, {
  INITIAL_VAULT_DIALOG_STATE,
  VaultDialogState,
} from './VaultDialog';
import { isJestTestEnv, scheduleVaultAfterTransition } from './vaultApiHelpers';

export interface ImportantContactsScreenProps {
  onBack: () => void;
  onAddContact?: () => void;
  onSelectContact?: (item: VaultItemApi) => void;
  itemsOverride?: VaultItemApi[];
}

const FILTER_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'DOCTOR', label: 'Doctors' },
  { id: 'SCHOOL', label: 'School' },
  { id: 'HOME_HELP', label: 'Home help' },
];

const getContactVisual = (kind?: string | null): { icon: string; color: string } => {
  switch (String(kind || '').toUpperCase()) {
    case 'DOCTOR':
      return { icon: 'heart', color: '#E56B9F' };
    case 'SCHOOL':
      return { icon: 'book-open', color: '#5B9BF1' };
    case 'EMERGENCY':
      return { icon: 'alert-circle', color: '#F06A6A' };
    default:
      return { icon: 'tool', color: '#F0CA45' };
  }
};

export const ImportantContactsScreen: React.FC<ImportantContactsScreenProps> = ({
  onBack,
  onAddContact,
  onSelectContact,
  itemsOverride,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);

  const [selectedKind, setSelectedKind] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [dialog, setDialog] = useState<VaultDialogState>(INITIAL_VAULT_DIALOG_STATE);

  const loadContacts = useCallback(async () => {
    await dispatch(fetchVaultItemsThunk({ category: 'CONTACTS' }));
  }, [dispatch]);

  useEffect(() => {
    if (itemsOverride || (isJestTestEnv() && vaultState.hasLoadedItems)) return;
    return scheduleVaultAfterTransition(() => {
      loadContacts();
    });
  }, [itemsOverride, loadContacts, vaultState.hasLoadedItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadContacts();
    } finally {
      setRefreshing(false);
    }
  }, [loadContacts]);

  const allContacts = useMemo(() => {
    const source = itemsOverride || vaultState.items;
    return source.filter(
      (item) => String(item.category).toUpperCase() === 'CONTACTS'
    );
  }, [itemsOverride, vaultState.items]);

  const emergencyContacts = useMemo(
    () =>
      allContacts.filter(
        (c) => String(c.kind || '').toUpperCase() === 'EMERGENCY'
      ),
    [allContacts]
  );

  const filteredContacts = useMemo(() => {
    const nonEmergency = allContacts.filter(
      (c) => String(c.kind || '').toUpperCase() !== 'EMERGENCY'
    );
    const byKind =
      selectedKind === 'ALL'
        ? nonEmergency
        : nonEmergency.filter(
            (c) => String(c.kind || '').toUpperCase() === selectedKind
          );
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byKind;
    return byKind.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.provider || '').toLowerCase().includes(q)
    );
  }, [allContacts, searchQuery, selectedKind]);

  const isInitialLoading =
    !itemsOverride &&
    !vaultState.hasLoadedItems &&
    vaultState.loadingItems;

  const dialNumber = async (label: string, phone?: string | null) => {
    const clean = (phone || '').replace(/[^+\d]/g, '');
    if (!clean) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'phone',
        title: label,
        description: 'No phone number has been saved for this contact yet.',
        primaryButtonText: 'OK',
      });
      return;
    }

    const url = `tel:${clean}`;
    try {
      await Linking.openURL(url);
    } catch {
      try {
        await Linking.openURL(`telprompt:${clean}`);
      } catch {
        setDialog({
          visible: true,
          type: 'warning',
          iconName: 'phone-call',
          title: `Call ${label}`,
          description: `Phone dialing is unavailable on this device.\nNumber: ${phone}`,
          primaryButtonText: 'OK',
        });
      }
    }
  };

  const handleAddPress = () => {
    if (onAddContact) {
      onAddContact();
      return;
    }
    setAddModalVisible(true);
  };

  const nationalEmergencyNumbers: Array<{
    id: string;
    title: string;
    subtitle: string;
    phone: string;
  }> = [
    { id: 'ambulance', title: 'Ambulance', subtitle: '108 · National helpline', phone: '108' },
    { id: 'police', title: 'Police / Emergency', subtitle: '112 · National helpline', phone: '112' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Important contacts</Text>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handleAddPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Add contact"
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isInitialLoading ? (
        <VaultListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 40 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F0923A"
              colors={['#F0923A']}
            />
          }
        >
          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={18}
              color="#8A97AB"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, school, home help..."
              placeholderTextColor="#7A89A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {FILTER_CHIPS.map((chip) => {
              const active = chip.id === selectedKind;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedKind(chip.id)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionHeading}>SAVED CONTACTS</Text>
          {filteredContacts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="phone" size={22} color="#F0CA45" />
              <Text style={styles.emptyTitle}>No contacts saved yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap + above to add doctors, school offices, electricians, or plumbers for quick calling.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {filteredContacts.map((contact, idx) => {
                const vis = getContactVisual(contact.kind);
                const subtitleParts = [
                  contact.role || contact.provider,
                  contact.phone,
                  contact.hours,
                ].filter(Boolean);

                return (
                  <React.Fragment key={contact.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.rowMain}
                        activeOpacity={0.75}
                        onPress={() => onSelectContact?.(contact)}
                      >
                        <View style={[styles.iconBox, { borderColor: vis.color }]}>
                          <Feather
                            name={vis.icon as any}
                            size={18}
                            color={vis.color}
                          />
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {contact.title}
                          </Text>
                          <Text style={styles.rowSubtitle} numberOfLines={1}>
                            {subtitleParts.join(' · ') || 'No details'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => dialNumber(contact.title, contact.phone)}
                        activeOpacity={0.75}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Call ${contact.title}`}
                      >
                        <Feather name="phone" size={16} color="#6FD9A6" />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionHeading}>EMERGENCY</Text>
          <View style={styles.card}>
            {(emergencyContacts.length > 0
              ? emergencyContacts.map((c) => ({
                  id: c.id,
                  title: c.title,
                  subtitle: [c.phone, c.role || 'Emergency contact']
                    .filter(Boolean)
                    .join(' · '),
                  phone: c.phone || '',
                  item: c as VaultItemApi | undefined,
                }))
              : nationalEmergencyNumbers.map((n) => ({
                  ...n,
                  item: undefined,
                }))
            ).map((em, idx) => (
              <React.Fragment key={em.id}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.rowMain}
                    activeOpacity={0.75}
                    disabled={!em.item}
                    onPress={() => em.item && onSelectContact?.(em.item)}
                  >
                    <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
                      <Feather name="alert-circle" size={18} color="#F06A6A" />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle}>{em.title}</Text>
                      <Text style={styles.rowSubtitle}>{em.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.emergencyCallBtn}
                    onPress={() => dialNumber(em.title, em.phone)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${em.title}`}
                  >
                    <Feather name="phone" size={16} color="#F06A6A" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}

      <AddEditVaultItemModal
        visible={addModalVisible}
        initialCategory="CONTACTS"
        onClose={() => setAddModalVisible(false)}
        onSaved={loadContacts}
      />

      <VaultDialog
        dialog={dialog}
        onClose={() => setDialog(INITIAL_VAULT_DIALOG_STATE)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#3A4555',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  chipsScroll: {
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#223859',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#C8D1DC',
  },
  filterChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#162844',
    borderWidth: 1,
    borderColor: '#253856',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#162844',
    borderWidth: 1,
    borderColor: '#253856',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
});

export default ImportantContactsScreen;
