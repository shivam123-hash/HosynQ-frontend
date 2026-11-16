export interface TripMember {
  id: string;
  name: string;
  initial: string;
  color: string;
  selected?: boolean;
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

export interface BookingItem {
  id: string;
  title: string;
  subtitle: string;
  reminder?: string;
  isBooked: boolean;
  type: 'train' | 'hotel' | 'cab' | 'flight' | 'other';
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
  assignedInitial: string;
  assignedBg: string;
  isPacked: boolean;
}

export interface TripData {
  id: string;
  destination: string;
  datesText: string;
  durationText: string;
  leaveDate: string;
  returnDate: string;
  members: TripMember[];
  addToCalendar: boolean;
  step1Done?: boolean;
  step2Done?: boolean;
  bookings: BookingItem[];
  documents: DocumentItem[];
  packingItems: TripPackingItem[];
}

