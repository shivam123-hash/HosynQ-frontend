import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  KeyboardTypeOptions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';

export interface CommonInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  leftIcon?: any;
  leftComponent?: React.ReactNode;
  leftOffset?: number;
  rightIcon?: any;
  rightComponent?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  focusBorderColor?: string;
  labelColor?: string;
  activeLabelColor?: string;
  textColor?: string;
  iconColor?: string;
}

export interface CommonInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

const CommonInput = forwardRef<CommonInputRef, CommonInputProps>(
  (
    {
      label,
      value = '',
      onChangeText,
      placeholder,
      secureTextEntry = false,
      keyboardType = 'default',
      error,
      helperText,
      disabled = false,
      leftIcon,
      leftComponent,
      leftOffset: leftOffsetProp,
      rightIcon,
      rightComponent,
      onRightIconPress,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      labelStyle,
      activeBackgroundColor = '#13233A',
      inactiveBackgroundColor = 'transparent',
      activeBorderColor = '#273C56',
      inactiveBorderColor = '#1F3249',
      focusBorderColor = '#F0913A',
      labelColor = '#8E9AA8',
      activeLabelColor = '#8E9AA8',
      textColor = '#FFFFFF',
      iconColor = '#8E9AA8',
      onFocus,
      onBlur,
      ...restProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<any>(null);

    const hasLabel = Boolean(label && label.trim().length > 0);
    const hasValue = value !== undefined && value !== null && value.length > 0;
    const isFloating = isFocused || hasValue;

    const animatedValue = useRef(new Animated.Value(hasValue ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: isFloating ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }, [isFloating, animatedValue]);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
      isFocused: () => inputRef.current?.isFocused() ?? false,
    }));

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handlePressContainer = useCallback(() => {
      if (!disabled) {
        inputRef.current?.focus();
      }
    }, [disabled]);

    const handleTogglePassword = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const labelTop = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 9],
    });

    const labelFontSize = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [RFValue(13.5), RFValue(10.5)],
    });

    const animatedBgColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [inactiveBackgroundColor, activeBackgroundColor],
    });

    const animatedBorderColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? '#EF4444' : inactiveBorderColor,
        error ? '#EF4444' : isFocused ? focusBorderColor : activeBorderColor,
      ],
    });

    const animatedLabelColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [labelColor, activeLabelColor],
    });

    const leftOffset = leftOffsetProp ?? (leftComponent ? 96 : leftIcon ? 46 : 24);
    const rightOffset = secureTextEntry || rightIcon ? 50 : 24;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <Pressable
          onPress={handlePressContainer}
          style={[styles.pressableContainer, disabled && styles.disabled]}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              {
                backgroundColor: animatedBgColor,
                borderColor: animatedBorderColor,
              },
              inputContainerStyle,
            ]}
          >
            {/* Optional Left Component or Left Icon */}
            {leftComponent ? (
              <View style={styles.leftComponentContainer}>
                {leftComponent}
              </View>
            ) : leftIcon ? (
              <View style={styles.leftIconContainer}>
                <Ionicons name={leftIcon} size={20} color={iconColor} />
              </View>
            ) : null}

            {/* Floating Animated Label */}
            {hasLabel ? (
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.floatingLabel,
                  {
                    left: leftOffset,
                    top: labelTop,
                    fontSize: labelFontSize,
                    color: animatedLabelColor,
                  },
                  labelStyle,
                ]}
              >
                {label}
              </Animated.Text>
            ) : null}

            {/* TextInput Field */}
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={hasLabel ? (isFloating ? placeholder : undefined) : placeholder}
              placeholderTextColor={labelColor}
              editable={!disabled}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              selectionColor={focusBorderColor}
              style={[
                hasLabel ? styles.textInputWithLabel : styles.textInputWithoutLabel,
                {
                  left: leftOffset,
                  right: rightOffset,
                  color: textColor,
                  opacity: hasLabel ? (isFloating ? 1 : 0) : 1,
                },
                inputStyle,
              ]}
              {...restProps}
            />

            {/* Password Toggle or Right Icon */}
            {secureTextEntry ? (
              <TouchableOpacity
                onPress={handleTogglePassword}
                style={styles.rightIconButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            ) : rightComponent ? (
              <TouchableOpacity
                onPress={onRightIconPress}
                disabled={!onRightIconPress}
                style={styles.rightIconButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                {rightComponent}
              </TouchableOpacity>
            ) : rightIcon ? (
              <TouchableOpacity
                onPress={onRightIconPress}
                disabled={!onRightIconPress}
                style={styles.rightIconButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name={rightIcon} size={20} color={iconColor} />
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </Pressable>

        {/* Error or Helper text */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

CommonInput.displayName = 'CommonInput';

export default CommonInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 8,
  },
  pressableContainer: {
    width: '100%',
  },
  inputContainer: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingLabel: {
    position: 'absolute',
    fontWeight: '400',
    includeFontPadding: false,
    zIndex: 1,
  },
  textInputWithLabel: {
    position: 'absolute',
    top: 24,
    height: 28,
    fontSize: RFValue(13.5),
    fontWeight: '400',
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    zIndex: 2,
  },
  textInputWithoutLabel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: '100%',
    fontSize: RFValue(13.5),
    fontWeight: '400',
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    zIndex: 2,
  },
  leftComponentContainer: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 3,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  rightIconButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(11),
    marginTop: 5,
    marginLeft: 24,
    fontWeight: '400',
  },
  helperText: {
    color: '#7E8F9F',
    fontSize: RFValue(11),
    marginTop: 5,
    marginLeft: 24,
    fontWeight: '400',
  },
});
