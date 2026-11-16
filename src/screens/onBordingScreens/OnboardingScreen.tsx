import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import { OrbitAnimationVisual, SlideItem } from './components';

const ORANGE = '#F0963C';
const BG = Colors.background || '#0E1A2E';
const DISABLED = '#3A4A60';

export const ONBOARDING_DATA: SlideItem[] = [
  {
    id: '1',
    title: 'Your Family, All in\nOne Place',
    subtitle: 'Calendar, tasks, lists and chat, finally together.',
    image: ImagePath.onBordingGroupImage,
  },
  {
    id: '2',
    title: 'Start Every Day\nPrepared',
    subtitle: 'A daily AI brief of what needs your attention.',
    image: ImagePath.onBordingGroupImage,
  },
  {
    id: '3',
    title: "Snap It. We'll Sort It.",
    subtitle: 'Scan any document and turn it into tasks and events.',
    image: ImagePath.onBordingGroupImage,
  },
  {
    id: '4',
    title: 'Stay Close, Even\nApart',
    subtitle: 'Share your ETA and get safe-arrival alerts.',
    image: ImagePath.onBordingGroupImage,
  },
];

export interface OnboardingScreenProps {
  onFinish?: () => void;
  onSkip?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onSkip,
}) => {
  const [activePage, setActivePage] = useState(0);

  const isFirst = activePage === 0;
  const isLast = activePage === ONBOARDING_DATA.length - 1;
  const isReversedNavigation = activePage >= 2;

  const page = ONBOARDING_DATA[activePage];

  const goNext = useCallback(() => {
    if (isLast) {
      onFinish?.();
    } else {
      setActivePage((prev) => Math.min(ONBOARDING_DATA.length - 1, prev + 1));
    }
  }, [isLast, onFinish]);

  const goPrev = useCallback(() => {
    setActivePage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onFinish?.();
    }
  }, [onSkip, onFinish]);

  // Swipe gesture support across onboarding slides
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dy) < 40
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          goNext();
        } else if (gestureState.dx > 50) {
          goPrev();
        }
      },
    }),
  ).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Top Header with Skip Button */}
        <View style={styles.header}>
          {!isLast ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        {/* Orbit Animated Visual Area */}
        <OrbitAnimationVisual />

        {/* Copy (Title & Description) */}
        <View style={styles.copy}>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.description}>{page.subtitle}</Text>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.navigation}>
          {/* Pagination Indicators */}
          <View style={styles.pagination}>
            {ONBOARDING_DATA.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.segment,
                  index === activePage && styles.segmentActive,
                ]}
              />
            ))}
          </View>

          {/* Controls (< and >) */}
          <View style={styles.controls}>
            {/* Back Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous onboarding page"
              disabled={isFirst}
              onPress={goPrev}
              style={({ pressed }) => [
                styles.btn,
                isReversedNavigation ? styles.btnFilled : styles.btnOutline,
                isFirst && styles.btnDisabled,
                pressed && !isFirst && styles.pressed,
              ]}
            >
              <View style={styles.iconCenter}>
                <Text
                  style={[
                    styles.chevron,
                    {
                      color: isFirst
                        ? 'rgba(58, 74, 96, 0.4)'
                        : isReversedNavigation
                        ? BG
                        : '#FFFFFF',
                    },
                  ]}
                >
                  ‹
                </Text>
              </View>
            </Pressable>

            {/* Next Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Get started' : 'Next onboarding page'}
              onPress={goNext}
              style={({ pressed }) => [
                styles.btn,
                isReversedNavigation || isLast
                  ? styles.btnOutline
                  : styles.btnFilled,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconCenter}>
                <Text
                  style={[
                    styles.chevron,
                    {
                      color:
                        isReversedNavigation || isLast
                          ? '#FFFFFF'
                          : BG,
                    },
                  ]}
                >
                  ›
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 40,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: '#8C98AB',
    fontSize: RFValue(13.5),
    fontWeight: '500',
  },
  skipPlaceholder: {
    height: 30,
  },
  copy: {
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(24),
    lineHeight: RFValue(31),
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    color: '#8C98AB',
    fontSize: RFValue(12.5),
    lineHeight: RFValue(18),
    maxWidth: 320,
    textAlign: 'left',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  segment: {
    width: 24,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#1E2A4A',
  },
  segmentActive: {
    backgroundColor: ORANGE,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  btn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFilled: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnOutline: {
    borderWidth: 1.2,
    borderColor: DISABLED,
    backgroundColor: 'transparent',
  },
  btnDisabled: {
    borderColor: 'rgba(58, 74, 96, 0.35)',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
  iconCenter: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: RFValue(30),
    lineHeight: RFValue(30),
    fontWeight: '400',
  },
});
