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
import { CarIcon, IdCardIcon, ReceiptIcon } from './VaultIcons';

export interface VaultItemDetailScreenProps {
  onBack?: () => void;
  onMenu?: () => void;
  onViewDocument?: () => void;
  onShare?: () => void;
  onRenewNow?: () => void;
  onOpenReminders?: () => void;
  onOpenPermissions?: () => void;
}

export const VaultItemDetailScreen: React.FC<VaultItemDetailScreenProps> = ({
  onBack,
  onMenu,
  onViewDocument,
  onShare,
  onRenewNow,
  onOpenReminders,
  onOpenPermissions,
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

        <Text style={styles.headerTitle}>Car insurance</Text>

        <TouchableOpacity
          onPress={onMenu}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Feather name="more-horizontal" size={20} color="#FFFFFF" />
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
        {/* Card 1: Attached Document Card */}
        <TouchableOpacity
          style={styles.docCard}
          onPress={onViewDocument}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="View attached document"
        >
          {/* White sheet document thumbnail */}
          <View style={styles.docThumbnail}>
            <View style={styles.docThumbLine} />
            <View style={styles.docThumbLine} />
            <View style={styles.docThumbLine} />
            <View style={[styles.docThumbLine, { width: '50%' }]} />
          </View>

          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>HDFC_ERGO_policy_2025.pdf</Text>
            <Text style={styles.docSubtitle}>3 pages · Added by Rohan</Text>
          </View>

          <Feather name="eye" size={20} color="#F0923A" />
        </TouchableOpacity>

        {/* Card 2: Details Fields Card */}
        <View style={styles.card}>
          {/* Field 1: Insurer */}
          <View style={styles.fieldRow}>
            <Feather name="shield" size={18} color="#8A97AB" style={styles.fieldIcon} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Insurer</Text>
              <Text style={styles.fieldValue}>HDFC ERGO Motor</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Field 2: Vehicle */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <CarIcon size={18} color="#8A97AB" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Vehicle</Text>
              <Text style={styles.fieldValue}>Hyundai Creta · DL 3C AB 1234</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Field 3: Policy number */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <IdCardIcon size={18} color="#8A97AB" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Policy number</Text>
              <Text style={styles.fieldValue}>•••• •••• 7732</Text>
            </View>
            <Feather name="lock" size={16} color="#8A97AB" />
          </View>

          <View style={styles.divider} />

          {/* Field 4: Premium */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <ReceiptIcon size={16} color="#8A97AB" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Premium</Text>
              <Text style={styles.fieldValue}>₹14,250 a year</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Field 5: Valid till (Warning Alert Row) */}
          <View style={styles.alertRow}>
            <Feather name="calendar" size={18} color="#8A97AB" style={styles.fieldIcon} />
            <View style={styles.fieldContent}>
              <Text style={styles.alertLabel}>Valid till</Text>
              <Text style={styles.alertValue}>Wed, 18 Nov 2026 · 19 days left</Text>
            </View>
            <Feather name="alert-circle" size={18} color="#F7C08E" />
          </View>

          <View style={styles.divider} />

          {/* Field 6: Policy holder */}
          <View style={styles.fieldRow}>
            <Feather name="user" size={18} color="#8A97AB" style={styles.fieldIcon} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Policy holder</Text>
              <View style={styles.holderRow}>
                <View style={styles.holderAvatar}>
                  <Text style={styles.holderAvatarText}>R</Text>
                </View>
                <Text style={styles.fieldValue}>Rohan</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card 3: Options Card */}
        <View style={styles.card}>
          {/* Option 1: Renewal reminders */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={onOpenReminders}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#A884F0' }]}>
              <Feather name="bell" size={18} color="#A884F0" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Renewal reminders</Text>
              <Text style={styles.optionSubtitle}>30 and 7 days before · Rohan, Priya</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Option 2: Who can see this */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={onOpenPermissions}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="eye" size={18} color="#8A97AB" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Who can see this</Text>
              <Text style={styles.optionSubtitle}>Adults only</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Dual Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        {/* Left: Share Button */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={onShare}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Feather name="upload" size={18} color="#F0923A" style={{ marginRight: 8 }} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>

        {/* Right: Renew Now Button */}
        <TouchableOpacity
          style={styles.renewBtn}
          onPress={onRenewNow}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Renew now"
        >
          <Text style={styles.renewBtnText}>Renew now</Text>
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
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 16,
  },
  docThumbnail: {
    width: 44,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#EBE6DE',
    padding: 8,
    justifyContent: 'space-around',
    marginRight: 14,
  },
  docThumbLine: {
    height: 2.5,
    backgroundColor: '#8E877D',
    borderRadius: 1,
    width: '100%',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2418',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  alertLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  alertValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F7C08E',
  },
  holderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  holderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A3359',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  holderAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B9BF1',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  optionRow: {
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
  optionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  renewBtn: {
    flex: 1.4,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default VaultItemDetailScreen;
