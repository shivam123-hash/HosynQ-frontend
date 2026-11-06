import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { BookingItem, DocumentItem } from './types';

export interface TripBookingsModalProps {
  visible?: boolean;
  asModal?: boolean;
  bookings: BookingItem[];
  documents: DocumentItem[];
  onClose: () => void;
  onUpdateBookings?: (bookings: BookingItem[]) => void;
}

export const TripBookingsModal: React.FC<TripBookingsModalProps> = ({
  visible = true,
  asModal = true,
  bookings: initialBookings,
  documents,
  onClose,
  onUpdateBookings,
}) => {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);

  const toggleBooked = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, isBooked: !b.isBooked } : b
    );
    setBookings(updated);
    if (onUpdateBookings) onUpdateBookings(updated);
  };

  const renderBookingIcon = (type: BookingItem['type'], hasOrangeBorder: boolean) => {
    let iconName: 'train-outline' | 'bed-outline' | 'car-outline' | 'airplane-outline' | 'bookmark-outline' = 'bookmark-outline';
    if (type === 'train') iconName = 'train-outline';
    else if (type === 'hotel') iconName = 'bed-outline';
    else if (type === 'cab') iconName = 'car-outline';
    else if (type === 'flight') iconName = 'airplane-outline';

    return (
      <View
        style={[
          styles.iconCircle,
          hasOrangeBorder && styles.iconCircleOrange,
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={hasOrangeBorder ? '#F0913A' : '#8A97AB'}
        />
      </View>
    );
  };

  const renderDocIcon = (type: DocumentItem['type']) => {
    let iconName: 'card-outline' | 'globe-outline' | 'document-text-outline' = 'document-text-outline';
    if (type === 'id') iconName = 'card-outline';
    else if (type === 'visa') iconName = 'globe-outline';

    return (
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={18} color="#8A97AB" />
      </View>
    );
  };

  const content = (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom || 16 },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bookings</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Track what’s booked. We’ll remind you about the rest.
        </Text>

        {/* Bookings Card */}
        <View style={styles.groupedCard}>
          {bookings.map((booking, index) => {
            const isTrain = booking.type === 'train';
            return (
              <View key={booking.id}>
                {index > 0 && <View style={styles.itemDivider} />}
                <View style={styles.bookingItemRow}>
                  {renderBookingIcon(booking.type, isTrain && !booking.isBooked)}

                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{booking.title}</Text>
                    <Text style={styles.itemSubtitle}>{booking.subtitle}</Text>

                    {booking.reminder ? (
                      <View style={styles.reminderRow}>
                        <Ionicons
                          name="notifications-outline"
                          size={12}
                          color="#8A97AB"
                          style={styles.bellIcon}
                        />
                        <Text style={styles.reminderText}>{booking.reminder}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Right column: Status badge & Toggle action */}
                  <View style={styles.rightActionCol}>
                    {booking.isBooked ? (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedBadgeText}>Booked</Text>
                      </View>
                    ) : isTrain ? (
                      <View style={styles.orangeNotBookedBadge}>
                        <Text style={styles.orangeNotBookedText}>Not booked</Text>
                      </View>
                    ) : (
                      <View style={styles.slateNotBookedBadge}>
                        <Text style={styles.slateNotBookedText}>Not booked</Text>
                      </View>
                    )}

                    {!booking.isBooked && (
                      <TouchableOpacity
                        style={styles.markBookedBtn}
                        onPress={() => toggleBooked(booking.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${booking.title} booked`}
                      >
                        <Text style={styles.markBookedText}>Mark booked</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* DOCUMENTS Section */}
        <Text style={styles.sectionHeader}>DOCUMENTS</Text>

        <View style={styles.groupedCard}>
          {documents.map((doc, index) => (
            <View key={doc.id}>
              {index > 0 && <View style={styles.itemDivider} />}
              <View style={styles.bookingItemRow}>
                {renderDocIcon(doc.type)}

                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{doc.title}</Text>
                  <Text style={styles.itemSubtitle}>{doc.subtitle}</Text>
                </View>

                <View style={styles.rightActionCol}>
                  {doc.status === 'not_needed' ? (
                    <View style={styles.notNeededBadge}>
                      <Text style={styles.notNeededBadgeText}>Not needed</Text>
                    </View>
                  ) : (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkBadgeText}>Check</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Dashed Add Booking Button */}
        <TouchableOpacity
          style={styles.dashedAddBtn}
          activeOpacity={0.75}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Add a booking or reminder"
        >
          <Feather name="plus" size={18} color="#F0913A" style={styles.plusIcon} />
          <Text style={styles.dashedAddText}>Add a booking or reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8A97AB',
    lineHeight: 22,
    marginBottom: 20,
  },
  groupedCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#162843',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleOrange: {
    borderWidth: 1.5,
    borderColor: '#F0913A',
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bellIcon: {
    marginRight: 4,
  },
  reminderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A97AB',
  },
  rightActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookedBadge: {
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookedBadgeText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '600',
  },
  orangeNotBookedBadge: {
    borderWidth: 1,
    borderColor: '#F0913A',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orangeNotBookedText: {
    color: '#F0913A',
    fontSize: 12,
    fontWeight: '600',
  },
  slateNotBookedBadge: {
    borderWidth: 1,
    borderColor: '#2C3E55',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slateNotBookedText: {
    color: '#CAD4DF',
    fontSize: 12,
    fontWeight: '600',
  },
  markBookedBtn: {
    marginTop: 8,
    paddingVertical: 2,
  },
  markBookedText: {
    color: '#F0913A',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  checkBadge: {
    borderWidth: 1,
    borderColor: '#2C3E55',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  checkBadgeText: {
    color: '#CAD4DF',
    fontSize: 12,
    fontWeight: '600',
  },
  notNeededBadge: {
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  notNeededBadgeText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '600',
  },
  dashedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    borderRadius: 28,
    height: 56,
    marginTop: 22,
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
  },
  plusIcon: {
    marginRight: 8,
  },
  dashedAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
  },
});
export default TripBookingsModal;

