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
import { UploadCertificateModal } from './UploadCertificateModal';

const SyringeIcon: React.FC<{ size?: number; color: string; style?: any }> = ({
  size = 18,
  color,
  style,
}) => {
  const scale = size / 18;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: 18,
          height: 18,
          transform: [{ scale }, { rotate: '-45deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Needle tip */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: 1.5,
            height: 5,
            backgroundColor: color,
            borderRadius: 0.5,
          }}
        />
        {/* Barrel Nozzle */}
        <View
          style={{
            position: 'absolute',
            bottom: 4.5,
            width: 3.5,
            height: 1.5,
            backgroundColor: color,
          }}
        />
        {/* Barrel Body */}
        <View
          style={{
            position: 'absolute',
            bottom: 6,
            width: 7,
            height: 8.5,
            borderWidth: 1.2,
            borderColor: color,
            borderRadius: 1,
            backgroundColor: 'transparent',
            justifyContent: 'space-evenly',
            paddingHorizontal: 0.5,
          }}
        >
          <View style={{ width: 2.5, height: 1, backgroundColor: color }} />
        </View>
        {/* Flanges */}
        <View
          style={{
            position: 'absolute',
            top: 2.5,
            width: 10,
            height: 1.2,
            backgroundColor: color,
            borderRadius: 0.5,
          }}
        />
        {/* Plunger Stem */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 1.5,
            height: 3,
            backgroundColor: color,
          }}
        />
        {/* Plunger Top Cap */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 5,
            height: 1.2,
            backgroundColor: color,
            borderRadius: 0.5,
          }}
        />
      </View>
    </View>
  );
};

