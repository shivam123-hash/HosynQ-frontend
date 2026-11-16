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
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#8A97AB',
  },
  greetingText: {
    fontFamily: 'Roboto',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '500',
    color: '#CAD4DF',
  },
});
