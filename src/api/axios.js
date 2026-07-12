import axios from "axios";

const devUrl = 'https://inspire-backend-production.up.railway.app'
// const devUrl = 'http://localhost:3000'

const API = axios.create({
    baseURL : devUrl,
    headers : {
        'Content-Type' : 'application/json',
    },
})

// Remove default Content-Type for FormData requests
API.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    try {
        const raw = localStorage.getItem('school_auth');
        if (raw) {
            const { token } = JSON.parse(raw);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch {
        // ignore invalid stored auth
    }
    return config;
});


export default API