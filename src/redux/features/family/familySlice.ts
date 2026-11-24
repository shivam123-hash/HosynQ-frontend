import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import familyServices, {
  AcceptInviteResponse,
  ApproveJoinRequestResponse,
  CreateChildMemberPayload,
  CreateChildMemberResponse,
  AddChildMemberPayload,
  AddChildMemberResponse,
  CreateFamilyPayload,
  CreateFamilyResponse,
  CreateInvitationResponse,
  DeleteFamilyResponse,
  FamilyData,
  FamilyInvitationData,
  FamilyMemberData,
  GetJoinRequestsResponse,
  GetMyInvitesResponse,
  GetSentInvitesResponse,
  InviteAdultPayload,
  InviteAdultResponse,
  JoinFamilyPayload,
  JoinFamilyResponse,
  JoinRequestItemData,
  LeaveFamilyResponse,
  MyFamilyResponse,
  MyInviteData,
  PendingJoinRequestData,
  PreviewInvitationData,
  PreviewInvitationPayload,
  PreviewInvitationResponse,
  RemoveMemberResponse,
  SentInviteData,
  TransferOwnershipResponse,
  UpdateChildAvatarPayload,
  UpdateChildAvatarResponse,
  UpdateMemberRoleResponse,
} from '../../../services/familyServices';
import { saveMyMemberId } from '../../../units/AsyncStorageManager';

export interface FamilyState {
  family: FamilyData | null;
  familyCode: string | null;
  myMemberId: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  invitation: FamilyInvitationData | null;
  inviteLoading: boolean;
  inviteError: string | null;
  joinRequest: JoinFamilyResponse | null;
  joinLoading: boolean;
  joinError: string | null;
  previewData: PreviewInvitationData | null;
  previewLoading: boolean;
  previewError: string | null;
  myFamilyData: MyFamilyResponse | null;
  myFamilyLoading: boolean;
  myFamilyError: string | null;

  // 22 APIs Extensions:
  pendingRequests: JoinRequestItemData[];
  requestsLoading: boolean;
  requestsError: string | null;

  sentInvites: SentInviteData[];
  sentInvitesLoading: boolean;
  sentInvitesError: string | null;

  myInvites: MyInviteData[];
  myInvitesLoading: boolean;
  myInvitesError: string | null;

  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
  addMemberLoading: boolean;
  addMemberError: string | null;
}

const initialState: FamilyState = {
  family: null,
  familyCode: null,
  myMemberId: null,
  loading: false,
  error: null,
  success: false,
  invitation: null,
  inviteLoading: false,
  inviteError: null,
  joinRequest: null,
  joinLoading: false,
  joinError: null,
  previewData: null,
  previewLoading: false,
  previewError: null,
  myFamilyData: null,
  myFamilyLoading: false,
  myFamilyError: null,

  pendingRequests: [],
  requestsLoading: false,
  requestsError: null,

  sentInvites: [],
  sentInvitesLoading: false,
  sentInvitesError: null,

  myInvites: [],
  myInvitesLoading: false,
  myInvitesError: null,

  actionLoading: false,
  actionError: null,
  actionSuccess: null,
  addMemberLoading: false,
  addMemberError: null,
};

// 1. Create Family Thunk (POST /api/v1/family/create)
export const createFamilyThunk = createAsyncThunk<
  CreateFamilyResponse,
  CreateFamilyPayload,
  { rejectValue: string }
