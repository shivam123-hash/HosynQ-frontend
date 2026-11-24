import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export type InviteRole = 'Adult' | 'Admin';
export type InviteMethod = 'mobile' | 'email';

export interface InviteAdultModalProps {
  visible: boolean;
  onClose: () => void;
  onSendInvite?: (data: {
    method: InviteMethod;
    contact: string;
    name?: string;
    role: InviteRole;
  }) => void;
  onShareInviteLink?: () => void;
  isScreen?: boolean;
}

export const InviteAdultModal: React.FC<InviteAdultModalProps> = ({
  visible,
  onClose,
  onSendInvite,
  onShareInviteLink,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<InviteMethod>('mobile');
  const [phone, setPhone] = useState('98765 43210');
  const [email, setEmail] = useState('meera@example.com');
  const [name, setName] = useState('Meera');
  const [role, setRole] = useState<InviteRole>('Adult');

  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const handleSend = () => {
    const contact = method === 'mobile' ? phone : email;
    if (onSendInvite) {
      onSendInvite({ method, contact, name, role });
    } else {
      Alert.alert(
        'Invite Sent',
        `Invitation sent to ${name || contact} as ${role}.`
      );
      onClose();
    }
  };

  const handleShareLink = () => {
    if (onShareInviteLink) {
      onShareInviteLink();
    } else {
      Alert.alert(
        'Invite Link',
        'Invite link copied: https://hosynq.app/join/HSQ-4821'
      );
    }
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButtonLeft}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Invite an adult</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Method Tabs: Mobile number / Email */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              method === 'mobile' && styles.tabButtonActive,
            ]}
            onPress={() => setMethod('mobile')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Mobile number"
          >
            <Feather
              name="phone"
              size={16}
              color={method === 'mobile' ? '#0B1A2F' : '#C8D1DC'}
            />
            <Text
              style={[
                styles.tabButtonText,
                method === 'mobile'
                  ? styles.tabButtonTextActive
                  : styles.tabButtonTextInactive,
              ]}
            >
              Mobile number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              method === 'email' && styles.tabButtonActive,
            ]}
            onPress={() => setMethod('email')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Email"
          >
            <Feather
              name="mail"
              size={16}
              color={method === 'email' ? '#0B1A2F' : '#C8D1DC'}
            />
            <Text
              style={[
                styles.tabButtonText,
                method === 'email'
                  ? styles.tabButtonTextActive
                  : styles.tabButtonTextInactive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input 1: Mobile number / Email */}
        <Text style={styles.inputLabel}>
          {method === 'mobile' ? 'Mobile number' : 'Email address'}
        </Text>

        {method === 'mobile' ? (
          <View
            style={[
              styles.inputWrapper,
              isPhoneFocused && styles.inputWrapperFocused,
            ]}
          >
            <Text style={styles.countryCodeText}>+91</Text>
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#6E8096"
              keyboardType="phone-pad"
              selectionColor="#F0913A"
              cursorColor="#F0913A"
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              accessibilityLabel="Mobile number"
            />
          </View>
        ) : (
          <View
            style={[
              styles.inputWrapper,
              isPhoneFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor="#6E8096"
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#F0913A"
              cursorColor="#F0913A"
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              accessibilityLabel="Email address"
            />
          </View>
        )}

        {/* Input 2: Their name (optional) */}
        <Text style={styles.inputLabel}>Their name (optional)</Text>
        <View
          style={[
            styles.inputWrapper,
            isNameFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Meera"
            placeholderTextColor="#6E8096"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            accessibilityLabel="Their name (optional)"
          />
        </View>

        {/* ROLE section */}
        <Text style={styles.roleSectionLabel}>ROLE</Text>
        <View style={styles.roleChipsRow}>
          <TouchableOpacity
            style={[
              styles.roleChip,
              role === 'Adult'
                ? styles.roleChipActive
                : styles.roleChipInactive,
            ]}
            onPress={() => setRole('Adult')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Role Adult"
          >
            <Text
              style={[
                styles.roleChipText,
                role === 'Adult'
                  ? styles.roleChipTextActive
                  : styles.roleChipTextInactive,
              ]}
            >
              Adult
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleChip,
              role === 'Admin'
                ? styles.roleChipActive
                : styles.roleChipInactive,
            ]}
            onPress={() => setRole('Admin')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Role Admin"
          >
            <Text
              style={[
                styles.roleChipText,
                role === 'Admin'
                  ? styles.roleChipTextActive
                  : styles.roleChipTextInactive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.roleExplanationText}>
          Adults use everything. Admins can also manage members and approve
          requests.
        </Text>

        {/* Share invite link card */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={handleShareLink}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share an invite link instead"
        >
          <View style={styles.linkIconBox}>
            <Feather name="link-2" size={20} color="#F0913A" />
          </View>

          <View style={styles.linkTextGroup}>
            <Text style={styles.linkTitle}>
              Share an invite link instead
            </Text>
            <Text style={styles.linkSubtitle}>
              Anyone with the link can ask to join
            </Text>
          </View>

          <Feather name="chevron-right" size={18} color="#5A6880" />
        </TouchableOpacity>
      </ScrollView>

      {/* Pinned Bottom Button */}
      <View
        style={[
          styles.pinnedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Send invite"
        >
          <Text style={styles.sendButtonText}>Send invite</Text>
        </TouchableOpacity>
      </View>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1A2F',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4556',
    padding: 4,
    height: 52,
    marginTop: 6,
  },
  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#F0923A',
  },
  tabButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  tabButtonTextInactive: {
    color: '#C8D1DC',
    fontFamily: 'Roboto-Medium',
  },
  inputLabel: {
    fontSize: 14,
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
    marginTop: 20,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#11223A',
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#284060',
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Roboto-Medium',
    padding: 0,
  },
  roleSectionLabel: {
    fontSize: 12,
    color: '#8997AB',
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },
  roleChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleChip: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  roleChipActive: {
    backgroundColor: '#F0913A',
  },
  roleChipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  roleChipText: {
    fontSize: 14,
  },
  roleChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  roleChipTextInactive: {
    color: '#C8D1DC',
    fontFamily: 'Roboto-Medium',
  },
  roleExplanationText: {
    fontSize: 13,
    color: '#8997AB',
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 20,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  linkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextGroup: {
    flex: 1,
    marginLeft: 14,
  },
  linkTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  linkSubtitle: {
    fontSize: 13,
    color: '#8997AB',
    marginTop: 3,
  },
  pinnedBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#17273F',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sendButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});

export default InviteAdultModal;
