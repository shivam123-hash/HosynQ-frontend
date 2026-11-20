import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  buildPassportPayload,
  buildVisaPayload,
  buildDrivingLicencePayload,
  buildAadhaarPayload,
  buildPanPayload,
  buildInsurancePayload,
  buildOtherDocumentPayload,
  toIsoDateString,
  mapCountryCode,
  mapVisaType,
  mapVisaEntries,
  mapVehicleClasses,
  mapInsuranceType,
  parseCurrencyNumber,
  mapReminderLeadDays,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/documentPayloadUtils';
import ImportantDocumentsScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/ImportantDocumentsScreen';
import AddPassportScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPassportScreen';
import AddVisaScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddVisaScreen';
import AddDrivingLicenceScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddDrivingLicenceScreen';
import AddAadhaarScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddAadhaarScreen';
import AddPanScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPanScreen';
import AddInsuranceScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddInsuranceScreen';
import DocumentDetailRemindersScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/DocumentDetailRemindersScreen';
import lifeProfileServices from '../src/services/lifeProfileServices';

jest.spyOn(lifeProfileServices, 'getLifeProfile').mockResolvedValue({
  success: true,
  data: { documents: [] },
  progress: {},
} as any);

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Document Save & Edit Payload Builders (Step 2 - Important Documents)', () => {
  describe('1. Passport Payload Builder', () => {
    it('creates passport payload for first time (omits id, includes scanId & fields)', () => {
      const formData = {
        fullName: 'Priya Sharma',
        passportNumber: 'k1234567',
        issueDate: '2017-08-22',
        expiryDate: '2027-08-21',
        placeOfIssue: 'Delhi',
        reminders: ['6 months', '1 month'],
        autoRenewal: true,
        scanId: '8c5e6288-64fe-4efc-8e5a-c4c71702d093',
      };

      const payload = buildPassportPayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('PASSPORT');
      expect(payload.scanId).toBe('8c5e6288-64fe-4efc-8e5a-c4c71702d093');
      expect(payload.nameOnDocument).toBe('PRIYA SHARMA');
      expect(payload.number).toBe('K1234567');
      expect(payload.issuedOn).toBe('2017-08-22');
      expect(payload.expiresOn).toBe('2027-08-21');
      expect(payload.issuedAt).toBe('Delhi');
      expect(payload.reminderLeadDays).toEqual([180, 30]);
      expect(payload.autoRenewalTask).toBe(true);
    });

    it('creates passport edit payload (includes document id)', () => {
      const formData = {
        fullName: 'Priya Sharma',
        passportNumber: 'Z9999999',
        issueDate: '2025-03-14',
        expiryDate: '2035-03-13',
        placeOfIssue: 'Mumbai',
        reminders: ['6 months', '1 month', '1 week'],
        autoRenewal: true,
      };

      const existingDocId = '90749ac6-78f3-4205-908b-359783d35d7d';
      const payload = buildPassportPayload(formData, existingDocId);
      expect(payload.id).toBe(existingDocId);
      expect(payload.type).toBe('PASSPORT');
      expect(payload.number).toBe('Z9999999');
      expect(payload.issuedAt).toBe('Mumbai');
      expect(payload.reminderLeadDays).toEqual([180, 30, 7]);
    });
  });

  describe('2. Visa Payload Builder', () => {
    it('creates visa payload for first time with country code normalization', () => {
      const formData = {
        country: 'USA',
        visaType: 'Tourist or business',
        visaNumber: 'H1234567',
        validFrom: '2017-03-04',
        validUntil: '2027-03-03',
        entries: 'Multiple',
        reminders: ['6 months', '1 month'],
        linkedPassportId: 'passport-uuid-123',
        scanId: 'visa-scan-id-456',
      };

      const payload = buildVisaPayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('VISA');
      expect(payload.scanId).toBe('visa-scan-id-456');
      expect(payload.country).toBe('USA');
      expect(payload.visaType).toBe('TOURIST_OR_BUSINESS');
      expect(payload.visaEntries).toBe('MULTIPLE');
      expect(payload.number).toBe('H1234567');
      expect(payload.issuedOn).toBe('2017-03-04');
      expect(payload.expiresOn).toBe('2027-03-03');
      expect(payload.linkedDocumentId).toBe('passport-uuid-123');
      expect(payload.reminderLeadDays).toEqual([180, 30]);
      // Note: autoRenewalTask does not apply to VISA
      expect(payload.autoRenewalTask).toBeUndefined();
    });

    it('creates visa edit payload with id', () => {
      const formData = {
        country: 'United Kingdom',
        visaType: 'Work',
        visaNumber: 'UK987654',
        validFrom: '2020-01-01',
        validUntil: '2025-01-01',
        entries: 'Single',
      };
      const existingId = 'visa-existing-id';
      const payload = buildVisaPayload(formData, existingId);
      expect(payload.id).toBe(existingId);
      expect(payload.country).toBe('GBR');
      expect(payload.visaType).toBe('WORK');
      expect(payload.visaEntries).toBe('SINGLE');
    });
  });

  describe('3. Driving Licence Payload Builder', () => {
    it('creates DL payload with vehicle classes mapping', () => {
      const formData = {
        licenceNumber: 'HR26 20080012345',
        vehiclesAllowed: ['Car (LMV)', 'Two-wheeler (MCWG)'],
        issueDate: '2008-08-09',
        validTill: '2028-08-08',
        issuingRTO: 'Gurugram',
        reminders: ['6 months', '1 month'],
        scanId: 'dl-scan-id-789',
      };

      const payload = buildDrivingLicencePayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('DRIVING_LICENCE');
      expect(payload.number).toBe('HR26 20080012345');
      expect(payload.vehicleClasses).toEqual(['CAR_LMV', 'TWO_WHEELER_MCWG']);
      expect(payload.issuedOn).toBe('2008-08-09');
      expect(payload.expiresOn).toBe('2028-08-08');
      expect(payload.issuedAt).toBe('Gurugram');
      expect(payload.reminderLeadDays).toEqual([180, 30]);
    });
  });

  describe('4. Aadhaar Payload Builder', () => {
    it('creates Aadhaar payload with keepLast4Only and strips extra characters', () => {
      const formData = {
        aadhaarNumber: '4197 3443 7228',
        fullName: 'Priya Sharma',
        keepLastFourOnly: true,
        scanId: 'ad01dcaa-6287-43ab-bd1a-d4df2e26e223',
      };

      const payload = buildAadhaarPayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('AADHAAR');
      expect(payload.scanId).toBe('ad01dcaa-6287-43ab-bd1a-d4df2e26e223');
      expect(payload.number).toBe('419734437228');
      expect(payload.nameOnDocument).toBe('Priya Sharma');
      expect(payload.keepLast4Only).toBe(true);
      // Aadhaar never expires: no issuedOn, expiresOn, or reminders
      expect(payload.issuedOn).toBeUndefined();
      expect(payload.expiresOn).toBeUndefined();
    });
  });

  describe('5. PAN Payload Builder', () => {
    it('creates PAN payload with uppercase pan number and date of birth', () => {
      const formData = {
        panNumber: 'abcpe1234f',
        fullName: 'Priya Sharma',
        dob: '1988-08-08',
        scanId: 'pan-scan-id',
      };

      const payload = buildPanPayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('PAN');
      expect(payload.number).toBe('ABCPE1234F');
      expect(payload.nameOnDocument).toBe('Priya Sharma');
      expect(payload.dateOfBirth).toBe('1988-08-08');
      // PAN never expires: no expiresOn
      expect(payload.expiresOn).toBeUndefined();
    });

    it('sanitizes spaces, hyphens, and extracts pan from OCR data.number', () => {
      const ocrData = {
        number: ' ABCPE 1234 F ',
        nameOnDocument: 'PRIYA SHARMA',
        dateOfBirth: '1988-08-08',
        scanId: 'pan-scan-id-ocr',
      };

      const payload = buildPanPayload(ocrData);
      expect(payload.type).toBe('PAN');
      expect(payload.number).toBe('ABCPE1234F');
      expect(payload.number).toHaveLength(10);
      expect(/^[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]$/.test(payload.number)).toBe(true);
    });
  });

  describe('6. Insurance Payload Builder', () => {
    it('creates Insurance payload with integer currency values', () => {
      const formData = {
        type: 'Health',
        insurer: 'Star Health',
        planName: 'Family Floater',
        policyNumber: '11240034567890',
        sumInsured: '₹10,00,000',
        premiumPerYear: '24,600',
        renewalDate: '2027-03-12',
        coveredMemberIds: ['mem-1', 'mem-2'],
        scanId: 'ins-scan-id',
      };

      const payload = buildInsurancePayload(formData);
      expect(payload.id).toBeUndefined();
      expect(payload.type).toBe('INSURANCE');
      expect(payload.insuranceType).toBe('HEALTH');
      expect(payload.insurer).toBe('Star Health');
      expect(payload.planName).toBe('Family Floater');
      expect(payload.number).toBe('11240034567890');
      expect(payload.sumInsured).toBe(1000000);
      expect(payload.annualPremium).toBe(24600);
      expect(payload.expiresOn).toBe('2027-03-12');
      expect(payload.coveredMemberIds).toEqual(['mem-1', 'mem-2']);
      expect(payload.reminderLeadDays).toEqual([30, 7]);
    });
  });

  describe('7. Other Document Payload Builder', () => {
    it('creates other document payload with custom label', () => {
      const formData = {
        label: 'Voter ID',
        number: 'ABC1234567',
        nameOnDocument: 'Priya Sharma',
        dateOfBirth: '1988-08-08',
        issuedOn: '2019-01-10',
        issuedAt: 'Delhi',
        expiresOn: null,
      };

      const payload = buildOtherDocumentPayload(formData);
      expect(payload.type).toBe('OTHER');
      expect(payload.label).toBe('Voter ID');
      expect(payload.number).toBe('ABC1234567');
      expect(payload.issuedAt).toBe('Delhi');
    });
  });

  describe('8. UI Screen Component Render & Prop Verification', () => {
    const store = configureStore({
      reducer: {
        lifeProfile: () => ({
          full: {
            data: {
              documents: [
                {
                  id: 'doc-pass-1',
                  type: 'PASSPORT',
                  label: 'Passport',
                  number: 'K1234567',
                  last4: '4567',
                  nameOnDocument: 'PRIYA SHARMA',
                  issuedOn: '2017-08-22',
                  issuedAt: 'Delhi',
                  expiresOn: '2027-08-21',
                  status: 'VALID',
                },
              ],
            },
          },
          documents: {
            data: {
              documents: [
                {
                  id: 'doc-pass-1',
                  type: 'PASSPORT',
                  label: 'Passport',
                  number: 'K1234567',
                  last4: '4567',
                  nameOnDocument: 'PRIYA SHARMA',
                  issuedOn: '2017-08-22',
                  issuedAt: 'Delhi',
                  expiresOn: '2027-08-21',
                  status: 'VALID',
                },
              ],
            },
          },
          loading: false,
        }),
        auth: () => ({ user: { id: 'u1', memberId: 'm1' } }),
        family: () => ({ myMemberId: 'm1' }),
      },
    });

    it('renders ImportantDocumentsScreen and shows populated documents list', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <ImportantDocumentsScreen userName="Priya" memberId="m1" />
            </SafeAreaProvider>
          </Provider>
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Important documents');
      expect(str).toContain('Documents (1 Added)');
      expect(str).toContain('Passport');
    });

    it('AddPassportScreen displays "Edit passport" when documentId is passed', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <AddPassportScreen
                userName="Priya"
                memberId="m1"
                documentId="doc-pass-1"
              />
            </SafeAreaProvider>
          </Provider>
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Edit passport');
      expect(str).toContain('Update passport');
    });

    it('AddPassportScreen displays "Add passport" when documentId is omitted', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <AddPassportScreen
                userName="Priya"
                memberId="m1"
              />
            </SafeAreaProvider>
          </Provider>
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Add passport');
      expect(str).toContain('Save passport');
    });

    it('Save passport button is disabled when required fields are empty', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <AddPassportScreen userName="Priya" memberId="m1" />
            </SafeAreaProvider>
          </Provider>
        );
      });

      // Find the CommonBtn inside AddPassportScreen
      const commonBtns = renderer!.root.findAll((node) => node.props && node.props.title === 'Save passport');
      expect(commonBtns.length).toBeGreaterThan(0);
      expect(commonBtns[0].props.disabled).toBe(true);
      expect(commonBtns[0].props.backgroundColor).toBe('#5C381E');
    });

    it('Save passport button is enabled when required fields are filled', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <AddPassportScreen
                userName="Priya"
                memberId="m1"
                initialData={{
                  fullName: 'PRIYA SHARMA',
                  passportNumber: 'K1234567',
                  issueDate: '22 Aug 2017',
                  expiryDate: '21 Aug 2027',
                  placeOfIssue: 'Delhi',
                }}
              />
            </SafeAreaProvider>
          </Provider>
        );
      });

      const commonBtns = renderer!.root.findAll((node) => node.props && node.props.title === 'Save passport');
      expect(commonBtns.length).toBeGreaterThan(0);
      expect(commonBtns[0].props.disabled).toBe(false);
      expect(commonBtns[0].props.backgroundColor).not.toBe('#5C381E');
    });

    it('DocumentDetailRemindersScreen displays "Edit" button by default and triggers onEditPress', async () => {
      let editPressed = false;
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <DocumentDetailRemindersScreen
              documentTitle="Passport"
              userName="Aarav"
              documentNumber="•••• •••• 1234"
              issuedDate="22 Aug 2017 · Delhi"
              expiryDate="21 Aug 2027"
              buttonTitle="Edit"
              onEditPress={() => {
                editPressed = true;
              }}
            />
          </SafeAreaProvider>
        );
      });

      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Passport');
      expect(str).toContain('Aarav');
      expect(str).toContain('•••• •••• 1234');
      expect(str).toContain('22 Aug 2017 · Delhi');
      expect(str).toContain('21 Aug 2027');

      // Check bottom Edit button
      const editBtns = renderer!.root.findAll((node) => node.props && node.props.title === 'Edit');
      expect(editBtns.length).toBeGreaterThan(0);

      // Trigger onPress on Edit button
      await ReactTestRenderer.act(async () => {
        editBtns[0].props.onPress();
      });
      expect(editPressed).toBe(true);
    });

    it('ImportantDocumentsScreen navigates to details-passport on row press, then to edit on Edit press, and back to landing on Back press', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <ImportantDocumentsScreen
                userName="Aarav"
                memberId="m1"
              />
            </SafeAreaProvider>
          </Provider>
        );
      });

      // 1. Landing Screen shows Passport row
      let str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Important documents');
      expect(str).toContain('Passport');

      // Find the DocumentItemRow or pressable row for Passport and tap it
      const rowItem = renderer!.root.find((node) => node.props && node.props.title === 'Passport');
      expect(rowItem).toBeDefined();

      await ReactTestRenderer.act(async () => {
        rowItem.props.onPress();
      });

      // 2. Now on details-passport screen showing dynamic details and "Edit" button
      str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('•••• •••• 4567');
      expect(str).toContain('22 Aug 2017 · Delhi');
      expect(str).toContain('21 Aug 2027');
      expect(str).toContain('Edit');

      // Find Edit button on details screen and press it
      const editBtn = renderer!.root.find((node) => node.props && node.props.title === 'Edit');
      expect(editBtn).toBeDefined();

      await ReactTestRenderer.act(async () => {
        editBtn.props.onPress();
      });

      // 3. Now on AddPassportScreen ("Edit passport")
      str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Edit passport');
      expect(str).toContain('Update passport');

      // Find close button on AddPassportScreen to return to details
      const closeHeader = renderer!.root.find((node) => node.props && node.props.title === 'Edit passport');
      expect(closeHeader).toBeDefined();

      await ReactTestRenderer.act(async () => {
        closeHeader.props.onBack();
      });

      // 4. Back on details-passport screen
      str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('•••• •••• 4567');
      expect(str).toContain('Edit');

      // Now tap Back chevron (<) on details screen
      const backButton = renderer!.root.find((node) => node.props && node.props.accessibilityLabel === 'Back');
      expect(backButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        backButton.props.onPress();
      });

      // 5. Back on Landing Screen
      str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Important documents');
      expect(str).toContain('Documents (1 Added)');
    });
  });
});
