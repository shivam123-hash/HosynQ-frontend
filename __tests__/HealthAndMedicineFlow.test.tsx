import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  buildHealthPayload,
  mapBackendToHealthForm,
  formatEyePower,
  formatDoctorPhone,
} from '../src/screens/completeProfileScreens/innerScreens/healthPayloadUtils';
import { DEFAULT_HEALTH_FORM_VALUES } from '../src/screens/completeProfileScreens/innerScreens/HealthProfileInputScreen';
import {
  convertTo24Hour,
  parseUnitsLeft,
} from '../src/screens/completeProfileScreens/innerScreens/WhenToTakeMedicineScreen';
import WhenToTakeMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/WhenToTakeMedicineScreen';
import AddMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/AddMedicineScreen';
import HealthProfileScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileScreen';
import HealthProfileDetailsScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileDetailsScreen';
import medicineReducer from '../src/redux/features/medicine/medicineSlice';
import familyReducer from '../src/redux/features/family/familySlice';
import lifeProfileReducer from '../src/redux/features/lifeProfile/lifeProfileSlice';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const createMockStore = (initialState?: any) =>
  configureStore({
    reducer: {
      medicine: medicineReducer,
      family: familyReducer,
      lifeProfile: lifeProfileReducer,
    } as any,
    preloadedState: initialState,
  });

