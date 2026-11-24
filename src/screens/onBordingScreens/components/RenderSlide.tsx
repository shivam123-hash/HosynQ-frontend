import React, { memo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  image?: any;
}

export interface RenderSlideProps {
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
}

const RenderSlide: React.FC<RenderSlideProps> = ({ title, subtitle, style }) => {
  return (
    <View style={[styles.copy, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{subtitle}</Text>
    </View>
  );
};

export default memo(RenderSlide);

const styles = StyleSheet.create({
  copy: {
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(24),
    lineHeight: RFValue(31),
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    color: '#8C98AB',
    fontSize: RFValue(11),
    lineHeight: RFValue(12),
    maxWidth: 320,
    textAlign: 'left',
  },
});
