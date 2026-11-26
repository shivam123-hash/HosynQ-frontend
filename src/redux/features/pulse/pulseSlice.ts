import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import pulseServices, {
  AppreciationFilter,
  CreateAppreciationPayload,
  CreateMilestonePayload,
  CreatePollPayload,
  ListAppreciationsResponse,
  ListMilestonesQuery,
  ListMilestonesResponse,
  ListPollsResponse,
  PollStatusFilter,
  PulseAppreciationApiItem,
  PulseHomeResponse,
  PulseMilestoneApiItem,
  PulseMoodsSummary,
  PulsePollApiItem,
  PulseReactionsSummary,
  SaveLifeProfileMilestonesPayload,
  SetTodayMoodPayload,
} from '../../../services/pulseServices';
import { CreateEventPayload } from '../../../services/calendarServices';
import { isUUID } from '../lists/listsSlice';
import { computeUpdatedReactionSummary } from '../../../screens/mainScreens/familyPulse/pulseApiHelpers';

export interface PulseState {
  home: PulseHomeResponse | null;
  appreciations: PulseAppreciationApiItem[];
  appreciationsNextCursor: string | null;
  appreciationsFilter: AppreciationFilter;
  activePolls: PulsePollApiItem[];
  closedPolls: PulsePollApiItem[];
  activePollsNextCursor: string | null;
  closedPollsNextCursor: string | null;
  pollCounts: {
    active: number;
    closed: number;
  };
  selectedPoll: PulsePollApiItem | null;
  milestones: PulseMilestoneApiItem[];
  milestonesNextCursor: string | null;
  lifeProfileMilestones: any[];
  reactionRollbacks: Record<string, PulseReactionsSummary>;
  pollRollbacks: Record<string, PulsePollApiItem>;
  hasLoadedHome: boolean;
  hasLoadedAppreciations: boolean;
  hasLoadedActivePolls: boolean;
  hasLoadedClosedPolls: boolean;
  hasLoadedMilestones: boolean;
  loadingHome: boolean;
  loadingAppreciations: boolean;
  loadingPolls: boolean;
  loadingPollDetail: boolean;
  loadingMilestones: boolean;
  loadingLifeProfile: boolean;
  submittingMood: boolean;
  submittingAction: boolean;
  uploadingPhoto: boolean;
  error: string | null;
}

const initialState: PulseState = {
  home: null,
  appreciations: [],
  appreciationsNextCursor: null,
  appreciationsFilter: 'ALL',
  activePolls: [],
  closedPolls: [],
  activePollsNextCursor: null,
  closedPollsNextCursor: null,
  pollCounts: { active: 0, closed: 0 },
  selectedPoll: null,
  milestones: [],
  milestonesNextCursor: null,
  lifeProfileMilestones: [],
  reactionRollbacks: {},
  pollRollbacks: {},
  hasLoadedHome: false,
  hasLoadedAppreciations: false,
  hasLoadedActivePolls: false,
  hasLoadedClosedPolls: false,
  hasLoadedMilestones: false,
  loadingHome: false,
  loadingAppreciations: false,
  loadingPolls: false,
  loadingPollDetail: false,
  loadingMilestones: false,
  loadingLifeProfile: false,
  submittingMood: false,
  submittingAction: false,
  uploadingPhoto: false,
  error: null,
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message || err?.message || fallback;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
};

/** 2. Get Pulse home */
export const fetchPulseHomeThunk = createAsyncThunk<
  PulseHomeResponse,
  void,
  { rejectValue: string }
>('pulse/fetchHome', async (_, { rejectWithValue }) => {
  try {
    return await pulseServices.getPulseHome();
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load Family Pulse.'));
  }
});

/** 3. Set today's mood */
export const setTodayMoodThunk = createAsyncThunk<
  PulseMoodsSummary,
  SetTodayMoodPayload,
  { rejectValue: string }
>('pulse/setTodayMood', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await pulseServices.setTodayMood(payload);
    dispatch(fetchPulseHomeThunk());
    return res.moods;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update today’s mood.'));
  }
});

/** 4. Write an appreciation */
export const createAppreciationThunk = createAsyncThunk<
  PulseAppreciationApiItem,
  CreateAppreciationPayload,
  { rejectValue: string }
