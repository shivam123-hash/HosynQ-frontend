import {
  PulseAppreciationApiItem,
  PulseMilestoneApiItem,
  PulsePollApiItem,
} from '../../../services/pulseServices';
import Colors from '../../../units/Colors';
import {
  AppreciationItem,
  FamilyMemberPulse,
  MilestoneItem,
  MoodType,
  PollItem,
} from './types';

export const isJestTestEnv = (): boolean =>
  typeof (globalThis as any)?.process !== 'undefined' &&
  Boolean((globalThis as any).process?.env?.JEST_WORKER_ID);

/**
 * Starts API calls cleanly on the next animation frame so the opening UI
 * mounts immediately while avoiding any empty-state flicker before fetch begins.
 */
export const scheduleAfterTransition = (task: () => void): (() => void) => {
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

const AVATAR_STYLES = [
  { bg: Colors.avatarBrown, text: Colors.primarySubtle },
  { bg: Colors.avatarNavy, text: Colors.accentBlueSoft },
  { bg: Colors.avatarGreen, text: Colors.accentGreenSoft },
  { bg: Colors.avatarWine, text: Colors.accentPink },
  { bg: Colors.avatarOlive, text: Colors.accentYellow },
];

export const getPulseInitial = (fullName?: string | null): string => {
  if (!fullName) return 'M';
  const first = fullName.trim().split(/\s+/)[0] || '';
  if (!first) return 'M';
  if (first.length >= 2 && first.toLowerCase().startsWith('aa')) {
    return 'Aa';
  }
  return first.charAt(0).toUpperCase();
};

export const getAvatarPaletteStyle = (seed = 0, customBg?: string | null) => {
  const palette = AVATAR_STYLES[Math.abs(seed) % AVATAR_STYLES.length];
  return {
    bgColor: customBg || palette.bg,
    textColor: customBg ? Colors.white : palette.text,
  };
};

export const MOOD_API_MAP: Record<MoodType, { api: string; label: string; icon: string; color: string }> = {
  great: { api: 'HAPPY', label: 'Great', icon: 'smile', color: '#4CC38A' },
  good: { api: 'GOOD', label: 'Good', icon: 'smile', color: '#4CC38A' },
  okay: { api: 'EXCITED', label: 'Okay', icon: 'meh', color: Colors.accentYellow },
  tired: { api: 'TIRED', label: 'Tired', icon: 'minus-circle', color: Colors.accentBlueSoft },
  stressed: { api: 'ANXIOUS', label: 'Stressed', icon: 'frown', color: Colors.accentRed },
};

export const mapApiMoodToUiType = (rawMood?: string | null): MoodType | undefined => {
  if (!rawMood) return undefined;
  const upper = rawMood.trim().toUpperCase();
  switch (upper) {
    case 'GREAT':
    case 'HAPPY':
      return 'great';
    case 'GOOD':
      return 'good';
    case 'OKAY':
    case 'EXCITED':
      return 'okay';
    case 'TIRED':
      return 'tired';
    case 'STRESSED':
    case 'SAD':
    case 'ANXIOUS':
      return 'stressed';
    default:
      return 'good';
  }
};

export const formatApiMoodLabel = (rawMood?: string | null): string => {
  const ui = mapApiMoodToUiType(rawMood);
  if (!ui) return '';
  return MOOD_API_MAP[ui].label;
};

export interface PulseReactionDef {
  id: string;
  apiCode: string;
  label: string;
  iconType: 'feather' | 'material';
  iconName: string;
  color: string;
  tintBg: string;
}

export const PULSE_REACTIONS: PulseReactionDef[] = [
  {
    id: 'love',
    apiCode: 'LOVE',
    label: 'Love it',
    iconType: 'feather',
    iconName: 'heart',
    color: '#F06A6A',
    tintBg: 'rgba(240, 106, 106, 0.14)',
  },
  {
    id: 'proud',
    apiCode: 'FIRE',
    label: 'So proud',
    iconType: 'feather',
    iconName: 'star',
    color: '#F2C14D',
    tintBg: 'rgba(242, 193, 77, 0.14)',
  },
  {
    id: 'welldone',
    apiCode: 'CLAP',
    label: 'Well done',
    iconType: 'feather',
    iconName: 'thumbs-up',
    color: '#4CC38A',
    tintBg: 'rgba(76, 195, 138, 0.14)',
  },
  {
    id: 'haha',
    apiCode: 'HAHA',
    label: 'Haha',
    iconType: 'feather',
    iconName: 'smile',
    color: '#FFB04A',
    tintBg: 'rgba(255, 176, 74, 0.14)',
  },
  {
    id: 'treat',
    apiCode: 'LIKE',
    label: 'Treat time',
    iconType: 'feather',
    iconName: 'gift',
    color: '#F3A3CC',
    tintBg: 'rgba(243, 163, 204, 0.14)',
  },
  {
    id: 'shabash',
    apiCode: 'SUPPORT',
    label: 'Shabash!',
    iconType: 'material',
    iconName: 'auto-awesome',
    color: '#F0913A',
    tintBg: 'rgba(240, 145, 58, 0.16)',
  },
];

export const getReactionMeta = (idOrApiCode?: string | null): PulseReactionDef => {
  if (!idOrApiCode) return PULSE_REACTIONS[0];
  const upper = idOrApiCode.trim().toUpperCase();
  const uiId = reactionApiToUiId(upper);
  return (
    PULSE_REACTIONS.find((r) => r.apiCode === upper || r.id === uiId) ||
    PULSE_REACTIONS[0]
  );
};

export const computeUpdatedReactionSummary = (
  prev: {
    total: number;
    counts: Array<{ reaction: string; count: number }>;
    mine: string | null;
    memberIds?: string[];
  } | null | undefined,
  nextApiCode: string | null
) => {
  const current = prev || { total: 0, counts: [], mine: null };
  const prevMine = current.mine ? current.mine.toUpperCase() : null;
  const target = nextApiCode ? nextApiCode.toUpperCase() : null;

  // Map reaction -> count
  const countsMap = new Map<string, number>();
  (current.counts || []).forEach((c) => {
    const key = String(c.reaction || '').toUpperCase();
    if (key && c.count > 0) countsMap.set(key, c.count);
  });

  if (prevMine) {
    const updatedPrev = Math.max(0, (countsMap.get(prevMine) || 1) - 1);
    if (updatedPrev > 0) countsMap.set(prevMine, updatedPrev);
    else countsMap.delete(prevMine);
  }

  let nextMine: string | null = null;
  if (target && target !== prevMine) {
    nextMine = target;
    countsMap.set(target, (countsMap.get(target) || 0) + 1);
  }

  const nextCounts = Array.from(countsMap.entries()).map(([reaction, count]) => ({
    reaction,
    count,
  }));
  const nextTotal = nextCounts.reduce((acc, c) => acc + c.count, 0);

  return {
    ...current,
    total: nextTotal,
    counts: nextCounts,
    mine: nextMine,
  };
};

export const reactionApiToUiId = (apiCode?: string | null): string | undefined => {
  if (!apiCode) return undefined;
  const upper = apiCode.trim().toUpperCase();
  const found = PULSE_REACTIONS.find(
    (r) => r.apiCode === upper || r.id.toUpperCase() === upper
  );
  return found?.id || lowerFallback(upper);
};

const lowerFallback = (s: string) => {
  if (s === 'PROUD') return 'proud';
  if (s === 'WELLDONE' || s === 'WELL_DONE') return 'welldone';
  if (s === 'TREAT') return 'treat';
  if (s === 'SHABASH') return 'shabash';
  return s.toLowerCase();
};

export const reactionUiIdToApi = (idOrCode: string): string => {
  const found = PULSE_REACTIONS.find(
    (r) => r.id === idOrCode || r.apiCode === idOrCode.toUpperCase()
  );
  return found ? found.apiCode : idOrCode.toUpperCase().slice(0, 30);
};

export const formatPulseRelativeTime = (iso?: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const yestStr = yest.toISOString().slice(0, 10);
  const targetStr = date.toISOString().slice(0, 10);
  if (targetStr === todayStr) return 'Today';
  if (targetStr === yestStr) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const formatMilestoneDateAndMonth = (
  iso?: string | null
): { dateText: string; monthYear: string } => {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    return { dateText: 'Today', monthYear: 'RECENT' };
  }
  const dateText = d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const year = d.getFullYear();
  return {
    dateText,
    monthYear: `${month} ${year}`,
  };
};

export const formatPollClosesText = (
  status?: string | null,
  closesAt?: string | null,
  closedAt?: string | null
): string => {
  if (String(status).toUpperCase() === 'CLOSED' || closedAt) {
    return 'Closed';
  }
  if (!closesAt) {
    return 'Open until closed';
  }
  const d = new Date(closesAt);
  if (Number.isNaN(d.getTime())) return 'Open';
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `Closes ${datePart} · ${timePart}`;
};

export const extractPulseMembersFromFamilyState = (
  familyState: any
): FamilyMemberPulse[] => {
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
    const palette = getAvatarPaletteStyle(idx, m.avatarColor);
    const isChild =
      m.role === 'DEPENDENT_CHILD_PROFILE' ||
      (typeof m.age === 'number' && m.age < 18);

    return {
      id: String(m.memberId || m.id || `member-${idx}`),
      name: firstName,
      displayName: isYou ? 'You' : firstName,
      initial: getPulseInitial(fullName),
      bgColor: palette.bgColor,
      textColor: palette.textColor,
      role: m.role,
      familyRole: m.familyRole,
      isYou,
      isAdult: !isChild,
      hasAccount: Boolean(m.hasAccount),
    };
  });
};

