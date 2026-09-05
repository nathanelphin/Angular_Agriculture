import type { Province, ProvinceId } from '@/lib/types';

// Stylized SVG map of Cambodia — 640×440 viewBox.
// Provinces are intentionally simplified geometric regions (editorial style).

export const MAP_VIEWBOX = '0 0 640 440';

export const provinceShapes: Record<ProvinceId, { path: string; label: { x: number; y: number } }> = {
  battambang: {
    path: 'M96,132 L172,112 L208,172 L188,218 L124,228 L84,188 Z',
    label: { x: 146, y: 176 },
  },
  siemreap: {
    path: 'M172,112 L262,78 L286,116 L268,162 L208,172 L182,142 Z',
    label: { x: 228, y: 138 },
  },
  kampongthom: {
    path: 'M286,116 L332,132 L382,124 L428,140 L424,202 L382,228 L322,212 L268,162 Z',
    label: { x: 350, y: 178 },
  },
  mondulkiri: {
    path: 'M500,128 L555,132 L608,140 L598,205 L568,268 L522,295 L485,245 L478,180 Z',
    label: { x: 540, y: 208 },
  },
  kampongcham: {
    path: 'M382,228 L424,202 L450,240 L458,272 L392,292 L358,262 Z',
    label: { x: 414, y: 258 },
  },
  preyveng: {
    path: 'M344,292 L392,292 L458,272 L470,300 L452,332 L392,352 L338,340 L330,315 Z',
    label: { x: 394, y: 318 },
  },
  takeo: {
    path: 'M258,296 L306,288 L344,292 L338,340 L306,362 L266,358 L248,322 Z',
    label: { x: 298, y: 324 },
  },
  kampot: {
    path: 'M124,228 L188,218 L232,260 L244,266 L236,318 L196,356 L150,345 L128,318 L150,262 Z',
    label: { x: 186, y: 292 },
  },
};

// Neutral background shapes completing the silhouette (non-interactive).
export const fillerShapes: { path: string; id: string }[] = [
  { id: 'ratanakiri', path: 'M485,105 L545,72 L602,98 L608,140 L555,132 L500,128 Z' },
  { id: 'preahvihear', path: 'M345,72 L430,60 L472,90 L470,118 L428,140 L382,124 Z' },
  { id: 'oddar', path: 'M262,78 L345,72 L382,124 L332,132 L286,116 Z' },
  { id: 'kratie', path: 'M428,140 L470,118 L478,180 L485,205 L450,240 L424,202 Z' },
  { id: 'kandal', path: 'M302,228 L342,230 L358,262 L344,292 L306,288 L296,258 Z' },
  { id: 'kamportspeu', path: 'M240,222 L302,228 L296,258 L306,288 L258,296 L244,266 L232,260 Z' },
  { id: 'svayrieng', path: 'M458,272 L500,284 L508,318 L470,336 L452,332 Z' },
  { id: 'kohkong', path: 'M60,232 L124,228 L150,262 L128,318 L86,332 L52,286 Z' },
];

// Tonle Sap — the great lake at the heart of Cambodia.
export const tonleSapPath = 'M212,152 L252,142 L292,152 L288,178 L244,188 L216,178 Z';

// Decorative Mekong river path (dashed).
export const mekongPath =
  'M452,72 C448,110 438,132 444,162 C450,200 428,222 414,236 C394,256 368,264 354,280 C340,296 346,320 356,344';

