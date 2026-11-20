import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  medicineServices,
  CreateMedicineRequest,
  UpdateMedicineRequest,
} from '../../../services/medicineServices';

export interface MedicineSlot {
  id?: string;
  label?: string;
  timeOfDay: string;
  foodNote?: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  purpose?: string;
  type?: string;
  doseAmount?: number;
  doseUnit?: string;
  strength?: string;
  foodTiming?: string;
  frequency?: string;
  daysOfWeek?: string[];
  timesPerDay?: number;
  doses?: MedicineSlot[];
  startsOn?: string;
  endsOn?: string | null;
  unitsLeft?: number;
  daysLeft?: number | null;
  needsReorder?: boolean;
  scheduleComplete?: boolean;
}

export interface MedicineState {
  medicines: MedicineItem[];
  currentMedicine: MedicineItem | null;
  isLoading: boolean;
  isSaving: boolean;
  error: any | null;
}

const initialState: MedicineState = {
  medicines: [],
  currentMedicine: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const createMedicineThunk = createAsyncThunk(
  'medicine/createMedicine',
  async (
    { memberId, payload }: { memberId: string; payload: CreateMedicineRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await medicineServices.createMedicine(memberId, payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const updateMedicineThunk = createAsyncThunk(
  'medicine/updateMedicine',
  async (
    {
      medicineId,
      payload,
    }: { medicineId: string; payload: UpdateMedicineRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await medicineServices.updateMedicine(medicineId, payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const fetchMedicinesThunk = createAsyncThunk(
  'medicine/fetchMedicines',
  async ({ memberId }: { memberId: string }, { rejectWithValue }) => {
    try {
      const response = await medicineServices.listMedicines(memberId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const getMedicineThunk = createAsyncThunk(
  'medicine/getMedicine',
  async ({ medicineId }: { medicineId: string }, { rejectWithValue }) => {
    try {
      const response = await medicineServices.getMedicine(medicineId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const deleteMedicineThunk = createAsyncThunk(
  'medicine/deleteMedicine',
  async ({ medicineId }: { medicineId: string }, { rejectWithValue }) => {
    try {
      const response = await medicineServices.deleteMedicine(medicineId);
      return { medicineId, response };
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

const medicineSlice = createSlice({
  name: 'medicine',
  initialState,
  reducers: {
    clearCurrentMedicine: (state) => {
      state.currentMedicine = null;
    },
    clearMedicineError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Create Medicine (Step 1)
    builder
      .addCase(createMedicineThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createMedicineThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        const newMed = action.payload?.medicine;
        if (newMed) {
          state.currentMedicine = newMed;
          // Append or update in list
          const idx = state.medicines.findIndex((m) => m.id === newMed.id);
          if (idx >= 0) {
            state.medicines[idx] = newMed;
          } else {
            state.medicines.push(newMed);
          }
        }
      })
      .addCase(createMedicineThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || action.error;
      });

    // 2. Update Medicine (Step 2 - Schedule)
    builder
      .addCase(updateMedicineThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateMedicineThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        const updated = action.payload?.medicine;
        if (updated) {
          state.currentMedicine = updated;
          const idx = state.medicines.findIndex((m) => m.id === updated.id);
          if (idx >= 0) {
            state.medicines[idx] = updated;
          } else {
            state.medicines.push(updated);
          }
        }
      })
      .addCase(updateMedicineThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || action.error;
      });

    // 3. Fetch Medicines List
    builder
      .addCase(fetchMedicinesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicinesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicines = action.payload?.medicines || [];
      })
      .addCase(fetchMedicinesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
      });

    // 4. Delete Medicine
    builder
      .addCase(deleteMedicineThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteMedicineThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        const id = action.payload.medicineId;
        state.medicines = state.medicines.filter((m) => m.id !== id);
        if (state.currentMedicine?.id === id) {
          state.currentMedicine = null;
        }
      })
      .addCase(deleteMedicineThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || action.error;
      });

    // 5. Get Single Medicine Detail
    builder
      .addCase(getMedicineThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMedicineThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMedicine = action.payload?.medicine || null;
      })
      .addCase(getMedicineThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearCurrentMedicine, clearMedicineError } =
  medicineSlice.actions;

export default medicineSlice.reducer;

