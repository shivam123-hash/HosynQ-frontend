import React, { useState } from 'react';
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

export interface BeforeAccountSetupScreenProps {
  onBack?: () => void;
  onAgreeAndContinue?: (consentAccepted: boolean) => void;
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
}

const BeforeAccountSetupScreen: React.FC<BeforeAccountSetupScreenProps> = ({
  onBack,
  onAgreeAndContinue,
  onPressTerms,
  onPressPrivacy,
}) => {
  const insets = useSafeAreaInsets();
  const [isAgreed, setIsAgreed] = useState(false);

  const handleAgreeAndContinue = () => {
    if (!isAgreed) return;
    onAgreeAndContinue?.(true);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Orange Circular Back Button */}
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
        <View style={styles.topSection}>
          {/* Main Title & Subtitle */}
          <Text style={styles.title}>Before we set up your{'\n'}account</Text>
          <Text style={styles.subtitle}>
            HosynQ holds your family's plans and personal details. Here's how we
            use them.
          </Text>

          {/* 3-Point Information Card */}
          <View style={styles.card}>
            {/* Item 1: Your name and number */}
            <View style={styles.itemRow}>
              <View style={styles.iconWrapper}>
                <Feather name="user" size={18} color={Colors.primary} />
              </View>
              <View style={styles.itemTextContent}>
                <Text style={styles.itemTitle}>Your name and number</Text>
                <Text style={styles.itemDescription}>
                  To sign you in and show you to your family.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Item 2: What you add */}
            <View style={styles.itemRow}>
              <View style={styles.iconWrapper}>
                <Feather name="folder" size={18} color={Colors.primary} />
              </View>
              <View style={styles.itemTextContent}>
                <Text style={styles.itemTitle}>What you add</Text>
                <Text style={styles.itemDescription}>
                  Tasks, events and documents. Only your family can see them.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Item 3: Your location */}
            <View style={styles.itemRow}>
              <View style={styles.iconWrapper}>
                <Feather name="map-pin" size={18} color={Colors.primary} />
              </View>
              <View style={styles.itemTextContent}>
                <Text style={styles.itemTitle}>Your location</Text>
                <Text style={styles.itemDescription}>
                  Only if you turn it on. You can stop sharing anytime.
                </Text>
              </View>
            </View>
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAgreed((prev) => !prev)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                isAgreed && styles.checkboxActive,
              ]}
            >
              {isAgreed ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>

            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text
                style={styles.linkText}
                onPress={onPressTerms || (() => setIsAgreed((prev) => !prev))}
              >
                Terms of Use
              </Text>{' '}
              and{' '}
              <Text
                style={styles.linkText}
                onPress={onPressPrivacy || (() => setIsAgreed((prev) => !prev))}
              >
                Privacy Notice
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Action Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Agree and continue"
            onPress={handleAgreeAndContinue}
            disabled={!isAgreed}
            backgroundColor={isAgreed ? Colors.primary : '#4D3622'}
            textColor={isAgreed ? '#FFFFFF' : '#8A7665'}
            height={56}
            borderRadius={28}
            fontSize={RFValue(14)}
          />

          <Text style={styles.footerNote}>
            You can withdraw consent anytime in Privacy and consent.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default BeforeAccountSetupScreen;

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
  topSection: {
    paddingTop: 12,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: RFValue(28),
  },
  subtitle: {
    fontSize: RFValue(13),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: RFValue(18),
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#0F213A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1B3150',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 26,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemTextContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: RFValue(13.5),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    lineHeight: RFValue(16),
  },
  divider: {
    height: 1,
    backgroundColor: '#192E4A',
    marginVertical: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4A5E78',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: RFValue(12.5),
    color: '#FFFFFF',
    flex: 1,
    lineHeight: RFValue(17),
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
});