export const provinces: Province[] = [
  {
    id: 'kampot',
    name: 'Kampot',
    nameKh: 'កំពត',
    path: provinceShapes.kampot.path,
    label: provinceShapes.kampot.label,
    image: '/images/farm-pepper-vines.jpg',
    tagline: 'The Pepper Coast',
    description:
      'A slow river province on the southern coast, where limestone mountains meet the sea. Kampot pepper — protected geographical indication and prized by chefs worldwide — has grown here for over a century in the red soil beneath Phnom Bokor.',
    knownFor: ['Kampot pepper', 'Durian', 'Sea salt', 'Dragon fruit'],
  },
  {
    id: 'battambang',
    name: 'Battambang',
    nameKh: 'បាត់ដំបង',
    path: provinceShapes.battambang.path,
    label: provinceShapes.battambang.label,
    image: '/images/farm-orchard.jpg',
    tagline: "Cambodia's Rice Bowl",
    description:
      'Cambodia\'s agricultural heartland, where flat floodplains stretch to the horizon and mango orchards line the Sangker River. Generations of farming families have made Battambang the country\'s leading producer of rice, mangoes and citrus.',
    knownFor: ['Jasmine rice', 'Mangoes', 'Longan', 'Oranges'],
  },
  {
    id: 'siemreap',
    name: 'Siem Reap',
    nameKh: 'សៀមរាប',
    path: provinceShapes.siemreap.path,
    label: provinceShapes.siemreap.label,
    image: '/images/farm-rice-fields.jpg',
    tagline: 'Fields of the Ancients',
    description:
      'Home to Angkor and to a living agricultural tradition a thousand years old. Around the ancient reservoirs — barays — farmers still grow rice the way their ancestors did, guided by the rhythm of the lake and the monsoon.',
    knownFor: ['Fragrant rice', 'Lotus', 'Water spinach', 'Palm sugar'],
  },
  {
    id: 'kampongthom',
    name: 'Kampong Thom',
    nameKh: 'កំពង់ធំ',
    path: provinceShapes.kampongthom.path,
    label: provinceShapes.kampongthom.label,
    image: '/images/farm-palm-grove.jpg',
    tagline: 'Land of the Sugar Palm',
    description:
      'Between the Tonle Sap and the Dangrek highlands, Kampong Thom is a landscape of sugar palm groves and red-earth roads. Tappers climb the tall palms each morning to collect the sap that becomes Cambodia\'s beloved palm sugar.',
    knownFor: ['Palm sugar', 'Sticky rice', 'Cashews', 'Hom rice'],
  },
  {
    id: 'kampongcham',
    name: 'Kampong Cham',
    nameKh: 'កំពង់ចាម',
    path: provinceShapes.kampongcham.path,
    label: provinceShapes.kampongcham.label,
    image: '/images/story-traditional-farming.jpg',
    tagline: 'The Cashew Highlands',
    description:
      'Along the middle Mekong, red basalt soils feed vast orchards of cashew, rubber and durian. Kampong Cham is the quiet engine of Cambodian nuts — hand-harvested, sun-dried and roasted with care.',
    knownFor: ['Cashews', 'Durian', 'Rubber', 'Sesame'],
  },
  {
    id: 'preyveng',
    name: 'Prey Veng',
    nameKh: 'ព្រៃវែង',
    path: provinceShapes.preyveng.path,
    label: provinceShapes.preyveng.label,
    image: '/images/hero-rice-fields.jpg',
    tagline: 'The Deep Forest of Rice',
    description:
      'A green tapestry of paddies between the Mekong and the Vietnamese border. Prey Veng means "long forest" — today it is endless rice, and the Phka Malis jasmine grown here perfumes kitchens across the country.',
    knownFor: ['Jasmine rice', 'White rice', 'Beans', 'Corn'],
  },
  {
    id: 'takeo',
    name: 'Takeo',
    nameKh: 'តាកែវ',
    path: provinceShapes.takeo.path,
    label: provinceShapes.takeo.label,
    image: '/images/p-young-coconut.jpg',
    tagline: 'The Cradle of Civilization',
    description:
      'One of the oldest settled regions of Cambodia, Takeo feeds the capital with vegetables, coconuts and river fish. Its canal networks date to the Angkorian era and still water the fields today.',
    knownFor: ['Coconuts', 'Vegetables', 'Rice', 'Palm sugar'],
  },
  {
    id: 'mondulkiri',
    name: 'Mondulkiri',
    nameKh: 'មណ្ឌលគីរី',
    path: provinceShapes.mondulkiri.path,
    label: provinceShapes.mondulkiri.label,
    image: '/images/story-future-agriculture.jpg',
    tagline: 'The Mountain Harvest',
    description:
      'Cambodia\'s wild east — misty pine hills, waterfalls and cool highland air. Here Bunong indigenous communities grow coffee under forest shade and keep the tradition of wild forest honey alive.',
    knownFor: ['Highland coffee', 'Wild honey', 'Pepper', 'Avocados'],
  },
];

export function getProvince(id: ProvinceId | 'multi' | string): Province | undefined {
  return provinces.find((p) => p.id === id);
}

export function provinceName(id: ProvinceId | 'multi' | string): string {
  if (id === 'multi') return 'Multiple Provinces';
  return getProvince(id)?.name ?? 'Cambodia';
}
