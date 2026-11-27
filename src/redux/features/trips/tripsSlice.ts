import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import tripServices, {
  TripTab,
  TripSummaryApiItem,
  TripDetailApiItem,
  ListTripsResponse,
  CommonDatesQuery,
  CommonDatesResponse,
  CreateTripPayload,
  UpdateTripPayload,
  CreateBookingPayload,
  UpdateBookingPayload,
  TripBookingApiItem,
} from '../../../services/tripServices';
import {
  ListDetailData,
  UpdateListItemPayload,
} from '../../../services/listsServices';
import { isUUID } from '../lists/listsSlice';

export interface TripsPaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface TripsState {
  upcomingTrips: TripSummaryApiItem[];
  pastTrips: TripSummaryApiItem[];
  counts: {
    upcoming: number;
    past: number;
  };
  pagination: {
    upcoming: TripsPaginationState | null;
    past: TripsPaginationState | null;
  };
  selectedTrip: TripDetailApiItem | null;
  commonDates: CommonDatesResponse | null;
  packingList: ListDetailData | null;
  loadingList: boolean;
  loadingDetail: boolean;
  loadingCommonDates: boolean;
  loadingPackingList: boolean;
  actionLoading: boolean;
  error: string | null;
  commonDatesError: string | null;
}

const initialState: TripsState = {
  upcomingTrips: [],
  pastTrips: [],
  counts: { upcoming: 0, past: 0 },
  pagination: { upcoming: null, past: null },
  selectedTrip: null,
  commonDates: null,
  packingList: null,
  loadingList: false,
  loadingDetail: false,
  loadingCommonDates: false,
  loadingPackingList: false,
  actionLoading: false,
  error: null,
  commonDatesError: null,
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message || err?.message || fallback;
  return Array.isArray(msg) ? msg.join(', ') : msg;
};

/** 1. List trips (GET /api/v1/trips?tab=UPCOMING|PAST&page=1&limit=20) */
export const fetchTripsThunk = createAsyncThunk<
  ListTripsResponse,
  { tab?: TripTab; page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('trips/fetchTrips', async (params, { rejectWithValue }) => {
  try {
    const tab = params?.tab || 'UPCOMING';
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    return await tripServices.listTrips(tab, page, limit);
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to fetch trips.'));
  }
});
export const fetchTrips = fetchTripsThunk;

/** 2. Find common dates (GET /api/v1/trips/common-dates) */
export const findCommonDatesThunk = createAsyncThunk<
  CommonDatesResponse,
  CommonDatesQuery,
  { rejectValue: string }
>('trips/findCommonDates', async (params, { rejectWithValue }) => {
  try {
    console.log('[findCommonDates API] Request Params:', params);
    const res = await tripServices.findCommonDates(params);
    console.log('[findCommonDates API] Success Response (raw):', res);
    try {
      console.log(
        '[findCommonDates API] Success Response (formatted):\n',
        JSON.stringify(res, null, 2)
      );
    } catch {
      // ignore serialization error
    }
    return res;
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to check family availability.');
    console.log('[findCommonDates API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(errorMsg);
  }
});
export const findCommonDates = findCommonDatesThunk;

/** 3. Create trip (POST /api/v1/trips) */
export const createTripThunk = createAsyncThunk<
  TripDetailApiItem,
  CreateTripPayload,
  { rejectValue: string }
>('trips/createTrip', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await tripServices.createTrip(payload);
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return res.trip;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to create trip.'));
  }
});
export const createTrip = createTripThunk;

/** 4. Get single trip detail (GET /api/v1/trips/:tripId) */
export const fetchTripDetailThunk = createAsyncThunk<
  TripDetailApiItem,
  string,
  { rejectValue: string }
>('trips/fetchTripDetail', async (tripId, { rejectWithValue }) => {
  if (!isUUID(tripId)) {
    return rejectWithValue('Invalid trip ID format (UUID expected).');
  }
  try {
    const res = await tripServices.getTrip(tripId);
    return res.trip;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to fetch trip details.'));
  }
});
export const fetchTripDetail = fetchTripDetailThunk;