export const mapApiAppreciationToUi = (
  item: PulseAppreciationApiItem,
  memberLookup: Map<string, FamilyMemberPulse>,
  myMemberId?: string | null
): AppreciationItem => {
  const fromMember = memberLookup.get(item.from?.memberId || '');
  const toMember = memberLookup.get(item.to?.memberId || '');
  const senderStyle = fromMember
    ? { bgColor: fromMember.bgColor, textColor: fromMember.textColor }
    : getAvatarPaletteStyle(1, item.from?.avatarColor);
  const receiverStyle = toMember
    ? { bgColor: toMember.bgColor, textColor: toMember.textColor }
    : getAvatarPaletteStyle(2, item.to?.avatarColor);

  const isFromMe = Boolean(myMemberId && item.from?.memberId === myMemberId);
  const isToMe = Boolean(myMemberId && item.to?.memberId === myMemberId);

  const counts = item.reactions?.counts || [];
  const heartsEntry = counts.find((c) => c.reaction?.toUpperCase() === 'LOVE');
  const otherTotal = counts
    .filter((c) => c.reaction?.toUpperCase() !== 'LOVE')
    .reduce((sum, c) => sum + (c.count || 0), 0);

  return {
    id: item.id,
    senderId: item.from?.memberId || '',
    senderName: isFromMe
      ? 'You'
      : fromMember?.name || item.from?.fullName?.split(/\s+/)[0] || 'Family',
    senderInitial: getPulseInitial(item.from?.fullName || fromMember?.name),
    senderColor: senderStyle.bgColor,
    senderTextColor: senderStyle.textColor,
    receiverId: item.to?.memberId || '',
    receiverName: isToMe
      ? 'you'
      : toMember?.name || item.to?.fullName?.split(/\s+/)[0] || 'Family',
    receiverInitial: getPulseInitial(item.to?.fullName || toMember?.name),
    receiverColor: receiverStyle.bgColor,
    receiverTextColor: receiverStyle.textColor,
    timeText: formatPulseRelativeTime(item.createdAt),
    message: item.message,
    tag: item.tag || null,
    heartsCount: heartsEntry?.count ?? (item.reactions?.total || 0),
    starsCount: otherTotal,
    userReacted: Boolean(item.reactions?.mine),
    canRemove: Boolean(item.canRemove),
    reactions: item.reactions,
  };
};

