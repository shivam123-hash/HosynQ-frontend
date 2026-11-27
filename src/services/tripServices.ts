import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';
import listsServices, {
  GetListDetailResponse,
  AddListItemsResponse,
  UpdateListItemPayload,
  UpdateListItemResponse,
  DeleteItemResponse,
} from './listsServices';

export type TripTab = 'UPCOMING' | 'PAST';

export type BookingKind =
  | 'TRAIN'
  | 'FLIGHT'
  | 'BUS'
  | 'CAB'
  | 'HOTEL'
  | 'OTHER'
  | 'DOCUMENT';

export type BookingStatus = 'PENDING' | 'DONE' | 'NOT_NEEDED';

export interface TripApiMember {
  memberId: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  isYou?: boolean;
}

export interface TripBookingApiItem {
  id: string;
  kind: BookingKind;
  title: string;
  details?: string | null;
  status: BookingStatus;
  remindOn?: string | null;
}

export interface TripPackingListRef {
  id: string;
  name: string;
  totalItems?: number;
  packedItems?: number;
}

export interface TripSummaryApiItem {
  id: string;
  name: string;
  destination: string | null;
  startsOn: string | null;
  endsOn: string | null;
  days: number | null;
  daysLeft: number | null;
  isCurrent: boolean;
  addToCalendar: boolean;
  hasPackingList: boolean;
  packingListId: string | null;
  bookingsCount: number;
  bookingsDoneCount: number;
  goingCount: number;
  goingMembers: TripApiMember[];
  cancelledAt?: string | null;
}

export interface TripDetailApiItem {
  id: string;
  name: string;
  destination: string | null;
  startsOn: string | null;
  endsOn: string | null;
  days: number | null;
  daysLeft: number | null;
  isCurrent?: boolean;
  addToCalendar: boolean;
  eventId?: string | null;
  hasPackingList?: boolean;
  packingListId?: string | null;
  packingList?: TripPackingListRef | null;
  bookings: TripBookingApiItem[];
  goingMembers: TripApiMember[];
  documents?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    details?: string | null;
    status?: string;
    kind?: string;
    type?: 'id' | 'visa' | 'passport';
  }>;
  cancelledAt?: string | null;
}

