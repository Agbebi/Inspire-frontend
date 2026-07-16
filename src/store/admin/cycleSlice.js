import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchCycles = createAsyncThunk(
    'cycle/fetchCycles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/cycles');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load academic cycles');
        }
    }
);

export const fetchCurrentCycle = createAsyncThunk(
    'cycle/fetchCurrentCycle',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/cycles/current');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load current cycle');
        }
    }
);

export const addCycle = createAsyncThunk(
    'cycle/addCycle',
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/cycles', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add cycle');
        }
    }
);

export const updateCycle = createAsyncThunk(
    'cycle/updateCycle',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/cycles/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update cycle');
        }
    }
);

export const deleteCycle = createAsyncThunk(
    'cycle/deleteCycle',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/school/manage/cycles/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete cycle');
        }
    }
);

export const publishCycle = createAsyncThunk(
    'cycle/publishCycle',
    async ({ id, isPublished }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/cycles/${id}/publish`, { isPublished });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to publish results');
        }
    }
);

export const startNextTerm = createAsyncThunk(
    'cycle/startNextTerm',
    async ({ currentCycleId, startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/cycles/next-term', {
                currentCycleId,
                startDate,
                endDate,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start next term');
        }
    }
);

export const startNewSession = createAsyncThunk(
    'cycle/startNewSession',
    async ({ newSession, startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/cycles/new-session', {
                newSession,
                startDate,
                endDate,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start new session');
        }
    }
);

const initialState = {
    items: [],
    currentCycle: null,
    loading: false,
    error: null,
    success: false,
    resultsLocked: false,
};

const cycleSlice = createSlice({
    name: 'cycle',
    initialState,
    reducers: {
        clearCycleError: (state) => { state.error = null; },
        resetCycleSuccess: (state) => { state.success = false; },
        setSelectedCycle: (state, action) => { state.selectedCycleId = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCycles.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCycles.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload?.data?.cycles || [];
                state.resultsLocked = action.payload?.data?.resultsLocked || false;
                if (!state.selectedCycleId && state.items.length > 0) {
                    const current = state.items.find((c) => c.isCurrent);
                    state.selectedCycleId = (current || state.items[0])._id;
                }
            })
            .addCase(fetchCycles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchCurrentCycle.fulfilled, (state, action) => {
                state.currentCycle = action.payload?.data || null;
            })

            .addCase(addCycle.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(addCycle.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items = [...state.items, action.payload.data];
            })
            .addCase(addCycle.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(updateCycle.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateCycle.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items = state.items.map((c) => c._id === action.payload.data._id ? action.payload.data : c);
            })
            .addCase(updateCycle.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(deleteCycle.fulfilled, (state, action) => {
                state.items = state.items.filter((c) => c._id !== action.payload.id);
            })

            .addCase(publishCycle.fulfilled, (state, action) => {
                state.items = state.items.map((c) => c._id === action.payload.data._id ? action.payload.data : c);
            })
            .addCase(publishCycle.rejected, (state, action) => { state.error = action.payload; })

            .addCase(startNextTerm.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items = [...state.items, action.payload.data];
            })
            .addCase(startNextTerm.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            })

            .addCase(startNewSession.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items = [...state.items, action.payload.data];
            })
            .addCase(startNewSession.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { clearCycleError, resetCycleSuccess, setSelectedCycle } = cycleSlice.actions;
export default cycleSlice.reducer;