>('family/createFamily', async (payload, { rejectWithValue }) => {
  try {
    console.log('[createFamily API] Payload:', payload);
    const response = await familyServices.createFamily(payload);
    console.log('[createFamily API] Success Response:', response);
    const myMemberId =
      (response as any)?.family?.myMemberId ||
      (response as any)?.myMemberId;
    if (myMemberId) {
      await saveMyMemberId(myMemberId);
    }
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create family.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const createFamily = createFamilyThunk;

// 2. Request Join Family Thunk (POST /api/v1/family/join-request)
export const requestJoinFamilyThunk = createAsyncThunk<
  JoinFamilyResponse,
  JoinFamilyPayload,
  { rejectValue: string }
>('family/requestJoinFamily', async (payload, { rejectWithValue }) => {
  try {
    console.log('[requestJoinFamily API] Payload:', payload);
    const response = await familyServices.requestJoinFamily(payload);
    console.log('[requestJoinFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send join request.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const requestJoinFamily = requestJoinFamilyThunk;

// 3. List Join Requests (Owner/Admin) (GET /api/v1/family/requests)
export const fetchJoinRequestsThunk = createAsyncThunk<
  GetJoinRequestsResponse,
  void,
  { rejectValue: string }
>('family/fetchJoinRequests', async (_, { rejectWithValue }) => {
  try {
    console.log('[fetchJoinRequests API] Fetching pending join requests...');
    const response = await familyServices.getPendingRequests();
    console.log('[fetchJoinRequests API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch join requests.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchJoinRequests = fetchJoinRequestsThunk;

// 4. Approve Join Request (PATCH /api/v1/family/requests/:id/approve)
export const approveJoinRequestThunk = createAsyncThunk<
  { requestId: string; data: ApproveJoinRequestResponse },
  { requestId: string; role?: string },
  { rejectValue: string }
>('family/approveJoinRequest', async ({ requestId, role }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[approveJoinRequest API] Approving request:', requestId, 'as role:', role);
    const response = await familyServices.approveJoinRequest(requestId, role);
    console.log('[approveJoinRequest API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return { requestId, data: response };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to approve join request.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const approveJoinRequest = approveJoinRequestThunk;

// 5. Decline Join Request (PATCH /api/v1/family/requests/:id/reject)
export const rejectJoinRequestThunk = createAsyncThunk<
  { requestId: string; message: string },
  string,
  { rejectValue: string }
>('family/rejectJoinRequest', async (requestId, { rejectWithValue }) => {
  try {
    console.log('[rejectJoinRequest API] Declining request:', requestId);
    const response = await familyServices.rejectJoinRequest(requestId);
    console.log('[rejectJoinRequest API] Success Response:', response);
    return { requestId, message: response.message };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to decline join request.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const rejectJoinRequest = rejectJoinRequestThunk;

// 6. Invite an Adult (POST /api/v1/family/member-invites)
export const inviteAdultMemberThunk = createAsyncThunk<
  InviteAdultResponse,
  InviteAdultPayload,
  { rejectValue: string }
>('family/inviteAdultMember', async (payload, { rejectWithValue, dispatch }) => {
  try {
    console.log('[inviteAdultMember API] Inviting adult:', payload);
    const response = await familyServices.inviteMember(payload);
    console.log('[inviteAdultMember API] Success Response:', response);
    dispatch(fetchSentInvitesThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send invitation.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const inviteAdultMember = inviteAdultMemberThunk;

// 7. List Sent Member Invites (GET /api/v1/family/member-invites)
export const fetchSentInvitesThunk = createAsyncThunk<
  GetSentInvitesResponse,
  void,
  { rejectValue: string }
>('family/fetchSentInvites', async (_, { rejectWithValue }) => {
  try {
    console.log('[fetchSentInvites API] Fetching waiting member invites...');
    const response = await familyServices.listMemberInvites();
    console.log('[fetchSentInvites API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch invitations.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchSentInvites = fetchSentInvitesThunk;

// 8. Cancel an Invite (DELETE /api/v1/family/member-invites/:inviteId)
export const cancelSentInviteThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('family/cancelSentInvite', async (inviteId, { rejectWithValue }) => {
  try {
    console.log('[cancelSentInvite API] Canceling invite:', inviteId);
    await familyServices.cancelMemberInvite(inviteId);
    return inviteId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to cancel invitation.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const cancelSentInvite = cancelSentInviteThunk;

// 9. My Invites (Invited Person Side) (GET /api/v1/family/member-invites/mine)
export const fetchMyInvitesThunk = createAsyncThunk<
  GetMyInvitesResponse,
  void,
  { rejectValue: string }
>('family/fetchMyInvites', async (_, { rejectWithValue }) => {
  try {
    console.log('[fetchMyInvites API] Checking my pending invitations...');
    const response = await familyServices.getMyInvites();
    console.log('[fetchMyInvites API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch your invitations.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchMyInvites = fetchMyInvitesThunk;

// 10. Accept Direct Invite (POST /api/v1/family/member-invites/:inviteId/accept)
export const acceptMemberInviteThunk = createAsyncThunk<
  AcceptInviteResponse,
  string,
  { rejectValue: string }
>('family/acceptMemberInvite', async (inviteId, { rejectWithValue, dispatch }) => {
  try {
    console.log('[acceptMemberInvite API] Accepting invite:', inviteId);
    const response = await familyServices.acceptMemberInvite(inviteId);
    console.log('[acceptMemberInvite API] Success Response:', response);
    if (response.family?.memberId) {
      await saveMyMemberId(response.family.memberId);
    }
    dispatch(getMyFamilyThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to accept invitation.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const acceptMemberInvite = acceptMemberInviteThunk;

// 11. Decline Direct Invite (POST /api/v1/family/member-invites/:inviteId/decline)
export const declineMemberInviteThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('family/declineMemberInvite', async (inviteId, { rejectWithValue }) => {
  try {
    console.log('[declineMemberInvite API] Declining invite:', inviteId);
    await familyServices.declineMemberInvite(inviteId);
    return inviteId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to decline invitation.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const declineMemberInvite = declineMemberInviteThunk;

// 12. Create Shareable Invite Link (POST /api/v1/family/invitations)
export const createInvitationThunk = createAsyncThunk<
  CreateInvitationResponse,
  void,
  { rejectValue: string }
>('family/createInvitation', async (_, { rejectWithValue }) => {
  try {
    console.log('[createInvitation API] Requesting invite link...');
    const response = await familyServices.createInvitation();
    console.log('[createInvitation API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to generate invitation link.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const createInvitation = createInvitationThunk;

// 13. Get Current Shareable Link (GET /api/v1/family/invitations)
export const fetchInvitationsThunk = createAsyncThunk<
  CreateInvitationResponse,
  void,
  { rejectValue: string }
>('family/fetchInvitations', async (_, { rejectWithValue }) => {
  try {
    const response = await familyServices.getInvitations();
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch invitation link.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchInvitations = fetchInvitationsThunk;

// 14. Delete Shareable Link (DELETE /api/v1/family/invitations/:invitationId)
export const deleteInvitationThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('family/deleteInvitation', async (invitationId, { rejectWithValue }) => {
  try {
    console.log('[deleteInvitation API] Deleting invite link:', invitationId);
    await familyServices.deleteInvitation(invitationId);
    return invitationId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete invitation link.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const deleteInvitation = deleteInvitationThunk;

// 15. Preview Share Link Before Joining (POST /api/v1/family/invitations/preview)
export const previewInvitationThunk = createAsyncThunk<
  PreviewInvitationResponse,
  PreviewInvitationPayload,
  { rejectValue: string }
>('family/previewInvitation', async (payload, { rejectWithValue }) => {
  try {
    console.log('[previewInvitation API] Payload:', payload);
    const response = await familyServices.previewInvitation(payload);
    console.log('[previewInvitation API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to preview invitation.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const previewInvitation = previewInvitationThunk;

// 16. Add Child Profile (POST /api/v1/family/members)
export const addManagedMemberThunk = createAsyncThunk<
  CreateChildMemberResponse,
  CreateChildMemberPayload,
  { rejectValue: string }
>('family/addManagedMember', async (payload, { rejectWithValue, dispatch }) => {
  try {
    console.log('[addManagedMember API] Adding child member:', payload);
    const response = await familyServices.addManagedMember(payload);
    console.log('[addManagedMember API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to add child profile.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const addManagedMember = addManagedMemberThunk;

// 17. Update Child's Photo or Avatar Color (POST /api/v1/auth/avatar)
export const updateChildAvatarThunk = createAsyncThunk<
  UpdateChildAvatarResponse,
  UpdateChildAvatarPayload,
  { rejectValue: string }
>('family/updateChildAvatar', async (payload, { rejectWithValue, dispatch }) => {
  try {
    console.log('[updateChildAvatar API] Updating avatar for child:', payload.memberId);
    const response = await familyServices.updateAvatar(payload);
    console.log('[updateChildAvatar API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update avatar.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const updateChildAvatar = updateChildAvatarThunk;

// 18. Change Role (Owner Only) (PATCH /api/v1/family/members/:memberId/role)
export const updateMemberRoleThunk = createAsyncThunk<
  { memberId: string; role: string; message: string },
  { memberId: string; role: 'FAMILY_ADMIN' | 'ADULT_MEMBER' | string },
  { rejectValue: string }
>('family/updateMemberRole', async ({ memberId, role }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[updateMemberRole API] Changing role for:', memberId, 'to:', role);
    const response = await familyServices.updateMemberRole(memberId, role);
    console.log('[updateMemberRole API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return { memberId, role, message: response.message };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to change member role.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const updateMemberRole = updateMemberRoleThunk;

// 19. Remove Member (DELETE /api/v1/family/members/:memberId)
export const removeMemberThunk = createAsyncThunk<
  RemoveMemberResponse,
  string,
  { rejectValue: string }
>('family/removeMember', async (memberId, { rejectWithValue, dispatch }) => {
  try {
    console.log('[removeMember API] Removing member:', memberId);
    const response = await familyServices.removeMember(memberId);
    console.log('[removeMember API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to remove member.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const removeMember = removeMemberThunk;

// 20. Leave Family (POST /api/v1/family/leave)
export const leaveFamilyThunk = createAsyncThunk<
  LeaveFamilyResponse,
  void,
  { rejectValue: string }
>('family/leaveFamily', async (_, { rejectWithValue }) => {
  try {
    console.log('[leaveFamily API] Leaving family...');
    const response = await familyServices.leaveFamily();
    console.log('[leaveFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to leave family.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const leaveFamily = leaveFamilyThunk;

// 21. Transfer Ownership (POST /api/v1/family/transfer-ownership)
export const transferOwnershipThunk = createAsyncThunk<
  TransferOwnershipResponse,
  string,
  { rejectValue: string }
>('family/transferOwnership', async (memberId, { rejectWithValue, dispatch }) => {
  try {
    console.log('[transferOwnership API] Transferring ownership to:', memberId);
    const response = await familyServices.transferOwnership(memberId);
    console.log('[transferOwnership API] Success Response:', response);
    dispatch(getMyFamilyThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to transfer ownership.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const transferOwnership = transferOwnershipThunk;

// 22. Delete Family (DELETE /api/v1/family)
export const deleteFamilyThunk = createAsyncThunk<
  DeleteFamilyResponse,
  void,
  { rejectValue: string }
>('family/deleteFamily', async (_, { rejectWithValue }) => {
  try {
    console.log('[deleteFamily API] Deleting family...');
    const response = await familyServices.deleteFamily();
    console.log('[deleteFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete family.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const deleteFamily = deleteFamilyThunk;

// 23. Get My Family Status / Pending Request Thunk (GET /api/v1/family/my-family)
export const getMyFamilyThunk = createAsyncThunk<
  MyFamilyResponse,
  void,
  { rejectValue: string }
>('family/getMyFamily', async (_, { rejectWithValue }) => {
  try {
    console.log('[getMyFamily API] Checking family status...');
    const response = await familyServices.getMyFamily();
    console.log('[getMyFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to check family status.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const getMyFamily = getMyFamilyThunk;

/** Add Child Member Thunk (POST /api/v1/family/members) */
export const addFamilyMemberThunk = createAsyncThunk<
  AddChildMemberResponse,
  AddChildMemberPayload,
  { rejectValue: string }
>('family/addMember', async (payload, { rejectWithValue }) => {
  try {
    console.log('[addFamilyMember API] Payload:', payload);
    const response = await familyServices.addFamilyMember(payload);
    console.log('[addFamilyMember API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to add child member.';
    console.log('[addFamilyMember API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const addFamilyMember = addFamilyMemberThunk;

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    clearFamilyError: (state) => {
      state.error = null;
    },
    clearInviteError: (state) => {
      state.inviteError = null;
    },
    clearJoinError: (state) => {
      state.joinError = null;
    },
    clearPreviewError: (state) => {
      state.previewError = null;
    },
    clearMyFamilyError: (state) => {
      state.myFamilyError = null;
    },
    clearRequestsError: (state) => {
      state.requestsError = null;
    },
    clearActionStatus: (state) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionSuccess = null;
    clearAddMemberError: (state) => {
      state.addMemberError = null;
    },
    resetFamilyState: () => initialState,
    setFamily: (state, action: PayloadAction<FamilyData>) => {
      state.family = action.payload;
      state.familyCode = action.payload.familyCode;
      if (action.payload.myMemberId) {
        state.myMemberId = action.payload.myMemberId;
      }
    },
    setMyMemberId: (state, action: PayloadAction<string | null>) => {
      state.myMemberId = action.payload;
      if (state.family) {
        state.family.myMemberId = action.payload || undefined;
      }
    },
    setInvitation: (state, action: PayloadAction<FamilyInvitationData>) => {
      state.invitation = action.payload;
    },
    setJoinRequest: (state, action: PayloadAction<JoinFamilyResponse>) => {
      state.joinRequest = action.payload;
    },
    setMyFamilyData: (state, action: PayloadAction<MyFamilyResponse>) => {
      state.myFamilyData = action.payload;
    },
    setPendingRequests: (state, action: PayloadAction<JoinRequestItemData[]>) => {
      state.pendingRequests = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Create Family
      .addCase(createFamilyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFamilyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.family = action.payload.family;
        state.familyCode = action.payload.family?.familyCode || null;
        state.myMemberId =
          (action.payload as any)?.family?.myMemberId ||
          (action.payload as any)?.myMemberId ||
          null;
        state.success = true;
        state.error = null;
      })
      .addCase(createFamilyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create family.';
        state.success = false;
      })

      // 2. Join Request
      .addCase(requestJoinFamilyThunk.pending, (state) => {
        state.joinLoading = true;
        state.joinError = null;
      })
      .addCase(requestJoinFamilyThunk.fulfilled, (state, action) => {
        state.joinLoading = false;
        state.joinRequest = action.payload;
        state.joinError = null;
      })
      .addCase(requestJoinFamilyThunk.rejected, (state, action) => {
        state.joinLoading = false;
        state.joinError = action.payload || 'Failed to send join request.';
      })

      // 3. Fetch Join Requests
      .addCase(fetchJoinRequestsThunk.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(fetchJoinRequestsThunk.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.pendingRequests = action.payload.requests || [];
        state.requestsError = null;
      })
      .addCase(fetchJoinRequestsThunk.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.payload || 'Failed to fetch join requests.';
      })

      // 4. Approve Join Request
      .addCase(approveJoinRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveJoinRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingRequests = state.pendingRequests.filter(
          (r) => r.id !== action.payload.requestId
        );
        state.actionSuccess = action.payload.data.message;
      })
      .addCase(approveJoinRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to approve join request.';
      })

      // 5. Decline Join Request
      .addCase(rejectJoinRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rejectJoinRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingRequests = state.pendingRequests.filter(
          (r) => r.id !== action.payload.requestId
        );
        state.actionSuccess = action.payload.message;
      })
      .addCase(rejectJoinRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to decline join request.';
      })

      // 6. Invite Adult Member
      .addCase(inviteAdultMemberThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(inviteAdultMemberThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Invitation sent successfully.';
      })
      .addCase(inviteAdultMemberThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to send invitation.';
      })

      // 7. Fetch Sent Invites
      .addCase(fetchSentInvitesThunk.pending, (state) => {
        state.sentInvitesLoading = true;
        state.sentInvitesError = null;
      })
      .addCase(fetchSentInvitesThunk.fulfilled, (state, action) => {
        state.sentInvitesLoading = false;
        state.sentInvites = action.payload.invites || [];
      })
      .addCase(fetchSentInvitesThunk.rejected, (state, action) => {
        state.sentInvitesLoading = false;
        state.sentInvitesError = action.payload || 'Failed to fetch sent invites.';
      })

      // 8. Cancel Sent Invite
      .addCase(cancelSentInviteThunk.fulfilled, (state, action) => {
        state.sentInvites = state.sentInvites.filter((i) => i.id !== action.payload);
      })

      // 9. Fetch My Invites
      .addCase(fetchMyInvitesThunk.pending, (state) => {
        state.myInvitesLoading = true;
        state.myInvitesError = null;
      })
      .addCase(fetchMyInvitesThunk.fulfilled, (state, action) => {
        state.myInvitesLoading = false;
        state.myInvites = action.payload.invites || [];
      })
      .addCase(fetchMyInvitesThunk.rejected, (state, action) => {
        state.myInvitesLoading = false;
        state.myInvitesError = action.payload || 'Failed to fetch your invitations.';
      })

      // 10. Accept Direct Invite
      .addCase(acceptMemberInviteThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(acceptMemberInviteThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Joined family successfully.';
      })
      .addCase(acceptMemberInviteThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to accept invitation.';
      })

      // 11. Decline Direct Invite
      .addCase(declineMemberInviteThunk.fulfilled, (state, action) => {
        state.myInvites = state.myInvites.filter((i) => i.id !== action.payload);
      })

      // 12. Create Invitation Link
      .addCase(createInvitationThunk.pending, (state) => {
        state.inviteLoading = true;
        state.inviteError = null;
      })
      .addCase(createInvitationThunk.fulfilled, (state, action) => {
        state.inviteLoading = false;
        state.invitation = action.payload.invitation;
        state.inviteError = null;
      })
      .addCase(createInvitationThunk.rejected, (state, action) => {
        state.inviteLoading = false;
        state.inviteError =
          action.payload || 'Failed to generate invitation link.';
      })

      // 13. Fetch Invitation Link
      .addCase(fetchInvitationsThunk.fulfilled, (state, action) => {
        state.invitation = action.payload.invitation;
      })

      // 14. Delete Invitation Link
      .addCase(deleteInvitationThunk.fulfilled, (state) => {
        state.invitation = null;
      })

      // 15. Preview Invitation
      .addCase(previewInvitationThunk.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
      })
      .addCase(previewInvitationThunk.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewData = action.payload.invitation;
        state.previewError = null;
      })
      .addCase(previewInvitationThunk.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload || 'Failed to preview invitation.';
      })

      // 16. Add Child Profile
      .addCase(addManagedMemberThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(addManagedMemberThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload.message;
      })
      .addCase(addManagedMemberThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to add child member.';
      })

      // 18. Change Member Role
      .addCase(updateMemberRoleThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateMemberRoleThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload.message;
        const updateRoleInList = (members?: FamilyMemberData[]) => {
          if (!members) return;
          const target = members.find((m) => m.id === action.payload.memberId);
          if (target) target.role = action.payload.role;
        };
        updateRoleInList(state.family?.members);
        updateRoleInList((state.myFamilyData?.family as any)?.members);
      })
      .addCase(updateMemberRoleThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to change member role.';
      })

      // 19. Remove Member
      .addCase(removeMemberThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload.message;
        const removeId = action.payload.removed.memberId;
        if (state.family?.members) {
          state.family.members = state.family.members.filter((m) => m.id !== removeId);
        }
        if ((state.myFamilyData?.family as any)?.members) {
          (state.myFamilyData?.family as any).members = (
            state.myFamilyData?.family as any
          ).members.filter((m: any) => m.id !== removeId);
        }
      })
      .addCase(removeMemberThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to remove member.';
      })

      // 20. Leave Family
      .addCase(leaveFamilyThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(leaveFamilyThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.family = null;
        state.myFamilyData = { inFamily: false, family: null, pendingRequest: null };
      })
      .addCase(leaveFamilyThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to leave family.';
      })

      // 21. Transfer Ownership
      .addCase(transferOwnershipThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(transferOwnershipThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload.message;
      })
      .addCase(transferOwnershipThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to transfer ownership.';
      })

      // 22. Delete Family
      .addCase(deleteFamilyThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteFamilyThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.family = null;
        state.myFamilyData = { inFamily: false, family: null, pendingRequest: null };
      })
      .addCase(deleteFamilyThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to delete family.';
      })

      // 23. Get My Family Status
      .addCase(getMyFamilyThunk.pending, (state) => {
        state.myFamilyLoading = true;
        state.myFamilyError = null;
      })
      .addCase(getMyFamilyThunk.fulfilled, (state, action) => {
        state.myFamilyLoading = false;
        state.myFamilyData = action.payload;
        state.myFamilyError = null;
        if (action.payload.inFamily && action.payload.family) {
          const family = { ...action.payload.family };
          if (family.members && Array.isArray(family.members)) {
            family.members = family.members.map((m: any, idx: number) => ({
              ...m,
              id: m.id || m.memberId || m._id || m.userId || `member-${idx}`,
            }));
          }
          state.family = family;
          state.familyCode = action.payload.family.familyCode;
          if (action.payload.family.myMemberId) {
            state.myMemberId = action.payload.family.myMemberId;
          }
        }
      })
      .addCase(getMyFamilyThunk.rejected, (state, action) => {
        state.myFamilyLoading = false;
        state.myFamilyError = action.payload || 'Failed to check family status.';
      })
      .addCase(addFamilyMemberThunk.pending, (state) => {
        state.addMemberLoading = true;
        state.addMemberError = null;
      })
      .addCase(addFamilyMemberThunk.fulfilled, (state) => {
        state.addMemberLoading = false;
        state.addMemberError = null;
      })
      .addCase(addFamilyMemberThunk.rejected, (state, action) => {
        state.addMemberLoading = false;
        state.addMemberError = action.payload || 'Failed to add child member.';
      });
  },
});

export const {
  clearFamilyError,
  clearInviteError,
  clearJoinError,
  clearPreviewError,
  clearMyFamilyError,
  clearRequestsError,
  clearActionStatus,
  clearAddMemberError,
  resetFamilyState,
  setFamily,
  setMyMemberId,
  setInvitation,
  setJoinRequest,
  setMyFamilyData,
  setPendingRequests,
} = familySlice.actions;

export default familySlice.reducer;
