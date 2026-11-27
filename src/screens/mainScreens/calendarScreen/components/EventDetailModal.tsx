import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../../redux';
import {
  fetchPollResultsThunk,
  fetchPollsThunk,
  setSelectedPollLocal,
} from '../../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../../redux/features/lists/listsSlice';
import { PulsePollApiItem } from '../../../../services/pulseServices';
import PollResultsModal from '../../familyPulse/PollResultsModal';
import FamilyPollsModal from '../../familyPulse/FamilyPollsModal';
import { isJestTestEnv } from '../../familyPulse/pulseApiHelpers';
import { CalendarEvent, EventComment, CalendarFamilyMember } from '../types';
import {
  extractFamilyMembersFromState,
  resolveMyMemberIdFromState,
  formatDisplayReminders,
  formatDisplayRepeat,
  normalizeRsvpResponse,
} from '../calendarApiHelpers';
import CancelEventModal from './CancelEventModal';
import EventCommentsModal from './EventCommentsModal';
import CreateEventModal from './CreateEventModal';
import AppOptionsMenu from '../../common/AppOptionsMenu';

export interface EventDetailModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  members?: CalendarFamilyMember[];
  onClose: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onOpenComments: (event: CalendarEvent) => void;
  onCancelEvent: (event: CalendarEvent, reason?: string) => void;
  onAddComment?: (eventId: string, commentText: string) => void;
  onRsvpResponse?: (eventId: string, response: 'GOING' | 'NOT_GOING') => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  event: eventProp,
  members,
  onClose,
  onEditEvent,
  onOpenComments,
  onCancelEvent,
  onAddComment,
  onRsvpResponse,
}) => {
  const insets = useSafeAreaInsets();
  const [cachedEvent, setCachedEvent] = useState<CalendarEvent | null>(
    eventProp
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showPollResults, setShowPollResults] = useState(false);
  const [showFamilyPolls, setShowFamilyPolls] = useState(false);
  const [resolvedPollId, setResolvedPollId] = useState<string | null>(null);
  const [resolvingPoll, setResolvingPoll] = useState(false);

  useEffect(() => {
    if (eventProp) {
      setCachedEvent(eventProp);
    }
  }, [eventProp]);

  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      setShowCancelModal(false);
      setShowComments(false);
      setShowEditModal(false);
      setShowAttendeesModal(false);
      setShowPollResults(false);
      setShowFamilyPolls(false);
      setResolvedPollId(null);
      setResolvingPoll(false);
    }
  }, [visible]);

  useEffect(() => {
    if (
      showCancelModal ||
      showEditModal ||
      showComments ||
      showAttendeesModal ||
      showPollResults ||
      showFamilyPolls
    ) {
      setIsMenuOpen(false);
    }
  }, [
    showCancelModal,
    showEditModal,
    showComments,
    showAttendeesModal,
    showPollResults,
    showFamilyPolls,
  ]);

  const event = cachedEvent || eventProp;
  const dispatch = useAppDispatch();

  const familyState = useAppSelector((state) => state.family);
  const pulseState = useAppSelector((state) => state.pulse);
  const authUser = useAppSelector((state) => state.auth?.user);
  const emailAuthUser = useAppSelector((state) => state.emailAuth?.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);
  const lifeProfile = useAppSelector((state) => state.lifeProfile);
  const authUserId = authUser?.id || emailAuthUser?.id || baseProfile?.user?.id;
  const myMemberId =
    resolveMyMemberIdFromState(familyState, authUserId) ||
    (lifeProfile as any)?.memberId ||
    (lifeProfile as any)?.profile?.memberId ||
    null;

  const allAvailableMembers = useMemo(() => {
    if (members && members.length > 0) return members;
    return extractFamilyMembersFromState(familyState);
  }, [members, familyState]);

  const currentUserName = useMemo(() => {
    const myMember = myMemberId
      ? allAvailableMembers.find((m) => m.id === myMemberId)
      : null;
    const rawName =
      myMember?.name ||
      authUser?.fullName ||
      emailAuthUser?.fullName ||
      baseProfile?.user?.fullName ||
      (baseProfile?.isProfileComplete ? baseProfile?.fullName : '') ||
      (lifeProfile as any)?.profile?.personal?.fullName ||
      (lifeProfile as any)?.fullName ||
      '';
    const cleaned = rawName.replace(/\s*\(you\)\s*$/i, '').trim();
    return cleaned || 'You';
  }, [myMemberId, allAvailableMembers, authUser, emailAuthUser, baseProfile, lifeProfile]);

  const isCurrentUserMember = useMemo(() => {
    return (member: { id?: string; name?: string }) => {
      if (myMemberId) {
        return (
          member.id === myMemberId ||
          (Boolean(authUserId) && member.id === authUserId) ||
          member.name === 'You'
        );
      }
      if (authUserId && member.id === authUserId) return true;
      if (member.name === 'You') return true;
      if (currentUserName && currentUserName !== 'You' && member.name) {
        return (
          member.name.replace(/\s*\(you\)\s*$/i, '').trim().toLowerCase() ===
          currentUserName.toLowerCase()
        );
      }
      return false;
    };
  }, [myMemberId, authUserId, currentUserName]);

  const isCreator = useMemo(() => {
    if (!event) return false;
    if (event.isCreator) return true;
    const creatorIds = [event.createdByMemberId, event.createdById].filter(
      Boolean
    );
    if (myMemberId && creatorIds.includes(myMemberId)) return true;
    if (authUserId && creatorIds.includes(authUserId)) return true;
    return false;
  }, [event, myMemberId, authUserId]);

  const effectiveMyResponse = useMemo(() => {
    if (!event) return null;
    const direct = normalizeRsvpResponse(event.myResponse);
    if (direct) return direct;
    if (myMemberId) {
      const invEntry = event.invitees?.find((i) => i.id === myMemberId);
      const invResponse = normalizeRsvpResponse(invEntry?.response);
      if (invResponse) {
        return invResponse;
      }
      if (
        !invEntry &&
        Array.isArray(event.goingMembers) &&
        event.goingMembers.some((g) => g.id === myMemberId)
      ) {
        return 'GOING';
      }
    }
    return null;
  }, [event, myMemberId]);

  const activeGoingMembers = useMemo(() => {
    if (!event) return [];
    let list: Array<{ id: string; name: string; initial: string; color: string; textColor?: string }> = [];

    if (Array.isArray(event.goingMembers) && event.goingMembers.length > 0) {
      list = event.goingMembers.map((g) => ({
        id: g.id,
        name: g.name,
        initial: g.initial || (g.name ? g.name[0].toUpperCase() : 'U'),
        color: g.color || '#1F3A66',
        textColor: g.textColor || '#FFFFFF',
      }));
    } else if (Array.isArray(event.goingMemberIds) && event.goingMemberIds.length > 0) {
      list = event.goingMemberIds
        .map((id) => allAvailableMembers.find((m) => m.id === id))
        .filter(Boolean)
        .map((m: any) => ({
          id: m.id,
          name: m.name,
          initial: m.initial || (m.name ? m.name[0].toUpperCase() : 'U'),
          color: m.color || '#1F3A66',
          textColor: m.textColor || '#FFFFFF',
        }));
    }

    const myId = myMemberId;
    const isCurrentUserInList = list.some((m) => isCurrentUserMember(m));

    if (effectiveMyResponse === 'NOT_GOING') {
      list = list.filter((m) => !isCurrentUserMember(m));
    } else if ((effectiveMyResponse === 'GOING' || isCreator) && !isCurrentUserInList) {
      const myMember = myId ? allAvailableMembers.find((m) => m.id === myId) : null;
      const cleanMyName =
        (myMember?.name || currentUserName || 'You').replace(/\s*\(you\)\s*$/i, '').trim() || 'You';
      list.push({
        id: myId || 'me',
        name: cleanMyName,
        initial: myMember?.initial || (cleanMyName !== 'You' ? cleanMyName[0].toUpperCase() : 'Y'),
        color: myMember?.color || '#4A2E1A',
        textColor: myMember?.textColor || '#F7C08E',
      });
    }

    return list;
  }, [event?.goingMembers, event?.goingMemberIds, effectiveMyResponse, isCreator, allAvailableMembers, myMemberId, currentUserName, isCurrentUserMember]);

  const canShowRsvpCard = useMemo(() => {
    if (!event) return false;
    // Creator is already going -> never show "Are you going?"
    if (isCreator) return false;
    // Hide RSVP section once the invitee has submitted a response or cannot respond
    if (Boolean(effectiveMyResponse) || event.canRespond === false) return false;

    // If backend explicitly granted respond permission and user hasn't responded, trust it
    if (event.backendCanRespond === true) return true;

    // Show to every invited user who has not responded yet
    if (myMemberId && Array.isArray(event.invitees) && event.invitees.length > 0) {
      const invEntry = event.invitees.find((i) => i.id === myMemberId);
      return Boolean(invEntry && !normalizeRsvpResponse(invEntry.response));
    }

    if (
      myMemberId &&
      Array.isArray(event.invitedMemberIds) &&
      event.invitedMemberIds.length > 0
    ) {
      return event.invitedMemberIds.includes(myMemberId);
    }

    return Boolean(
      event.askToConfirm ||
        event.canRespond ||
        (event.goingMemberIds && event.goingMemberIds.length > 0)
    );
  }, [event, isCreator, effectiveMyResponse, myMemberId]);

  const handleRsvpSelect = (response: 'GOING' | 'NOT_GOING') => {
    if (!event || isCreator || Boolean(effectiveMyResponse) || event.canRespond === false) {
      return;
    }
    setCachedEvent((prev) =>
      prev ? { ...prev, myResponse: response, canRespond: false } : null
    );
    onRsvpResponse?.(event.id, response);
  };

  const goingNamesText = useMemo(() => {
    if (activeGoingMembers.length === 0) {
      return 'No one going';
    }

    let seenYou = false;
    const names = activeGoingMembers.map((m) => {
      if (isCurrentUserMember(m) && !seenYou) {
        seenYou = true;
        return 'you';
      }
      return m.name.replace(/\s*\(you\)\s*$/i, '').trim() || m.name;
    });

    if (names.length === 1) {
      return names[0] === 'you' ? 'You' : names[0];
    }
    if (names.length === 2) {
      if (names[0] === 'you') return `${names[1]} and you`;
      return `${names[0]} and ${names[1]}`;
    }
    if (names.length === 3) {
      if (names.includes('you')) {
        const others = names.filter((n) => n !== 'you');
        return `${others[0]}, ${others[1]} and you`;
      }
      return `${names[0]}, ${names[1]} and ${names[2]}`;
    }
    const first = names[0] === 'you' ? names[1] : names[0];
    const second = names[0] === 'you' ? names[2] : (names[1] === 'you' ? names[2] : names[1]);
    const remaining = names.length - 2;
    return `${first}, ${second} and ${remaining} more`;
  }, [activeGoingMembers, isCurrentUserMember]);

  const displayReminders = useMemo(
    () => formatDisplayReminders(event?.reminders),
    [event?.reminders]
  );
  const displayRepeat = useMemo(
    () => formatDisplayRepeat(event?.repeat),
    [event?.repeat]
  );

  if (!event) return null;

  const handleClose = () => {
    setIsMenuOpen(false);
    setShowComments(false);
    setShowCancelModal(false);
    setShowEditModal(false);
    setShowAttendeesModal(false);
    onClose();
  };

  const handleToggleMenu = () => {
    if (
      showCancelModal ||
      showEditModal ||
      showComments ||
      showAttendeesModal
    )
      return;
    setIsMenuOpen((prev) => !prev);
  };

  const handleSaveEditedEvent = (updatedData: Partial<CalendarEvent>) => {
    const updated = { ...(cachedEvent || event), ...updatedData };
    setCachedEvent(updated);
    setShowEditModal(false);
    onEditEvent(updated);
  };

  const handleLocalAddComment = (eventId: string, commentText: string) => {
    const newComment: EventComment = {
      id: `c-${Date.now()}`,
      authorId: 'm1',
      authorName: 'You',
      authorInitial: 'P',
      authorColor: '#4A2E1A',
      time: 'Just now',
      text: commentText,
      isCurrentUser: true,
    };
    setCachedEvent((prev) =>
      prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null
    );
    onAddComment?.(eventId, commentText);
  };

  return (
    <Modal
      visible={visible && Boolean(eventProp)}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Top Bar Header (CAL-06) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close event detail"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Event</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleToggleMenu}
            activeOpacity={0.7}
            disabled={showCancelModal || showEditModal || showComments}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color="#CAD4DF" />
          </TouchableOpacity>
        </View>

        {/* Dropdown Options Menu */}
        <AppOptionsMenu
          visible={isMenuOpen && !showCancelModal && !showEditModal && !showComments}
          onClose={() => setIsMenuOpen(false)}
          topOffset={insets.top + 58}
          items={[
            {
              id: 'comments',
              label: `Comments (${event.comments?.length || 0})`,
              iconName: 'message-square',
              onPress: () => {
                setShowComments(true);
                onOpenComments(event);
              },
            },
            ...(event.canEdit !== false
              ? [
                  {
                    id: 'edit',
                    label: 'Edit Event',
                    iconName: 'edit-2',
                    onPress: () => setShowEditModal(true),
                    showDividerAfter: event.canCancel !== false,
                  },
                ]
              : []),
            ...(event.canCancel !== false
              ? [
                  {
                    id: 'cancel',
                    label: 'Cancel Event',
                    iconName: 'trash-2',
                    destructive: true,
                    onPress: () => setShowCancelModal(true),
                  },
                ]
              : []),
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category & Today Badges (CAL-06) */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.categoryBadge,
                { borderColor: event.categoryColor || '#3B82F6' },
              ]}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: event.categoryColor || '#3B82F6' },
                ]}
              />
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: event.categoryColor || '#3B82F6' },
                ]}
              >
                {event.category}
              </Text>
            </View>

            <View style={styles.todayBadge}>
              <View style={styles.todayDot} />
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          </View>

          {/* Event Title & Subtitle */}
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventSubtitle}>
            {`${event.formattedDate} · ${event.formattedTime}`}
          </Text>

          {/* Main Details Card (CAL-06) */}
          <View style={styles.mainCard}>
            {/* Row 1: Where */}
            {Boolean(event.location) && (
              <View style={styles.cardRow}>
                <View style={styles.rowIconCol}>
                  <Feather name="map-pin" size={18} color="#8A97AB" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Where</Text>
                  <Text style={styles.rowValue}>{event.location}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert('Map', `Opening directions to ${event.location}`);
                  }}
                >
                  <Text style={styles.mapLink}>Map</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Row 2: Going */}
            <TouchableOpacity
              style={[
                styles.cardRow,
                Boolean(event.location) && styles.cardRowDivider,
              ]}
              onPress={() => {
                if (activeGoingMembers.length > 0) {
                  setShowAttendeesModal(true);
                }
              }}
              activeOpacity={activeGoingMembers.length > 0 ? 0.7 : 1}
              accessibilityRole="button"
              accessibilityLabel={`Going: ${goingNamesText}`}
            >
              <View style={styles.rowIconCol}>
                <Feather name="users" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Going</Text>
                <View style={styles.goingRow}>
                  {activeGoingMembers.length > 0 ? (
                    <View style={styles.avatarsOverlap}>
                      {activeGoingMembers.slice(0, 3).map((member, idx) => (
                        <View
                          key={member.id || `going-${idx}`}
                          style={[
                            styles.goingAvatar,
                            {
                              backgroundColor: member.color || '#1F3A66',
                              marginLeft: idx > 0 ? -6 : 0,
                              zIndex: 10 - idx,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.goingAvatarText,
                              { color: member.textColor || '#FFFFFF' },
                            ]}
                          >
                            {member.initial || member.name[0].toUpperCase()}
                          </Text>
                        </View>
                      ))}
                      {activeGoingMembers.length > 3 && (
                        <View
                          style={[
                            styles.goingAvatar,
                            styles.avatarExtra,
                            { marginLeft: -6, zIndex: 6 },
                          ]}
                        >
                          <Text style={styles.avatarExtraText}>
                            +{activeGoingMembers.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.goingNamesText,
                      activeGoingMembers.length === 0 && styles.goingNamesEmpty,
                    ]}
                  >
                    {goingNamesText}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Row 3: For */}
            {Boolean(event.forMemberName) && (
              <View style={[styles.cardRow, styles.cardRowDivider]}>
                <View style={styles.rowIconCol}>
                  <Feather name="user" size={18} color="#8A97AB" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>For</Text>
                  <View style={styles.forRow}>
                    <View
                      style={[
                        styles.goingAvatar,
                        {
                          backgroundColor:
                            event.forMemberColor || '#493A12',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.goingAvatarText,
                          {
                            color:
                              event.forMemberTextColor || '#F2C14D',
                          },
                        ]}
                      >
                        {event.forMemberInitial || 'Aa'}
                      </Text>
                    </View>
                    <Text style={styles.forMemberText}>
                      {event.forMemberName}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color="#8A97AB" />
              </View>
            )}

            {/* Row 4: Reminders */}
            <View style={[styles.cardRow, styles.cardRowDivider]}>
              <View style={styles.rowIconCol}>
                <Feather name="bell" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Reminders</Text>
                <Text style={styles.rowValue}>{displayReminders}</Text>
              </View>
            </View>

            {/* Row 5: Repeat */}
            <View style={[styles.cardRow, styles.cardRowDivider]}>
              <View style={styles.rowIconCol}>
                <Feather name="repeat" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Repeat</Text>
                <Text style={styles.rowValue}>{displayRepeat}</Text>
              </View>
            </View>
          </View>

          {/* Source Card: Family Poll or Scanned WhatsApp/Circular (CAL-06) */}
          {Boolean(event.sourceNote) &&
            (() => {
              const isFamilyPoll = Boolean(
                event.sourceNote?.toLowerCase().includes('family poll') ||
                  event.notes?.toLowerCase().trim().startsWith('from the family poll:')
              );

              const findMatchingPoll = (
                candidates: PulsePollApiItem[]
              ): PulsePollApiItem | undefined => {
                if (event.sourcePollId) {
                  const byId = candidates.find((p) => p.id === event.sourcePollId);
                  if (byId) return byId;
                }
                const questionMatch = event.notes?.match(
                  /From the family poll:\s*(.+)/i
                )?.[1];
                if (questionMatch) {
                  const needle = questionMatch.trim().toLowerCase();
                  const byQuestion = candidates.find(
                    (p) => p.question?.trim().toLowerCase() === needle
                  );
                  if (byQuestion) return byQuestion;
                }
                const titleNeedle = event.title?.trim().toLowerCase();
                if (titleNeedle) {
                  return candidates.find((p) =>
                    p.options?.some(
                      (o) => o.label?.trim().toLowerCase() === titleNeedle
                    )
                  );
                }
                return undefined;
              };

              const handleOpenFamilyPoll = async () => {
                const cachedPool: PulsePollApiItem[] = [
                  ...(pulseState?.activePolls || []),
                  ...(pulseState?.closedPolls || []),
                  ...(pulseState?.home?.openPoll ? [pulseState.home.openPoll] : []),
                  ...(pulseState?.selectedPoll ? [pulseState.selectedPoll] : []),
                ];
                const immediateMatch = findMatchingPoll(cachedPool);
                if (immediateMatch) {
                  setResolvedPollId(immediateMatch.id);
                  dispatch(setSelectedPollLocal(immediateMatch));
                  setShowPollResults(true);
                  if (!isJestTestEnv() && isUUID(immediateMatch.id)) {
                    dispatch(fetchPollResultsThunk(immediateMatch.id));
                  }
                  return;
                }

                if (isJestTestEnv()) {
                  setShowFamilyPolls(true);
                  return;
                }

                setResolvingPoll(true);
                setResolvedPollId(event.sourcePollId || null);
                setShowPollResults(true);
                try {
                  const [activeRes, closedRes] = await Promise.all([
                    dispatch(fetchPollsThunk({ status: 'ACTIVE', limit: 50 })).unwrap(),
                    dispatch(fetchPollsThunk({ status: 'CLOSED', limit: 50 })).unwrap(),
                  ]);
                  const allFetched = [
                    ...(activeRes?.data?.polls || []),
                    ...(closedRes?.data?.polls || []),
                  ];
                  const resolved = findMatchingPoll(allFetched);
                  if (resolved) {
                    setResolvedPollId(resolved.id);
                    dispatch(setSelectedPollLocal(resolved));
                    if (isUUID(resolved.id)) {
                      await dispatch(fetchPollResultsThunk(resolved.id)).unwrap();
                    }
                  } else {
                    setShowPollResults(false);
                    setShowFamilyPolls(true);
                  }
                } catch {
                  setShowPollResults(false);
                  setShowFamilyPolls(true);
                } finally {
                  setResolvingPoll(false);
                }
              };

              if (isFamilyPoll) {
                return (
                  <TouchableOpacity
                    style={styles.sourceCard}
                    onPress={handleOpenFamilyPoll}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="View family poll"
                  >
                    <Feather
                      name="bar-chart-2"
                      size={18}
                      color="#F0913A"
                      style={styles.sourceIcon}
                    />
                    <Text style={styles.sourceText}>{event.sourceNote}</Text>
                    <Text style={styles.sourceViewLink}>View</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <View style={styles.sourceCard}>
                  <Feather
                    name="maximize"
                    size={18}
                    color="#F0913A"
                    style={styles.sourceIcon}
                  />
                  <Text style={styles.sourceText}>{event.sourceNote}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Scanned Circular', event.sourceNote);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sourceViewLink}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

          {/* RSVP Attendance Card (CAL-06) - shown to everyone who is invited */}
          {canShowRsvpCard && (
            <View style={styles.rsvpCard}>
              <View style={styles.rsvpHeaderRow}>
                <Feather name="user-check" size={16} color="#CAD4DF" />
                <Text style={styles.rsvpHeaderTitle}>Are you going?</Text>
                {effectiveMyResponse && (
                  <Text
                    style={[
                      styles.rsvpStatusBadge,
                      effectiveMyResponse === 'GOING'
                        ? styles.rsvpStatusGoing
                        : styles.rsvpStatusNotGoing,
                    ]}
                  >
                    {effectiveMyResponse === 'GOING'
                      ? 'You said Going'
                      : 'You said Not Going'}
                  </Text>
                )}
              </View>
              <View style={styles.rsvpButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.rsvpBtn,
                    styles.rsvpBtnGoing,
                    effectiveMyResponse === 'GOING' && styles.rsvpBtnActiveGoing,
                  ]}
                  onPress={() => handleRsvpSelect('GOING')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Respond Going"
                >
                  <Feather
                    name="check"
                    size={16}
                    color={effectiveMyResponse === 'GOING' ? '#FFFFFF' : '#10B981'}
                  />
                  <Text
                    style={[
                      styles.rsvpBtnText,
                      effectiveMyResponse === 'GOING' && styles.rsvpBtnTextActive,
                    ]}
                  >
                    Going
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpBtn,
                    styles.rsvpBtnNotGoing,
                    effectiveMyResponse === 'NOT_GOING' &&
                      styles.rsvpBtnActiveNotGoing,
                  ]}
                  onPress={() => handleRsvpSelect('NOT_GOING')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Respond Not Going"
                >
                  <Feather
                    name="x"
                    size={16}
                    color={
                      effectiveMyResponse === 'NOT_GOING' ? '#FFFFFF' : '#EF4444'
                    }
                  />
                  <Text
                    style={[
                      styles.rsvpBtnText,
                      effectiveMyResponse === 'NOT_GOING' &&
                        styles.rsvpBtnTextActive,
                    ]}
                  >
                    Not Going
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* NOTES Card (CAL-06) */}
          {Boolean(event.notes) && (
            <View style={styles.notesCard}>
              <Text style={styles.notesHeader}>NOTES</Text>
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Buttons (CAL-06) */}
        <View style={styles.bottomBar}>
          {event.canEdit !== false && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setIsMenuOpen(false);
                setShowEditModal(true);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Edit event"
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.directionsBtn,
              event.canEdit === false && { flex: 1 },
            ]}
            onPress={() => {
              Alert.alert(
                'Directions',
                `Getting directions to ${event.location || 'destination'}`
              );
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Get directions"
          >
            <Feather name="navigation" size={16} color="#FFFFFF" />
            <Text style={styles.directionsBtnText}>Get directions</Text>
          </TouchableOpacity>
        </View>

        {/* Attendees Modal Sheet */}
        <Modal
          visible={showAttendeesModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAttendeesModal(false)}
        >
          <View style={styles.attendeesOverlay}>
            <TouchableOpacity
              style={styles.attendeesBackdrop}
              onPress={() => setShowAttendeesModal(false)}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Close attendees modal"
            />
            <View
              style={[
                styles.attendeesSheet,
                { paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              <View style={styles.attendeesHandle} />
              <View style={styles.attendeesHeader}>
                <Text style={styles.attendeesTitle}>Who’s going</Text>
                <Text style={styles.attendeesSubtitle}>
                  {activeGoingMembers.length}{' '}
                  {activeGoingMembers.length === 1 ? 'person is' : 'people are'}{' '}
                  attending
                </Text>
              </View>
              <ScrollView style={styles.attendeesList}>
                {activeGoingMembers.map((m) => (
                  <View key={m.id} style={styles.attendeeItem}>
                    <View
                      style={[
                        styles.attendeeAvatar,
                        { backgroundColor: m.color || '#1F3A66' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.attendeeAvatarText,
                          { color: m.textColor || '#FFFFFF' },
                        ]}
                      >
                        {m.initial || m.name[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.attendeeName}>
                      {m.name === 'You' || (myMemberId && m.id === myMemberId)
                        ? `${m.name} (you)`
                        : m.name}
                    </Text>
                    <View style={styles.attendeeGoingBadge}>
                      <Feather name="check" size={14} color="#10B981" />
                      <Text style={styles.attendeeGoingBadgeText}>Going</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.attendeesDoneBtn}
                onPress={() => setShowAttendeesModal(false)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Close attendees sheet"
              >
                <Text style={styles.attendeesDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit Event Modal Overlay (CAL-09 / CAL-10) */}
        {showEditModal && (
          <CreateEventModal
            visible={showEditModal}
            eventToEdit={cachedEvent || event}
            members={members}
            onClose={() => setShowEditModal(false)}
            onSaveEvent={handleSaveEditedEvent}
            onDeleteEvent={() => {
              setShowEditModal(false);
              handleClose();
              onCancelEvent(cachedEvent || event);
            }}
            asModal={false}
          />
        )}

        {/* Cancel Event Dialog Overlay (CAL-08) */}
        <CancelEventModal
          visible={showCancelModal}
          event={cachedEvent || event}
          onClose={() => setShowCancelModal(false)}
          onConfirmCancel={(id, note) => {
            setShowCancelModal(false);
            handleClose();
            onCancelEvent(cachedEvent || event, note);
          }}
          asModal={false}
        />

        {/* Comments Screen Overlay (CAL-07) */}
        {showComments && (
          <EventCommentsModal
            visible={showComments}
            event={cachedEvent || event}
            onClose={() => setShowComments(false)}
            onAddComment={handleLocalAddComment}
            asModal={false}
          />
        )}

        {/* Linked Family Poll Results Overlay */}
        <PollResultsModal
          visible={showPollResults}
          asModal={false}
          pollId={resolvedPollId}
          externalLoading={resolvingPoll}
          onClose={() => {
            setShowPollResults(false);
            setResolvingPoll(false);
          }}
          onBrowseAllPolls={() => {
            setShowPollResults(false);
            setShowFamilyPolls(true);
          }}
        />

        {/* Fallback Family Polls Overlay if poll question/ID changed */}
        <FamilyPollsModal
          visible={showFamilyPolls}
          asModal={false}
          onClose={() => setShowFamilyPolls(false)}
          onOpenPollResults={(pickedPoll) => {
            setShowFamilyPolls(false);
            setResolvedPollId(pickedPoll.id);
            setShowPollResults(true);
          }}
        />
      </View>
    </Modal>
  );
};

export default EventDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 20,
    width: 210,
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingVertical: 6,
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  dropdownItemTextDestructive: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#EF4444',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    backgroundColor: 'transparent',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0913A',
    marginRight: 6,
  },
  todayBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
  eventTitle: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  eventSubtitle: {
    fontSize: 15,
    color: '#8A97AB',
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  cardRowDivider: {
    borderTopWidth: 1,
    borderColor: '#1F3352',
  },
  rowIconCol: {
    width: 24,
    alignItems: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  mapLink: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
    marginLeft: 10,
  },
  goingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goingAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarExtra: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#122440',
  },
  avatarExtraText: {
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
  },
  goingNamesEmpty: {
    color: '#8A97AB',
    fontFamily: 'Roboto-Regular',
  },
  goingAvatarText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  goingNamesText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  forRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  forMemberText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sourceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#73543D',
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sourceIcon: {
    marginRight: 10,
  },
  sourceText: {
    fontSize: 13,
    color: '#CAD4DF',
    flex: 1,
    lineHeight: 18,
  },
  sourceViewLink: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
    marginLeft: 10,
  },
  notesCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 20,
  },
  notesHeader: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.1,
  },
  notesText: {
    fontSize: 14,
    color: '#CAD4DF',
    marginTop: 8,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderColor: '#1F3352',
  },
  editBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  directionsBtn: {
    flex: 1.6,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  directionsBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  rsvpCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  rsvpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rsvpHeaderTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    flex: 1,
  },
  rsvpStatusBadge: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rsvpStatusGoing: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  rsvpStatusNotGoing: {
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  rsvpButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    backgroundColor: '#0F2036',
    borderColor: '#1F3352',
  },
  rsvpBtnGoing: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rsvpBtnNotGoing: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rsvpBtnActiveGoing: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rsvpBtnActiveNotGoing: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  rsvpBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  rsvpBtnTextActive: {
    color: '#FFFFFF',
  },
  attendeesOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  attendeesBackdrop: {
    flex: 1,
  },
  attendeesSheet: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '60%',
  },
  attendeesHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334E68',
    alignSelf: 'center',
    marginBottom: 16,
  },
  attendeesHeader: {
    marginBottom: 16,
  },
  attendeesTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  attendeesSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
  },
  attendeesList: {
    maxHeight: 260,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1F3352',
  },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeAvatarText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  attendeeName: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
  attendeeGoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attendeeGoingBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#10B981',
  },
  attendeesDoneBtn: {
    height: 48,
    backgroundColor: '#F0913A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  attendeesDoneText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
