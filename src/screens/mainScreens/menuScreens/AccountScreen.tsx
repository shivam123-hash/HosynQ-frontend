import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { LogoutConfirmationModal } from './LogoutConfirmationModal';

export interface AccountScreenProps {
  onBack?: () => void;
  onEditMobile?: () => void;
  onEditEmail?: () => void;
  onSelectLanguage?: () => void;
  onSelectFamily?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  mobileNumber?: string;
  email?: string;
  language?: string;
  familyName?: string;
  familyRole?: string;
  accountId?: string;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onBack,
  onEditMobile,
  onEditEmail,
  onSelectLanguage,
  onSelectFamily,
  onLogout,
  onDeleteAccount,
  mobileNumber = '+91 98••• ••123',
  email = 'priya.sharma@example.com',
  language = 'English',
  familyName = 'The Sharma Family',
  familyRole = 'Owner',
  accountId = 'HSQ-U-30981',
}) => {
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.innerContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Account</Text>

          <View style={styles.circlePlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={onEditMobile}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Mobile number ${mobileNumber}`}
            >
              <View style={styles.infoLeft}>
                <Feather
                  name="phone"
                  size={18}
                  color="#8A97AB"
                  style={styles.rowIcon}
                />
                <View style={styles.textColumn}>
                  <Text style={styles.rowLabel}>Mobile number</Text>
                  <Text style={styles.rowValue}>{mobileNumber}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.infoRow}
              onPress={onEditEmail}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Email ${email}`}
            >
              <View style={styles.infoLeft}>
                <Feather
                  name="mail"
                  size={18}
                  color="#8A97AB"
                  style={styles.rowIcon}
                />
                <View style={styles.textColumn}>
                  <Text style={styles.rowLabel}>Email</Text>
                  <Text style={styles.rowValue}>{email}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.infoRow}
              onPress={onSelectLanguage}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`App language ${language}`}
            >
              <View style={styles.infoLeft}>
                <Feather
                  name="globe"
                  size={18}
                  color="#8A97AB"
                  style={styles.rowIcon}
                />
                <View style={styles.textColumn}>
                  <Text style={styles.rowLabel}>App language</Text>
                  <Text style={styles.rowValue}>{language}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.infoRow}
              onPress={onSelectFamily}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Family ${familyName} · ${familyRole}`}
            >
              <View style={styles.infoLeft}>
                <Feather
                  name="users"
                  size={18}
                  color="#8A97AB"
                  style={styles.rowIcon}
                />
                <View style={styles.textColumn}>
                  <Text style={styles.rowLabel}>Family</Text>
                  <Text style={styles.rowValue}>
                    {familyName} · {familyRole}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>
          </View>

          {/* Actions Card */}
          <View style={[styles.card, styles.actionsCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconBox, styles.logoutIconBox]}>
                  <Feather name="log-out" size={18} color="#F0913A" />
                </View>
                <Text style={styles.actionTitle}>Log out</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={onDeleteAccount}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete account"
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconBox, styles.deleteIconBox]}>
                  <Feather name="trash-2" size={18} color="#F06A6A" />
                </View>
                <Text style={styles.deleteTitle}>Delete account</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>
          </View>

          {/* Account ID Footer */}
          <Text style={styles.footerText}>Account ID {accountId}</Text>
        </ScrollView>
      </View>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={() => {
          setShowLogoutModal(false);
          onLogout?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B1A2F',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: 44,
    height: 44,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  actionsCard: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutIconBox: {
    borderColor: '#F0913A',
  },
  deleteIconBox: {
    borderColor: '#F06A6A',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F06A6A',
  },
  footerText: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 20,
  },
});
