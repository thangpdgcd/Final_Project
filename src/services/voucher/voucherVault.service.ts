import axios from 'axios'
import type { VaultVoucher } from '@/features/voucher/store/useVoucherVaultStore'

export const voucherVaultStorageKey = 'customer_voucher_vault_v1'

export const readVoucherVaultFromStorage = (): VaultVoucher[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(voucherVaultStorageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((x) => ({
        id: String(x?.id ?? ''),
        code: String(x?.code ?? '').trim().toUpperCase(),
        message: x?.message != null ? String(x.message) : undefined,
        receivedAt: Number(x?.receivedAt ?? Date.now()),
      }))
      .filter((x) => x.id && x.code)
  } catch {
    return []
  }
}

export const writeVoucherVaultToStorage = (items: VaultVoucher[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(voucherVaultStorageKey, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export const unwrapSuccessData = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  const direct = root.data
  if (direct && typeof direct === 'object') {
    const inner = direct as Record<string, unknown>
    if ('data' in inner && inner.data && typeof inner.data === 'object') return inner.data
    return direct
  }
  return raw
}

export const pickVoucherList = (payload: unknown): unknown[] => {
  if (!payload || typeof payload !== 'object') return []
  const p = payload as any
  const candidates = [
    p?.vouchers,
    p?.items,
    p?.rows,
    p?.data?.vouchers,
    p?.data?.items,
    p?.data?.rows,
    p?.result?.vouchers,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  return []
}

export const mergeVouchersByCode = (base: VaultVoucher[], incoming: VaultVoucher[]) => {
  const map = new Map(base.map((v) => [v.code, v]))
  for (const v of incoming) {
    if (!v?.code) continue
    if (!map.has(v.code)) map.set(v.code, v)
  }
  return Array.from(map.values()).sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0))
}

export const mapDbVouchersToVault = (list: unknown[]): VaultVoucher[] => {
  return (Array.isArray(list) ? list : [])
    .map((x: any) => ({
      id: String(x?.id ?? ''),
      code: String(x?.code ?? '').trim().toUpperCase(),
      message: undefined,
      receivedAt: Number(new Date(x?.createdAt ?? x?.created_at ?? Date.now()).getTime()),
    }))
    .filter((x) => x.id && x.code)
}

export const shouldSilentlyIgnoreVoucherFetchError = (e: unknown) => {
  if (!axios.isAxiosError(e)) return false
  const status = e.response?.status
  return status === 401 || status === 403
}

