import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface DiscardChangesModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({
  visible,
  title = 'Discard this task?',
  subtitle = 'You haven’t saved it yet. If you leave now, what you typed will be lost.',
  onKeepEditing,
  onDiscard,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeepEditing}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onKeepEditing}
        />

        <View style={styles.dialogCard}>
          {/* Alert Circle Icon */}
          <View style={styles.iconCircle}>
            <Feather name="alert-circle" size={26} color="#F87171" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Primary Action: Keep editing */}
          <TouchableOpacity
            style={styles.keepEditingBtn}
            onPress={onKeepEditing}
            activeOpacity={0.8}
          >
            <Text style={styles.keepEditingText}>Keep editing</Text>
          </TouchableOpacity>

          {/* Destructive Action: Discard */}
          <TouchableOpacity
            style={styles.discardBtn}
            onPress={onDiscard}
            activeOpacity={0.7}
          >
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DiscardChangesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1522',
    borderWidth: 1.5,
    borderColor: '#6B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  keepEditingBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  keepEditingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  discardBtn: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
});
