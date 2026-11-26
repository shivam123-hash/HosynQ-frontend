export interface TripMember {
  id: string;
  name: string;
  initial: string;
  color: string;
  selected?: boolean;
  isYou?: boolean;
}

export interface TripAvailabilityDay {
  day: number;
  status: 'free' | 'busy' | 'best';
}

export interface MemberAvailability {
  memberId: string;
  initial: string;
  color: string;
  days: TripAvailabilityDay[];
}

export type UiBookingType =
  | 'train'
  | 'flight'
  | 'bus'
  | 'cab'
  | 'hotel'
  | 'other'
  | 'document';

export interface BookingItem {
  id: string;
  title: string;
  subtitle: string;
  reminder?: string;
  remindOn?: string | null;
  status?: 'PENDING' | 'DONE' | 'NOT_NEEDED';
  isBooked: boolean;
  type: UiBookingType;
}

export interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'check' | 'not_needed' | 'ready';
  type: 'id' | 'visa' | 'passport';
}

export interface TripPackingItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'shared' | 'kids' | 'personal';
  assignedTo: string;
  assignedMemberId?: string | null;
  assignedInitial: string;
  assignedBg: string;
  isPacked: boolean;
}

export interface TripData {
  id: string;
  name?: string;
  destination: string;
  startsOn?: string | null;
  endsOn?: string | null;
  days?: number | null;
  daysLeft?: number | null;
  datesText: string;
  durationText: string;
  leaveDate: string;
  returnDate: string;
  members: TripMember[];
  addToCalendar: boolean;
  eventId?: string | null;
  hasPackingList?: boolean;
  packingListId?: string | null;
  packingListName?: string | null;
  packingTotalItems?: number;
  packingPackedItems?: number;
  step1Done?: boolean;
  step2Done?: boolean;
  bookingsTotalCount?: number;
  bookingsDoneCount?: number;
  bookings: BookingItem[];
  documents: DocumentItem[];
  packingItems: TripPackingItem[];
  cancelledAt?: string | null;
}