/** 5. Update trip (PATCH /api/v1/trips/:tripId) */
export const updateTripThunk = createAsyncThunk<
  TripDetailApiItem,
  { tripId: string; payload: UpdateTripPayload },
  { rejectValue: string }
>('trips/updateTrip', async ({ tripId, payload }, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId)) {
    return rejectWithValue('Invalid trip ID format (UUID expected).');
  }
  try {
    const res = await tripServices.updateTrip(tripId, payload);
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return res.trip;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update trip.'));
  }
});
export const updateTrip = updateTripThunk;

/** 6. Cancel trip (POST /api/v1/trips/:tripId/cancel) */
export const cancelTripThunk = createAsyncThunk<
  { tripId: string; cancelledAt: string },
  { tripId: string; comment?: string },
  { rejectValue: string }
>('trips/cancelTrip', async ({ tripId, comment }, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId)) {
    return rejectWithValue('Invalid trip ID format (UUID expected).');
  }
  try {
    const res = await tripServices.cancelTrip(tripId, comment);
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    dispatch(fetchTripsThunk({ tab: 'PAST' }));
    return { tripId: res.tripId || tripId, cancelledAt: res.cancelledAt };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to cancel trip.'));
  }
});
export const cancelTrip = cancelTripThunk;

/** 7. Create packing list for trip (handles 409 Conflict by loading existing list) */
export const createTripPackingListThunk = createAsyncThunk<
  { trip: TripDetailApiItem; listId: string },
  string,
  { rejectValue: string }
>('trips/createPackingList', async (tripId, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId)) {
    return rejectWithValue('Invalid trip ID format (UUID expected).');
  }
  try {
    const res = await tripServices.createPackingList(tripId);
    const listId = res.trip?.packingList?.id || res.trip?.packingListId || '';
    if (listId && isUUID(listId)) {
      dispatch(fetchTripPackingListThunk(listId));
    }
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return { trip: res.trip, listId };
  } catch (err: any) {
    if (err?.response?.status === 409 && err?.response?.data?.listId) {
      const existingListId = String(err.response.data.listId);
      const detailRes = await tripServices.getTrip(tripId);
      if (isUUID(existingListId)) {
        dispatch(fetchTripPackingListThunk(existingListId));
      }
      return { trip: detailRes.trip, listId: existingListId };
    }
    return rejectWithValue(extractErrorMessage(err, 'Failed to create packing list.'));
  }
});
export const createTripPackingList = createTripPackingListThunk;

/** 8. Open trip packing list (GET /api/v1/lists/:listId) */
export const fetchTripPackingListThunk = createAsyncThunk<
  ListDetailData,
  string,
  { rejectValue: string }
>('trips/fetchPackingList', async (listId, { rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    const res = await tripServices.getList(listId);
    return res.list;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to fetch packing list.'));
  }
});
export const fetchTripPackingList = fetchTripPackingListThunk;

/** 9. Add items in trip packing list (POST /api/v1/lists/:listId/items) */
export const addTripPackingItemsThunk = createAsyncThunk<
  ListDetailData,
  { listId: string; tripId?: string; items: Array<{ name: string; note?: string | null }> },
  { rejectValue: string }
>('trips/addPackingItems', async ({ listId, tripId, items }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    await tripServices.addListItems(listId, items);
    const res = await tripServices.getList(listId);
    if (tripId && isUUID(tripId)) {
      dispatch(fetchTripDetailThunk(tripId));
    }
    return res.list;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to add packing items.'));
  }
});
export const addTripPackingItems = addTripPackingItemsThunk;

/** 10 & 11. Assign member or tick packing item (PATCH /api/v1/lists/:listId/items/:itemId) */
export const updateTripPackingItemThunk = createAsyncThunk<
  ListDetailData,
  { listId: string; itemId: string; tripId?: string; patch: UpdateListItemPayload },
  { rejectValue: string }
>('trips/updatePackingItem', async ({ listId, itemId, tripId, patch }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId) || !isUUID(itemId)) {
    return rejectWithValue('Invalid list or item ID format (UUID expected).');
  }
  try {
    await tripServices.updateListItem(listId, itemId, patch);
    const res = await tripServices.getList(listId);
    if (tripId && isUUID(tripId)) {
      dispatch(fetchTripDetailThunk(tripId));
    }
    return res.list;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update packing item.'));
  }
});
export const updateTripPackingItem = updateTripPackingItemThunk;

