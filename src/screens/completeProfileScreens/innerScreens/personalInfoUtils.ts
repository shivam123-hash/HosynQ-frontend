export interface PersonalInfoInputFormData {
  // Common ABOUT YOU
  fullName: string;
  nickname: string;
  email: string;
  familyRole: string;
  gender: string;
  birthDate: string;
  age: string;
  bloodGroup: string;
  height: string;
  weight: string;

  // Selected Status
  status:
    | 'Student'
    | 'College'
    | 'Working'
    | 'Business owner'
    | 'Homemaker'
    | 'Retired'
    | string;

  // Working
  companyName: string;
  designation: string;
  department: string;
  workMode: 'Office' | 'Hybrid' | 'Work from home' | string;
  officeLocation: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  officeDays: string[];
  workPhone: string;
  workEmail: string;

  // Student
  schoolName: string;
  schoolBoard: string;
  classGrade: string;
  classSection: string;
  rollNumber: string;
  schoolLocation: string;
  schoolDays: string[];
  schoolStartTime: string;
  schoolEndTime: string;
  commuteMode: string;
  busRouteNumber: string;

  // College
  collegeName: string;
  university: string;
  course: string;
  specialisation: string;
  studyYear: string;
  semester: string;
  enrolmentNumber: string;
  campusLocation: string;
  collegeDays: string[];
  collegeStartTime: string;
  collegeEndTime: string;
  staysInHostel: boolean;
  hostelAddress: string;

  // Business owner
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessRole: string;
  gstin: string;
  businessLocation: string;
  businessDays: string[];
  businessStartTime: string;
  businessEndTime: string;
  businessPhone: string;

  // Homemaker
  homemakerStartTime: string;
  homemakerEndTime: string;
  marketDays: string[];
  regularCommitments: string;
  handlesSchoolRuns: boolean;

  // Retired
  workedIn: string;
  lastRole: string;
  organisation: string;
  retiredYear: string;
  pensionNumber: string;
  wakeUpTime: string;
  sleepTime: string;

  // Optional coordinates
  institutionLatitude?: number | null;
  institutionLongitude?: number | null;
  hostelLatitude?: number | null;
  hostelLongitude?: number | null;
}

export const DEFAULT_PERSONAL_INPUT_DATA: PersonalInfoInputFormData = {
  fullName: '',
  nickname: '',
  email: '',
  familyRole: '',
  gender: '',
  birthDate: '',
  age: '',
  bloodGroup: '',
  height: '',
  weight: '',

  status: 'Working',

  // Working
  companyName: '',
  designation: '',
  department: '',
  workMode: 'Hybrid',
  officeLocation: '',
  workDays: [],
  startTime: '',
  endTime: '',
  officeDays: [],
  workPhone: '',
  workEmail: '',

  // Student
  schoolName: '',
  schoolBoard: '',
  classGrade: '',
  classSection: '',
  rollNumber: '',
  schoolLocation: '',
  schoolDays: [],
  schoolStartTime: '',
  schoolEndTime: '',
  commuteMode: '',
  busRouteNumber: '',

  // College
  collegeName: '',
  university: '',
  course: '',
  specialisation: '',
  studyYear: '',
  semester: '',
  enrolmentNumber: '',
  campusLocation: '',
  collegeDays: [],
  collegeStartTime: '',
  collegeEndTime: '',
  staysInHostel: false,
  hostelAddress: '',

  // Business owner
  businessName: '',
  businessType: '',
  businessDescription: '',
  businessRole: '',
  gstin: '',
  businessLocation: '',
  businessDays: [],
  businessStartTime: '',
  businessEndTime: '',
  businessPhone: '',

  // Homemaker
  homemakerStartTime: '',
  homemakerEndTime: '',
  marketDays: [],
  regularCommitments: '',
  handlesSchoolRuns: false,

  // Retired
  workedIn: '',
  lastRole: '',
  organisation: '',
  retiredYear: '',
  pensionNumber: '',
  wakeUpTime: '',
  sleepTime: '',
};

const DAY_MAP_TO_BACKEND: Record<string, string> = {
  M: 'MON',
  T: 'TUE',
  W: 'WED',
  Th: 'THU',
  F: 'FRI',
  Sa: 'SAT',
  Su: 'SUN',
  Mon: 'MON',
  Tue: 'TUE',
  Wed: 'WED',
  Thu: 'THU',
  Fri: 'FRI',
  Sat: 'SAT',
  Sun: 'SUN',
  MON: 'MON',
  TUE: 'TUE',
  WED: 'WED',
  THU: 'THU',
  FRI: 'FRI',
  SAT: 'SAT',
  SUN: 'SUN',
};

