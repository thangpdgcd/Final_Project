import { useMemo, useState } from 'react';
import { ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  CheckboxItemProps,
  ColorSwatchesProps,
  SectionProps,
} from '@/components/shop/filters/filters.types';

const Section = ({ title, open, onToggle, children }: SectionProps) => {
  return (
    <div className="overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-low)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="hl-sans text-sm font-medium text-[color:var(--hl-secondary)]">
          {title}
        </span>
        <ChevronDown
          size={18}
          className={[
            'text-[color:var(--hl-secondary)] transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckboxItem = ({ label, checked, onChange }: CheckboxItemProps) => {
  return (
    <label className="hl-sans flex cursor-pointer items-center justify-between gap-3 py-2 text-sm text-[color:var(--hl-on-surface)]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--hl-primary)]"
      />
    </label>
  );
};

const ColorSwatches = ({ options, value, onChange }: ColorSwatchesProps) => {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {options.map((o) => {
        const active = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              if (active) onChange(value.filter((v) => v !== o.id));
              else onChange([...value, o.id]);
            }}
            className={[
              'h-7 w-7 rounded-full border transition',
              active
                ? 'border-[color:var(--hl-primary)] ring-2 ring-[color:color-mix(in_srgb,var(--hl-primary)_35%,transparent)]'
                : 'border-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)]',
            ].join(' ')}
            style={{ backgroundColor: o.hex }}
            aria-label={o.label}
            title={o.label}
          />
        );
      })}
    </div>
  );
};

