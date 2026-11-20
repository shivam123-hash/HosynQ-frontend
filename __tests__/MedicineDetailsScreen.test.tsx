import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { configureStore } from '@reduxjs/toolkit';
import MedicineDetailsScreen from '../src/screens/completeProfileScreens/innerScreens/MedicineDetailsScreen';
import medicineReducer from '../src/redux/features/medicine/medicineSlice';
import lifeProfileReducer from '../src/redux/features/lifeProfile/lifeProfileSlice';
import { medicineServices } from '../src/services/medicineServices';

jest.mock('../src/services/medicineServices', () => ({
  medicineServices: {
    getMedicine: jest.fn(),
    deleteMedicine: jest.fn(),
    listMedicines: jest.fn(),
    createMedicine: jest.fn(),
    updateMedicine: jest.fn(),
  },
}));

describe('MedicineDetailsScreen', () => {
  const safeAreaMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 47, left: 0, right: 0, bottom: 34 },
  };

  const mockMedicine = {
    id: 'med-123',
    memberId: 'member-456',
    name: 'BP tablet',
    purpose: 'Blood pressure',
    type: 'TABLET',
    doseAmount: 1,
    doseUnit: 'tablet',
    strength: '5 mg',
    foodTiming: 'AFTER_FOOD',
    frequency: 'EVERY_DAY',
    timesPerDay: 2,
    doses: [
      { id: 'dose-1', label: 'Morning', timeOfDay: '08:00', foodNote: 'after breakfast' },
      { id: 'dose-2', label: 'Night', timeOfDay: '21:00', foodNote: 'after dinner' },
    ],
    startsOn: '2026-11-11',
    endsOn: null,
    ongoing: true,
    unitsLeft: 12,
    daysLeft: 6,
    runsOutOn: '2026-11-17T00:00:00.000Z',
    needsReorder: false,
    remindAtEachDose: true,
    missedDoseAfterMin: 30,
    reorderWhenDaysLeft: 5,
  };

  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (medicineServices.getMedicine as jest.Mock).mockResolvedValue({
      success: true,
      medicine: mockMedicine,
    });
    (medicineServices.deleteMedicine as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Medicine removed.',
    });

    store = configureStore({
      reducer: {
        medicine: medicineReducer,
        lifeProfile: lifeProfileReducer,
      },
      preloadedState: {
        medicine: {
          medicines: [mockMedicine as any],
          currentMedicine: mockMedicine as any,
          isLoading: false,
          isSaving: false,
          error: null,
        },
      },
    });
  });

  it('renders medicine details with schedule, supply and doses', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <MedicineDetailsScreen
              medicineId="med-123"
              medicineName="BP tablet"
              userName="Priya"
            />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const root = renderer!.root;
    // Check that medicine name is displayed
    const nameTexts = root.findAll((node) => node.props?.children === 'BP tablet');
    expect(nameTexts.length).toBeGreaterThanOrEqual(1);

    // Check that doses are rendered (Morning and Night)
    const morningDose = root.findAll((node) => node.props?.children === 'Morning');
    expect(morningDose.length).toBeGreaterThanOrEqual(1);

    const nightDose = root.findAll((node) => node.props?.children === 'Night');
    expect(nightDose.length).toBeGreaterThanOrEqual(1);

    // Check that units left is rendered
    const unitsLeftText = root.findAll((node) => node.props?.children === '12 tablets');
    expect(unitsLeftText.length).toBeGreaterThanOrEqual(1);
  });

  it('triggers delete flow when delete button is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onBack = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <MedicineDetailsScreen
              medicineId="med-123"
              medicineName="BP tablet"
              userName="Priya"
              onBack={onBack}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const root = renderer!.root;
    const deleteBtn = root.findAllByProps({ accessibilityLabel: 'Delete medicine' })[0];
    expect(deleteBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      deleteBtn.props.onPress();
    });

    // Verify confirmation modal is shown with medicine name
    const confirmModal = root.findByProps({
      title: 'Delete medicine?',
    });
    expect(confirmModal).toBeTruthy();
    expect(confirmModal.props.message).toContain('BP tablet');

    // Trigger confirmation action
    await ReactTestRenderer.act(async () => {
      await confirmModal.props.onConfirm?.();
    });

    expect(medicineServices.deleteMedicine).toHaveBeenCalledWith('med-123');
    expect(onBack).toHaveBeenCalled();
  });
});

