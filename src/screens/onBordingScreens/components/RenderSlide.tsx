import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

interface RenderSlideProps {
  item: SlideItem;
}

const RenderSlide: React.FC<RenderSlideProps> = ({ item }) => {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.imageWrapper}>
        <Image
          source={item.image}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
};

export default memo(RenderSlide);

const styles = StyleSheet.create({
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.82,
    height: SCREEN_WIDTH * 0.82,
    maxHeight: 340,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 8,
    minHeight: 120,
  },
  title: {
    fontSize: RFValue(23),
    fontWeight: '700',
    color: Colors.text,
    lineHeight: RFValue(31),
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: RFValue(13),
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: RFValue(19),
    letterSpacing: -0.1,
    textAlign: 'left',
  },
});