>('pulse/createAppreciation', async (payload, { dispatch, rejectWithValue }) => {
  if (!isUUID(payload.toMemberId)) {
    return rejectWithValue('Invalid family member ID.');
  }
  try {
    const res = await pulseServices.createAppreciation(payload);
    dispatch(fetchPulseHomeThunk());
    return res.appreciation;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to post appreciation.'));
  }
});

/** 5. List appreciations */
export const fetchAppreciationsThunk = createAsyncThunk<
  { data: ListAppreciationsResponse; filter: AppreciationFilter; append: boolean },
  { filter?: AppreciationFilter; limit?: number; before?: string } | undefined,
  { rejectValue: string }
>('pulse/fetchAppreciations', async (params, { rejectWithValue }) => {
  const filter = params?.filter || 'ALL';
  try {
    const data = await pulseServices.listAppreciations({
      filter,
      limit: params?.limit || 30,
      before: params?.before,
    });
    return { data, filter, append: Boolean(params?.before) };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load appreciations.'));
  }
});

/** 6. React to an appreciation */
export const reactToAppreciationThunk = createAsyncThunk<
  { id: string; reactions: PulseReactionsSummary },
  { id: string; reaction: string },
  { rejectValue: string }
>('pulse/reactAppreciation', async ({ id, reaction }, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid appreciation ID.');
  }
  try {
    const res = await pulseServices.reactToAppreciation(id, reaction);
    return { id, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update reaction.'));
  }
});

/** 7. Remove my reaction from an appreciation */
export const removeAppreciationReactionThunk = createAsyncThunk<
  { id: string; reactions: PulseReactionsSummary },
  string,
  { rejectValue: string }
>('pulse/removeAppreciationReaction', async (id, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid appreciation ID.');
  }
  try {
    const res = await pulseServices.removeAppreciationReaction(id);
    return { id, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove reaction.'));
  }
});

/** 8. Delete an appreciation */
export const deleteAppreciationThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('pulse/deleteAppreciation', async (id, { dispatch, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid appreciation ID.');
  }
  try {
    await pulseServices.deleteAppreciation(id);
    dispatch(fetchPulseHomeThunk());
    return id;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to delete appreciation.'));
  }
});

/** 9. Create a poll */
export const createPollThunk = createAsyncThunk<
  PulsePollApiItem,
  CreatePollPayload,
  { rejectValue: string }
>('pulse/createPoll', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await pulseServices.createPoll(payload);
    dispatch(fetchPulseHomeThunk());
    return res.poll;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to create poll.'));
  }
});

/** 10. List polls */
export const fetchPollsThunk = createAsyncThunk<
  { status: PollStatusFilter; data: ListPollsResponse; append: boolean },
  { status?: PollStatusFilter; limit?: number; before?: string } | undefined,
  { rejectValue: string }
>('pulse/fetchPolls', async (params, { rejectWithValue }) => {
  const status = params?.status || 'ACTIVE';
  try {
    const data = await pulseServices.listPolls({
      status,
      limit: params?.limit || 30,
      before: params?.before,
    });
    return { status, data, append: Boolean(params?.before) };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load family polls.'));
  }
});

/** 11. Get poll results */
export const fetchPollResultsThunk = createAsyncThunk<
  PulsePollApiItem,
  string,
  { rejectValue: string }
>('pulse/fetchPollResults', async (pollId, { rejectWithValue }) => {
  if (!isUUID(pollId)) {
    return rejectWithValue('Invalid poll ID.');
  }
  try {
    const res = await pulseServices.getPollResults(pollId);
    return res.poll;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load poll results.'));
  }
});

/** 12. Vote on a poll */
export const voteOnPollThunk = createAsyncThunk<
  PulsePollApiItem,
  { pollId: string; optionIds: string[] },
  { rejectValue: string }
>('pulse/votePoll', async ({ pollId, optionIds }, { dispatch, rejectWithValue }) => {
  if (!isUUID(pollId)) {
    return rejectWithValue('Invalid poll ID.');
  }
  try {
    const res = await pulseServices.voteOnPoll(pollId, optionIds);
    dispatch(fetchPulseHomeThunk());
    return res.poll;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to record vote.'));
  }
});

/** 13. Close a poll */
export const closePollThunk = createAsyncThunk<
  PulsePollApiItem,
  string,
  { rejectValue: string }
