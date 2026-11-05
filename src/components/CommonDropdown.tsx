import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../units/Colors';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface CommonDropdownProps {
  label: string;
  value?: string;
  options: (string | DropdownOption)[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder,
  disabled = false,
  error,
  helperText,
  containerStyle,
  dropdownStyle,
  labelStyle,
  activeBorderColor = Colors.primary,
  inactiveBorderColor = Colors.inputBorder,
  activeBackgroundColor = Colors.cardBackground,
  inactiveBackgroundColor = 'transparent',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize options to { label, value } objects
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : '';
  const hasValue = Boolean(value && value.length > 0);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Dropdown Capsule Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleOpen}
        disabled={disabled}
        style={[
          styles.dropdownContainer,
          {
            backgroundColor: hasValue || isOpen ? activeBackgroundColor : inactiveBackgroundColor,
            borderColor: error
              ? '#EF4444'
              : isOpen
              ? activeBorderColor
              : hasValue
              ? '#273C56'
              : inactiveBorderColor,
          },
          disabled && styles.disabled,
          dropdownStyle,
        ]}
      >
        {/* Floating label if value is selected */}
        {hasValue ? (
          <View style={styles.contentWithLabel}>
            <Text numberOfLines={1} style={[styles.floatingLabel, labelStyle]}>
              {label}
            </Text>
            <Text numberOfLines={1} style={styles.selectedValueText}>
              {displayLabel}
            </Text>
          </View>
        ) : (
          <Text numberOfLines={1} style={[styles.placeholderText, labelStyle]}>
            {placeholder || label}
          </Text>
        )}

        {/* Chevron Icon */}
        <View style={styles.chevronWrapper}>
          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isOpen ? Colors.primary : Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Error or Helper text */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* Options Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {normalizedOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                return (
                  <TouchableOpacity
                    key={`${opt.value}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(opt.value)}
                    style={[
                      styles.optionItem,
                      isSelected && styles.selectedOptionItem,
                      index === normalizedOptions.length - 1 && styles.lastOptionItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {opt.label}
                    </Text>

                    {isSelected ? (
                      <View style={styles.checkCircle}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.emptyCircle} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CommonDropdown;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 8,
  },
  dropdownContainer: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentWithLabel: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  floatingLabel: {
    fontSize: RFValue(10.5),
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: '400',
  },
  selectedValueText: {
    fontSize: RFValue(13.5),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    flex: 1,
    fontWeight: '400',
  },
  chevronWrapper: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#101E31',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1C2F46',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D44',
  },
  modalTitle: {
    fontSize: RFValue(15.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  selectedOptionItem: {
    backgroundColor: '#16283F',
  },
  lastOptionItem: {
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: RFValue(13.5),
    color: '#CBD5E1',
    fontWeight: '400',
    flex: 1,
  },
  selectedOptionLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#263C55',
  },
});

