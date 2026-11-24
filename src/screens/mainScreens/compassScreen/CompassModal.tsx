import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  CompassScreenMode,
  CompassMember,
  FamilyPlace,
  LocationReminder,
  PlaceType,
  SmartShortcut,
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_PLACES,
  INITIAL_REMINDERS,
  INITIAL_SHORTCUTS,
} from './mockData';
import { MapCanvas } from './components/MapCanvas';

export interface CompassModalProps {
  visible: boolean;
  onClose: () => void;
  initialScreen?: CompassScreenMode;
  onStartHeadingHome?: () => void;
}

export const CompassModal: React.FC<CompassModalProps> = ({
  visible,
  onClose,
  initialScreen = 'compass',
  onStartHeadingHome,
}) => {
  const insets = useSafeAreaInsets();
  const [screenMode, setScreenMode] = useState<CompassScreenMode>(initialScreen);
  const [history, setHistory] = useState<CompassScreenMode[]>([]);

  // State
  const [members, setMembers] = useState<CompassMember[]>(INITIAL_MEMBERS);
  const [places, setPlaces] = useState<FamilyPlace[]>(INITIAL_PLACES);
  const [reminders, setReminders] = useState<LocationReminder[]>(INITIAL_REMINDERS);
  const [shortcuts, setShortcuts] = useState<SmartShortcut[]>(INITIAL_SHORTCUTS);
  const [selectedMember, setSelectedMember] = useState<CompassMember>(INITIAL_MEMBERS[1]); // Rohan default for sheet

  // Heading Home State (CMP-08 & CMP-09)
  const [shareEtaToggle, setShareEtaToggle] = useState(true);
  const [etaAudience, setEtaAudience] = useState<'everyone' | 'custom'>('everyone');

  // New Place State (CMP-07)
  const [newPlaceName, setNewPlaceName] = useState('Badminton academy');
  const [newPlaceAddress, setNewPlaceAddress] = useState('Lodhi Sports Complex, Lodhi Road, New Delhi');
  const [newPlaceType, setNewPlaceType] = useState<PlaceType>('activity');
  const [newPlaceRadius, setNewPlaceRadius] = useState<100 | 200 | 500>(200);
  const [isPlaceNameFocused, setIsPlaceNameFocused] = useState(false);
  const [isPlaceAddressFocused, setIsPlaceAddressFocused] = useState(false);

  // New Reminder State (CMP-12)
  const [reminderTitle, setReminderTitle] = useState('Pick up atta and dal');
  const [reminderCondition, setReminderCondition] = useState<'arrive' | 'leave'>('arrive');
  const [reminderTab, setReminderTab] = useState<'active' | 'done'>('active');
  const [isReminderTitleFocused, setIsReminderTitleFocused] = useState(false);

  // Suggested Now dismissed state (CMP-13)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  useEffect(() => {
    if (visible) {
      setScreenMode(initialScreen);
      setHistory([]);
    }
  }, [visible, initialScreen]);

  const navigateTo = (next: CompassScreenMode) => {
    setHistory((prev) => [...prev, screenMode]);
    setScreenMode(next);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, h.length - 1));
      setScreenMode(prev);
    } else {
      onClose();
    }
  };

  // Switch handlers
  const handleToggleMemberSharing = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSharing: !m.isSharing } : m))
    );
  };

  const handleToggleShortcut = (id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const getHereText = (place: FamilyPlace) => {
    if (!place.hereMembers || place.hereMembers.length === 0) return null;
    if (place.id === 'home') return 'You, Dadi and Anaya are here';
    return `${place.hereMembers.join(', ')} is here`;
  };

  // Helper for place icons
  const renderPlaceIcon = (type: PlaceType) => {
    switch (type) {
      case 'home':
        return <Feather name="home" size={18} color="#F0913A" />;
      case 'school':
        return <Ionicons name="school-outline" size={20} color="#3A8EF0" />;
      case 'work':
        return <Feather name="briefcase" size={18} color="#F06A6A" />;
      case 'activity':
        return <Feather name="disc" size={18} color="#4CC38A" />;
      case 'store':
        return <Ionicons name="storefront-outline" size={20} color="#3CC4C4" />;
      default:
        return <Feather name="map-pin" size={18} color="#CAD4DF" />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={goBack}
    >
      <View
        style={[
          styles.rootContainer,
          {
            paddingTop: insets.top,
            paddingBottom:
              screenMode === 'compass' ||
              screenMode === 'askMemberSharing' ||
              screenMode === 'memberLocation' ||
              screenMode === 'familyPlaces' ||
              screenMode === 'addEditPlace' ||
              screenMode === 'locationConsent' ||
              screenMode === 'locationReminders' ||
              screenMode === 'createReminder'
                ? 0
                : insets.bottom,
          },
        ]}
      >
        <StatusBar barStyle="light-content" />

        {/* ----------------------------------------------------------------- */}
        {/* CMP-01: COMPASS MAIN VIEW & CMP-10 OVERLAY */}
        {/* ----------------------------------------------------------------- */}
        {(screenMode === 'compass' || screenMode === 'askMemberSharing') && (
          <View style={styles.flexOne}>
            {/* Top Navigation Bar */}
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close compass"
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Compass</Text>
              <TouchableOpacity
                style={styles.headerIconButtonRight}
                onPress={() => navigateTo('smartActions')}
                accessibilityRole="button"
                accessibilityLabel="Smart actions"
                activeOpacity={0.7}
              >
                <Feather name="sun" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Map Canvas */}
            <View style={styles.mapCanvasWrapper}>
              <MapCanvas
                mode="overview"
                members={members}
                places={places}
                onSelectMember={(m) => {
                  setSelectedMember(m);
                  navigateTo('memberLocation');
                }}
                onSelectPlace={(_p) => navigateTo('familyPlaces')}
              />
            </View>

            {/* Bottom Sheet */}
            <View style={[styles.bottomSheetCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.dragHandleBar} />

              {/* Quick Action Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickPillsRow}
              >
                <TouchableOpacity
                  style={[styles.quickPill, styles.quickPillPrimary]}
                  activeOpacity={0.85}
                  onPress={() => navigateTo('headingHome')}
                  accessibilityRole="button"
                  accessibilityLabel="I'm heading home"
                >
                  <Feather name="navigation" size={16} color="#0E1E34" style={styles.quickPillIcon} />
                  <Text style={styles.quickPillPrimaryText}>I’m heading home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickPill}
                  activeOpacity={0.85}
                  onPress={() => navigateTo('familyPlaces')}
                  accessibilityRole="button"
                  accessibilityLabel="Places"
                >
                  <Feather name="map-pin" size={16} color="#F0913A" style={styles.quickPillIcon} />
                  <Text style={styles.quickPillText}>Places</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickPill}
                  activeOpacity={0.85}
                  onPress={() => navigateTo('locationReminders')}
                  accessibilityRole="button"
                  accessibilityLabel="Reminders"
                >
                  <Feather name="bell" size={16} color="#F0913A" style={styles.quickPillIcon} />
                  <Text style={styles.quickPillText}>Reminders</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Section Header */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Where everyone is</Text>
                <TouchableOpacity
                  onPress={() => navigateTo('locationConsent')}
                  accessibilityRole="button"
                  accessibilityLabel="4 of 5 sharing, tap to manage location sharing"
                >
                  <Text style={styles.sectionActionText}>4 of 5 sharing</Text>
                </TouchableOpacity>
              </View>

              {/* Member Location Rows */}
              <ScrollView style={styles.memberListScroll} showsVerticalScrollIndicator={false}>
                {members.map((member, index) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberItemRow,
                      index === members.length - 1 && styles.memberItemRowLast,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (!member.isSharing) {
                        navigateTo('askMemberSharing');
                      } else {
                        setSelectedMember(member);
                        navigateTo('memberLocation');
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${member.locationName}, ${member.subLocation}`}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: member.bgColor }]}>
                      <Text style={[styles.memberAvatarInitial, { color: member.textColor || '#FFFFFF' }]}>
                        {member.initial}
                      </Text>
                    </View>
                    <View style={styles.memberTextGroup}>
                      <Text style={styles.memberLocationName}>{member.locationName}</Text>
                      <Text style={styles.memberSubLocation}>{member.subLocation}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#50637F" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* CMP-10: ASK MEMBER TO TURN ON SHARING DIALOG OVERLAY */}
            {screenMode === 'askMemberSharing' && (
              <View style={styles.dialogScreenBackdrop}>
                <View style={styles.dialogCard}>
                  <View style={styles.dialogIconCircle}>
                    <Feather name="wifi" size={24} color="#F0913A" />
                  </View>

                  <Text style={styles.dialogTitle}>Ask Dadi to turn on sharing?</Text>
                  <Text style={styles.dialogSubtitle}>
                    Dadi’s location has been off since this morning. We’ll send her a gentle request. She can say no.
                  </Text>

                  {/* Quote Box */}
                  <View style={styles.quotePreviewBox}>
                    <View style={[styles.memberAvatar, { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4A2E1A', marginRight: 12 }]}>
                      <Text style={[styles.memberAvatarInitial, { color: '#F6C08E', fontSize: 14 }]}>P</Text>
                    </View>
                    <Text style={styles.quotePreviewText}>
                      “Priya asked you to share your location with the family.”
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryActionButton, { width: '100%', marginBottom: 12 }]}
                    activeOpacity={0.85}
                    onPress={() => {
                      Alert.alert('Request Sent', 'A gentle reminder was sent to Dadi.');
                      goBack();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Send request"
                  >
                    <Text style={styles.primaryActionText}>Send request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryTextButton}
                    activeOpacity={0.7}
                    onPress={goBack}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel request"
                  >
                    <Text style={styles.secondaryActionText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-02: LOCATION PERMISSION PROMPT */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'locationPermission' && (
          <ScrollView contentContainerStyle={styles.screenScrollContent}>
            {/* Concentric Circle Pin */}
            <View style={styles.permissionHeroCircleWrapper}>
              <View style={styles.permissionOuterCircle}>
                <View style={styles.permissionInnerCircle}>
                  <Feather name="map-pin" size={32} color="#F0913A" />
                </View>
              </View>
            </View>

            <Text style={styles.permissionTitle}>Share where you are with family</Text>
            <Text style={styles.permissionSubtitle}>
              Your family sees where you are, so they know you’re safe and can plan pickups.
            </Text>

            {/* Feature Cards Box */}
            <View style={styles.cardContainer}>
              <View style={styles.permissionFeatureRow}>
                <View style={[styles.featureIconBox, { borderColor: '#F0913A' }]}>
                  <Feather name="home" size={20} color="#F0913A" />
                </View>
                <View style={styles.featureTextGroup}>
                  <Text style={styles.featureHeading}>Know when everyone gets home</Text>
                  <Text style={styles.featureSubheading}>And who’s still on the way</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.permissionFeatureRow}>
                <View style={[styles.featureIconBox, { borderColor: '#A855F7' }]}>
                  <Feather name="bell" size={20} color="#A855F7" />
                </View>
                <View style={styles.featureTextGroup}>
                  <Text style={styles.featureHeading}>Reminders when you arrive or leave</Text>
                  <Text style={styles.featureSubheading}>Needs “Always allow” location</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.permissionFeatureRow}>
                <View style={[styles.featureIconBox, { borderColor: '#4CC38A' }]}>
                  <Feather name="shield" size={20} color="#4CC38A" />
                </View>
                <View style={styles.featureTextGroup}>
                  <Text style={styles.featureHeading}>You’re in control</Text>
                  <Text style={styles.featureSubheading}>Pause sharing any time</Text>
                </View>
              </View>
            </View>

            {/* Info Callout */}
            <View style={styles.permissionCalloutBox}>
              <Feather name="info" size={18} color="#F0913A" style={styles.calloutIcon} />
              <Text style={styles.calloutText}>
                Next, your phone will ask. Choose “Allow While Using App”, then “Change to Always Allow” for place reminders.
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              activeOpacity={0.85}
              onPress={() => setScreenMode('compass')}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.primaryActionText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryTextButton}
              activeOpacity={0.7}
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={styles.secondaryActionText}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-03: LOCATION SHARING CONSENT */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'locationConsent' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Location sharing</Text>
            </View>

            <ScrollView contentContainerStyle={styles.screenScrollContent}>
              <Text style={styles.consentTopDescription}>
                Choose who shares their location with the family. Parents decide for children.
              </Text>

              {/* Adults Section */}
              <Text style={styles.fieldSectionLabel}>ADULTS · EACH PERSON DECIDES</Text>
              <View style={styles.cardContainer}>
                {/* You */}
                <View style={styles.consentMemberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#784D1A' }]}>
                    <Text style={styles.memberAvatarInitial}>P</Text>
                  </View>
                  <View style={styles.consentTextGroup}>
                    <Text style={styles.consentMemberName}>You</Text>
                    <Text style={styles.consentMemberStatus}>Sharing · Always</Text>
                  </View>
                  <Switch
                    value={members.find((m) => m.id === 'priya')?.isSharing}
                    onValueChange={() => handleToggleMemberSharing('priya')}
                    trackColor={{ false: '#26374D', true: '#F0913A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.cardDivider} />

                {/* Rohan */}
                <View style={styles.consentMemberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#2B5282' }]}>
                    <Text style={styles.memberAvatarInitial}>R</Text>
                  </View>
                  <View style={styles.consentTextGroup}>
                    <Text style={styles.consentMemberName}>Rohan</Text>
                    <Text style={styles.consentMemberStatus}>Sharing · Always</Text>
                  </View>
                  <View style={styles.statusBadgeGreen}>
                    <Text style={styles.statusBadgeGreenText}>On</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Dadi */}
                <View style={styles.consentMemberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#246342' }]}>
                    <Text style={styles.memberAvatarInitial}>D</Text>
                  </View>
                  <View style={styles.consentTextGroup}>
                    <Text style={styles.consentMemberName}>Dadi</Text>
                    <Text style={styles.consentMemberStatus}>Turned off this morning</Text>
                  </View>
                  <View style={styles.dadiActionGroup}>
                    <View style={styles.statusBadgeGray}>
                      <Text style={styles.statusBadgeGrayText}>Off</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigateTo('askMemberSharing')}
                      accessibilityRole="button"
                      accessibilityLabel="Ask Dadi"
                    >
                      <Text style={styles.askButtonText}>Ask</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Children Section */}
              <Text style={styles.fieldSectionLabel}>CHILDREN · SET BY PARENTS</Text>
              <View style={styles.cardContainer}>
                {/* Anaya */}
                <View style={styles.consentMemberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#632543' }]}>
                    <Text style={styles.memberAvatarInitial}>A</Text>
                  </View>
                  <View style={styles.consentTextGroup}>
                    <Text style={styles.consentMemberName}>Anaya</Text>
                    <Text style={styles.consentMemberStatus}>Age 15 · She can see it’s shared</Text>
                  </View>
                  <Switch
                    value={members.find((m) => m.id === 'anaya')?.isSharing}
                    onValueChange={() => handleToggleMemberSharing('anaya')}
                    trackColor={{ false: '#26374D', true: '#F0913A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.cardDivider} />

                {/* Aarav */}
                <View style={styles.consentMemberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#705914' }]}>
                    <Text style={styles.memberAvatarInitial}>Aa</Text>
                  </View>
                  <View style={styles.consentTextGroup}>
                    <Text style={styles.consentMemberName}>Aarav</Text>
                    <Text style={styles.consentMemberStatus}>Age 9 · School days, 7 AM to 7 PM</Text>
                  </View>
                  <Switch
                    value={members.find((m) => m.id === 'aarav')?.isSharing}
                    onValueChange={() => handleToggleMemberSharing('aarav')}
                    trackColor={{ false: '#26374D', true: '#F0913A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* Privacy Footer Box */}
              <View style={styles.securityBox}>
                <Feather name="lock" size={18} color="#8A9BAE" style={styles.securityIcon} />
                <Text style={styles.securityText}>
                  Only your family can see locations. HosynQ never sells location data.
                </Text>
              </View>
            </ScrollView>

            {/* Pinned Bottom Save Button */}
            <View
              style={[
                styles.bottomButtonContainer,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#1F3352',
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Save location sharing"
              >
                <Text style={styles.primaryActionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-04: LOCATION OFF OVERLAY */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'locationOff' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={goBack} activeOpacity={0.7}>
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Compass</Text>
              <TouchableOpacity style={styles.headerIconButtonRight} onPress={() => navigateTo('smartActions')} activeOpacity={0.7}>
                <Feather name="sun" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dimmedMapContainer}>
              <MapCanvas mode="overview" members={[]} places={places} />
              <View style={styles.centeredCardOverlay}>
                <View style={styles.locationOffCard}>
                  <View style={styles.locationOffIconCircle}>
                    <MaterialIcons name="location-off" size={28} color="#F0913A" />
                  </View>
                  <Text style={styles.locationOffTitle}>Your location is off</Text>
                  <Text style={styles.locationOffDescription}>
                    Your family can’t see where you are, and place reminders won’t work. This also shows when you pause sharing.
                  </Text>
                  <TouchableOpacity
                    style={[styles.primaryActionButton, { width: '100%', marginBottom: 12 }]}
                    onPress={() => setScreenMode('compass')}
                  >
                    <Text style={styles.primaryActionText}>Turn on in Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryTextButton} onPress={goBack}>
                    <Text style={styles.secondaryActionText}>Keep it off</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-05: MEMBER LOCATION BOTTOM SHEET */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'memberLocation' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={goBack} activeOpacity={0.7}>
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Compass</Text>
              <TouchableOpacity style={styles.headerIconButtonRight} onPress={() => navigateTo('smartActions')} activeOpacity={0.7}>
                <Feather name="sun" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.mapCanvasWrapper}>
              <MapCanvas
                mode="overview"
                members={members}
                places={places}
                selectedMemberId={selectedMember.id}
              />
            </View>

            {/* Bottom Sheet for Member Details */}
            <View style={[styles.memberSheetCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.dragHandleBar} />

              <View style={styles.memberSheetHeader}>
                <View style={[styles.largeMemberAvatar, { backgroundColor: selectedMember.bgColor }]}>
                  <Text style={[styles.largeAvatarInitial, { color: selectedMember.textColor || '#FFFFFF' }]}>
                    {selectedMember.initial}
                  </Text>
                </View>
                <View style={styles.memberSheetHeaderTextGroup}>
                  <Text style={styles.memberSheetName}>{selectedMember.name}</Text>
                  <Text style={styles.memberSheetAddress}>
                    {selectedMember.id === 'rohan'
                      ? 'At Rohan’s office · Cyber City'
                      : `At ${selectedMember.statusText}`}
                  </Text>
                  <Text style={styles.memberSheetUpdated}>Updated 2 min ago</Text>
                </View>
              </View>

              {/* Status Details Card */}
              <View style={styles.memberStatusCard}>
                <View style={styles.memberDetailRow}>
                  <Feather name="clock" size={18} color="#8A9BAE" style={styles.detailIcon} />
                  <View style={styles.flexOne}>
                    <Text style={styles.detailLabel}>Usually leaves</Text>
                    <Text style={styles.detailValue}>{selectedMember.usuallyLeaves || 'Around 6:00 PM'}</Text>
                  </View>
                </View>

                <View style={styles.memberStatusDivider} />

                <View style={styles.memberDetailRow}>
                  <Feather name="navigation" size={18} color="#8A9BAE" style={styles.detailIcon} />
                  <View style={styles.flexOne}>
                    <Text style={styles.detailLabel}>Home in</Text>
                    <Text style={styles.detailValue}>{selectedMember.trafficStatus || '28 min with current traffic'}</Text>
                  </View>
                </View>
              </View>

              {/* 4 Action Buttons Row */}
              <View style={styles.memberActionButtonsRow}>
                <TouchableOpacity
                  style={styles.memberActionBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Calling', `Calling ${selectedMember.name}...`)}
                  accessibilityRole="button"
                  accessibilityLabel="Call"
                >
                  <Feather name="phone" size={20} color="#F0913A" />
                  <Text style={styles.memberActionBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.memberActionBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Message', `Opening message thread with ${selectedMember.name}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Message"
                >
                  <Feather name="message-square" size={20} color="#F0913A" />
                  <Text style={styles.memberActionBtnText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.memberActionBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Directions', `Getting directions to ${selectedMember.name}'s location`)}
                  accessibilityRole="button"
                  accessibilityLabel="Directions"
                >
                  <MaterialIcons name="route" size={20} color="#F0913A" />
                  <Text style={styles.memberActionBtnText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.memberActionBtn}
                  activeOpacity={0.8}
                  onPress={() => navigateTo('askMemberSharing')}
                  accessibilityRole="button"
                  accessibilityLabel="Ask ETA"
                >
                  <Feather name="clock" size={20} color="#F0913A" />
                  <Text style={styles.memberActionBtnText}>Ask ETA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-06: FAMILY PLACES */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'familyPlaces' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Family places</Text>
              <TouchableOpacity
                style={styles.headerIconButtonRight}
                onPress={() => navigateTo('addEditPlace')}
                accessibilityRole="button"
                accessibilityLabel="Add place"
                activeOpacity={0.7}
              >
                <Feather name="plus" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.flexOne}
              contentContainerStyle={styles.familyPlacesScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Mini Map Preview */}
              <MapCanvas
                mode="placesOverview"
                places={places}
                isMini
                onSelectPlace={(_p) => navigateTo('addEditPlace')}
              />

              {/* Places List Card */}
              <View style={styles.placesCardContainer}>
                {places.map((place, index) => (
                  <React.Fragment key={place.id}>
                    <TouchableOpacity
                      style={styles.placeListItem}
                      activeOpacity={0.75}
                      onPress={() => navigateTo('addEditPlace')}
                      accessibilityRole="button"
                      accessibilityLabel={`${place.name}, ${place.address}`}
                    >
                      <View
                        style={[
                          styles.placeIconBox,
                          {
                            borderColor:
                              place.type === 'home'
                                ? '#F0913A'
                                : place.type === 'school'
                                ? '#3A8EF0'
                                : place.type === 'work'
                                ? '#F06A6A'
                                : place.type === 'activity'
                                ? '#4CC38A'
                                : '#3CC4C4',
                          },
                        ]}
                      >
                        {renderPlaceIcon(place.type)}
                      </View>
                      <View style={styles.placeTextGroup}>
                        <Text style={styles.placeNameText}>{place.name}</Text>
                        <Text style={styles.placeAddressText}>{`${place.address} · ${place.distance}`}</Text>
                        {getHereText(place) && (
                          <Text style={styles.placeHereText}>{getHereText(place)}</Text>
                        )}
                      </View>
                      <Feather name="chevron-right" size={18} color="#50637F" />
                    </TouchableOpacity>
                    {index < places.length - 1 && <View style={styles.placeDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </ScrollView>

            {/* Pinned Bottom Button */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={() => navigateTo('addEditPlace')}
                accessibilityRole="button"
                accessibilityLabel="Add a place"
              >
                <Feather name="plus" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryActionText}>Add a place</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-07: ADD / EDIT PLACE */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'addEditPlace' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Close new place"
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New place</Text>
            </View>

            <ScrollView
              style={styles.flexOne}
              contentContainerStyle={styles.addEditPlaceScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Geofence Map Preview */}
              <MapCanvas
                mode="geofence"
                selectedPlaceType={newPlaceType}
                geofenceRadius={newPlaceRadius}
                isMini
              />

              {/* Name Field */}
              <Text style={styles.inputFieldLabel}>Name</Text>
              <View
                style={[
                  styles.textInputWrapper,
                  isPlaceNameFocused && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.textInputBox}
                  value={newPlaceName}
                  onChangeText={setNewPlaceName}
                  onFocus={() => {
                    setIsPlaceNameFocused(true);
                    setIsPlaceAddressFocused(false);
                  }}
                  onBlur={() => setIsPlaceNameFocused(false)}
                  placeholderTextColor="#64748B"
                  accessibilityLabel="Place name"
                />
              </View>

              {/* Type Field */}
              <Text style={styles.fieldSectionLabel}>TYPE</Text>
              <View style={styles.pillsWrapRow}>
                {(['Home', 'School', 'Work', 'Store', 'Activity', 'Other'] as const).map((typeLabel) => {
                  const val = typeLabel.toLowerCase() as PlaceType;
                  const isSelected = newPlaceType === val;
                  return (
                    <TouchableOpacity
                      key={typeLabel}
                      style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                      onPress={() => setNewPlaceType(val)}
                      accessibilityRole="button"
                      accessibilityLabel={`Type ${typeLabel}`}
                    >
                      <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                        {typeLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Address Field */}
              <Text style={styles.inputFieldLabel}>Address</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setIsPlaceAddressFocused(true);
                  setIsPlaceNameFocused(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Address, Lodhi Sports Complex, Lodhi Road, New Delhi"
                style={[
                  styles.addressDisplayCard,
                  isPlaceAddressFocused && styles.inputWrapperFocused,
                ]}
              >
                <Feather name="map-pin" size={18} color={isPlaceAddressFocused ? '#F0913A' : '#8A9BAE'} style={styles.addressPinIcon} />
                <Text style={styles.addressDisplayText}>
                  {newPlaceAddress}
                </Text>
              </TouchableOpacity>

              {/* Alert Radius */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.fieldSectionLabel}>ALERT RADIUS</Text>
                <Text style={styles.subtleFieldHint}>Alerts when someone is this close</Text>
              </View>
              <View style={styles.radiusPillsRow}>
                {([100, 200, 500] as const).map((rad) => {
                  const isSelected = newPlaceRadius === rad;
                  return (
                    <TouchableOpacity
                      key={rad}
                      style={[styles.radiusChip, isSelected && styles.radiusChipSelected]}
                      onPress={() => setNewPlaceRadius(rad)}
                      accessibilityRole="button"
                      accessibilityLabel={`${rad} meters`}
                    >
                      <Text style={[styles.radiusChipText, isSelected && styles.radiusChipTextSelected]}>
                        {rad} m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Pinned Bottom Save Button */}
            <View
              style={[
                styles.bottomButtonContainer,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#1F3352',
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={() => {
                  const created: FamilyPlace = {
                    id: `place-${Date.now()}`,
                    name: newPlaceName,
                    address: newPlaceAddress,
                    distance: '200 m',
                    type: newPlaceType,
                    radiusMeters: newPlaceRadius,
                    coords: { x: 76, y: 46 },
                  };
                  setPlaces((prev) => [...prev, created]);
                  goBack();
                }}
                accessibilityRole="button"
                accessibilityLabel="Save place"
              >
                <Text style={styles.primaryActionText}>Save place</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-08: HEADING HOME ROUTE & CMP-09: SHARE ETA DIALOG OVERLAY */}
        {/* ----------------------------------------------------------------- */}
        {(screenMode === 'headingHome' || screenMode === 'shareEta') && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Heading home</Text>
            </View>

            <View style={styles.mapCanvasWrapper}>
              <MapCanvas mode="headingHome" />
            </View>

            {/* Bottom Sheet for ETA */}
            <View style={styles.headingHomeSheetCard}>
              <Text style={styles.headingHomeTitle}>Home in 24 min</Text>
              <Text style={styles.headingHomeSubtitle}>
                Arrive around 6:42 PM · Moderate traffic on Golf Course Road
              </Text>

              {/* Traffic Box */}
              <View style={styles.trafficAlertCard}>
                <Feather name="clock" size={18} color="#F0913A" style={styles.trafficIcon} />
                <Text style={styles.trafficAlertText}>
                  Traffic gets heavier after 6:30 PM. Leaving now saves about 10 minutes.
                </Text>
              </View>

              {/* Share ETA Switch */}
              <View style={styles.shareEtaRow}>
                <View style={styles.shareEtaTextGroup}>
                  <Text style={styles.shareEtaTitle}>Share my ETA with family</Text>
                  <Text style={styles.shareEtaSubtitle}>Stops when you reach home</Text>
                </View>
                <Switch
                  value={shareEtaToggle || screenMode === 'shareEta'}
                  onValueChange={(val) => {
                    setShareEtaToggle(val);
                    if (val) {
                      navigateTo('shareEta');
                    }
                  }}
                  trackColor={{ false: '#26374D', true: '#F0913A' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Divider Line */}
              <View style={styles.cardDivider} />

              {/* At home now avatars */}
              <View style={styles.atHomeRow}>
                <Text style={styles.atHomeLabel}>At home now</Text>
                <View style={styles.atHomeAvatarsCluster}>
                  <View style={[styles.miniAtHomeAvatar, { backgroundColor: '#246342', zIndex: 2 }]}>
                    <Text style={styles.miniAvatarText}>D</Text>
                  </View>
                  <View style={[styles.miniAtHomeAvatar, { backgroundColor: '#632543', marginLeft: -8, zIndex: 1 }]}>
                    <Text style={styles.miniAvatarText}>A</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Action Bar */}
            <View style={styles.headingHomeBottomBar}>
              <TouchableOpacity
                style={[styles.primaryActionButton, { marginTop: 0 }]}
                activeOpacity={0.85}
                onPress={() => {
                  navigateTo('shareEta');
                  onStartHeadingHome?.();
                }}
                accessibilityRole="button"
                accessibilityLabel="Start heading home"
              >
                <Feather name="navigation" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryActionText}>Start</Text>
              </TouchableOpacity>
            </View>

            {/* CMP-09: Share ETA Dialog Overlay */}
            {screenMode === 'shareEta' && (
              <View style={styles.dialogScreenBackdrop}>
                <View style={styles.dialogCard}>
                  <View style={styles.dialogIconCircle}>
                    <Feather name="navigation" size={24} color="#F0913A" />
                  </View>

                  <Text style={styles.dialogTitle}>Share your ETA?</Text>
                  <Text style={styles.dialogSubtitle}>
                    Your family will see that you’re on the way and when you’ll arrive. Sharing stops when you reach home.
                  </Text>

                  {/* Option 1: Everyone in the family */}
                  <TouchableOpacity
                    style={[styles.radioOptionCard, etaAudience === 'everyone' && styles.radioOptionCardSelected]}
                    onPress={() => setEtaAudience('everyone')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Everyone in the family"
                  >
                    <View style={styles.radioTextGroup}>
                      <Text style={styles.radioTitle}>Everyone in the family</Text>
                      <Text style={styles.radioSubtitle}>Rohan, Dadi, Anaya, Aarav</Text>
                    </View>
                    <View style={[styles.radioOuter, etaAudience === 'everyone' && styles.radioOuterSelected]}>
                      {etaAudience === 'everyone' && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>

                  {/* Option 2: Choose people */}
                  <TouchableOpacity
                    style={[styles.radioOptionCard, etaAudience === 'custom' && styles.radioOptionCardSelected]}
                    onPress={() => setEtaAudience('custom')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Choose people"
                  >
                    <View style={styles.radioTextGroup}>
                      <Text style={styles.radioTitle}>Choose people</Text>
                    </View>
                    <View style={[styles.radioOuter, etaAudience === 'custom' && styles.radioOuterSelected]}>
                      {etaAudience === 'custom' && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>

                  {/* Action Buttons */}
                  <TouchableOpacity
                    style={[styles.primaryActionButton, { width: '100%', marginTop: 8, marginBottom: 16 }]}
                    activeOpacity={0.85}
                    onPress={() => {
                      Alert.alert('ETA Shared', 'Your family has been notified of your ETA.');
                      setScreenMode('compass');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Share ETA"
                  >
                    <Text style={styles.primaryActionText}>Share ETA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryTextButton}
                    activeOpacity={0.7}
                    onPress={goBack}
                    accessibilityRole="button"
                    accessibilityLabel="Don’t share"
                  >
                    <Text style={styles.secondaryActionText}>Don’t share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}



        {/* ----------------------------------------------------------------- */}
        {/* CMP-11: LOCATION REMINDERS */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'locationReminders' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={goBack} activeOpacity={0.7}>
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Location reminders</Text>
              <TouchableOpacity
                style={styles.headerIconButtonRight}
                onPress={() => navigateTo('createReminder')}
                accessibilityRole="button"
                accessibilityLabel="New location reminder"
                activeOpacity={0.7}
              >
                <Feather name="plus" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.screenScrollContent}>
              {/* Active / Done Segmented Tabs */}
              <View style={styles.segmentedTabsContainer}>
                <TouchableOpacity
                  style={[styles.segmentedTab, reminderTab === 'active' && styles.segmentedTabActive]}
                  onPress={() => setReminderTab('active')}
                >
                  <Text style={[styles.segmentedTabText, reminderTab === 'active' && styles.segmentedTabTextActive]}>
                    Active · 3
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentedTab, reminderTab === 'done' && styles.segmentedTabActive]}
                  onPress={() => setReminderTab('done')}
                >
                  <Text style={[styles.segmentedTabText, reminderTab === 'done' && styles.segmentedTabTextActive]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Banner */}
              <View style={styles.alwaysAllowBanner}>
                <Feather name="check-circle" size={18} color="#2DD4BF" style={styles.bannerCheckIcon} />
                <Text style={styles.alwaysAllowBannerText}>
                  “Always allow” is on, so these work in the background.
                </Text>
              </View>

              {/* Reminders List */}
              <View style={styles.cardContainer}>
                {reminders.map((reminder, idx) => (
                  <React.Fragment key={reminder.id}>
                    <TouchableOpacity
                      style={styles.reminderListItem}
                      activeOpacity={0.75}
                      onPress={() => navigateTo('createReminder')}
                      accessibilityRole="button"
                      accessibilityLabel={`${reminder.title}, ${reminder.condition === 'arrive' ? 'When you arrive' : 'When you leave'} ${reminder.placeName}`}
                    >
                      <View style={[styles.placeIconBox, { borderColor: reminder.type === 'store' ? '#3CC4C4' : reminder.type === 'work' ? '#F06A6A' : '#3A8EF0' }]}>
                        {renderPlaceIcon(reminder.type)}
                      </View>
                      <View style={styles.reminderTextGroup}>
                        <View style={styles.reminderTitleRow}>
                          <Text style={styles.reminderTitleText}>{reminder.title}</Text>
                          <View style={reminder.condition === 'arrive' ? styles.arriveTagBadge : styles.leaveTagBadge}>
                            <Text style={reminder.condition === 'arrive' ? styles.arriveTagText : styles.leaveTagText}>
                              {reminder.condition === 'arrive' ? 'Arrive' : 'Leave'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.reminderSubtitleText}>
                          When {reminder.targetMember === 'Rohan' ? 'Rohan leaves' : 'you arrive at'} {reminder.placeName}
                        </Text>
                        <Text style={styles.reminderFrequencyText}>
                          {reminder.targetMember} · {reminder.frequency}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#64748B" />
                    </TouchableOpacity>
                    {idx < reminders.length - 1 && <View style={styles.cardDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </ScrollView>

            {/* Pinned Bottom Button */}
            <View
              style={[
                styles.bottomButtonContainer,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#1F3352',
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={() => navigateTo('createReminder')}
                accessibilityRole="button"
                accessibilityLabel="New location reminder"
              >
                <Feather name="plus" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryActionText}>New location reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-12: CREATE LOCATION REMINDER */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'createReminder' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={goBack} activeOpacity={0.7}>
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New location reminder</Text>
            </View>

            <ScrollView contentContainerStyle={styles.screenScrollContent}>
              {/* Remind me to Input */}
              <Text style={styles.inputFieldLabel}>Remind me to</Text>
              <View
                style={[
                  styles.textInputWrapper,
                  isReminderTitleFocused && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.textInputBox}
                  value={reminderTitle}
                  onChangeText={setReminderTitle}
                  onFocus={() => setIsReminderTitleFocused(true)}
                  onBlur={() => setIsReminderTitleFocused(false)}
                  placeholderTextColor="#64748B"
                  accessibilityLabel="Remind me to"
                />
              </View>

              {/* When I Arrive / When I Leave Selector */}
              <View style={styles.conditionToggleRow}>
                <TouchableOpacity
                  style={[styles.conditionChip, reminderCondition === 'arrive' && styles.conditionChipActive]}
                  onPress={() => setReminderCondition('arrive')}
                  accessibilityRole="button"
                  accessibilityLabel="When I arrive"
                >
                  <Feather
                    name="map-pin"
                    size={16}
                    color={reminderCondition === 'arrive' ? '#0B192E' : '#CAD4DF'}
                    style={styles.chipIcon}
                  />
                  <Text style={[styles.conditionChipText, reminderCondition === 'arrive' && styles.conditionChipTextActive]}>
                    When I arrive
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.conditionChip, reminderCondition === 'leave' && styles.conditionChipActive]}
                  onPress={() => setReminderCondition('leave')}
                  accessibilityRole="button"
                  accessibilityLabel="When I leave"
                >
                  <Feather
                    name="log-out"
                    size={16}
                    color={reminderCondition === 'leave' ? '#0B192E' : '#CAD4DF'}
                    style={styles.chipIcon}
                  />
                  <Text style={[styles.conditionChipText, reminderCondition === 'leave' && styles.conditionChipTextActive]}>
                    When I leave
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Place Selector */}
              <View style={styles.cardContainer}>
                <View style={styles.selectorItemRow}>
                  <Ionicons name="storefront-outline" size={20} color="#8A9BAE" style={styles.detailIcon} />
                  <View style={styles.selectorTextGroup}>
                    <Text style={styles.selectorItemLabel}>Place</Text>
                    <Text style={styles.selectorItemValue}>Modern Bazaar · Sector 45</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#50637F" />
                </View>
              </View>

              {/* Mini Map Preview */}
              <MapCanvas
                mode="geofence"
                selectedPlaceType="store"
                geofenceRadius={100}
                isMini
              />

              {/* Remind & Repeat Rows */}
              <View style={[styles.cardContainer, { marginTop: 16 }]}>
                {/* Remind */}
                <View style={styles.selectorItemRow}>
                  <Feather name="user" size={20} color="#8A9BAE" style={styles.detailIcon} />
                  <View style={styles.selectorTextGroup}>
                    <Text style={styles.selectorItemLabel}>Remind</Text>
                    <View style={styles.avatarWithLabelRow}>
                      <View style={[styles.miniAtHomeAvatar, { backgroundColor: '#784D1A', marginRight: 8 }]}>
                        <Text style={styles.miniAvatarText}>P</Text>
                      </View>
                      <Text style={styles.selectorItemValue}>You</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color="#50637F" />
                </View>

                <View style={styles.cardDivider} />

                {/* Repeat */}
                <View style={styles.selectorItemRow}>
                  <Feather name="rotate-ccw" size={18} color="#8A9BAE" style={styles.detailIcon} />
                  <View style={styles.selectorTextGroup}>
                    <Text style={styles.selectorItemLabel}>Repeat</Text>
                    <Text style={styles.selectorItemValue}>Every time I arrive</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#50637F" />
                </View>
              </View>
            </ScrollView>

            {/* Pinned Bottom Button */}
            <View
              style={[
                styles.bottomButtonContainer,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#1F3352',
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={() => {
                  const newRem: LocationReminder = {
                    id: `rem-${Date.now()}`,
                    title: reminderTitle,
                    condition: reminderCondition,
                    placeName: 'Modern Bazaar',
                    targetMember: 'You',
                    frequency: 'Every time I arrive',
                    type: 'store',
                  };
                  setReminders((prev) => [...prev, newRem]);
                  goBack();
                }}
                accessibilityRole="button"
                accessibilityLabel="Save reminder"
              >
                <Text style={styles.primaryActionText}>Save reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CMP-13: SMART ACTIONS */}
        {/* ----------------------------------------------------------------- */}
        {screenMode === 'smartActions' && (
          <View style={styles.flexOne}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={goBack} activeOpacity={0.7}>
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Smart actions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.screenScrollContent}>
              <Text style={styles.consentTopDescription}>
                Shortcuts based on where your family is. You confirm before anything is sent.
              </Text>

              {/* Suggested Now Section */}
              {!suggestionDismissed && (
                <>
                  <Text style={styles.suggestedNowHeader}>✦ SUGGESTED NOW</Text>
                  <View style={styles.suggestionHighlightCard}>
                    <View style={styles.suggestionPromptRow}>
                      <Text style={styles.sparkleIcon}>✦</Text>
                      <Text style={styles.suggestionPromptText}>
                        Anaya’s badminton ends at 7:30 PM. Rohan is closest. Ask him to pick her up?
                      </Text>
                    </View>

                    <View style={styles.suggestionActionRow}>
                      <TouchableOpacity
                        style={styles.confirmSmallBtn}
                        onPress={() => {
                          Alert.alert('Request Sent', 'Rohan has been notified to pick up Anaya at 7:30 PM.');
                          setSuggestionDismissed(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Confirm suggested pickup"
                      >
                        <Text style={styles.confirmSmallBtnText}>Confirm</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editSmallBtn}
                        onPress={() => Alert.alert('Edit', 'Edit suggestion details')}
                        accessibilityRole="button"
                        accessibilityLabel="Edit suggestion"
                      >
                        <Text style={styles.editSmallBtnText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.ignoreSmallBtn}
                        onPress={() => setSuggestionDismissed(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Ignore suggestion"
                      >
                        <Text style={styles.ignoreSmallBtnText}>Ignore</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {/* Your Shortcuts */}
              <Text style={styles.fieldSectionLabel}>YOUR SHORTCUTS</Text>
              <View style={styles.cardContainer}>
                {shortcuts.map((shortcut, index) => (
                  <React.Fragment key={shortcut.id}>
                    <View style={styles.shortcutItemRow}>
                      <View style={[styles.placeIconBox, { borderColor: shortcut.iconColor }]}>
                        {shortcut.icon === 'school-outline' ? (
                          <Ionicons name="school-outline" size={20} color={shortcut.iconColor} />
                        ) : shortcut.icon === 'car-outline' ? (
                          <Ionicons name="car-outline" size={20} color={shortcut.iconColor} />
                        ) : (
                          <Feather name={shortcut.icon as any} size={18} color={shortcut.iconColor} />
                        )}
                      </View>
                      <View style={styles.shortcutTextGroup}>
                        <Text style={styles.shortcutTitleText}>{shortcut.title}</Text>
                        <Text style={styles.shortcutSubtitleText}>{shortcut.description}</Text>
                      </View>
                      <Switch
                        value={shortcut.enabled}
                        onValueChange={() => handleToggleShortcut(shortcut.id)}
                        trackColor={{ false: '#26374D', true: '#F0913A' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                    {index < shortcuts.length - 1 && <View style={styles.cardDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CompassModal;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0B192E',
  },
  flexOne: {
    flex: 1,
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0B192E',
    position: 'relative',
    zIndex: 20,
  },
  headerIconButton: {
    position: 'absolute',
    left: 20,
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerIconButtonRight: {
    position: 'absolute',
    right: 20,
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerIconButtonPlaceholder: {
    display: 'none',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  screenScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mapCanvasWrapper: {
    flex: 1,
  },
  bottomSheetCard: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#243854',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '60%',
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 14,
  },
  quickPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 16,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  quickPillPrimary: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  quickPillIcon: {
    marginRight: 6,
  },
  quickPillPrimaryText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#0E1E34',
  },
  quickPillText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  sectionActionText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
  memberListScroll: {
    flexGrow: 0,
  },
  memberItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  memberItemRowLast: {
    borderBottomWidth: 0,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  memberAvatarInitial: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  memberTextGroup: {
    flex: 1,
  },
  memberLocationName: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberSubLocation: {
    fontSize: 13,
    color: '#8E9BAE',
  },
  // Permission Screen (CMP-02)
  permissionHeroCircleWrapper: {
    alignItems: 'center',
    marginVertical: 24,
  },
  permissionOuterCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#1D324F',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInnerCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    borderColor: '#26354B',
    backgroundColor: '#122440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  permissionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: '#11223A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#1A2C47',
    marginVertical: 12,
  },
  permissionFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0B1728',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextGroup: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureSubheading: {
    fontSize: 12,
    color: '#8A9BAE',
  },
  permissionCalloutBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginBottom: 24,
  },
  calloutIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  calloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#CAD4DF',
  },
  primaryActionButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  secondaryTextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryActionText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  // Consent Screen (CMP-03)
  consentTopDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    marginBottom: 20,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    color: '#8A9BAE',
    marginBottom: 10,
  },
  subtleFieldHint: {
    fontSize: 12,
    color: '#64748B',
  },
  consentMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consentTextGroup: {
    flex: 1,
  },
  consentMemberName: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  consentMemberStatus: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  statusBadgeGreen: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2DD4BF',
    backgroundColor: '#2DD4BF1A',
  },
  statusBadgeGreenText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    color: '#2DD4BF',
  },
  statusBadgeGray: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#64748B',
    backgroundColor: '#64748B1A',
  },
  statusBadgeGrayText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    color: '#CAD4DF',
  },
  dadiActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  askButtonText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginBottom: 24,
  },
  securityIcon: {
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#CAD4DF',
  },
  // Location Off (CMP-04)
  dimmedMapContainer: {
    flex: 1,
    position: 'relative',
  },
  centeredCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  locationOffCard: {
    width: '100%',
    backgroundColor: '#11223A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
  },
  locationOffIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0E1F38',
    borderWidth: 1,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationOffTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  locationOffDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Member Location Sheet (CMP-05)
  memberSheetCard: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#243854',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  memberSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeMemberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  largeAvatarInitial: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  memberSheetHeaderTextGroup: {
    flex: 1,
  },
  memberSheetName: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  memberSheetAddress: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    marginBottom: 2,
  },
  memberSheetUpdated: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  memberStatusCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  memberDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  memberStatusDivider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  detailIcon: {
    marginRight: 14,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8A9BAE',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  memberActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberActionBtn: {
    flex: 1,
    height: 78,
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#243854',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberActionBtnText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  // Places (CMP-06 & CMP-07)
  familyPlacesScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  placesCardContainer: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginTop: 16,
  },
  placeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  placeDivider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  placeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  placeTextGroup: {
    flex: 1,
  },
  placeNameText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  placeAddressText: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 2,
  },
  placeHereText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#4CC38A',
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#0B192E',
  },
  addEditPlaceScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  inputFieldLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    marginTop: 16,
    marginBottom: 8,
  },
  textInputWrapper: {
    backgroundColor: '#11223A',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    height: 52,
    justifyContent: 'center',
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
  },
  textInputBox: {
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  addressInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    height: 52,
    marginBottom: 18,
  },
  addressTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  pillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  typeChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  typeChipTextSelected: {
    color: '#0B192E',
    fontFamily: 'Roboto-Bold',
  },
  addressDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 52,
    marginBottom: 18,
  },
  addressPinIcon: {
    marginRight: 12,
  },
  addressDisplayText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#CAD4DF',
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  radiusChip: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
  },
  radiusChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  radiusChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  radiusChipTextSelected: {
    color: '#0B192E',
    fontFamily: 'Roboto-Bold',
  },
  // Heading Home (CMP-08)
  headingHomeSheetCard: {
    backgroundColor: '#0E1E34',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1D324F',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  headingHomeBottomBar: {
    backgroundColor: '#0B192E',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headingHomeTitle: {
    fontSize: 26,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headingHomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    marginBottom: 16,
  },
  trafficAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D324F',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  trafficIcon: {
    marginRight: 12,
  },
  trafficAlertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
  },
  shareEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  shareEtaTextGroup: {
    flex: 1,
  },
  shareEtaTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  shareEtaSubtitle: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  atHomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  atHomeLabel: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  atHomeAvatarsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAtHomeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0E1E34',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  // Dialog Backdrop (CMP-09, CMP-10)
  dialogScreenBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 13, 24, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  dialogIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0E1F36',
    borderWidth: 1,
    borderColor: '#233852',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    textAlign: 'center',
    marginBottom: 20,
  },
  radioOptionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24364D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  radioOptionCardSelected: {
    borderWidth: 2,
    borderColor: '#F0913A',
    backgroundColor: '#122440',
  },
  radioTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  radioTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  radioSubtitle: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4C64',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0913A',
  },
  quotePreviewBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B2D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 14,
    marginBottom: 20,
  },
  quotePreviewText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#CAD4DF',
  },
  // Reminders (CMP-11 & CMP-12)
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0E1F36',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 4,
    marginBottom: 16,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  segmentedTabActive: {
    backgroundColor: '#F0913A',
  },
  segmentedTabText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#8A9BAE',
  },
  segmentedTabTextActive: {
    color: '#0B192E',
    fontFamily: 'Roboto-Bold',
  },
  alwaysAllowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E241E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#174A37',
    padding: 14,
    marginBottom: 16,
  },
  bannerCheckIcon: {
    marginRight: 10,
  },
  alwaysAllowBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#CAD4DF',
  },
  reminderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTextGroup: {
    flex: 1,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reminderTitleText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    flex: 1,
  },
  arriveTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2DD4BF',
    backgroundColor: '#2DD4BF1A',
    marginLeft: 8,
  },
  arriveTagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#2DD4BF',
  },
  leaveTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0913A',
    backgroundColor: '#F0913A1A',
    marginLeft: 8,
  },
  leaveTagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  reminderSubtitleText: {
    fontSize: 13,
    color: '#8A9BAE',
    marginBottom: 2,
  },
  reminderFrequencyText: {
    fontSize: 12,
    color: '#64748B',
  },
  conditionToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0E1F36',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 4,
    marginBottom: 16,
  },
  conditionChip: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
  conditionChipActive: {
    backgroundColor: '#F0913A',
  },
  chipIcon: {
    marginRight: 8,
  },
  conditionChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  conditionChipTextActive: {
    color: '#0B192E',
    fontFamily: 'Roboto-Bold',
  },
  selectorItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorTextGroup: {
    flex: 1,
  },
  selectorItemLabel: {
    fontSize: 12,
    color: '#8A9BAE',
    marginBottom: 2,
  },
  selectorItemValue: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  avatarWithLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Smart Actions (CMP-13)
  suggestedNowHeader: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    color: '#F0913A',
    marginBottom: 10,
  },
  suggestionHighlightCard: {
    backgroundColor: '#11223A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 24,
  },
  suggestionPromptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sparkleIcon: {
    fontSize: 16,
    color: '#F0913A',
    marginRight: 10,
    marginTop: 2,
  },
  suggestionPromptText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  suggestionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmSmallBtn: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSmallBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  editSmallBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#0E1F36',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSmallBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  ignoreSmallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ignoreSmallBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#8A9BAE',
  },
  shortcutItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortcutTextGroup: {
    flex: 1,
  },
  shortcutTitleText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  shortcutSubtitleText: {
    fontSize: 13,
    color: '#8A9BAE',
  },
});
