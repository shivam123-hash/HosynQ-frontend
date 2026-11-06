import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface NotificationsEmptyStateProps {
  onOpenPreferences?: () => void;
}

const NotificationsEmptyState: React.FC<NotificationsEmptyStateProps> = ({
  onOpenPreferences,
}) => {
  return (
    <View style={styles.container}>
      {/* Concentric Circle Bell Graphic */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <Feather name="bell" size={38} color="#F0913A" />
        </View>
      </View>

      {/* Primary Headline */}
      <Text style={styles.headline}>You’re all caught up</Text>

      {/* Explanatory Subtitle */}
      <Text style={styles.description}>
        New tasks, reminders and family updates will show up here.
      </Text>

      {/* Action Link */}
      <TouchableOpacity
        onPress={onOpenPreferences}
        activeOpacity={0.7}
        style={styles.linkButton}
        accessibilityRole="button"
        accessibilityLabel="Notification preferences"
      >
        <Text style={styles.linkText}>Notification preferences</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationsEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#2A3E5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 280,
  },
  linkButton: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
    textAlign: 'center',
  },
});
