import { HealthProfileFormValues, DEFAULT_HEALTH_FORM_VALUES } from './HealthProfileInputScreen';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const toIsoDateString = (dateVal?: string | Date | null): string | undefined => {
  if (!dateVal) return undefined;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed === '—' || trimmed.toLowerCase() === 'ongoing') {
      return undefined;
    }
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // "12 Mar 2026" or "12-03-2026"
    const parts = trimmed.split(/[\s-/.]+/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        // DD-MM-YYYY or DD MMM YYYY
        const day = parts[0].padStart(2, '0');
        let month = '01';
        if (isNaN(Number(parts[1]))) {
          const monthIdx = MONTH_NAMES.findIndex(
            (m) => m.toLowerCase() === parts[1].toLowerCase().slice(0, 3)
          );
          if (monthIdx >= 0) {
            month = String(monthIdx + 1).padStart(2, '0');
          }
        } else {
          month = parts[1].padStart(2, '0');
        }
        const year = parts[2];
        if (year.length === 4) {
          return `${year}-${month}-${day}`;
        }
      }
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

export const formatDisplayDate = (isoDate?: string | Date | null): string => {
  if (!isoDate) return '';
  const isoStr = typeof isoDate === 'string' ? isoDate : isoDate.toISOString();
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return typeof isoDate === 'string' ? isoDate : '';
};

export const mapDoctorSpeciality = (spec?: string): string => {
  if (!spec) return 'GENERAL_PHYSICIAN';
  const clean = spec.trim().toUpperCase();
  if (clean.includes('GENERAL')) return 'GENERAL_PHYSICIAN';
  if (clean.includes('PAED') || clean.includes('PED')) return 'PAEDIATRICIAN';
  if (clean.includes('GYN') || clean.includes('WOMEN')) return 'GYNAECOLOGIST';
  if (clean.includes('CARDIO') || clean.includes('HEART')) return 'CARDIOLOGIST';
  return 'OTHER';
};

export const mapCheckupRepeat = (rep?: string): string => {
  if (!rep) return 'YEARLY';
  const clean = rep.trim().toUpperCase();
  if (clean.includes('3')) return 'EVERY_3_MONTHS';
  if (clean.includes('6')) return 'EVERY_6_MONTHS';
  if (clean.includes('ONCE')) return 'ONCE';
  return 'YEARLY';
};

export const mapEyewear = (ew?: string): string => {
  if (!ew) return 'GLASSES';
  const clean = ew.trim().toUpperCase();
  if (clean.includes('CONTACT')) return 'CONTACTS';
  if (clean.includes('NEITHER') || clean.includes('NO')) return 'NEITHER';
  return 'GLASSES';
};