const DAY_MAP_FROM_BACKEND: Record<string, string> = {
  MON: 'M',
  TUE: 'T',
  WED: 'W',
  THU: 'Th',
  FRI: 'F',
  SAT: 'Sa',
  SUN: 'Su',
};

export const mapDaysToBackend = (days: string[] = []): string[] => {
  return days
    .map((d) => DAY_MAP_TO_BACKEND[d] || d)
    .filter(Boolean);
};

export const mapDaysFromBackend = (days: string[] = []): string[] => {
  return days
    .map((d) => DAY_MAP_FROM_BACKEND[d] || d)
    .filter(Boolean);
};

/** Convert 12h time string e.g. "10:00 AM" to 24h string e.g. "10:00" */
export const formatTimeTo24h = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined;
  const cleaned = timeStr.trim();
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [h, m] = cleaned.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return cleaned;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/** Convert 24h time string e.g. "10:00" or "18:30" to 12h e.g. "10:00 AM" or "6:30 PM" */
export const formatTimeTo12h = (timeStr?: string): string => {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return cleaned;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

/** Convert birth date to YYYY-MM-DD */
export const formatBirthDateToBackend = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined;
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  const match = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = MONTH_MAP[match[2]] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = Date.parse(cleaned);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return cleaned;
};

/** Map UI status string to Backend enum */
export const mapStatusToBackendEnum = (
  status?: string
):
  | 'WORKING'
  | 'STUDENT'
  | 'COLLEGE'
  | 'BUSINESS_OWNER'
  | 'HOMEMAKER'
  | 'RETIRED' => {
  const norm = (status || '').toLowerCase().trim();
  if (norm.includes('student')) return 'STUDENT';
  if (norm.includes('college')) return 'COLLEGE';
  if (norm.includes('business')) return 'BUSINESS_OWNER';
  if (norm.includes('homemaker')) return 'HOMEMAKER';
  if (norm.includes('retired')) return 'RETIRED';
  return 'WORKING';
};

/** Map Backend enum to UI status */
export const mapBackendEnumToStatus = (status?: string): string => {
  const norm = (status || '').toUpperCase().trim();
  switch (norm) {
    case 'STUDENT':
      return 'Student';
    case 'COLLEGE':
      return 'College';
    case 'BUSINESS_OWNER':
      return 'Business owner';
    case 'HOMEMAKER':
      return 'Homemaker';
    case 'RETIRED':
      return 'Retired';
    case 'WORKING':
    default:
      return 'Working';
  }
};

/**
 * Ensures phone numbers meet backend E.164 country code requirement (e.g. +911244557788)
 */
export const formatPhoneWithCountryCode = (
  phone?: string
): string | undefined => {
  if (!phone) return undefined;
  const trimmed = phone.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('+')) {
    const cleaned = '+' + trimmed.slice(1).replace(/\D/g, '');
    return cleaned.length > 1 ? cleaned : undefined;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return `+${digits}`;
};

/**
 * Validates email format
 */
export const isValidEmail = (email?: string): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Builds the exact backend payload object according to the selected occupationStatus
 */
