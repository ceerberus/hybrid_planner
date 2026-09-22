export interface CustomType {
  /** Used as the DayEntry "type" value, e.g. "custom_schwimmen" */
  id: string
  label: string
  color: string
}

export interface ColorOption {
  key: string
  swatchClass: string
  badgeClass: string
}

// Palette intentionally avoids hues already used by the built-in workout types
// (blue, cyan, orange, amber, purple, slate, green, rose, red) so custom labels stay distinguishable.
export const COLOR_PALETTE: ColorOption[] = [
  { key: 'indigo', swatchClass: 'bg-indigo-500', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30' },
  { key: 'pink', swatchClass: 'bg-pink-500', badgeClass: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30' },
  { key: 'teal', swatchClass: 'bg-teal-500', badgeClass: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30' },
  { key: 'lime', swatchClass: 'bg-lime-500', badgeClass: 'bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-500/20 dark:text-lime-300 dark:border-lime-500/30' },
  { key: 'fuchsia', swatchClass: 'bg-fuchsia-500', badgeClass: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/30' },
  { key: 'yellow', swatchClass: 'bg-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30' },
  { key: 'sky', swatchClass: 'bg-sky-500', badgeClass: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30' },
  { key: 'emerald', swatchClass: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30' },
  { key: 'violet', swatchClass: 'bg-violet-500', badgeClass: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30' },
  { key: 'gray', swatchClass: 'bg-gray-500', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30' },
]

export function getColorOption(key: string): ColorOption {
  return COLOR_PALETTE.find(c => c.key === key) ?? COLOR_PALETTE[0]
}

export function slugifyCustomTypeId(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `custom_${slug || 'label'}`
}
