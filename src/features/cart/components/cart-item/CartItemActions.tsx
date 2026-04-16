export function CartItemActions({
  onRemove,
  removeDisabled,
}: {
  onRemove: () => void;
  removeDisabled: boolean;
}) {
  return (
    <div className="w-16 flex flex-col items-center gap-1">
      <button
        onClick={onRemove}
        disabled={removeDisabled}
        className="text-xs text-stone-900 dark:text-stone-100 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        type="button"
      >
        Xóa
      </button>
      <button className="text-[10px] text-orange-600 hover:underline" type="button">
        Tìm sản phẩm tương tự
      </button>
    </div>
  );
}

