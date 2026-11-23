import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface ListMemberSummary {
  memberId: string;
  fullName: string | null;
  avatarUrl?: string | null;
  avatarColor: string | null;
}

export interface ListCounts {
  total: number;
  done: number;
  left: number;
}

export interface ListSummaryData {
  id: string;
  name: string;
  type: 'GROCERY' | 'PACKING' | 'SCHOOL' | 'PARTY' | 'CUSTOM' | string;
  sharedWithAll: boolean;
  createdBy: ListMemberSummary | null;
  members: ListMemberSummary[];
  counts: ListCounts;
  archivedAt: string | null;
  createdAt: string;
}

export interface ListItemData {
  id: string;
  name: string;
  note: string | null;
  assignedTo: ListMemberSummary | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
}

export interface ListPermissions {
  canManage: boolean;
  canAddAndTick: boolean;
  canDuplicate: boolean;
}

export interface ListDetailData extends ListSummaryData {
  items: {
    toBuy: ListItemData[];
    done: ListItemData[];
  };
  permissions: ListPermissions;
}

export interface ListListsQueryParams {
  archived?: boolean;
}

export interface ListListsResponse {
  success: boolean;
  lists: ListSummaryData[];
}

export interface CreateListPayload {
  name: string;
  type: 'GROCERY' | 'PACKING' | 'SCHOOL' | 'PARTY' | 'CUSTOM' | string;
  sharedWithAll?: boolean;
  memberIds?: string[];
}

export interface CreateListResponse {
  success: boolean;
  list: ListDetailData;
}

export interface GetListDetailResponse {
  success: boolean;
  list: ListDetailData;
}

export interface UpdateListPayload {
  name?: string;
  archived?: boolean;
  sharedWithAll?: boolean;
  memberIds?: string[];
}

export interface DeleteListResponse {
  success: boolean;
  message: string;
}

export interface ClearDoneResponse {
  success: boolean;
  clearedCount: number;
}

export interface ListSuggestionItem {
  name: string;
  note: string | null;
  timesUsed: number;
}

export interface ListSuggestionsResponse {
  success: boolean;
  suggestions: ListSuggestionItem[];
}

export interface AddListItemsPayload {
  items: Array<{
    name: string;
    note?: string | null;
  }>;
}

export interface AddListItemsResponse {
  success: boolean;
  addedCount: number;
  items: ListItemData[];
}

export interface UpdateListItemPayload {
  name?: string;
  note?: string | null;
  done?: boolean;
  assignedMemberId?: string | null;
}

export interface UpdateListItemResponse {
  success: boolean;
  item: ListItemData;
}

export interface DeleteItemResponse {
  success: boolean;
  message: string;
}

const listsServices = {
  /** 1. Fetch active lists or archived lists (GET /api/v1/lists) */
  listLists: async (archived = false): Promise<ListListsResponse> => {
    try {
      const response = await apiClient.get<ListListsResponse>(API_ROUTES.LISTS, {
        params: { archived },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 2. Create a new list (POST /api/v1/lists) */
  createList: async (payload: CreateListPayload): Promise<CreateListResponse> => {
    try {
      const response = await apiClient.post<CreateListResponse>(API_ROUTES.LISTS, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 3. Get single list detail with separated toBuy and done items (GET /api/v1/lists/:id) */
  getList: async (listId: string): Promise<GetListDetailResponse> => {
    try {
      const response = await apiClient.get<GetListDetailResponse>(API_ROUTES.LIST_BY_ID(listId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 4. Rename, archive/unarchive, or adjust sharing permissions (PATCH /api/v1/lists/:id) */
  updateList: async (
    listId: string,
    payload: UpdateListPayload
  ): Promise<GetListDetailResponse> => {
    try {
      const response = await apiClient.patch<GetListDetailResponse>(
        API_ROUTES.LIST_BY_ID(listId),
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 5. Soft delete a list (DELETE /api/v1/lists/:id) */
  deleteList: async (listId: string): Promise<DeleteListResponse> => {
    try {
      const response = await apiClient.delete<DeleteListResponse>(API_ROUTES.LIST_BY_ID(listId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 6. Duplicate list for reuse (POST /api/v1/lists/:id/duplicate) */
  duplicateList: async (listId: string, name?: string): Promise<CreateListResponse> => {
    try {
      const response = await apiClient.post<CreateListResponse>(
        API_ROUTES.LIST_DUPLICATE(listId),
        name ? { name } : {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 7. Clear completed items (POST /api/v1/lists/:id/clear-done) */
  clearDone: async (listId: string): Promise<ClearDoneResponse> => {
    try {
      const response = await apiClient.post<ClearDoneResponse>(
        API_ROUTES.LIST_CLEAR_DONE(listId),
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 8. Autocomplete suggestions from past lists of same type (GET /api/v1/lists/:id/suggestions) */
  getSuggestions: async (
    listId: string,
    q?: string,
    limit = 10
  ): Promise<ListSuggestionsResponse> => {
    try {
      const response = await apiClient.get<ListSuggestionsResponse>(
        API_ROUTES.LIST_SUGGESTIONS(listId),
        { params: { q, limit } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 9. Add one or multiple items to the list (POST /api/v1/lists/:id/items) */
  addItems: async (
    listId: string,
    payload: AddListItemsPayload
  ): Promise<AddListItemsResponse> => {
    try {
      const response = await apiClient.post<AddListItemsResponse>(
        API_ROUTES.LIST_ITEMS(listId),
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 10. Tick/untick, rename, update note or assign item (PATCH /api/v1/lists/:id/items/:itemId) */
  updateItem: async (
    listId: string,
    itemId: string,
    payload: UpdateListItemPayload
  ): Promise<UpdateListItemResponse> => {
    try {
      const response = await apiClient.patch<UpdateListItemResponse>(
        API_ROUTES.LIST_ITEM_BY_ID(listId, itemId),
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 11. Delete single item from list (DELETE /api/v1/lists/:id/items/:itemId) */
  deleteItem: async (listId: string, itemId: string): Promise<DeleteItemResponse> => {
    try {
      const response = await apiClient.delete<DeleteItemResponse>(
        API_ROUTES.LIST_ITEM_BY_ID(listId, itemId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default listsServices;
