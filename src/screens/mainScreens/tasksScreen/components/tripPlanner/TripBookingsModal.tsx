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

import { Colors, Fonts, Typography } from '../../../../../units';

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
          color={hasOrangeBorder ? Colors.primary : Colors.textSecondaryMuted}
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
        <Ionicons name={iconName} size={18} color={Colors.textSecondaryMuted} />
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
          <Feather name="chevron-left" size={24} color={Colors.white} />
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
                          color={Colors.textSecondaryMuted}
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
          <Feather name="plus" size={18} color={Colors.primary} style={styles.plusIcon} />
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
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
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.light,
    color: Colors.textSecondaryMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  groupedCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
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
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tripBookingCardBg,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleOrange: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  itemSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
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
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookedBadge: {
    borderWidth: 1,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookedBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  orangeNotBookedBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orangeNotBookedText: {
    color: Colors.primary,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  slateNotBookedBadge: {
    borderWidth: 1,
    borderColor: Colors.tripItemBorder,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slateNotBookedText: {
    color: Colors.textLightMutedAlt,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  markBookedBtn: {
    marginTop: 8,
    paddingVertical: 2,
  },
  markBookedText: {
    color: Colors.primary,
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.bold,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  checkBadge: {
    borderWidth: 1,
    borderColor: Colors.tripItemBorder,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  checkBadgeText: {
    color: Colors.textLightMutedAlt,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  notNeededBadge: {
    borderWidth: 1,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  notNeededBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  dashedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 28,
    height: 56,
    marginTop: 22,
    backgroundColor: Colors.transparent,
  },
  plusIcon: {
    marginRight: 8,
  },
  dashedAddText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
export default TripBookingsModal;

