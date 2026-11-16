import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface NotificationsHeaderProps {
  onBack?: () => void;
  onMarkAllRead?: () => void;
  showMarkAllRead?: boolean;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  onBack,
  onMarkAllRead,
  showMarkAllRead = true,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="chevron-left" size={22} color="#CAD4DF" />
      </TouchableOpacity>

      <Text style={styles.title}>Notifications</Text>

      {showMarkAllRead ? (
        <TouchableOpacity
          onPress={onMarkAllRead}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
        >
          <Text style={styles.markAllReadText}>Mark all read</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
};

export default NotificationsHeader;

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
  },
  rightSpacer: {
    width: 44,
  },
});
