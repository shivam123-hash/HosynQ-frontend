import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface MyProfileScreenProps {
  onBack?: () => void;
  onEdit?: () => void;
  onOpenLifeProfile?: () => void;
  onEditField?: (field: string) => void;
  userName?: string;
  role?: string;
  familyName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  relationship?: string;
}

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({
  onBack,
  onEdit,
  onOpenLifeProfile,
  onEditField,
  userName = 'Priya Sharma',
  role = 'Owner',
  familyName = 'The Sharma Family',
  phoneNumber = '+91 98••• ••123 · Verified',
  email = 'priya.sharma@example.com',
  dateOfBirth = '8 Aug 1988',
  relationship = 'Mother',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>My profile</Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onEdit}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{userName.charAt(0)}</Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={onEdit}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change photo"
            >
              <Feather name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileSubtitle}>
            {role} · {familyName}
          </Text>
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <ProfileRow
            icon="user"
            label="Name"
            value={userName}
            onPress={() => onEditField?.('name')}
          />
          <View style={styles.divider} />

          <ProfileRow
            icon="phone"
            label="Mobile number"
            value={phoneNumber}
            onPress={() => onEditField?.('phone')}
          />
          <View style={styles.divider} />

          <ProfileRow
            icon="mail"
            label="Email"
            value={email}
            onPress={() => onEditField?.('email')}
          />
          <View style={styles.divider} />

          <ProfileRow
            icon="gift"
            label="Date of birth"
            value={dateOfBirth}
            onPress={() => onEditField?.('dob')}
          />
          <View style={styles.divider} />

          <ProfileRow
            icon="users"
            label="In the family"
            value={relationship}
            onPress={() => onEditField?.('relationship')}
          />
        </View>

        {/* My Life Profile Entry Card */}
        <TouchableOpacity
          style={styles.lifeProfileCard}
          onPress={onOpenLifeProfile}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open My Life Profile"
        >
          <View style={styles.lifeProfileIconBox}>
            <Feather name="credit-card" size={20} color="#5B9BF1" />
          </View>
          <View style={styles.lifeProfileInfo}>
            <Text style={styles.lifeProfileTitle}>My Life Profile</Text>
            <Text style={styles.lifeProfileSubtitle}>
              Health, documents and more · 70% complete
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#5D6C83" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

interface ProfileRowProps {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}

const ProfileRow: React.FC<ProfileRowProps> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${value}`}
  >
    <View style={styles.rowIconBox}>
      <Feather name={icon as any} size={20} color="#8A97AB" />
    </View>
    <View style={styles.rowInfo}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
    <Feather name="chevron-right" size={18} color="#5D6C83" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#5C3A21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0923A',
    borderWidth: 2,
    borderColor: '#0B1A2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 54,
  },
  lifeProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  lifeProfileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#5B9BF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifeProfileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  lifeProfileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  lifeProfileSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
});
