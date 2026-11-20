import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import {
  buildPassportPayload,
  mapDocToPassportFormData,
} from '../src/screens/completeProfileScreens/importantDocmentsScreens/documentPayloadUtils';
import DocumentDetailRemindersScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/DocumentDetailRemindersScreen';
import AddPassportScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/AddPassportScreen';
import DocumentPhotoUploadField from '../src/screens/completeProfileScreens/components/DocumentPhotoUploadField';
import ImportantDocumentsScreen from '../src/screens/completeProfileScreens/importantDocmentsScreens/ImportantDocumentsScreen';
import lifeProfileReducer, {
  deleteDocumentThunk,
} from '../src/redux/features/lifeProfile/lifeProfileSlice';
import familyReducer from '../src/redux/features/family/familySlice';
import lifeProfileServices from '../src/services/lifeProfileServices';
import familyServices from '../src/services/familyServices';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Document Details, Family Remind Selection & Delete Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Passport Payload with Family Remind Members (Image 7)', () => {
    it('correctly maps remindMemberIds and autoRenewalTask in passport payload', () => {
      const formData = {
        scanId: '8c5e6288-64fe-4efc-8e5a-c4c71702d093',
        fullName: 'PRIYA SHARMA',
        passportNumber: 'K1234567',
        issueDate: '2017-08-22',
        expiryDate: '2027-08-21',
        placeOfIssue: 'Delhi',
        reminders: ['6 months', '1 month'],
        remindMemberIds: [
          'f3941dc1-9332-4bf5-9f7a-616b76854102',
          'e2851dc1-9332-4bf5-9f7a-616b76854103',
        ],
        autoRenewal: true,
      };

      const payload = buildPassportPayload(formData);
      expect(payload.type).toBe('PASSPORT');
      expect(payload.scanId).toBe('8c5e6288-64fe-4efc-8e5a-c4c71702d093');
      expect(payload.nameOnDocument).toBe('PRIYA SHARMA');
      expect(payload.number).toBe('K1234567');
      expect(payload.issuedOn).toBe('2017-08-22');
      expect(payload.expiresOn).toBe('2027-08-21');
      expect(payload.issuedAt).toBe('Delhi');
      expect(payload.reminderLeadDays).toEqual([180, 30]);
      expect(payload.remindMemberIds).toEqual([
        'f3941dc1-9332-4bf5-9f7a-616b76854102',
        'e2851dc1-9332-4bf5-9f7a-616b76854103',
      ]);
      expect(payload.autoRenewalTask).toBe(true);
    });

    it('reverse maps backend passport doc including remindMemberIds into form data', () => {
      const backendDoc = {
        id: 'doc-pass-1',
        type: 'PASSPORT',
        scanId: '8c5e6288-64fe-4efc-8e5a-c4c71702d093',
        nameOnDocument: 'PRIYA SHARMA',
        number: 'K1234567',
        issuedOn: '2017-08-22',
        expiresOn: '2027-08-21',
        issuedAt: 'Delhi',
        reminderLeadDays: [180, 30],
        remindMemberIds: ['f3941dc1-9332-4bf5-9f7a-616b76854102'],
        autoRenewalTask: true,
      };

      const mapped = mapDocToPassportFormData(backendDoc);
      expect(mapped).not.toBeNull();
      expect(mapped?.fullName).toBe('PRIYA SHARMA');
      expect(mapped?.passportNumber).toBe('K1234567');
      expect(mapped?.placeOfIssue).toBe('Delhi');
      expect(mapped?.reminders).toEqual(['6 months', '1 month']);
      expect(mapped?.remindMemberIds).toEqual(['f3941dc1-9332-4bf5-9f7a-616b76854102']);
      expect(mapped?.autoRenewal).toBe(true);
    });
  });

  describe('2. DocumentDetailRemindersScreen - Avatars & Delete Trash Icon (Image 5)', () => {
    it('renders delete trash icon and triggers confirmation Alert on press', () => {
      const onDeleteMock = jest.fn();
      const alertSpy = jest.spyOn(Alert, 'alert');

      let renderer: any;
      act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <DocumentDetailRemindersScreen
              documentTitle="Passport"
              userName="Priya"
              documentNumber="•••• •••• 4471"
              issuedDate="22 Aug 2017 · Delhi"
              expiryDate="21 Aug 2027"
              remindAssignees="Priya, Rohan"
              onDeletePress={onDeleteMock}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer.root;
      // Find options button by accessibility label
      const optionsBtn = root.findByProps({ accessibilityLabel: 'More options' });
      expect(optionsBtn).toBeDefined();

      // Trigger options press
      act(() => {
        optionsBtn.props.onPress();
      });

      // Verify Confirmation Modal opens
      const confirmModal = root.findByProps({
        title: 'Delete Passport?',
      });
      expect(confirmModal).toBeDefined();

      act(() => {
        confirmModal.props.onConfirm();
      });

      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    it('renders avatar initials for each assignee and auto renewal subtitle', () => {
      let renderer: any;
      act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <DocumentDetailRemindersScreen
              documentTitle="Passport"
              userName="Priya"
              remindAssignees="Priya, Rohan"
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer.root;
      const textNodes = root.findAllByType('Text').map((n: any) => n.props.children);
      const textJoined = textNodes.flat(Infinity).join(' ');

      expect(textJoined).toContain('P');
      expect(textJoined).toContain('R');
      expect(textJoined).toContain('Priya, Rohan');
      expect(textJoined).toContain('Assigned to Priya, 6 months before');
    });
  });

  describe('3. DocumentPhotoUploadField - Split Cards vs Single Box (Image 2 & 8)', () => {
    it('renders single upload card when no photo is uploaded (Image 2)', () => {
      const store = configureStore({
        reducer: {
          lifeProfile: lifeProfileReducer,
          family: familyReducer,
        },
      });

      let renderer: any;
      act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <DocumentPhotoUploadField
              documentType="PASSPORT"
              documentTitle="Passport"
              hasFrontImage={false}
              hasBackImage={false}
              onScanSuccess={jest.fn()}
            />
          </Provider>
        );
      });

      const root = renderer.root;
      const texts = root.findAllByType('Text').map((t: any) => t.props.children).flat(Infinity).join(' ');
      expect(texts).toContain('Upload Passport photo');
      expect(texts).toContain('Auto-fills document details · Tap to scan');
    });

    it('renders side-by-side split cards when front photo is added (Image 8)', () => {
      const store = configureStore({
        reducer: {
          lifeProfile: lifeProfileReducer,
          family: familyReducer,
        },
      });

      let renderer: any;
      act(() => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <DocumentPhotoUploadField
              documentType="PASSPORT"
              documentTitle="Passport"
              hasFrontImage={true}
              hasBackImage={false}
              onScanSuccess={jest.fn()}
            />
          </Provider>
        );
      });

      const root = renderer.root;
      const texts = root.findAllByType('Text').map((t: any) => t.props.children).flat(Infinity).join(' ');
      expect(texts).toContain('Front added');
      expect(texts).toContain('Tap to replace');
      expect(texts).toContain('Add back page');
      expect(texts).toContain('Optional');
    });
  });

  describe('4. Delete Document Redux Thunk and Reducer', () => {
    it('purges deleted document from Redux documents list upon deleteDocumentThunk.fulfilled', () => {
      const initialDocState = {
        full: {
          data: {
            documents: [{ id: 'doc-pass-1', type: 'PASSPORT' }, { id: 'doc-visa-1', type: 'VISA' }],
          },
        },
        documents: {
          data: {
            documents: [{ id: 'doc-pass-1', type: 'PASSPORT' }, { id: 'doc-visa-1', type: 'VISA' }],
          },
        },
      };

      const nextState = lifeProfileReducer(
        initialDocState as any,
        deleteDocumentThunk.fulfilled({ documentId: 'doc-pass-1', response: { success: true } }, '', {
          documentId: 'doc-pass-1',
        })
      );

      expect(nextState.documents.data.documents).toHaveLength(1);
      expect(nextState.documents.data.documents[0].id).toBe('doc-visa-1');
      expect(nextState.full.data.documents).toHaveLength(1);
      expect(nextState.full.data.documents[0].id).toBe('doc-visa-1');
    });
  });

  describe('5. Full Document Detail Fetching upon row press (Point 1 fix)', () => {
    it('calls getDocumentDetail and populates all fields when row is pressed', async () => {
      const store = configureStore({
        reducer: {
          lifeProfile: lifeProfileReducer,
          family: familyReducer,
        },
        preloadedState: {
          lifeProfile: {
            documents: {
              data: {
                documents: [
                  {
                    id: 'doc-pass-1',
                    type: 'PASSPORT',
                    label: 'Passport',
                    last4: '4471',
                    expiresOn: '2027-08-21',
                  },
                ],
              },
            },
          } as any,
          family: {
            myMemberId: 'm1',
            myFamilyData: {
              inFamily: true,
              family: {
                members: [
                  { memberId: 'm1', fullName: 'Priya Sharma', avatarColor: '#7C3AED' },
                  { memberId: 'm2', fullName: 'Rohan Sharma', avatarColor: '#2563EB' },
                ],
              },
            },
          } as any,
        },
      });

      const getDetailSpy = jest
        .spyOn(lifeProfileServices, 'getDocumentDetail')
        .mockResolvedValueOnce({
          success: true,
          data: {
            documents: [
              {
                id: 'doc-pass-1',
                type: 'PASSPORT',
                nameOnDocument: 'PRIYA SHARMA',
                number: 'K1234567',
                issuedOn: '2017-08-22',
                expiresOn: '2027-08-21',
                issuedAt: 'Delhi',
                reminderLeadDays: [180, 30],
                remindMemberIds: ['m1', 'm2'],
                autoRenewalTask: true,
              },
            ],
          },
        } as any);

      let renderer: any;
      await act(async () => {
        renderer = ReactTestRenderer.create(
          <Provider store={store}>
            <SafeAreaProvider initialMetrics={safeAreaMetrics}>
              <ImportantDocumentsScreen memberId="m1" userName="Priya" />
            </SafeAreaProvider>
          </Provider>
        );
      });

      // Find passport item row
      const root = renderer.root;
      const docRow = root.findByProps({ title: 'Passport' });
      expect(docRow).toBeDefined();

      await act(async () => {
        docRow.props.onPress();
      });

      expect(getDetailSpy).toHaveBeenCalledWith('m1', 'doc-pass-1');
    });
  });
});
