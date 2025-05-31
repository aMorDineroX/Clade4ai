import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Drone, PaginatedResponse } from '../../types';
import { dronesAPI } from '../../config/api';

interface DroneState {
  drones: Drone[];
  currentDrone: Drone | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: {
    category?: string;
    priceRange?: [number, number];
    brand?: string;
    search?: string;
  };
}

const initialState: DroneState = {
  drones: [],
  currentDrone: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
  filters: {},
};

// Async thunks
export const fetchDrones = createAsyncThunk(
  'drones/fetchDrones',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    inStock?: boolean;
  }) => {
    try {
      const response: any = await dronesAPI.getAll(params);

      // Adapter la réponse de l'API au format attendu par le store
      const apiData = response.data || {};
      const pagination = apiData.pagination || {};

      return {
        data: apiData.drones || [],
        total: pagination.totalItems || 0,
        page: pagination.currentPage || 1,
        limit: pagination.itemsPerPage || 10,
        totalPages: pagination.totalPages || 0,
      } as PaginatedResponse<Drone>;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des drones');
    }
  }
);

export const fetchDroneById = createAsyncThunk(
  'drones/fetchDroneById',
  async (id: string) => {
    try {
      const response: any = await dronesAPI.getById(id);
      const apiData = response.data || {};
      return apiData.drone || null;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du drone');
    }
  }
);

const droneSlice = createSlice({
  name: 'drones',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DroneState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrones.fulfilled, (state, action) => {
        state.loading = false;
        state.drones = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDrones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des drones';
      })
      .addCase(fetchDroneById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDroneById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDrone = action.payload || null;
      })
      .addCase(fetchDroneById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement du drone';
      });
  },
});

export const { setFilters, clearFilters, setPage } = droneSlice.actions;
export default droneSlice.reducer;