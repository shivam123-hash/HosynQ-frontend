import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ImportantDocumentsScreen from '../src/screens/completeProfileScreens/innerScreens/ImportantDocumentsScreen';
import DocumentDetailRemindersScreen from '../src/screens/completeProfileScreens/innerScreens/DocumentDetailRemindersScreen';
import HealthProfileScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileScreen';
import SeniorMedicineScheduleScreen from '../src/screens/completeProfileScreens/innerScreens/SeniorMedicineScheduleScreen';
import AddMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/AddMedicineScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Section 2 & Section 3 Complete Profile Screens', () => {
  test('renders ImportantDocumentsScreen (LPS-06) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <ImportantDocumentsScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Important documents' })).toBeTruthy();
    expect(root.findByProps({ children: 'TRAVEL AND DRIVING' })).toBeTruthy();
    expect(root.findByProps({ children: 'Passport' })).toBeTruthy();
    expect(root.findByProps({ children: 'US visa (B1/B2)' })).toBeTruthy();
    expect(root.findByProps({ children: 'Driving licence' })).toBeTruthy();
    expect(root.findByProps({ children: 'ID · OPTIONAL' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aadhaar' })).toBeTruthy();
    expect(root.findByProps({ children: 'PAN' })).toBeTruthy();
    expect(root.findByProps({ children: 'INSURANCE' })).toBeTruthy();
    expect(root.findByProps({ children: 'Star Health Family Floater' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add document' })).toBeTruthy();
  });

  test('renders DocumentDetailRemindersScreen (LPS-07) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <DocumentDetailRemindersScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Passport' })).toBeTruthy();
    expect(root.findByProps({ children: 'Passport_Priya.pdf' })).toBeTruthy();
    expect(root.findByProps({ children: '**** **** 4471' })).toBeTruthy();
    expect(root.findByProps({ children: 'REMIND ME BEFORE IT EXPIRES' })).toBeTruthy();
    expect(root.findByProps({ children: '6 months' })).toBeTruthy();
    expect(root.findByProps({ children: 'Priya, Rohan' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Add a renewal task automatically' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();
  });

  test('renders HealthProfileScreen (LPS-08) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <HealthProfileScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Health profile' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Only you and Rohan can see this.' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ children: 'Dr. Anjali Rao · General physician' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Penicillin' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dust' })).toBeTruthy();
    expect(root.findByProps({ children: 'Migraine' })).toBeTruthy();
    expect(root.findByProps({ children: 'Vitamin D · once a week' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();
  });

  test('renders SeniorMedicineScheduleScreen (LPS-11) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <SeniorMedicineScheduleScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(
      root.findByProps({ children: 'BP tablets run out on Sunday' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'TODAY' })).toBeTruthy();
    expect(root.findByProps({ children: '3 of 5 taken' })).toBeTruthy();
    expect(root.findByProps({ children: 'MORNING · 8:00 AM' })).toBeTruthy();
    expect(root.findByProps({ children: 'AFTERNOON · 2:00 PM' })).toBeTruthy();
    expect(root.findByProps({ children: 'NIGHT · 9:00 PM' })).toBeTruthy();
    expect(root.findByProps({ children: 'If a dose is missed' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add medicine' })).toBeTruthy();
  });

  test('renders AddMedicineScreen (LPS-11a) correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddMedicineScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add medicine' })).toBeTruthy();
    expect(root.findByProps({ children: 'Step 1 of 2 · For Dadi' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Scan the prescription instead' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'TYPE' })).toBeTruthy();
    expect(root.findByProps({ children: 'Tablet' })).toBeTruthy();
    expect(root.findByProps({ children: 'TAKE IT' })).toBeTruthy();
    expect(root.findByProps({ children: 'After food' })).toBeTruthy();
    expect(root.findByProps({ children: 'Next: set times' })).toBeTruthy();
  });
});

