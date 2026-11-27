import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import Colors from '../../../units/Colors';
import { isJestTestEnv } from './pulseApiHelpers';

export interface PulseModalContainerProps {
  visible: boolean;
  asModal?: boolean;
  variant?: 'push' | 'sheet';
  transparent?: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Unified presentation container for Family Pulse screens:
 * - Standalone usage (`asModal={true}`): uses native Modal with hardware back support.
 * - Nested usage (`asModal={false}`): uses hardware-accelerated native-driver Animated
 *   transitions instead of stacked OS <Modal> layers to eliminate iOS/Android flicker
 *   and keep multi-step Pulse navigation at 60fps.
 */
export const PulseModalContainer: React.FC<PulseModalContainerProps> = ({
  visible,
  asModal = true,
  variant = 'push',
  transparent = false,
  onRequestClose,
  children,
}) => {
  const isTestEnv = isJestTestEnv();
  const [mounted, setMounted] = useState(visible);

  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const latestCloseRef = useRef(onRequestClose);
  latestCloseRef.current = onRequestClose;

  useEffect(() => {
    if (isTestEnv) {
      setMounted(visible);
      progress.setValue(visible ? 1 : 0);
      return;
    }

    if (asModal) {
      setMounted(visible);
      return;
    }

    if (visible) {
      setMounted(true);
      progress.stopAnimation();
      Animated.timing(progress, {
        toValue: 1,
        duration: variant === 'sheet' ? 230 : 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      progress.stopAnimation();
      Animated.timing(progress, {
        toValue: 0,
        duration: variant === 'sheet' ? 180 : 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible, asModal, variant, isTestEnv, mounted, progress]);

  useEffect(() => {
    if (asModal || !visible || isTestEnv) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      latestCloseRef.current();
      return true;
    });
    return () => sub.remove();
  }, [asModal, visible, isTestEnv]);

  if (asModal) {
    return (
      <Modal
        visible={visible}
        animationType={variant === 'sheet' ? 'fade' : 'slide'}
        transparent={transparent || variant === 'sheet'}
        onRequestClose={onRequestClose}
      >
        {children}
      </Modal>
    );
  }

  if (!visible && !mounted) {
    return null;
  }

  if (variant === 'sheet') {
    const backdropOpacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const sheetTranslateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [Math.min(SCREEN_HEIGHT * 0.45, 360), 0],
    });

    return (
      <View
        style={styles.inlineSheetRoot}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Animated.View
          style={[
            styles.inlineBackdropFill,
            { opacity: backdropOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.inlineSheetTransform,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  const pushTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.min(SCREEN_WIDTH, 420), 0],
  });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.inlinePushContainer,
        {
          transform: [{ translateX: pushTranslateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inlinePushContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 950,
    elevation: 24,
    backgroundColor: Colors.background,
  },
  inlineSheetRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 980,
    elevation: 28,
  },
  inlineBackdropFill: {
    flex: 1,
  },
  inlineSheetTransform: {
    flex: 1,
  },
});

export default PulseModalContainer;
