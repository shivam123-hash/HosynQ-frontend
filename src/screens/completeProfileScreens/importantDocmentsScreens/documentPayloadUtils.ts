/**
 * Document Payload Utility for Life Profile Step 2: Important Documents
 * Translates UI form states into backend-validated DocumentItemDto payloads
 * for PATCH /api/v1/family/members/:memberId/life-profile
 */

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export const toIsoDateString = (
  dateVal?: string | Date | null
): string | undefined => {
  if (!dateVal) return undefined;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // "22 Aug 2017"
    const dmyNamed = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (dmyNamed) {
      const day = dmyNamed[1].padStart(2, '0');
      const mStr = dmyNamed[2].toLowerCase();
      const month = MONTH_MAP[mStr];
      const year = dmyNamed[3];
      if (month) return `${year}-${month}-${day}`;
    }
    // "22/08/2017" or "22-08-2017"
    const dmyNum = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyNum) {
      const day = dmyNum[1].padStart(2, '0');
      const month = dmyNum[2].padStart(2, '0');
      const year = dmyNum[3];
      return `${year}-${month}-${day}`;
    }
    // "2017/08/22"
    const ymdNum = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdNum) {
      const year = ymdNum[1];
      const month = ymdNum[2].padStart(2, '0');
      const day = ymdNum[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return undefined;
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return undefined;
};

export const mapReminderLeadDays = (reminders?: string[]): number[] => {
  if (!reminders || !Array.isArray(reminders)) return [180, 30];
  const map: Record<string, number> = {
    '6 months': 180,
    '3 months': 90,
    '1 month': 30,
    '1 week': 7,
  };
  const days = reminders
    .map((r) => map[r] || parseInt(r, 10))
    .filter((n) => !isNaN(n) && n > 0);
  return days.length > 0 ? days : [180, 30];
};

export const mapVehicleClasses = (classes?: string[]): string[] => {
  if (!classes || !Array.isArray(classes)) return ['CAR_LMV'];
  const map: Record<string, string> = {
    'Car (LMV)': 'CAR_LMV',
    CAR_LMV: 'CAR_LMV',
    'Two-wheeler (MCWG)': 'TWO_WHEELER_MCWG',
    TWO_WHEELER_MCWG: 'TWO_WHEELER_MCWG',
    Commercial: 'COMMERCIAL',
    COMMERCIAL: 'COMMERCIAL',
  };
  return classes.map((c) => map[c] || c).filter(Boolean);
};

export const mapVisaType = (type?: string): string => {
  if (!type) return 'TOURIST_OR_BUSINESS';
  const clean = type.toLowerCase();
  if (clean.includes('tourist') || clean.includes('business'))
    return 'TOURIST_OR_BUSINESS';
  if (clean.includes('student')) return 'STUDENT';
  if (clean.includes('work')) return 'WORK';
  return 'OTHER';
};

export const mapVisaEntries = (entries?: string): string => {
  if (!entries) return 'MULTIPLE';
  return entries.toUpperCase().includes('SINGLE') ? 'SINGLE' : 'MULTIPLE';
};

export const normalizeVisaType = (type?: string): string => {
  if (!type) return 'Tourist or business';
  const clean = type.toLowerCase().replace(/_/g, ' ');
  if (clean.includes('tourist') || clean.includes('business'))
    return 'Tourist or business';
  if (clean.includes('student')) return 'Student';
  if (clean.includes('work')) return 'Work';
  if (clean.includes('other')) return 'Other';
  return 'Tourist or business';
};

export const normalizeVisaEntries = (entries?: string): 'Single' | 'Multiple' => {
  if (!entries) return 'Multiple';
  const clean = entries.toLowerCase();
  return clean.includes('single') ? 'Single' : 'Multiple';
};

export const mapCountryCode = (country?: string): string => {
  if (!country) return 'USA';
  const c = country.trim().toUpperCase();
  const map: Record<string, string> = {
    'UNITED STATES': 'USA',
    US: 'USA',
    USA: 'USA',
    INDIA: 'IND',
    IND: 'IND',
    'UNITED KINGDOM': 'GBR',
    UK: 'GBR',
    GBR: 'GBR',
    CANADA: 'CAN',
    CAN: 'CAN',
    AUSTRALIA: 'AUS',
    AUS: 'AUS',
    SINGAPORE: 'SGP',
    SGP: 'SGP',
    'UNITED ARAB EMIRATES': 'ARE',
    UAE: 'ARE',
    ARE: 'ARE',
    GERMANY: 'DEU',
    DEU: 'DEU',
    FRANCE: 'FRA',
    FRA: 'FRA',
  };
  return map[c] || (c.length === 3 ? c : 'USA');
};

export const mapInsuranceType = (type?: string): string => {
  if (!type) return 'HEALTH';
  const clean = type.toUpperCase();
  if (clean.includes('HEALTH')) return 'HEALTH';
  if (clean.includes('LIFE')) return 'LIFE';
  if (clean.includes('MOTOR')) return 'MOTOR';
  if (clean.includes('HOME')) return 'HOME';
  if (clean.includes('TRAVEL')) return 'TRAVEL';
  return 'HEALTH';
};

export const parseCurrencyNumber = (
  val?: string | number | null
): number | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return val;
  const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? undefined : num;
};

