import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, StyleProp, ViewStyle, Easing } from 'react-native';

export interface TabTransitionViewProps {
  activeKey: string;
  tabOrder?: string[];
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  offsetDistance?: number;
}

/**
 * TabTransitionView
 * Smoothly animates tab content transitions with a subtle horizontal slide and fade-in
 * based on whether the user is navigating left-to-right or right-to-left.
 * Runs completely on the native thread (useNativeDriver: true).
 */
const TabTransitionView: React.FC<TabTransitionViewProps> = ({
  activeKey,
  tabOrder = ['vaccines', 'growth', 'milestones'],
  children,
  style,
  duration = 240,
  offsetDistance = 24,
}) => {
  const isFirstRender = useRef(true);
  const prevKeyRef = useRef(activeKey);

  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevKeyRef.current = activeKey;
      return;
    }

    if (prevKeyRef.current !== activeKey) {
      const prevIndex = tabOrder.indexOf(prevKeyRef.current);
      const newIndex = tabOrder.indexOf(activeKey);

      // Determine movement direction: 1 = moving right, -1 = moving left
      const direction = newIndex >= prevIndex ? 1 : -1;
      const initialOffset = direction * offsetDistance;

      prevKeyRef.current = activeKey;

      // Reset start values for enter animation
      opacityAnim.setValue(0);
      translateXAnim.setValue(initialOffset);

      // Smooth enter animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeKey, tabOrder, duration, offsetDistance, opacityAnim, translateXAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateX: translateXAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default TabTransitionView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

