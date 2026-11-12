import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import VaccinationScreen from '../src/screens/completeProfileScreens/innerScreens/VaccinationScreen';
import AddVaccineScreen from '../src/screens/completeProfileScreens/innerScreens/AddVaccineScreen';
import ChildGrowthScreen from '../src/screens/completeProfileScreens/innerScreens/ChildGrowthScreen';
import ChildMilestonesScreen from '../src/screens/completeProfileScreens/innerScreens/ChildMilestonesScreen';
import WhenToTakeMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/WhenToTakeMedicineScreen';
import PickTimeModal from '../src/screens/completeProfileScreens/components/PickTimeModal';

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
    expect(root.findByProps({ children: 'Influenza' })).toBeTruthy();
    expect(root.findByProps({ children: 'Typhoid conjugate' })).toBeTruthy();
    expect(root.findByProps({ children: 'Tdap' })).toBeTruthy();
    expect(root.findByProps({ children: 'MMR' })).toBeTruthy();
    expect(root.findByProps({ children: 'Hepatitis A' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add vaccine record' })).toBeTruthy();
  });

  test('renders AddVaccineScreen (LPS-12) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddVaccineScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add vaccine' })).toBeTruthy();
    expect(root.findByProps({ children: 'Vaccine name' })).toBeTruthy();
    expect(root.findByProps({ children: 'Influenza' })).toBeTruthy();
    expect(root.findByProps({ children: 'Yearly dose' })).toBeTruthy();
    expect(root.findByProps({ children: 'Fri, 20 Oct 2026' })).toBeTruthy();
    expect(root.findByProps({ children: 'Oct 2027' })).toBeTruthy();
    expect(root.findByProps({ children: 'Flu_certificate_2026.pdf' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Remind me before the next dose' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Save vaccine' })).toBeTruthy();
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
    expect(root.findByProps({ children: 'HEIGHT' })).toBeTruthy();
    expect(root.findByProps({ children: '132 cm' })).toBeTruthy();
    expect(root.findByProps({ children: '28 kg' })).toBeTruthy();
    expect(root.findByProps({ children: '+5 cm' })).toBeTruthy();
    expect(root.findByProps({ children: '✎ Add measurement' })).toBeTruthy();
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
    expect(
      root.findByProps({ children: 'Read his first chapter book' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ children: 'Rode a bicycle without help' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: '✎ Add milestone' })).toBeTruthy();
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

  test('renders PickTimeModal (LPS-11c)', () => {
    const onClose = jest.fn();
    const onSetTime = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PickTimeModal
          visible={true}
          doseTitle="Dose 2 · Night"
          onClose={onClose}
          onSetTime={onSetTime}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Dose 2 · Night' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Pick a time, or tap a meal' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'After dinner' })).toBeTruthy();
    expect(root.findByProps({ children: 'Set 9:00 PM' })).toBeTruthy();
  });
});

