import {
  mapOrderStatusToI18nKey,
  mapPaymentMethodToI18nKey,
  mapShippingStatusToI18nKey,
} from '@/features/orders/lib/orderLabels';

/**
 * Central string keys for i18n.t(...) — avoids typos and enables refactors.
 * Values match paths in `src/translates/locales/{en,vi}.json`.
 */
export const i18nKeys = {
  toast: {
    cart: {
      removeSuccess: 'toast.cart.removeSuccess',
      removeError: 'toast.cart.removeError',
      checkoutNeedSelection: 'toast.cart.checkoutNeedSelection',
      loginToAdd: 'toast.cart.loginToAdd',
      addSuccess: 'toast.cart.addSuccess',
      addError: 'toast.cart.addError',
    },
    order: {
      created: 'toast.order.created',
      voucherApplyFailed: 'toast.order.voucherApplyFailed',
      saveFailed: 'toast.order.saveFailed',
    },
    support: {
      loadMessagesFailed: 'toast.support.loadMessagesFailed',
      loadConversationsFailed: 'toast.support.loadConversationsFailed',
      loginToChat: 'toast.support.loginToChat',
      joinThreadFailed: 'toast.support.joinThreadFailed',
      sendFailed: 'toast.support.sendFailed',
      chatError: 'toast.support.chatError',
    },
    product: {
      loginRequired: 'toast.product.loginRequired',
    },
  },
  customersCart: {
    root: 'customersCart',
  },
  checkout: {
    root: 'checkout',
  },
  order: {
    /** Fixed suffix (camelCase), e.g. `pending`, `refundRequested`. */
    status: (key: string) => `order.status.${key}` as const,
    /** Full path from raw API value (uses same mapping as translateOrderStatus). */
    statusFromApi: (raw: unknown) => `order.status.${mapOrderStatusToI18nKey(raw)}` as const,
    payment: (key: string) => `order.payment.${key}` as const,
    paymentFromApi: (raw: unknown) => `order.payment.${mapPaymentMethodToI18nKey(raw)}` as const,
    shipping: (key: string) => `order.shipping.${key}` as const,
    shippingStatus: (key: string) => `order.shippingStatus.${key}` as const,
    shippingStatusFromApi: (raw: unknown) =>
      `order.shippingStatus.${mapShippingStatusToI18nKey(raw)}` as const,
  },
} as const;
