import React, { useRef, useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../../units/Colors';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  hasError?: boolean;
  isExpired?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  hasError = false,
  isExpired = false,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Blinking cursor effect for the active empty box
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused && !hasError && !isExpired && !disabled) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      cursorOpacity.setValue(0);
    }
  }, [isFocused, hasError, isExpired, disabled, cursorOpacity]);

  const handlePress = () => {
    if (!disabled && !isExpired) {
      inputRef.current?.focus();
    }
  };

  const handleChangeText = (text: string) => {
    // Only accept numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= length) {
      onChange(numericText);
    }
  };

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Hidden real TextInput that captures keyboard events and SMS autofill */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled && !isExpired}
        style={styles.hiddenInput}
        caretHidden
      />

      {/* Render the 6 OTP display boxes */}
      <View style={styles.boxesRow}>
        {digits.map((digit, index) => {
          const isCurrentActive =
            isFocused && (index === value.length || (index === length - 1 && value.length === length));

          const borderColor = hasError
            ? '#E03137'
            : isCurrentActive
            ? Colors.primary
            : Colors.border;

          const showCursor = isCurrentActive && !digit && !hasError && !isExpired;

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  borderColor,
                },
                isCurrentActive && styles.activeBox,
                hasError && styles.errorBox,
              ]}
            >
              {digit ? (
                <Text style={styles.digitText}>{digit}</Text>
              ) : showCursor ? (
                <Animated.View
                  style={[
                    styles.cursor,
                    {
                      opacity: cursorOpacity,
                    },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
};

export default memo(OtpInput);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 18,
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 10,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  box: {
    width: 48,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#0C1B2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBox: {
    borderColor: Colors.primary,
    backgroundColor: '#112338',
  },
  errorBox: {
    borderColor: '#E03137',
    backgroundColor: '#181E2E',
  },
  digitText: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