export const buildPersonalPayload = (
  formData: PersonalInfoInputFormData
): Record<string, any> => {
  const occupationStatus = mapStatusToBackendEnum(formData.status);

  // Common ABOUT YOU fields
  const personal: Record<string, any> = {
    fullName: formData.fullName?.trim() || undefined,
    nickname: formData.nickname?.trim() || undefined,
    email: formData.email?.trim() || undefined,
    familyRole: formData.familyRole?.trim() || undefined,
    gender: formData.gender?.trim() || undefined,
    birthDate: formatBirthDateToBackend(formData.birthDate),
    bloodGroup: formData.bloodGroup?.trim() || undefined,
    heightCm: formData.height ? parseInt(formData.height, 10) : undefined,
    weightKg: formData.weight ? parseInt(formData.weight, 10) : undefined,
    occupationStatus,
  };

  // Status specific fields
  switch (occupationStatus) {
    case 'WORKING': {
      let workMode = 'OFFICE';
      if (formData.workMode === 'Hybrid') workMode = 'HYBRID';
      else if (
        formData.workMode === 'Work from home' ||
        formData.workMode === 'Remote'
      )
        workMode = 'WORK_FROM_HOME';

      personal.institutionName = formData.companyName?.trim() || undefined;
      personal.designationOrGrade = formData.designation?.trim() || undefined;
      personal.department = formData.department?.trim() || undefined;
      personal.workMode = workMode;
      personal.institutionAddress =
        workMode === 'WORK_FROM_HOME'
          ? undefined
          : formData.officeLocation?.trim() || undefined;
      personal.institutionLatitude = formData.institutionLatitude ?? 28.5021;
      personal.institutionLongitude = formData.institutionLongitude ?? 77.0875;
      personal.scheduleDays = mapDaysToBackend(formData.workDays);
      personal.scheduleStart = formatTimeTo24h(formData.startTime);
      personal.scheduleEnd = formatTimeTo24h(formData.endTime);
      personal.officeDays =
        workMode === 'HYBRID' ? mapDaysToBackend(formData.officeDays) : undefined;
      personal.workPhone = formatPhoneWithCountryCode(formData.workPhone);
      personal.workEmail = formData.workEmail?.trim() || undefined;
      break;
    }

    case 'STUDENT': {
      personal.institutionName = formData.schoolName?.trim() || undefined;
      personal.designationOrGrade = formData.classGrade?.trim() || undefined;
      personal.institutionAddress = formData.schoolLocation?.trim() || undefined;
      personal.institutionLatitude = formData.institutionLatitude ?? 28.4325;
      personal.institutionLongitude = formData.institutionLongitude ?? 77.0627;
      personal.scheduleDays = mapDaysToBackend(formData.schoolDays);
      personal.scheduleStart = formatTimeTo24h(formData.schoolStartTime);
      personal.scheduleEnd = formatTimeTo24h(formData.schoolEndTime);
      personal.schoolBoard = formData.schoolBoard?.trim() || undefined;
      personal.classSection = formData.classSection?.trim() || undefined;
      personal.rollNumber = formData.rollNumber?.trim() || undefined;

      let commuteMode = 'SCHOOL_BUS';
      const cLower = (formData.commuteMode || '').toLowerCase();
      if (cLower.includes('parent')) commuteMode = 'PARENT_DROP';
      else if (cLower.includes('auto') || cLower.includes('cab'))
        commuteMode = 'AUTO_CAB';
      else if (cLower.includes('walk')) commuteMode = 'WALKS';
      else if (cLower.includes('cycle')) commuteMode = 'CYCLES';
      else if (cLower.includes('metro') || cLower.includes('city'))
        commuteMode = 'METRO_CITY_BUS';
      else if (cLower.includes('bus')) commuteMode = 'SCHOOL_BUS';

      personal.commuteMode = commuteMode;
      personal.busRouteNumber =
        commuteMode === 'SCHOOL_BUS'
          ? formData.busRouteNumber?.trim() || undefined
          : undefined;
      break;
    }

    case 'COLLEGE': {
      personal.institutionName = formData.collegeName?.trim() || undefined;
      personal.university = formData.university?.trim() || undefined;
      personal.designationOrGrade = formData.course?.trim() || undefined;
      personal.specialisation = formData.specialisation?.trim() || undefined;
      personal.studyYear = formData.studyYear
        ? parseInt(formData.studyYear.replace(/\D/g, ''), 10) || 1
        : undefined;
      personal.semester = formData.semester
        ? parseInt(formData.semester.replace(/\D/g, ''), 10) || 1
        : undefined;
      personal.enrolmentNumber = formData.enrolmentNumber?.trim() || undefined;
      personal.institutionAddress = formData.campusLocation?.trim() || undefined;
      personal.institutionLatitude = formData.institutionLatitude ?? 28.6869;
      personal.institutionLongitude = formData.institutionLongitude ?? 77.2112;
      personal.scheduleDays = mapDaysToBackend(formData.collegeDays);
      personal.scheduleStart = formatTimeTo24h(formData.collegeStartTime);
      personal.scheduleEnd = formatTimeTo24h(formData.collegeEndTime);
      personal.staysInHostel = Boolean(formData.staysInHostel);
      personal.hostelAddress = formData.staysInHostel
        ? formData.hostelAddress?.trim() || undefined
        : undefined;
      personal.hostelLatitude = formData.staysInHostel
        ? formData.hostelLatitude ?? 28.6814
        : undefined;
      personal.hostelLongitude = formData.staysInHostel
        ? formData.hostelLongitude ?? 77.2046
        : undefined;
      break;
    }

    case 'BUSINESS_OWNER': {
      personal.institutionName = formData.businessName?.trim() || undefined;
      personal.designationOrGrade = formData.businessRole?.trim() || undefined;
      personal.institutionAddress =
        formData.businessLocation?.trim() || undefined;
      personal.institutionLatitude = formData.institutionLatitude ?? 28.4682;
      personal.institutionLongitude = formData.institutionLongitude ?? 77.0644;
      personal.scheduleDays = mapDaysToBackend(formData.businessDays);
      personal.scheduleStart = formatTimeTo24h(formData.businessStartTime);
      personal.scheduleEnd = formatTimeTo24h(formData.businessEndTime);

      let bType = 'SERVICES';
      const bLower = (formData.businessType || '').toLowerCase();
      if (bLower.includes('retail') || bLower.includes('shop'))
        bType = 'RETAIL';
      else if (bLower.includes('manufactur')) bType = 'MANUFACTURING';
      else if (bLower.includes('online')) bType = 'ONLINE';
      else if (bLower.includes('practice') || bLower.includes('profession'))
        bType = 'PROFESSIONAL_PRACTICE';
      else if (bLower.includes('service')) bType = 'SERVICES';
      else if (bLower.includes('other')) bType = 'OTHER';

      personal.businessType = bType;
      personal.businessDescription =
        formData.businessDescription?.trim() || undefined;
      personal.gstin = formData.gstin?.trim() || undefined;
      personal.workPhone = formatPhoneWithCountryCode(formData.businessPhone);
      break;
    }

    case 'HOMEMAKER': {
      personal.scheduleDays = mapDaysToBackend(formData.marketDays);
      personal.scheduleStart = formatTimeTo24h(formData.homemakerStartTime);
      personal.scheduleEnd = formatTimeTo24h(formData.homemakerEndTime);
      personal.regularCommitments =
        formData.regularCommitments?.trim() || undefined;
      personal.handlesSchoolRuns = Boolean(formData.handlesSchoolRuns);
      break;
    }

    case 'RETIRED': {
      let wIn = 'TEACHING';
      const wLower = (formData.workedIn || '').toLowerCase();
      if (wLower.includes('gov')) wIn = 'GOVERNMENT';
      else if (wLower.includes('private')) wIn = 'PRIVATE_COMPANY';
      else if (wLower.includes('business')) wIn = 'OWN_BUSINESS';
      else if (wLower.includes('arm') || wLower.includes('force'))
        wIn = 'ARMED_FORCES';
      else if (wLower.includes('teach')) wIn = 'TEACHING';
      else if (wLower.includes('other')) wIn = 'OTHER';

      personal.workedIn = wIn;
      personal.institutionName = formData.organisation?.trim() || undefined;
      personal.designationOrGrade = formData.lastRole?.trim() || undefined;
      personal.retiredYear = formData.retiredYear
        ? parseInt(formData.retiredYear.replace(/\D/g, ''), 10) || undefined
        : undefined;
      personal.pensionNumber = formData.pensionNumber?.trim() || undefined;
      personal.scheduleStart = formatTimeTo24h(formData.wakeUpTime);
      personal.scheduleEnd = formatTimeTo24h(formData.sleepTime);
      break;
    }
  }

  return { personal };
};

