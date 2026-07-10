import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchTeachers = createAsyncThunk(
    'teacher/fetchTeachers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/teachers');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load teachers');
        }
    }
);

export const addTeacher = createAsyncThunk(
    'teacher/addTeacher',
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/teachers', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add teacher');
        }
    }
);

export const updateTeacher = createAsyncThunk(
    'teacher/updateTeacher',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/teachers/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update teacher');
        }
    }
);

export const deleteTeacher = createAsyncThunk(
    'teacher/deleteTeacher',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/school/manage/teachers/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete teacher');
        }
    }
);

const initialState = { items: [], loading: false, error: null, success: false };

const teacherSlice = createSlice({
    name: 'teacher',
    initialState,
    reducers: {
        clearTeacherError: (state) => { state.error = null; },
        resetTeacherSuccess: (state) => { state.success = false; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeachers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTeachers.fulfilled, (state, action) => { state.loading = false; state.items = action.payload?.data || []; })
            .addCase(fetchTeachers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addTeacher.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(addTeacher.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = [action.payload.data, ...state.items]; })
            .addCase(addTeacher.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(updateTeacher.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateTeacher.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = state.items.map((i) => i._id === action.payload.data._id ? action.payload.data : i); })
            .addCase(updateTeacher.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(deleteTeacher.fulfilled, (state, action) => { state.items = state.items.filter((i) => i._id !== action.payload.id); });
    },
});

export const { clearTeacherError, resetTeacherSuccess } = teacherSlice.actions;
export default teacherSlice.reducer;