>('pulse/closePoll', async (pollId, { dispatch, rejectWithValue }) => {
  if (!isUUID(pollId)) {
    return rejectWithValue('Invalid poll ID.');
  }
  try {
    const res = await pulseServices.closePoll(pollId);
    dispatch(fetchPulseHomeThunk());
    return res.poll;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to close poll.'));
  }
});

/** 14. Schedule winning poll option onto Calendar */
export const schedulePollEventThunk = createAsyncThunk<
  any,
  CreateEventPayload,
  { rejectValue: string }
>('pulse/schedulePollEvent', async (payload, { rejectWithValue }) => {
  try {
    return await pulseServices.schedulePollToCalendar(payload);
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to add event to calendar.'));
  }
});

/** 15. Delete a poll */
export const deletePollThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('pulse/deletePoll', async (pollId, { dispatch, rejectWithValue }) => {
  if (!isUUID(pollId)) {
    return rejectWithValue('Invalid poll ID.');
  }
  try {
    await pulseServices.deletePoll(pollId);
    dispatch(fetchPulseHomeThunk());
    return pollId;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to delete poll.'));
  }
});

/** 16. Add a milestone */
export const createMilestoneThunk = createAsyncThunk<
  PulseMilestoneApiItem,
  CreateMilestonePayload,
  { rejectValue: string }
>('pulse/createMilestone', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await pulseServices.createMilestone(payload);
    dispatch(fetchPulseHomeThunk());
    return res.milestone;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to save milestone.'));
  }
});

/** 17 & 22. List milestones */
export const fetchMilestonesThunk = createAsyncThunk<
  { data: ListMilestonesResponse; append: boolean },
  ListMilestonesQuery | undefined,
  { rejectValue: string }
>('pulse/fetchMilestones', async (params, { rejectWithValue }) => {
  try {
    const data = await pulseServices.listMilestones({
      limit: params?.limit ?? 50,
      ...(params?.memberId ? { memberId: params.memberId } : {}),
      ...(params?.family !== undefined ? { family: params.family } : {}),
      ...(params?.before ? { before: params.before } : {}),
    });
    return { data, append: Boolean(params?.before) };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load milestones.'));
  }
});

/** 18. Save milestone & visibility in Life Profile */
export const saveMilestoneInLifeProfileThunk = createAsyncThunk<
  any,
  { memberId: string; payload: SaveLifeProfileMilestonesPayload },
  { rejectValue: string }
>('pulse/saveLifeProfileMilestone', async ({ memberId, payload }, { rejectWithValue }) => {
  if (!isUUID(memberId)) {
    return rejectWithValue('Invalid member ID.');
  }
  try {
    return await pulseServices.saveMilestoneInLifeProfile(memberId, payload);
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update Life Profile milestone.'));
  }
});

/** 19. Read Life Profile milestones */
export const fetchLifeProfileMilestonesThunk = createAsyncThunk<
  any[],
  string,
  { rejectValue: string }
>('pulse/fetchLifeProfileMilestones', async (memberId, { rejectWithValue }) => {
  if (!isUUID(memberId)) {
    return rejectWithValue('Invalid member ID.');
  }
  try {
    const res = await pulseServices.getLifeProfileMilestones(memberId);
    const raw =
      res?.data?.vaccination?.milestones ||
      res?.data?.milestones ||
      (res as any)?.vaccination?.milestones ||
      (res as any)?.milestones ||
      [];
    return Array.isArray(raw) ? raw : [];
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load Life Profile milestones.'));
  }
});

/** 20. Upload a milestone photo */
export const uploadMilestonePhotoThunk = createAsyncThunk<
  { id: string; photos: string[] },
  { milestoneId: string; formData: FormData },
  { rejectValue: string }
>('pulse/uploadMilestonePhoto', async ({ milestoneId, formData }, { rejectWithValue }) => {
  if (!isUUID(milestoneId)) {
    return rejectWithValue('Invalid milestone ID.');
  }
  try {
    const res = await pulseServices.uploadMilestonePhoto(milestoneId, formData);
    return res.milestone;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to upload milestone photo.'));
  }
});

/** 21. React to a milestone */
export const reactToMilestoneThunk = createAsyncThunk<
  { id: string; reactions: PulseReactionsSummary },
  { id: string; reaction: string },
  { rejectValue: string }
