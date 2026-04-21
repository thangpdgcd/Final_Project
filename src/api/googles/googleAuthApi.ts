import api from '@/api/axiosInstances/axiosInstance'
import type { GoogleAuthResponse } from '@/types/auth/google.types'

const unwrapSuccessData = (raw: unknown): any => {
  if (!raw || typeof raw !== 'object') return raw
  const root = raw as any
  // common wrapper: { success, message, data }
  return 'data' in root ? root.data : root
}

export const googleAuthApi = {
  login: async (idToken: string): Promise<GoogleAuthResponse> => {
    if (!idToken) throw new Error('Missing Google token')

    const post = async (body: Record<string, unknown>) => {
      const res = await api.post('/auth/google', body)
      return res.data
    }

    // Different backends expect different field names; try the common ones.
    let data: unknown
    try {
      data = await post({ token: idToken })
    } catch (e: any) {
      const status = e?.response?.status
      if (status !== 400 && status !== 401 && status !== 422) throw e
      try {
        data = await post({ id_token: idToken })
      } catch (e2: any) {
        const status2 = e2?.response?.status
        if (status2 !== 400 && status2 !== 401 && status2 !== 422) throw e2
        data = await post({ credential: idToken, token: idToken, id_token: idToken })
      }
    }

    const payload = unwrapSuccessData(data)
    const accessToken = payload?.accessToken ?? payload?.token ?? payload?.jwt
    if (!accessToken) throw new Error('Invalid login response: missing JWT')

    return {
      accessToken: String(accessToken),
      user: payload?.user ?? null,
      raw: data,
    }
  },
}

