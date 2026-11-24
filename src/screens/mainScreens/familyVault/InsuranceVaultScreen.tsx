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

export interface InsuranceVaultScreenProps {
  onBack?: () => void;
  onSelectPolicy?: (policy: any) => void;
  onRenewPolicy?: (policy: any) => void;
  onAddPolicy?: () => void;
  onAddHomeInsurance?: () => void;
}

export const InsuranceVaultScreen: React.FC<InsuranceVaultScreenProps> = ({
  onBack,
  onSelectPolicy,
  onRenewPolicy,
  onAddPolicy,
  onAddHomeInsurance,
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

        <Text style={styles.headerTitle}>Insurance</Text>

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
        {/* Card 1: Motor (HDFC ERGO) */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectPolicy?.({ type: 'motor', title: 'HDFC ERGO · Hyundai Creta' })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.tagRow}>
              <Feather name="truck" size={15} color="#3DC4C4" />
              <Text style={[styles.tagText, { color: '#3DC4C4' }]}>MOTOR</Text>
            </View>
            <View style={styles.badgeOrange}>
              <Text style={styles.badgeOrangeText}>Renews in 19 days</Text>
            </View>
          </View>

          <Text style={styles.policyTitle}>HDFC ERGO · Hyundai Creta</Text>
          <Text style={styles.policySubtitle}>Policy •••• 7732 · ₹14,250 a year</Text>
          <Text style={styles.policySubtitle}>Renews Wed, 18 Nov 2026 · Rohan</Text>

          <TouchableOpacity
            style={styles.renewNowBtn}
            onPress={() => onRenewPolicy?.({ type: 'motor', title: 'HDFC ERGO · Hyundai Creta' })}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Renew now"
          >
            <Text style={styles.renewNowBtnText}>Renew now</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Card 2: Health (Star Health) */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectPolicy?.({ type: 'health', title: 'Star Health Family Floater' })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.tagRow}>
              <Feather name="heart" size={15} color="#A884F0" />
              <Text style={[styles.tagText, { color: '#A884F0' }]}>HEALTH</Text>
            </View>
          </View>

          <Text style={styles.policyTitle}>Star Health Family Floater</Text>
          <Text style={styles.policySubtitle}>Covers 5 people · ₹10 lakh</Text>
          <Text style={styles.policySubtitle}>Renews 12 Mar 2027</Text>
        </TouchableOpacity>

        {/* Card 3: Life (LIC Jeevan Anand) */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectPolicy?.({ type: 'life', title: 'LIC Jeevan Anand · Rohan' })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.tagRow}>
              <Feather name="shield" size={15} color="#5B9BF1" />
              <Text style={[styles.tagText, { color: '#5B9BF1' }]}>LIFE</Text>
            </View>
          </View>

          <Text style={styles.policyTitle}>LIC Jeevan Anand · Rohan</Text>
          <Text style={styles.policySubtitle}>Premium ₹24,000 due 5 Jan 2027</Text>
        </TouchableOpacity>

        {/* Card 4: Home (Empty / Prompt state) */}
        <View style={styles.dashedCard}>
          <View style={styles.cardHeader}>
            <View style={styles.tagRow}>
              <Feather name="home" size={15} color="#8A97AB" />
              <Text style={[styles.tagText, { color: '#8A97AB' }]}>HOME</Text>
            </View>
          </View>

          <Text style={styles.policyTitle}>No home insurance yet</Text>
          <Text style={styles.policySubtitle}>Covers your flat against fire, theft and floods</Text>

          <TouchableOpacity
            style={styles.dashedAddBtn}
            onPress={onAddHomeInsurance}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add home insurance"
          >
            <Feather name="plus" size={16} color="#F0923A" style={{ marginRight: 6 }} />
            <Text style={styles.dashedAddBtnText}>Add home insurance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating / Pinned Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPolicy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add policy"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add policy</Text>
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
    padding: 18,
    marginBottom: 14,
  },
  dashedCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#26374D',
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  badgeOrange: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgeOrangeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  policyTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  policySubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    lineHeight: 19,
    marginBottom: 2,
  },
  renewNowBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#344154',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  renewNowBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  dashedAddBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3D4F66',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  dashedAddBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
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

export default InsuranceVaultScreen;
