import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface CreateMedicineRequest {
  name: string;
  purpose?: string;
  type?: string;
  doseAmount?: number;
  doseUnit?: string;
  strength?: string;
  foodTiming?: string;
}

export interface MedicineDoseItem {
  label?: string;
  timeOfDay: string;
  foodNote?: string;
}

export interface UpdateMedicineRequest {
  name?: string;
  purpose?: string;
  type?: string;
  doseAmount?: number;
  doseUnit?: string;
  strength?: string;
  foodTiming?: string;
  frequency?: string;
  daysOfWeek?: string[];
  timesPerDay?: number;
  doses?: MedicineDoseItem[];
  startsOn?: string;
  endsOn?: string | null;
  unitsLeft?: number;
  remindAtEachDose?: boolean;
  missedDoseAfterMin?: number;
  missedDoseTellMemberId?: string;
  reorderWhenDaysLeft?: number;
}

export const medicineServices = {
  /**
   * POST /api/v1/family/members/:memberId/medicines
   * Step 1: Add medicine details
   */
  createMedicine: async (memberId: string, payload: CreateMedicineRequest) => {
    try {
      const url = API_ROUTES.FAMILY_MEMBER_MEDICINES(memberId);
      console.log(`[Medicine Service] POST ${url}`, JSON.stringify(payload, null, 2));
      const response = await apiClient.post(url, payload);
      console.log(`[Medicine Service] POST Success:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log(`[Medicine Service] POST Error:`, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error?.response?.data || error;
    }
  },

  /**
   * PATCH /api/v1/family/medicines/:medicineId
   * Step 2: Set times, frequency, doses & reminders
   */
  updateMedicine: async (medicineId: string, payload: UpdateMedicineRequest) => {
    try {
      const url = API_ROUTES.FAMILY_MEDICINE_BY_ID(medicineId);
      console.log(`[Medicine Service] PATCH ${url}`, JSON.stringify(payload, null, 2));
      const response = await apiClient.patch(url, payload);
      console.log(`[Medicine Service] PATCH Success:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log(`[Medicine Service] PATCH Error:`, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error?.response?.data || error;
    }
  },

  /**
   * GET /api/v1/family/members/:memberId/medicines
   * Fetches full list of medicines and schedule for member
   */
  listMedicines: async (memberId: string) => {
    try {
      const url = API_ROUTES.FAMILY_MEMBER_MEDICINES(memberId);
      console.log(`[Medicine Service] GET ${url}`);
      const response = await apiClient.get(url);
      console.log(`[Medicine Service] GET Success:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log(`[Medicine Service] GET Error:`, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error?.response?.data || error;
    }
  },

  /**
   * GET /api/v1/family/medicines/:medicineId
   */
  getMedicine: async (medicineId: string) => {
    try {
      const url = API_ROUTES.FAMILY_MEDICINE_BY_ID(medicineId);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  /**
   * DELETE /api/v1/family/medicines/:medicineId
   */
  deleteMedicine: async (medicineId: string) => {
    try {
      const url = API_ROUTES.FAMILY_MEDICINE_BY_ID(medicineId);
      console.log(`[Medicine Service] DELETE ${url}`);
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error: any) {
      console.log(`[Medicine Service] DELETE Error:`, error);
      throw error?.response?.data || error;
    }
  },
};

export default medicineServices;

