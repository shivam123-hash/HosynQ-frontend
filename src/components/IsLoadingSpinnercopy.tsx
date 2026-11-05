import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface IsLoadingSpinnerProps {
  size?: number | 'small' | 'large';
  color?: string;
}

const IsLoadingSpinner: React.FC<IsLoadingSpinnerProps> = ({ size = 22, color = '#1E88E5' }) => {
  return (
    <View style={styles.main}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
};

export default memo(IsLoadingSpinner);

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
