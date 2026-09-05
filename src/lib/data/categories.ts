import type { Category } from '@/lib/types';

export const categories: Category[] = [
  {
    id: 'rice',
    name: 'Rice & Grains',
    nameKh: 'បាយ និងគ្រាប់ធញ្ញជាតិ',
    description: 'Fragrant Cambodian rice, milled with care.',
    image: '/images/p-jasmine-rice.jpg',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    nameKh: 'ផ្លែឈើ',
    description: 'Tropical fruit picked at peak ripeness.',
    image: '/images/p-fresh-mangoes.jpg',
  },
  {
    id: 'spices',
    name: 'Spices',
    nameKh: 'គ្រឿងទេស',
    description: 'Kampot pepper and locally grown spice.',
    image: '/images/p-kampot-black-pepper.jpg',
  },
  {
    id: 'sweeteners',
    name: 'Natural Sweeteners',
    nameKh: 'ស្ករធម្មជាតិ',
    description: 'Palm sugar and traditional sweetness.',
    image: '/images/p-palm-sugar.jpg',
  },
  {
    id: 'nuts',
    name: 'Nuts & Seeds',
    nameKh: 'គ្រាប់ និងស្នោ',
    description: 'Cashews, peanuts and sesame.',
    image: '/images/p-roasted-cashews.jpg',
  },
  {
    id: 'farm-goods',
    name: 'Farm Goods',
    nameKh: 'ផលិតផលកសិកម្ម',
    description: 'Fresh harvests from the fields.',
    image: '/images/farm-orchard.jpg',
  },
  {
    id: 'artisan',
    name: 'Artisan Foods',
    nameKh: 'ផលិតផលសិប្បកម្ម',
    description: 'Traditional Cambodian food crafts.',
    image: '/images/story-palm-sugar-making.jpg',
  },
  {
    id: 'gifts',
    name: 'Gift Collections',
    nameKh: 'ជំនូន',
    description: 'Premium boxes from our farmers.',
    image: '/images/p-golden-gift-box.jpg',
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
