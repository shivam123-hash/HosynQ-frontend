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
import {
  IdCardIcon,
  UmbrellaIcon,
  ReceiptIcon,
  SofaIcon,
  ContactCardIcon,
} from './VaultIcons';

export interface FamilyVaultScreenProps {
  onBack?: () => void;
  onSearch?: () => void;
  onViewAlert?: () => void;
  onNavigateToCategory?: (category: string) => void;
  onSelectItem?: (item: any) => void;
  onAddToVault?: () => void;
}

export const FamilyVaultScreen: React.FC<FamilyVaultScreenProps> = ({
  onBack,
  onSearch,
  onViewAlert,
  onNavigateToCategory,
  onSelectItem,
  onAddToVault,
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

        <Text style={styles.headerTitle}>Family Vault</Text>

        <TouchableOpacity
          onPress={onSearch}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Feather name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Banner */}
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={onViewAlert}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Car insurance renews in 19 days"
        >
          <Feather name="alert-circle" size={19} color="#F7C08E" />
          <Text style={styles.alertText}>Car insurance renews in 19 days</Text>
          <Text style={styles.alertAction}>View</Text>
        </TouchableOpacity>

        {/* 2-Column Grid of 6 Categories */}
        <View style={styles.grid}>
          {/* Card 1: Documents and renewals */}
          <TouchableOpacity
            style={[styles.gridCard, styles.row1Card]}
            onPress={() => onNavigateToCategory?.('documents')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Documents and renewals"
          >
            <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
              <IdCardIcon size={20} color="#5B9BF1" />
            </View>
            <Text style={styles.cardTitle}>Documents and renewals</Text>
            <Text style={styles.cardSubtitle}>8 items · 1 due soon</Text>
          </TouchableOpacity>

          {/* Card 2: Insurance */}
          <TouchableOpacity
            style={[styles.gridCard, styles.row1Card]}
            onPress={() => onNavigateToCategory?.('insurance')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Insurance"
          >
            <View style={[styles.iconBox, { borderColor: '#A884F0' }]}>
              <UmbrellaIcon size={20} color="#A884F0" />
            </View>
            <Text style={styles.cardTitle}>Insurance</Text>
            <Text style={styles.cardSubtitle}>4 policies</Text>
          </TouchableOpacity>

          {/* Card 3: Warranties and bills */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onNavigateToCategory?.('warranties')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Warranties and bills"
          >
            <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
              <ReceiptIcon size={18} color="#F06A6A" />
            </View>
            <Text style={styles.cardTitle}>Warranties and bills</Text>
            <Text style={styles.cardSubtitle}>6 items · 1 due</Text>
          </TouchableOpacity>

          {/* Card 4: Home assets */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onNavigateToCategory?.('assets')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Home assets"
          >
            <View style={[styles.iconBox, { borderColor: '#F0923A' }]}>
              <SofaIcon size={20} color="#F0923A" />
            </View>
            <Text style={styles.cardTitle}>Home assets</Text>
            <Text style={styles.cardSubtitle}>4 items</Text>
          </TouchableOpacity>

          {/* Card 5: Important contacts */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onNavigateToCategory?.('contacts')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Important contacts"
          >
            <View style={[styles.iconBox, { borderColor: '#4CC38A' }]}>
              <ContactCardIcon size={20} color="#4CC38A" />
            </View>
            <Text style={styles.cardTitle}>Important contacts</Text>
            <Text style={styles.cardSubtitle}>12 people</Text>
          </TouchableOpacity>

          {/* Card 6: Scans and uploads */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onNavigateToCategory?.('scans')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Scans and uploads"
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <Feather name="image" size={20} color="#3DC4C4" />
            </View>
            <Text style={styles.cardTitle}>Scans and uploads</Text>
            <Text style={styles.cardSubtitle}>24 files</Text>
          </TouchableOpacity>
        </View>

        {/* RECENTLY ADDED */}
        <Text style={styles.sectionHeading}>RECENTLY ADDED</Text>
        <View style={styles.recentCard}>
          {/* Item 1: St. Mary's circular */}
          <TouchableOpacity
            style={styles.recentRow}
            onPress={() => onSelectItem?.({ title: 'St. Mary’s circular' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <Feather name="file-text" size={18} color="#3DC4C4" />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>St. Mary’s circular</Text>
              <Text style={styles.recentSubtitle}>Scans · 28 Oct · Priya</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 2: Electricity bill · October */}
          <TouchableOpacity
            style={styles.recentRow}
            onPress={() => onSelectItem?.({ title: 'Electricity bill · October' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
              <ReceiptIcon size={18} color="#F06A6A" />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>Electricity bill · October</Text>
              <Text style={styles.recentSubtitle}>Bills · 27 Oct · Rohan</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating / Pinned Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddToVault}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add to Vault"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add to Vault</Text>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2236',
    borderWidth: 1,
    borderColor: '#6E4924',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  alertText: {
    flex: 1,
    color: '#F7C08E',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginHorizontal: 10,
  },
  alertAction: {
    color: '#F7C08E',
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridCard: {
    width: '48.2%',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minHeight: 126,
  },
  row1Card: {
    minHeight: 146,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  recentSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
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

export default FamilyVaultScreen;
