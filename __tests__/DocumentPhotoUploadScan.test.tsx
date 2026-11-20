import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DocumentPhotoUploadField from '../src/screens/completeProfileScreens/components/DocumentPhotoUploadField';
import AddPassportScreen, {
  DEFAULT_PASSPORT_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPassportScreen';
import AddVisaScreen, {
  DEFAULT_VISA_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddVisaScreen';
import AddDrivingLicenceScreen, {
  DEFAULT_DL_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddDrivingLicenceScreen';
import AddAadhaarScreen, {
  DEFAULT_AADHAAR_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddAadhaarScreen';
import AddPanScreen, {
  DEFAULT_PAN_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPanScreen';
import AddInsuranceScreen, {
  DEFAULT_INSURANCE_DATA,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddInsuranceScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Document Upload & Scan Feature', () => {
  const store = configureStore({
    reducer: {
      lifeProfile: () => ({
        full: null,
        summary: null,
        loading: false,
      }),
      auth: () => ({ user: { id: 'test-user-id', memberId: 'test-member-id' } }),
      family: () => ({ myMemberId: 'test-member-id' }),
    },
  });

  it('ensures all document screens have blank initial default data (no dummy pre-filled values)', () => {
    // 1. Passport
    expect(DEFAULT_PASSPORT_DATA.fullName).toBe('');
    expect(DEFAULT_PASSPORT_DATA.passportNumber).toBe('');
    expect(DEFAULT_PASSPORT_DATA.issueDate).toBe('');
    expect(DEFAULT_PASSPORT_DATA.expiryDate).toBe('');

    // 2. Visa
    expect(DEFAULT_VISA_DATA.visaNumber).toBe('');
    expect(DEFAULT_VISA_DATA.country).toBe('');
    expect(DEFAULT_VISA_DATA.validFrom).toBe('');
    expect(DEFAULT_VISA_DATA.validUntil).toBe('');

    // 3. Driving Licence
    expect(DEFAULT_DL_DATA.licenceNumber).toBe('');
    expect(DEFAULT_DL_DATA.issueDate).toBe('');
    expect(DEFAULT_DL_DATA.validTill).toBe('');

    // 4. Aadhaar
    expect(DEFAULT_AADHAAR_DATA.aadhaarNumber).toBe('');
    expect(DEFAULT_AADHAAR_DATA.fullName).toBe('');

    // 5. PAN
    expect(DEFAULT_PAN_DATA.panNumber).toBe('');
    expect(DEFAULT_PAN_DATA.fullName).toBe('');
    expect(DEFAULT_PAN_DATA.dob).toBe('');

    // 6. Insurance
    expect(DEFAULT_INSURANCE_DATA.insurer).toBe('');
    expect(DEFAULT_INSURANCE_DATA.policyNumber).toBe('');
    expect(DEFAULT_INSURANCE_DATA.renewalDate).toBe('');
  });

  it('renders DocumentPhotoUploadField at the top of AddPassportScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddPassportScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('PASSPORT');
    expect(uploadField.props.documentTitle).toBe('Passport');
  });

  it('renders DocumentPhotoUploadField at the top of AddVisaScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddVisaScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('VISA');
    expect(uploadField.props.documentTitle).toBe('Visa');
  });

  it('renders DocumentPhotoUploadField at the top of AddAadhaarScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddAadhaarScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('AADHAAR');
    expect(uploadField.props.documentTitle).toBe('Aadhaar');
  });

  it('renders DocumentPhotoUploadField at the top of AddPanScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddPanScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('PAN');
    expect(uploadField.props.documentTitle).toBe('PAN Card');
  });

  it('renders DocumentPhotoUploadField at the top of AddDrivingLicenceScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddDrivingLicenceScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('DRIVING_LICENCE');
    expect(uploadField.props.documentTitle).toBe('Driving Licence');
  });

  it('renders DocumentPhotoUploadField at the top of AddInsuranceScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <AddInsuranceScreen userName="Rupesh" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const uploadField = renderer!.root.findByType(DocumentPhotoUploadField);
    expect(uploadField).toBeTruthy();
    expect(uploadField.props.documentType).toBe('INSURANCE');
    expect(uploadField.props.documentTitle).toBe('Insurance');
  });
});

