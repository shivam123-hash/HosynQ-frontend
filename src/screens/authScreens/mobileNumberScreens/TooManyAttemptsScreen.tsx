import React, { useState, useEffect } from 'react';
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
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

interface TooManyAttemptsScreenProps {
  mobileNumber?: string;
  initialMinutes?: number;
  initialSeconds?: number;
  onBack?: () => void;
  onSignInAnotherWay?: () => void;
  onContactSupport?: () => void;
}

const TooManyAttemptsScreen: React.FC<TooManyAttemptsScreenProps> = ({
  mobileNumber = '+91\n458-465-6466',
  initialMinutes = 29,
  initialSeconds = 41,
  onBack,
  onSignInAnotherWay,
  onContactSupport,
}) => {
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState(
    initialMinutes * 60 + initialSeconds
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Orange Round Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Central Graphic: Concentric circle badge with lock icon */}
        <View style={styles.centerSection}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="lock" size={32} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Too many attempts</Text>
          <Text style={styles.subtitle}>
            For your security, sign-in with {mobileNumber} is paused for 30 minutes.
          </Text>

          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>TRY AGAIN IN</Text>
            <Text style={styles.timerText}>{formattedTime}</Text>
          </View>
        </View>

        {/* Bottom Actions Stack */}
        <View style={styles.actionSection}>
          <CommonBtn
            title="Sign in another way"
            onPress={onSignInAnotherWay}
            backgroundColor={Colors.background}
            borderColor={Colors.border}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(13.5)}
          />

          <TouchableOpacity
            onPress={onContactSupport}
            activeOpacity={0.7}
            style={styles.supportLink}
          >
            <Text style={styles.supportText}>Contact support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TooManyAttemptsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: '#192C44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#102237',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    color: Colors.textSecondary,
    fontSize: RFValue(10.5),
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  timerText: {
    color: Colors.primary,
    fontSize: RFValue(26),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  supportLink: {
    paddingVertical: 18,
    marginTop: 4,
  },
  supportText: {
    color: Colors.primary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});