const AccordionFilters = () => {
  const [open, setOpen] = useState({
    availability: true,
    productType: false,
    brand: false,
    color: false,
    material: false,
    size: false,
  });

  const [availability, setAvailability] = useState({
    inStock: true,
    outOfStock: false,
  });
  const [productType, setProductType] = useState({
    beans: true,
    capsule: false,
    drip: false,
    gear: false,
  });
  const [brand, setBrand] = useState({
    phan: true,
    aurora: false,
    originHouse: false,
  });
  const [material, setMaterial] = useState({
    paper: false,
    stainless: false,
    ceramic: false,
    glass: false,
  });
  const [size, setSize] = useState({
    small: false,
    medium: true,
    large: false,
  });
  const [colors, setColors] = useState<string[]>([]);

  const colorOptions = useMemo(
    () => [
      { id: 'gold', label: 'Gold', hex: '#d6c59a' },
      { id: 'espresso', label: 'Espresso', hex: '#2a1a12' },
      { id: 'cream', label: 'Cream', hex: '#f5ead0' },
      { id: 'slate', label: 'Slate', hex: '#334155' },
      { id: 'forest', label: 'Forest', hex: '#14532d' },
    ],
    [],
  );

  const toggle = (key: keyof typeof open) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const clearAll = () => {
    setAvailability({ inStock: false, outOfStock: false });
    setProductType({ beans: false, capsule: false, drip: false, gear: false });
    setBrand({ phan: false, aurora: false, originHouse: false });
    setMaterial({ paper: false, stainless: false, ceramic: false, glass: false });
    setSize({ small: false, medium: false, large: false });
    setColors([]);
  };

  const activeCount = useMemo(() => {
    const b2n = (b: boolean) => (b ? 1 : 0);
    return (
      b2n(availability.inStock) +
      b2n(availability.outOfStock) +
      b2n(productType.beans) +
      b2n(productType.capsule) +
      b2n(productType.drip) +
      b2n(productType.gear) +
      b2n(brand.phan) +
      b2n(brand.aurora) +
      b2n(brand.originHouse) +
      b2n(material.paper) +
      b2n(material.stainless) +
      b2n(material.ceramic) +
      b2n(material.glass) +
      b2n(size.small) +
      b2n(size.medium) +
      b2n(size.large) +
      colors.length
    );
  }, [availability, productType, brand, material, size, colors.length]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="hl-sans flex items-center gap-2 text-sm font-medium text-[color:var(--hl-secondary)]">
          <Filter size={16} className="text-[color:var(--hl-primary)]" />
          Filters
          {activeCount > 0 ? (
            <span className="ml-1 inline-flex items-center rounded-full bg-[color:color-mix(in_srgb,var(--hl-primary)_10%,transparent)] px-2 py-0.5 text-xs text-[color:var(--hl-primary)]">
              {activeCount}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={clearAll}
          disabled={activeCount === 0}
          className="hl-sans inline-flex items-center gap-2 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] bg-[color:var(--hl-surface-lowest)] px-3 py-2 text-xs font-medium text-[color:var(--hl-on-surface)] transition hover:bg-[color:var(--hl-surface-low)] disabled:opacity-40 disabled:hover:bg-[color:var(--hl-surface-lowest)]"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <Section
        title="Availability"
        open={open.availability}
        onToggle={() => toggle('availability')}
      >
        <CheckboxItem
          label="In stock"
          checked={availability.inStock}
          onChange={(v) => setAvailability((s) => ({ ...s, inStock: v }))}
        />
        <CheckboxItem
          label="Out of stock"
          checked={availability.outOfStock}
          onChange={(v) => setAvailability((s) => ({ ...s, outOfStock: v }))}
        />
      </Section>

      <Section title="Product Type" open={open.productType} onToggle={() => toggle('productType')}>
        <CheckboxItem
          label="Beans"
          checked={productType.beans}
          onChange={(v) => setProductType((s) => ({ ...s, beans: v }))}
        />
        <CheckboxItem
          label="Capsule"
          checked={productType.capsule}
          onChange={(v) => setProductType((s) => ({ ...s, capsule: v }))}
        />
        <CheckboxItem
          label="Drip pack"
          checked={productType.drip}
          onChange={(v) => setProductType((s) => ({ ...s, drip: v }))}
        />
        <CheckboxItem
          label="Gear"
          checked={productType.gear}
          onChange={(v) => setProductType((s) => ({ ...s, gear: v }))}
        />
      </Section>

      <Section title="Brand" open={open.brand} onToggle={() => toggle('brand')}>
        <CheckboxItem
          label="Phan"
          checked={brand.phan}
          onChange={(v) => setBrand((s) => ({ ...s, phan: v }))}
        />
        <CheckboxItem
          label="Aurora Roasters"
          checked={brand.aurora}
          onChange={(v) => setBrand((s) => ({ ...s, aurora: v }))}
        />
        <CheckboxItem
          label="Origin House"
          checked={brand.originHouse}
          onChange={(v) => setBrand((s) => ({ ...s, originHouse: v }))}
        />
      </Section>

      <Section title="Color" open={open.color} onToggle={() => toggle('color')}>
        <div className="hl-sans text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
          Pick one or more
        </div>
        <ColorSwatches options={colorOptions} value={colors} onChange={setColors} />
      </Section>

      <Section title="Material" open={open.material} onToggle={() => toggle('material')}>
        <CheckboxItem
          label="Paper"
          checked={material.paper}
          onChange={(v) => setMaterial((s) => ({ ...s, paper: v }))}
        />
        <CheckboxItem
          label="Stainless"
          checked={material.stainless}
          onChange={(v) => setMaterial((s) => ({ ...s, stainless: v }))}
        />
        <CheckboxItem
          label="Ceramic"
          checked={material.ceramic}
          onChange={(v) => setMaterial((s) => ({ ...s, ceramic: v }))}
        />
        <CheckboxItem
          label="Glass"
          checked={material.glass}
          onChange={(v) => setMaterial((s) => ({ ...s, glass: v }))}
        />
      </Section>

      <Section title="Size" open={open.size} onToggle={() => toggle('size')}>
        <CheckboxItem
          label="Small"
          checked={size.small}
          onChange={(v) => setSize((s) => ({ ...s, small: v }))}
        />
        <CheckboxItem
          label="Medium"
          checked={size.medium}
          onChange={(v) => setSize((s) => ({ ...s, medium: v }))}
        />
        <CheckboxItem
          label="Large"
          checked={size.large}
          onChange={(v) => setSize((s) => ({ ...s, large: v }))}
        />
      </Section>
    </div>
  );
};

export default AccordionFilters;
