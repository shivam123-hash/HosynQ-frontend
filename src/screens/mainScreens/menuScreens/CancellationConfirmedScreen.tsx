import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

export interface CancellationConfirmedScreenProps {
  onDone?: () => void;
  onReactivate?: () => void;
  effectiveUntilDate?: string;
}

export const CancellationConfirmedScreen: React.FC<CancellationConfirmedScreenProps> = ({
  onDone,
  onReactivate,
  effectiveUntilDate = 'Tue, 12 Oct 2027',
}) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // In Figma MNU-23, the hero circle center is positioned at ~29.5% from top of screen
  const topPadding = Math.max(
    screenHeight * 0.295 - 65,
    Math.max(insets.top, 20) + 40
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerSection}>
          {/* Concentric Double-Circle Hero Badge with Amber Checkmark */}
          <View style={styles.heroOuterRing}>
            <View style={styles.heroInnerCircle}>
              <View style={styles.heroCheckBadge}>
                <Ionicons name="checkmark" size={19} color="#F0913A" />
              </View>
            </View>
          </View>

          <Text style={styles.title}>Your subscription is{'\n'}cancelled</Text>
          <Text style={styles.subtitle}>
            Premium stays on until {effectiveUntilDate}. AutoPay is stopped, and we won’t charge you again.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.primaryBtnText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reactivateBtn}
          onPress={onReactivate}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Changed your mind? Reactivate"
        >
          <Text style={styles.reactivateBtnText}>Changed your mind? Reactivate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 24,
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
  },
  heroOuterRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#1D304E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  heroInnerCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#122440',
    borderWidth: 2,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#F0913A',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reactivateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  reactivateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
    textAlign: 'center',
  },
});