/** 15. Remove packing item (DELETE /api/v1/lists/:listId/items/:itemId) */
export const removeTripPackingItemThunk = createAsyncThunk<
  ListDetailData,
  { listId: string; itemId: string; tripId?: string },
  { rejectValue: string }
>('trips/removePackingItem', async ({ listId, itemId, tripId }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId) || !isUUID(itemId)) {
    return rejectWithValue('Invalid list or item ID format (UUID expected).');
  }
  try {
    await tripServices.removeListItem(listId, itemId);
    const res = await tripServices.getList(listId);
    if (tripId && isUUID(tripId)) {
      dispatch(fetchTripDetailThunk(tripId));
    }
    return res.list;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove packing item.'));
  }
});
export const removeTripPackingItem = removeTripPackingItemThunk;

/** 12. Add booking (POST /api/v1/trips/:tripId/bookings) */
export const addTripBookingThunk = createAsyncThunk<
  { tripId: string; booking: TripBookingApiItem },
  { tripId: string; booking: CreateBookingPayload },
  { rejectValue: string }
>('trips/addBooking', async ({ tripId, booking }, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId)) {
    return rejectWithValue('Invalid trip ID format (UUID expected).');
  }
  try {
    const res = await tripServices.addBooking(tripId, booking);
    dispatch(fetchTripDetailThunk(tripId));
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return { tripId, booking: res.booking };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to add booking.'));
  }
});
export const addTripBooking = addTripBookingThunk;

/** 13. Update booking (PATCH /api/v1/trips/:tripId/bookings/:bookingId) */
export const updateTripBookingThunk = createAsyncThunk<
  { tripId: string; booking: TripBookingApiItem },
  { tripId: string; bookingId: string; patch: UpdateBookingPayload },
  { rejectValue: string }
>('trips/updateBooking', async ({ tripId, bookingId, patch }, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId) || !isUUID(bookingId)) {
    return rejectWithValue('Invalid trip or booking ID format (UUID expected).');
  }
  try {
    const res = await tripServices.updateBooking(tripId, bookingId, patch);
    dispatch(fetchTripDetailThunk(tripId));
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return { tripId, booking: res.booking };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update booking.'));
  }
});
export const updateTripBooking = updateTripBookingThunk;

/** 14. Remove booking (DELETE /api/v1/trips/:tripId/bookings/:bookingId) */
export const removeTripBookingThunk = createAsyncThunk<
  { tripId: string; bookingId: string },
  { tripId: string; bookingId: string },
  { rejectValue: string }
