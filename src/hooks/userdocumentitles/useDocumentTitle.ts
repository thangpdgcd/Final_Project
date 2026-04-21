import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sets `document.title` from an i18n key (optional interpolation). Restores the previous title on cleanup.
 */
export const useDocumentTitle = (i18nKey: string, interpolation?: Record<string, unknown>) => {
  const { t, i18n } = useTranslation();
  const interpKey = interpolation ? JSON.stringify(interpolation) : '';

  useEffect(() => {
    const prev = document.title;
    document.title = interpolation ? String(t(i18nKey, interpolation)) : t(i18nKey);
    return () => {
      document.title = prev;
    };
  }, [t, i18n.language, i18nKey, interpKey]);
};
