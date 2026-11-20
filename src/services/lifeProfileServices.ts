import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type LifeProfileSection =
  | 'personal'
  | 'documents'
  | 'health'
  | 'vaccination'
  | 'interests';

export interface LifeProfileQueryParams {
  view?: 'summary' | 'full' | string;
  section?: LifeProfileSection;
  documentId?: string;
  tab?: 'vaccines' | 'growth' | 'milestones' | string;
  vaccineId?: string;
}

export interface LifeProfileResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

const lifeProfileServices = {
  /**
   * Universal Life Profile GET API:
   * GET /api/v1/family/members/:memberId/life-profile
   * Accepts query: ?view=summary, ?view=full or ?section=personal|documents|health|vaccination|interests
   */
  getLifeProfile: async <T = any>(
    memberId: string,
    params?: LifeProfileQueryParams
  ): Promise<LifeProfileResponse<T>> => {
    try {
      const endpoint = API_ROUTES.FAMILY_MEMBER_LIFE_PROFILE(memberId, params);
      console.log(`[LifeProfile Service] Requesting: GET ${endpoint}`);
      const response = await apiClient.get<LifeProfileResponse<T>>(endpoint);
      console.log(`[LifeProfile Service] Success Response for GET ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.log(`[LifeProfile Service] Error for GET ${API_ROUTES.FAMILY_MEMBER_LIFE_PROFILE(memberId, params)}:`, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  },

  /** GET /api/v1/family/members/:memberId/life-profile?view=full */
  getFullProfile: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { view: 'full' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?view=summary */
  getSummary: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { view: 'summary' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=personal */
  getPersonal: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { section: 'personal' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=documents */
  getDocuments: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { section: 'documents' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=documents&documentId=:documentId */
  getDocumentDetail: async (memberId: string, documentId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, {
      section: 'documents',
      documentId,
    });
  },

  /** DELETE /api/v1/family/documents/:documentId */
  deleteDocument: async (documentId: string) => {
    const endpoint = API_ROUTES.FAMILY_DOCUMENT_DELETE(documentId);
    console.log(`[LifeProfile Service] Requesting: DELETE ${endpoint}`);
    const response = await apiClient.delete(endpoint);
    console.log(`[LifeProfile Service] Delete Success for ${endpoint}:`, response.data);
    return response.data;
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=health */
  getHealth: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { section: 'health' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=vaccination */
  getVaccination: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { section: 'vaccination' });
  },

  /** GET /api/v1/family/members/:memberId/life-profile?section=interests */
  getInterests: async (memberId: string) => {
    return lifeProfileServices.getLifeProfile(memberId, { section: 'interests' });
  },

  /**
   * Universal Life Profile PATCH API:
   * PATCH /api/v1/family/members/:memberId/life-profile
   * Accepts { personal?: {...}, documents?: [...], health?: {...}, vaccination?: {...}, interests?: {...} }
   */
  updateLifeProfile: async <T = any>(
    memberId: string,
    payload: Record<string, any>
  ): Promise<LifeProfileResponse<T>> => {
    try {
      const endpoint = `family/members/${memberId}/life-profile`;
      console.log(`[LifeProfile Service] Requesting: PATCH ${endpoint}`);
      console.log(
        `[LifeProfile Service] PATCH Request Payload for ${endpoint}:`,
        JSON.stringify(payload, null, 2)
      );
      const response = await apiClient.patch<LifeProfileResponse<T>>(
        endpoint,
        payload
      );
      console.log(
        `[LifeProfile Service] Success Response for PATCH ${endpoint}:`,
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error: any) {
      console.log(
        `[LifeProfile Service] Error for PATCH family/members/${memberId}/life-profile:`,
        {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        }
      );
      throw error;
    }
  },

  /**
   * Update Personal section of Life Profile:
   * PATCH /api/v1/family/members/:memberId/life-profile with { personal: personalData }
   */
  updatePersonalProfile: async (
    memberId: string,
    personalData: Record<string, any>
  ) => {
    return lifeProfileServices.updateLifeProfile(memberId, {
      personal: personalData,
    });
  },

  /**
   * Scan Document & Extract Fields:
   * POST /api/v1/family/members/:memberId/documents/scan
   * Body: FormData (file, backFile, type, skipRead)
   */
  scanDocument: async (
    memberId: string,
    formData: FormData
  ): Promise<any> => {
    try {
      const endpoint = API_ROUTES.FAMILY_MEMBER_SCAN_DOCUMENT(memberId);
      console.log(`[LifeProfile Service] Requesting: POST ${endpoint}`);
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(
        `[LifeProfile Service] Success Response for POST ${endpoint}:`,
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error: any) {
      console.log(
        `[LifeProfile Service] Error for POST ${API_ROUTES.FAMILY_MEMBER_SCAN_DOCUMENT(memberId)}:`,
        {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        }
      );
      throw error;
    }
  },

  /**
   * Delete Vaccine:
   * DELETE /api/v1/family/vaccines/:vaccineId
   */
  deleteVaccine: async (vaccineId: string): Promise<any> => {
    try {
      const endpoint = API_ROUTES.FAMILY_VACCINE_BY_ID(vaccineId);
      console.log(`[LifeProfile Service] Requesting: DELETE ${endpoint}`);
      const response = await apiClient.delete(endpoint);
      console.log(`[LifeProfile Service] Success Response for DELETE ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.log(`[LifeProfile Service] Error for DELETE ${API_ROUTES.FAMILY_VACCINE_BY_ID(vaccineId)}:`, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  },
};

export default lifeProfileServices;

