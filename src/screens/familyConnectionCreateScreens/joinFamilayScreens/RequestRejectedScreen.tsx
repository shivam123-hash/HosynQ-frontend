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
  RejectedUserCircle,
} from '../components';

export interface RequestRejectedScreenProps {
  familyName?: string;
  onBack?: () => void;
  onJoinDifferentFamily?: () => void;
  onCreateOwnFamily?: () => void;
}

const RequestRejectedScreen: React.FC<RequestRejectedScreenProps> = ({
  familyName = 'The Sharma Family',
  onBack,
  onJoinDifferentFamily,
  onCreateOwnFamily,
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
          {/* User Rejected Circle Graphic */}
          <RejectedUserCircle size={88} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            Your request wasn't{'\n'}approved
          </Text>

          <Text style={styles.subtitle}>
            {familyName} didn't approve this request. If you think it's a
            mistake, ask them to check the Family ID or send you a new invite.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          {/* Join a different family */}
          <CommonBtn
            title="Join a different family"
            onPress={onJoinDifferentFamily}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          {/* Create your own family */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCreateOwnFamily}
            style={styles.createOwnButton}
          >
            <Text style={styles.createOwnText}>Create your own family</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RequestRejectedScreen;

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
    paddingTop: 12,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: RFValue(28),
    marginTop: 14,
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
  },
  bottomSection: {
    marginTop: 32,
    gap: 12,
  },
  createOwnButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOwnText: {
    color: '#FFFFFF',
    fontSize: RFValue(14.5),
    fontWeight: '600',
  },
});

