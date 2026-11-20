import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CompleteProfileStep4Screen } from '../src/screens/completeProfileScreens';
import VaccinationScreen from '../src/screens/completeProfileScreens/innerScreens/VaccinationScreen';
import AddVaccineScreen from '../src/screens/completeProfileScreens/innerScreens/AddVaccineScreen';
import ChildGrowthScreen from '../src/screens/completeProfileScreens/innerScreens/ChildGrowthScreen';
import ChildMilestonesScreen from '../src/screens/completeProfileScreens/innerScreens/ChildMilestonesScreen';
import WhenToTakeMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/WhenToTakeMedicineScreen';
import AppDateTimePicker, { formatDate, formatTime } from '../src/components/AppDateTimePicker';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Section 4 & Medicine Flow Screens', () => {
  test('renders VaccinationScreen (LPS-09) and switches tabs', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VaccinationScreen initialTab="vaccines" />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Vaccination' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aarav · Section 4 of 5' })).toBeTruthy();
    expect(root.findByProps({ children: 'No vaccine records yet' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add vaccine record' })).toBeTruthy();
  });

  test('renders AddVaccineScreen (image layout) and flow with CompleteProfileStep4Screen correctly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <CompleteProfileStep4Screen
            initialMode="form"
            initialData={{
              vaccineName: 'Influenza',
              dose: 'Yearly dose',
              dateGiven: '30 Oct 2026',
              nextDue: 'Oct 2027',
            }}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    // Step 1: Add vaccine record form
    expect(root.findByProps({ children: 'Add vaccine record' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aarav · Section 4 of 5' })).toBeTruthy();
    expect(root.findByProps({ children: 'VACCINE' })).toBeTruthy();
    expect(root.findByProps({ children: 'Vaccine name *' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dose *' })).toBeTruthy();
    expect(root.findByProps({ children: 'Yearly dose' })).toBeTruthy();
    expect(root.findByProps({ children: 'GIVEN' })).toBeTruthy();
    expect(root.findByProps({ children: 'Date given *' })).toBeTruthy();
    expect(root.findByProps({ children: '30 Oct 2026' })).toBeTruthy();
    expect(root.findByProps({ children: 'Given at (optional)' })).toBeTruthy();
    expect(root.findByProps({ children: 'Batch number (optional)' })).toBeTruthy();
    expect(root.findByProps({ children: 'Upload certificate' })).toBeTruthy();
    expect(root.findByProps({ children: 'NEXT DOSE' })).toBeTruthy();
    expect(root.findByProps({ children: 'Next due' })).toBeTruthy();
    expect(root.findByProps({ children: 'Oct 2027' })).toBeTruthy();
    expect(root.findAllByProps({ children: 'Remind me' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: 'Before the next dose' })).toBeTruthy();
    expect(root.findByProps({ children: 'Who gets the reminder' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();

    // Tap Save to switch to Vaccination details screen with tabs
    const saveBtn = root.findByProps({ title: 'Save' });
    await ReactTestRenderer.act(async () => {
      await saveBtn.props.onPress();
    });

    // Step 2: Vaccination screen with tabs
    expect(root.findByProps({ children: 'Vaccination' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add vaccine record' })).toBeTruthy();

    // Tap "+ Add vaccine record" to switch back to form screen
    const addVaccineBtn = root.findByProps({ title: '+ Add vaccine record' });
    ReactTestRenderer.act(() => {
      addVaccineBtn.props.onPress();
    });

    // Step 3: Back to Add vaccine record form
    expect(root.findByProps({ children: 'Add vaccine record' })).toBeTruthy();
  });

  test('renders ChildGrowthScreen (LPS-10 Growth)', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <ChildGrowthScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Vaccination' })).toBeTruthy();
    expect(root.findByProps({ children: 'No growth measurements yet' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add measurement' })).toBeTruthy();
  });

  test('renders ChildMilestonesScreen (LPS-10 Milestones)', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <ChildMilestonesScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'MILESTONES' })).toBeTruthy();
    expect(root.findByProps({ children: 'No milestones recorded yet' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add milestone' })).toBeTruthy();
  });

  test('renders WhenToTakeMedicineScreen (LPS-11b)', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <WhenToTakeMedicineScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'When to take it' })).toBeTruthy();
    expect(root.findByProps({ children: 'HOW OFTEN' })).toBeTruthy();
    expect(root.findByProps({ children: 'Every day' })).toBeTruthy();
    expect(root.findByProps({ children: 'Times a day' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dose 1 · Morning' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dose 2 · Night' })).toBeTruthy();
    expect(root.findByProps({ children: '8:00 AM' })).toBeTruthy();
    expect(root.findByProps({ children: '9:00 PM' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save medicine' })).toBeTruthy();
  });

  test('renders AppDateTimePicker and formats date and time correctly', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const testDate = new Date(2026, 9, 30, 21, 0); // 30 Oct 2026, 9:00 PM
    expect(formatDate(testDate)).toBe('30 Oct 2026');
    expect(formatDate(testDate, 'MMM YYYY')).toBe('Oct 2026');
    expect(formatTime(testDate)).toBe('09:00 PM');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppDateTimePicker
          visible={true}
          mode="date"
          date={testDate}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );
    });

    expect(renderer!).toBeTruthy();
  });
});

