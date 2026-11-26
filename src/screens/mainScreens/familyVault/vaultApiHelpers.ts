import { isUUID } from '../../../redux/features/lists/listsSlice';
import {
  VaultItemApi,
  VaultVisibility,
} from '../../../services/vaultServices';

export interface VaultFamilyMember {
  id: string;
  name: string;
  firstName: string;
  initial: string;
  isYou: boolean;
  isAdult: boolean;
  role?: string;
  bgColor: string;
}

const AVATAR_BG = ['#5C3A21', '#1F3A66', '#24422E', '#6E2042', '#5A4E1B'];

export const isJestTestEnv = (): boolean =>
  typeof (globalThis as any)?.process !== 'undefined' &&
  Boolean((globalThis as any).process?.env?.JEST_WORKER_ID);

export const scheduleVaultAfterTransition = (task: () => void): (() => void) => {
  if (isJestTestEnv()) {
    task();
    return () => {};
  }
  let cancelled = false;
  const rafId = requestAnimationFrame(() => {
    if (!cancelled) {
      task();
    }
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
};

export const extractVaultMembersFromFamilyState = (
  familyState: any
): VaultFamilyMember[] => {
  const rawList =
    familyState?.basicFamilyData?.members ||
    familyState?.basicFamilyData?.family?.members ||
    familyState?.myFamilyData?.family?.members ||
    familyState?.myFamilyData?.members ||
    familyState?.family?.members ||
    [];

  if (!Array.isArray(rawList)) return [];

  return rawList.map((m: any, idx: number) => {
    const fullName = String(m.fullName || m.name || 'Member').trim();
    const firstName = fullName.split(/\s+/)[0] || fullName;
    const isYou = Boolean(m.isYou || m.isMe);
    const isChild =
      m.role === 'DEPENDENT_CHILD_PROFILE' ||
      (typeof m.age === 'number' && m.age < 18);

    return {
      id: String(m.memberId || m.id || `member-${idx}`),
      name: fullName,
      firstName: isYou ? 'You' : firstName,
      initial: firstName.charAt(0).toUpperCase() || 'M',
      isYou,
      isAdult: !isChild,
      role: m.role,
      bgColor: m.avatarColor || AVATAR_BG[idx % AVATAR_BG.length],
    };
  });
};

export const filterValidFamilyMemberIds = (
  candidateIds: string[] | undefined,
  members: VaultFamilyMember[]
): string[] => {
  if (!candidateIds || candidateIds.length === 0) return [];
  const validSet = new Set(members.map((m) => m.id).filter((id) => isUUID(id)));
  return candidateIds.filter((id) => validSet.has(id));
};

export const formatInrAmount = (amount?: number | null): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
  try {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } catch {
    return `₹${Math.round(amount)}`;
  }
};

export const formatVaultDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatVaultShortDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDaysRemaining = (item?: Partial<VaultItemApi> | null): number | null => {
  if (!item) return null;
  if (typeof item.daysRemaining === 'number') return item.daysRemaining;
  if (typeof item.daysLeft === 'number') return item.daysLeft;
  if (!item.dueOn) return null;
  const due = new Date(item.dueOn);
  if (Number.isNaN(due.getTime())) return null;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
};

export const formatDaysRemainingBadge = (
  days: number | null,
  dueLabel?: string | null
): { text: string; isUrgent: boolean; isOverdue: boolean } | null => {
  if (days === null) return null;
  const prefix =
    dueLabel?.toLowerCase() === 'due'
      ? 'Due'
      : dueLabel?.toLowerCase() === 'puc'
      ? 'PUC due'
      : 'Renews';

  if (days < 0) {
    return {
      text: `Overdue ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`,
      isUrgent: true,
      isOverdue: true,
    };
  }
  if (days === 0) {
    return { text: `${prefix} today`, isUrgent: true, isOverdue: false };
  }
  if (days === 1) {
    return { text: `${prefix} tomorrow`, isUrgent: true, isOverdue: false };
  }
  if (days <= 30) {
    return { text: `${prefix} in ${days} days`, isUrgent: true, isOverdue: false };
  }
  return null;
};

export const calculateNextDueDate = (
  currentDueIso?: string | null,
  repeatMonths?: number | null
): string => {
  const months = repeatMonths && repeatMonths > 0 ? repeatMonths : 1;
  const base =
    currentDueIso && !Number.isNaN(new Date(currentDueIso).getTime())
      ? new Date(currentDueIso)
      : new Date();
  base.setMonth(base.getMonth() + months);
  return base.toISOString().slice(0, 10);
};

export const maskSecretNumber = (num?: string | null): string => {
  if (!num) return 'Not added';
  const clean = String(num).trim();
  if (clean.length <= 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
};

export const formatVisibilityLabel = (v?: VaultVisibility | string): string => {
  switch (String(v || 'ADULTS').toUpperCase()) {
    case 'EVERYONE':
      return 'Everyone in family';
    case 'ONLY_ME':
      return 'Only me';
    case 'ADULTS':
    default:
      return 'Adults only';
  }
};

export const formatLifeProfileDocGroupLabel = (type: string): string => {
  switch (String(type || '').toUpperCase()) {
    case 'PASSPORT':
      return 'Passports';
    case 'AADHAAR':
      return 'Aadhaar cards';
    case 'PAN':
      return 'PAN cards';
    case 'DRIVING_LICENSE':
      return 'Driving licenses';
    case 'VISA':
      return 'Visas';
    case 'BIRTH_CERTIFICATE':
      return 'Birth certificates';
    case 'SENIOR_CITIZEN_CARD':
      return 'Senior citizen cards';
    default:
      return type ? `${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}s` : 'Documents';
  }
};

export const formatCategoryDisplayName = (cat?: string | null): string => {
  switch (String(cat || '').toUpperCase()) {
    case 'INSURANCE':
      return 'Insurance';
    case 'ASSET':
      return 'Home assets';
    case 'PROPERTY':
      return 'Property';
    case 'FINANCE':
      return 'Finance';
    case 'IDENTITY':
      return 'Documents';
    case 'UTILITIES':
      return 'Bills';
    case 'WARRANTY':
      return 'Warranties';
    case 'MEDICAL':
      return 'Medical';
    case 'LEGAL':
      return 'Legal';
    case 'CONTACTS':
      return 'Contacts';
    default:
      return cat || 'Vault';
  }
};

export const getCurrentVaultUserContext = (
  familyState: any
): {
  memberId: string;
  role: string;
  isAdminOrOwner: boolean;
  isChild: boolean;
} => {
  const members = extractVaultMembersFromFamilyState(familyState);
  const youMember = members.find((m) => m.isYou);

  const memberId = String(
    familyState?.myMemberId ||
      familyState?.family?.myMemberId ||
      familyState?.basicFamilyData?.myMemberId ||
      familyState?.myFamilyData?.family?.myMemberId ||
      youMember?.id ||
      ''
  );

  const role = String(
    familyState?.family?.myRole ||
      familyState?.basicFamilyData?.myRole ||
      familyState?.myFamilyData?.family?.myRole ||
      youMember?.role ||
      ''
  ).toUpperCase();

  const isAdminOrOwner =
    role === 'FAMILY_OWNER' ||
    role === 'FAMILY_ADMIN' ||
    role === 'OWNER' ||
    role === 'ADMIN';

  const isChild =
    role === 'DEPENDENT_CHILD_PROFILE' || role === 'CHILD';

  return { memberId, role, isAdminOrOwner, isChild };
};

export const canEditVaultItem = (
  item: Partial<VaultItemApi> | null | undefined,
  familyState: any
): boolean => {
  if (!item) return false;
  if (typeof item.canEdit === 'boolean') return item.canEdit;

  const creatorId = item.addedByMemberId || item.addedBy?.id;
  const { memberId, isAdminOrOwner, isChild } =
    getCurrentVaultUserContext(familyState);
  if (isChild) return Boolean(memberId && creatorId === memberId);
  if (isAdminOrOwner) return true;
  if (memberId && creatorId) {
    return creatorId === memberId;
  }
  return false;
};

export const canDeleteVaultItem = (
  item: Partial<VaultItemApi> | null | undefined,
  familyState: any
): boolean => {
  if (!item || !item.id || !isUUID(item.id)) return false;
  if (typeof item.canDelete === 'boolean') return item.canDelete;

  const creatorId = item.addedByMemberId || item.addedBy?.id;
  const { memberId, isAdminOrOwner } =
    getCurrentVaultUserContext(familyState);
  if (isAdminOrOwner) return true;
  if (memberId && creatorId) {
    return creatorId === memberId;
  }
  return false;
};
