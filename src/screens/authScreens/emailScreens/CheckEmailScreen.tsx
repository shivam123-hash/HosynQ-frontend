import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

interface CheckEmailScreenProps {
  email?: string;
  onBack?: () => void;
  onOpenEmailApp?: () => void;
  onResendLink?: () => void;
  onUseDifferentEmail?: () => void;
}

const CheckEmailScreen: React.FC<CheckEmailScreenProps> = ({
  email = 'priya.sharma@gmail.com',
  onBack,
  onOpenEmailApp,
  onResendLink,
  onUseDifferentEmail,
}) => {
  const insets = useSafeAreaInsets();

  const handleOpenEmail = () => {
    if (onOpenEmailApp) {
      onOpenEmailApp();
    } else {
      // Default behavior: try to open device mail app
      const mailUrl = Platform.OS === 'ios' ? 'message:' : 'mailto:';
      Linking.canOpenURL(mailUrl).then((supported) => {
        if (supported) {
          Linking.openURL(mailUrl);
        }
      });
    }
  };

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
        {/* Central Graphic: Concentric circle badge with mail icon */}
        <View style={styles.centerSection}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="mail" size={32} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Check you Email</Text>
          <Text style={styles.subtitle}>
            We sent a sign-in link to{'\n'}
            {email}. Open it on this{'\n'}
            phone. The link works for 15 minutes.
          </Text>
        </View>

        {/* Action Buttons Stack */}
        <View style={styles.actionSection}>
          {/* Open email app Button */}
          <CommonBtn
            title="Open email app"
            onPress={handleOpenEmail}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(14)}
          />

          {/* Resend link Button */}
          <CommonBtn
            title="Resend link"
            onPress={onResendLink}
            backgroundColor={Colors.background}
            borderColor={Colors.border}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            marginTop={14}
            fontSize={RFValue(14)}
          />

          {/* Use a different email Link */}
          <TouchableOpacity
            onPress={onUseDifferentEmail}
            activeOpacity={0.7}
            style={styles.differentEmailLink}
          >
            <Text style={styles.differentEmailText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckEmailScreen;

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
    marginTop: 50,
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
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  differentEmailLink: {
    paddingVertical: 18,
    marginTop: 4,
  },
  differentEmailText: {
    color: Colors.primary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});