// 1. PASSPORT Payload Builder
export const buildPassportPayload = (
  data: {
    fullName?: string;
    passportNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    placeOfIssue?: string;
    reminders?: string[];
    assignees?: string;
    autoRenewal?: boolean;
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'PASSPORT',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  if (data.fullName?.trim()) {
    payload.nameOnDocument = data.fullName.trim().toUpperCase();
  }

  if (data.passportNumber?.trim()) {
    payload.number = data.passportNumber.trim().toUpperCase();
  }

  const issuedOn = toIsoDateString(data.issueDate);
  if (issuedOn) {
    payload.issuedOn = issuedOn;
  }

  const expiresOn = toIsoDateString(data.expiryDate);
  if (expiresOn) {
    payload.expiresOn = expiresOn;
  }

  if (data.placeOfIssue?.trim()) {
    payload.issuedAt = data.placeOfIssue.trim();
  }

  payload.reminderLeadDays = mapReminderLeadDays(data.reminders);

  if (Array.isArray(data.remindMemberIds)) {
    payload.remindMemberIds = data.remindMemberIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  } else {
    payload.remindMemberIds = [];
  }

  if (data.autoRenewal !== undefined) {
    payload.autoRenewalTask = Boolean(data.autoRenewal);
  }

  return payload;
};

// 2. VISA Payload Builder
export const buildVisaPayload = (
  data: {
    visaNumber?: string;
    country?: string;
    visaType?: string;
    validFrom?: string;
    validUntil?: string;
    entries?: string;
    linkedPassportId?: string;
    reminders?: string[];
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'VISA',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  payload.country = mapCountryCode(data.country);
  payload.visaType = mapVisaType(data.visaType);
  payload.visaEntries = mapVisaEntries(data.entries);

  if (data.visaNumber?.trim()) {
    payload.number = data.visaNumber.trim().toUpperCase();
  }

  const issuedOn = toIsoDateString(data.validFrom);
  if (issuedOn) {
    payload.issuedOn = issuedOn;
  }

  const expiresOn = toIsoDateString(data.validUntil);
  if (expiresOn) {
    payload.expiresOn = expiresOn;
  }

  if (data.linkedPassportId?.trim()) {
    payload.linkedDocumentId = data.linkedPassportId.trim();
  }

  payload.reminderLeadDays = mapReminderLeadDays(data.reminders);

  if (Array.isArray(data.remindMemberIds)) {
    payload.remindMemberIds = data.remindMemberIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  } else {
    payload.remindMemberIds = [];
  }

  if (data.autoRenewal !== undefined) {
    payload.autoRenewalTask = Boolean(data.autoRenewal);
  }

  return payload;
};

// 3. DRIVING LICENCE Payload Builder
export const buildDrivingLicencePayload = (
  data: {
    licenceNumber?: string;
    vehiclesAllowed?: string[];
    issueDate?: string;
    validTill?: string;
    issuingRTO?: string;
    reminders?: string[];
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'DRIVING_LICENCE',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  if (data.licenceNumber?.trim()) {
    payload.number = data.licenceNumber.trim().toUpperCase();
  }

  payload.vehicleClasses = mapVehicleClasses(data.vehiclesAllowed);

  const issuedOn = toIsoDateString(data.issueDate);
  if (issuedOn) {
    payload.issuedOn = issuedOn;
  }

  const expiresOn = toIsoDateString(data.validTill);
  if (expiresOn) {
    payload.expiresOn = expiresOn;
  }

  if (data.issuingRTO?.trim()) {
    payload.issuedAt = data.issuingRTO.trim();
  }

  payload.reminderLeadDays = mapReminderLeadDays(data.reminders);

  if (Array.isArray(data.remindMemberIds)) {
    payload.remindMemberIds = data.remindMemberIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  } else {
    payload.remindMemberIds = [];
  }

  if (data.autoRenewal !== undefined) {
    payload.autoRenewalTask = Boolean(data.autoRenewal);
  }

  return payload;
};

// 4. AADHAAR Payload Builder
export const buildAadhaarPayload = (
  data: {
    aadhaarNumber?: string;
    fullName?: string;
    keepLastFourOnly?: boolean;
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'AADHAAR',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  if (data.aadhaarNumber?.trim()) {
    // Strip bullet points or spaces if raw 12 digits
    const digits = data.aadhaarNumber.replace(/[^0-9]/g, '');
    payload.number = digits.length >= 4 ? digits : data.aadhaarNumber.trim();
  }

  if (data.fullName?.trim()) {
    payload.nameOnDocument = data.fullName.trim();
  }

  payload.keepLast4Only =
    data.keepLastFourOnly !== undefined ? Boolean(data.keepLastFourOnly) : true;

  return payload;
};

// 5. PAN Payload Builder
export const buildPanPayload = (
  data: {
    panNumber?: string;
    number?: string;
    fullName?: string;
    nameOnDocument?: string;
    dob?: string;
    dateOfBirth?: string;
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'PAN',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  const rawPan = data.panNumber || data.number || '';
  const cleanPan = rawPan.replace(/[^A-Za-z0-9]/g, '').trim().toUpperCase();
  if (cleanPan) {
    payload.number = cleanPan;
  }

  const rawName = data.fullName || data.nameOnDocument || '';
  if (rawName.trim()) {
    payload.nameOnDocument = rawName.trim();
  }

  const dob = toIsoDateString(data.dob || data.dateOfBirth);
  if (dob) {
    payload.dateOfBirth = dob;
  }

  return payload;
};

// 6. INSURANCE Payload Builder
export const buildInsurancePayload = (
  data: {
    type?: string;
    insurer?: string;
    planName?: string;
    policyNumber?: string;
    sumInsured?: string | number;
    premiumPerYear?: string | number;
    renewalDate?: string;
    coveredMemberIds?: string[];
    remindRenewal?: boolean;
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'INSURANCE',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  payload.insuranceType = mapInsuranceType(data.type);

  if (data.insurer?.trim()) {
    payload.insurer = data.insurer.trim();
  }

  if (data.planName?.trim()) {
    payload.planName = data.planName.trim();
  }

  if (data.policyNumber?.trim()) {
    payload.number = data.policyNumber.trim();
  }

  const sum = parseCurrencyNumber(data.sumInsured);
  if (sum !== undefined) {
    payload.sumInsured = sum;
  }

  const premium = parseCurrencyNumber(data.premiumPerYear);
  if (premium !== undefined) {
    payload.annualPremium = premium;
  }

  const expiresOn = toIsoDateString(data.renewalDate);
  if (expiresOn) {
    payload.expiresOn = expiresOn;
  }

  if (Array.isArray(data.coveredMemberIds)) {
    payload.coveredMemberIds = data.coveredMemberIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  } else {
    payload.coveredMemberIds = [];
  }

  payload.reminderLeadDays = Array.isArray(data.reminders)
    ? mapReminderLeadDays(data.reminders)
    : [30, 7];

  if (Array.isArray(data.remindMemberIds)) {
    payload.remindMemberIds = data.remindMemberIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  } else {
    payload.remindMemberIds = [];
  }

  return payload;
};

// 7. OTHER Document Payload Builder
export const buildOtherDocumentPayload = (
  data: {
    label?: string;
    number?: string;
    nameOnDocument?: string;
    dateOfBirth?: string;
    issuedOn?: string;
    issuedAt?: string;
    expiresOn?: string | null;
    scanId?: string;
    [key: string]: any;
  },
  existingId?: string
) => {
  const payload: Record<string, any> = {
    type: 'OTHER',
    label: data.label?.trim() || 'Other Document',
  };

  if (existingId) {
    payload.id = existingId;
  }

  if (data.scanId && data.scanId.trim().length > 0) {
    payload.scanId = data.scanId.trim();
  }

  if (data.number?.trim()) {
    payload.number = data.number.trim().toUpperCase();
  }

  if (data.nameOnDocument?.trim()) {
    payload.nameOnDocument = data.nameOnDocument.trim();
  }

  const dob = toIsoDateString(data.dateOfBirth);
  if (dob) {
    payload.dateOfBirth = dob;
  }

  const issuedOn = toIsoDateString(data.issuedOn);
  if (issuedOn) {
    payload.issuedOn = issuedOn;
  }

  if (data.issuedAt?.trim()) {
    payload.issuedAt = data.issuedAt.trim();
  }

  const expiresOn = toIsoDateString(data.expiresOn);
  if (expiresOn) {
    payload.expiresOn = expiresOn;
  }

  return payload;
};

// ==========================================
// Reverse Mappers: Backend DocumentDto -> Form Data
// ==========================================

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const formatDisplayDateFromIso = (
  dateVal?: string | Date | null
): string => {
  if (!dateVal) return '';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return typeof dateVal === 'string' ? dateVal : '';
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const mapLeadDaysToReminders = (leadDays?: number[]): string[] => {
  if (!leadDays || !Array.isArray(leadDays) || leadDays.length === 0) {
    return ['6 months', '1 month'];
  }
  const reverseMap: Record<number, string> = {
    180: '6 months',
    90: '3 months',
    30: '1 month',
    7: '1 week',
  };
  const list = leadDays.map((d) => reverseMap[d]).filter(Boolean);
  return list.length > 0 ? list : ['6 months', '1 month'];
};

export const mapDocToPassportFormData = (doc: any) => {
  if (!doc) return null;
  return {
    fullName: doc.nameOnDocument || '',
    passportNumber: doc.number || (doc.last4 ? `•••• •••• ${doc.last4}` : ''),
    issueDate: doc.issuedOn ? formatDisplayDateFromIso(doc.issuedOn) : '',
    expiryDate: doc.expiresOn ? formatDisplayDateFromIso(doc.expiresOn) : '',
    placeOfIssue: doc.issuedAt || '',
    reminders: mapLeadDaysToReminders(doc.reminderLeadDays),
    assignees: typeof doc.assignees === 'string' && !doc.assignees.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)
      ? doc.assignees
      : '',
    remindMemberIds: Array.isArray(doc.remindMemberIds) ? doc.remindMemberIds : [],
    autoRenewal: doc.autoRenewalTask ?? true,
    frontImageAdded: Boolean(doc.scanId || doc.scan || doc.fileUrl || doc.fileId),
    backImageAdded: Boolean(doc.backFileUrl || doc.backFileId),
    scanId: doc.scanId || '',
    fileUrl: doc.fileUrl || doc.fileUri || '',
    frontImageUri: doc.fileUrl || doc.frontImageUri || '',
  };
};

export const mapDocToVisaFormData = (doc: any, allDocs?: any[]) => {
  if (!doc) return null;
  const linkedId = doc.linkedDocumentId || doc.linkedPassportId || '';
  let linkedPassportLabel = '';
  if (linkedId) {
    if (Array.isArray(allDocs)) {
      const linkedDoc = allDocs.find((d: any) => d.id === linkedId);
      if (linkedDoc) {
        const num = linkedDoc.number || linkedDoc.passportNumber || linkedDoc.docNumber || '';
        const last4 = linkedDoc.last4 || (num && num.length >= 4 ? num.slice(-4) : num);
        linkedPassportLabel = last4 ? `Passport ending ${last4}` : (linkedDoc.country ? `${linkedDoc.country} Passport` : 'Passport');
      }
    }
    if (!linkedPassportLabel) {
      const num = doc.linkedDocumentNumber || doc.linkedPassportNumber;
      const last4 = doc.linkedPassportLast4 || (num && num.length >= 4 ? num.slice(-4) : num);
      linkedPassportLabel = last4 ? `Passport ending ${last4}` : 'Passport';
    }
  }

  return {
    country: doc.country || 'USA',
    visaType: normalizeVisaType(doc.visaType),
    visaNumber: doc.number || (doc.last4 ? `•••• •••• ${doc.last4}` : ''),
    linkedPassport: linkedPassportLabel,
    linkedPassportId: linkedId,
    validFrom: doc.issuedOn ? formatDisplayDateFromIso(doc.issuedOn) : '',
    validUntil: doc.expiresOn ? formatDisplayDateFromIso(doc.expiresOn) : '',
    entries: normalizeVisaEntries(doc.visaEntries || doc.entries),
    reminders: mapLeadDaysToReminders(doc.reminderLeadDays),
    assignees:
      typeof doc.assignees === 'string' &&
      !doc.assignees.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)
        ? doc.assignees
        : '',
    remindMemberIds: Array.isArray(doc.remindMemberIds)
      ? doc.remindMemberIds
      : [],
    autoRenewal: doc.autoRenewalTask ?? true,
    frontImageAdded: Boolean(doc.scanId || doc.scan || doc.fileUrl || doc.fileId),
    backImageAdded: false,
    scanId: doc.scanId || '',
    fileUrl: doc.fileUrl || doc.fileUri || '',
    frontImageUri: doc.fileUrl || doc.frontImageUri || '',
  };
};

export const mapDocToDLFormData = (doc: any) => {
  if (!doc) return null;
  return {
    licenceNumber: doc.number || '',
    vehiclesAllowed: Array.isArray(doc.vehicleClasses) ? doc.vehicleClasses : ['Car (LMV)'],
    issueDate: doc.issuedOn ? formatDisplayDateFromIso(doc.issuedOn) : '',
    validTill: doc.expiresOn ? formatDisplayDateFromIso(doc.expiresOn) : '',
    issuingRTO: doc.issuedAt || '',
    vehicleClasses: Array.isArray(doc.vehicleClasses) ? doc.vehicleClasses : ['CAR_LMV'],
    reminders: mapLeadDaysToReminders(doc.reminderLeadDays),
    assignees:
      typeof doc.assignees === 'string' &&
      !doc.assignees.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)
        ? doc.assignees
        : '',
    remindMemberIds: Array.isArray(doc.remindMemberIds)
      ? doc.remindMemberIds
      : [],
    autoRenewal: doc.autoRenewalTask ?? true,
    frontImageAdded: Boolean(doc.scanId || doc.scan || doc.fileUrl || doc.fileId),
    backImageAdded: Boolean(doc.backFileUrl || doc.backFileId),
    scanId: doc.scanId || '',
    fileUrl: doc.fileUrl || doc.fileUri || '',
    frontImageUri: doc.fileUrl || doc.frontImageUri || '',
  };
};

export const mapDocToAadhaarFormData = (doc: any) => {
  if (!doc) return null;
  return {
    fullName: doc.nameOnDocument || '',
    aadhaarNumber: doc.number || '',
    keepLastFourOnly: doc.keepLast4Only ?? true,
    frontImageAdded: Boolean(doc.scanId || doc.scan),
    backImageAdded: false,
    scanId: doc.scanId || '',
  };
};

export const mapDocToPanFormData = (doc: any) => {
  if (!doc) return null;
  return {
    fullName: doc.nameOnDocument || '',
    panNumber: doc.number || '',
    dob: doc.dateOfBirth ? formatDisplayDateFromIso(doc.dateOfBirth) : '',
    frontImageAdded: Boolean(doc.scanId || doc.scan),
    backImageAdded: false,
    scanId: doc.scanId || '',
  };
};

export const mapDocToInsuranceFormData = (doc: any) => {
  if (!doc) return null;
  return {
    type: doc.insuranceType || 'HEALTH',
    insurer: doc.insurer || '',
    planName: doc.planName || '',
    policyNumber: doc.policyNumber || doc.number || '',
    sumInsured: doc.sumInsured ? `₹${doc.sumInsured.toLocaleString('en-IN')}` : '',
    premiumPerYear: doc.annualPremium || doc.premiumAmount ? `₹${(doc.annualPremium || doc.premiumAmount).toLocaleString('en-IN')}` : '',
    renewalDate: doc.expiresOn ? formatDisplayDateFromIso(doc.expiresOn) : '',
    saveInFamilyVault: doc.saveToFamilyVault ?? true,
    remindRenewal: Boolean(doc.renewalReminderLeadDays && doc.renewalReminderLeadDays.length > 0),
    coveredMemberIds: Array.isArray(doc.coveredMemberIds) ? doc.coveredMemberIds : [],
    coveredNames: '',
    reminders: mapLeadDaysToReminders(doc.reminderLeadDays || doc.renewalReminderLeadDays),
    remindMemberIds: Array.isArray(doc.remindMemberIds) ? doc.remindMemberIds : [],
    assignees:
      typeof doc.assignees === 'string' &&
      !doc.assignees.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)
        ? doc.assignees
        : '',
    frontImageAdded: Boolean(doc.scanId || doc.scan),
    backImageAdded: false,
    scanId: doc.scanId || '',
  };
};

