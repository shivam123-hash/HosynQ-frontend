import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type LifeProfileSection =
  | 'personal'
  | 'documents'
  | 'health'
  | 'vaccination'
  | 'interests';

export interface LifeProfileQueryParams {
  view?: 'summary';
  section?: LifeProfileSection;
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
   * Accepts query: ?view=summary or ?section=personal|documents|health|vaccination|interests
   */
  getLifeProfile: async <T = any>(
    memberId: string,
    params?: LifeProfileQueryParams
  ): Promise<LifeProfileResponse<T>> => {
    try {
      const endpoint = API_ROUTES.FAMILY_MEMBER_LIFE_PROFILE(memberId, params);
      const response = await apiClient.get<LifeProfileResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
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
};

export default lifeProfileServices;

