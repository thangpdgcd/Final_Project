import type { TFunction } from 'i18next';

/**
 * Normalize API tokens for lookup: lowercase, trim, collapse separators.
 * Use this for all dynamic enum-like values from the backend.
 */
export const normalizeApiToken = (raw: unknown): string =>
  String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

/**
 * Canonical order status strings used for tab logic / comparisons (stable, lowercase).
 * Any API variant is mapped here first; unknown values pass through as-is for logic only.
 */
const ORDER_STATUS_ALIASES: Record<string, string> = {
  paid: 'confirmed',
  accepted: 'confirmed',
  preparing: 'processing',
  inprogress: 'processing',
  delivering: 'shipped',
  outfordelivery: 'shipped',
  ontheway: 'shipped',
  dangiao: 'shipped',
  complete: 'completed',
  done: 'completed',
  refundrequested: 'refund_requested',
  refundrequest: 'refund_requested',
  canceled: 'cancelled',
  refunded: 'refunded',
  refundcomplete: 'refunded',
  refundcompleted: 'refunded',
  partialrefund: 'refunded',
  partialrefunded: 'refunded',
  refund: 'refunded',
  returned: 'refunded',
  return: 'refunded',
  pending: 'pending',
  confirmed: 'confirmed',
  processing: 'processing',
  shipping: 'shipping',
  shipped: 'shipped',
  sent: 'sent',
  completed: 'completed',
  cancelled: 'cancelled',
  // Common backend / UI variants
  awaitingconfirmation: 'pending',
  awaitingpayment: 'pending',
  awaitingpickup: 'processing',
  awaitingdelivery: 'shipped',
  awaiting: 'pending',
  intransit: 'shipping',
  delivered: 'completed',
};

/** Maps canonical order status → i18n key under `order.status.<camelCase>`. */
const ORDER_STATUS_I18N: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  paid: 'paid',
  processing: 'processing',
  shipping: 'shipping',
  shipped: 'shipped',
  sent: 'sent',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  refund_requested: 'refundRequested',
  refunded: 'refunded',
};

/** Maps API token → `order.payment.<camelCase>`. Unmapped → `other` (never raw API). */
const PAYMENT_ALIASES: Record<string, string> = {
  cod: 'cod',
  cashondelivery: 'cod',
  cash: 'cod',
  paypal: 'paypal',
  pay_pal: 'paypal',
  coffeecoin: 'coffeeCoin',
  coffee_coin: 'coffeeCoin',
  momo: 'momo',
  vnpay: 'vnpay',
  banktransfer: 'bankTransfer',
  bank_transfer: 'bankTransfer',
  wiretransfer: 'bankTransfer',
  stripe: 'stripe',
  card: 'card',
  creditcard: 'card',
  debitcard: 'card',
  zalopay: 'zalopay',
  zalo_pay: 'zalopay',
  applepay: 'applePay',
  googlepay: 'googlePay',
};

/** Maps API token → canonical shipping status (snake_case). */
const SHIPPING_STATUS_ALIASES: Record<string, string> = {
  pending: 'pending',
  preparing: 'preparing',
  packed: 'packed',
  picked: 'picked',
  shipped: 'shipped',
  intransit: 'inTransit',
  in_transit: 'inTransit',
  outfordelivery: 'outForDelivery',
  out_for_delivery: 'outForDelivery',
  delivering: 'outForDelivery',
  delivered: 'delivered',
  failed: 'failed',
  returned: 'returned',
  cancelled: 'cancelled',
};

/** Canonical shipping → `order.shippingStatus.<camelCase>`. */
const SHIPPING_STATUS_I18N: Record<string, string> = {
  pending: 'pending',
  preparing: 'preparing',
  packed: 'packed',
  picked: 'picked',
  shipped: 'shipped',
  inTransit: 'inTransit',
  outForDelivery: 'outForDelivery',
  delivered: 'delivered',
  failed: 'failed',
  returned: 'returned',
  cancelled: 'cancelled',
};

export const normalizeOrderStatusForLogic = (raw: unknown): string => {
  const k = normalizeApiToken(raw);
  return ORDER_STATUS_ALIASES[k] ?? k;
};

/** i18n suffix under `order.status.<suffix>` (camelCase). Use with `t(\`order.status.${suffix}\`)` or i18nKeys.order.status(suffix). */
export const mapOrderStatusToI18nKey = (raw: unknown): string => {
  const canonical = normalizeOrderStatusForLogic(raw);
  return ORDER_STATUS_I18N[canonical] ?? 'unknown';
};

/** i18n suffix under `order.payment.<suffix>`. */
export const mapPaymentMethodToI18nKey = (raw: unknown): string => {
  const token = normalizeApiToken(raw);
  if (!token) return 'other';
  return PAYMENT_ALIASES[token] ?? 'other';
};

/** i18n suffix under `order.shippingStatus.<suffix>`. */
export const mapShippingStatusToI18nKey = (raw: unknown): string => {
  const token = normalizeApiToken(raw);
  if (!token) return 'unknown';
  const canonical = SHIPPING_STATUS_ALIASES[token] ?? 'unknown';
  return SHIPPING_STATUS_I18N[canonical] ?? 'unknown';
};

/**
 * Display label for order status — always from i18n, never raw API text.
 */
export const translateOrderStatus = (t: TFunction, raw: unknown): string => {
  const suffix = mapOrderStatusToI18nKey(raw);
  if (suffix !== 'unknown') return t(`order.status.${suffix}`);
  return t('order.status.unknown');
};

/**
 * Display label for payment method — always from i18n, never raw API text.
 */
export const translatePaymentMethod = (t: TFunction, raw: unknown): string => {
  const suffix = mapPaymentMethodToI18nKey(raw);
  return t(`order.payment.${suffix}`, { defaultValue: t('order.payment.other') });
};

/**
 * Delivery / logistics status (if provided separately from order status).
 */
export const translateShippingStatus = (t: TFunction, raw: unknown): string => {
  const suffix = mapShippingStatusToI18nKey(raw);
  return t(`order.shippingStatus.${suffix}`);
};

/** Fixed UI shipping method options (checkout) — already translated keys. */
export const translateShippingLabel = (t: TFunction, key: 'standard' | 'express' | 'pickup'): string =>
  t(`order.shipping.${key}`);

/** @deprecated Use mapOrderStatusToI18nKey — kept for any external imports. */
export const orderStatusToKey = (raw: unknown): string => mapOrderStatusToI18nKey(raw);
