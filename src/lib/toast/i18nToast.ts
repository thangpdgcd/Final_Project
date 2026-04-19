import { toast as reactToastify, type ToastOptions } from 'react-toastify';
import i18n from '@/translates/i18n';

type Interpolation = Record<string, string | number | boolean | null | undefined>;

const translate = (key: string, values?: Interpolation) =>
  String(i18n.t(key, values as Record<string, unknown>));

export const toastSuccess = (key: string, values?: Interpolation, options?: ToastOptions) => {
  reactToastify.success(translate(key, values), options);
};

export const toastError = (key: string, values?: Interpolation, options?: ToastOptions) => {
  reactToastify.error(translate(key, values), options);
};

export const toastWarning = (key: string, values?: Interpolation, options?: ToastOptions) => {
  reactToastify.warning(translate(key, values), options);
};

export const toastInfo = (key: string, values?: Interpolation, options?: ToastOptions) => {
  reactToastify.info(translate(key, values), options);
};

/** Server or unknown message: show translated fallback + optional detail. */
export const toastErrorWithFallback = (
  fallbackKey: string,
  serverMessage?: string | null,
  options?: ToastOptions,
) => {
  const detail = serverMessage?.trim();
  reactToastify.error(detail ? `${translate(fallbackKey)}: ${detail}` : translate(fallbackKey), options);
};
