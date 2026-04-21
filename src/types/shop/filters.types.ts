import type React from 'react';

export type ColorOption = {
  id: string;
  label: string;
  hex: string;
};

export type CheckboxItemProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export type SectionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export type ColorSwatchesProps = {
  options: readonly ColorOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
};

export type PriceRangeFilterProps = {
  min: number;
  max: number;
  priceRange: readonly [number, number];
  setPriceRange: (range: [number, number]) => void;
};

