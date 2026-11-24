import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface EducationSectionScreenProps {
  memberName?: string;
  isAdult?: boolean;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onItemPress?: (fieldKey: string) => void;
}

export const EducationSectionScreen: React.FC<EducationSectionScreenProps> = ({
  memberName = 'Aarav',
  isAdult = false,
  onBack,
  onSave,
  onItemPress,
}) => {
  const insets = useSafeAreaInsets();

  const [schoolData] = useState({
    school: 'St. Mary’s School, Sector 46',
    className: 'Class 4 · Section B',
    classTeacher: 'Mrs. D’Souza',
    schoolHours: 'Mon to Fri, 8:00 AM to 2:30 PM',
    gettingThere: 'School bus · Route 7',
  });

  const [addHolidays, setAddHolidays] = useState(true);
  const [remindFeeDueDates, setRemindFeeDueDates] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header with Title and Subtitle */}
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
          <Text style={styles.headerTitle}>
            {isAdult ? 'Career' : 'Education'}
          </Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section B`}</Text>
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
        {/* Education Details Card */}
        <View style={styles.card}>
          {/* School */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('school')}
            activeOpacity={0.7}
          >
            <Feather name="award" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>School</Text>
              <Text style={styles.fieldValue}>{schoolData.school}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Class */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('class')}
            activeOpacity={0.7}
          >
            <Feather name="book-open" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Class</Text>
              <Text style={styles.fieldValue}>{schoolData.className}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Class Teacher */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('teacher')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Class teacher</Text>
              <Text style={styles.fieldValue}>{schoolData.classTeacher}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* School Hours */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('hours')}
            activeOpacity={0.7}
          >
            <Feather name="clock" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>School hours</Text>
              <Text style={styles.fieldValue}>{schoolData.schoolHours}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Getting There */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('transit')}
            activeOpacity={0.7}
          >
            <Feather name="truck" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Getting there</Text>
              <Text style={styles.fieldValue}>{schoolData.gettingThere}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>
        </View>

        {/* Toggles Card */}
        <View style={styles.togglesCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Add school holidays to Calendar</Text>
            <Switch
              value={addHolidays}
              onValueChange={setAddHolidays}
              trackColor={{ false: '#1F3352', true: '#EE933A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.dividerNoIndent} />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Remind me about fee due dates</Text>
            <Switch
              value={remindFeeDueDates}
              onValueChange={setRemindFeeDueDates}
              trackColor={{ false: '#1F3352', true: '#EE933A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerCaption}>
          For adults, this section is Career: job, office and work hours.
        </Text>
      </ScrollView>

      {/* Pinned Bottom Button: Save */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave && onSave({ ...schoolData, addHolidays, remindFeeDueDates })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save education details"
        >
          <Text style={styles.saveButtonText}>Save</Text>
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A9BAE',
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
  card: {
    backgroundColor: '#112239',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldIcon: {
    marginRight: 14,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A9BAE',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 48,
  },
  dividerNoIndent: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  togglesCard: {
    backgroundColor: '#112239',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginTop: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 14.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  footerCaption: {
    fontSize: 13,
    color: '#8A9BAE',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  bottomBar: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default EducationSectionScreen;
