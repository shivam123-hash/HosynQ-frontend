import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { IdCardIcon, PassportIcon } from './VaultIcons';

export interface DocumentsRenewalsScreenProps {
  onBack?: () => void;
  onSelectDocument?: (doc: any) => void;
  onRenew?: (item: any) => void;
  onAddDocument?: () => void;
}

const MEMBERS = ['All', 'Priya', 'Rohan', 'Aarav', 'Anaya'];

export const DocumentsRenewalsScreen: React.FC<DocumentsRenewalsScreenProps> = ({
  onBack,
  onSelectDocument,
  onRenew,
  onAddDocument,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMember, setSelectedMember] = useState('All');

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

        <Text style={styles.headerTitle}>Documents and renewals</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {MEMBERS.map((member) => {
            const isSelected = selectedMember === member;
            return (
              <TouchableOpacity
                key={member}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedMember(member)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={member}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {member}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section: RENEWING SOON */}
        <Text style={styles.sectionHeading}>RENEWING SOON</Text>
        <View style={styles.card}>
          {/* Item 1: Rohan's passport */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Rohan’s passport' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#F7C08E' }]}>
              <PassportIcon size={18} color="#F7C08E" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Rohan’s passport</Text>
              <Text style={styles.rowSubtitle}>
                Expires Mon, 14 Dec 2026 · in 45 days
              </Text>
            </View>
            <TouchableOpacity
              style={styles.renewBadge}
              onPress={() => onRenew?.({ title: 'Rohan’s passport' })}
              activeOpacity={0.8}
            >
              <Text style={styles.renewBadgeText}>Renew</Text>
            </TouchableOpacity>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 2: Dadi's senior citizen card */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Dadi’s senior citizen card' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
              <IdCardIcon size={20} color="#5B9BF1" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Dadi’s senior citizen card</Text>
              <Text style={styles.rowSubtitle}>Expires 3 Jan 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>

        {/* Section: ALL DOCUMENTS */}
        <Text style={styles.sectionHeading}>ALL DOCUMENTS</Text>
        <View style={styles.card}>
          {/* Row 1: Aadhaar cards */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Aadhaar cards' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <IdCardIcon size={20} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Aadhaar cards</Text>
              <Text style={styles.rowSubtitle}>5 of 5 added</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: PAN cards */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'PAN cards' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <IdCardIcon size={20} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>PAN cards</Text>
              <Text style={styles.rowSubtitle}>3 added</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 3: Passports */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Passports' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <PassportIcon size={20} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Passports</Text>
              <Text style={styles.rowSubtitle}>4 of 5 added</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 4: Birth certificates */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Birth certificates' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="file-text" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Birth certificates</Text>
              <Text style={styles.rowSubtitle}>2 added</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 5: Property papers */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelectDocument?.({ title: 'Property papers' })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="home" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Property papers</Text>
              <Text style={styles.rowSubtitle}>Flat, Sector 45</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating / Pinned Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddDocument}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add document"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add document</Text>
        </TouchableOpacity>
      </View>
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
  headerPlaceholder: {
    width: 44,
    height: 44,
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
  renewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  renewBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default DocumentsRenewalsScreen;
