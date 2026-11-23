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
  ActivityIndicator,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import {
  inviteAdultMemberThunk,
  createInvitationThunk,
} from '../../../redux/features/family/familySlice';

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
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.family);

  const [method, setMethod] = useState<InviteMethod>('mobile');
  const [phone, setPhone] = useState('98765 43210');
  const [email, setEmail] = useState('meera@example.com');
  const [name, setName] = useState('Meera');
  const [role, setRole] = useState<InviteRole>('Adult');

  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleSend = async () => {
    const contact = method === 'mobile' ? phone.trim() : email.trim();

    if (!contact) {
      Alert.alert(
        'Required Field',
        method === 'mobile'
          ? 'Please enter a mobile number.'
          : 'Please enter an email address.'
      );
      return;
    }

    if (onSendInvite) {
      onSendInvite({ method, contact, name: name.trim(), role });
      return;
    }

    setIsSubmitting(true);
    const assignedRole = role === 'Admin' ? 'FAMILY_ADMIN' : 'ADULT_MEMBER';
    const payload =
      method === 'mobile'
        ? {
            phoneNumber: contact.startsWith('+') ? contact : `+91${contact}`,
            name: name.trim() || undefined,
            role: assignedRole,
          }
        : {
            email: contact,
            name: name.trim() || undefined,
            role: assignedRole,
          };

    try {
      await dispatch(inviteAdultMemberThunk(payload)).unwrap();
      Alert.alert(
        'Invite Sent',
        `Invitation sent successfully to ${name.trim() || contact}.`
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Failed to send invite', err || 'Could not send invitation.');
    }
  };

  const handleShareLink = async () => {
    if (onShareInviteLink) {
      onShareInviteLink();
      return;
    }

    setIsGeneratingLink(true);
    try {
      const response = await dispatch(createInvitationThunk()).unwrap();
      setIsGeneratingLink(false);

      const link =
        response?.invitation?.url ||
        `https://hosynq.app/invite/${response?.invitation?.token}`;

      Alert.alert(
        'Invite Link Ready',
        `Share this 7-day link with anyone you want to invite:\n\n${link}`,
        [
          {
            text: 'Share',
            onPress: () => {
              Share.share({
                message: `Join our family on HosynQ: ${link}`,
              });
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      setIsGeneratingLink(false);
      Alert.alert('Error', err || 'Could not generate invitation link.');
    }
  };

  const isBusy = isSubmitting || isGeneratingLink || actionLoading;

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

        {/* Form Inputs */}
        {method === 'mobile' ? (
          <>
            <Text style={styles.inputLabel}>Mobile number</Text>
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
                placeholder="98765 43210"
                placeholderTextColor="#4E5D78"
                keyboardType="phone-pad"
                selectionColor="#F0913A"
                cursorColor="#F0913A"
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                accessibilityLabel="Mobile number"
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>Email address</Text>
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
                placeholder="name@example.com"
                placeholderTextColor="#4E5D78"
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor="#F0913A"
                cursorColor="#F0913A"
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                accessibilityLabel="Email address"
              />
            </View>
          </>
        )}

        {/* Name Input */}
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
            placeholderTextColor="#4E5D78"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            accessibilityLabel="Their name (optional)"
          />
        </View>

        {/* Role Selection */}
        <Text style={styles.roleSectionLabel}>ROLE</Text>
        <View style={styles.roleChipsRow}>
          <TouchableOpacity
            style={[
              styles.roleChip,
              role === 'Adult' ? styles.roleChipActive : styles.roleChipInactive,
            ]}
            onPress={() => setRole('Adult')}
            activeOpacity={0.8}
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
              role === 'Admin' ? styles.roleChipActive : styles.roleChipInactive,
            ]}
            onPress={() => setRole('Admin')}
            activeOpacity={0.8}
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

        {/* Role Explanation Text */}
        <Text style={styles.roleExplanationText}>
          Adults use everything. Admins can also manage members and approve requests.
        </Text>

        {/* Share Link Card */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={handleShareLink}
          disabled={isBusy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share an invite link instead"
        >
          <View style={styles.linkIconBox}>
            {isGeneratingLink ? (
              <ActivityIndicator size="small" color="#F0913A" />
            ) : (
              <Ionicons name="link-outline" size={20} color="#F0913A" />
            )}
          </View>
          <View style={styles.linkTextGroup}>
            <Text style={styles.linkTitle}>Share an invite link instead</Text>
            <Text style={styles.linkSubtitle}>
              Anyone with the link can ask to join
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#CAD4DF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Pinned Bottom Buttons */}
      <View
        style={[
          styles.pinnedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={[styles.sendButton, isBusy && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={isBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Send invite"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send invite</Text>
          )}
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
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#11223A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  tabButton: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F0913A',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#0B1A2F',
  },
  tabButtonTextInactive: {
    color: '#CAD4DF',
  },
  inputLabel: {
    fontSize: 13,
    color: '#8A9BAE',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '500',
    padding: 0,
  },
  roleSectionLabel: {
    fontSize: 12,
    color: '#8997AB',
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 6,
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
    fontWeight: '700',
  },
  roleChipTextInactive: {
    color: '#C8D1DC',
    fontWeight: '500',
  },
  roleExplanationText: {
    fontSize: 13,
    color: '#8A9BAE',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkSubtitle: {
    fontSize: 13,
    color: '#8A9BAE',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default InviteAdultModal;