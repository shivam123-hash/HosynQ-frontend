import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import VaccineDetailScreen from '../src/screens/completeProfileScreens/innerScreens/VaccineDetailScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('VaccineDetailScreen', () => {
  it('renders VaccineDetailScreen correctly with default Influenza details', async () => {
    const handleBack = jest.fn();
    const handleEdit = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VaccineDetailScreen
            vaccine={{
              id: '1',
              name: 'Influenza',
              details: 'Last dose 14 Nov 2025\nNext due 15 Nov 2026',
              status: 'due',
              hasCertificate: true,
            }}
            childName="Aarav"
            onBack={handleBack}
            onEditVaccine={handleEdit}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Influenza' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aarav · Vaccination' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Due Sun, 15 Nov · in 3 days' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Schedule' })).toBeTruthy();
    expect(root.findByProps({ children: 'Yearly dose' })).toBeTruthy();
    expect(root.findByProps({ children: 'Reminder' })).toBeTruthy();
    expect(root.findByProps({ children: 'DOSE HISTORY' })).toBeTruthy();
    expect(root.findByProps({ children: '2025 dose' })).toBeTruthy();
    expect(root.findByProps({ children: '2024 dose' })).toBeTruthy();
    expect(root.findByProps({ children: '2023 dose' })).toBeTruthy();
    expect(
      root.findByProps({ children: "Mark this year's dose as given" }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Edit vaccine' })).toBeTruthy();
  });

  it('opens modal on "Mark this year\'s dose as given" and saves new dose', async () => {
    const handleSaveDose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VaccineDetailScreen
            vaccine={{
              id: '1',
              name: 'Influenza',
              status: 'due',
            }}
            childName="Aarav"
            onSaveDose={handleSaveDose}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    const markButton = root.findByProps({
      accessibilityLabel: "Mark this year's dose as given",
    });
    expect(markButton).toBeTruthy();

    // Open modal
    await ReactTestRenderer.act(async () => {
      markButton.props.onPress();
    });

    expect(root.findByProps({ children: 'Where (optional)' })).toBeTruthy();
    expect(
      root.findByProps({ children: 'Batch number (optional)' }),
    ).toBeTruthy();
    expect(root.findByProps({ children: 'Next due · suggested' })).toBeTruthy();

    const saveDoseBtn = root.findByProps({ title: 'Save dose' });
    expect(saveDoseBtn).toBeTruthy();

    // Save dose
    await ReactTestRenderer.act(async () => {
      await saveDoseBtn.props.onPress();
    });

    expect(handleSaveDose).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicOrPlace: 'Little Steps Clinic',
        batchNumber: 'FLU26-0931',
      }),
    );
  });

  it('selects dose card on tap and opens modal prefilled with that dose', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VaccineDetailScreen
            vaccine={{
              id: 'v-influenza-1',
              name: 'Influenza',
              status: 'due',
            }}
            childName="Aarav"
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    const doseCard = root.findByProps({
      accessibilityLabel: 'Dose history for 2025 dose',
    });
    expect(doseCard).toBeTruthy();

    // Tap dose card
    await ReactTestRenderer.act(async () => {
      doseCard.props.onPress();
    });

    // Check modal opened with 2025 dose title
    expect(root.findByProps({ children: 'Mark 2025 dose as given' })).toBeTruthy();
    expect(root.findByProps({ children: 'Influenza · Aarav' })).toBeTruthy();
  });

  it('renders header delete button and opens confirmation modal on tap', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VaccineDetailScreen
            vaccine={{
              id: 'v-influenza-1',
              name: 'Influenza',
              status: 'due',
            }}
            childName="Aarav"
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    const deleteBtn = root.findByProps({
      accessibilityLabel: 'Delete vaccine',
    });
    expect(deleteBtn).toBeTruthy();

    // Tap delete button in header
    await ReactTestRenderer.act(async () => {
      deleteBtn.props.onPress();
    });

    // Check confirmation modal appears
    expect(root.findByProps({ children: 'Delete vaccine?' })).toBeTruthy();
  });
});
