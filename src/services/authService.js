import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  // Keep runtime error explicit in dev; production should always set env.
  // eslint-disable-next-line no-console
  console.warn('Missing VITE_API_URL. Google login will fail without backend URL.')
}

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const authService = {
  googleLogin: async (token) => {
    if (!token) throw new Error('Missing Google token')

    const { data } = await http.post('/api/auth/google', { token })

    const accessToken = data?.accessToken ?? data?.token ?? data?.jwt
    if (!accessToken) throw new Error('Invalid login response: missing JWT')

    return {
      accessToken,
      user: data?.user ?? null,
      raw: data,
    }
  },
}

