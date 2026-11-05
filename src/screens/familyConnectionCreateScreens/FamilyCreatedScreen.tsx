import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import {
  FamilyHeader,
  SuccessCheckmarkCircle,
  FamilyIdCard,
  InviteFamilyBottomSheet,
} from './components';

export interface FamilyCreatedScreenProps {
  familyName?: string;
  familyId?: string;
  inviterName?: string;
  onBack?: () => void;
  onShareInvite?: () => void;
  onGoHome?: () => void;
}

const FamilyCreatedScreen: React.FC<FamilyCreatedScreenProps> = ({
  familyName = 'The Sharma Family',
  familyId = 'HSQ-4821',
  inviterName = 'Priya',
  onBack,
  onShareInvite,
  onGoHome,
}) => {
  const insets = useSafeAreaInsets();
  const [isInviteSheetVisible, setIsInviteSheetVisible] = useState(false);

  const handleOpenInviteSheet = () => {
    setIsInviteSheetVisible(true);
  };

  const handleCloseInviteSheet = () => {
    setIsInviteSheetVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with 100% progress */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={100}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerContent}>
          {/* Success Checkmark Circle */}
          <SuccessCheckmarkCircle size={96} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {familyName}
            {'\n'}is ready
          </Text>

          <Text style={styles.subtitle}>
            Share your Family ID so everyone can join. You'll approve each
            request before they're in.
          </Text>

          {/* Family ID Box */}
          <FamilyIdCard familyId={familyId} />
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Share invite"
            onPress={handleOpenInviteSheet}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
            leftComponent={
              <Feather
                name="upload"
                size={18}
                color="#FFFFFF"
                style={styles.uploadIcon}
              />
            }
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onGoHome}
            style={styles.goHomeButton}
          >
            <Text style={styles.goHomeText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Invite Your Family Bottom Sheet */}
      <InviteFamilyBottomSheet
        visible={isInviteSheetVisible}
        onClose={handleCloseInviteSheet}
        familyName={familyName}
        familyId={familyId}
        inviterName={inviterName}
        onShareLink={onShareInvite}
      />
    </View>
  );
};

export default FamilyCreatedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  centerContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 22,
    lineHeight: RFValue(28),
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  uploadIcon: {
    marginRight: 8,
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  goHomeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  goHomeText: {
    color: Colors.textSecondary,
    fontSize: RFValue(14.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});

