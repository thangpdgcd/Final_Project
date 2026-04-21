import { useTranslation } from 'react-i18next';

/** App-wide i18n hook (default namespace: `translation`). */
export const useAppTranslation = () => useTranslation('translation');
