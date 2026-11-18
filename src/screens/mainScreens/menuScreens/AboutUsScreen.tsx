import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface AboutUsScreenProps {
  onBack?: () => void;
  onRateApp?: () => void;
  onShareApp?: () => void;
  onOpenWebsite?: () => void;
  onWriteToUs?: () => void;
  appVersion?: string;
  buildNumber?: string;
}

export const AboutUsScreen: React.FC<AboutUsScreenProps> = ({
  onBack,
  onRateApp,
  onShareApp,
  onOpenWebsite,
  onWriteToUs,
  appVersion = '1.0.0',
  buildNumber = '100',
}) => {
  const insets = useSafeAreaInsets();

  const links = [
    {
      title: 'Rate HosynQ',
      icon: 'star',
      onPress: onRateApp,
    },
    {
      title: 'Share with a friend',
      icon: 'upload',
      onPress: onShareApp,
    },
    {
      title: 'Website',
      icon: 'globe',
      onPress: onOpenWebsite,
    },
    {
      title: 'Write to us',
      icon: 'mail',
      onPress: onWriteToUs,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.innerContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>About</Text>

          <View style={styles.circlePlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Branding Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoRow}>
              {/* Logo Box */}
              <View style={styles.logoBox}>
                <Feather name="home" size={26} color="#0B1A2F" />
              </View>

              {/* Brand Title */}
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitleHosyn}>Hosyn</Text>
                <Text style={styles.brandTitleQ}>Q</Text>
              </View>
            </View>

            <Text style={styles.brandSubtitle}>The Family OS</Text>
            <Text style={styles.versionText}>
              Version {appVersion} ({buildNumber})
            </Text>

            <Text style={styles.missionText}>
              HosynQ helps families plan, remember and look after each other, in
              one place. Made by ROOV Platforms.
            </Text>
          </View>

          {/* Grouped Actions Card */}
          <View style={styles.card}>
            {links.map((item, index) => (
              <React.Fragment key={item.title}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.row}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBox}>
                      <Feather name={item.icon as any} size={18} color="#F0913A" />
                    </View>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5A6880" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Copyright Footer */}
          <Text style={styles.copyrightText}>© 2026 ROOV Platforms</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B1A2F',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: 44,
    height: 44,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleHosyn: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTitleQ: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0913A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8A97AB',
    marginTop: 8,
  },
  versionText: {
    fontSize: 13,
    color: '#5A6880',
    marginTop: 4,
  },
  missionText: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 14,
    maxWidth: 320,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  copyrightText: {
    fontSize: 13,
    color: '#5A6880',
    textAlign: 'center',
    marginTop: 28,
  },
});
