import React, { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollViewProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface KeyboardAvoidingWrapperProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  extraHeight?: number;
  autoScrollToEnd?: boolean;
  dismissKeyboardOnTap?: boolean;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  contentContainerStyle,
  style,
  extraHeight = 24,
  autoScrollToEnd = true,
  dismissKeyboardOnTap = true,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<any>(null);
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates ? e.endCoordinates.height : 0;
      // Calculate active keyboard height minus safe area inset
      const netHeight = Math.max(0, height - (insets.bottom || 0)) + extraHeight;
      setKeyboardSpace(netHeight);

      if (autoScrollToEnd) {
        // Allow layout to render the bottom spacer before scrolling
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardSpace(0);
      if (autoScrollToEnd) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 50);
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [autoScrollToEnd, extraHeight, insets.bottom]);

  const content = (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      {...scrollViewProps}
    >
      {children}
      {/* Dynamic Keyboard Spacer that guarantees inputs are never hidden on Android & iOS */}
      {keyboardSpace > 0 ? <View style={{ height: keyboardSpace }} /> : null}
    </ScrollView>
  );

  return (
    <View style={[styles.container, style]}>
      {dismissKeyboardOnTap ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>{content}</View>
        </TouchableWithoutFeedback>
      ) : (
        content
      )}
    </View>
  );
};

export default KeyboardAvoidingWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
