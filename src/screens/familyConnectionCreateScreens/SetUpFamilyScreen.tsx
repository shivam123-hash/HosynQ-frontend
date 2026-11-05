import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import { FamilyHeader, FamilyOptionCard } from './components';

export type FamilySetupType = 'create' | 'join';

export interface SetUpFamilyScreenProps {
  initialType?: FamilySetupType;
  onBack?: () => void;
  onContinue?: (selectedType: FamilySetupType) => void;
  onJoinFamily?: () => void;
}

const SetUpFamilyScreen: React.FC<SetUpFamilyScreenProps> = ({
  initialType = 'create',
  onBack,
  onContinue,
  onJoinFamily,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<FamilySetupType>(initialType);

  const handleContinue = () => {
    if (selectedType === 'join' && onJoinFamily) {
      onJoinFamily();
    } else {
      onContinue?.(selectedType);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Step 4 of 4 and 90% progress bar */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Title & Subtitle */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Set up your family</Text>
            <Text style={styles.subtitle}>
              Start a new family space, or join one that someone at home has
              already created.
            </Text>
          </View>

          {/* Option Cards */}
          <View style={styles.optionsSection}>
            {/* Option 1: Create a family */}
            <FamilyOptionCard
              id="create"
              title="Create a family"
              description="You'll be the Owner. Invite everyone once it's set up."
              isSelected={selectedType === 'create'}
              onSelect={(id) => setSelectedType(id as FamilySetupType)}
              icon={
                <Feather
                  name="home"
                  size={20}
                  color={selectedType === 'create' ? Colors.primary : Colors.textSecondary}
                />
              }
            />

            {/* Option 2: Join a family */}
            <FamilyOptionCard
              id="join"
              title="Join a family"
              description="Use the Family ID or invite someone sent you. The family admin approves you."
              isSelected={selectedType === 'join'}
              onSelect={(id) => setSelectedType(id as FamilySetupType)}
              icon={
                <Feather
                  name="user-plus"
                  size={20}
                  color={selectedType === 'join' ? Colors.primary : Colors.textSecondary}
                />
              }
            />
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Continue"
            onPress={handleContinue}
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

export default SetUpFamilyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: RFValue(19),
    paddingHorizontal: 12,
  },
  optionsSection: {
    marginTop: 6,
  },
  bottomSection: {
    marginTop: 32,
  },
});