>('trips/removeBooking', async ({ tripId, bookingId }, { dispatch, rejectWithValue }) => {
  if (!isUUID(tripId) || !isUUID(bookingId)) {
    return rejectWithValue('Invalid trip or booking ID format (UUID expected).');
  }
  try {
    await tripServices.removeBooking(tripId, bookingId);
    dispatch(fetchTripDetailThunk(tripId));
    dispatch(fetchTripsThunk({ tab: 'UPCOMING' }));
    return { tripId, bookingId };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove booking.'));
  }
});
export const removeTripBooking = removeTripBookingThunk;

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearTripsError: (state) => {
      state.error = null;
    },
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
      state.packingList = null;
    },
    setSelectedTripLocal: (state, action: PayloadAction<TripDetailApiItem | null>) => {
      state.selectedTrip = action.payload;
    },
    clearCommonDates: (state) => {
      state.commonDates = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. List trips
      .addCase(fetchTripsThunk.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchTripsThunk.fulfilled, (state, action) => {
        state.loadingList = false;
        const tabKey = action.payload.tab === 'PAST' ? 'past' : 'upcoming';
        if (tabKey === 'past') {
          state.pastTrips = action.payload.trips || [];
        } else {
          state.upcomingTrips = action.payload.trips || [];
        }
        if (action.payload.counts) {
          state.counts = action.payload.counts;
        }
        if (action.payload.pagination) {
          state.pagination[tabKey] = action.payload.pagination;
        }
      })
      .addCase(fetchTripsThunk.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload || 'Failed to fetch trips.';
      })

      // 2. Find common dates
      .addCase(findCommonDatesThunk.pending, (state) => {
        state.loadingCommonDates = true;
        state.commonDatesError = null;
      })
      .addCase(findCommonDatesThunk.fulfilled, (state, action) => {
        state.loadingCommonDates = false;
        state.commonDatesError = null;
        state.commonDates = action.payload;
      })
      .addCase(findCommonDatesThunk.rejected, (state, action) => {
        state.loadingCommonDates = false;
        state.commonDatesError = action.payload || 'Failed to load common dates.';
      })

      // 3. Create trip
      .addCase(createTripThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTripThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.selectedTrip = action.payload;
        }
      })
      .addCase(createTripThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create trip.';
      })

      // 4. Get trip detail
      .addCase(fetchTripDetailThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchTripDetailThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedTrip = action.payload;
      })
      .addCase(fetchTripDetailThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload || 'Failed to fetch trip details.';
      })

      // 5. Update trip
      .addCase(updateTripThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTripThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.selectedTrip = action.payload;
        }
      })
      .addCase(updateTripThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update trip.';
      })

      // 6. Cancel trip
      .addCase(cancelTripThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelTripThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.upcomingTrips = state.upcomingTrips.filter(
          (t) => t.id !== action.payload.tripId
        );
        if (state.selectedTrip?.id === action.payload.tripId) {
          state.selectedTrip = null;
          state.packingList = null;
        }
      })
      .addCase(cancelTripThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to cancel trip.';
      })

      // 7. Create packing list
      .addCase(createTripPackingListThunk.pending, (state) => {
        state.loadingPackingList = true;
        state.error = null;
      })
      .addCase(createTripPackingListThunk.fulfilled, (state, action) => {
        state.loadingPackingList = false;
        if (action.payload.trip) {
          state.selectedTrip = action.payload.trip;
        }
      })
      .addCase(createTripPackingListThunk.rejected, (state, action) => {
        state.loadingPackingList = false;
        state.error = action.payload || 'Failed to create packing list.';
      })

      // 8-11 & 15. Packing list detail & items
      .addCase(fetchTripPackingListThunk.pending, (state) => {
        state.loadingPackingList = true;
        state.error = null;
      })
      .addCase(fetchTripPackingListThunk.fulfilled, (state, action) => {
        state.loadingPackingList = false;
        state.packingList = action.payload;
      })
      .addCase(fetchTripPackingListThunk.rejected, (state, action) => {
        state.loadingPackingList = false;
        state.error = action.payload || 'Failed to fetch packing list.';
      })
      .addCase(addTripPackingItemsThunk.fulfilled, (state, action) => {
        state.packingList = action.payload;
      })
      .addCase(updateTripPackingItemThunk.fulfilled, (state, action) => {
        state.packingList = action.payload;
      })
      .addCase(removeTripPackingItemThunk.fulfilled, (state, action) => {
        state.packingList = action.payload;
      })

      // 12-14. Bookings
      .addCase(addTripBookingThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addTripBookingThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedTrip?.id === action.payload.tripId) {
          state.selectedTrip.bookings = [
            ...(state.selectedTrip.bookings || []),
            action.payload.booking,
          ];
        }
      })
      .addCase(addTripBookingThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to add booking.';
      })
      .addCase(updateTripBookingThunk.fulfilled, (state, action) => {
        if (state.selectedTrip?.id === action.payload.tripId) {
          state.selectedTrip.bookings = (state.selectedTrip.bookings || []).map((b) =>
            b.id === action.payload.booking.id ? action.payload.booking : b
          );
        }
      })
      .addCase(removeTripBookingThunk.fulfilled, (state, action) => {
        if (state.selectedTrip?.id === action.payload.tripId) {
          state.selectedTrip.bookings = (state.selectedTrip.bookings || []).filter(
            (b) => b.id !== action.payload.bookingId
          );
        }
      });
  },
});

export const {
  clearTripsError,
  clearSelectedTrip,
  setSelectedTripLocal,
  clearCommonDates,
} = tripsSlice.actions;

export default tripsSlice.reducer;
