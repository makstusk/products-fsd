import { createSlice } from '@reduxjs/toolkit'
import { readLS, writeLS } from '@shared/lib/storage'
import { STORAGE_KEYS } from '@shared/constants/storageKeys'

type AuthState = {
  isAuth: boolean
}

const initialState: AuthState = readLS<AuthState>(STORAGE_KEYS.AUTH, { isAuth: false })

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuth = true
      writeLS(STORAGE_KEYS.AUTH, state)
    },
    logout(state) {
      state.isAuth = false
      writeLS(STORAGE_KEYS.AUTH, state)
    },
  },
})

export const { login, logout } = authSlice.actions
export const authReducer = authSlice.reducer
