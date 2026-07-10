import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchSubjects = createAsyncThunk(
    'subject/fetchSubjects',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/subjects');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load subjects');
        }
    }
);

export const addSubject = createAsyncThunk(
    'subject/addSubject',
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/subjects', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add subject');
        }
    }
);

export const updateSubject = createAsyncThunk(
    'subject/updateSubject',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/subjects/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
        }
    }
);

export const deleteSubject = createAsyncThunk(
    'subject/deleteSubject',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/school/manage/subjects/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
        }
    }
);

const initialState = { items: [], loading: false, error: null, success: false };

const subjectSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {
        clearSubjectError: (state) => { state.error = null; },
        resetSubjectSuccess: (state) => { state.success = false; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubjects.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSubjects.fulfilled, (state, action) => { state.loading = false; state.items = action.payload?.data || []; })
            .addCase(fetchSubjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addSubject.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(addSubject.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = [action.payload.data, ...state.items]; })
            .addCase(addSubject.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(updateSubject.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateSubject.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = state.items.map((i) => i._id === action.payload.data._id ? action.payload.data : i); })
            .addCase(updateSubject.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(deleteSubject.fulfilled, (state, action) => { state.items = state.items.filter((i) => i._id !== action.payload.id); });
    },
});

export const { clearSubjectError, resetSubjectSuccess } = subjectSlice.actions;
export default subjectSlice.reducer;
