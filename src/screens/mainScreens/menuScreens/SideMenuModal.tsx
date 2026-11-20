import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.82, 330);

export interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  familyRole?: string;
  familyName?: string;
  onSelectMyProfile?: () => void;
  onSelectNotifications?: () => void;
  onSelectPrivacyConsent?: () => void;
  onSelectSecurity?: () => void;
  onSelectSubscription?: () => void;
  onSelectAccount?: () => void;
  onSelectHelpSupport?: () => void;
  onSelectPolicies?: () => void;
  onSelectAbout?: () => void;
  onLogout?: () => void;
}

export const SideMenuModal: React.FC<SideMenuModalProps> = ({
  visible,
  onClose,
  userName = 'Priya Sharma',
  familyRole = 'Owner',
  familyName = 'The Sharma Family',
  onSelectMyProfile,
  onSelectNotifications,
  onSelectPrivacyConsent,
  onSelectSecurity,
  onSelectSubscription,
  onSelectAccount,
  onSelectHelpSupport,
  onSelectPolicies,
  onSelectAbout,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.drawerContainer,
            {
              paddingTop: Math.max(insets.top, 16) + 12,
              paddingBottom: Math.max(insets.bottom, 16) + 10,
            },
          ]}
        >
          {/* User Profile Header */}
          <TouchableOpacity
            style={styles.profileHeader}
            onPress={() => {
              onClose();
              onSelectMyProfile?.();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.familySubtitle} numberOfLines={1}>
                {familyRole} · {familyName}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8A97AB" />
          </TouchableOpacity>

          {/* HosynQ Premium Banner */}
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => {
              onClose();
              onSelectSubscription?.();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Manage HosynQ Premium"
          >
            <View style={styles.premiumIconBox}>
              <Feather name="award" size={20} color="#F0923A" />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>HosynQ Premium</Text>
              <Text style={styles.premiumSubtitle}>Free trial · 9 days left</Text>
            </View>
            <Text style={styles.premiumManageText}>Manage</Text>
          </TouchableOpacity>

          {/* Scrollable Navigation Items */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            <MenuItem
              icon="user"
              title="My profile"
              onPress={() => {
                onClose();
                onSelectMyProfile?.();
              }}
            />
            <MenuItem
              icon="bell"
              title="Notifications"
              onPress={() => {
                onClose();
                onSelectNotifications?.();
              }}
            />
            <MenuItem
              icon="shield"
              title="Privacy and consent"
              onPress={() => {
                onClose();
                onSelectPrivacyConsent?.();
              }}
            />
            <MenuItem
              icon="lock"
              title="Security"
              onPress={() => {
                onClose();
                onSelectSecurity?.();
              }}
            />
            <MenuItem
              icon="award"
              title="Subscription"
              badge="Premium"
              onPress={() => {
                onClose();
                onSelectSubscription?.();
              }}
            />
            <MenuItem
              icon="sun"
              title="Account"
              onPress={() => {
                onClose();
                onSelectAccount?.();
              }}
            />
            <MenuItem
              icon="message-square"
              title="Help and support"
              onPress={() => {
                onClose();
                onSelectHelpSupport?.();
              }}
            />
            <MenuItem
              icon="file-text"
              title="Policies"
              onPress={() => {
                onClose();
                onSelectPolicies?.();
              }}
            />
            <MenuItem
              icon="info"
              title="About HosynQ"
              onPress={() => {
                onClose();
                onSelectAbout?.();
              }}
            />
          </ScrollView>

          {/* Bottom Log out & Footer */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.logoutRow}
              onPress={() => {
                onClose();
                onLogout?.();
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <Feather name="log-out" size={18} color="#F0923A" />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>
              HosynQ 1.0.0 · ROOV Platforms
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface MenuItemProps {
  icon: string;
  title: string;
  badge?: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, badge, onPress }) => (
  <TouchableOpacity
    style={styles.menuRow}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.menuIconBox}>
      <Feather name={icon as any} size={20} color="#FFFFFF" />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    {badge && <Text style={styles.menuBadgeText}>{badge}</Text>}
    <Feather name="chevron-right" size={18} color="#5D6C83" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#0D1D34',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5C3A21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  familySubtitle: {
    fontSize: 12,
    color: '#8A97AB',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0923A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  premiumIconBox: {
    marginRight: 10,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumSubtitle: {
    fontSize: 11,
    color: '#8A97AB',
    marginTop: 2,
  },
  premiumManageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0923A',
    marginLeft: 8,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingVertical: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  menuIconBox: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  menuBadgeText: {
    fontSize: 13,
    color: '#8A97AB',
    marginRight: 6,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingTop: 14,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0923A',
    marginLeft: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#5D6C83',
    marginTop: 8,
  },
});
