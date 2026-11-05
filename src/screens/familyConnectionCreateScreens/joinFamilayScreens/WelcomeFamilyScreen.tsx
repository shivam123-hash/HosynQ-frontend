import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  FamilyHeader,
  FamilyAvatarCluster,
  UserRoleCard,
} from '../components';

export interface WelcomeFamilyScreenProps {
  familyName?: string;
  approverName?: string;
  userInitial?: string;
  roleTitle?: string;
  buttonText?: string;
  onBack?: () => void;
  onContinue?: () => void;
}

const WelcomeFamilyScreen: React.FC<WelcomeFamilyScreenProps> = ({
  familyName = 'The Sharma Family',
  approverName = 'Priya',
  userInitial = 'R',
  roleTitle = 'Adult member',
  buttonText = 'Next',
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const welcomeMembers = [
    { initial: 'P', bgColor: '#7C4A27' },
    { initial: 'D', bgColor: '#1E4D45' },
    { initial: userInitial, bgColor: '#1E3A8A', textColor: '#93C5FD', isPrimary: true },
    { initial: 'A', bgColor: '#5C2444' },
    { initial: 'Aa', bgColor: '#7A6B22' },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with 100% Progress */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={100}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* Avatar Cluster with "R" */}
          <FamilyAvatarCluster
            primaryInitial={userInitial}
            members={welcomeMembers}
          />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            Welcome to {familyName}
          </Text>

          <Text style={styles.subtitle}>
            {approverName} approved your request. You can now see the family
            calendar, tasks and chat.
          </Text>

          {/* Role & Permissions Card */}
          <UserRoleCard roleTitle={roleTitle} />
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title={buttonText}
            onPress={onContinue}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default WelcomeFamilyScreen;

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
  },
});

