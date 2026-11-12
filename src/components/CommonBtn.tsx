import React, { memo, ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import Colors from '../units/Colors';
import ThreeDotsLoader from './ThreeDotsLoader';

export interface CommonBtnProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  height?: DimensionValue;
  width?: DimensionValue;
  borderRadius?: number;
  marginTop?: DimensionValue;
  elevation?: number;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fontSize?: number;
  activeOpacity?: number;
}

const CommonBtn: React.FC<CommonBtnProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  backgroundColor = Colors.primary,
  textColor = '#FFFFFF',
  borderColor,
  borderWidth,
  height = 56,
  width = '100%',
  borderRadius = 28,
  marginTop = 0,
  elevation = 0,
  leftComponent,
  rightComponent,
  containerStyle,
  textStyle,
  fontSize = 15,
  activeOpacity = 0.7,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#3A4B60' : backgroundColor,
          borderColor: borderColor,
          borderWidth: borderWidth ?? (borderColor ? 1.5 : 0),
          height,
          width,
          borderRadius,
          marginTop,
          elevation,
        },
        containerStyle,
      ]}
    >
      {loading ? (
        <ThreeDotsLoader color={textColor} />
      ) : (
        <View style={styles.content}>
          {leftComponent}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightComponent}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(CommonBtn);

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
