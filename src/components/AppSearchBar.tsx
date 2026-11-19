import React, { memo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../units/Colors';
import Spacing from '../units/Spacing';
import BorderRadius from '../units/BorderRadius';
import Typography from '../units/Typography';

export interface AppSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  accessibilityLabel?: string;
}

const AppSearchBar: React.FC<AppSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  placeholderTextColor = Colors.textSecondaryMuted,
  onClear,
  autoFocus = false,
  style,
  iconSize = 16,
  accessibilityLabel = 'Search input',
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, style]}>
      <Feather name="search" size={iconSize} color={placeholderTextColor} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Feather name="x" size={iconSize} color={placeholderTextColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(AppSearchBar);

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: Spacing.md + 2,
    gap: Spacing.sm + 2,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.bodyMedium,
    color: Colors.textLightMutedAlt,
    paddingVertical: 0,
  },
});
