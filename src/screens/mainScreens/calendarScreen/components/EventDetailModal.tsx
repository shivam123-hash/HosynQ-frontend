import React, { useState, useEffect } from 'react';
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
import { CalendarEvent, EventComment } from '../types';
import CancelEventModal from './CancelEventModal';
import EventCommentsModal from './EventCommentsModal';

export interface EventDetailModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onOpenComments: (event: CalendarEvent) => void;
  onCancelEvent: (event: CalendarEvent) => void;
  onAddComment?: (eventId: string, commentText: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  event: eventProp,
  onClose,
  onEditEvent,
  onOpenComments,
  onCancelEvent,
  onAddComment,
}) => {
  const insets = useSafeAreaInsets();
  const [cachedEvent, setCachedEvent] = useState<CalendarEvent | null>(
    eventProp
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
    }
  }, [visible]);

  const event = eventProp || cachedEvent;

  if (!event) return null;

  const handleClose = () => {
    setIsMenuOpen(false);
    setShowComments(false);
    onClose();
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
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
      prev ? { ...prev, comments: [...prev.comments, newComment] } : null
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
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color="#CAD4DF" />
          </TouchableOpacity>
        </View>

        {/* Dropdown Options Menu */}
        {isMenuOpen && (
          <>
            <Pressable
              style={styles.menuBackdrop}
              onPress={() => setIsMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Dismiss options menu"
            />
            <View style={[styles.dropdownMenu, { top: insets.top + 58 }]}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  setShowComments(true);
                  onOpenComments(event);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Comments, ${event.comments.length} comments`}
              >
                <Feather
                  name="message-square"
                  size={16}
                  color="#8A97AB"
                  style={styles.dropdownIcon}
                />
                <Text style={styles.dropdownItemText}>
                  Comments ({event.comments.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  onEditEvent(event);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Edit Event"
              >
                <Feather
                  name="edit-2"
                  size={16}
                  color="#8A97AB"
                  style={styles.dropdownIcon}
                />
                <Text style={styles.dropdownItemText}>Edit Event</Text>
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  setShowCancelModal(true);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Cancel Event"
              >
                <Feather
                  name="trash-2"
                  size={16}
                  color="#EF4444"
                  style={styles.dropdownIcon}
                />
                <Text style={styles.dropdownItemTextDestructive}>
                  Cancel Event
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

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
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
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
            <View
              style={[
                styles.cardRow,
                Boolean(event.location) && styles.cardRowDivider,
              ]}
            >
              <View style={styles.rowIconCol}>
                <Feather name="users" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Going</Text>
                <View style={styles.goingRow}>
                  <View style={styles.avatarsOverlap}>
                    <View style={[styles.goingAvatar, styles.avatarRohan]}>
                      <Text style={[styles.goingAvatarText, styles.avatarRohanText]}>
                        R
                      </Text>
                    </View>
                    <View style={[styles.goingAvatar, styles.avatarPriya]}>
                      <Text style={[styles.goingAvatarText, styles.avatarPriyaText]}>
                        P
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.goingNamesText}>Rohan and you</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>

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
                <Text style={styles.rowValue}>{event.reminders}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>

            {/* Row 5: Repeat */}
            <View style={[styles.cardRow, styles.cardRowDivider]}>
              <View style={styles.rowIconCol}>
                <Feather name="repeat" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Repeat</Text>
                <Text style={styles.rowValue}>{event.repeat}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>
          </View>

          {/* Scanned WhatsApp/Circular Source Card (CAL-06) */}
          {Boolean(event.sourceNote) && (
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
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEditEvent(event)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Edit event"
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.directionsBtn}
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

        {/* Cancel Event Dialog Overlay (CAL-08) */}
        <CancelEventModal
          visible={showCancelModal}
          event={event}
          onClose={() => setShowCancelModal(false)}
          onConfirmCancel={() => {
            setShowCancelModal(false);
            onCancelEvent(event);
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
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#CAD4DF',
  },
  dropdownItemTextDestructive: {
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F0913A',
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
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
    fontWeight: '600',
    color: '#F0913A',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapLink: {
    fontSize: 14,
    fontWeight: '600',
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
  avatarRohan: {
    backgroundColor: '#1F3A66',
    zIndex: 2,
  },
  avatarRohanText: {
    color: '#8DB8F5',
  },
  avatarPriya: {
    backgroundColor: '#4A2E1A',
    marginLeft: -6,
    zIndex: 1,
  },
  avatarPriyaText: {
    color: '#F7C08E',
  },
  avatarAarav: {
    backgroundColor: '#493A12',
  },
  avatarAaravText: {
    color: '#F2C14D',
  },
  goingAvatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  goingNamesText: {
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    backgroundColor: '#122440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
