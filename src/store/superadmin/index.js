import API from "../../api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const getInitialState = () => {
    try {
        const stored = localStorage.getItem("superadmin_auth")
        if (stored) {
            const parsed = JSON.parse(stored)
            return {
                user: parsed.user || null,
                token: parsed.token || null,
                loading: false,
                error: null,
                success: false,
            }
        }
    } catch {
        // ignore parse errors
    }

    return {
        user: null,
        token: null,
        loading: false,
        error: null,
        success: false,
    }
}


const initialState = getInitialState()


export const registerSuperAdmin = createAsyncThunk(
    'superadmin/registerSuperAdmin',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/superadmin/register', formData)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to register super admin'
            )
        }
    }
)


export const loginSuperAdmin = createAsyncThunk(
    'superadmin/loginSuperAdmin',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/superadmin/login', formData)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to login'
            )
        }
    }
)


const superadminSlice = createSlice({
    name: 'superadmin',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null
            state.success = false
            localStorage.removeItem("superadmin_auth")
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerSuperAdmin.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(registerSuperAdmin.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.user = action.payload?.data?.user || null
                state.token = action.payload?.data?.token || null
                if (action.payload?.data?.token) {
                    localStorage.setItem("superadmin_auth", JSON.stringify({
                        user: state.user,
                        token: action.payload.data.token,
                    }))
                }
            })
            .addCase(registerSuperAdmin.rejected, (state, action) => {
                state.loading = false
                state.success = false
                state.error = action.payload
            })

            .addCase(loginSuperAdmin.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginSuperAdmin.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload?.data?.user || null
                state.token = action.payload?.data?.token || null
                if (action.payload?.data?.token) {
                    localStorage.setItem("superadmin_auth", JSON.stringify({
                        user: state.user,
                        token: action.payload.data.token,
                    }))
                }
            })
            .addCase(loginSuperAdmin.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})


export const { logout, clearError } = superadminSlice.actions

export default superadminSlice.reducer
