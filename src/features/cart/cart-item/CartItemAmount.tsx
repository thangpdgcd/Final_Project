const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

export const CartItemAmount = ({ amount }: { amount: number }) => {
  return (
    <div className="hidden sm:block w-28 text-center">
      <span className="text-sm font-bold text-orange-600 dark:text-orange-500">
        {formatPrice(amount)}
      </span>
    </div>
  );
};

