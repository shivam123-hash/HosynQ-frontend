import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import { RenderSlide, NavButton, SlideItem } from './components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

interface OnboardingScreenProps {
  onFinish?: () => void;
  onSkip?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onFinish?.();
    }
  }, [currentIndex, onFinish]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      flatListRef.current?.scrollToIndex({
        index: ONBOARDING_DATA.length - 1,
        animated: true,
      });
    }
  }, [onSkip]);

  const renderSlideItem = useCallback(({ item }: { item: SlideItem }) => {
    return <RenderSlide item={item} />;
  }, []);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header with Skip button */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* 4 Slides FlatList Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.flexOne}
      />

      {/* Bottom Bar: Indicators & Reusable Nav Buttons */}
      <View style={styles.bottomBar}>
        {/* Progress Bar (4 dashes with Colors.primary on active dash) */}
        <View style={styles.indicatorContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dash,
                  isActive ? styles.dashActive : styles.dashInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Reusable Nav Buttons */}
        <View style={styles.arrowButtonsContainer}>
          <NavButton
            iconName="chevron-left"
            onPress={handleBack}
            disabled={isFirstSlide}
            accessibilityLabel="Previous slide"
          />
          <NavButton
            iconName={isLastSlide ? 'check' : 'chevron-right'}
            onPress={handleNext}
            backgroundColor={Colors.primary}
            hasShadow
            accessibilityLabel={isLastSlide ? 'Get started' : 'Next slide'}
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 48,
  },
  headerSpacer: {
    width: 40,
  },
  skipText: {
    color: '#8A97AB',
    fontSize: RFValue(13.5),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  skipPlaceholder: {
    width: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 12,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dash: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  dashActive: {
    backgroundColor: Colors.primary,
  },
  dashInactive: {
    backgroundColor: '#1E314B',
  },
  arrowButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
