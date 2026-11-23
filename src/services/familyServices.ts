import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';
import { saveMyMemberId } from '../units/asyncStorageManager';

export interface CreateFamilyPayload {
  name: string;
  familyType?: string;
  expectedMemberCount?: number;
}

export interface FamilyMemberData {
  id?: string;
  memberId?: string;
  _id?: string;
  userId?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  role: 'FAMILY_OWNER' | 'FAMILY_ADMIN' | 'ADULT_MEMBER' | 'DEPENDENT_CHILD_PROFILE' | string;
  relationship?: string;
  gender?: string;
  isYou?: boolean;
  hasAppAccount?: boolean;
  lifeProfileProgress?: number;
  createdAt?: string;
}

export interface FamilyData {
  id: string;
  name: string;
  familyCode: string;
  familyType: string;
  expectedMemberCount?: number;
  memberCount: number;
  myRole: string;
  myMemberId?: string;
  createdAt?: string;
  members?: FamilyMemberData[];
}

export interface CreateFamilyResponse {
  success: boolean;
  message: string;
  family: FamilyData;
  myMemberId?: string;
}

export interface FamilyInvitationData {
  id: string;
  url: string;
  token: string;
  usedCount?: number;
  expiresAt: string;
  validForDays?: number;
  createdAt?: string;
}

export interface CreateInvitationResponse {
  success: boolean;
  familyName?: string;
  familyCode?: string;
  invitation: FamilyInvitationData;
  message?: string;
}

export interface JoinFamilyPayload {
  familyCode?: string;
  inviteToken?: string;
  message?: string;
}

export interface JoinFamilyResponse {
  success: boolean;
  message: string;
  familyId: string;
  familyName: string;
  familyCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
}

export interface PreviewInvitationPayload {
  inviteToken: string;
}

export interface PreviewInvitationData {
  familyName: string;
  familyType: string;
  invitedBy: string;
  memberCount: number;
  expiresAt: string;
  familyCode?: string;
}

export interface PreviewInvitationResponse {
  success: boolean;
  invitation: PreviewInvitationData;
}

export interface PendingJoinRequestData {
  requestId: string;
  familyName: string;
  familyCode: string;
  status: string;
  createdAt: string;
}

export interface MyFamilyResponse {
  inFamily: boolean;
  family: FamilyData | null;
  pendingRequest?: PendingJoinRequestData | null;
  message?: string;
}

export interface JoinRequestItemData {
  id: string;
  userId?: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  phoneNumber?: string | null;
  message?: string | null;
  createdAt: string;
}

export interface GetJoinRequestsResponse {
  success: boolean;
  requests: JoinRequestItemData[];
}

export interface ApproveJoinRequestResponse {
  success: boolean;
  message: string;
  member: {
    memberId: string;
    fullName: string;
    role: string;
  };
}

export interface InviteAdultPayload {
  phoneNumber?: string;
  email?: string;
  name?: string;
  role?: 'ADULT_MEMBER' | 'FAMILY_ADMIN' | string;
}

export interface InviteAdultResponse {
  success: boolean;
  invite: {
    id: string;
    name?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    role: string;
    createdAt: string;
  };
}

export interface SentInviteData {
  id: string;
  name?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  role: string;
  invitedBy?: {
    memberId: string;
    fullName: string;
  } | null;
  createdAt: string;
}

export interface GetSentInvitesResponse {
  success: boolean;
  invites: SentInviteData[];
}

export interface MyInviteData {
  id: string;
  familyId: string;
  familyName: string;
  familyType: string;
  role: string;
  invitedBy: string;
  createdAt: string;
}

export interface GetMyInvitesResponse {
  success: boolean;
  invites: MyInviteData[];
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  family: {
    id: string;
    name: string;
    role: string;
    memberId: string;
  };
}

export interface CreateChildMemberPayload {
  role?: 'DEPENDENT_CHILD_PROFILE' | 'ADULT_MEMBER' | string;
  personal: {
    fullName: string;
    nickname?: string;
    familyRole?: string;
    gender?: string;
    birthDate?: string;
    bloodGroup?: string;
    heightCm?: number;
    weightKg?: number;
    occupationStatus?: string;
  };
}

export interface CreateChildMemberResponse {
  success: boolean;
  message: string;
  member: {
    id: string;
    fullName: string;
    role: string;
    relationship?: string;
    avatarColor?: string;
  };
}

export interface UpdateChildAvatarPayload {
  avatarColor?: string;
  memberId?: string;
  file?: any;
}

export interface UpdateChildAvatarResponse {
  success: boolean;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  memberId?: string;
}

export interface UpdateMemberRoleResponse {
  success: boolean;
  message: string;
  member: {
    memberId: string;
    role: string;
  };
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
  removed: {
    memberId: string;
    fullName: string;
    role: string;
  };
  tasksHandedOver?: number;
}

