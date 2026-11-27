import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';
import calendarServices, { CreateEventPayload } from './calendarServices';
import lifeProfileServices from './lifeProfileServices';

export interface PulseMemberRef {
  memberId: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export interface PulseReactionCount {
  reaction: string;
  count: number;
}

export interface PulseReactionsSummary {
  total: number;
  counts: PulseReactionCount[];
  mine: string | null;
  memberIds?: string[];
}

export interface PulseMoodMemberApiItem {
  memberId: string;
  fullName: string;
  isMe?: boolean;
  isYou?: boolean;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  mood: string | null;
  note?: string | null;
}

export interface PulseMoodsSummary {
  day: string;
  checkedIn: number;
  total: number;
  mine: string | null;
  members: PulseMoodMemberApiItem[];
}

export interface PulseAppreciationApiItem {
  id: string;
  from: PulseMemberRef;
  to: PulseMemberRef;
  message: string;
  tag?: string | null;
  createdAt: string;
  reactions: PulseReactionsSummary;
  canRemove?: boolean;
}

export interface PulsePollOptionApi {
  id: string;
  label: string;
  votes: number;
  percent: number;
  memberIds?: string[];
}

export interface PulsePollApiItem {
  id: string;
  question: string;
  askedBy?: PulseMemberRef;
  createdAt?: string;
  allowMultiple?: boolean;
  closesAt?: string | null;
  closedAt?: string | null;
  status: 'ACTIVE' | 'CLOSED' | string;
  voterIds?: string[];
  eligibleCount: number;
  options?: PulsePollOptionApi[];
  voterCount: number;
  myOptionIds?: string[];
  topOptionIds?: string[];
  canVote?: boolean;
  canManage?: boolean;
}

export type PulseMilestoneType =
  | 'PHYSICAL'
  | 'LEARNING'
  | 'SOCIAL'
  | 'FIRST'
  | 'OTHER';

export interface PulseMilestoneApiItem {
  id: string;
  member?: PulseMemberRef | null;
  isFamily: boolean;
  title: string;
  type?: PulseMilestoneType | string;
  achievedOn: string;
  addedBy?: PulseMemberRef | null;
  inLifeProfile?: boolean;
  sharedToPulse?: boolean;
  photos?: string[];
  reactions: PulseReactionsSummary;
  removal?: 'DELETE' | 'UNSHARE' | string | null;
  canManage?: boolean;
}

export interface PulseHomeResponse {
  success: boolean;
  familyName?: string;
  moods: PulseMoodsSummary;
  latestAppreciation?: PulseAppreciationApiItem | null;
  openPoll?: PulsePollApiItem | null;
  latestMilestone?: PulseMilestoneApiItem | null;
  isEmpty?: boolean;
}

export interface SetTodayMoodPayload {
  mood: string;
  note?: string | null;
}

export type AppreciationFilter = 'ALL' | 'FOR_ME' | 'FROM_ME';

export interface CreateAppreciationPayload {
  toMemberId: string;
  message: string;
  tag?: string;
}

export interface ListAppreciationsResponse {
  success: boolean;
  appreciations: PulseAppreciationApiItem[];
  nextCursor: string | null;
}

export type PollStatusFilter = 'ACTIVE' | 'CLOSED';

export interface CreatePollPayload {
  question: string;
  options: string[];
  allowMultiple?: boolean;
  closesAt?: string;
  voterIds?: string[];
}

export interface ListPollsResponse {
  success: boolean;
  counts?: {
    active: number;
    closed: number;
  };
  polls: PulsePollApiItem[];
  nextCursor: string | null;
}

export interface CreateMilestonePayload {
  memberId?: string;
  title: string;
  achievedOn?: string;
  type?: PulseMilestoneType;
  inLifeProfile?: boolean;
  sharedToPulse?: boolean;
}

export interface ListMilestonesQuery {
  memberId?: string;
  family?: boolean | string;
  limit?: number;
  before?: string;
}

export interface ListMilestonesResponse {
  success: boolean;
  milestones: PulseMilestoneApiItem[];
  nextCursor?: string | null;
}

export interface SaveLifeProfileMilestonesPayload {
  vaccination?: {
    visibility?: 'EVERYONE' | 'PARENTS' | 'RESTRICTED';
  };
  milestones?: Array<{
    title: string;
    achievedOn: string;
    type?: PulseMilestoneType;
    sharedToPulse?: boolean;
  }>;
}

const withPulseApiLog = async <T>(
  apiTag: string,
  requestInfo: Record<string, any> | undefined,
  executor: () => Promise<T>
): Promise<T> => {
  console.log(`[Pulse API · ${apiTag}] Request:`, requestInfo ?? {});
  try {
    const res = await executor();
    console.log(`[Pulse API · ${apiTag}] Success Response (raw):`, res);
    try {
      console.log(
        `[Pulse API · ${apiTag}] Success Response (formatted):\n`,
        JSON.stringify(res, null, 2)
      );
    } catch {
      // ignore serialization error
    }
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    console.log(`[Pulse API · ${apiTag}] Error Response:`, {
      status: err?.response?.status,
      data: err?.response?.data,
      message: Array.isArray(msg) ? msg.join(', ') : msg,
      url: err?.config?.url,
    });
    throw err;
  }
};

const pulseServices = {
  /** 2. Get Pulse home (GET /api/v1/pulse) */
  getPulseHome: (): Promise<PulseHomeResponse> =>
    withPulseApiLog('GET /pulse', undefined, async () => {
      const res = await apiClient.get<PulseHomeResponse>(API_ROUTES.PULSE_HOME);
      return res.data;
    }),

  /** 3. Set today's mood (PUT /api/v1/pulse/mood) */
  setTodayMood: (
    payload: SetTodayMoodPayload
  ): Promise<{ success: boolean; moods: PulseMoodsSummary }> =>
    withPulseApiLog('PUT /pulse/mood', { payload }, async () => {
      const res = await apiClient.put(API_ROUTES.PULSE_MOOD, payload);
      return res.data;
    }),

  /** 4. Write an appreciation (POST /api/v1/pulse/appreciations) */
  createAppreciation: (
    payload: CreateAppreciationPayload
  ): Promise<{ success: boolean; appreciation: PulseAppreciationApiItem }> =>
    withPulseApiLog('POST /pulse/appreciations', { payload }, async () => {
      const res = await apiClient.post(API_ROUTES.PULSE_APPRECIATIONS, payload);
      return res.data;
    }),

  /** 5. List appreciations (GET /api/v1/pulse/appreciations) */
  listAppreciations: (params?: {
    filter?: AppreciationFilter;
    limit?: number;
    before?: string;
  }): Promise<ListAppreciationsResponse> =>
    withPulseApiLog('GET /pulse/appreciations', { params }, async () => {
      const res = await apiClient.get<ListAppreciationsResponse>(
        API_ROUTES.PULSE_APPRECIATIONS,
        { params }
      );
      return res.data;
    }),

  /** 6. React to an appreciation (PUT /api/v1/pulse/appreciations/:id/reaction) */
  reactToAppreciation: (
    id: string,
    reaction: string
  ): Promise<{ success: boolean; reactions: PulseReactionsSummary }> =>
    withPulseApiLog(
      'PUT /pulse/appreciations/:id/reaction',
      { id, reaction },
      async () => {
        const res = await apiClient.put(
          API_ROUTES.PULSE_APPRECIATION_REACTION(id),
          { reaction }
        );
        return res.data;
      }
    ),

  /** 7. Remove my reaction from an appreciation (DELETE /api/v1/pulse/appreciations/:id/reaction) */
  removeAppreciationReaction: (
    id: string
  ): Promise<{ success: boolean; reactions: PulseReactionsSummary }> =>
    withPulseApiLog(
      'DELETE /pulse/appreciations/:id/reaction',
      { id },
      async () => {
        const res = await apiClient.delete(
          API_ROUTES.PULSE_APPRECIATION_REACTION(id)
        );
        return res.data;
      }
    ),

  /** 8. Delete an appreciation (DELETE /api/v1/pulse/appreciations/:id) */
  deleteAppreciation: (
    id: string
  ): Promise<{ success: boolean; message: string }> =>
    withPulseApiLog('DELETE /pulse/appreciations/:id', { id }, async () => {
      const res = await apiClient.delete(API_ROUTES.PULSE_APPRECIATION_BY_ID(id));
      return res.data;
    }),

  /** 9. Create a poll (POST /api/v1/pulse/polls) */
  createPoll: (
    payload: CreatePollPayload
  ): Promise<{ success: boolean; poll: PulsePollApiItem }> =>
    withPulseApiLog('POST /pulse/polls', { payload }, async () => {
      const res = await apiClient.post(API_ROUTES.PULSE_POLLS, payload);
      return res.data;
    }),

  /** 10. List polls (GET /api/v1/pulse/polls) */
  listPolls: (params?: {
    status?: PollStatusFilter;
    limit?: number;
    before?: string;
  }): Promise<ListPollsResponse> =>
    withPulseApiLog('GET /pulse/polls', { params }, async () => {
      const res = await apiClient.get<ListPollsResponse>(API_ROUTES.PULSE_POLLS, {
        params,
      });
      return res.data;
    }),

  /** 11. Get poll results (GET /api/v1/pulse/polls/:id) */
  getPollResults: (
    id: string
  ): Promise<{ success: boolean; poll: PulsePollApiItem }> =>
    withPulseApiLog('GET /pulse/polls/:id', { id }, async () => {
      const res = await apiClient.get(API_ROUTES.PULSE_POLL_BY_ID(id));
      return res.data?.poll ? res.data : { success: true, poll: res.data };
    }),

  /** 12. Vote on a poll (PUT /api/v1/pulse/polls/:id/vote) */
  voteOnPoll: (
    id: string,
    optionIds: string[]
  ): Promise<{ success: boolean; poll: PulsePollApiItem }> =>
    withPulseApiLog('PUT /pulse/polls/:id/vote', { id, optionIds }, async () => {
      const res = await apiClient.put(API_ROUTES.PULSE_POLL_VOTE(id), {
        optionIds,
      });
      return res.data?.poll ? res.data : { success: true, poll: res.data };
    }),

  /** 13. Close a poll (POST /api/v1/pulse/polls/:id/close) */
  closePoll: (
    id: string
  ): Promise<{ success: boolean; poll: PulsePollApiItem }> =>
    withPulseApiLog('POST /pulse/polls/:id/close', { id }, async () => {
      const res = await apiClient.post(API_ROUTES.PULSE_POLL_CLOSE(id), {});
      return res.data?.poll ? res.data : { success: true, poll: res.data };
    }),

  /** 14. Add winning option to the calendar (POST /api/v1/calendar/events) */
  schedulePollToCalendar: (payload: CreateEventPayload) =>
    withPulseApiLog('POST /calendar/events (poll)', { payload }, async () => {
      return calendarServices.createEvent({
        ...payload,
        sourceLabel: payload.sourceLabel || 'Family poll',
      });
    }),

  /** 15. Delete a poll (DELETE /api/v1/pulse/polls/:id) */
  deletePoll: (id: string): Promise<{ success: boolean; message: string }> =>
    withPulseApiLog('DELETE /pulse/polls/:id', { id }, async () => {
      const res = await apiClient.delete(API_ROUTES.PULSE_POLL_BY_ID(id));
      return res.data;
    }),

  /** 16. Add a milestone (POST /api/v1/pulse/milestones) */
  createMilestone: (
    payload: CreateMilestonePayload
  ): Promise<{ success: boolean; milestone: PulseMilestoneApiItem }> =>
    withPulseApiLog('POST /pulse/milestones', { payload }, async () => {
      const res = await apiClient.post(API_ROUTES.PULSE_MILESTONES, payload);
      return res.data;
    }),

  /** 17 & 22. List milestones (GET /api/v1/pulse/milestones) */
  listMilestones: (
    params?: ListMilestonesQuery
  ): Promise<ListMilestonesResponse> =>
    withPulseApiLog('GET /pulse/milestones', { params }, async () => {
      const res = await apiClient.get<ListMilestonesResponse>(
        API_ROUTES.PULSE_MILESTONES,
        { params }
      );
      return res.data;
    }),

  /** 18. Save milestone & visibility in Life Profile (PATCH /api/v1/family/members/:id/life-profile) */
  saveMilestoneInLifeProfile: (
    memberId: string,
    payload: SaveLifeProfileMilestonesPayload
  ) =>
    withPulseApiLog(
      'PATCH /family/members/:id/life-profile (milestone)',
      { memberId, payload },
      async () => {
        return lifeProfileServices.updateLifeProfile(memberId, payload);
      }
    ),

  /** 19. Read Life Profile milestones (GET /api/v1/family/members/:id/life-profile) */
  getLifeProfileMilestones: (memberId: string) =>
    withPulseApiLog(
      'GET /family/members/:id/life-profile (milestones)',
      { memberId },
      async () => {
        return lifeProfileServices.getLifeProfile(memberId, {
          section: 'vaccination',
          tab: 'milestones',
          view: 'full',
        });
      }
    ),

  /** 20. Upload a milestone photo (POST /api/v1/pulse/milestones/:id/photos) */
  uploadMilestonePhoto: (
    milestoneId: string,
    formData: FormData
  ): Promise<{ success: boolean; milestone: { id: string; photos: string[] } }> =>
    withPulseApiLog(
      'POST /pulse/milestones/:id/photos',
      { milestoneId },
      async () => {
        const res = await apiClient.post(
          API_ROUTES.PULSE_MILESTONE_PHOTOS(milestoneId),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return res.data;
      }
    ),

  /** 21. React to a milestone (PUT /api/v1/pulse/milestones/:id/reaction) */
  reactToMilestone: (
    id: string,
    reaction: string
  ): Promise<{ success: boolean; reactions: PulseReactionsSummary }> =>
    withPulseApiLog(
      'PUT /pulse/milestones/:id/reaction',
      { id, reaction },
      async () => {
        const res = await apiClient.put(
          API_ROUTES.PULSE_MILESTONE_REACTION(id),
          { reaction }
        );
        return res.data;
      }
    ),

  /** 23. Remove my reaction from a milestone (DELETE /api/v1/pulse/milestones/:id/reaction) */
  removeMilestoneReaction: (
    id: string
  ): Promise<{ success: boolean; reactions: PulseReactionsSummary }> =>
    withPulseApiLog(
      'DELETE /pulse/milestones/:id/reaction',
      { id },
      async () => {
        const res = await apiClient.delete(API_ROUTES.PULSE_MILESTONE_REACTION(id));
        return res.data;
      }
    ),

  /** 24. Delete or unshare a milestone (DELETE /api/v1/pulse/milestones/:id) */
  deleteMilestone: (
    id: string
  ): Promise<{ success: boolean; removed?: string; message: string }> =>
    withPulseApiLog('DELETE /pulse/milestones/:id', { id }, async () => {
      const res = await apiClient.delete(API_ROUTES.PULSE_MILESTONE_BY_ID(id));
      return res.data;
    }),
};

export default pulseServices;