>('pulse/reactMilestone', async ({ id, reaction }, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid milestone ID.');
  }
  try {
    const res = await pulseServices.reactToMilestone(id, reaction);
    return { id, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to react to milestone.'));
  }
});

/** 23. Remove my reaction from a milestone */
export const removeMilestoneReactionThunk = createAsyncThunk<
  { id: string; reactions: PulseReactionsSummary },
  string,
  { rejectValue: string }
>('pulse/removeMilestoneReaction', async (id, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid milestone ID.');
  }
  try {
    const res = await pulseServices.removeMilestoneReaction(id);
    return { id, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove milestone reaction.'));
  }
});

/** 24. Delete or unshare a milestone */
export const deleteMilestoneThunk = createAsyncThunk<
  { id: string; removed?: string },
  string,
  { rejectValue: string }
>('pulse/deleteMilestone', async (id, { dispatch, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid milestone ID.');
  }
  try {
    const res = await pulseServices.deleteMilestone(id);
    dispatch(fetchPulseHomeThunk());
    return { id, removed: res.removed };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove milestone.'));
  }
});

const mergePollIntoLists = (
  state: PulseState,
  updatedPoll: PulsePollApiItem | null | undefined
) => {
  if (!updatedPoll) return;
  if (state.selectedPoll?.id === updatedPoll.id) {
    state.selectedPoll = updatedPoll;
  }
  if (state.home?.openPoll?.id === updatedPoll.id) {
    state.home.openPoll = updatedPoll.status === 'CLOSED' ? null : updatedPoll;
  }
  const isClosed = String(updatedPoll.status).toUpperCase() === 'CLOSED';
  if (isClosed) {
    state.activePolls = state.activePolls.filter((p) => p.id !== updatedPoll.id);
    const existsClosed = state.closedPolls.some((p) => p.id === updatedPoll.id);
    state.closedPolls = existsClosed
      ? state.closedPolls.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
      : [updatedPoll, ...state.closedPolls];
  } else {
    state.activePolls = state.activePolls.some((p) => p.id === updatedPoll.id)
      ? state.activePolls.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
      : [updatedPoll, ...state.activePolls];
  }
};