export interface LeaveFamilyResponse {
  success: boolean;
  message: string;
  leftFamily: {
    name: string;
    role: string;
  };
  tasksHandedOver?: number;
}

export interface TransferOwnershipResponse {
  success: boolean;
  message: string;
  newOwner: {
    memberId: string;
    fullName: string;
    role: string;
  };
  previousOwner: {
    memberId: string;
    role: string;
  };
}

export interface DeleteFamilyResponse {
  success: boolean;
  message: string;
}

/** Helper to map UI dropdown family type to backend enum/string */
export const mapFamilyTypeToBackend = (type?: string): string => {
  if (!type) return 'JOINT';
  switch (type.trim()) {
    case 'Nuclear Family':
      return 'NUCLEAR';
    case 'Joint Family':
      return 'JOINT';
    case 'Extended Family':
      return 'EXTENDED';
    case 'Single Parent':
      return 'SINGLE_PARENT';
    case 'Couple':
      return 'COUPLE';
    case 'Other':
      return 'OTHER';
    default:
      return type.trim().toUpperCase().replace(/\s+/g, '_');
  }
};

const familyServices = {
  // 1. Get My Family & Members (GET /api/v1/family/my-family)
  getMyFamily: async (): Promise<MyFamilyResponse> => {
    const response = await apiClient.get<MyFamilyResponse>(API_ROUTES.FAMILY_MY_FAMILY);
    return response.data;
  },

  // 2. Submit Join Request (POST /api/v1/family/join-request)
  requestJoinFamily: async (payload: JoinFamilyPayload): Promise<JoinFamilyResponse> => {
    const response = await apiClient.post<JoinFamilyResponse>(
      API_ROUTES.FAMILY_JOIN_REQUEST,
      payload
    );
    return response.data;
  },

  // 3. List Join Requests (GET /api/v1/family/requests)
  getPendingRequests: async (): Promise<GetJoinRequestsResponse> => {
    const response = await apiClient.get<GetJoinRequestsResponse>(API_ROUTES.FAMILY_REQUESTS);
    return response.data;
  },

  // 4. Approve Join Request (PATCH /api/v1/family/requests/:id/approve)
  approveJoinRequest: async (
    requestId: string,
    role: 'ADULT_MEMBER' | 'FAMILY_ADMIN' | string = 'ADULT_MEMBER'
  ): Promise<ApproveJoinRequestResponse> => {
    const response = await apiClient.patch<ApproveJoinRequestResponse>(
      API_ROUTES.FAMILY_REQUEST_APPROVE(requestId),
      { role }
    );
    return response.data;
  },

  // 5. Decline Join Request (PATCH /api/v1/family/requests/:id/reject)
  rejectJoinRequest: async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      API_ROUTES.FAMILY_REQUEST_REJECT(requestId),
      {}
    );
    return response.data;
  },

  // 6. Invite an Adult (POST /api/v1/family/member-invites)
  inviteMember: async (payload: InviteAdultPayload): Promise<InviteAdultResponse> => {
    const response = await apiClient.post<InviteAdultResponse>(
      API_ROUTES.FAMILY_MEMBER_INVITES,
      payload
    );
    return response.data;
  },

  // 7. List Sent Member Invites (GET /api/v1/family/member-invites)
  listMemberInvites: async (): Promise<GetSentInvitesResponse> => {
    const response = await apiClient.get<GetSentInvitesResponse>(
      API_ROUTES.FAMILY_MEMBER_INVITES
    );
    return response.data;
  },

  // 8. Cancel an Invite (DELETE /api/v1/family/member-invites/:inviteId)
  cancelMemberInvite: async (inviteId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ROUTES.FAMILY_MEMBER_INVITE_BY_ID(inviteId)
    );
    return response.data;
  },

  // 9. My Invites (Invitee Side) (GET /api/v1/family/member-invites/mine)
  getMyInvites: async (): Promise<GetMyInvitesResponse> => {
    const response = await apiClient.get<GetMyInvitesResponse>(
      API_ROUTES.FAMILY_MEMBER_INVITES_MINE
    );
    return response.data;
  },

  // 10. Accept Direct Invite (POST /api/v1/family/member-invites/:inviteId/accept)
  acceptMemberInvite: async (inviteId: string): Promise<AcceptInviteResponse> => {
    const response = await apiClient.post<AcceptInviteResponse>(
      API_ROUTES.FAMILY_MEMBER_INVITE_ACCEPT(inviteId),
      {}
    );
    return response.data;
  },

  // 11. Decline Direct Invite (POST /api/v1/family/member-invites/:inviteId/decline)
  declineMemberInvite: async (inviteId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ROUTES.FAMILY_MEMBER_INVITE_DECLINE(inviteId),
      {}
    );
    return response.data;
  },

  // 12. Create Shareable Invite Link (POST /api/v1/family/invitations)
  createInvitation: async (): Promise<CreateInvitationResponse> => {
    try {
      const response = await apiClient.post<CreateInvitationResponse>(
        API_ROUTES.FAMILY_INVITATIONS
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 409 && error?.response?.data?.invitation) {
        return {
          success: true,
          familyName: error.response.data.familyName,
          familyCode: error.response.data.familyCode,
          invitation: error.response.data.invitation,
          message: error.response.data.message,
        };
      }
      throw error;
    }
  },

  // 13. Get Current Shareable Link (GET /api/v1/family/invitations)
  getInvitations: async (): Promise<CreateInvitationResponse> => {
    const response = await apiClient.get<CreateInvitationResponse>(
      API_ROUTES.FAMILY_INVITATIONS
    );
    return response.data;
  },

  // 14. Delete Shareable Link (DELETE /api/v1/family/invitations/:invitationId)
  deleteInvitation: async (invitationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ROUTES.FAMILY_INVITATION_BY_ID(invitationId)
    );
    return response.data;
  },

  // 15. Preview Share Link Before Joining (POST /api/v1/family/invitations/preview)
  previewInvitation: async (
    payload: PreviewInvitationPayload
  ): Promise<PreviewInvitationResponse> => {
    const response = await apiClient.post<PreviewInvitationResponse>(
      API_ROUTES.FAMILY_INVITATION_PREVIEW,
      payload
    );
    return response.data;
  },

  // 16. Add Child Profile (POST /api/v1/family/members)
  addManagedMember: async (
    payload: CreateChildMemberPayload
  ): Promise<CreateChildMemberResponse> => {
    const response = await apiClient.post<CreateChildMemberResponse>(
      API_ROUTES.FAMILY_MEMBERS,
      payload
    );
    return response.data;
  },

  // 17. Update Child's Photo or Avatar Color (POST /api/v1/auth/avatar)
  updateAvatar: async (
    payload: UpdateChildAvatarPayload
  ): Promise<UpdateChildAvatarResponse> => {
    let requestData: any = payload;
    let headers: any = {};
    if (payload.file) {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.avatarColor) formData.append('avatarColor', payload.avatarColor);
      if (payload.memberId) formData.append('memberId', payload.memberId);
      requestData = formData;
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.post<UpdateChildAvatarResponse>(
      API_ROUTES.AUTH_AVATAR,
      requestData,
      { headers }
    );
    return response.data;
  },

  // 18. Change Role (PATCH /api/v1/family/members/:memberId/role)
  updateMemberRole: async (
    memberId: string,
    role: 'FAMILY_ADMIN' | 'ADULT_MEMBER' | string
  ): Promise<UpdateMemberRoleResponse> => {
    const response = await apiClient.patch<UpdateMemberRoleResponse>(
      API_ROUTES.FAMILY_MEMBER_ROLE(memberId),
      { role }
    );
    return response.data;
  },

  // 19. Remove Member (DELETE /api/v1/family/members/:memberId)
  removeMember: async (memberId: string): Promise<RemoveMemberResponse> => {
    const response = await apiClient.delete<RemoveMemberResponse>(
      API_ROUTES.FAMILY_MEMBER_BY_ID(memberId)
    );
    return response.data;
  },

  // 20. Leave Family (POST /api/v1/family/leave)
  leaveFamily: async (): Promise<LeaveFamilyResponse> => {
    const response = await apiClient.post<LeaveFamilyResponse>(
      API_ROUTES.FAMILY_LEAVE,
      {}
    );
    return response.data;
  },

  // 21. Transfer Ownership (POST /api/v1/family/transfer-ownership)
  transferOwnership: async (memberId: string): Promise<TransferOwnershipResponse> => {
    const response = await apiClient.post<TransferOwnershipResponse>(
      API_ROUTES.FAMILY_TRANSFER_OWNERSHIP,
      { memberId }
    );
    return response.data;
  },

  // 22. Delete Family (DELETE /api/v1/family)
  deleteFamily: async (): Promise<DeleteFamilyResponse> => {
    const response = await apiClient.delete<DeleteFamilyResponse>(
      API_ROUTES.FAMILY_DELETE
    );
    return response.data;
  },

  /** Create a new family helper (POST /api/v1/family/create) */
  createFamily: async (
    payload: CreateFamilyPayload
  ): Promise<CreateFamilyResponse> => {
    const response = await apiClient.post<CreateFamilyResponse>(
      API_ROUTES.FAMILY_CREATE,
      payload
    );
    const myMemberId =
      (response.data as any)?.family?.myMemberId ||
      (response.data as any)?.myMemberId;
    if (myMemberId) {
      await saveMyMemberId(myMemberId);
    }
    return response.data;
  },
};

export default familyServices;