describe('Health and Medicine Integration Tests', () => {
  describe('healthPayloadUtils', () => {
    test('buildHealthPayload builds exact payload matching backend schema', () => {
      const form = {
        doctor: {
          doctorName: 'Dr. Anjali Rao',
          speciality: 'General Physician',
          phoneCode: '+91',
          phoneNumber: '9876501234',
          clinicName: 'Rao Clinic',
          clinicLocation: 'Sector 47, Gurugram',
        },
        hospital: {
          preferredHospital: 'CityCare Hospital, Sector 38',
        },
        allergies: [
          { id: '1', label: 'Penicillin · Severe', color: '#EF4444' },
          { id: '2', label: 'Dust · Mild', color: '#F59E0B' },
        ],
        conditions: [
          { id: '1', label: 'Migraine · Since 2015', color: '#8E9BAE' },
        ],
        checkups: {
          lastCheckup: '12 Mar 2026',
          nextCheckup: '01 Mar 2027',
          repeatEvery: 'Yearly',
        },
        eyesight: {
          wears: 'Glasses' as const,
          rightEyePower: '-1.25',
          leftEyePower: '-1.00',
          lastEyeTest: '14 Jan 2026',
        },
      };

      const payload = buildHealthPayload(form as any);

      expect(payload.primaryDoctor).toBe('Dr. Anjali Rao');
      expect(payload.doctorSpeciality).toBe('GENERAL_PHYSICIAN');
      expect(payload.doctorPhone).toBe('+919876501234');
      expect(payload.clinicName).toBe('Rao Clinic');
      expect(payload.doctorClinicLocation).toBe('Sector 47, Gurugram');
      expect(payload.preferredHospital).toBe('CityCare Hospital, Sector 38');
      expect(payload.allergies).toEqual([
        { name: 'Penicillin', severity: 'SEVERE' },
        { name: 'Dust', severity: 'MILD' },
      ]);
      expect(payload.medicalConditions).toEqual([
        { name: 'Migraine', sinceYear: 2015 },
      ]);
      expect(payload.lastCheckupDate).toBe('2026-03-12');
      expect(payload.nextCheckupDate).toBe('2027-03-01');
      expect(payload.checkupRepeat).toBe('YEARLY');
      expect(payload.eyewear).toBe('GLASSES');
      expect(payload.rightEyePower).toBe('-1.25');
      expect(payload.leftEyePower).toBe('-1.00');
    });

    test('formatDoctorPhone formats raw 10-digit Indian numbers with +91', () => {
      expect(formatDoctorPhone('+91', '9876501234')).toBe('+919876501234');
      expect(formatDoctorPhone(undefined, '+919876501234')).toBe('+919876501234');
      expect(formatDoctorPhone('+91', '')).toBeUndefined();
    });

    test('formatEyePower formats powers correctly', () => {
      expect(formatEyePower('-1.25')).toBe('-1.25');
      expect(formatEyePower('1.5')).toBe('1.5');
    });

    test('mapBackendToHealthForm restores form values correctly from API', () => {
      const backendHealth = {
        primaryDoctor: 'Dr. Anjali Rao',
        doctorSpeciality: 'GENERAL_PHYSICIAN',
        doctorPhone: '+919876501234',
        clinicName: 'Rao Clinic',
        doctorClinicLocation: 'Sector 47, Gurugram',
        preferredHospital: 'CityCare Hospital, Sector 38',
        allergies: [{ name: 'Penicillin', severity: 'SEVERE' }],
        medicalConditions: [{ name: 'Migraine', sinceYear: 2015 }],
        lastCheckupDate: '2026-03-12',
        nextCheckupDate: '2027-03-01',
        checkupRepeat: 'YEARLY',
        eyewear: 'GLASSES',
        rightEyePower: '-1.25',
        leftEyePower: '-1.00',
      };

      const mapped = mapBackendToHealthForm(backendHealth);
      expect(mapped.doctor.doctorName).toBe('Dr. Anjali Rao');
      expect(mapped.doctor.speciality).toBe('General physician');
      expect(mapped.allergies[0].label).toContain('Penicillin');
      expect(mapped.conditions[0].label).toContain('Migraine');
      expect(mapped.checkups.repeatEvery).toBe('1 year');
      expect(mapped.eyesight.wears).toBe('Glasses');
    });
  });

  describe('WhenToTakeMedicine helpers', () => {
    test('convertTo24Hour converts 12-hour strings to HH:mm 24-hour time', () => {
      expect(convertTo24Hour('8:00 AM')).toBe('08:00');
      expect(convertTo24Hour('9:00 PM')).toBe('21:00');
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');
      expect(convertTo24Hour('12:15 PM')).toBe('12:15');
      expect(convertTo24Hour('08:00')).toBe('08:00');
    });

    test('parseUnitsLeft extracts integer tablet count', () => {
      expect(parseUnitsLeft('12 tablets · lasts until Tue, 17 Nov')).toBe(12);
      expect(parseUnitsLeft('30')).toBe(30);
      expect(parseUnitsLeft('no number')).toBe(12);
    });
  });

  describe('Screens Rendering with Redux State', () => {
    test('HealthProfileDetailsScreen renders empty state when no medicines exist', () => {
      const store = createMockStore({
        medicine: { medicines: [], currentMedicine: null, isLoading: false, isSaving: false, error: null },
        family: { myFamilyData: { family: { members: [{ id: 'mem-1', name: 'Dadi' }] } } },
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <HealthProfileDetailsScreen />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'No medicines added yet' })).toBeTruthy();
      expect(root.findByProps({ children: '+ Add medicine' })).toBeTruthy();
    });

    test('HealthProfileDetailsScreen renders dynamic medicines when present in Redux', () => {
      const mockMedicines = [
        {
          id: 'med-1',
          name: 'BP tablet',
          strength: '5 mg',
          type: 'TABLET',
          foodTiming: 'AFTER_FOOD',
          timesPerDay: 2,
          doses: [
            { label: 'Morning', timeOfDay: '08:00', foodNote: 'after breakfast' },
            { label: 'Night', timeOfDay: '21:00', foodNote: 'after dinner' },
          ],
        },
      ];

      const store = createMockStore({
        medicine: { medicines: mockMedicines, currentMedicine: null, isLoading: false, isSaving: false, error: null },
        family: { myFamilyData: { family: { members: [{ id: 'mem-1', name: 'Dadi' }] } } },
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <HealthProfileDetailsScreen />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findAllByProps({ children: 'BP tablet' }).length).toBeGreaterThan(0);
    });

    test('AddMedicineScreen renders form inputs and steppers correctly', () => {
      const store = createMockStore();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <AddMedicineScreen />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'Add medicine' })).toBeTruthy();
      expect(root.findByProps({ children: 'Medicine name' })).toBeTruthy();
      expect(root.findByProps({ children: 'Next: set times' })).toBeTruthy();
    });

    test('WhenToTakeMedicineScreen renders schedules, doses, and switches', () => {
      const store = createMockStore();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <WhenToTakeMedicineScreen medicineName="BP tablet" />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'When to take it' })).toBeTruthy();
      expect(root.findByProps({ children: 'Dose 1 · Morning' })).toBeTruthy();
      expect(root.findByProps({ children: 'Save medicine' })).toBeTruthy();
    });

    test('WhenToTakeMedicineScreen dynamically adds 3rd and 4th dose slots', () => {
      const store = createMockStore();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <WhenToTakeMedicineScreen medicineName="BP tablet" initialData={{ timesPerDay: 4 }} />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'Dose 1 · Morning' })).toBeTruthy();
      expect(root.findByProps({ children: 'Dose 2 · Afternoon' })).toBeTruthy();
      expect(root.findByProps({ children: 'Dose 3 · Evening' })).toBeTruthy();
      expect(root.findByProps({ children: 'Dose 4 · Night' })).toBeTruthy();
    });

    test('HealthProfileScreen renders input mode by default and displays Save button', () => {
      const store = createMockStore();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <HealthProfileScreen initialMode="input" userName="Priya" />
            </SafeAreaProvider>
          </Provider>,
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ subtitle: 'Priya · Section 3 of 5 · Edit' })).toBeTruthy();
      expect(root.findByProps({ title: 'Save' })).toBeTruthy();
    });
  });
});
