import API from "../../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
    schools: [],
    school: null,
    cycles: [],
    name: '',
    logoUrl: '',
    address: '',
    supportEmail: '',
    loading: false,
    error: null,
    success: false,
}


export const registerSchool = createAsyncThunk(
    'superadmin/registerSchool',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/superadmin/school/add', formData)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to register school'
            )
        }
    }
)


export const getSchools = createAsyncThunk(
    'superadmin/getSchools',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/superadmin/school')
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch schools'
            )
        }
    }
)


export const getSchool = createAsyncThunk(
    'superadmin/getSchool',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/superadmin/school/${id}`)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch school'
            )
        }
    }
)


export const editSchool = createAsyncThunk(
    'superadmin/editSchool',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/superadmin/school/${id}`, formData)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update school'
            )
        }
    }
)


export const removeSchool = createAsyncThunk(
    'superadmin/removeSchool',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/api/superadmin/school/${id}`)
            return { id, ...response.data }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to remove school'
            )
        }
    }
)

export const toggleSchoolResultsLock = createAsyncThunk(
    'superadmin/toggleSchoolResultsLock',
    async (cycleId, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/superadmin/cycles/${cycleId}/toggle-results-lock`)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle results lock'
            )
        }
    }
)

export const getSchoolCycles = createAsyncThunk(
    'superadmin/getSchoolCycles',
    async (schoolId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/superadmin/school/${schoolId}/cycles`)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch school cycles'
            )
        }
    }
)


const schoolSlice = createSlice({
    name: 'school',
    initialState,
    reducers: {
        resetSchoolState: (state) => {
            state.name = ''
            state.logoUrl = ''
            state.address = ''
            state.supportEmail = ''
            state.error = null
            state.success = false
        },
        clearSchoolError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerSchool.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(registerSchool.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.school = action.payload?.data || null
                state.schools = action.payload?.data
                    ? [action.payload.data, ...state.schools]
                    : state.schools
                state.name = action.payload?.data?.name || ''
                state.logoUrl = action.payload?.data?.logoUrl || ''
                state.address = action.payload?.data?.address || ''
                state.supportEmail = action.payload?.data?.supportEmail || ''
            })
            .addCase(registerSchool.rejected, (state, action) => {
                state.loading = false
                state.success = false
                state.error = action.payload
            })

            .addCase(getSchools.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSchools.fulfilled, (state, action) => {
                state.loading = false
                state.schools = action.payload?.data || []
            })
            .addCase(getSchools.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(getSchool.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSchool.fulfilled, (state, action) => {
                state.loading = false
                state.school = action.payload?.data || null
                state.name = action.payload?.data?.name || ''
                state.logoUrl = action.payload?.data?.logoUrl || ''
                state.address = action.payload?.data?.address || ''
                state.supportEmail = action.payload?.data?.supportEmail || ''
            })
            .addCase(getSchool.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(editSchool.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(editSchool.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.school = action.payload?.data || state.school
                state.schools = state.schools.map((item) =>
                    item._id === action.payload?.data?._id
                        ? action.payload.data
                        : item
                )
            })
            .addCase(editSchool.rejected, (state, action) => {
                state.loading = false
                state.success = false
                state.error = action.payload
            })

            .addCase(removeSchool.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(removeSchool.fulfilled, (state, action) => {
                state.loading = false
                state.schools = state.schools.filter(
                    (item) => item._id !== action.payload?.id
                )
            })
            .addCase(removeSchool.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(toggleSchoolResultsLock.fulfilled, (state, action) => {
                state.cycles = state.cycles.map((c) =>
                    c._id === action.payload?.data?._id ? action.payload.data : c
                )
            })
            .addCase(toggleSchoolResultsLock.rejected, (state, action) => {
                state.error = action.payload
            })

            .addCase(getSchoolCycles.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSchoolCycles.fulfilled, (state, action) => {
                state.loading = false
                state.cycles = action.payload?.data || []
            })
            .addCase(getSchoolCycles.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})


export const { resetSchoolState, clearSchoolError } = schoolSlice.actions

export default schoolSlice.reducer
