import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchClasses = createAsyncThunk(
    'class/fetchClasses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/classes');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load classes');
        }
    }
);

export const addClass = createAsyncThunk(
    'class/addClass',
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/classes', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add class');
        }
    }
);

export const updateClass = createAsyncThunk(
    'class/updateClass',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/classes/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update class');
        }
    }
);

export const deleteClass = createAsyncThunk(
    'class/deleteClass',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/school/manage/classes/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
        }
    }
);

const initialState = { items: [], loading: false, error: null, success: false };

const classSlice = createSlice({
    name: 'class',
    initialState,
    reducers: {
        clearClassError: (state) => { state.error = null; },
        resetClassSuccess: (state) => { state.success = false; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClasses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchClasses.fulfilled, (state, action) => { state.loading = false; state.items = action.payload?.data || []; })
            .addCase(fetchClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addClass.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(addClass.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = [action.payload.data, ...state.items]; })
            .addCase(addClass.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(updateClass.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateClass.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = state.items.map((i) => i._id === action.payload.data._id ? action.payload.data : i); })
            .addCase(updateClass.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(deleteClass.fulfilled, (state, action) => { state.items = state.items.filter((i) => i._id !== action.payload.id); });
    },
});

export const { clearClassError, resetClassSuccess } = classSlice.actions;
export default classSlice.reducer;
