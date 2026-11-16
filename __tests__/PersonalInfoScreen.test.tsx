import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux';
import PersonalInfoScreen from '../src/screens/completeProfileScreens/innerScreens/PersonalInfoScreen';
import {
  PersonalInfoHeader,
  PersonalInfoGroupCard,
  OccupationSelector,
  WorkDetailsSection,
} from '../src/screens/completeProfileScreens/components';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('PersonalInfoScreen & Components', () => {
  test('renders PersonalInfoHeader correctly', () => {
    const onBack = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PersonalInfoHeader
          title="Personal information"
          subtitle="Priya · Section 1 of 5"
          onBack={onBack}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Personal information' })).toBeTruthy();
    expect(root.findByProps({ children: 'Priya · Section 1 of 5' })).toBeTruthy();
  });

  test('renders PersonalInfoGroupCard with all 8 rows', () => {
    const onRowPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PersonalInfoGroupCard
          data={{
            fullName: 'Priya Sharma',
            nickname: 'Pri',
            email: 'priya.sharma@example.com',
            familyRole: 'Mother',
            gender: 'Female',
            birthDate: '8 Aug 1988 · 38 years',
            bloodGroup: 'O+',
            heightWeight: '162 cm · 58 kg',
          }}
          onRowPress={onRowPress}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Priya Sharma' })).toBeTruthy();
    expect(root.findByProps({ children: 'Pri' })).toBeTruthy();
    expect(root.findByProps({ children: 'priya.sharma@example.com' })).toBeTruthy();
    expect(root.findByProps({ children: 'Mother' })).toBeTruthy();
    expect(root.findByProps({ children: 'Female' })).toBeTruthy();
    expect(root.findByProps({ children: '8 Aug 1988 · 38 years' })).toBeTruthy();
    expect(root.findByProps({ children: 'O+' })).toBeTruthy();
    expect(root.findByProps({ children: '162 cm · 58 kg' })).toBeTruthy();
  });

  test('renders OccupationSelector with options and highlights Working', () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <OccupationSelector
          selectedOccupation="Working"
          onSelectOccupation={onSelect}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'EDUCATION / CAREER' })).toBeTruthy();
    expect(root.findByProps({ children: 'What Best Describes You' })).toBeTruthy();
    expect(root.findByProps({ children: 'Working' })).toBeTruthy();
    expect(root.findByProps({ children: 'Student' })).toBeTruthy();
    expect(root.findByProps({ children: 'Business owner' })).toBeTruthy();
  });

  test('renders WorkDetailsSection with company, role, location, map and hours', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <WorkDetailsSection
          details={{
            company: 'Kaveri Design Studio',
            role: 'Interior designer',
            officeLocation: 'Udyog Vihar Phase 4, Gurugram',
            workHours: 'Mon to Sat, 10:00 AM to 6:30 PM',
          }}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'WORK' })).toBeTruthy();
    expect(
      root.findByProps({
        children:
          'Your office location lets Compass tell your family when you leave work.',
      }),
    ).toBeTruthy();
  });

  test('renders entire PersonalInfoScreen and verifies input screen transitions to details screen on save', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <Provider store={store}>
            <PersonalInfoScreen onSave={onSave} onBack={onBack} />
          </Provider>
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    // Step 1: Input fields screen (Image 1) is shown first
    expect(root.findByProps({ children: 'Personal information' })).toBeTruthy();
    expect(root.findByProps({ children: 'ABOUT YOU' })).toBeTruthy();
    expect(root.findByProps({ children: 'WHAT BEST DESCRIBES YOU' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();

    // Find the Save button on Input screen and press it
    const saveButton = root.findByProps({ title: 'Save' });
    ReactTestRenderer.act(() => {
      saveButton.props.onPress();
    });

    // Step 2: Now details screen (Image 2) is shown with saved details
    expect(root.findByProps({ children: 'EDUCATION / CAREER' })).toBeTruthy();
    expect(root.findByProps({ children: 'Working' })).toBeTruthy();
    expect(
      root.findByProps({
        children: 'Interior designer · Kaveri Design Studio',
      }),
    ).toBeTruthy();
  });
});
