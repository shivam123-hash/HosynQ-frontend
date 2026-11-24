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
import { ReceiptIcon } from './VaultIcons';

export interface WarrantiesBillsScreenProps {
  onBack?: () => void;
  onSelectBill?: (bill: any) => void;
  onPayBill?: (bill: any) => void;
  onSelectWarranty?: (warranty: any) => void;
  onAddBillOrWarranty?: () => void;
}

export const WarrantiesBillsScreen: React.FC<WarrantiesBillsScreenProps> = ({
  onBack,
  onSelectBill,
  onPayBill,
  onSelectWarranty,
  onAddBillOrWarranty,
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

        <Text style={styles.headerTitle}>Warranties and bills</Text>

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
        {/* Section: BILLS */}
        <Text style={styles.sectionHeading}>BILLS</Text>
        <View style={styles.card}>
          {/* Bill 1: Electricity */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectBill?.({ title: 'Electricity · BSES' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
              <ReceiptIcon size={18} color="#F06A6A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Electricity · BSES</Text>
              <Text style={styles.rowSubtitle}>₹2,840 · Due tomorrow</Text>
            </View>
            <View style={styles.badgeDue}>
              <Text style={styles.badgeDueText}>Due</Text>
            </View>
            <TouchableOpacity
              onPress={() => onPayBill?.({ title: 'Electricity · BSES' })}
              activeOpacity={0.8}
              style={{ marginLeft: 10, paddingVertical: 4, paddingHorizontal: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Pay Electricity BSES"
            >
              <Text style={styles.payText}>Pay</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Bill 2: Internet */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectBill?.({ title: 'Internet · Airtel' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <Feather name="wifi" size={18} color="#3DC4C4" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Internet · Airtel</Text>
              <Text style={styles.rowSubtitle}>₹999 · Due 10 Nov</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Bill 3: Water */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectBill?.({ title: 'Water' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <ReceiptIcon size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Water</Text>
              <Text style={styles.rowSubtitle}>Paid 25 Oct</Text>
            </View>
            <View style={styles.badgePaid}>
              <Text style={styles.badgePaidText}>Paid</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Section: WARRANTIES */}
        <Text style={styles.sectionHeading}>WARRANTIES</Text>
        <View style={styles.card}>
          {/* Warranty 1: Samsung TV */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectWarranty?.({ title: 'Samsung TV' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F7C08E' }]}>
              <Feather name="tool" size={18} color="#F7C08E" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Samsung TV</Text>
              <Text style={styles.rowSubtitle}>Warranty ends 20 Nov 2026</Text>
            </View>
            <View style={styles.badgeEndsSoon}>
              <Text style={styles.badgeEndsSoonText}>Ends soon</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Warranty 2: LG refrigerator */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectWarranty?.({ title: 'LG refrigerator' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="tool" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>LG refrigerator</Text>
              <Text style={styles.rowSubtitle}>Covered until Jun 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Warranty 3: Kent RO purifier */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectWarranty?.({ title: 'Kent RO purifier' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="tool" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Kent RO purifier</Text>
              <Text style={styles.rowSubtitle}>Service due Jan 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating / Pinned Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddBillOrWarranty}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add bill or warranty"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add bill or warranty</Text>
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
  badgeDue: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F06A6A',
  },
  badgeDueText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
  payText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
  badgePaid: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6FD9A6',
  },
  badgePaidText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
  },
  badgeEndsSoon: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgeEndsSoonText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
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

export default WarrantiesBillsScreen;
