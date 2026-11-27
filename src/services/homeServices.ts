import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type HomeSectionType =
  | 'HEADER'
  | 'WEATHER'
  | 'BRIEF'
  | 'GET_STARTED'
  | 'PROFILE_CARD'
  | 'NEEDS_ATTENTION'
  | 'UPCOMING_TODAY'
  | 'PENDING_TASKS'
  | 'RECENTLY_DONE'
  | 'FAMILY_PULSE'
  | 'TODAY'
  | 'IMPORTANT_DATE';

export type BriefPeriod = 'TODAY' | 'WEEK' | 'MONTH';

export interface HomeQuery {
  today?: string;
  withinDays?: number;
  previewSize?: number;
  limit?: number;
  before?: HomeSectionType | string;
  section?: HomeSectionType;
  period?: BriefPeriod;
  lat?: number;
  lng?: number;
}

export interface HomeSectionData<T = any> {
  type: HomeSectionType;
  data: T;
}

export interface HomeResponse {
  success: boolean;
  today: string;
  sections: HomeSectionData[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: HomeSectionType | null;
  };
}

const withHomeApiLog = async <T>(
  apiTag: string,
  requestInfo: Record<string, any> | undefined,
  executor: () => Promise<T>
): Promise<T> => {
  console.log(`[Home API · ${apiTag}] Request:`, requestInfo ?? {});
  try {
    const res = await executor();
    console.log(`[Home API · ${apiTag}] Success Response:`, res);
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    console.log(`[Home API · ${apiTag}] Error Response:`, {
      status: err?.response?.status,
      data: err?.response?.data,
      message: Array.isArray(msg) ? msg.join(', ') : msg,
      url: err?.config?.url,
    });
    throw err;
  }
};

const homeServices = {
  /**
   * GET /api/v1/home
   * Fetches home sections. Can paginate with `limit` and `before`,
   * or fetch a single section with `section`.
   */
  getHomePage: (params?: HomeQuery): Promise<HomeResponse> =>
    withHomeApiLog('GET /home', params, async () => {
      const res = await apiClient.get<HomeResponse>(API_ROUTES.HOME, {
        params,
      });
      return res.data;
    }),

  /**
   * Fetches a single section only (e.g. BRIEF or PENDING_TASKS)
   */
  getHomeSection: (
    section: HomeSectionType,
    params?: Omit<HomeQuery, 'section'>
  ): Promise<HomeResponse> =>
    withHomeApiLog(`GET /home?section=${section}`, { section, ...params }, async () => {
      const res = await apiClient.get<HomeResponse>(API_ROUTES.HOME, {
        params: { ...params, section },
      });
      return res.data;
    }),

  /**
   * GET /api/v1/home/brief
   */
  getHomeBrief: (params?: {
    period?: BriefPeriod;
    today?: string;
    withinDays?: number;
    previewSize?: number;
  }): Promise<any> =>
    withHomeApiLog('GET /home/brief', params, async () => {
      const res = await apiClient.get(API_ROUTES.HOME_BRIEF, { params });
      return res.data;
    }),

  /**
   * GET /api/v1/home/needs-attention
   */
  getHomeNeedsAttention: (params?: { withinDays?: number }): Promise<any> =>
    withHomeApiLog('GET /home/needs-attention', params, async () => {
      const res = await apiClient.get(API_ROUTES.HOME_NEEDS_ATTENTION, { params });
      return res.data;
    }),
};

export default homeServices;
