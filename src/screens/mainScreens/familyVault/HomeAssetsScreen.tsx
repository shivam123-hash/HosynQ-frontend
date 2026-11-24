import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CarIcon } from './VaultIcons';

export interface HomeAssetsScreenProps {
  onBack?: () => void;
  onSelectAsset?: (asset: any) => void;
  onAddAsset?: () => void;
}

export const HomeAssetsScreen: React.FC<HomeAssetsScreenProps> = ({
  onBack,
  onSelectAsset,
  onAddAsset,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
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

        <Text style={styles.headerTitle}>Home assets</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Assets Card */}
        <View style={styles.card}>
          {/* Asset 1: Flat */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectAsset?.({ title: 'Flat · Sector 45, Gurugram' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F0923A' }]}>
              <Feather name="home" size={20} color="#F0923A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Flat · Sector 45, Gurugram</Text>
              <Text style={styles.rowSubtitle}>
                Property tax due Jul 2027{'\n'}Papers in Documents
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Asset 2: Hyundai Creta */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectAsset?.({ title: 'Hyundai Creta' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <CarIcon size={20} color="#3DC4C4" />
            </View>
            <View style={styles.rowInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.titleRowText}>Hyundai Creta</Text>
                <View style={styles.badgePucDue}>
                  <Text style={styles.badgePucDueText}>PUC due</Text>
                </View>
              </View>
              <Text style={styles.rowSubtitle}>
                DL 3C AB 1234 · PUC expires 15 Nov{'\n'}Insurance and service history linked
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Asset 3: Honda Activa */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectAsset?.({ title: 'Honda Activa' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <CarIcon size={20} color="#3DC4C4" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Honda Activa</Text>
              <Text style={styles.rowSubtitle}>HR 26 CX 4410 · PUC valid till Mar 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Asset 4: Inverter */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectAsset?.({ title: 'Inverter · Luminous' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#4CC38A' }]}>
              <Feather name="activity" size={20} color="#4CC38A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Inverter · Luminous</Text>
              <Text style={styles.rowSubtitle}>
                Battery replaced Feb 2025 · Check Feb 2027
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>

        {/* AI Tip / Scan Banner Card */}
        <View style={styles.tipCard}>
          <Feather name="zap" size={20} color="#F0923A" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Add a photo of the RC or bill and HosynQ fills in the dates for you.
          </Text>
        </View>
      </ScrollView>

      {/* Floating / Pinned Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddAsset}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add asset"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add asset</Text>
        </TouchableOpacity>
      </View>
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
  headerPlaceholder: {
    width: 44,
    height: 44,
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
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRowText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  badgePucDue: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgePucDueText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13.5,
    color: '#C8D1DC',
    lineHeight: 19,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default HomeAssetsScreen;
