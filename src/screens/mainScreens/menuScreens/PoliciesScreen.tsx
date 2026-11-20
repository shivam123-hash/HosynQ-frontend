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
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../../units/Colors';

export interface PoliciesScreenProps {
  onBack?: () => void;
  onSelectPolicy?: (policyKey: string) => void;
  onContactSupport?: () => void;
}

export const PoliciesScreen: React.FC<PoliciesScreenProps> = ({
  onBack,
  onSelectPolicy,
  onContactSupport,
}) => {
  const insets = useSafeAreaInsets();

  const policies = [
    {
      key: 'terms',
      title: 'Terms of use',
      subtitle: 'Version 1.2 · 1 Oct 2026',
    },
    {
      key: 'privacy',
      title: 'Privacy notice',
      subtitle: 'Version 1.2 · 1 Oct 2026',
    },
    {
      key: 'children',
      title: 'Children’s data',
      subtitle: 'How we handle data about children',
    },
    {
      key: 'refunds',
      title: 'Refunds and cancellation',
      subtitle: 'Version 1.0 · 1 Jun 2026',
    },
    {
      key: 'licenses',
      title: 'Open-source licences',
      subtitle: 'Software HosynQ uses',
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

          <Text style={styles.topBarTitle}>Policies</Text>

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
          {/* Policies Grouped Card */}
          <View style={styles.card}>
            {policies.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onSelectPolicy?.(item.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBox}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={Colors.handleMuted}
                      />
                    </View>
                    <View style={styles.textColumn}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5A6880" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Footer Question / Contact Support Link */}
          <TouchableOpacity
            onPress={onContactSupport}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Questions about a policy? Write to us from Contact support."
          >
            <Text style={styles.footerText}>
              Questions about a policy? Write to us from Contact support.
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.handleMuted,
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
    color: Colors.white,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
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
    borderColor: Colors.handleMuted,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderBold,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
