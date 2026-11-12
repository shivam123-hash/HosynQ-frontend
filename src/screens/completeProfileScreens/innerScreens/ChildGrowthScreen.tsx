import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  PersonalInfoHeader,
  VaccinationSegmentedTabs,
  VaccinationTab,
  GrowthLineChart,
} from '../components';

export interface ChildGrowthScreenProps {
  childName?: string;
  onBack?: () => void;
  onTabChange?: (tab: VaccinationTab) => void;
  onAddMeasurement?: () => void;
}

const ChildGrowthScreen: React.FC<ChildGrowthScreenProps> = ({
  childName = 'Aarav',
  onBack,
  onTabChange,
  onAddMeasurement,
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
        title="Vaccination"
        subtitle={`${childName} · Section 4 of 5`}
        onBack={onBack}
      />

      {/* Segmented Tabs */}
      <VaccinationSegmentedTabs
        activeTab="growth"
        onTabChange={(tab) => onTabChange?.(tab)}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GrowthLineChart
          currentHeight="132 cm"
          measuredDate="Measured 12 Oct 2026"
          weight="28 kg"
          grewThisYear="+5 cm"
          nextMeasureDate="Jun 2027"
        />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="✎ Add measurement"
          onPress={onAddMeasurement}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default ChildGrowthScreen;

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