export const formatEyePower = (power?: string): string | undefined => {
  if (!power) return undefined;
  const trimmed = power.trim();
  if (!trimmed || trimmed === '—') return undefined;
  // Valid pattern: /^[+-]?\d{1,2}(\.\d{1,2})?$/
  if (/^[+-]?\d{1,2}(\.\d{1,2})?$/.test(trimmed)) {
    return trimmed;
  }
  // Try extracting number
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}`;
  }
  return undefined;
};

export const formatDoctorPhone = (phoneCode?: string, phoneNum?: string): string | undefined => {
  if (!phoneNum?.trim()) return undefined;
  const trimmed = phoneNum.trim();
  let digits: string;
  if (trimmed.startsWith('+')) {
    digits = trimmed.replace(/[^\d+]/g, '');
  } else {
    digits = `${phoneCode || '+91'}${trimmed}`.replace(/[^\d+]/g, '');
  }
  if (!digits.startsWith('+')) {
    digits = `+${digits}`;
  }
  return digits.length >= 8 ? digits : undefined;
};

/**
 * Translates HealthProfileFormValues to backend HealthSectionDto payload
 */
export const buildHealthPayload = (form: HealthProfileFormValues): Record<string, any> => {
  const health: Record<string, any> = {};

  if (form.doctor.doctorName?.trim()) {
    health.primaryDoctor = form.doctor.doctorName.trim();
  }

  health.doctorSpeciality = mapDoctorSpeciality(form.doctor.speciality);

  const phone = formatDoctorPhone(form.doctor.phoneCode, form.doctor.phoneNumber);
  if (phone) {
    health.doctorPhone = phone;
  }

  if (form.doctor.clinicName?.trim()) {
    health.clinicName = form.doctor.clinicName.trim();
  }

  if (form.doctor.clinicLocation?.trim()) {
    health.doctorClinicLocation = form.doctor.clinicLocation.trim();
  }

  if (form.hospital.preferredHospital?.trim()) {
    health.preferredHospital = form.hospital.preferredHospital.trim();
  }

  // Map Allergies: [{ name: "Penicillin", severity: "SEVERE" }]
  if (Array.isArray(form.allergies) && form.allergies.length > 0) {
    health.allergies = form.allergies.map((item) => {
      const parts = item.label.split('·');
      const name = parts[0]?.trim() || item.label;
      const rawSev = parts[1]?.trim().toUpperCase();
      let severity = 'MILD';
      if (rawSev?.includes('SEVERE')) severity = 'SEVERE';
      else if (rawSev?.includes('MOD')) severity = 'MODERATE';
      return { name, severity };
    });
  } else {
    health.allergies = [];
  }

  // Map Medical Conditions: [{ name: "Migraine", sinceYear: 2015 }]
  if (Array.isArray(form.conditions) && form.conditions.length > 0) {
    health.medicalConditions = form.conditions.map((item) => {
      const parts = item.label.split('·');
      const name = parts[0]?.trim() || item.label;
      const yearMatch = item.label.match(/\b(19\d{2}|20\d{2})\b/);
      const sinceYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
      return sinceYear ? { name, sinceYear } : { name };
    });
  } else {
    health.medicalConditions = [];
  }

  const lastCheckup = toIsoDateString(form.checkups?.lastCheckup);
  if (lastCheckup) {
    health.lastCheckupDate = lastCheckup;
  }

  const nextCheckup = toIsoDateString(form.checkups?.nextCheckup);
  if (nextCheckup) {
    health.nextCheckupDate = nextCheckup;
  }

  health.checkupRepeat = mapCheckupRepeat(form.checkups.repeatEvery);
  health.eyewear = mapEyewear(form.eyesight.wears);

  const rightPower = formatEyePower(form.eyesight.rightEyePower);
  if (rightPower) {
    health.rightEyePower = rightPower;
  }

  const leftPower = formatEyePower(form.eyesight.leftEyePower);
  if (leftPower) {
    health.leftEyePower = leftPower;
  }

  const eyeTestDate = toIsoDateString(form.eyesight.lastEyeTest);
  if (eyeTestDate) {
    health.lastEyeTestDate = eyeTestDate;
  }

  return health;
};

/**
 * Reverse maps backend health response into HealthProfileFormValues
 */
export const mapBackendToHealthForm = (backendHealth: any): HealthProfileFormValues => {
  if (!backendHealth) return DEFAULT_HEALTH_FORM_VALUES;

  const rawDoctorPhone = backendHealth.doctorPhone || '';
  let phoneCode = '+91';
  let phoneNumber = '';
  if (rawDoctorPhone.startsWith('+91')) {
    phoneCode = '+91';
    phoneNumber = rawDoctorPhone.slice(3).trim();
  } else if (rawDoctorPhone.startsWith('+')) {
    phoneCode = rawDoctorPhone.slice(0, 3);
    phoneNumber = rawDoctorPhone.slice(3).trim();
  } else {
    phoneNumber = rawDoctorPhone;
  }

  const rawSpeciality = (backendHealth.doctorSpeciality || 'GENERAL_PHYSICIAN').replace(/_/g, ' ');
  const speciality =
    rawSpeciality.charAt(0).toUpperCase() + rawSpeciality.slice(1).toLowerCase();

  const allergies = Array.isArray(backendHealth.allergies)
    ? backendHealth.allergies.map((a: any, idx: number) => {
        const sev = a.severity ? ` · ${a.severity.charAt(0) + a.severity.slice(1).toLowerCase()}` : '';
        return {
          id: String(idx + 1),
          label: `${a.name || a}${sev}`,
        };
      })
    : DEFAULT_HEALTH_FORM_VALUES.allergies;

  const conditions = Array.isArray(backendHealth.medicalConditions)
    ? backendHealth.medicalConditions.map((c: any, idx: number) => {
        const yr = c.sinceYear ? ` · since ${c.sinceYear}` : '';
        return {
          id: String(idx + 1),
          label: `${c.name || c}${yr}`,
        };
      })
    : DEFAULT_HEALTH_FORM_VALUES.conditions;

  const rawRepeat = (backendHealth.checkupRepeat || 'YEARLY').replace(/_/g, ' ');
  const repeatEvery =
    rawRepeat === 'YEARLY'
      ? '1 year'
      : rawRepeat === 'EVERY 6 MONTHS'
      ? '6 months'
      : rawRepeat === 'EVERY 3 MONTHS'
      ? '3 months'
      : '1 year';

  const rawEyewear = (backendHealth.eyewear || 'GLASSES').toLowerCase();
  const wears =
    rawEyewear === 'contacts'
      ? 'Contacts'
      : rawEyewear === 'neither'
      ? 'Neither'
      : 'Glasses';

  return {
    doctor: {
      doctorName: backendHealth.primaryDoctor || DEFAULT_HEALTH_FORM_VALUES.doctor.doctorName,
      speciality: speciality || DEFAULT_HEALTH_FORM_VALUES.doctor.speciality,
      phoneCode,
      phoneNumber,
      clinicName: backendHealth.clinicName || DEFAULT_HEALTH_FORM_VALUES.doctor.clinicName,
      clinicLocation: backendHealth.doctorClinicLocation || DEFAULT_HEALTH_FORM_VALUES.doctor.clinicLocation,
    },
    hospital: {
      preferredHospital: backendHealth.preferredHospital || DEFAULT_HEALTH_FORM_VALUES.hospital.preferredHospital,
    },
    allergies,
    conditions,
    medications: DEFAULT_HEALTH_FORM_VALUES.medications,
    checkups: {
      lastCheckup: formatDisplayDate(backendHealth.lastCheckupDate) || DEFAULT_HEALTH_FORM_VALUES.checkups.lastCheckup,
      nextCheckup: formatDisplayDate(backendHealth.nextCheckupDate) || DEFAULT_HEALTH_FORM_VALUES.checkups.nextCheckup,
      repeatEvery,
    },
    eyesight: {
      wears: wears as any,
      rightEyePower: backendHealth.rightEyePower || DEFAULT_HEALTH_FORM_VALUES.eyesight.rightEyePower,
      leftEyePower: backendHealth.leftEyePower || DEFAULT_HEALTH_FORM_VALUES.eyesight.leftEyePower,
      lastEyeTest: formatDisplayDate(backendHealth.lastEyeTestDate) || DEFAULT_HEALTH_FORM_VALUES.eyesight.lastEyeTest,
      attachedReport: null,
    },
  };
};
