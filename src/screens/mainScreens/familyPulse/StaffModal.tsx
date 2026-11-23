import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { AddStaffModal } from './AddStaffModal';

export interface StaffModalProps {
  visible?: boolean;
  isScreen?: boolean;
  initialStaff?: StaffMember[];
  onClose: () => void;
  onAddStaff?: () => void;
}

export interface StaffMember {
  id: string;
  name: string;
  subtext: string;
  badge: string;
  badgeBorder: string;
  badgeColor: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  permissions: {
    pickups: boolean;
    calendar: boolean;
    location: boolean;
    chat: boolean;
  };
}

const DEFAULT_STAFF: StaffMember[] = [];

export const StaffModal: React.FC<StaffModalProps> = ({
  visible = true,
  isScreen = false,
  initialStaff = DEFAULT_STAFF,
  onClose,
  onAddStaff,
}) => {
  const insets = useSafeAreaInsets();
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    initialStaff.length > 0 ? initialStaff[0].id : null
  );
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);

  const selectedStaff =
    staffList.find((s) => s.id === selectedStaffId) || staffList[0] || null;

  const handleTogglePermission = (
    key: keyof StaffMember['permissions'],
    value: boolean
  ) => {
    if (!selectedStaff) return;
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaff.id
          ? {
              ...s,
              permissions: {
                ...s.permissions,
                [key]: value,
              },
            }
          : s
      )
    );
  };

  const handleAddStaffPress = () => {
    if (onAddStaff) {
      onAddStaff();
    } else {
      setShowAddStaffModal(true);
    }
  };

  const handleAddNewStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
    setSelectedStaffId(newStaff.id);
    setShowAddStaffModal(false);
  };

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44
  );

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Staff</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Proposed Banner */}
        <View style={styles.noticeBanner}>
          <Feather name="flag" size={15} color="#F0923A" />
          <Text style={styles.noticeBannerText}>
            Proposed · Reserved for later, not in V1.
          </Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Give drivers and house help only what they need to see.
        </Text>

        {/* Staff Members List Card or Empty State */}
        {staffList.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="users" size={24} color="#8EB7F5" />
            </View>
            <Text style={styles.emptyTitle}>No staff added yet</Text>
            <Text style={styles.emptySubtitle}>
              Drivers, house help, and nannies will appear here once added.
            </Text>
          </View>
        ) : (
          <View style={styles.staffCard}>
            {staffList.map((member, index) => {
              const isLast = index === staffList.length - 1;
              const isSelected = selectedStaff?.id === member.id;

              return (
                <React.Fragment key={member.id || `staff-${index}`}>
                  <TouchableOpacity
                    style={[
                      styles.staffRow,
                      isSelected && styles.staffRowSelected,
                    ]}
                    onPress={() => setSelectedStaffId(member.id)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`${member.name}, ${member.badge}`}
                  >
                    {/* Avatar */}
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: member.avatarBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          { color: member.avatarColor },
                        ]}
                      >
                        {member.initial}
                      </Text>
                    </View>

                    {/* Staff Info */}
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{member.name}</Text>
                      <Text style={styles.staffSubtext}>{member.subtext}</Text>
                    </View>

                    {/* Badge */}
                    <View
                      style={[
                        styles.staffBadge,
                        { borderColor: member.badgeBorder },
                      ]}
                    >
                      <Text
                        style={[
                          styles.staffBadgeText,
                          { color: member.badgeColor },
                        ]}
                      >
                        {member.badge}
                      </Text>
                    </View>

                    {/* Chevron Right */}
                    <Feather
                      name="chevron-right"
                      size={18}
                      color="#6E8096"
                      style={styles.chevron}
                    />
                  </TouchableOpacity>

                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
        )}

        {/* Section Label & Permissions Toggles Card (Only shown when staff exists) */}
        {selectedStaff && (
          <>
            <Text style={styles.sectionLabel}>
              {`WHAT ${selectedStaff.name.toUpperCase()} CAN SEE`}
            </Text>

            <View style={styles.permissionsCard}>
              {/* Permission 1: Pickups and drop-offs */}
              <View style={styles.permissionRow}>
                <Text style={styles.permissionLabel}>Pickups and drop-offs</Text>
                <Switch
                  value={selectedStaff.permissions.pickups}
                  onValueChange={(val) => handleTogglePermission('pickups', val)}
                  trackColor={{ false: '#1F3352', true: '#F0923A' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Pickups and drop-offs permission"
                />
              </View>
              <View style={styles.divider} />

              {/* Permission 2: Family calendar */}
              <View style={styles.permissionRow}>
                <Text style={styles.permissionLabel}>Family calendar</Text>
                <Switch
                  value={selectedStaff.permissions.calendar}
                  onValueChange={(val) => handleTogglePermission('calendar', val)}
                  trackColor={{ false: '#1F3352', true: '#F0923A' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Family calendar permission"
                />
              </View>
              <View style={styles.divider} />

              {/* Permission 3: Live location */}
              <View style={styles.permissionRow}>
                <Text style={styles.permissionLabel}>Live location</Text>
                <Switch
                  value={selectedStaff.permissions.location}
                  onValueChange={(val) => handleTogglePermission('location', val)}
                  trackColor={{ false: '#1F3352', true: '#F0923A' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Live location permission"
                />
              </View>
              <View style={styles.divider} />

              {/* Permission 4: Family chat */}
              <View style={styles.permissionRow}>
                <Text style={styles.permissionLabel}>Family chat</Text>
                <Switch
                  value={selectedStaff.permissions.chat}
                  onValueChange={(val) => handleTogglePermission('chat', val)}
                  trackColor={{ false: '#1F3352', true: '#F0923A' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Family chat permission"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Pinned Bottom Button: + Add staff */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 6 },
        ]}
      >
        <TouchableOpacity
          style={styles.addStaffButton}
          onPress={handleAddStaffPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="+ Add staff"
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.addStaffButtonText}>Add staff</Text>
        </TouchableOpacity>
      </View>

      {/* Add Staff Modal */}
      <AddStaffModal
        visible={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onAddStaff={handleAddNewStaff}
      />
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(240, 146, 58, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 146, 58, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  noticeBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F0923A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    marginBottom: 18,
  },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3249',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(142, 183, 245, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A9BAE',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  staffCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  staffRowSelected: {
    backgroundColor: 'rgba(31, 51, 82, 0.35)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  staffSubtext: {
    fontSize: 12.5,
    color: '#8A9BAE',
    marginTop: 2,
  },
  staffBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 8,
  },
  staffBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BAE',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  permissionsCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    width: '100%',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addStaffButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#2A3F60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addStaffButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StaffModal;
