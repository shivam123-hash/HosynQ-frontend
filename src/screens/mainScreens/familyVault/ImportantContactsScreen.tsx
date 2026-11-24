import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CarIcon } from './VaultIcons';

export interface ImportantContactsScreenProps {
  onBack?: () => void;
  onAddContact?: () => void;
  onCallContact?: (contact: any) => void;
  onSelectContact?: (contact: any) => void;
}

const CATEGORIES = ['All', 'Doctors', 'School', 'Home help'];

export const ImportantContactsScreen: React.FC<ImportantContactsScreenProps> = ({
  onBack,
  onAddContact,
  onCallContact,
  onSelectContact,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Important contacts</Text>

        <TouchableOpacity
          onPress={onAddContact}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Add contact"
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8A97AB" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            placeholderTextColor="#8A97AB"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={cat}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Regular Contacts Card */}
        <View style={styles.card}>
          {/* Contact 1: Dr. Mehta */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectContact?.({ name: 'Dr. Mehta' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#A884F0' }]}>
              <Feather name="user" size={18} color="#A884F0" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Dr. Mehta</Text>
              <Text style={styles.rowSubtitle}>Paediatrician · Apollo Cradle</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => onCallContact?.({ name: 'Dr. Mehta' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Dr. Mehta"
            >
              <Feather name="phone" size={16} color="#F0923A" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Contact 2: St. Mary's School office */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectContact?.({ name: 'St. Mary’s School office' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
              <Feather name="book-open" size={18} color="#5B9BF1" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>St. Mary’s School office</Text>
              <Text style={styles.rowSubtitle}>Mon to Fri, 8 AM to 3 PM</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => onCallContact?.({ name: 'St. Mary’s School office' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call St. Mary’s School office"
            >
              <Feather name="phone" size={16} color="#F0923A" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Contact 3: Ramesh */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectContact?.({ name: 'Ramesh' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#3DC4C4' }]}>
              <CarIcon size={20} color="#3DC4C4" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Ramesh</Text>
              <Text style={styles.rowSubtitle}>Driver</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => onCallContact?.({ name: 'Ramesh' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Ramesh"
            >
              <Feather name="phone" size={16} color="#F0923A" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Contact 4: Sunil */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectContact?.({ name: 'Sunil' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F0923A' }]}>
              <Feather name="tool" size={18} color="#F0923A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Sunil</Text>
              <Text style={styles.rowSubtitle}>Plumber</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => onCallContact?.({ name: 'Sunil' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Sunil"
            >
              <Feather name="phone" size={16} color="#F0923A" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Contact 5: Society security */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectContact?.({ name: 'Society security' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#4CC38A' }]}>
              <Feather name="shield" size={18} color="#4CC38A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Society security</Text>
              <Text style={styles.rowSubtitle}>Gate 2 · 24 hours</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => onCallContact?.({ name: 'Society security' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Society security"
            >
              <Feather name="phone" size={16} color="#F0923A" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Section: EMERGENCY */}
        <Text style={styles.sectionHeading}>EMERGENCY</Text>
        <View style={styles.card}>
          {/* Emergency 1: Ambulance */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onCallContact?.({ name: 'Ambulance', number: '108' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
              <Feather name="alert-circle" size={18} color="#F06A6A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Ambulance</Text>
              <Text style={styles.rowSubtitle}>108</Text>
            </View>
            <TouchableOpacity
              style={styles.emergencyCallBtn}
              onPress={() => onCallContact?.({ name: 'Ambulance', number: '108' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Ambulance 108"
            >
              <Feather name="phone" size={16} color="#F06A6A" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Emergency 2: Police */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onCallContact?.({ name: 'Police', number: '112' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F06A6A' }]}>
              <Feather name="shield" size={18} color="#F06A6A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Police</Text>
              <Text style={styles.rowSubtitle}>112</Text>
            </View>
            <TouchableOpacity
              style={styles.emergencyCallBtn}
              onPress={() => onCallContact?.({ name: 'Police', number: '112' })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Call Police 112"
            >
              <Feather name="phone" size={16} color="#F06A6A" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#3A4555',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  chipsScroll: {
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#223859',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#C8D1DC',
  },
  filterChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#162844',
    borderWidth: 1,
    borderColor: '#253856',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#162844',
    borderWidth: 1,
    borderColor: '#253856',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
});

export default ImportantContactsScreen;
