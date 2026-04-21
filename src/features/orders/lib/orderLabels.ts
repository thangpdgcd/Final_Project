import type { TFunction } from 'i18next';

type Key =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'sent'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded'
  | 'unknown';

const normalize = (raw: unknown) =>
  String(raw ?? '')
    .trim()
    .toLowerCase();

export const mapOrderStatusToI18nKey = (raw: unknown): Key => {
  const v = normalize(raw);
  if (!v) return 'unknown';

  if (v === 'pending' || v === 'awaiting' || v === 'wait' || v === 'chờ xử lý') return 'pending';
  if (v === 'confirmed' || v === 'confirm' || v === 'đã xác nhận') return 'confirmed';
  if (v === 'processing' || v === 'packing' || v === 'đang đóng hàng') return 'processing';
  if (v === 'shipping' || v === 'delivering' || v === 'vận chuyển' || v === 'đang giao')
    return 'shipping';
  if (v === 'sent' || v === 'out_for_delivery' || v === 'dispatch') return 'sent';
  if (v === 'shipped' || v === 'delivered' || v === 'chờ giao hàng') return 'shipped';
  if (v === 'completed' || v === 'complete' || v === 'done' || v === 'hoàn thành')
    return 'completed';
  if (v === 'cancelled' || v === 'canceled' || v === 'cancel' || v === 'đã hủy') return 'cancelled';
  if (v === 'refund_requested' || v === 'refund-requested' || v === 'refund requested')
    return 'refund_requested';
  if (v === 'refunded' || v === 'refund' || v === 'đã hoàn') return 'refunded';

  return 'unknown';
};

export const normalizeOrderStatusForLogic = (raw: unknown) => mapOrderStatusToI18nKey(raw);

export const translateOrderStatus = (t: TFunction, raw: unknown) => {
  const key = mapOrderStatusToI18nKey(raw);
  return t(`order.status.${key}`, { defaultValue: String(raw ?? '') });
};

export const mapPaymentMethodToI18nKey = (raw: unknown) => {
  const v = normalize(raw);
  if (!v) return 'unknown' as const;
  if (v === 'paypal') return 'paypal' as const;
  if (v === 'cod' || v.includes('cash')) return 'cod' as const;
  if (v === 'coffee_coin' || v === 'coffee coin' || v === 'coin') return 'coffeeCoin' as const;
  return 'unknown' as const;
};

export const translatePaymentMethod = (t: TFunction, raw: unknown) => {
  const key = mapPaymentMethodToI18nKey(raw);
  return t(`order.payment.${key}`, { defaultValue: String(raw ?? '') });
};

export const mapShippingStatusToI18nKey = (raw: unknown) => {
  const v = normalize(raw);
  if (!v) return 'unknown' as const;
  if (v === 'pending' || v === 'waiting') return 'pending' as const;
  if (v === 'shipping' || v === 'delivering') return 'shipping' as const;
  if (v === 'shipped' || v === 'delivered') return 'shipped' as const;
  if (v === 'completed' || v === 'complete') return 'completed' as const;
  if (v === 'cancelled' || v === 'canceled') return 'cancelled' as const;
  return 'unknown' as const;
};

export const translateShippingStatus = (t: TFunction, raw: unknown) => {
  const key = mapShippingStatusToI18nKey(raw);
  return t(`order.shippingStatus.${key}`, { defaultValue: String(raw ?? '') });
};

