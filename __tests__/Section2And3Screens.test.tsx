import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ImportantDocumentsScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/ImportantDocumentsScreen';
import DocumentDetailRemindersScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/DocumentDetailRemindersScreen';
import AddPassportScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPassportScreen';
import AddVisaScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddVisaScreen';
import AddDrivingLicenceScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddDrivingLicenceScreen';
import AddAadhaarScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddAadhaarScreen';
import AddPanScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPanScreen';
import AddInsuranceScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddInsuranceScreen';
import DrivingLicenceDetailScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/DrivingLicenceDetailScreen';
import VisaDetailScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/VisaDetailScreen';
import AadhaarDetailScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AadhaarDetailScreen';
import PanDetailScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/PanDetailScreen';
import InsuranceDetailScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/InsuranceDetailScreen';
import HealthProfileScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileScreen';
import HealthProfileInputScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileInputScreen';
import HealthProfileDetailsScreen from '../src/screens/completeProfileScreens/innerScreens/HealthProfileDetailsScreen';
import SeniorMedicineScheduleScreen from '../src/screens/completeProfileScreens/innerScreens/SeniorMedicineScheduleScreen';
import AddMedicineScreen from '../src/screens/completeProfileScreens/innerScreens/AddMedicineScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Section 2 & Section 3 Complete Profile Screens', () => {
  test('renders ImportantDocumentsScreen landing view and bottom sheet correctly', () => {
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
    expect(root.findByProps({ children: 'No documents yet' })).toBeTruthy();
    expect(
      root.findByProps({
        children:
          "Add Aarav's passport, birth certificate or school ID. HosynQ reminds you before anything expires.",
      }),
    ).toBeTruthy();
    expect(root.findByProps({ children: '+ Add document' })).toBeTruthy();
    expect(root.findByProps({ children: 'Scan a document' })).toBeTruthy();

    // Trigger "+ Add document" to open bottom sheet
    const addBtn = root.findByProps({ title: '+ Add document' });
    ReactTestRenderer.act(() => {
      addBtn.props.onPress();
    });

    // Check modal contents
    expect(root.findByProps({ children: 'Add a document' })).toBeTruthy();
    expect(root.findByProps({ children: 'Passport' })).toBeTruthy();
  });

  test('renders ImportantDocumentsScreen detail navigation to landing correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <ImportantDocumentsScreen initialStep="details-dl" />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Driving licence' })).toBeTruthy();
    expect(root.findByProps({ children: 'Expired 10 days ago' })).toBeTruthy();
    expect(root.findByProps({ children: "I've renewed it" })).toBeTruthy();
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

  test('renders HealthProfileScreen flow (Input -> Save -> Combined Details & Schedule View)', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <HealthProfileScreen initialMode="input" />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    // Step 1: Input Screen (Image 1)
    expect(root.findByProps({ children: 'Health profile' })).toBeTruthy();
    expect(root.findByProps({ children: 'DOCTOR' })).toBeTruthy();
    expect(root.findByProps({ children: "Doctor's name" })).toBeTruthy();
    expect(root.findByProps({ children: 'Speciality' })).toBeTruthy();
    expect(root.findByProps({ children: "Doctor's phone" })).toBeTruthy();
    expect(root.findByProps({ children: 'Clinic name' })).toBeTruthy();
    expect(root.findByProps({ children: 'Clinic location' })).toBeTruthy();
    expect(root.findByProps({ children: 'HOSPITAL' })).toBeTruthy();
    expect(root.findByProps({ children: 'Preferred hospital' })).toBeTruthy();
    expect(root.findByProps({ children: 'ALLERGIES AND CONDITIONS' })).toBeTruthy();
    expect(root.findByProps({ children: 'Allergies' })).toBeTruthy();
    expect(root.findByProps({ children: 'Conditions' })).toBeTruthy();
    expect(root.findByProps({ children: 'MEDICATIONS' })).toBeTruthy();
    expect(root.findByProps({ children: 'CHECKUPS' })).toBeTruthy();
    expect(root.findByProps({ children: 'EYESIGHT' })).toBeTruthy();
    expect(root.findByProps({ children: 'Glasses' })).toBeTruthy();
    expect(root.findByProps({ children: 'Attach prescription or reports' })).toBeTruthy();

    // Tap Save button to transition to Combined Details & Schedule View (Image 2 + Image 3)
    const saveBtn = root.findByProps({ title: 'Save' });
    ReactTestRenderer.act(() => {
      saveBtn.props.onPress();
    });

    // Step 2: Combined Details Screen (Image 2 + Image 3)
    expect(root.findByProps({ children: 'Only you and Rohan can see this.' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dr. Anjali Rao · General physician' })).toBeTruthy();
    expect(root.findByProps({ children: 'Penicillin' })).toBeTruthy();
    expect(root.findByProps({ children: 'Dust' })).toBeTruthy();
    expect(root.findByProps({ children: 'Migraine' })).toBeTruthy();
    expect(root.findByProps({ children: 'Vitamin D · once a week' })).toBeTruthy();
    // Schedule section (Image 3)
    expect(root.findByProps({ children: 'BP tablets run out on Sunday' })).toBeTruthy();
    expect(root.findByProps({ children: 'TODAY' })).toBeTruthy();
    expect(root.findByProps({ children: 'MORNING · 8:00 AM' })).toBeTruthy();
    expect(root.findByProps({ children: 'AFTERNOON · 2:00 PM' })).toBeTruthy();
    expect(root.findByProps({ children: 'NIGHT · 9:00 PM' })).toBeTruthy();
    expect(root.findByProps({ children: 'If a dose is missed' })).toBeTruthy();
    expect(root.findByProps({ children: '+ Add medicine' })).toBeTruthy();
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

  test('renders AddPassportScreen and verifies modal opens on Save passport', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddPassportScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add passport' })).toBeTruthy();
    expect(root.findByProps({ children: 'For Priya' })).toBeTruthy();
    expect(root.findByProps({ children: 'Name as on passport' })).toBeTruthy();
    expect(root.findByProps({ children: 'Passport number' })).toBeTruthy();
    expect(root.findByProps({ children: 'Date of issue' })).toBeTruthy();
    expect(root.findByProps({ children: 'Date of expiry' })).toBeTruthy();
    expect(root.findByProps({ children: 'Place of issue' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save passport' })).toBeTruthy();

    const savePassportBtn = root.findByProps({ title: 'Save passport' });
    ReactTestRenderer.act(() => {
      savePassportBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Upload Passport Photos' })).toBeTruthy();
    expect(root.findByProps({ children: 'Confirm & Save' })).toBeTruthy();
  });

  test('renders AddVisaScreen correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddVisaScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add visa' })).toBeTruthy();
    expect(root.findByProps({ children: 'For Priya' })).toBeTruthy();
    expect(root.findByProps({ children: 'Tourist or business' })).toBeTruthy();
    expect(root.findByProps({ children: 'Visa number' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save visa' })).toBeTruthy();
  });

  test('renders AddDrivingLicenceScreen and DrivingLicenceDetailScreen correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddDrivingLicenceScreen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add driving licence' })).toBeTruthy();
    expect(root.findByProps({ children: 'Licence number' })).toBeTruthy();
    expect(root.findByProps({ children: 'Car (LMV)' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save licence' })).toBeTruthy();

    let detailRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      detailRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <DrivingLicenceDetailScreen />
        </SafeAreaProvider>,
      );
    });
    const detailRoot = detailRenderer!.root;
    expect(detailRoot.findByProps({ children: 'Driving licence' })).toBeTruthy();
    expect(detailRoot.findByProps({ children: 'Expired 10 days ago' })).toBeTruthy();
    expect(detailRoot.findByProps({ children: "I've renewed it" })).toBeTruthy();
  });

  test('renders AddAadhaarScreen, AddPanScreen, and AddInsuranceScreen correctly', () => {
    let aadhaarRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      aadhaarRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddAadhaarScreen />
        </SafeAreaProvider>,
      );
    });
    expect(aadhaarRenderer!.root.findByProps({ children: 'Add Aadhaar' })).toBeTruthy();
    expect(aadhaarRenderer!.root.findByProps({ children: 'Keep only the last 4 numbers' })).toBeTruthy();

    let panRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      panRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddPanScreen />
        </SafeAreaProvider>,
      );
    });
    expect(panRenderer!.root.findByProps({ children: 'Add PAN' })).toBeTruthy();
    expect(panRenderer!.root.findByProps({ children: 'PAN has 10 characters, like ABCDE1234F.' })).toBeTruthy();

    let insuranceRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      insuranceRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddInsuranceScreen />
        </SafeAreaProvider>,
      );
    });
    expect(insuranceRenderer!.root.findByProps({ children: 'Add insurance' })).toBeTruthy();
    expect(insuranceRenderer!.root.findByProps({ children: 'Save insurance' })).toBeTruthy();
  });

  test('renders VisaDetailScreen, AadhaarDetailScreen, PanDetailScreen, and InsuranceDetailScreen correctly', () => {
    let visaRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      visaRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <VisaDetailScreen />
        </SafeAreaProvider>,
      );
    });
    expect(visaRenderer!.root.findByProps({ children: 'US visa (B1/B2)' })).toBeTruthy();
    expect(visaRenderer!.root.findByProps({ children: 'H1234567' })).toBeTruthy();

    let aadhaarRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      aadhaarRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AadhaarDetailScreen />
        </SafeAreaProvider>,
      );
    });
    expect(aadhaarRenderer!.root.findByProps({ children: 'Aadhaar' })).toBeTruthy();
    expect(aadhaarRenderer!.root.findByProps({ children: 'Saved in Family Vault' })).toBeTruthy();

    let panRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      panRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <PanDetailScreen />
        </SafeAreaProvider>,
      );
    });
    expect(panRenderer!.root.findByProps({ children: 'PAN' })).toBeTruthy();
    expect(panRenderer!.root.findByProps({ children: 'ABCDE 1234 F' })).toBeTruthy();

    let insuranceRenderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      insuranceRenderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <InsuranceDetailScreen />
        </SafeAreaProvider>,
      );
    });
    expect(insuranceRenderer!.root.findByProps({ children: 'Star Health Family Floater' })).toBeTruthy();
    expect(insuranceRenderer!.root.findByProps({ children: '•••• 5521' })).toBeTruthy();
  });
});

