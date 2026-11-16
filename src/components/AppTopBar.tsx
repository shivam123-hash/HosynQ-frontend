import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../units/Colors';

export interface AppTopBarProps {
  userAvatarBg?: string;
  userInitial?: string;
  hasUnreadNotifications?: boolean;
  unreadCount?: number;
  onAvatarPress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  userAvatarBg = Colors.avatarBrown,
  userInitial = 'P',
  hasUnreadNotifications = true,
  unreadCount = 3,
  onAvatarPress,
  onExplorePress,
  onNotificationsPress,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Menu / Hamburger Icon */}
      <TouchableOpacity
        onPress={onMenuPress || onExplorePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        style={styles.menuButton}
      >
        <Feather name="menu" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Center Brand Logo (Orange house square + HosynQ) */}
      <View style={styles.brandContainer}>
        <View style={styles.logoSquare}>
          <Feather name="home" size={16} color={Colors.white} />
        </View>
        <Text style={styles.brandTitle}>HosynQ</Text>
      </View>

      {/* Right Actions (Notification Bell with Badge + User Avatar) */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.bellButton}
        >
          <Feather name="bell" size={22} color={Colors.white} />
          {hasUnreadNotifications && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Profile Avatar */}
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={[styles.avatarButton, { backgroundColor: userAvatarBg }]}
        >
          <Text style={styles.avatarInitial}>{userInitial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(AppTopBar);

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSquare: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: '800',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
