import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  DimensionValue,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface AppOptionsMenuItem {
  id: string;
  label: string;
  iconName?: string;
  customIcon?: React.ReactNode;
  iconColor?: string;
  destructive?: boolean;
  onPress: () => void;
  showDividerAfter?: boolean;
}

export interface AppOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  items: AppOptionsMenuItem[];
  topOffset?: number;
  rightOffset?: number;
  width?: DimensionValue;
  accessibilityLabel?: string;
}

export const AppOptionsMenu: React.FC<AppOptionsMenuProps> = ({
  visible,
  onClose,
  items,
  topOffset = 58,
  rightOffset = 20,
  width = 210,
  accessibilityLabel = 'Options menu',
}) => {
  if (!visible || items.length === 0) return null;

  return (
    <>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss options menu"
      />
      <View
        style={[
          styles.dropdownMenu,
          {
            top: topOffset,
            right: rightOffset,
            width,
          },
        ]}
        accessibilityRole="menu"
        accessibilityLabel={accessibilityLabel}
      >
        {items.map((item, index) => {
          const isDestructive = Boolean(item.destructive);
          const iconColor =
            item.iconColor || (isDestructive ? '#EF4444' : '#8A97AB');

          return (
            <React.Fragment key={item.id || `opt-${index}`}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
                activeOpacity={0.7}
                accessibilityRole="menuitem"
                accessibilityLabel={item.label}
              >
                {item.customIcon ? (
                  item.customIcon
                ) : item.iconName ? (
                  <Feather
                    name={item.iconName as any}
                    size={16}
                    color={iconColor}
                    style={styles.dropdownIcon}
                  />
                ) : null}
                <Text
                  style={[
                    styles.dropdownItemText,
                    isDestructive && styles.dropdownItemTextDestructive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              {item.showDividerAfter && <View style={styles.dropdownDivider} />}
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

export default memo(AppOptionsMenu);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingVertical: 6,
    zIndex: 1000,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  dropdownItemTextDestructive: {
    color: '#EF4444',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginVertical: 4,
    marginHorizontal: 12,
  },
});
