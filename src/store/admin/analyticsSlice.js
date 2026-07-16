import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchBroadsheet = createAsyncThunk(
    'analytics/fetchBroadsheet',
    async ({ classId, cycleId }, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/analytics/broadsheet', {
                params: { classId, cycleId },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load broadsheet');
        }
    }
);

export const fetchCumulative = createAsyncThunk(
    'analytics/fetchCumulative',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/analytics/cumulative', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load cumulative averages');
        }
    }
);

export const fetchPerformance = createAsyncThunk(
    'analytics/fetchPerformance',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/analytics/performance', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load analytics');
        }
    }
);

const initialState = {
    broadsheet: null,
    cumulative: null,
    performance: null,
    loading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalyticsError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBroadsheet.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchBroadsheet.fulfilled, (state, action) => { state.loading = false; state.broadsheet = action.payload?.data || null; })
            .addCase(fetchBroadsheet.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchCumulative.fulfilled, (state, action) => { state.cumulative = action.payload?.data || null; })

            .addCase(fetchPerformance.fulfilled, (state, action) => { state.performance = action.payload?.data || null; });
    },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
