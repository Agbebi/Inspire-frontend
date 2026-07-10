import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchStudents = createAsyncThunk(
    'student/fetchStudents',
    async (q, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/school/manage/students', { params: q ? { q } : {} });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load students');
        }
    }
);

export const addStudent = createAsyncThunk(
    'student/addStudent',
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/school/manage/students', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add student');
        }
    }
);

export const updateStudent = createAsyncThunk(
    'student/updateStudent',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/school/manage/students/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update student');
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'student/deleteStudent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/school/manage/students/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
        }
    }
);

const initialState = { items: [], loading: false, error: null, success: false };

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        clearStudentError: (state) => { state.error = null; },
        resetStudentSuccess: (state) => { state.success = false; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchStudents.fulfilled, (state, action) => { state.loading = false; state.items = action.payload?.data || []; })
            .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addStudent.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(addStudent.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = [action.payload.data, ...state.items]; })
            .addCase(addStudent.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(updateStudent.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateStudent.fulfilled, (state, action) => { state.loading = false; state.success = true; state.items = state.items.map((i) => i._id === action.payload.data._id ? action.payload.data : i); })
            .addCase(updateStudent.rejected, (state, action) => { state.loading = false; state.success = false; state.error = action.payload; })

            .addCase(deleteStudent.fulfilled, (state, action) => { state.items = state.items.filter((i) => i._id !== action.payload.id); });
    },
});

export const { clearStudentError, resetStudentSuccess } = studentSlice.actions;
export default studentSlice.reducer;
