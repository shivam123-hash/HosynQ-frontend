import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface CreateFamilyPayload {
  name: string;
  familyType?: string;
  expectedMemberCount?: number;
}

export interface FamilyData {
  id: string;
  name: string;
  familyCode: string;
  familyType: string;
  expectedMemberCount?: number;
  memberCount: number;
  myRole: string;
  createdAt: string;
}

export interface CreateFamilyResponse {
  success: boolean;
  message: string;
  family: FamilyData;
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
  /** Create a new family and generate a unique Family ID (POST /api/v1/family/create) */
  createFamily: async (
    payload: CreateFamilyPayload
  ): Promise<CreateFamilyResponse> => {
    try {
      const response = await apiClient.post<CreateFamilyResponse>(
        API_ROUTES.FAMILY_CREATE,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Create or get active shareable invite link (POST /api/v1/family/invitations) */
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

  /** List existing active invite link for family (GET /api/v1/family/invitations) */
  getInvitations: async (): Promise<CreateInvitationResponse> => {
    try {
      const response = await apiClient.get<CreateInvitationResponse>(
        API_ROUTES.FAMILY_INVITATIONS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Send request to join an existing family using Family ID or code (POST /api/v1/family/join-request) */
  requestJoinFamily: async (
    payload: JoinFamilyPayload
  ): Promise<JoinFamilyResponse> => {
    try {
      const response = await apiClient.post<JoinFamilyResponse>(
        API_ROUTES.FAMILY_JOIN_REQUEST,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Preview an invite before accepting it (POST /api/v1/family/invitations/preview) */
  previewInvitation: async (
    payload: PreviewInvitationPayload
  ): Promise<PreviewInvitationResponse> => {
    try {
      const response = await apiClient.post<PreviewInvitationResponse>(
        API_ROUTES.FAMILY_INVITATION_PREVIEW,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Get current user's family status or pending join request (GET /api/v1/family/my-family) */
  getMyFamily: async (): Promise<MyFamilyResponse> => {
    try {
      const response = await apiClient.get<MyFamilyResponse>(
        API_ROUTES.FAMILY_MY_FAMILY
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default familyServices;
