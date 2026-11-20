import React from 'react';
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
import Ionicons from '@react-native-vector-icons/ionicons';

export interface ImportantDocumentsSectionScreenProps {
  memberName?: string;
  onBack?: () => void;
  onAddDocument?: () => void;
  onDocumentPress?: (docId: string) => void;
}

export const ImportantDocumentsSectionScreen: React.FC<ImportantDocumentsSectionScreenProps> = ({
  memberName = 'Aarav',
  onBack,
  onAddDocument,
  onDocumentPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Important documents</Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section C`}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="sparkles" size={18} color="#F0923A" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            HosynQ reminds you before these expire.
          </Text>
        </View>

        {/* Documents Card */}
        <View style={styles.card}>
          {/* 1. Passport */}
          <TouchableOpacity
            style={[styles.docRow, styles.docRowMultiLine]}
            onPress={() => onDocumentPress && onDocumentPress('passport')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Passport document"
          >
            <View style={[styles.docIconBox, { borderColor: '#5B9BF0', backgroundColor: 'rgba(91, 155, 240, 0.12)' }]}>
              <Feather name="columns" size={18} color="#5B9BF0" />
            </View>
            <View style={styles.docInfo}>
              <View style={styles.docTitleRow}>
                <Text style={styles.docTitle}>Passport</Text>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>Renew soon</Text>
                </View>
              </View>
              <Text style={styles.docSubtitle}>Expires 2 Mar 2027 · Reminder 90 days before</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 2. Aadhaar */}
          <TouchableOpacity
            style={styles.docRow}
            onPress={() => onDocumentPress && onDocumentPress('aadhaar')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Aadhaar document"
          >
            <View style={[styles.docIconBox, { borderColor: '#F06A6A', backgroundColor: 'rgba(240, 106, 106, 0.12)' }]}>
              <Feather name="credit-card" size={18} color="#F06A6A" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Aadhaar</Text>
              <Text style={styles.docSubtitle}>Added · •••• •••• 7710</Text>
            </View>
            <Feather name="lock" size={15} color="#5A6880" style={{ marginRight: 10 }} />
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 3. Birth certificate */}
          <TouchableOpacity
            style={styles.docRow}
            onPress={() => onDocumentPress && onDocumentPress('birth_certificate')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Birth certificate document"
          >
            <View style={[styles.docIconBox, { borderColor: '#4CC38A', backgroundColor: 'rgba(76, 195, 138, 0.12)' }]}>
              <Feather name="file-text" size={18} color="#4CC38A" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Birth certificate</Text>
              <Text style={styles.docSubtitle}>Added 12 Jun 2017</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 4. School ID card */}
          <TouchableOpacity
            style={styles.docRow}
            onPress={() => onDocumentPress && onDocumentPress('school_id')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="School ID card document"
          >
            <View style={[styles.docIconBox, { borderColor: '#3CC4C4', backgroundColor: 'rgba(60, 196, 196, 0.12)' }]}>
              <Feather name="credit-card" size={18} color="#3CC4C4" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>School ID card</Text>
              <Text style={styles.docSubtitle}>Valid till 31 Mar 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 5. PAN card (Dimmed / Not needed until 18) */}
          <View style={styles.docRow}>
            <View style={[styles.docIconBox, { borderColor: '#26354B', backgroundColor: 'rgba(38, 53, 75, 0.25)' }]}>
              <Feather name="credit-card" size={18} color="#37465E" />
            </View>
            <View style={styles.docInfo}>
              <Text style={[styles.docTitle, { color: '#5A6880' }]}>PAN card</Text>
              <Text style={[styles.docSubtitle, { color: '#37465E' }]}>Not needed until 18</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pinned Bottom Button: + Add document */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddDocument}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add document"
        >
          <Text style={styles.addButtonText}>+ Add document</Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 6,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A97AB',
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B47',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A3E5E',
    padding: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  docRowMultiLine: {
    paddingVertical: 16,
  },
  docIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
    marginRight: 8,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  docTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  docSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2.5,
  },
  badgeOrange: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BD997B',
    backgroundColor: 'rgba(240, 146, 58, 0.12)',
  },
  badgeOrangeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F6C08E',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomBar: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ImportantDocumentsSectionScreen;
