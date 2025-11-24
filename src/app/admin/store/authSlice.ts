import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;  
  }

// Thunk để lấy thông tin người dùng hiện tại từ token
export const fetchCurrentUser = createAsyncThunk <
any,              
void,             
{ rejectValue: string } 
>(
  'auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (err:any) {
      console.error("Error fetching user", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Khởi tạo state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token); 
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
        localStorage.removeItem('token');
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
