import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  FamilyHeader,
  FamilyAvatarCluster,
  FamilyDetailsCard,
} from '../components';

export interface FamilyInviteFoundScreenProps {
  familyName?: string;
  inviterName?: string;
  familyId?: string;
  memberCount?: string;
  sentTime?: string;
  onBack?: () => void;
  onAskToJoin?: () => void;
  onNotMyFamily?: () => void;
}

const FamilyInviteFoundScreen: React.FC<FamilyInviteFoundScreenProps> = ({
  familyName = 'The Sharma Family',
  inviterName = 'Priya',
  familyId = 'HSQ-4821',
  memberCount = '5 people',
  sentTime = 'Today, 10:48 AM',
  onBack,
  onAskToJoin,
  onNotMyFamily,
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
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* Overlapping Avatar Cluster */}
          <FamilyAvatarCluster primaryInitial="S" />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {inviterName} invited you to {familyName}
          </Text>

          <Text style={styles.subtitle}>
            Join to share tasks, plans and check-ins with everyone at home.
          </Text>

          {/* Family Details Card Table */}
          <FamilyDetailsCard
            familyId={familyId}
            memberCount={memberCount}
            invitedBy={`${inviterName} Sharma · Owner`}
            sentTime={sentTime}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Ask to join"
            onPress={onAskToJoin}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          <Text style={styles.adminApprovalNote}>
            {inviterName} or another admin approves your request.
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotMyFamily}
            style={styles.notMyFamilyButton}
          >
            <Text style={styles.notMyFamilyText}>This isn't my family</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FamilyInviteFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: RFValue(28),
    marginTop: 6,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  adminApprovalNote: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  notMyFamilyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  notMyFamilyText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});