const pulseSlice = createSlice({
  name: 'pulse',
  initialState,
  reducers: {
    clearPulseError: (state) => {
      state.error = null;
    },
    setSelectedPollLocal: (
      state,
      action: PayloadAction<PulsePollApiItem | null>
    ) => {
      state.selectedPoll = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 2. Pulse Home
      .addCase(fetchPulseHomeThunk.pending, (state) => {
        state.loadingHome = true;
        state.error = null;
      })
      .addCase(fetchPulseHomeThunk.fulfilled, (state, action) => {
        state.loadingHome = false;
        state.hasLoadedHome = true;
        state.home = action.payload;
      })
      .addCase(fetchPulseHomeThunk.rejected, (state, action) => {
        state.loadingHome = false;
        state.hasLoadedHome = true;
        state.error = action.payload || 'Failed to load Family Pulse.';
      })

      // 3. Mood
      .addCase(setTodayMoodThunk.pending, (state) => {
        state.submittingMood = true;
        state.error = null;
      })
      .addCase(setTodayMoodThunk.fulfilled, (state, action) => {
        state.submittingMood = false;
        if (state.home) {
          state.home.moods = action.payload;
          state.home.isEmpty = false;
        }
      })
      .addCase(setTodayMoodThunk.rejected, (state, action) => {
        state.submittingMood = false;
        state.error = action.payload || 'Failed to update mood.';
      })

      // 4. Create appreciation
      .addCase(createAppreciationThunk.pending, (state) => {
        state.submittingAction = true;
        state.error = null;
      })
      .addCase(createAppreciationThunk.fulfilled, (state, action) => {
        state.submittingAction = false;
        if (action.payload) {
          state.appreciations = [action.payload, ...state.appreciations];
          if (state.home) {
            state.home.latestAppreciation = action.payload;
            state.home.isEmpty = false;
          }
        }
      })
      .addCase(createAppreciationThunk.rejected, (state, action) => {
        state.submittingAction = false;
        state.error = action.payload || 'Failed to post appreciation.';
      })

      // 5. List appreciations
      .addCase(fetchAppreciationsThunk.pending, (state) => {
        state.loadingAppreciations = true;
        state.error = null;
      })
      .addCase(fetchAppreciationsThunk.fulfilled, (state, action) => {
        state.loadingAppreciations = false;
        state.hasLoadedAppreciations = true;
        state.appreciationsFilter = action.payload.filter;
        const incoming = action.payload.data.appreciations || [];
        state.appreciations = action.payload.append
          ? [...state.appreciations, ...incoming]
          : incoming;
        state.appreciationsNextCursor = action.payload.data.nextCursor || null;
      })
      .addCase(fetchAppreciationsThunk.rejected, (state, action) => {
        state.loadingAppreciations = false;
        state.hasLoadedAppreciations = true;
        state.error = action.payload || 'Failed to load appreciations.';
      })

      // 6 & 7. Appreciation reactions (optimistic with rollback on error)
      .addCase(reactToAppreciationThunk.pending, (state, action) => {
        const { id, reaction } = action.meta.arg;
        const target =
          state.appreciations.find((a) => a.id === id) ||
          (state.home?.latestAppreciation?.id === id
            ? state.home.latestAppreciation
            : null);
        if (target) {
          state.reactionRollbacks[id] = target.reactions;
          const optimistic = computeUpdatedReactionSummary(
            target.reactions,
            reaction
          );
          state.appreciations = state.appreciations.map((a) =>
            a.id === id ? { ...a, reactions: optimistic } : a
          );
          if (state.home?.latestAppreciation?.id === id) {
            state.home.latestAppreciation = {
              ...state.home.latestAppreciation,
              reactions: optimistic,
            };
          }
        }
      })
      .addCase(reactToAppreciationThunk.fulfilled, (state, action) => {
        delete state.reactionRollbacks[action.payload.id];
        state.appreciations = state.appreciations.map((a) =>
          a.id === action.payload.id ? { ...a, reactions: action.payload.reactions } : a
        );
        if (state.home?.latestAppreciation?.id === action.payload.id) {
          state.home.latestAppreciation = {
            ...state.home.latestAppreciation,
            reactions: action.payload.reactions,
          };
        }
      })
      .addCase(reactToAppreciationThunk.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const prev = state.reactionRollbacks[id];
        if (prev) {
          state.appreciations = state.appreciations.map((a) =>
            a.id === id ? { ...a, reactions: prev } : a
          );
          if (state.home?.latestAppreciation?.id === id) {
            state.home.latestAppreciation = {
              ...state.home.latestAppreciation,
              reactions: prev,
            };
          }
          delete state.reactionRollbacks[id];
        }
        state.error = action.payload || 'Failed to update reaction.';
      })
      .addCase(removeAppreciationReactionThunk.pending, (state, action) => {
        const id = action.meta.arg;
        const target =
          state.appreciations.find((a) => a.id === id) ||
          (state.home?.latestAppreciation?.id === id
            ? state.home.latestAppreciation
            : null);
        if (target) {
          state.reactionRollbacks[id] = target.reactions;
          const optimistic = computeUpdatedReactionSummary(target.reactions, null);
          state.appreciations = state.appreciations.map((a) =>
            a.id === id ? { ...a, reactions: optimistic } : a
          );
          if (state.home?.latestAppreciation?.id === id) {
            state.home.latestAppreciation = {
              ...state.home.latestAppreciation,
              reactions: optimistic,
            };
          }
        }
      })
      .addCase(removeAppreciationReactionThunk.fulfilled, (state, action) => {
        delete state.reactionRollbacks[action.payload.id];
        state.appreciations = state.appreciations.map((a) =>
          a.id === action.payload.id ? { ...a, reactions: action.payload.reactions } : a
        );
        if (state.home?.latestAppreciation?.id === action.payload.id) {
          state.home.latestAppreciation = {
            ...state.home.latestAppreciation,
            reactions: action.payload.reactions,
          };
        }
      })
      .addCase(removeAppreciationReactionThunk.rejected, (state, action) => {
        const id = action.meta.arg;
        const prev = state.reactionRollbacks[id];
        if (prev) {
          state.appreciations = state.appreciations.map((a) =>
            a.id === id ? { ...a, reactions: prev } : a
          );
          if (state.home?.latestAppreciation?.id === id) {
            state.home.latestAppreciation = {
              ...state.home.latestAppreciation,
              reactions: prev,
            };
          }
          delete state.reactionRollbacks[id];
        }
        state.error = action.payload || 'Failed to remove reaction.';
      })

      // 8. Delete appreciation
      .addCase(deleteAppreciationThunk.fulfilled, (state, action) => {
        state.appreciations = state.appreciations.filter((a) => a.id !== action.payload);
        if (state.home?.latestAppreciation?.id === action.payload) {
          state.home.latestAppreciation = null;
        }
      })

      // 9. Create poll
      .addCase(createPollThunk.pending, (state) => {
        state.submittingAction = true;
        state.error = null;
      })
      .addCase(createPollThunk.fulfilled, (state, action) => {
        state.submittingAction = false;
        if (action.payload) {
          state.activePolls = [action.payload, ...state.activePolls];
          state.pollCounts.active += 1;
          if (state.home) {
            state.home.openPoll = action.payload;
            state.home.isEmpty = false;
          }
        }
      })
      .addCase(createPollThunk.rejected, (state, action) => {
        state.submittingAction = false;
        state.error = action.payload || 'Failed to create poll.';
      })

      // 10. List polls
      .addCase(fetchPollsThunk.pending, (state) => {
        state.loadingPolls = true;
        state.error = null;
      })
      .addCase(fetchPollsThunk.fulfilled, (state, action) => {
        state.loadingPolls = false;
        const incoming = action.payload.data.polls || [];
        if (action.payload.data.counts) {
          state.pollCounts = action.payload.data.counts;
        }
        if (action.payload.status === 'CLOSED') {
          state.hasLoadedClosedPolls = true;
          state.closedPolls = action.payload.append
            ? [...state.closedPolls, ...incoming]
            : incoming;
          state.closedPollsNextCursor = action.payload.data.nextCursor || null;
        } else {
          state.hasLoadedActivePolls = true;
          state.activePolls = action.payload.append
            ? [...state.activePolls, ...incoming]
            : incoming;
          state.activePollsNextCursor = action.payload.data.nextCursor || null;
        }
      })
      .addCase(fetchPollsThunk.rejected, (state, action) => {
        state.loadingPolls = false;
        if (action.meta.arg?.status === 'CLOSED') {
          state.hasLoadedClosedPolls = true;
        } else {
          state.hasLoadedActivePolls = true;
        }
        state.error = action.payload || 'Failed to load polls.';
      })

      // 11. Poll detail
      .addCase(fetchPollResultsThunk.pending, (state) => {
        state.loadingPollDetail = true;
        state.error = null;
      })
      .addCase(fetchPollResultsThunk.fulfilled, (state, action) => {
        state.loadingPollDetail = false;
        state.selectedPoll = action.payload;
        mergePollIntoLists(state, action.payload);
      })
      .addCase(fetchPollResultsThunk.rejected, (state, action) => {
        state.loadingPollDetail = false;
        state.error = action.payload || 'Failed to load poll results.';
      })

      // 12 & 13. Vote / Close poll (optimistic vote with rollback on error)
      .addCase(voteOnPollThunk.pending, (state, action) => {
        const { pollId, optionIds } = action.meta.arg;
        const target =
          (state.selectedPoll?.id === pollId ? state.selectedPoll : null) ||
          state.activePolls.find((p) => p.id === pollId) ||
          (state.home?.openPoll?.id === pollId ? state.home.openPoll : null);
        if (target) {
          state.pollRollbacks[pollId] = target;
          const prevMySet = new Set(target.myOptionIds || []);
          const nextMySet = new Set(optionIds);
          const hadVoted = prevMySet.size > 0;
          const nextVoterCount = hadVoted
            ? target.voterCount
            : (target.voterCount || 0) + 1;

          const updatedOptions = (target.options || []).map((opt) => {
            const wasPicked = prevMySet.has(opt.id);
            const isPicked = nextMySet.has(opt.id);
            let nextVotes = opt.votes || 0;
            if (wasPicked && !isPicked) nextVotes = Math.max(0, nextVotes - 1);
            if (!wasPicked && isPicked) nextVotes += 1;
            return { ...opt, votes: nextVotes };
          });
          const sumVotes = updatedOptions.reduce((s, o) => s + (o.votes || 0), 0);
          const finalOptions = updatedOptions.map((opt) => ({
            ...opt,
            percent:
              sumVotes > 0 ? Math.round(((opt.votes || 0) / sumVotes) * 100) : 0,
          }));
          const optimisticPoll: PulsePollApiItem = {
            ...target,
            voterCount: nextVoterCount,
            myOptionIds: optionIds,
            options: finalOptions,
          };
          mergePollIntoLists(state, optimisticPoll);
        }
      })
      .addCase(voteOnPollThunk.fulfilled, (state, action) => {
        if (action.payload?.id) {
          delete state.pollRollbacks[action.payload.id];
        }
        mergePollIntoLists(state, action.payload);
      })
      .addCase(voteOnPollThunk.rejected, (state, action) => {
        const { pollId } = action.meta.arg;
        const prev = state.pollRollbacks[pollId];
        if (prev) {
          mergePollIntoLists(state, prev);
          delete state.pollRollbacks[pollId];
        }
        state.error = action.payload || 'Failed to submit vote.';
      })
      .addCase(closePollThunk.fulfilled, (state, action) => {
        const wasActive = state.activePolls.some((p) => p.id === action.payload?.id);
        mergePollIntoLists(state, action.payload);
        if (wasActive && state.pollCounts.active > 0) {
          state.pollCounts.active -= 1;
          state.pollCounts.closed += 1;
        }
      })

      // 15. Delete poll
      .addCase(deletePollThunk.fulfilled, (state, action) => {
        const wasActive = state.activePolls.some((p) => p.id === action.payload);
        const wasClosed = state.closedPolls.some((p) => p.id === action.payload);
        state.activePolls = state.activePolls.filter((p) => p.id !== action.payload);
        state.closedPolls = state.closedPolls.filter((p) => p.id !== action.payload);
        if (wasActive && state.pollCounts.active > 0) state.pollCounts.active -= 1;
        if (wasClosed && state.pollCounts.closed > 0) state.pollCounts.closed -= 1;
        if (state.selectedPoll?.id === action.payload) state.selectedPoll = null;
        if (state.home?.openPoll?.id === action.payload) state.home.openPoll = null;
      })

      // 16. Create milestone
      .addCase(createMilestoneThunk.pending, (state) => {
        state.submittingAction = true;
        state.error = null;
      })
      .addCase(createMilestoneThunk.fulfilled, (state, action) => {
        state.submittingAction = false;
        if (action.payload) {
          state.milestones = [action.payload, ...state.milestones];
          if (state.home && action.payload.sharedToPulse !== false) {
            state.home.latestMilestone = action.payload;
            state.home.isEmpty = false;
          }
        }
      })
      .addCase(createMilestoneThunk.rejected, (state, action) => {
        state.submittingAction = false;
        state.error = action.payload || 'Failed to save milestone.';
      })

      // 17 & 22. List milestones
      .addCase(fetchMilestonesThunk.pending, (state) => {
        state.loadingMilestones = true;
        state.error = null;
      })
      .addCase(fetchMilestonesThunk.fulfilled, (state, action) => {
        state.loadingMilestones = false;
        state.hasLoadedMilestones = true;
        const incoming = action.payload.data.milestones || [];
        state.milestones = action.payload.append
          ? [...state.milestones, ...incoming]
          : incoming;
        state.milestonesNextCursor = action.payload.data.nextCursor || null;
      })
      .addCase(fetchMilestonesThunk.rejected, (state, action) => {
        state.loadingMilestones = false;
        state.hasLoadedMilestones = true;
        state.error = action.payload || 'Failed to load milestones.';
      })

      // 19. Life profile milestones
      .addCase(fetchLifeProfileMilestonesThunk.pending, (state) => {
        state.loadingLifeProfile = true;
      })
      .addCase(fetchLifeProfileMilestonesThunk.fulfilled, (state, action) => {
        state.loadingLifeProfile = false;
        state.lifeProfileMilestones = action.payload;
      })
      .addCase(fetchLifeProfileMilestonesThunk.rejected, (state) => {
        state.loadingLifeProfile = false;
      })

      // 20. Upload milestone photo
      .addCase(uploadMilestonePhotoThunk.pending, (state) => {
        state.uploadingPhoto = true;
        state.error = null;
      })
      .addCase(uploadMilestonePhotoThunk.fulfilled, (state, action) => {
        state.uploadingPhoto = false;
        state.milestones = state.milestones.map((m) =>
          m.id === action.payload.id ? { ...m, photos: action.payload.photos } : m
        );
        if (state.home?.latestMilestone?.id === action.payload.id) {
          state.home.latestMilestone = {
            ...state.home.latestMilestone,
            photos: action.payload.photos,
          };
        }
      })
      .addCase(uploadMilestonePhotoThunk.rejected, (state, action) => {
        state.uploadingPhoto = false;
        state.error = action.payload || 'Failed to upload milestone photo.';
      })

      // 21 & 23. Milestone reactions (optimistic with rollback)
      .addCase(reactToMilestoneThunk.pending, (state, action) => {
        const { id, reaction } = action.meta.arg;
        const target =
          state.milestones.find((m) => m.id === id) ||
          (state.home?.latestMilestone?.id === id
            ? state.home.latestMilestone
            : null);
        if (target) {
          state.reactionRollbacks[id] = target.reactions;
          const optimistic = computeUpdatedReactionSummary(
            target.reactions,
            reaction
          );
          state.milestones = state.milestones.map((m) =>
            m.id === id ? { ...m, reactions: optimistic } : m
          );
          if (state.home?.latestMilestone?.id === id) {
            state.home.latestMilestone = {
              ...state.home.latestMilestone,
              reactions: optimistic,
            };
          }
        }
      })
      .addCase(reactToMilestoneThunk.fulfilled, (state, action) => {
        delete state.reactionRollbacks[action.payload.id];
        state.milestones = state.milestones.map((m) =>
          m.id === action.payload.id ? { ...m, reactions: action.payload.reactions } : m
        );
        if (state.home?.latestMilestone?.id === action.payload.id) {
          state.home.latestMilestone = {
            ...state.home.latestMilestone,
            reactions: action.payload.reactions,
          };
        }
      })
      .addCase(reactToMilestoneThunk.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const prev = state.reactionRollbacks[id];
        if (prev) {
          state.milestones = state.milestones.map((m) =>
            m.id === id ? { ...m, reactions: prev } : m
          );
          if (state.home?.latestMilestone?.id === id) {
            state.home.latestMilestone = {
              ...state.home.latestMilestone,
              reactions: prev,
            };
          }
          delete state.reactionRollbacks[id];
        }
        state.error = action.payload || 'Failed to react to milestone.';
      })
      .addCase(removeMilestoneReactionThunk.pending, (state, action) => {
        const id = action.meta.arg;
        const target =
          state.milestones.find((m) => m.id === id) ||
          (state.home?.latestMilestone?.id === id
            ? state.home.latestMilestone
            : null);
        if (target) {
          state.reactionRollbacks[id] = target.reactions;
          const optimistic = computeUpdatedReactionSummary(target.reactions, null);
          state.milestones = state.milestones.map((m) =>
            m.id === id ? { ...m, reactions: optimistic } : m
          );
          if (state.home?.latestMilestone?.id === id) {
            state.home.latestMilestone = {
              ...state.home.latestMilestone,
              reactions: optimistic,
            };
          }
        }
      })
      .addCase(removeMilestoneReactionThunk.fulfilled, (state, action) => {
        delete state.reactionRollbacks[action.payload.id];
        state.milestones = state.milestones.map((m) =>
          m.id === action.payload.id ? { ...m, reactions: action.payload.reactions } : m
        );
        if (state.home?.latestMilestone?.id === action.payload.id) {
          state.home.latestMilestone = {
            ...state.home.latestMilestone,
            reactions: action.payload.reactions,
          };
        }
      })
      .addCase(removeMilestoneReactionThunk.rejected, (state, action) => {
        const id = action.meta.arg;
        const prev = state.reactionRollbacks[id];
        if (prev) {
          state.milestones = state.milestones.map((m) =>
            m.id === id ? { ...m, reactions: prev } : m
          );
          if (state.home?.latestMilestone?.id === id) {
            state.home.latestMilestone = {
              ...state.home.latestMilestone,
              reactions: prev,
            };
          }
          delete state.reactionRollbacks[id];
        }
        state.error = action.payload || 'Failed to remove milestone reaction.';
      })

      // 24. Delete milestone
      .addCase(deleteMilestoneThunk.fulfilled, (state, action) => {
        state.milestones = state.milestones.filter((m) => m.id !== action.payload.id);
        if (state.home?.latestMilestone?.id === action.payload.id) {
          state.home.latestMilestone = null;
        }
      });
  },
});

export const { clearPulseError, setSelectedPollLocal } = pulseSlice.actions;
export default pulseSlice.reducer;
