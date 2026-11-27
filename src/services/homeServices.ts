import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type NeedsAttentionSectionFilter =
  | 'ALL'
  | 'OVERDUE'
  | 'DUE_SOON'
  | 'RENEWALS'
  | 'IMPORTANT_DATES';

export type NeedsAttentionSectionName =
  | 'OVERDUE'
  | 'DUE_SOON'
  | 'RENEWALS'
  | 'IMPORTANT_DATES';

export type NeedsAttentionSource =
  | 'TASK'
  | 'REMINDER'
  | 'VAULT'
  | 'LIFE_PROFILE'
  | 'IMPORTANT_DATE';

export interface HomeAttentionPersonApi {
  memberId: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export interface HomeAttentionItemApi {
  key: string;
  source: NeedsAttentionSource;
  id: string;
  title: string;
  group?: string | null;
  on: string;
  time?: string | null;
  daysLeft: number;
  amount?: number | null;
  people: HomeAttentionPersonApi[];
  section: NeedsAttentionSectionName;
}

export interface ListNeedsAttentionQuery {
  section?: NeedsAttentionSectionFilter;
  withinDays?: number;
  limit?: number;
  before?: string;
  today?: string;
}

export interface ListNeedsAttentionCounts {
  total: number;
  overdue: number;
  all: number;
  dueSoon: number;
  renewals: number;
  importantDates: number;
}

export interface ListNeedsAttentionPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ListNeedsAttentionResponse {
  success: boolean;
  today: string;
  withinDays: number;
  section: NeedsAttentionSectionFilter;
  counts: ListNeedsAttentionCounts;
  items: HomeAttentionItemApi[];
  pagination: ListNeedsAttentionPagination;
}

const withHomeApiLog = async <T>(
  apiTag: string,
  requestInfo: Record<string, any> | undefined,
  executor: () => Promise<T>
): Promise<T> => {
  console.log(`[Home API · ${apiTag}] Request:`, requestInfo ?? {});
  try {
    const res = await executor();
    console.log(`[Home API · ${apiTag}] Success Response (raw):`, res);
    try {
      console.log(
        `[Home API · ${apiTag}] Success Response (formatted):\n`,
        JSON.stringify(res, null, 2)
      );
    } catch {
      // ignore serialization issues
    }
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
  /** 2. Needs attention: view all (GET /api/v1/home/needs-attention) */
  getNeedsAttention: (
    query?: ListNeedsAttentionQuery
  ): Promise<ListNeedsAttentionResponse> => {
    const cleanParams: Record<string, any> = {
      section: query?.section ?? 'ALL',
      withinDays: typeof query?.withinDays === 'number' ? query.withinDays : 60,
      limit: typeof query?.limit === 'number' ? query.limit : 30,
    };
    const trimmedBefore = query?.before?.trim();
    if (trimmedBefore) {
      cleanParams.before = trimmedBefore;
    }
    if (query?.today?.trim()) {
      cleanParams.today = query.today.trim();
    }

    return withHomeApiLog(
      'GET /home/needs-attention',
      { params: cleanParams },
      async () => {
        const res = await apiClient.get<ListNeedsAttentionResponse>(
          API_ROUTES.HOME_NEEDS_ATTENTION,
          { params: cleanParams }
        );
        return res.data;
      }
    );
  },
};

export default homeServices;
