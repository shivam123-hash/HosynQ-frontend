import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import listsServices, {
  ListSummaryData,
  ListDetailData,
  CreateListPayload,
  UpdateListPayload,
  AddListItemsPayload,
  UpdateListItemPayload,
  ListSuggestionItem,
} from '../../../services/listsServices';

export interface ListsState {
  lists: ListSummaryData[];
  selectedList: ListDetailData | null;
  suggestions: ListSuggestionItem[];
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUUID = (id?: string | null): boolean => {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
};

const initialState: ListsState = {
  lists: [],
  selectedList: null,
  suggestions: [],
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
};

/** 1. Fetch Lists (GET /api/v1/lists) */
export const fetchListsThunk = createAsyncThunk<
  ListSummaryData[],
  boolean | undefined,
  { rejectValue: string }
>('lists/fetchLists', async (archived = false, { rejectWithValue }) => {
  try {
    console.log('[fetchLists API] Fetching lists, archived:', archived);
    const res = await listsServices.listLists(archived);
    console.log('[fetchLists API] Success Response:', res);
    return res.lists;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to fetch lists.';
    console.log('[fetchLists API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchLists = fetchListsThunk;

/** 2. Fetch Single List Detail (GET /api/v1/lists/:id) */
export const fetchListDetailThunk = createAsyncThunk<
  ListDetailData,
  { listId: string },
  { rejectValue: string }
>('lists/fetchListDetail', async ({ listId }, { rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    console.log('[fetchListDetail API] Fetching list detail for:', listId);
    const res = await listsServices.getList(listId);
    console.log('[fetchListDetail API] Success Response:', res);
    return res.list;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to fetch list detail.';
    console.log('[fetchListDetail API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchListDetail = fetchListDetailThunk;

/** 3. Create List (POST /api/v1/lists) */
export const createListThunk = createAsyncThunk<
  ListDetailData,
  CreateListPayload,
  { rejectValue: string }
>('lists/createList', async (payload, { dispatch, rejectWithValue }) => {
  try {
    console.log('[createList API] Creating list with payload:', payload);
    const res = await listsServices.createList(payload);
    console.log('[createList API] Success Response:', res);
    dispatch(fetchListsThunk());
    return res.list;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to create list.';
    console.log('[createList API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const createList = createListThunk;

/** 4. Update List (Rename, archive, sharing) (PATCH /api/v1/lists/:id) */
export const updateListThunk = createAsyncThunk<
  ListDetailData,
  { listId: string; payload: UpdateListPayload },
  { rejectValue: string }
>('lists/updateList', async ({ listId, payload }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    console.log('[updateList API] Updating list:', listId, 'payload:', payload);
    const res = await listsServices.updateList(listId, payload);
    console.log('[updateList API] Success Response:', res);
    dispatch(fetchListsThunk());
    return res.list;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to update list.';
    console.log('[updateList API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const updateList = updateListThunk;

/** 5. Delete List (DELETE /api/v1/lists/:id) */
export const deleteListThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('lists/deleteList', async (listId, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    console.log('[deleteList API] Deleting list:', listId);
    await listsServices.deleteList(listId);
    console.log('[deleteList API] ✅ Deleted list:', listId);
    dispatch(fetchListsThunk());
    return listId;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to delete list.';
    console.log('[deleteList API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const deleteList = deleteListThunk;

/** 6. Duplicate List (POST /api/v1/lists/:id/duplicate) */
export const duplicateListThunk = createAsyncThunk<
  ListDetailData,
  { listId: string; name?: string },
  { rejectValue: string }
>('lists/duplicateList', async ({ listId, name }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    console.log('[duplicateList API] Duplicating list:', listId, 'name:', name);
    const res = await listsServices.duplicateList(listId, name);
    console.log('[duplicateList API] Success Response:', res);
    dispatch(fetchListsThunk());
    return res.list;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to duplicate list.';
    console.log('[duplicateList API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const duplicateList = duplicateListThunk;

/** 7. Clear Done Items (POST /api/v1/lists/:id/clear-done) */
export const clearDoneThunk = createAsyncThunk<
  { listId: string; clearedCount: number },
  string,
  { rejectValue: string }
>('lists/clearDone', async (listId, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  try {
    console.log('[clearDone API] Clearing done items for list:', listId);
    const res = await listsServices.clearDone(listId);
    console.log('[clearDone API] Success Response:', res);
    dispatch(fetchListDetailThunk({ listId }));
    dispatch(fetchListsThunk());
    return { listId, clearedCount: res.clearedCount };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to clear done items.';
    console.log('[clearDone API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const clearDone = clearDoneThunk;

/** 8. Add Items (POST /api/v1/lists/:id/items) */
export const addListItemsThunk = createAsyncThunk<
  { listId: string; addedItems: any[] },
  { listId: string; payload: AddListItemsPayload },
  { rejectValue: string }
>('lists/addItems', async ({ listId, payload }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId)) {
    return rejectWithValue('Invalid list ID format (UUID expected).');
  }
  if (!payload?.items || payload.items.length === 0) {
    return rejectWithValue('add at least one item');
  }
  try {
    console.log('[addListItems API] Adding items to list:', listId, 'payload:', payload);
    const res = await listsServices.addItems(listId, payload);
    console.log('[addListItems API] Success Response:', res);
    dispatch(fetchListDetailThunk({ listId }));
    dispatch(fetchListsThunk());
    return { listId, addedItems: res.items };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to add items.';
    console.log('[addListItems API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const addListItems = addListItemsThunk;

/** 9. Update Item (PATCH /api/v1/lists/:id/items/:itemId) */
export const updateListItemThunk = createAsyncThunk<
  { listId: string; item: any },
  { listId: string; itemId: string; payload: UpdateListItemPayload },
  { rejectValue: string }
>('lists/updateItem', async ({ listId, itemId, payload }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId) || !isUUID(itemId)) {
    return rejectWithValue('Invalid list or item ID format (UUID expected).');
  }
  try {
    console.log('[updateListItem API] Updating item:', itemId, 'in list:', listId, 'payload:', payload);
    const res = await listsServices.updateItem(listId, itemId, payload);
    console.log('[updateListItem API] Success Response:', res);
    dispatch(fetchListDetailThunk({ listId }));
    dispatch(fetchListsThunk());
    return { listId, item: res.item };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to update item.';
    console.log('[updateListItem API] Error Response:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const updateListItem = updateListItemThunk;

/** 10. Toggle Item Done (Convenience wrapper around updateItem) */
export const toggleItemDoneThunk = createAsyncThunk<
  void,
  { listId: string; itemId: string; done: boolean },
  { rejectValue: string }
>('lists/toggleItemDone', async ({ listId, itemId, done }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId) || !isUUID(itemId)) {
    return rejectWithValue('Invalid list or item ID format (UUID expected).');
  }
  try {
    console.log('[toggleItemDone API] Toggling item:', itemId, 'done:', done);
    await listsServices.updateItem(listId, itemId, { done });
    dispatch(fetchListDetailThunk({ listId }));
    dispatch(fetchListsThunk());
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to toggle item.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const toggleItemDone = toggleItemDoneThunk;

/** 11. Delete Item (DELETE /api/v1/lists/:id/items/:itemId) */
export const deleteListItemThunk = createAsyncThunk<
  { listId: string; itemId: string },
  { listId: string; itemId: string },
  { rejectValue: string }
>('lists/deleteItem', async ({ listId, itemId }, { dispatch, rejectWithValue }) => {
  if (!isUUID(listId) || !isUUID(itemId)) {
    return rejectWithValue('Invalid list or item ID format (UUID expected).');
  }
  try {
    console.log('[deleteListItem API] Deleting item:', itemId, 'from list:', listId);
    await listsServices.deleteItem(listId, itemId);
    console.log('[deleteListItem API] ✅ Item deleted');
    dispatch(fetchListDetailThunk({ listId }));
    dispatch(fetchListsThunk());
    return { listId, itemId };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to delete item.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const deleteListItem = deleteListItemThunk;

/** 12. Fetch Suggestions (GET /api/v1/lists/:id/suggestions) */
export const fetchListSuggestionsThunk = createAsyncThunk<
  ListSuggestionItem[],
  { listId: string; q?: string; limit?: number },
  { rejectValue: string }
>('lists/fetchSuggestions', async ({ listId, q, limit }, { rejectWithValue }) => {
  try {
    const res = await listsServices.getSuggestions(listId, q, limit);
    return res.suggestions;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to fetch suggestions.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchListSuggestions = fetchListSuggestionsThunk;

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearSelectedList: (state) => {
      state.selectedList = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    // fetchLists
    builder
      .addCase(fetchListsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchListsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchListDetail
    builder
      .addCase(fetchListDetailThunk.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchListDetailThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedList = action.payload;
      })
      .addCase(fetchListDetailThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    // createList
    builder
      .addCase(createListThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createListThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedList = action.payload;
      })
      .addCase(createListThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // updateList
    builder
      .addCase(updateListThunk.fulfilled, (state, action) => {
        state.selectedList = action.payload;
      });

    // deleteList
    builder
      .addCase(deleteListThunk.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l.id !== action.payload);
        if (state.selectedList?.id === action.payload) {
          state.selectedList = null;
        }
      });

    // duplicateList
    builder
      .addCase(duplicateListThunk.fulfilled, (state, action) => {
        state.selectedList = action.payload;
      });

    // fetchSuggestions
    builder
      .addCase(fetchListSuggestionsThunk.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const { clearSelectedList, clearSuggestions } = listsSlice.actions;
export default listsSlice.reducer;
