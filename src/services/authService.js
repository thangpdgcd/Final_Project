import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  // Keep runtime error explicit in dev; production should always set env.

  globalThis?.console?.warn?.(
    'Missing VITE_API_URL. Google login will fail without backend URL.',
  )
}

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const authService = {
  googleLogin: async (token) => {
    if (!token) throw new Error('Missing Google token')

    const post = async (body) => {
      const { data } = await http.post('/api/auth/google', body)
      return data
    }

    // Different backends expect different field names; try the common ones.
    let data
    try {
      data = await post({ token })
    } catch (e) {
      const status = e?.response?.status
      // Only retry on validation-type errors.
      if (status !== 400 && status !== 401 && status !== 422) throw e
      try {
        data = await post({ id_token: token })
      } catch (e2) {
        const status2 = e2?.response?.status
        if (status2 !== 400 && status2 !== 401 && status2 !== 422) throw e2
        data = await post({ credential: token, token, id_token: token })
      }
    }

    // Backend uses sendSuccess: { success, message, data: { accessToken, token, user } }
    const payload = data && typeof data === 'object' && 'data' in data ? data.data : data

    const accessToken = payload?.accessToken ?? payload?.token ?? payload?.jwt
    if (!accessToken) throw new Error('Invalid login response: missing JWT')

    return {
      accessToken,
      user: payload?.user ?? null,
      raw: data,
    }
  },
}

