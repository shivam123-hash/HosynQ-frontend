import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import vaultServices, {
  CreateVaultItemPayload,
  ListVaultItemsQuery,
  UpdateVaultItemPayload,
  VaultHomeResponse,
  VaultItemApi,
  VaultLifeProfileDocsResponse,
  VaultScanDocumentResponse,
} from '../../../services/vaultServices';
import { isUUID } from '../lists/listsSlice';

export interface VaultState {
  home: VaultHomeResponse | null;
  lifeProfileDocs: VaultLifeProfileDocsResponse | null;
  items: VaultItemApi[];
  selectedItem: VaultItemApi | null;
  lastScan: VaultScanDocumentResponse | null;
  hasLoadedHome: boolean;
  hasLoadedLifeProfileDocs: boolean;
  hasLoadedItems: boolean;
  loadingHome: boolean;
  loadingLifeProfileDocs: boolean;
  loadingItems: boolean;
  loadingDetail: boolean;
  scanningDocument: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: VaultState = {
  home: null,
  lifeProfileDocs: null,
  items: [],
  selectedItem: null,
  lastScan: null,
  hasLoadedHome: false,
  hasLoadedLifeProfileDocs: false,
  hasLoadedItems: false,
  loadingHome: false,
  loadingLifeProfileDocs: false,
  loadingItems: false,
  loadingDetail: false,
  scanningDocument: false,
  submitting: false,
  error: null,
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message || err?.message || fallback;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
};

/** 1. Vault home */
export const fetchVaultHomeThunk = createAsyncThunk<
  VaultHomeResponse,
  number | undefined,
  { rejectValue: string }
>('vault/fetchHome', async (withinDays = 30, { rejectWithValue }) => {
  try {
    return await vaultServices.getVaultHome(withinDays);
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load Family Vault.'));
  }
});

/** 2. Life Profile documents in Vault */
export const fetchVaultLifeProfileDocsThunk = createAsyncThunk<
  VaultLifeProfileDocsResponse,
  { type?: string; memberId?: string } | undefined,
  { rejectValue: string }
>('vault/fetchLifeProfileDocs', async (params, { rejectWithValue }) => {
  try {
    return await vaultServices.getLifeProfileDocuments(params);
  } catch (err: any) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to load Life Profile documents.')
    );
  }
});

/** 3. Scan / upload file (returns scanId for 30-min holding pipeline) */
export const scanVaultDocumentThunk = createAsyncThunk<
  VaultScanDocumentResponse,
  { memberId: string; formData: FormData },
  { rejectValue: string }
>('vault/scanDocument', async ({ memberId, formData }, { rejectWithValue }) => {
  if (!isUUID(memberId)) {
    return rejectWithValue('Invalid family member ID.');
  }
  try {
    return await vaultServices.scanDocument(memberId, formData);
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to scan document.'));
  }
});

/** 4 & 9. Create Vault item or Asset */
export const createVaultItemThunk = createAsyncThunk<
  VaultItemApi,
  CreateVaultItemPayload,
  { rejectValue: string }
>('vault/createItem', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await vaultServices.createVaultItem(payload);
    dispatch(fetchVaultHomeThunk(30));
    return res.item;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to save Vault item.'));
  }
});

/** 5. List / filter / search Vault items */
export const fetchVaultItemsThunk = createAsyncThunk<
  VaultItemApi[],
  ListVaultItemsQuery | undefined,
  { rejectValue: string }
>('vault/fetchItems', async (params, { rejectWithValue }) => {
  try {
    const res = await vaultServices.listVaultItems(params);
    return res.items || [];
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load Vault items.'));
  }
});

/** 6. Get Vault item detail */
export const fetchVaultItemDetailThunk = createAsyncThunk<
  VaultItemApi,
  string,
  { rejectValue: string }
>('vault/fetchDetail', async (id, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid Vault item ID.');
  }
  try {
    const res = await vaultServices.getVaultItemDetail(id);
    return res.item;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Vault item not found.'));
  }
});

/** 7. Edit / mark paid / renew Vault item */
export const updateVaultItemThunk = createAsyncThunk<
  VaultItemApi,
  { id: string; payload: UpdateVaultItemPayload },
  { rejectValue: string }