export const mapApiPollToUi = (
  poll: PulsePollApiItem,
  memberLookup: Map<string, FamilyMemberPulse>,
  myMemberId?: string | null
): PollItem => {
  const authorId = poll.askedBy?.memberId;
  const authorMember = memberLookup.get(authorId || '');
  const authorStyle = authorMember
    ? { bgColor: authorMember.bgColor }
    : getAvatarPaletteStyle(0, poll.askedBy?.avatarColor);
  const isMine = Boolean(myMemberId && authorId === myMemberId);

  const mySet = new Set(poll.myOptionIds || []);
  const options = (poll.options || []).map((opt) => ({
    id: opt.id,
    text: opt.label,
    votes: opt.votes || 0,
    percentage: opt.percent || 0,
    isUserVoted: mySet.has(opt.id),
    memberIds: opt.memberIds || [],
    voterInitials: (opt.memberIds || []).map((mId, i) => {
      const m = memberLookup.get(mId);
      const pal = m ? { bgColor: m.bgColor } : getAvatarPaletteStyle(i);
      return {
        initial: m?.initial || 'M',
        bgColor: pal.bgColor,
        name: m?.displayName,
      };
    }),
  }));

  const isClosed = String(poll.status).toUpperCase() === 'CLOSED';

  return {
    id: poll.id,
    question: poll.question,
    authorId,
    authorName: isMine
      ? 'you'
      : authorMember?.name || poll.askedBy?.fullName?.split(/\s+/)[0] || 'Family',
    authorInitial: getPulseInitial(poll.askedBy?.fullName || authorMember?.name),
    authorColor: authorStyle.bgColor,
    timeText: formatPulseRelativeTime(poll.createdAt),
    status: isClosed ? 'closed' : 'active',
    hasUserVoted: mySet.size > 0,
    allowMultiple: Boolean(poll.allowMultiple),
    closesAt: poll.closesAt || null,
    closedAt: poll.closedAt || null,
    voterIds: poll.voterIds || [],
    eligibleCount: poll.eligibleCount || Math.max(memberLookup.size, 1),
    topOptionIds: poll.topOptionIds || [],
    canVote: poll.canVote ?? !isClosed,
    canManage: Boolean(poll.canManage),
    options,
    totalVotes: poll.voterCount || 0,
    closesText: formatPollClosesText(poll.status, poll.closesAt, poll.closedAt),
  };
};