const RulerIcon: React.FC<{ size?: number; color: string; style?: any }> = ({
  size = 18,
  color,
  style,
}) => {
  const scale = size / 18;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: 18,
          height: 18,
          transform: [{ scale }, { rotate: '-45deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 8,
            height: 16,
            borderWidth: 1.2,
            borderColor: color,
            borderRadius: 1,
            justifyContent: 'space-between',
            paddingVertical: 2,
            paddingLeft: 0.5,
          }}
        >
          <View style={{ width: 3.5, height: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 1, backgroundColor: color }} />
          <View style={{ width: 3.5, height: 1, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );
};

export interface VaccinationSectionScreenProps {
  memberName?: string;
  onBack?: () => void;
  onAddVaccineRecord?: () => void;
  onNavigateGrowth?: () => void;
}

export const VaccinationSectionScreen: React.FC<VaccinationSectionScreenProps> = ({
  memberName = 'Aarav',
  onBack,
  onAddVaccineRecord,
  onNavigateGrowth,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'vaccines' | 'growth'>('vaccines');
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState({
    name: 'Typhoid booster',
    date: '12 Sep 2026',
  });

  const handleOpenCertificate = (name: string, date: string) => {
    setSelectedVaccine({ name, date });
    setCertificateModalVisible(true);
  };

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
          <Text style={styles.headerTitle}>Vaccination</Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section E`}</Text>
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
        {/* Segmented Capsule: Vaccines vs Growth */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'vaccines' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('vaccines')}
            activeOpacity={0.8}
          >
            <SyringeIcon
              size={16}
              color={activeTab === 'vaccines' ? '#0B1A2F' : '#C8D1DC'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'vaccines' && styles.segmentTextActive,
              ]}
            >
              Vaccines
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'growth' && styles.segmentTabActive,
            ]}
            onPress={() => {
              setActiveTab('growth');
              if (onNavigateGrowth) onNavigateGrowth();
            }}
            activeOpacity={0.8}
          >
            <RulerIcon
              size={16}
              color={activeTab === 'growth' ? '#0B1A2F' : '#C8D1DC'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'growth' && styles.segmentTextActive,
              ]}
            >
              Growth
            </Text>
          </TouchableOpacity>
        </View>

        {/* Urgent Reminder Card: Flu shot due 15 Nov */}
        <View style={styles.urgentCard}>
          <SyringeIcon size={18} color="#F6C08E" style={styles.urgentIcon} />
          <View style={styles.urgentInfo}>
            <Text style={styles.urgentTitle}>Flu shot due 15 Nov</Text>
            <Text style={styles.urgentSubtitle}>Yearly. Book with Dr. Mehta.</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.remindButtonText}>Remind me</Text>
          </TouchableOpacity>
        </View>

        {/* Vaccines List Card */}
        <View style={styles.card}>
          {/* 1. Typhoid booster */}
          <TouchableOpacity
            style={styles.vaccineRow}
            onPress={() => handleOpenCertificate('Typhoid booster', '12 Sep 2026')}
            activeOpacity={0.7}
          >
            <View style={[styles.vaccineIconBox, { borderColor: '#4CC38A', backgroundColor: 'transparent' }]}>
              <SyringeIcon size={18} color="#4CC38A" />
            </View>
            <View style={styles.vaccineInfo}>
              <View style={styles.vaccineTitleRow}>
                <Text style={styles.vaccineTitle} numberOfLines={1}>Typhoid booster</Text>
                <View style={styles.badgeDone}>
                  <Text style={styles.badgeDoneText}>Done</Text>
                </View>
              </View>
              <Text style={styles.vaccineSubtitle}>
                Given 12 Sep 2026 · Certificate added
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 2. Flu (yearly) */}
          <TouchableOpacity
            style={styles.vaccineRow}
            onPress={() => handleOpenCertificate('Flu (yearly)', '15 Nov 2026')}
            activeOpacity={0.7}
          >
            <View style={[styles.vaccineIconBox, { borderColor: '#F6C08E', backgroundColor: 'transparent' }]}>
              <SyringeIcon size={18} color="#F6C08E" />
            </View>
            <View style={styles.vaccineInfo}>
              <View style={styles.vaccineTitleRow}>
                <Text style={styles.vaccineTitle} numberOfLines={1}>Flu (yearly)</Text>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>Due</Text>
                </View>
              </View>
              <Text style={styles.vaccineSubtitle}>Due 15 Nov 2026</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 3. Tdap booster */}
          <TouchableOpacity
            style={styles.vaccineRow}
            onPress={() => handleOpenCertificate('Tdap booster', 'Jun 2027')}
            activeOpacity={0.7}
          >
            <View style={[styles.vaccineIconBox, { borderColor: '#3A4556', backgroundColor: 'transparent' }]}>
              <SyringeIcon size={18} color="#5A6880" />
            </View>
            <View style={styles.vaccineInfo}>
              <View style={styles.vaccineTitleRow}>
                <Text style={styles.vaccineTitle} numberOfLines={1}>Tdap booster</Text>
                <View style={styles.badgeSlate}>
                  <Text style={styles.badgeSlateText}>Upcoming</Text>
                </View>
              </View>
              <Text style={styles.vaccineSubtitle}>Due at 10 years · Jun 2027</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 4. MMR */}
          <TouchableOpacity
            style={styles.vaccineRow}
            onPress={() => handleOpenCertificate('MMR', '2019')}
            activeOpacity={0.7}
          >
            <View style={[styles.vaccineIconBox, { borderColor: '#4CC38A', backgroundColor: 'transparent' }]}>
              <SyringeIcon size={18} color="#4CC38A" />
            </View>
            <View style={styles.vaccineInfo}>
              <View style={styles.vaccineTitleRow}>
                <Text style={styles.vaccineTitle} numberOfLines={1}>MMR</Text>
                <View style={styles.badgeDone}>
                  <Text style={styles.badgeDoneText}>Done</Text>
                </View>
              </View>
              <Text style={styles.vaccineSubtitle}>Done · 2019</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerCaption}>
          Based on a standard schedule. Your doctor’s advice comes first. For grandparents, this section tracks medicines instead.
        </Text>
      </ScrollView>

      {/* Pinned Bottom Button: + Add vaccine record */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedVaccine({
              name: 'Typhoid booster',
              date: '12 Sep 2026',
            });
            setCertificateModalVisible(true);
            if (onAddVaccineRecord) {
              onAddVaccineRecord();
            }
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add vaccine record"
        >
          <Text style={styles.addButtonText}>+ Add vaccine record</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Certificate Bottom Sheet Modal */}
      <UploadCertificateModal
        visible={certificateModalVisible}
        vaccineName={selectedVaccine.name}
        vaccineDate={selectedVaccine.date}
        onClose={() => setCertificateModalVisible(false)}
        onSaveCertificate={() => setCertificateModalVisible(false)}
      />
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4556',
    padding: 5,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  segmentTabActive: {
    backgroundColor: '#F0923A',
  },
  segmentText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#C8D1DC',
  },
  segmentTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2236',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#5A4128',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  urgentIcon: {
    marginRight: 14,
  },
  urgentInfo: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F6C08E',
    marginBottom: 2,
  },
  urgentSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  remindButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#F6C08E',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  vaccineIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vaccineInfo: {
    flex: 1,
    marginRight: 12,
  },
  vaccineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  vaccineTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  vaccineSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  badgeDone: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CC38A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDoneText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4CC38A',
    textAlign: 'center',
  },
  badgeOrange: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F6C08E',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOrangeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F6C08E',
    textAlign: 'center',
  },
  badgeSlate: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSlateText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C8D1DC',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  footerCaption: {
    fontSize: 13,
    color: '#8A97AB',
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

export default VaccinationSectionScreen;
