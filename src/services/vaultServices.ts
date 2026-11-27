import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';
import lifeProfileServices from './lifeProfileServices';

export type VaultVisibility = 'ADULTS' | 'EVERYONE' | 'ONLY_ME';

export type VaultCategory =
  | 'DOCUMENTS'
  | 'INSURANCE'
  | 'WARRANTIES_BILLS'
  | 'HOME_ASSETS'
  | 'CONTACTS'
  | 'ASSET'
  | 'PROPERTY'
  | 'FINANCE'
  | 'IDENTITY'
  | 'UTILITIES'
  | 'MEDICAL'
  | 'WARRANTY'
  | 'LEGAL'
  | 'SCANS'
  | string;

export interface VaultCategoryCountApi {
  category: VaultCategory;
  count: number;
}

export interface VaultLifeProfileDocSummary {
  id: string;
  memberId?: string;
  memberName?: string;
  ownerName?: string;
  type: string;
  title?: string;
  number?: string | null;
  issuedOn?: string | null;
  expiresOn?: string | null;
  isExpired?: boolean;
  daysRemaining?: number | null;
  hasFile?: boolean;
  fileUrl?: string | null;
}

export interface VaultItemApi {
  id: string;
  category: VaultCategory;
  title: string;
  kind?: string | null;
  provider?: string | null;
  role?: string | null;
  number?: string | null;
  numberLast4?: string | null;
  phone?: string | null;
  hours?: string | null;
  amount?: number | null;
  sumInsured?: number | null;
  repeatMonths?: number | null;
  issuedOn?: string | null;
  dueOn?: string | null;
  dueLabel?: string | null;
  serviceDueOn?: string | null;
  paidOn?: string | null;
  daysRemaining?: number | null;
  daysLeft?: number | null;
  serviceDaysLeft?: number | null;
  hasFile?: boolean;
  fileName?: string | null;
  fileFormat?: string | null;
  filePages?: number | null;
  fileUrl?: string | null;
  backFileName?: string | null;
  backFileUrl?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  member?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  } | null;
  addedByMemberId?: string | null;
  addedByName?: string | null;
  addedBy?: {
    id: string;
    fullName: string;
  } | null;
  coveredMemberIds?: string[];
  coveredMembers?: Array<{ memberId: string; fullName: string; avatarColor?: string | null }>;
  assetId?: string | null;
  asset?: { id: string; title: string; kind?: string | null; number?: string | null } | null;
  linkedItems?: VaultItemApi[];
  notes?: string | null;
  hasExpiry?: boolean;
  reminderLeadDays?: number[];
  remindMemberIds?: string[];
  visibility: VaultVisibility;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaultHomeResponse {
  success: boolean;
  familySize: number;
  categories: VaultCategoryCountApi[];
  lifeProfileDocuments: VaultLifeProfileDocSummary[];
  overdue: VaultItemApi[];
  upcoming: VaultItemApi[];
  recent: VaultItemApi[];
}

export interface VaultLifeProfileDocsResponse {
  success: boolean;
  familySize: number;
  groups: Array<{
    type: string;
    label: string;
    count: number;
  }>;
  documents: VaultLifeProfileDocSummary[];
}

export interface VaultScanDocumentResponse {
  success: boolean;
  scanId: string;
  fileFormat?: string;
  pages?: number;
  extracted?: {
    title?: string;
    provider?: string;
    number?: string;
    amount?: number;
    issuedOn?: string;
    dueOn?: string;
  };
}

export interface CreateVaultItemPayload {
  category: VaultCategory;
  title: string;
  kind?: string | null;
  provider?: string | null;
  role?: string | null;
  number?: string | null;
  phone?: string | null;
  hours?: string | null;
  amount?: number | null;
  sumInsured?: number | null;
  repeatMonths?: number | null;
  issuedOn?: string | null;
  dueOn?: string | null;
  dueLabel?: string | null;
  serviceDueOn?: string | null;
  paidOn?: string | null;
  scanId?: string;
  memberId?: string | null;
  coveredMemberIds?: string[];
  assetId?: string | null;
  notes?: string | null;
  hasExpiry?: boolean;
  reminderLeadDays?: number[];
  remindMemberIds?: string[];
  visibility: VaultVisibility;
}

export interface UpdateVaultItemPayload {
  title?: string;
  kind?: string | null;
  provider?: string | null;
  role?: string | null;
  number?: string | null;
  phone?: string | null;
  hours?: string | null;
  amount?: number | null;
  sumInsured?: number | null;
  repeatMonths?: number | null;
  issuedOn?: string | null;
  dueOn?: string | null;
  dueLabel?: string | null;
  serviceDueOn?: string | null;
  paidOn?: string | null;
  scanId?: string;
  memberId?: string | null;
  coveredMemberIds?: string[];
  assetId?: string | null;
  notes?: string | null;
  hasExpiry?: boolean;
  reminderLeadDays?: number[];
  remindMemberIds?: string[];
  visibility?: VaultVisibility;
}

export interface ListVaultItemsQuery {
  category?: string;
  kind?: string;
  q?: string;
  assetId?: string;
  memberId?: string;
  hasFile?: boolean | 'true' | 'false';
}

