import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  PersonalInfoHeader,
  DocumentReminderBanner,
  DocumentGroupCard,
  DocumentItemRow,
} from '../components';

export interface ImportantDocumentsScreenProps {
  onBack?: () => void;
  onAddDocument?: () => void;
  onDocumentPress?: (documentId: string) => void;
}

const ImportantDocumentsScreen: React.FC<ImportantDocumentsScreenProps> = ({
  onBack,
  onAddDocument,
  onDocumentPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <PersonalInfoHeader
        title="Important documents"
        subtitle="Priya · Section 2 of 5"
        onBack={onBack}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reminder Banner */}
        <DocumentReminderBanner />

        {/* Section 1: TRAVEL AND DRIVING */}
        <DocumentGroupCard sectionTitle="TRAVEL AND DRIVING">
          <DocumentItemRow
            id="passport"
            title="Passport"
            subtitle="Expires 21 Aug 2027"
            icon={<Feather name="book-open" size={18} color="#38BDF8" />}
            iconBgColor="rgba(56, 189, 248, 0.12)"
            iconBorderColor="rgba(56, 189, 248, 0.25)"
            onPress={() => onDocumentPress?.('passport')}
            showDivider={true}
          />
          <DocumentItemRow
            id="us-visa"
            title="US visa (B1/B2)"
            subtitle="Expires 3 Mar 2027 · in 4 months"
            badgeText="Soon"
            icon={<Feather name="globe" size={18} color="#F59E0B" />}
            iconBgColor="rgba(245, 158, 11, 0.12)"
            iconBorderColor="rgba(245, 158, 11, 0.25)"
            onPress={() => onDocumentPress?.('us-visa')}
            showDivider={true}
          />
          <DocumentItemRow
            id="driving-licence"
            title="Driving licence"
            subtitle="Expires 8 Aug 2028"
            icon={<Ionicons name="car-outline" size={19} color="#14B8A6" />}
            iconBgColor="rgba(20, 184, 166, 0.12)"
            iconBorderColor="rgba(20, 184, 166, 0.25)"
            onPress={() => onDocumentPress?.('driving-licence')}
            showDivider={false}
          />
        </DocumentGroupCard>

        {/* Section 2: ID · OPTIONAL */}
        <DocumentGroupCard sectionTitle="ID · OPTIONAL">
          <DocumentItemRow
            id="aadhaar"
            title="Aadhaar"
            subtitle="Added · **** **** 2290"
            isLocked={true}
            icon={<Feather name="credit-card" size={18} color="#F43F5E" />}
            iconBgColor="rgba(244, 63, 94, 0.12)"
            iconBorderColor="rgba(244, 63, 94, 0.25)"
            onPress={() => onDocumentPress?.('aadhaar')}
            showDivider={true}
          />
          <DocumentItemRow
            id="pan"
            title="PAN"
            subtitle="Not added"
            actionText="Add"
            icon={<Feather name="file-text" size={18} color="#94A3B8" />}
            iconBgColor="rgba(148, 163, 184, 0.12)"
            iconBorderColor="rgba(148, 163, 184, 0.25)"
            onPress={() => onDocumentPress?.('pan')}
            showDivider={false}
          />
        </DocumentGroupCard>

        {/* Section 3: INSURANCE */}
        <DocumentGroupCard sectionTitle="INSURANCE">
          <DocumentItemRow
            id="star-health"
            title="Star Health Family Floater"
            subtitle="Renews 12 Mar 2027 · In Family Vault"
            icon={<Feather name="shield" size={18} color="#A855F7" />}
            iconBgColor="rgba(168, 85, 247, 0.12)"
            iconBorderColor="rgba(168, 85, 247, 0.25)"
            onPress={() => onDocumentPress?.('star-health')}
            showDivider={false}
          />
        </DocumentGroupCard>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="+ Add document"
          onPress={onAddDocument}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default ImportantDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

