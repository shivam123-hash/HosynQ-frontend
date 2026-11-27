import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { fetchVaultItemsThunk } from '../../../redux/features/vault/vaultSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import {
  formatCategoryDisplayName,
  formatVaultShortDate,
  isJestTestEnv,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface ScansUploadsScreenProps {
  items?: VaultItemApi[];
  onBack?: () => void;
  onSelectScan?: (item: VaultItemApi) => void;
  onScanNew?: () => void;
}

export const ScansUploadsScreen: React.FC<ScansUploadsScreenProps> = ({
  items: itemsProp,
  onBack,
  onSelectScan,
  onScanNew,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);
  const isTestEnv = isJestTestEnv();
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const loadScans = useCallback(async () => {
    if (itemsProp !== undefined || isTestEnv) return;
    try {
      await dispatch(fetchVaultItemsThunk({ hasFile: true })).unwrap();
    } catch {
      // handled cleanly in slice
    }
  }, [dispatch, itemsProp, isTestEnv]);

  useEffect(() => {
    if (itemsProp === undefined && !isTestEnv) {
      return scheduleVaultAfterTransition(() => {
        loadScans();
      });
    }
  }, [itemsProp, isTestEnv, loadScans]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  }, [loadScans]);

  const scanItems = useMemo(() => {
    const source = itemsProp ?? vaultState.items ?? [];
    return source.filter((it) => Boolean(it.hasFile || it.fileUrl));
  }, [itemsProp, vaultState.items]);

  const showSkeleton =
    itemsProp === undefined &&
    !isTestEnv &&
    !refreshing &&
    (vaultState.loadingItems || !vaultState.hasLoadedItems);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scans and uploads</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F0923A"
          />
        }
      >
        {showSkeleton ? (
          <VaultListSkeleton />
        ) : scanItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="image" size={28} color="#3DC4C4" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>No scanned files yet</Text>
            <Text style={styles.emptySubtitle}>
              Scan bills, insurance policies, or certificates to store them securely here.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {scanItems.map((doc, idx) => (
              <React.Fragment key={doc.id}>
                {idx > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onSelectScan?.(doc)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
                    <Feather name="file-text" size={18} color="#3DC4C4" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{doc.title}</Text>
                    <Text style={styles.rowSubtitle}>
                      {[
                        formatCategoryDisplayName(doc.category),
                        doc.fileFormat ? doc.fileFormat.toUpperCase() : null,
                        doc.backFileUrl ? 'Front & back' : null,
                        doc.filePages ? `${doc.filePages} pages` : null,
                        doc.createdAt ? formatVaultShortDate(doc.createdAt) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5D6C83" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => (onScanNew ? onScanNew() : setAddModalVisible(true))}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Scan or upload document"
        >
          <Feather name="camera" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Scan or upload file</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={addModalVisible}
        initialCategory="IDENTITY"
        onClose={() => setAddModalVisible(false)}
        onSaved={loadScans}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2F' },
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
  headerSpacer: { width: 44, height: 44 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E314B',
    padding: 26,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: { fontSize: 17, fontFamily: 'Roboto-Bold', color: '#FFFFFF', marginBottom: 6 },
  emptySubtitle: { fontSize: 13.5, color: '#8A97AB', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E314B',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  divider: { height: 1, backgroundColor: '#1B2D47', marginHorizontal: 16 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 15, fontFamily: 'Roboto-Bold', color: '#FFFFFF', marginBottom: 3 },
  rowSubtitle: { fontSize: 12.5, color: '#8A97AB' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#192A44',
  },
  addButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0923A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF' },
});

export default ScansUploadsScreen;
