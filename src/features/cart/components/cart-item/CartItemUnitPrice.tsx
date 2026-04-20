const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

export function CartItemUnitPrice({ price }: { price: number }) {
  return (
    <div className="hidden md:block w-24 text-center">
      <span className="text-sm text-stone-500 dark:text-stone-400 line-through block opacity-50">
        {formatPrice(price * 1.2)}
      </span>
      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
        {formatPrice(price)}
      </span>
    </div>
  );
}
