import { useAppTranslation } from '@/hooks/userapptranslations/useAppTranslation';

export const CartItemActions = ({
  onRemove,
  removeDisabled,
}: {
  onRemove: () => void;
  removeDisabled: boolean;
}) => {
  const { t } = useAppTranslation();
  return (
    <div className="flex w-16 flex-col items-center gap-1">
      <button
        onClick={onRemove}
        disabled={removeDisabled}
        className="text-xs text-stone-900 transition-colors hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-100"
        type="button"
      >
        {t('customersCart.actions.remove')}
      </button>
      <button className="text-[10px] text-orange-600 hover:underline" type="button">
        {t('customersCart.actions.similar')}
      </button>
    </div>
  );
};