>('vault/updateItem', async ({ id, payload }, { dispatch, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid Vault item ID.');
  }
  try {
    const res = await vaultServices.updateVaultItem(id, payload);
    dispatch(fetchVaultHomeThunk(30));
    return res.item;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update Vault item.'));
  }
});

/** 8. Delete Vault item */
export const deleteVaultItemThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('vault/deleteItem', async (id, { dispatch, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid Vault item ID.');
  }
  try {
    await vaultServices.deleteVaultItem(id);
    dispatch(fetchVaultHomeThunk(30));
    return id;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove Vault item.'));
  }
});

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    clearVaultError: (state) => {
      state.error = null;
    },
    clearLastVaultScan: (state) => {
      state.lastScan = null;
    },
    setSelectedVaultItemLocal: (
      state,
      action: PayloadAction<VaultItemApi | null>
    ) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Vault Home
      .addCase(fetchVaultHomeThunk.pending, (state) => {
        state.loadingHome = true;
        state.error = null;
      })
      .addCase(fetchVaultHomeThunk.fulfilled, (state, action) => {
        state.loadingHome = false;
        state.hasLoadedHome = true;
        state.home = action.payload;
      })
      .addCase(fetchVaultHomeThunk.rejected, (state, action) => {
        state.loadingHome = false;
        state.hasLoadedHome = true;
        state.error = action.payload || 'Failed to load Family Vault.';
      })

      // 2. Life Profile documents in Vault
      .addCase(fetchVaultLifeProfileDocsThunk.pending, (state) => {
        state.loadingLifeProfileDocs = true;
        state.error = null;
      })
      .addCase(fetchVaultLifeProfileDocsThunk.fulfilled, (state, action) => {
        state.loadingLifeProfileDocs = false;
        state.hasLoadedLifeProfileDocs = true;
        state.lifeProfileDocs = action.payload;
      })
      .addCase(fetchVaultLifeProfileDocsThunk.rejected, (state, action) => {
        state.loadingLifeProfileDocs = false;
        state.hasLoadedLifeProfileDocs = true;
        state.error = action.payload || 'Failed to load Life Profile documents.';
      })

      // 3. Scan document
      .addCase(scanVaultDocumentThunk.pending, (state) => {
        state.scanningDocument = true;
        state.error = null;
      })
      .addCase(scanVaultDocumentThunk.fulfilled, (state, action) => {
        state.scanningDocument = false;
        state.lastScan = action.payload;
      })
      .addCase(scanVaultDocumentThunk.rejected, (state, action) => {
        state.scanningDocument = false;
        state.error = action.payload || 'Failed to scan document.';
      })

      // 4 & 9. Create item
      .addCase(createVaultItemThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createVaultItemThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastScan = null;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createVaultItemThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to save Vault item.';
      })

      // 5. List / filter items
      .addCase(fetchVaultItemsThunk.pending, (state) => {
        state.loadingItems = true;
        state.error = null;
      })
      .addCase(fetchVaultItemsThunk.fulfilled, (state, action) => {
        state.loadingItems = false;
        state.hasLoadedItems = true;
        state.items = action.payload;
      })
      .addCase(fetchVaultItemsThunk.rejected, (state, action) => {
        state.loadingItems = false;
        state.hasLoadedItems = true;
        state.error = action.payload || 'Failed to load Vault items.';
      })

      // 6. Item detail
      .addCase(fetchVaultItemDetailThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchVaultItemDetailThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchVaultItemDetailThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload || 'Vault item not found.';
      })

      // 7. Update item
      .addCase(updateVaultItemThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateVaultItemThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastScan = null;
        if (action.payload) {
          state.selectedItem = action.payload;
          state.items = state.items.map((it) =>
            it.id === action.payload.id ? action.payload : it
          );
        }
      })
      .addCase(updateVaultItemThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update Vault item.';
      })

      // 8. Delete item
      .addCase(deleteVaultItemThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteVaultItemThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = state.items.filter((it) => it.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteVaultItemThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to remove Vault item.';
      });
  },
});

export const { clearVaultError, clearLastVaultScan, setSelectedVaultItemLocal } =
  vaultSlice.actions;
export default vaultSlice.reducer;
