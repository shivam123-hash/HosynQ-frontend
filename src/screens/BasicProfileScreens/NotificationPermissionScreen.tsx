import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import { NotificationPreviewCard } from './components';

export interface NotificationPermissionScreenProps {
  onBack?: () => void;
  onTurnOnNotifications?: () => void;
  onNotNow?: () => void;
}

const NotificationPermissionScreen: React.FC<NotificationPermissionScreenProps> = ({
  onBack,
  onTurnOnNotifications,
  onNotNow,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.stepText}>Step 3 of 3</Text>
      </View>

      {/* 75% Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill75]} />
        </View>
        <Text style={styles.progressText}>75%</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Graphic: Concentric Bell Rings */}
        <View style={styles.centerGraphicSection}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="bell" size={30} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Don't miss what matters</Text>
          <Text style={styles.subtitle}>
            We'll tell you when a task is yours, a reminder is due, or someone gets home safely.
          </Text>
        </View>

        {/* 2 Notification Preview Cards */}
        <View style={styles.cardsSection}>
          {/* Card 1: Task Assigned */}
          <NotificationPreviewCard
            category="HOSYNQ · TASK ASSIGNED"
            timestamp="now"
            title="Rohan assigned you a task"
            description="Pay electricity bill · due tomorrow"
            icon={<Feather name="check-square" size={20} color="#FFFFFF" />}
          />

          {/* Card 2: Safe Arrival */}
          <NotificationPreviewCard
            category="HOSYNQ · SAFE ARRIVAL"
            timestamp="2m"
            title="Aarav has reached Tuition"
            description="Arrived at 4:12 PM"
            icon={<Feather name="shield" size={20} color="#FFFFFF" />}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Turn on notifications"
            onPress={onTurnOnNotifications}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotNow}
            style={styles.notNowButton}
          >
            <Text style={styles.notNowText}>Not now</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Choose which ones you get anytime in Notification preferences.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationPermissionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#16283E',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressFill75: {
    width: '75%',
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    fontWeight: '600',
    marginLeft: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  centerGraphicSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  outerCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 1.5,
    borderColor: '#192C44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  innerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#102237',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18.5),
    paddingHorizontal: 16,
  },
  cardsSection: {
    width: '100%',
    marginVertical: 4,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 28,
  },
  notNowButton: {
    paddingVertical: 14,
    marginTop: 4,
  },
  notNowText: {
    color: Colors.primary,
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  footerNote: {
    color: '#6C7D93',
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: RFValue(16),
  },
});

