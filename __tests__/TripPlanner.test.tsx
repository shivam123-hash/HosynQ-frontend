import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  TripPlannerModal,
  TripsListModal,
  FindCommonDatesModal,
  TripDetailsModal,
  TripBookingsModal,
  AddTripBookingModal,
  TripPackingModal,
  mapApiTripToUiTrip,
} from '../src/screens/mainScreens/tasksScreen/components/tripPlanner';
import { INITIAL_TRIP_DATA } from '../src/__test_fixtures__/tripFixtures';
import { CommonDatesResponse } from '../src/services/tripServices';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderWithProvider = async (component: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        {component}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

const extractRenderedText = (renderer: ReactTestRenderer.ReactTestRenderer): string => {
  return renderer.root
    .findAllByType(Text)
    .map((n) => {
      const c = n.props.children;
      return Array.isArray(c) ? c.join('') : String(c ?? '');
    })
    .join(' | ');
};

describe('TripPlanner Components', () => {
  describe('TRP-01: TripPlannerModal', () => {
    it('renders trip plan overview at initial step correctly', async () => {
      const renderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={INITIAL_TRIP_DATA}
          initialScreen="overview"
          onClose={jest.fn()}
          onOpenDates={jest.fn()}
          onOpenDetails={jest.fn()}
          onOpenBookings={jest.fn()}
          onOpenPacking={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Trip plan');
      expect(str).toContain('VACATION PLANNER');
      expect(str).toContain('Jaipur, Rajasthan');
      expect(str).toContain('Find common dates');
      expect(str).toContain('Destination and trip event');
      expect(str).toContain('Bookings and reminders');
      expect(str).toContain('Packing list');
      expect(str).toContain('0 of 4 done');
      expect(str).toContain('Start');
    });

    it('renders trip plan overview when steps 1 & 2 are done', async () => {
      const renderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={{
            ...INITIAL_TRIP_DATA,
            step1Done: true,
            step2Done: true,
          }}
          initialScreen="overview"
          onClose={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('2 of 4 done');
      expect(str).toContain('Done');
      expect(str).toContain('Manage bookings');
    });

    it('shows packing CTA when steps 1-3 are done and hides bottom CTA when all 4 steps are done', async () => {
      const allBookingsDone = INITIAL_TRIP_DATA.bookings.map((b) => ({
        ...b,
        isBooked: true,
        status: 'DONE' as const,
      }));
      const allPackingDone = INITIAL_TRIP_DATA.packingItems.map((p) => ({
        ...p,
        isPacked: true,
      }));

      const step3DoneRenderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={{
            ...INITIAL_TRIP_DATA,
            step1Done: true,
            step2Done: true,
            bookings: allBookingsDone,
          }}
          initialScreen="overview"
          onClose={jest.fn()}
        />
      );
      const step3Str = extractRenderedText(step3DoneRenderer);
      expect(step3Str).toContain('3 of 4 done');
      expect(step3Str).toContain('Open packing list');

      const allDoneRenderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={{
            ...INITIAL_TRIP_DATA,
            step1Done: true,
            step2Done: true,
            bookings: allBookingsDone,
            packingItems: allPackingDone,
          }}
          initialScreen="overview"
          onClose={jest.fn()}
        />
      );
      const allDoneStr = extractRenderedText(allDoneRenderer);
      expect(allDoneStr).toContain('4 of 4 done');
      expect(allDoneStr).not.toContain('Add bookings');
      expect(allDoneStr).not.toContain('Manage bookings');
      expect(allDoneStr).not.toContain('Open packing list');
    });

    it('renders themed AppDialog instead of native OS Alert when cancelling trip', async () => {
      const renderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={INITIAL_TRIP_DATA}
          initialScreen="overview"
          onClose={jest.fn()}
        />
      );

      const menuBtn = renderer.root.findByProps({ accessibilityLabel: 'Trip options' });
      await ReactTestRenderer.act(() => {
        menuBtn.props.onPress();
      });

      const cancelMenuOption = renderer.root.findByProps({ accessibilityLabel: 'Cancel Trip' });
      await ReactTestRenderer.act(() => {
        cancelMenuOption.props.onPress();
      });

      const str = extractRenderedText(renderer);
      expect(str).toContain('Cancel trip?');
      expect(str).toContain('Cancel trip');
      expect(str).toContain('Keep trip');
    });
  });

  describe('TRP-02: FindCommonDatesModal', () => {
    it('renders availability heatmap matrix and API options without mock hardcoding', async () => {
      const sampleAvailability: CommonDatesResponse = {
        success: true,
        days: [
          '2026-12-01',
          '2026-12-02',
          '2026-12-03',
          '2026-12-04',
          '2026-12-05',
          '2026-12-06',
        ],
        members: [
          { memberId: 'm1', fullName: 'Priya', isYou: true, busyOn: ['2026-12-05'] },
          { memberId: 'm2', fullName: 'Rohan', isYou: false, busyOn: [] },
        ],
        options: [
          {
            startsOn: '2026-12-01',
            endsOn: '2026-12-04',
            days: 4,
            everyoneFree: true,
            busy: [],
          },
          {
            startsOn: '2026-12-03',
            endsOn: '2026-12-06',
            days: 4,
            everyoneFree: false,
            busy: ['Priya'],
          },
        ],
      };

      const renderer = await renderWithProvider(
        <FindCommonDatesModal
          visible={true}
          availabilityData={sampleAvailability}
          onClose={jest.fn()}
          onSelectDates={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Find common dates');
      expect(str).toContain('Date window');
      expect(str).toContain('Next 14 days');
      expect(str).toContain('Trip length');
      expect(str).toContain('We checked everyone’s calendar. Green days are free.');
      expect(str).toContain('BEST OPTIONS');
      expect(str).toContain('Tue 1 – Fri 4 Dec');
      expect(str).toContain('Priya busy · 4 days');
      expect(str).toContain('Use 1–4 Dec');
    });
  });

  describe('TRP-03: TripDetailsModal', () => {
    it('renders trip details inputs and calendar preview', async () => {
      const renderer = await renderWithProvider(
        <TripDetailsModal
          visible={true}
          tripData={INITIAL_TRIP_DATA}
          onClose={jest.fn()}
          onSaveTrip={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Trip details');
      expect(str).toContain('Where are you going?');
      expect(str).toContain('Dates');
      expect(str).toContain('LEAVE');
      expect(str).toContain('RETURN');
      expect(str).toContain('Who’s going?');
      expect(str).toContain('Add to the family calendar');
      expect(str).toContain('PREVIEW');
      expect(str).toContain('Travel');
      expect(str).toContain('Save trip');
    });
  });

  describe('TRP-04: TripBookingsModal & AddTripBookingModal', () => {
    it('renders bookings and documents list', async () => {
      const renderer = await renderWithProvider(
        <TripBookingsModal
          visible={true}
          bookings={INITIAL_TRIP_DATA.bookings}
          documents={INITIAL_TRIP_DATA.documents}
          onClose={jest.fn()}
          onUpdateBookings={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Bookings');
      expect(str).toContain('Train tickets');
      expect(str).toContain('Hotel');
      expect(str).toContain('Cab from Jaipur station');
      expect(str).toContain('DOCUMENTS');
      expect(str).toContain('ID for everyone');
      expect(str).toContain('Visa');
      expect(str).toContain('Add a booking or reminder');
    });

    it('renders AddTripBookingModal with category chips and form inputs', async () => {
      const renderer = await renderWithProvider(
        <AddTripBookingModal
          visible={true}
          onClose={jest.fn()}
          onSave={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Add booking');
      expect(str).toContain('Train');
      expect(str).toContain('Flight');
      expect(str).toContain('Hotel');
      expect(str).toContain('Document');
      expect(str).toContain('Not booked');
      expect(str).toContain('REMINDER DATE (OPTIONAL)');
    });
  });

  describe('TRP-05: TripPackingModal', () => {
    it('renders packing list with category pill and sections', async () => {
      const renderer = await renderWithProvider(
        <TripPackingModal
          visible={true}
          destination="Jaipur, Rajasthan"
          tripMembers={INITIAL_TRIP_DATA.members}
          packingItems={INITIAL_TRIP_DATA.packingItems}
          onClose={jest.fn()}
          onUpdatePackingItems={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Packing · Jaipur trip');
      expect(str).toContain('Jaipur trip packing');
      expect(str).toContain('1 of 6 packed');
      expect(str).toContain('Everyone');
      expect(str).toContain('Shared');
      expect(str).toContain('Phone chargers');
      expect(str).toContain('First-aid kit');
      expect(str).toContain('Snacks for the train');
      expect(str).toContain('Tickets and IDs');
      expect(str).toContain('Warm jackets');
      expect(str).toContain('Aarav’s school books');
      expect(str).toContain('Add packing items');
    });
  });

  describe('TRP-06: TripsListModal & API mapper', () => {
    it('renders Upcoming / Past tabs in TripsListModal', async () => {
      const renderer = await renderWithProvider(
        <TripsListModal
          visible={true}
          onClose={jest.fn()}
          onSelectTrip={jest.fn()}
          onPlanNewTrip={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).toContain('Trips');
      expect(str).toContain('Upcoming');
      expect(str).toContain('Past');
    });

    it('maps backend TripDetailApiItem cleanly via mapApiTripToUiTrip', () => {
      const mapped = mapApiTripToUiTrip({
        id: 'd4ddf7e4-89c9-4203-a94a-36fd5924219e',
        name: 'Hill trip',
        destination: 'Shimla, Himachal Pradesh',
        startsOn: '2026-12-10',
        endsOn: '2026-12-14',
        days: 5,
        daysLeft: 14,
        addToCalendar: true,
        packingList: {
          id: '97924df9-8837-4a4e-9394-46f6c17ac381',
          name: 'Hill trip packing',
          totalItems: 3,
          packedItems: 1,
        },
        bookings: [
          {
            id: '14ad2ef4-675e-4152-87ba-99c018241e3a',
            kind: 'TRAIN',
            title: 'Kalka-Shimla train',
            details: 'Dec 10 - 3 seats',
            status: 'PENDING',
            remindOn: '2026-11-25',
          },
        ],
        goingMembers: [
          { memberId: 'm1', fullName: 'Priya', isYou: true },
        ],
      });

      expect(mapped.id).toBe('d4ddf7e4-89c9-4203-a94a-36fd5924219e');
      expect(mapped.packingListId).toBe('97924df9-8837-4a4e-9394-46f6c17ac381');
      expect(mapped.hasPackingList).toBe(true);
      expect(mapped.bookings).toHaveLength(1);
      expect(mapped.bookings[0].type).toBe('train');
      expect(mapped.step1Done).toBe(true);
      expect(mapped.step2Done).toBe(true);
      expect(mapped.packingTotalItems).toBe(3);
      expect(mapped.packingPackedItems).toBe(1);
    });

    it('derives packing counts from existingPackingItems when trip detail omits counts', () => {
      const mapped = mapApiTripToUiTrip(
        {
          id: 'd4ddf7e4-89c9-4203-a94a-36fd5924219e',
          name: 'Jaipur trip',
          destination: 'Jaipur',
          startsOn: '2026-11-29',
          endsOn: '2026-12-03',
          days: 5,
          daysLeft: 3,
          addToCalendar: true,
          packingList: {
            id: '97924df9-8837-4a4e-9394-46f6c17ac381',
            name: 'Jaipur trip packing',
          },
          bookings: [],
          goingMembers: [{ memberId: 'm1', fullName: 'Rupesh', isYou: true }],
        },
        [],
        [
          {
            id: 'i1',
            title: 'Dry fruits',
            category: 'shared',
            assignedTo: 'Shared',
            assignedInitial: '',
            assignedBg: '#fff',
            isPacked: true,
          },
          {
            id: 'i2',
            title: 'Toran',
            category: 'shared',
            assignedTo: 'Shared',
            assignedInitial: '',
            assignedBg: '#fff',
            isPacked: true,
          },
        ]
      );

      expect(mapped.packingTotalItems).toBe(2);
      expect(mapped.packingPackedItems).toBe(2);
    });

    it('falls back cleanly in TripsListModal when summary booking counts are missing instead of showing undefined/undefined', async () => {
      const { store } = require('../src/redux/store');
      store.dispatch({
        type: 'trips/fetchTrips/fulfilled',
        payload: {
          success: true,
          tab: 'UPCOMING',
          counts: { upcoming: 1, past: 0 },
          trips: [
            {
              id: 't1',
              name: 'Jaipur trip',
              destination: 'Jaipur',
              startsOn: '2026-11-29',
              endsOn: '2026-12-03',
              days: 5,
              daysLeft: 3,
              isCurrent: false,
              addToCalendar: true,
              hasPackingList: true,
              packingListId: 'p1',
              goingCount: 4,
              goingMembers: [],
            },
          ],
        },
      });

      const renderer = await renderWithProvider(
        <TripsListModal
          visible={true}
          onClose={jest.fn()}
          onSelectTrip={jest.fn()}
          onPlanNewTrip={jest.fn()}
        />
      );

      const str = extractRenderedText(renderer);
      expect(str).not.toContain('undefined');
      expect(str).toContain('Packing ready');
    });
  });
});
