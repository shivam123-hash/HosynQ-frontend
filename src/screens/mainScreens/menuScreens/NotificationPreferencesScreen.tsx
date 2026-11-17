import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface NotificationPreferencesScreenProps {
  onBack?: () => void;
  onQuietHoursPress?: () => void;
}

export const NotificationPreferencesScreen: React.FC<NotificationPreferencesScreenProps> = ({
  onBack,
  onQuietHoursPress,
}) => {
  const insets = useSafeAreaInsets();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [tasksEnabled, setTasksEnabled] = useState(true);
  const [eventsEnabled, setEventsEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [pulseEnabled, setPulseEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [briefEnabled, setBriefEnabled] = useState(true);
  const [renewalsEnabled, setRenewalsEnabled] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Notifications</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Push Notifications Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterIconBox}>
            <Feather name="bell" size={20} color="#F0923A" />
          </View>
          <View style={styles.masterInfo}>
            <Text style={styles.masterTitle}>Push notifications</Text>
            <Text style={styles.masterSubtitle}>
              {pushEnabled ? 'On for this phone' : 'Off for this phone'}
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#1F3352', true: '#F0923A' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#1F3352"
          />
        </View>

        {/* Section: WHAT TO NOTIFY */}
        <Text style={styles.sectionHeading}>WHAT TO NOTIFY</Text>
        <View style={styles.card}>
          <ToggleRow
            title="Tasks"
            subtitle="Assigned to you, due and overdue"
            value={tasksEnabled}
            onValueChange={setTasksEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="Events and reminders"
            subtitle="Before events start"
            value={eventsEnabled}
            onValueChange={setEventsEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="Family chat"
            subtitle="New messages and mentions"
            value={chatEnabled}
            onValueChange={setChatEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="Pulse"
            subtitle="Moods, polls and appreciations"
            value={pulseEnabled}
            onValueChange={setPulseEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="Location"
            subtitle="Arrivals and departures"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="AI brief"
            subtitle="Every day at 7:00 AM"
            value={briefEnabled}
            onValueChange={setBriefEnabled}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />

          <ToggleRow
            title="Renewals and bills"
            subtitle="From Family Vault"
            value={renewalsEnabled}
            onValueChange={setRenewalsEnabled}
            disabled={!pushEnabled}
          />
        </View>

        {/* Quiet Hours Card */}
        <TouchableOpacity
          style={styles.quietHoursCard}
          onPress={onQuietHoursPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Quiet hours 10:00 PM to 7:00 AM"
        >
          <View style={styles.quietIconBox}>
            <Feather name="clock" size={20} color="#8A97AB" />
          </View>
          <View style={styles.quietInfo}>
            <Text style={styles.quietLabel}>Quiet hours</Text>
            <Text style={styles.quietValue}>10:00 PM to 7:00 AM</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#5D6C83" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

interface ToggleRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) => (
  <View style={styles.row}>
    <View style={styles.rowInfo}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#1F3352', true: '#F0923A' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#1F3352"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topBarRightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 24,
  },
  masterIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterInfo: {
    flex: 1,
    marginLeft: 14,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  masterSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowInfo: {
    flex: 1,
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 16,
  },
  quietHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  quietIconBox: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  quietInfo: {
    flex: 1,
    marginLeft: 10,
  },
  quietLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  quietValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
