export const VACCINE_DOSES_LIST = [
  'DOSE_1',
  'DOSE_2',
  'DOSE_3',
  'BOOSTER',
  'YEARLY',
  'NOT_SURE',
] as const;

export type VaccineDoseEnum = (typeof VACCINE_DOSES_LIST)[number];

export const MILESTONE_TYPES_LIST = [
  'PHYSICAL',
  'LEARNING',
  'SOCIAL',
  'FIRST',
  'OTHER',
] as const;

export type MilestoneTypeEnum = (typeof MILESTONE_TYPES_LIST)[number];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const isValidUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
};

export const toIsoDateString = (
  dateVal?: string | Date | null,
): string | undefined => {
  if (!dateVal) return undefined;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed === '—' || trimmed.toLowerCase() === 'ongoing') {
      return undefined;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parts = trimmed.split(/[\s-/.]+/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        // DD MMM YYYY or DD MM YYYY
        const day = parts[0].padStart(2, '0');
        let month = '01';
        if (isNaN(Number(parts[1]))) {
          const idx = MONTH_NAMES.findIndex(
            (m) => m.toLowerCase() === parts[1].toLowerCase().slice(0, 3),
          );
          if (idx >= 0) {
            month = String(idx + 1).padStart(2, '0');
          }
        } else {
          month = parts[1].padStart(2, '0');
        }
        const year = parts[2];
        if (year.length === 4) {
          return `${year}-${month}-${day}`;
        }
      }
    } else if (parts.length === 2) {
      // "Oct 2027" or "10 2027"
      let month = '01';
      if (isNaN(Number(parts[0]))) {
        const idx = MONTH_NAMES.findIndex(
          (m) => m.toLowerCase() === parts[0].toLowerCase().slice(0, 3),
        );
        if (idx >= 0) {
          month = String(idx + 1).padStart(2, '0');
        }
      } else {
        month = parts[0].padStart(2, '0');
      }
      const year = parts[1];
      if (year.length === 4) {
        return `${year}-${month}-01`;
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return undefined;
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toISOString().slice(0, 10);
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

export const mapDoseToEnum = (doseLabel?: string): VaccineDoseEnum => {
  if (!doseLabel) return 'YEARLY';
  const clean = doseLabel.trim().toUpperCase();
  if (clean.includes('DOSE 1') || clean.includes('DOSE_1')) return 'DOSE_1';
  if (clean.includes('DOSE 2') || clean.includes('DOSE_2')) return 'DOSE_2';
  if (clean.includes('DOSE 3') || clean.includes('DOSE_3')) return 'DOSE_3';
  if (clean.includes('BOOSTER')) return 'BOOSTER';
  if (clean.includes('NOT SURE') || clean.includes('NOT_SURE')) return 'NOT_SURE';
  return 'YEARLY';
};

export const mapEnumToDoseLabel = (doseEnum?: string): string => {
  if (!doseEnum) return 'Yearly dose';
  switch (doseEnum) {
    case 'DOSE_1':
      return 'Dose 1';
    case 'DOSE_2':
      return 'Dose 2';
    case 'DOSE_3':
      return 'Dose 3';
    case 'BOOSTER':
      return 'Booster';
    case 'NOT_SURE':
      return 'Not sure';
    case 'YEARLY':
    default:
      return 'Yearly dose';
  }
};

export const mapRemindTimingToDays = (timing?: string): number[] => {
  if (!timing) return [14];
  const clean = timing.toLowerCase();
  if (clean.includes('1 day')) return [1];
  if (clean.includes('1 week') || clean.includes('7 day')) return [7];
  if (clean.includes('1 month') || clean.includes('30 day')) return [30];
  return [14]; // default 2 weeks
};

export const mapMilestoneTypeToEnum = (typeLabel?: string): MilestoneTypeEnum => {
  if (!typeLabel) return 'PHYSICAL';
  const clean = typeLabel.trim().toUpperCase();
  if (clean.includes('LEARN')) return 'LEARNING';
  if (clean.includes('SOCIAL')) return 'SOCIAL';
  if (clean.includes('FIRST')) return 'FIRST';
  if (clean.includes('OTHER')) return 'OTHER';
  return 'PHYSICAL';
};

export const mapEnumToMilestoneType = (
  typeEnum?: string,
): 'Physical' | 'Learning' | 'Social' | 'A first' | 'Other' => {
  if (!typeEnum) return 'Physical';
  switch (typeEnum) {
    case 'LEARNING':
      return 'Learning';
    case 'SOCIAL':
      return 'Social';
    case 'FIRST':
      return 'A first';
    case 'OTHER':
      return 'Other';
    case 'PHYSICAL':
    default:
      return 'Physical';
  }
};

export interface BuildVaccineOptions {
  id?: string;
  certificateScanId?: string;
  remindMemberIds?: string[];
}

export const buildVaccineItemPayload = (
  data: {
    vaccineName: string;
    dose: string;
    dateGiven: string;
    givenAt?: string;
    batchNumber?: string;
    nextDue?: string;
    remindMe?: boolean;
    remindTiming?: string;
  },
  options?: BuildVaccineOptions,
) => {
  const doseEnum = mapDoseToEnum(data.dose);
  const givenOn = toIsoDateString(data.dateGiven) || new Date().toISOString().slice(0, 10);
  const nextDueOn = toIsoDateString(data.nextDue);

  const doseItem: Record<string, any> = {
    dose: doseEnum,
    givenOn,
  };
  if (data.givenAt?.trim()) doseItem.givenAt = data.givenAt.trim();
  if (data.batchNumber?.trim()) doseItem.batchNumber = data.batchNumber.trim();
  if (options?.certificateScanId && isValidUuid(options.certificateScanId)) {
    doseItem.certificateScanId = options.certificateScanId;
  }

  const vaccinePayload: Record<string, any> = {
    name: data.vaccineName.trim(),
    dose: doseEnum,
    doses: [doseItem],
  };

  if (options?.id) {
    vaccinePayload.id = options.id;
  }
  if (nextDueOn) {
    vaccinePayload.nextDueOn = nextDueOn;
  }
  if (data.remindMe !== false) {
    vaccinePayload.reminderLeadDays = mapRemindTimingToDays(data.remindTiming);
    if (options?.remindMemberIds && options.remindMemberIds.length > 0) {
      vaccinePayload.remindMemberIds = options.remindMemberIds;
    }
  }

  return vaccinePayload;
};

export const buildGrowthItemPayload = (data: {
  id?: string;
  heightCm?: number;
  weightKg?: number;
  measuredOn?: string | Date;
  remindMe?: boolean;
}) => {
  const measuredOnIso =
    toIsoDateString(data.measuredOn) || new Date().toISOString().slice(0, 10);

  const growthItem: Record<string, any> = {
    measuredOn: measuredOnIso,
  };

  if (data.id) growthItem.id = data.id;
  if (typeof data.heightCm === 'number' && !isNaN(data.heightCm)) {
    growthItem.heightCm = data.heightCm;
  }
  if (typeof data.weightKg === 'number' && !isNaN(data.weightKg)) {
    growthItem.weightKg = data.weightKg;
  }
  if (data.remindMe) {
    // 3 months later
    const d = new Date(measuredOnIso);
    d.setMonth(d.getMonth() + 3);
    growthItem.nextMeasureOn = d.toISOString().slice(0, 10);
  }

  return growthItem;
};

export const buildMilestoneItemPayload = (data: {
  id?: string;
  title: string;
  achievedOn?: string | Date;
  type?: string;
  sharedToPulse?: boolean;
}) => {
  const achievedOnIso =
    toIsoDateString(data.achievedOn) || new Date().toISOString().slice(0, 10);

  const milestoneItem: Record<string, any> = {
    title: data.title.trim(),
    achievedOn: achievedOnIso,
    type: mapMilestoneTypeToEnum(data.type),
    sharedToPulse: data.sharedToPulse ?? true,
  };

  if (data.id) milestoneItem.id = data.id;

  return milestoneItem;
};

export const deriveVaccineStatus = (
  nextDueOn?: string | null,
): 'due' | 'upcoming' | 'done' => {
  if (!nextDueOn) return 'done';
  const dueDate = new Date(nextDueOn);
  if (isNaN(dueDate.getTime())) return 'done';
  const diffDays = (dueDate.getTime() - Date.now()) / 86400000;
  if (diffDays <= 30) return 'due';
  return diffDays <= 365 ? 'upcoming' : 'done';
};

export const normalizeVaccineStatus = (
  status?: string | null,
  nextDueOn?: string | null,
): 'due' | 'upcoming' | 'done' => {
  if (status) {
    const s = status.toLowerCase();
    if (s === 'due') return 'due';
    if (s === 'upcoming') return 'upcoming';
    if (s === 'complete' || s === 'done') return 'done';
  }
  return deriveVaccineStatus(nextDueOn);
};

