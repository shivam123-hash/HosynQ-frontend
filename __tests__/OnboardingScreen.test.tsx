import React from 'react';
import { Text, TouchableOpacity, FlatList } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen, {
  ONBOARDING_DATA,
} from '../src/screens/onBordingScreens/OnboardingScreen';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderOnboarding = async (
  props: React.ComponentProps<typeof OnboardingScreen> = {}
) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        <OnboardingScreen {...props} />
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders correctly with initial slide and data', async () => {
    const renderer = await renderOnboarding();
    expect(renderer.root).toBeTruthy();

    const flatList = renderer.root.findByType(FlatList);
    expect(flatList).toBeTruthy();
    expect(flatList.props.data).toHaveLength(4);

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Verify slide 1 title & subtitle
    expect(texts).toContain(ONBOARDING_DATA[0].title);
    expect(texts).toContain(ONBOARDING_DATA[0].subtitle);
    expect(texts).toContain('Skip');
  });

  it('triggers onSkip when Skip button is pressed', async () => {
    const onSkipMock = jest.fn();
    const renderer = await renderOnboarding({ onSkip: onSkipMock });

    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const skipButton = touchables.find(
      (t) => t.props.accessibilityLabel === 'Skip onboarding'
    );
    expect(skipButton).toBeTruthy();

    await ReactTestRenderer.act(() => {
      skipButton?.props.onPress();
    });

    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });

  it('has disabled back button on the first slide', async () => {
    const renderer = await renderOnboarding();

    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const backButton = touchables.find(
      (t) => t.props.accessibilityLabel === 'Previous slide'
    );
    expect(backButton).toBeTruthy();
    expect(backButton?.props.disabled).toBe(true);
  });

  it('advances slides and calls onFinish on the last slide', async () => {
    const onFinishMock = jest.fn();
    const renderer = await renderOnboarding({ onFinish: onFinishMock });

    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const nextButton = touchables.find(
      (t) => t.props.accessibilityLabel === 'Next slide'
    );
    expect(nextButton).toBeTruthy();

    // Next button advances slide
    await ReactTestRenderer.act(() => {
      nextButton?.props.onPress();
    });

    // Simulate reaching last slide
    const flatList = renderer.root.findByType(FlatList);
    await ReactTestRenderer.act(() => {
      flatList.props.onViewableItemsChanged({
        viewableItems: [{ index: 3 }],
      });
    });

    // On last slide, finish button has 'Get started' accessibility label
    const finishButton = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Get started');
    expect(finishButton).toBeTruthy();

    await ReactTestRenderer.act(() => {
      finishButton?.props.onPress();
    });

    expect(onFinishMock).toHaveBeenCalledTimes(1);
  });
});