export interface ListTripsResponse {
  success: boolean;
  tab: TripTab;
  counts: {
    upcoming: number;
    past: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  trips: TripSummaryApiItem[];
}

export interface CommonDatesQuery {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD (max 31 days window)
  days: number;
  memberIds?: string[];
  tripId?: string;
}

export interface CommonDatesMember {
  memberId: string;
  fullName: string;
  avatarColor?: string | null;
  isYou?: boolean;
  busyOn: string[];
}

export interface CommonDateOption {
  startsOn: string;
  endsOn: string;
  days: number;
  everyoneFree: boolean;
  busy: Array<string | { memberId?: string; fullName?: string; name?: string }>;
}

export interface CommonDatesResponse {
  success: boolean;
  days: string[];
  members: CommonDatesMember[];
  options: CommonDateOption[];
}

export interface CreateTripPayload {
  name?: string;
  destination?: string;
  startsOn?: string;
  endsOn?: string;
  goingMemberIds?: string[];
  addToCalendar?: boolean;
}

export type UpdateTripPayload = CreateTripPayload;

export interface CreateBookingPayload {
  kind: BookingKind;
  title: string;
  details?: string;
  status?: BookingStatus;
  remindOn?: string;
}

export interface UpdateBookingPayload {
  kind?: BookingKind;
  title?: string;
  details?: string;
  status?: BookingStatus;
  remindOn?: string | null;
}

const tripServices = {
  /** 1. List trips (GET /api/v1/trips?tab=UPCOMING&page=1&limit=20) */
  listTrips: async (
    tab: TripTab = 'UPCOMING',
    page = 1,
    limit = 20
  ): Promise<ListTripsResponse> => {
    const res = await apiClient.get<ListTripsResponse>(API_ROUTES.TRIPS, {
      params: { tab, page, limit },
    });
    return res.data;
  },

  /** 2. Find common dates (GET /api/v1/trips/common-dates) */
  findCommonDates: async (
    params: CommonDatesQuery
  ): Promise<CommonDatesResponse> => {
    const res = await apiClient.get<CommonDatesResponse>(
      API_ROUTES.TRIPS_COMMON_DATES,
      {
        params: {
          from: params.from,
          to: params.to,
          days: params.days,
          ...(params.memberIds && params.memberIds.length > 0
            ? { memberIds: params.memberIds.join(',') }
            : {}),
          ...(params.tripId ? { tripId: params.tripId } : {}),
        },
      }
    );
    return res.data;
  },

  /** 3. Create trip (POST /api/v1/trips) */
  createTrip: async (
    payload: CreateTripPayload
  ): Promise<{ success: boolean; trip: TripDetailApiItem }> => {
    const res = await apiClient.post(API_ROUTES.TRIPS, payload);
    return res.data;
  },

  /** 4. Get trip detail (GET /api/v1/trips/:tripId) */
  getTrip: async (
    tripId: string
  ): Promise<{ success: boolean; trip: TripDetailApiItem }> => {
    const res = await apiClient.get(API_ROUTES.TRIP_BY_ID(tripId));
    return res.data;
  },

  /** 5. Update trip (PATCH /api/v1/trips/:tripId) */
  updateTrip: async (
    tripId: string,
    payload: UpdateTripPayload
  ): Promise<{ success: boolean; trip: TripDetailApiItem }> => {
    const res = await apiClient.patch(API_ROUTES.TRIP_BY_ID(tripId), payload);
    return res.data;
  },

  /** 6. Cancel trip (POST /api/v1/trips/:tripId/cancel) */
  cancelTrip: async (
    tripId: string,
    comment?: string
  ): Promise<{
    success: boolean;
    message: string;
    tripId: string;
    cancelledAt: string;
  }> => {
    const res = await apiClient.post(
      API_ROUTES.TRIP_CANCEL(tripId),
      comment ? { comment } : {}
    );
    return res.data;
  },

  /** 7. Create packing list for trip (POST /api/v1/trips/:tripId/packing-list) */
  createPackingList: async (
    tripId: string
  ): Promise<{ success: boolean; trip: TripDetailApiItem }> => {
    const res = await apiClient.post(API_ROUTES.TRIP_PACKING_LIST(tripId), {});
    return res.data;
  },

  /** 8. Open packing list (GET /api/v1/lists/:listId) */
  getList: async (listId: string): Promise<GetListDetailResponse> => {
    return listsServices.getList(listId);
  },

  /** 9. Add items in packing list (POST /api/v1/lists/:listId/items) */
  addListItems: async (
    listId: string,
    items: Array<{ name: string; note?: string | null }>
  ): Promise<AddListItemsResponse> => {
    return listsServices.addItems(listId, { items });
  },

  /** 10 & 11. Assign member or tick item as packed (PATCH /api/v1/lists/:listId/items/:itemId) */
  updateListItem: async (
    listId: string,
    itemId: string,
    patch: UpdateListItemPayload
  ): Promise<UpdateListItemResponse> => {
    return listsServices.updateItem(listId, itemId, patch);
  },

  /** 12. Add booking (POST /api/v1/trips/:tripId/bookings) */
  addBooking: async (
    tripId: string,
    booking: CreateBookingPayload
  ): Promise<{ success: boolean; booking: TripBookingApiItem }> => {
    const res = await apiClient.post(
      API_ROUTES.TRIP_BOOKINGS(tripId),
      booking
    );
    return res.data;
  },

  /** 13. Update booking (PATCH /api/v1/trips/:tripId/bookings/:bookingId) */
  updateBooking: async (
    tripId: string,
    bookingId: string,
    patch: UpdateBookingPayload
  ): Promise<{ success: boolean; booking: TripBookingApiItem }> => {
    const res = await apiClient.patch(
      API_ROUTES.TRIP_BOOKING_BY_ID(tripId, bookingId),
      patch
    );
    return res.data;
  },

  /** 14. Remove booking (DELETE /api/v1/trips/:tripId/bookings/:bookingId) */
  removeBooking: async (
    tripId: string,
    bookingId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(
      API_ROUTES.TRIP_BOOKING_BY_ID(tripId, bookingId)
    );
    return res.data;
  },

  /** 15. Remove packing item from list (DELETE /api/v1/lists/:listId/items/:itemId) */
  removeListItem: async (
    listId: string,
    itemId: string
  ): Promise<DeleteItemResponse> => {
    return listsServices.deleteItem(listId, itemId);
  },
};

export default tripServices;
export { tripServices };
