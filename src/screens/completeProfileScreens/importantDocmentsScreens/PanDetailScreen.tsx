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
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface PanDetailScreenProps {
  userName?: string;
  panNumber?: string;
  fullName?: string;
  dob?: string;
  fileName?: string;
  fileDetails?: string;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onViewFile?: () => void;
  onEditPress?: () => void;
}

const PanDetailScreen: React.FC<PanDetailScreenProps> = ({
  userName = 'Priya',
  panNumber = 'ABCDE 1234 F',
  fullName = 'PRIYA SHARMA',
  dob = '8 Aug 1988',
  fileName = 'PAN_Card_Priya.pdf',
  fileDetails = '1 page · Added 12 Oct 2026',
  onBack,
  onOptionsPress,
  onViewFile,
  onEditPress,
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>PAN</Text>
          <Text style={styles.headerSubtitleText}>{userName}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOptionsPress || onEditPress}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Feather name="more-horizontal" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.infoBanner}>
          <Feather
            name="shield"
            size={18}
            color="#3B82F6"
            style={styles.infoIcon}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Tax Identity Document</Text>
            <Text style={styles.infoSubtitle}>
              Linked with Income Tax Department & encrypted in Family Vault.
            </Text>
          </View>
        </View>

        {/* File Card */}
        <View style={styles.fileCard}>
          <View style={styles.fileIconBadge}>
            <Feather name="file-text" size={18} color="#F0913A" />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.fileDetailsText}>{fileDetails}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onViewFile}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel="View document file"
          >
            <Feather name="eye" size={20} color="#F0913A" />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Row 1: PAN number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>PAN number</Text>
              <Text style={styles.detailValue}>{panNumber}</Text>
            </View>
            <Feather name="lock" size={15} color="#64748B" />
          </View>

          <View style={styles.divider} />

          {/* Row 2: Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="user" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Name on card</Text>
              <Text style={styles.detailValue}>{fullName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: DOB */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date of birth</Text>
              <Text style={styles.detailValue}>{dob}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 4: Aadhaar link status */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="check-circle" size={17} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Aadhaar link status</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>
                Linked & Verified
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="Done"
          onPress={onBack}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>
    </View>
  );
};

export default PanDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#60A5FA',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
  infoSubtitle: {
    color: '#CBD5E1',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152033',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  fileIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  fileDetailsText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  eyeButton: {
    padding: 8,
  },
  detailsCard: {
    backgroundColor: '#152033',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailIconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
});

