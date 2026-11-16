import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  TripPlannerModal,
  FindCommonDatesModal,
  TripDetailsModal,
  TripBookingsModal,
  TripPackingModal,
  INITIAL_TRIP_DATA,
} from '../src/screens/mainScreens/tasksScreen/components/tripPlanner';

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

describe('TripPlanner Components', () => {
  describe('TRP-01: TripPlannerModal', () => {
    it('renders trip plan overview at initial step correctly', async () => {
      const onClose = jest.fn();
      const onOpenDates = jest.fn();
      const onOpenDetails = jest.fn();
      const onOpenBookings = jest.fn();
      const onOpenPacking = jest.fn();

      const renderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={INITIAL_TRIP_DATA}
          initialScreen="overview"
          onClose={onClose}
          onOpenDates={onOpenDates}
          onOpenDetails={onOpenDetails}
          onOpenBookings={onOpenBookings}
          onOpenPacking={onOpenPacking}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
      expect(str).toContain('Trip plan');
      expect(str).toContain('VACATION PLANNER');
      expect(str).toContain('Jaipur, Rajasthan');
      expect(str).toContain('Find common dates');
      expect(str).toContain('Destination and trip event');
      expect(str).toContain('Bookings and reminders');
      expect(str).toContain('Packing list');
      // At initial step, bottom CTA starts with Step 1: Find common dates
      expect(str).toContain('0 of 4 done');
      expect(str).toContain('Start');
    });

    it('renders trip plan overview when steps 1 & 2 are done', async () => {
      const onClose = jest.fn();
      const onOpenDates = jest.fn();
      const onOpenDetails = jest.fn();
      const onOpenBookings = jest.fn();
      const onOpenPacking = jest.fn();

      const renderer = await renderWithProvider(
        <TripPlannerModal
          visible={true}
          tripData={{
            ...INITIAL_TRIP_DATA,
            step1Done: true,
            step2Done: true,
          }}
          initialScreen="overview"
          onClose={onClose}
          onOpenDates={onOpenDates}
          onOpenDetails={onOpenDetails}
          onOpenBookings={onOpenBookings}
          onOpenPacking={onOpenPacking}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
      expect(str).toContain('2 of 4 done');
      expect(str).toContain('Done');
      expect(str).toContain('Book train tickets');
    });
  });

  describe('TRP-02: FindCommonDatesModal', () => {
    it('renders availability heatmap matrix and options', async () => {
      const onClose = jest.fn();
      const onSelectDates = jest.fn();

      const renderer = await renderWithProvider(
        <FindCommonDatesModal
          visible={true}
          onClose={onClose}
          onSelectDates={onSelectDates}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
      expect(str).toContain('Find common dates');
      expect(str).toContain('We checked everyone’s calendar. Green days are free.');
      expect(str).toContain('BEST OPTIONS');
      expect(str).toContain('Fri 13 – Mon 16 Nov');
      expect(str).toContain('Sat 21 – Sun 22 Nov');
      expect(str).toContain('Aarav has exams');
      expect(str).toContain('Use 13–16 Nov');
    });
  });

  describe('TRP-03: TripDetailsModal', () => {
    it('renders trip details inputs and calendar preview', async () => {
      const onClose = jest.fn();
      const onSaveTrip = jest.fn();

      const renderer = await renderWithProvider(
        <TripDetailsModal
          visible={true}
          tripData={INITIAL_TRIP_DATA}
          onClose={onClose}
          onSaveTrip={onSaveTrip}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
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

  describe('TRP-04: TripBookingsModal', () => {
    it('renders bookings and documents list', async () => {
      const onClose = jest.fn();
      const onUpdateBookings = jest.fn();

      const renderer = await renderWithProvider(
        <TripBookingsModal
          visible={true}
          bookings={INITIAL_TRIP_DATA.bookings}
          documents={INITIAL_TRIP_DATA.documents}
          onClose={onClose}
          onUpdateBookings={onUpdateBookings}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
      expect(str).toContain('Bookings');
      expect(str).toContain('Train tickets');
      expect(str).toContain('Hotel');
      expect(str).toContain('Cab from Jaipur station');
      expect(str).toContain('DOCUMENTS');
      expect(str).toContain('ID for everyone');
      expect(str).toContain('Visa');
      expect(str).toContain('Add a booking or reminder');
    });
  });

  describe('TRP-05: TripPackingModal', () => {
    it('renders packing list with category pill and sections', async () => {
      const onClose = jest.fn();
      const onUpdatePackingItems = jest.fn();

      const renderer = await renderWithProvider(
        <TripPackingModal
          visible={true}
          destination="Jaipur, Rajasthan"
          packingItems={INITIAL_TRIP_DATA.packingItems}
          onClose={onClose}
          onUpdatePackingItems={onUpdatePackingItems}
        />
      );

      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
      const str = JSON.stringify(tree);
      expect(str).toContain('Packing · Jaipur trip');
      expect(str).toContain('Jaipur trip packing');
      expect(str).toContain('Everyone');
      expect(str).toContain('Shared');
      expect(str).toContain('Phone chargers');
      expect(str).toContain('First-aid kit');
      expect(str).toContain('Snacks for the train');
      expect(str).toContain('Tickets and IDs');
      expect(str).toContain('Warm jackets');
      expect(str).toContain('Aarav’s school books');
    });
  });
});