/**
 * Maps saved backend personal data back into PersonalInfoInputFormData
 * so that when editing or re-visiting, ALL saved values are preserved!
 */
export const mapBackendToPersonalForm = (
  backend: Record<string, any>,
  baseFallback?: { fullName?: string; email?: string; familyRole?: string }
): PersonalInfoInputFormData => {
  if (!backend || Object.keys(backend).length === 0) {
    return {
      ...DEFAULT_PERSONAL_INPUT_DATA,
      fullName: baseFallback?.fullName || '',
      email: baseFallback?.email || '',
      familyRole: baseFallback?.familyRole || '',
    };
  }

  const occupationStatus = mapBackendEnumToStatus(backend.occupationStatus);

  // Compute birthDate display and age
  let birthDate = '';
  let age = '';
  if (backend.birthDate) {
    const raw = String(backend.birthDate).split('T')[0];
    const parts = raw.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      birthDate = `${day} ${monthNames[monthIdx] || 'Jan'} ${year}`;
      const now = new Date();
      let calculatedAge = now.getFullYear() - year;
      if (
        now.getMonth() < monthIdx ||
        (now.getMonth() === monthIdx && now.getDate() < day)
      ) {
        calculatedAge--;
      }
      age = calculatedAge > 0 ? `${calculatedAge} years old` : '';
    } else {
      birthDate = raw;
    }
  }

  const scheduleDays = mapDaysFromBackend(backend.scheduleDays || []);
  const startTime = formatTimeTo12h(backend.scheduleStart);
  const endTime = formatTimeTo12h(backend.scheduleEnd);
  const officeDays = mapDaysFromBackend(backend.officeDays || []);

  let workMode = 'Office';
  if (backend.workMode === 'HYBRID') workMode = 'Hybrid';
  else if (backend.workMode === 'WORK_FROM_HOME') workMode = 'Work from home';

  return {
    ...DEFAULT_PERSONAL_INPUT_DATA,
    fullName: backend.fullName || baseFallback?.fullName || '',
    nickname: backend.nickname || '',
    email: backend.email || baseFallback?.email || '',
    familyRole: backend.familyRole || baseFallback?.familyRole || '',
    gender: backend.gender || '',
    birthDate,
    age,
    bloodGroup: backend.bloodGroup || '',
    height: backend.heightCm ? String(backend.heightCm) : '',
    weight: backend.weightKg ? String(backend.weightKg) : '',
    status: occupationStatus,

    // Working
    companyName: backend.institutionName || '',
    designation: backend.designationOrGrade || '',
    department: backend.department || '',
    workMode,
    officeLocation: backend.institutionAddress || '',
    workDays: scheduleDays,
    startTime,
    endTime,
    officeDays,
    workPhone: backend.workPhone || '',
    workEmail: backend.workEmail || '',

    // Student
    schoolName: backend.institutionName || '',
    schoolBoard: backend.schoolBoard || '',
    classGrade: backend.designationOrGrade || '',
    classSection: backend.classSection || '',
    rollNumber: backend.rollNumber || '',
    schoolLocation: backend.institutionAddress || '',
    schoolDays: scheduleDays,
    schoolStartTime: startTime,
    schoolEndTime: endTime,
    commuteMode: backend.commuteMode || '',
    busRouteNumber: backend.busRouteNumber || '',

    // College
    collegeName: backend.institutionName || '',
    university: backend.university || '',
    course: backend.course || '',
    specialisation: backend.specialisation || '',
    studyYear: backend.studyYear || '',
    semester: backend.semester || '',
    enrolmentNumber: backend.enrolmentNumber || '',
    campusLocation: backend.institutionAddress || '',
    collegeDays: scheduleDays,
    collegeStartTime: startTime,
    collegeEndTime: endTime,
    staysInHostel: Boolean(backend.staysInHostel),
    hostelAddress: backend.hostelAddress || '',

    // Business owner
    businessName: backend.institutionName || '',
    businessType: backend.businessType || '',
    businessDescription: backend.businessDescription || '',
    businessRole: backend.designationOrGrade || '',
    gstin: backend.gstin || '',
    businessLocation: backend.institutionAddress || '',
    businessDays: scheduleDays,
    businessStartTime: startTime,
    businessEndTime: endTime,
    businessPhone: backend.workPhone || '',

    // Homemaker
    homemakerStartTime: startTime,
    homemakerEndTime: endTime,
    marketDays: scheduleDays,
    regularCommitments: backend.regularCommitments || '',
    handlesSchoolRuns: Boolean(backend.handlesSchoolRuns),

    // Retired
    workedIn: backend.workedIn || '',
    lastRole: backend.designationOrGrade || '',
    organisation: backend.institutionName || '',
    retiredYear: backend.retiredYear ? String(backend.retiredYear) : '',
    pensionNumber: backend.pensionNumber || '',
    wakeUpTime: startTime,
    sleepTime: endTime,

    institutionLatitude: backend.institutionLatitude,
    institutionLongitude: backend.institutionLongitude,
    hostelLatitude: backend.hostelLatitude,
    hostelLongitude: backend.hostelLongitude,
  };
};