export const mapApiMilestoneToUi = (
  ms: PulseMilestoneApiItem,
  memberLookup: Map<string, FamilyMemberPulse>,
  myMemberId?: string | null
): MilestoneItem => {
  const member = ms.member?.memberId ? memberLookup.get(ms.member.memberId) : null;
  const style = member
    ? { bgColor: member.bgColor }
    : getAvatarPaletteStyle(ms.isFamily ? 2 : 3, ms.member?.avatarColor);

  const personName = ms.isFamily
    ? 'Family'
    : member?.name || ms.member?.fullName?.split(/\s+/)[0] || 'Family';

  const { dateText, monthYear } = formatMilestoneDateAndMonth(ms.achievedOn);
  const addedByMe = Boolean(myMemberId && ms.addedBy?.memberId === myMemberId);
  const addedByName = ms.addedBy?.fullName?.split(/\s+/)[0];
  const authorText = ms.isFamily && !addedByName
    ? 'Family'
    : addedByMe
    ? 'Added by you'
    : addedByName
    ? `Added by ${addedByName}`
    : 'Family';

  const upperType = String(ms.type || '').toUpperCase();
  const iconType: 'trophy' | 'book' | 'cake' =
    upperType === 'LEARNING'
      ? 'book'
      : upperType === 'FIRST' || upperType === 'PHYSICAL'
      ? 'trophy'
      : 'cake';

  const photos = Array.isArray(ms.photos) ? ms.photos : [];

  return {
    id: ms.id,
    title: ms.title,
    memberId: ms.member?.memberId || null,
    isFamily: Boolean(ms.isFamily),
    personName,
    personInitial: ms.isFamily ? 'F' : getPulseInitial(ms.member?.fullName || personName),
    personColor: style.bgColor,
    achievedOn: ms.achievedOn,
    milestoneType: ms.type || 'OTHER',
    dateText,
    monthYear,
    authorText,
    reactionsCount: ms.reactions?.total || 0,
    reactions: ms.reactions,
    iconType,
    hasPhoto: photos.length > 0,
    photos,
    inLifeProfile: Boolean(ms.inLifeProfile),
    sharedToPulse: ms.sharedToPulse ?? true,
    removal: ms.removal || null,
    canManage: Boolean(ms.canManage || ms.removal),
    categoryTag: personName.toUpperCase(),
  };
};
