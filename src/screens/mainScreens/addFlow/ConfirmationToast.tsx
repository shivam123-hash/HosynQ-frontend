import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface ConfirmationToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'cancelled' | 'info';
  onUndo?: () => void;
  onView?: () => void;
}

export const ConfirmationToast: React.FC<ConfirmationToastProps> = ({
  visible,
  message,
  type = 'success',
  onUndo,
  onView,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.toast}>
        <View style={styles.left}>
          {type === 'success' ? (
            <Feather name="check-circle" size={20} color={Colors.accentGreen} />
          ) : (
            <Feather name="minus-circle" size={20} color={Colors.textMutedSlate} />
          )}
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <View style={styles.actions}>
          {onView && (
            <TouchableOpacity
              onPress={onView}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>
          )}
          {onUndo && (
            <TouchableOpacity
              onPress={onUndo}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    backgroundColor: Colors.toastText,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.cardInsetDark,
    marginLeft: 10,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.amberDark,
  },
});
