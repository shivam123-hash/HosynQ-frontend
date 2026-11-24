import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  PanResponder,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import {
  OrbitAnimationVisual,
  SlideItem,
  RenderSlide,
  NavButton,
} from './components';

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
    title: "Snap It. We'll \nSort It.",
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

interface AnimatedSegmentProps {
  isActive: boolean;
  onPress?: () => void;
}

const AnimatedSegment: React.FC<AnimatedSegmentProps> = ({ isActive, onPress }) => {
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isActive ? 1 : 0,
      duration: 320,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: false,
    }).start();
  }, [isActive, anim]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 36],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1E2A4A', ORANGE],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <Pressable onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 4, right: 4 }}>
      <Animated.View
        style={[
          styles.segment,
          {
            width,
            backgroundColor,
            opacity,
          },
        ]}
      />
    </Pressable>
  );
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onSkip,
}) => {
  const [activePage, setActivePage] = useState(0);

  const isFirst = activePage === 0;
  const isLast = activePage === ONBOARDING_DATA.length - 1;
  const isReversedNavigation = activePage >= 2;

  const page = ONBOARDING_DATA[activePage];

  const textFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    textFadeAnim.setValue(0);
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [activePage, textFadeAnim]);

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

        {/* Copy (Title & Description) with Smooth Fade using RenderSlide */}
        <Animated.View style={{ opacity: textFadeAnim }}>
          <RenderSlide title={page.title} subtitle={page.subtitle} />
        </Animated.View>

        {/* Bottom Navigation */}
        <View style={styles.navigation}>
          {/* Smooth Animated Pagination Indicators */}
          <View style={styles.pagination}>
            {ONBOARDING_DATA.map((item, index) => (
              <AnimatedSegment
                key={item.id}
                isActive={index === activePage}
                onPress={() => setActivePage(index)}
              />
            ))}
          </View>

          {/* Controls (< and >) using NavButton */}
          <View style={styles.controls}>
            {/* Back Button */}
            <NavButton
              direction="prev"
              accessibilityLabel="Previous onboarding page"
              disabled={isFirst}
              variant={isReversedNavigation ? 'filled' : 'outline'}
              onPress={goPrev}
            />

            {/* Next Button */}
            <NavButton
              direction="next"
              accessibilityLabel={isLast ? 'Get started' : 'Next onboarding page'}
              variant={isReversedNavigation || isLast ? 'outline' : 'filled'}
              onPress={goNext}
            />
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
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.1,
  },
  skipPlaceholder: {
    height: 30,
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
    gap: 7,
    alignItems: 'center',
  },
  segment: {
    height: 4.5,
    borderRadius: 2.5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
});
