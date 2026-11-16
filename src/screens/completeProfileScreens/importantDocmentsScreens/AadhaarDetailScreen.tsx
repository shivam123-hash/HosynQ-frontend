import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface AadhaarDetailScreenProps {
  userName?: string;
  aadhaarNumber?: string;
  fullName?: string;
  isMasked?: boolean;
  fileName?: string;
  fileDetails?: string;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onViewFile?: () => void;
  onEditPress?: () => void;
  onSave?: (data: any) => void;
}

const AadhaarDetailScreen: React.FC<AadhaarDetailScreenProps> = ({
  userName = 'Priya',
  aadhaarNumber = '•••• •••• 2290',
  fullName = 'Priya Sharma',
  isMasked = true,
  fileName = 'Aadhaar_Priya.pdf',
  fileDetails = '2 pages (Front & Back) · Added 12 Oct 2026',
  onBack,
  onOptionsPress,
  onViewFile,
  onEditPress,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [maskState, setMaskState] = useState(isMasked);

  const handleSave = () => {
    onSave?.({ maskState });
  };

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
          <Text style={styles.headerTitleText}>Aadhaar</Text>
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
        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Feather
            name="shield"
            size={18}
            color="#10B981"
            style={styles.securityIcon}
          />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Saved in Family Vault</Text>
            <Text style={styles.securitySubtitle}>
              Protected with end-to-end 256-bit AES encryption.
            </Text>
          </View>
        </View>

        {/* File Card */}
        <View style={styles.fileCard}>
          <View style={styles.fileIconBadge}>
            <Feather name="credit-card" size={18} color="#F0913A" />
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
          {/* Row 1: Aadhaar number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Aadhaar number</Text>
              <Text style={styles.detailValue}>{aadhaarNumber}</Text>
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
              <Text style={styles.detailLabel}>Name on Aadhaar</Text>
              <Text style={styles.detailValue}>{fullName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Verification */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="check-circle" size={17} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Document status</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>
                Verified Government ID
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 4: Photos */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="image" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Photos</Text>
              <Text style={styles.detailValue}>Front & Back attached</Text>
            </View>
          </View>
        </View>

        {/* Privacy Card */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeaderRow}>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Masked Aadhaar</Text>
              <Text style={styles.privacySubtitle}>
                Keep only last 4 digits visible for maximum identity protection.
              </Text>
            </View>
            <Switch
              value={maskState}
              onValueChange={setMaskState}
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="Done"
          onPress={handleSave || onBack}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>
    </View>
  );
};

export default AadhaarDetailScreen;

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
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  securityIcon: {
    marginRight: 10,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: '#10B981',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
  securitySubtitle: {
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
  privacyCard: {
    backgroundColor: '#152033',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  privacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  privacyTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  privacySubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
});

