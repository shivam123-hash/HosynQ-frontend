import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux';
import {
  buildPersonalPayload,
  mapDaysToBackend,
  mapDaysFromBackend,
  formatTimeTo24h,
  formatTimeTo12h,
  mapStatusToBackendEnum,
  mapBackendEnumToStatus,
  formatPhoneWithCountryCode,
  isValidEmail,
  DEFAULT_PERSONAL_INPUT_DATA,
} from '../src/screens/completeProfileScreens/innerScreens/personalInfoUtils';
import PersonalInfoInputScreen from '../src/screens/completeProfileScreens/innerScreens/PersonalInfoInputScreen';
import lifeProfileServices from '../src/services/lifeProfileServices';
import { updateLifeProfileSectionThunk } from '../src/redux/features/lifeProfile/lifeProfileSlice';
import apiClient from '../src/services/apiClient';

jest.mock('../src/services/apiClient');

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('PersonalProfile Dynamic Status & PATCH Payload Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Utility & Time / Day Formatters', () => {
    test('maps day formats to/from backend properly', () => {
      const uiDays = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
      const backendDays = mapDaysToBackend(uiDays);
      expect(backendDays).toEqual([
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
        'SUN',
      ]);

      const roundTrip = mapDaysFromBackend(backendDays);
      expect(roundTrip).toEqual(uiDays);
    });

    test('converts 12-hour AM/PM times to 24-hour HH:mm', () => {
      expect(formatTimeTo24h('10:00 AM')).toBe('10:00');
      expect(formatTimeTo24h('6:30 PM')).toBe('18:30');
      expect(formatTimeTo24h('8:00 AM')).toBe('08:00');
      expect(formatTimeTo24h('2:30 PM')).toBe('14:30');
      expect(formatTimeTo24h('11:00 AM')).toBe('11:00');
      expect(formatTimeTo24h('7:00 PM')).toBe('19:00');
      expect(formatTimeTo24h('5:30 AM')).toBe('05:30');
      expect(formatTimeTo24h('9:30 PM')).toBe('21:30');
    });

    test('converts 24-hour HH:mm times to 12-hour AM/PM', () => {
      expect(formatTimeTo12h('10:00')).toBe('10:00 AM');
      expect(formatTimeTo12h('18:30')).toBe('6:30 PM');
      expect(formatTimeTo12h('08:00')).toBe('8:00 AM');
      expect(formatTimeTo12h('14:30')).toBe('2:30 PM');
    });

    test('maps status strings to backend enums and vice versa', () => {
      expect(mapStatusToBackendEnum('Working')).toBe('WORKING');
      expect(mapStatusToBackendEnum('Student')).toBe('STUDENT');
      expect(mapStatusToBackendEnum('College')).toBe('COLLEGE');
      expect(mapStatusToBackendEnum('Business owner')).toBe('BUSINESS_OWNER');
      expect(mapStatusToBackendEnum('Homemaker')).toBe('HOMEMAKER');
      expect(mapStatusToBackendEnum('Retired')).toBe('RETIRED');

      expect(mapBackendEnumToStatus('WORKING')).toBe('Working');
      expect(mapBackendEnumToStatus('STUDENT')).toBe('Student');
      expect(mapBackendEnumToStatus('COLLEGE')).toBe('College');
      expect(mapBackendEnumToStatus('BUSINESS_OWNER')).toBe('Business owner');
      expect(mapBackendEnumToStatus('HOMEMAKER')).toBe('Homemaker');
      expect(mapBackendEnumToStatus('RETIRED')).toBe('Retired');
    });

    test('validates and auto-formats phone numbers with E.164 country code', () => {
      expect(formatPhoneWithCountryCode('8576766369')).toBe('+918576766369');
      expect(formatPhoneWithCountryCode('+911244557788')).toBe('+911244557788');
      expect(formatPhoneWithCountryCode('918576766369')).toBe('+918576766369');
      expect(formatPhoneWithCountryCode(undefined)).toBeUndefined();
      expect(formatPhoneWithCountryCode('')).toBeUndefined();
    });

    test('validates email address format correctly', () => {
      expect(isValidEmail('gsjsjsbxj@gmail.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.in')).toBe(true);
      expect(isValidEmail('bncbac..can')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('Payload Builders for all 6 Statuses', () => {
    test('builds exact payload for WORKING', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'Working',
        companyName: 'Kaveri Design Studio',
        designation: 'Interior designer',
        department: 'Residential projects',
        workMode: 'Hybrid',
        officeLocation: 'Udyog Vihar Phase 4, Gurugram',
        workDays: ['M', 'T', 'W', 'Th', 'F', 'Sa'],
        startTime: '10:00 AM',
        endTime: '6:30 PM',
        officeDays: ['Mon', 'Wed', 'Fri'],
        workPhone: '+911244557788',
        workEmail: 'priya@kaveridesign.example',
      });

      expect(payload.personal.occupationStatus).toBe('WORKING');
      expect(payload.personal.institutionName).toBe('Kaveri Design Studio');
      expect(payload.personal.designationOrGrade).toBe('Interior designer');
      expect(payload.personal.department).toBe('Residential projects');
      expect(payload.personal.workMode).toBe('HYBRID');
      expect(payload.personal.institutionAddress).toBe(
        'Udyog Vihar Phase 4, Gurugram'
      );
      expect(payload.personal.scheduleDays).toEqual([
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
      ]);
      expect(payload.personal.scheduleStart).toBe('10:00');
      expect(payload.personal.scheduleEnd).toBe('18:30');
      expect(payload.personal.officeDays).toEqual(['MON', 'WED', 'FRI']);
      expect(payload.personal.workPhone).toBe('+911244557788');
      expect(payload.personal.workEmail).toBe('priya@kaveridesign.example');
    });

    test('builds exact payload for STUDENT', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'Student',
        schoolName: "St. Mary's School",
        classGrade: 'Class 4',
        schoolBoard: 'CBSE',
        classSection: 'B',
        rollNumber: '14',
        schoolLocation: 'Sector 46, Gurugram',
        schoolDays: ['M', 'T', 'W', 'Th', 'F'],
        schoolStartTime: '8:00 AM',
        schoolEndTime: '2:30 PM',
        commuteMode: 'School bus',
        busRouteNumber: '7',
      });

      expect(payload.personal.occupationStatus).toBe('STUDENT');
      expect(payload.personal.institutionName).toBe("St. Mary's School");
      expect(payload.personal.designationOrGrade).toBe('Class 4');
      expect(payload.personal.schoolBoard).toBe('CBSE');
      expect(payload.personal.classSection).toBe('B');
      expect(payload.personal.rollNumber).toBe('14');
      expect(payload.personal.institutionAddress).toBe('Sector 46, Gurugram');
      expect(payload.personal.scheduleDays).toEqual([
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
      ]);
      expect(payload.personal.scheduleStart).toBe('08:00');
      expect(payload.personal.scheduleEnd).toBe('14:30');
      expect(payload.personal.commuteMode).toBe('SCHOOL_BUS');
      expect(payload.personal.busRouteNumber).toBe('7');
    });

    test('builds exact payload for COLLEGE', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'College',
        collegeName: 'Hindu College',
        university: 'University of Delhi',
        course: 'B.Com (Honours)',
        specialisation: 'Finance',
        studyYear: '2nd year',
        semester: 'Sem 3',
        enrolmentNumber: 'DU-24-HC-0412',
        campusLocation: 'North Campus, Delhi',
        collegeDays: ['M', 'T', 'W', 'Th', 'F'],
        collegeStartTime: '9:00 AM',
        collegeEndTime: '3:00 PM',
        staysInHostel: true,
        hostelAddress: 'Kamla Nagar, Delhi',
      });

      expect(payload.personal.occupationStatus).toBe('COLLEGE');
      expect(payload.personal.institutionName).toBe('Hindu College');
      expect(payload.personal.university).toBe('University of Delhi');
      expect(payload.personal.designationOrGrade).toBe('B.Com (Honours)');
      expect(payload.personal.specialisation).toBe('Finance');
      expect(payload.personal.studyYear).toBe(2);
      expect(payload.personal.semester).toBe(3);
      expect(payload.personal.enrolmentNumber).toBe('DU-24-HC-0412');
      expect(payload.personal.institutionAddress).toBe('North Campus, Delhi');
      expect(payload.personal.scheduleDays).toEqual([
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
      ]);
      expect(payload.personal.scheduleStart).toBe('09:00');
      expect(payload.personal.scheduleEnd).toBe('15:00');
      expect(payload.personal.staysInHostel).toBe(true);
      expect(payload.personal.hostelAddress).toBe('Kamla Nagar, Delhi');
    });

    test('builds exact payload for BUSINESS_OWNER', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'Business owner',
        businessName: 'Kaveri Interiors',
        businessRole: 'Founder',
        businessType: 'Services',
        businessDescription: 'Interior design for homes and offices',
        gstin: '06ABCDE1234F1Z5',
        businessLocation: 'Sector 29, Gurugram',
        businessDays: ['M', 'T', 'W', 'Th', 'F', 'Sa'],
        businessStartTime: '11:00 AM',
        businessEndTime: '7:00 PM',
        businessPhone: '+919899044556',
      });

      expect(payload.personal.occupationStatus).toBe('BUSINESS_OWNER');
      expect(payload.personal.institutionName).toBe('Kaveri Interiors');
      expect(payload.personal.designationOrGrade).toBe('Founder');
      expect(payload.personal.businessType).toBe('SERVICES');
      expect(payload.personal.businessDescription).toBe(
        'Interior design for homes and offices'
      );
      expect(payload.personal.gstin).toBe('06ABCDE1234F1Z5');
      expect(payload.personal.institutionAddress).toBe('Sector 29, Gurugram');
      expect(payload.personal.scheduleDays).toEqual([
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
      ]);
      expect(payload.personal.scheduleStart).toBe('11:00');
      expect(payload.personal.scheduleEnd).toBe('19:00');
      expect(payload.personal.workPhone).toBe('+919899044556');
    });

    test('builds exact payload for HOMEMAKER', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'Homemaker',
        marketDays: ['W', 'Sa'],
        homemakerStartTime: '7:00 AM',
        homemakerEndTime: '10:00 AM',
        regularCommitments: 'Yoga class, Tue and Thu, 6:00 PM',
        handlesSchoolRuns: true,
      });

      expect(payload.personal.occupationStatus).toBe('HOMEMAKER');
      expect(payload.personal.scheduleDays).toEqual(['WED', 'SAT']);
      expect(payload.personal.scheduleStart).toBe('07:00');
      expect(payload.personal.scheduleEnd).toBe('10:00');
      expect(payload.personal.regularCommitments).toBe(
        'Yoga class, Tue and Thu, 6:00 PM'
      );
      expect(payload.personal.handlesSchoolRuns).toBe(true);
    });

    test('builds exact payload for RETIRED', () => {
      const payload = buildPersonalPayload({
        ...DEFAULT_PERSONAL_INPUT_DATA,
        status: 'Retired',
        workedIn: 'Teaching',
        organisation: 'Govt. Girls Senior Secondary School',
        lastRole: 'Hindi teacher',
        retiredYear: '2011',
        pensionNumber: '4410',
        wakeUpTime: '5:30 AM',
        sleepTime: '9:30 PM',
      });

      expect(payload.personal.occupationStatus).toBe('RETIRED');
      expect(payload.personal.workedIn).toBe('TEACHING');
      expect(payload.personal.institutionName).toBe(
        'Govt. Girls Senior Secondary School'
      );
      expect(payload.personal.designationOrGrade).toBe('Hindi teacher');
      expect(payload.personal.retiredYear).toBe(2011);
      expect(payload.personal.pensionNumber).toBe('4410');
      expect(payload.personal.scheduleStart).toBe('05:30');
      expect(payload.personal.scheduleEnd).toBe('21:30');
    });
  });

  describe('PATCH Service & Redux Thunk Integration', () => {
    test('calls apiClient.patch with family/members/:memberId/life-profile', async () => {
      const memberId = 'f6ebfe52-eb2a-4e07-b482-4c5c01649c41';
      const mockResponse = {
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: {
            personal: {
              occupationStatus: 'WORKING',
              fullName: 'Priya Sharma',
            },
          },
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const payload = {
        personal: {
          occupationStatus: 'WORKING',
          fullName: 'Priya Sharma',
        },
      };

      const result = await lifeProfileServices.updateLifeProfile(
        memberId,
        payload
      );

      expect(apiClient.patch).toHaveBeenCalledWith(
        `family/members/${memberId}/life-profile`,
        payload
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('updateLifeProfileSectionThunk dispatches and saves to Redux store', async () => {
      const memberId = 'test-member-uuid';
      const mockPatchData = {
        success: true,
        data: {
          personal: {
            occupationStatus: 'STUDENT',
            institutionName: "St. Mary's School",
          },
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValueOnce({
        data: mockPatchData,
      });

      await store.dispatch(
        updateLifeProfileSectionThunk({
          memberId,
          payload: {
            personal: {
              occupationStatus: 'STUDENT',
              institutionName: "St. Mary's School",
            },
          },
        })
      );

      const state = store.getState().lifeProfile;
      expect(state.personal?.occupationStatus).toBe('STUDENT');
      expect(state.personal?.institutionName).toBe("St. Mary's School");
    });
  });

  describe('UI Field Rendering per Status', () => {
    test('renders Student fields when status is Student', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoInputScreen
              initialData={{
                ...DEFAULT_PERSONAL_INPUT_DATA,
                status: 'Student',
              }}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'SCHOOL' })).toBeTruthy();
      expect(root.findByProps({ children: 'School name *' })).toBeTruthy();
      expect(root.findByProps({ children: 'GETTING THERE' })).toBeTruthy();
      expect(root.findByProps({ children: 'How they get there' })).toBeTruthy();
    });

    test('renders College fields when status is College', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoInputScreen
              initialData={{
                ...DEFAULT_PERSONAL_INPUT_DATA,
                status: 'College',
              }}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'COLLEGE' })).toBeTruthy();
      expect(root.findByProps({ children: 'College name *' })).toBeTruthy();
      expect(root.findByProps({ children: 'Course *' })).toBeTruthy();
      expect(root.findByProps({ children: 'STAYING' })).toBeTruthy();
      expect(
        root.findByProps({ children: 'Stays in a hostel or PG' })
      ).toBeTruthy();
    });

    test('renders Business owner fields when status is Business owner', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoInputScreen
              initialData={{
                ...DEFAULT_PERSONAL_INPUT_DATA,
                status: 'Business owner',
              }}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: 'BUSINESS' })).toBeTruthy();
      expect(root.findByProps({ children: 'Business name *' })).toBeTruthy();
      expect(root.findByProps({ children: 'Type of business *' })).toBeTruthy();
    });

    test('renders Homemaker note and routine when status is Homemaker', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoInputScreen
              initialData={{
                ...DEFAULT_PERSONAL_INPUT_DATA,
                status: 'Homemaker',
              }}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer!.root;
      expect(
        root.findByProps({ children: 'USUAL ROUTINE (OPTIONAL)' })
      ).toBeTruthy();
      expect(
        root.findByProps({ children: 'Market or errand days' })
      ).toBeTruthy();
      expect(
        root.findByProps({ children: 'Handles school runs' })
      ).toBeTruthy();
    });

    test('renders Retired note and earlier work when status is Retired', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoInputScreen
              initialData={{
                ...DEFAULT_PERSONAL_INPUT_DATA,
                status: 'Retired',
              }}
            />
          </SafeAreaProvider>
        );
      });

      const root = renderer!.root;
      expect(
        root.findByProps({ children: 'EARLIER WORK (OPTIONAL)' })
      ).toBeTruthy();
      expect(
        root.findByProps({ children: 'Worked in (pick one)' })
      ).toBeTruthy();
      expect(
        root.findByProps({ children: 'Pension or PPO number' })
      ).toBeTruthy();
      expect(
        root.findByProps({ children: 'DAILY ROUTINE (OPTIONAL)' })
      ).toBeTruthy();
    });
  });
});