const withVaultApiLog = async <T>(
  apiTag: string,
  requestInfo: Record<string, any> | undefined,
  executor: () => Promise<T>
): Promise<T> => {
  console.log(`[Vault API · ${apiTag}] Request:`, requestInfo ?? {});
  try {
    const res = await executor();
    console.log(`[Vault API · ${apiTag}] Success Response (raw):`, res);
    try {
      console.log(
        `[Vault API · ${apiTag}] Success Response (formatted):\n`,
        JSON.stringify(res, null, 2)
      );
    } catch {
      // ignore circular serialization errors
    }
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    console.log(`[Vault API · ${apiTag}] Error Response:`, {
      status: err?.response?.status,
      data: err?.response?.data,
      message: Array.isArray(msg) ? msg.join(', ') : msg,
      url: err?.config?.url,
    });
    throw err;
  }
};

const vaultServices = {
  /** 1. Vault home (GET /api/v1/vault?withinDays=30) */
  getVaultHome: (withinDays = 30): Promise<VaultHomeResponse> =>
    withVaultApiLog('GET /vault', { withinDays }, async () => {
      const res = await apiClient.get<VaultHomeResponse>(API_ROUTES.VAULT_HOME, {
        params: { withinDays },
      });
      return res.data;
    }),

  /** 2. Life Profile documents in Vault (GET /api/v1/vault/life-profile-documents) */
  getLifeProfileDocuments: (params?: {
    type?: string;
    memberId?: string;
  }): Promise<VaultLifeProfileDocsResponse> =>
    withVaultApiLog('GET /vault/life-profile-documents', { params }, async () => {
      const res = await apiClient.get<VaultLifeProfileDocsResponse>(
        API_ROUTES.VAULT_LIFE_PROFILE_DOCS,
        { params }
      );
      return res.data;
    }),

  /** 3. Scan / upload file (POST /api/v1/family/members/:memberId/documents/scan) */
  scanDocument: (
    memberId: string,
    formData: FormData
  ): Promise<VaultScanDocumentResponse> =>
    withVaultApiLog(
      'POST /family/members/:memberId/documents/scan',
      { memberId },
      async () => {
        const raw: any = await lifeProfileServices.scanDocument(memberId, formData);
        const scanId =
          raw?.scanId ||
          raw?.data?.scanId ||
          raw?.document?.scanId ||
          raw?.data?.document?.scanId ||
          raw?.id ||
          raw?.data?.id ||
          '';
        const extracted =
          raw?.extracted ||
          raw?.document ||
          raw?.data?.document ||
          raw?.fields ||
          raw?.data?.extracted ||
          undefined;
        return {
          success: raw?.success ?? Boolean(scanId),
          scanId,
          fileFormat: raw?.fileFormat || raw?.data?.fileFormat,
          pages: raw?.pages || raw?.data?.pages,
          extracted,
        };
      }
    ),

  /** 4 & 9. Add Vault item or Asset (POST /api/v1/vault/items) */
  createVaultItem: (
    payload: CreateVaultItemPayload
  ): Promise<{ success: boolean; item: VaultItemApi }> =>
    withVaultApiLog('POST /vault/items', { payload }, async () => {
      const res = await apiClient.post(API_ROUTES.VAULT_ITEMS, payload);
      return res.data?.item ? res.data : { success: true, item: res.data };
    }),

  /** 5. List / filter / search items (GET /api/v1/vault/items) */
  listVaultItems: (
    params?: ListVaultItemsQuery
  ): Promise<{ success: boolean; items: VaultItemApi[] }> =>
    withVaultApiLog('GET /vault/items', { params }, async () => {
      const res = await apiClient.get<{ success: boolean; items: VaultItemApi[] }>(
        API_ROUTES.VAULT_ITEMS,
        { params }
      );
      return res.data;
    }),

  /** 6. Item detail (GET /api/v1/vault/items/:id) */
  getVaultItemDetail: (
    id: string
  ): Promise<{ success: boolean; item: VaultItemApi }> =>
    withVaultApiLog('GET /vault/items/:id', { id }, async () => {
      const res = await apiClient.get(API_ROUTES.VAULT_ITEM_BY_ID(id));
      return res.data?.item ? res.data : { success: true, item: res.data };
    }),

  /** 7. Edit item (PATCH /api/v1/vault/items/:id) */
  updateVaultItem: (
    id: string,
    payload: UpdateVaultItemPayload
  ): Promise<{ success: boolean; item: VaultItemApi }> =>
    withVaultApiLog('PATCH /vault/items/:id', { id, payload }, async () => {
      const res = await apiClient.patch(API_ROUTES.VAULT_ITEM_BY_ID(id), payload);
      return res.data?.item ? res.data : { success: true, item: res.data };
    }),

  /** 8. Remove item (DELETE /api/v1/vault/items/:id) */
  deleteVaultItem: (
    id: string
  ): Promise<{ success: boolean; message: string }> =>
    withVaultApiLog('DELETE /vault/items/:id', { id }, async () => {
      const res = await apiClient.delete(API_ROUTES.VAULT_ITEM_BY_ID(id));
      return res.data;
    }),
};

export default vaultServices;
