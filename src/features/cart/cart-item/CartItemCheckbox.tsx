import { Checkbox } from 'antd';

export const CartItemCheckbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-center w-8">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
};

