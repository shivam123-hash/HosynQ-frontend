import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../units/Colors';

const DEFAULT_AVATAR = require('../assets/image/default_avatar.png');

export interface AppTopBarProps {
  userAvatarBg?: string;
  userInitial?: string;
  avatarUrl?: string | null;
  avatarSource?: any;
  hasUnreadNotifications?: boolean;
  unreadCount?: number;
  onAvatarPress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
  onCompassPress?: () => void;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  userAvatarBg = '#1E293B',
  userInitial = 'P',
  avatarUrl,
  avatarSource,
  hasUnreadNotifications = true,
  unreadCount,
  onAvatarPress,
  onExplorePress,
  onNotificationsPress,
  onMenuPress,
  onCompassPress,
}) => {
  const handleAvatarPress = onAvatarPress || onMenuPress || onExplorePress;

  return (
    <View style={styles.container}>
      {/* Left User Avatar Button (Tapping opens menu) */}
      <TouchableOpacity
        onPress={handleAvatarPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={styles.avatarButton}
      >
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatarImage} />
        ) : avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : DEFAULT_AVATAR ? (
          <Image source={DEFAULT_AVATAR} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: userAvatarBg }]}>
            <Text style={styles.avatarInitial}>{userInitial}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Center Brand Title */}
      <View style={styles.brandContainer} pointerEvents="none">
        <Text style={styles.brandTitle}>HosynQ</Text>
      </View>

      {/* Right Actions: Compass & Notification Bell */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={onCompassPress || onExplorePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Compass"
          style={styles.iconButton}
        >
          <Feather name="compass" size={24} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.iconButton}
        >
          <Feather name="bell" size={22} color={Colors.white} />
          {hasUnreadNotifications && <View style={styles.badgeDot} />}
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
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.avatarPlaceholderBg,
    zIndex: 1,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  brandContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
