import axios from 'axios';

// Ek naya axios instance banayein jo .env file se base URL lega
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// YEH SABSE ZAROORI HISSA HAI (Interceptor)
// Yeh function har API request bhejne se pehle chalta hai.
api.interceptors.request.use(
  (config) => {
    // Yeh localStorage se sabse naya token uthata hai.
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aur use request ke headers mein jod deta hai.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yeh function har API response aane ke baad chalta hai.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Agar server kehta hai ki token galat hai (401 error),
    // to user ko automatically logout karke login page par bhej do.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;