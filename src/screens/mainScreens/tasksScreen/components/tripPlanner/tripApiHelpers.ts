import {
  BookingKind,
  TripApiMember,
  TripBookingApiItem,
  TripDetailApiItem,
  TripSummaryApiItem,
} from '../../../../../services/tripServices';
import { ListDetailData, ListItemData } from '../../../../../services/listsServices';
import { Colors } from '../../../../../units';
import {
  BookingItem,
  DocumentItem,
  TripData,
  TripMember,
  TripPackingItem,
  UiBookingType,
} from './types';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const AVATAR_PALETTE = [
  Colors.amberBrown,
  Colors.royalBlue,
  Colors.vibrantPurple,
  Colors.amberAccent,
  Colors.emerald,
];

export const isJestTestEnv = (): boolean =>
  typeof (globalThis as any)?.process !== 'undefined' &&
  Boolean((globalThis as any).process?.env?.JEST_WORKER_ID);

export const parseIsoDateLocal = (iso?: string | null): Date | null => {
  if (!iso || typeof iso !== 'string') return null;
  const clean = iso.includes('T') ? iso.split('T')[0] : iso.trim();
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const toIsoDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDaysIso = (iso: string, offset: number): string => {
  const base = parseIsoDateLocal(iso) || new Date();
  const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
  return toIsoDateString(copy);
};

export const formatShortDateLabel = (iso?: string | null): string => {
  const d = parseIsoDateLocal(iso);
  if (!d) return 'Select date';
  return `${SHORT_DAYS[d.getDay()]}, ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
};

export const formatTripDateRange = (
  startsOn?: string | null,
  endsOn?: string | null
): string => {
  const start = parseIsoDateLocal(startsOn);
  const end = parseIsoDateLocal(endsOn);
  if (!start && !end) return 'Dates not set';
  if (start && !end) {
    return `${SHORT_DAYS[start.getDay()]} ${start.getDate()} ${SHORT_MONTHS[start.getMonth()]}`;
  }
  if (!start || !end) return 'Dates not set';

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${SHORT_DAYS[start.getDay()]} ${start.getDate()} – ${SHORT_DAYS[end.getDay()]} ${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
  }
  return `${SHORT_DAYS[start.getDay()]} ${start.getDate()} ${SHORT_MONTHS[start.getMonth()]} – ${SHORT_DAYS[end.getDay()]} ${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
};

export const formatCompactBannerDates = (
  startsOn?: string | null,
  endsOn?: string | null
): string => {
  const start = parseIsoDateLocal(startsOn);
  const end = parseIsoDateLocal(endsOn);
  if (!start) return 'Pick dates';
  if (!end) return `${start.getDate()} ${SHORT_MONTHS[start.getMonth()]}`;
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
  }
  return `${start.getDate()} ${SHORT_MONTHS[start.getMonth()]}–${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
};

export const calculateTripDays = (
  startsOn?: string | null,
  endsOn?: string | null
): number => {
  const start = parseIsoDateLocal(startsOn);
  const end = parseIsoDateLocal(endsOn);
  if (!start || !end) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
};

export const mapBookingKindToUi = (kind?: string | null): UiBookingType => {
  switch ((kind || '').toUpperCase()) {
    case 'TRAIN':
      return 'train';
    case 'FLIGHT':
      return 'flight';
    case 'BUS':
      return 'bus';
    case 'CAB':
      return 'cab';
    case 'HOTEL':
      return 'hotel';
    case 'DOCUMENT':
      return 'document';
    default:
      return 'other';
  }
};

export const mapUiBookingTypeToApi = (type?: UiBookingType | string | null): BookingKind => {
  switch ((type || '').toLowerCase()) {
    case 'train':
      return 'TRAIN';
    case 'flight':
      return 'FLIGHT';
    case 'bus':
      return 'BUS';
    case 'cab':
      return 'CAB';
    case 'hotel':
      return 'HOTEL';
    case 'document':
      return 'DOCUMENT';
    default:
      return 'OTHER';
  }
};

export const mapApiBookingToUi = (b: TripBookingApiItem): BookingItem => ({
  id: b.id,
  title: b.title,
  subtitle: b.details || b.kind || '',
  reminder: b.remindOn ? `Reminder ${formatShortDateLabel(b.remindOn)}` : undefined,
  remindOn: b.remindOn || null,
  status: b.status || 'PENDING',
  isBooked: b.status === 'DONE',
  type: mapBookingKindToUi(b.kind),
});

export const extractTripMembersFromFamilyState = (familyState: any): TripMember[] => {
  const candidates = [
    familyState?.basicFamilyData?.members,
    familyState?.basicFamilyData?.family?.members,
    familyState?.myFamilyData?.family?.members,
    familyState?.myFamilyData?.members,
    familyState?.family?.members,
  ];
  const rawList = candidates.find((c) => Array.isArray(c) && c.length > 0) || [];
  return rawList.map((m: any, idx: number) => {
    const fullName = (m.fullName || m.name || 'Member').trim();
    const firstName = fullName.split(' ')[0] || fullName;
    const id = String(m.memberId || m.id || m.userId || `m-${idx}`);
    return {
      id,
      name: firstName,
      initial: (firstName[0] || 'M').toUpperCase(),
      color: m.avatarColor || m.color || AVATAR_PALETTE[idx % AVATAR_PALETTE.length],
      selected: true,
      isYou: Boolean(m.isYou),
    };
  });
};

export const mapApiMemberToTripMember = (
  m: TripApiMember,
  idx: number,
  selected = true
): TripMember => {
  const fullName = (m.fullName || 'Member').trim();
  const firstName = fullName.split(' ')[0] || fullName;
  return {
    id: m.memberId,
    name: firstName,
    initial: (firstName[0] || 'M').toUpperCase(),
    color: m.avatarColor || AVATAR_PALETTE[idx % AVATAR_PALETTE.length],
    selected,
    isYou: Boolean(m.isYou),
  };
};

export const createEmptyTripData = (familyMembers: TripMember[] = []): TripData => ({
  id: '',
  name: '',
  destination: '',
  startsOn: null,
  endsOn: null,
  days: null,
  daysLeft: null,
  datesText: 'Pick dates',
  durationText: 'Duration not set',
  leaveDate: 'Select date',
  returnDate: 'Select date',
  members: familyMembers.map((m) => ({ ...m, selected: m.selected !== false })),
  addToCalendar: true,
  eventId: null,
  hasPackingList: false,
  packingListId: null,
  packingListName: null,
  packingTotalItems: 0,
  packingPackedItems: 0,
  step1Done: false,
  step2Done: false,
  bookingsTotalCount: 0,
  bookingsDoneCount: 0,
  bookings: [],
  documents: [],
  packingItems: [],
  cancelledAt: null,
});

export const mapApiTripToUiTrip = (
  apiTrip: TripSummaryApiItem | TripDetailApiItem,
  familyMembers: TripMember[] = [],
  existingPackingItems: TripPackingItem[] = []
): TripData => {
  const detail = apiTrip as TripDetailApiItem;
  const summary = apiTrip as TripSummaryApiItem;
  const goingList = apiTrip.goingMembers || [];
  const goingIds = new Set(goingList.map((g) => g.memberId));

  const members: TripMember[] =
    familyMembers.length > 0
      ? familyMembers.map((m) => ({
          ...m,
          selected: goingIds.size > 0 ? goingIds.has(m.id) : true,
        }))
      : goingList.map((m, idx) => mapApiMemberToTripMember(m, idx, true));

  const rawBookings = Array.isArray(detail.bookings) ? detail.bookings : [];
  const allMappedBookings = rawBookings.map(mapApiBookingToUi);
  const regularBookings = allMappedBookings.filter((b) => b.type !== 'document');

  const docBookings: DocumentItem[] = allMappedBookings
    .filter((b) => b.type === 'document')
    .map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      status:
        b.status === 'NOT_NEEDED'
          ? 'not_needed'
          : b.status === 'DONE'
          ? 'ready'
          : 'check',
      type: b.title.toLowerCase().includes('visa')
        ? 'visa'
        : b.title.toLowerCase().includes('passport')
        ? 'passport'
        : 'id',
    }));

  const apiDocs: DocumentItem[] = Array.isArray(detail.documents)
    ? detail.documents.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.subtitle || d.details || '',
        status:
          d.status === 'NOT_NEEDED' || d.status === 'not_needed'
            ? 'not_needed'
            : d.status === 'DONE' || d.status === 'ready'
            ? 'ready'
            : 'check',
        type: d.type || 'id',
      }))
    : [];

  const documents = apiDocs.length > 0 ? apiDocs : docBookings;

  const daysNum =
    apiTrip.days || calculateTripDays(apiTrip.startsOn, apiTrip.endsOn) || 0;
  const packingListId =
    detail.packingList?.id ||
    detail.packingListId ||
    summary.packingListId ||
    null;
  const hasPackingList = Boolean(
    packingListId || summary.hasPackingList || detail.hasPackingList
  );

  const hasDates = Boolean(apiTrip.startsOn && apiTrip.endsOn);
  const hasDestination = Boolean(apiTrip.destination || apiTrip.name);

  const rawPackingList: any = detail.packingList;
  const apiTotalItems =
    rawPackingList?.totalItems ??
    rawPackingList?.itemCount ??
    rawPackingList?.counts?.total;
  const apiPackedItems =
    rawPackingList?.packedItems ??
    rawPackingList?.packedCount ??
    rawPackingList?.doneCount ??
    rawPackingList?.counts?.done;
  const packingTotalItems =
    existingPackingItems.length > 0
      ? existingPackingItems.length
      : (apiTotalItems ?? 0);
  const packingPackedItems =
    existingPackingItems.length > 0
      ? existingPackingItems.filter((i) => i.isPacked).length
      : (apiPackedItems ?? 0);

  const rawTrip: any = apiTrip;
  const bookingsTotalCount = Array.isArray(detail.bookings)
    ? regularBookings.length
    : typeof summary.bookingsCount === 'number'
    ? summary.bookingsCount
    : typeof rawTrip.bookings?.total === 'number'
    ? rawTrip.bookings.total
    : typeof rawTrip.bookingCount === 'number'
    ? rawTrip.bookingCount
    : undefined;
  const bookingsDoneCount = Array.isArray(detail.bookings)
    ? regularBookings.filter((b) => b.isBooked).length
    : typeof summary.bookingsDoneCount === 'number'
    ? summary.bookingsDoneCount
    : typeof rawTrip.bookings?.done === 'number'
    ? rawTrip.bookings.done
    : typeof rawTrip.bookedCount === 'number'
    ? rawTrip.bookedCount
    : undefined;

  return {
    id: apiTrip.id,
    name: apiTrip.name,
    destination: apiTrip.destination || apiTrip.name || '',
    startsOn: apiTrip.startsOn,
    endsOn: apiTrip.endsOn,
    days: daysNum || null,
    daysLeft: apiTrip.daysLeft ?? null,
    datesText: formatTripDateRange(apiTrip.startsOn, apiTrip.endsOn),
    durationText: daysNum > 0 ? `${daysNum} day${daysNum === 1 ? '' : 's'}` : 'Duration not set',
    leaveDate: formatShortDateLabel(apiTrip.startsOn),
    returnDate: formatShortDateLabel(apiTrip.endsOn),
    members,
    addToCalendar: apiTrip.addToCalendar ?? true,
    eventId: detail.eventId || null,
    hasPackingList,
    packingListId,
    packingListName: detail.packingList?.name || null,
    packingTotalItems,
    packingPackedItems,
    step1Done: hasDates,
    step2Done: hasDates && hasDestination,
    bookingsTotalCount,
    bookingsDoneCount,
    bookings: regularBookings,
    documents,
    packingItems: existingPackingItems,
    cancelledAt: apiTrip.cancelledAt || null,
  };
};

export const mapApiListItemToPackingItem = (
  item: ListItemData,
  idx = 0
): TripPackingItem => {
  const assigneeName = item.assignedTo?.fullName || '';
  const firstName = assigneeName ? assigneeName.split(' ')[0] : '';
  const initial = firstName ? firstName[0].toUpperCase() : '';
  return {
    id: item.id,
    title: item.name,
    subtitle: item.note || undefined,
    category: firstName ? 'personal' : 'shared',
    assignedTo: firstName || 'Shared',
    assignedMemberId: item.assignedTo?.memberId || null,
    assignedInitial: initial,
    assignedBg:
      item.assignedTo?.avatarColor ||
      AVATAR_PALETTE[idx % AVATAR_PALETTE.length],
    isPacked: Boolean(item.done),
  };
};

export const mapApiListDetailToPackingItems = (
  list?: ListDetailData | null
): TripPackingItem[] => {
  if (!list) return [];
  const rawItems: ListItemData[] = Array.isArray((list as any).items)
    ? ((list as any).items as ListItemData[])
    : [...(list.items?.toBuy || []), ...(list.items?.done || [])];
  return rawItems.map((item, idx) => mapApiListItemToPackingItem(item, idx));
};
