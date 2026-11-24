import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface HomeGreetingProps {
  dateString?: string;
  greeting?: string;
  userName?: string;
}

const HomeGreeting: React.FC<HomeGreetingProps> = ({
  dateString = 'Friday, 30 October',
  greeting = 'Good afternoon',
  userName = 'Priya',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{dateString}</Text>
      <Text style={styles.greetingText}>
        {greeting}, {userName}
      </Text>
    </View>
  );
};

export default memo(HomeGreeting);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  greetingText: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
});
