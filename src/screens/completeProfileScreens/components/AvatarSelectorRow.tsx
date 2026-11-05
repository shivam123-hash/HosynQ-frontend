import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface AvatarSelectorRowProps {
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
}

export const PRESET_AVATARS = ['😄', '😎', '🐶', '🐼', '🦊'];

const AvatarSelectorRow: React.FC<AvatarSelectorRowProps> = ({
  selectedAvatar,
  onSelectAvatar,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Avatar</Text>
      <View style={styles.avatarsWrapper}>
        {PRESET_AVATARS.map((item, index) => {
          const isSelected = selectedAvatar === item;
          return (
            <TouchableOpacity
              key={`${item}-${index}`}
              activeOpacity={0.7}
              onPress={() => onSelectAvatar(item)}
              style={[
                styles.avatarCircle,
                isSelected && styles.selectedAvatarCircle,
              ]}
            >
              <Text style={styles.emojiText}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AvatarSelectorRow;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  label: {
    fontSize: RFValue(12.5),
    color: '#8E9AA8',
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  avatarsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#101E31',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C2F46',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#13233A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedAvatarCircle: {
    borderColor: Colors.primary,
    backgroundColor: '#1D2E47',
  },
  emojiText: {
    fontSize: RFValue(20),
  },
});

