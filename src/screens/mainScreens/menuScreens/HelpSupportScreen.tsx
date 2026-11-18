import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface HelpSupportScreenProps {
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onSelectFaq?: (faqQuestion: string) => void;
  onSelectCategory?: (category: string) => void;
  onContactSupport?: () => void;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#F0913A',
}) => {
  const s = size / 18;
  const stroke = Math.max(1.4, 1.5 * s);

  const pts: [number, number, number, number, string][] = [
    [2.5 * s, 12 * s, 1.5 * s, 4.5 * s, 'l-outer'],
    [1.5 * s, 4.5 * s, 6 * s, 7.5 * s, 'l-inner'],
    [6 * s, 7.5 * s, 9 * s, 1.5 * s, 'c-left'],
    [9 * s, 1.5 * s, 12 * s, 7.5 * s, 'c-right'],
    [12 * s, 7.5 * s, 16.5 * s, 4.5 * s, 'r-inner'],
    [16.5 * s, 4.5 * s, 15.5 * s, 12 * s, 'r-outer'],
    [2 * s, 12 * s, 16 * s, 12 * s, 'base'],
  ];

  return (
    <View
      style={{
        width: 18 * s,
        height: 14 * s,
        position: 'relative',
      }}
    >
      {pts.map(([x1, y1, x2, y2, key]) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={key}
            style={{
              position: 'absolute',
              left: (x1 + x2) / 2 - len / 2,
              top: (y1 + y2) / 2 - stroke / 2,
              width: len,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke / 2,
              transform: [{ rotate: `${deg}deg` }],
            }}
          />
        );
      })}
    </View>
  );
};

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
  onSearch,
  onSelectFaq,
  onSelectCategory,
  onContactSupport,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const popularFaqs = [
    'How do I invite my family?',
    'How does the AI brief work?',
    'Who can see my location?',
    'How do I cancel Premium?',
  ];

  const browseCategories = [
    {
      title: 'Tasks and lists',
      icon: 'check-square',
      color: '#F0913A',
      isCrown: false,
    },
    {
      title: 'Calendar',
      icon: 'calendar',
      color: '#5B9BF0',
      isCrown: false,
    },
    {
      title: 'Compass and location',
      icon: 'navigation',
      color: '#3CC4C4',
      isCrown: false,
    },
    {
      title: 'Subscription and billing',
      icon: 'award',
      color: '#F0913A',
      isCrown: true,
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

          <Text style={styles.topBarTitle}>Help and support</Text>

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
          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#8A97AB" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help"
              placeholderTextColor="#8A97AB"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                onSearch?.(text);
              }}
              selectionColor="#F0913A"
            />
          </View>

          {/* Section: POPULAR */}
          <Text style={styles.sectionLabel}>POPULAR</Text>
          <View style={styles.card}>
            {popularFaqs.map((faq, index) => (
              <React.Fragment key={faq}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => onSelectFaq?.(faq)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={faq}
                >
                  <Text style={styles.faqText}>{faq}</Text>
                  <Feather name="chevron-right" size={18} color="#5A6880" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Section: BROWSE */}
          <Text style={styles.sectionLabel}>BROWSE</Text>
          <View style={styles.card}>
            {browseCategories.map((item, index) => (
              <React.Fragment key={item.title}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.browseRow}
                  onPress={() => onSelectCategory?.(item.title)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <View style={styles.browseLeft}>
                    <View
                      style={[
                        styles.iconBox,
                        { borderColor: item.color },
                      ]}
                    >
                      {item.isCrown ? (
                        <CrownIcon size={16} color={item.color} />
                      ) : (
                        <Feather name={item.icon as any} size={18} color={item.color} />
                      )}
                    </View>
                    <Text style={styles.browseTitle}>{item.title}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5A6880" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Contact Support Card */}
          <TouchableOpacity
            style={[styles.card, styles.contactCard]}
            onPress={onContactSupport}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Contact support"
          >
            <View style={styles.contactLeft}>
              <View style={[styles.iconBox, { borderColor: '#F0913A' }]}>
                <Feather name="message-square" size={18} color="#F0913A" />
              </View>
              <View style={styles.contactTextColumn}>
                <Text style={styles.contactTitle}>Contact support</Text>
                <Text style={styles.contactSubtitle}>We usually reply within 24 hours</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>
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
  searchBar: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  faqText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 12,
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  browseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  browseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactTextColumn: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
  },
});
