import type { Story } from '@/lib/types';

// ─── SOVANN FARM — editorial journal (mock data, illustrative only) ──────────

export const stories: Story[] = [
  {
    id: 's-the-journey-of-kampot-pepper',
    slug: 'the-journey-of-kampot-pepper',
    title: 'The Journey of Kampot Pepper',
    titleKh: 'ដំណើរនៃម្រេចកំពត',
    excerpt:
      "From a living vine in red basalt soil to the kitchens of the world — the slow, deliberate craft behind the world's most aromatic pepper.",
    category: 'Spices',
    author: 'Chan Dara',
    date: '2026-01-12',
    readTime: 7,
    image: '/images/story-journey-kampot-pepper.jpg',
    featured: true,
    relatedProductSlug: 'kampot-black-pepper',
    content: [
      {
        type: 'paragraph',
        text: "The pepper vines of Kampot do not hurry. They climb the living trunks of neighbouring trees, gaining a metre each year, and for three years they give nothing at all. Patience is the first ingredient in every bag of Kampot pepper — a patience written into the red soil itself, into the limestone mountains that catch the coastal rain and release it slowly through the long dry season.",
      },
      {
        type: 'heading',
        text: 'A geography of flavour',
      },
      {
        type: 'paragraph',
        text: "Kampot's secret is written in the ground. The pepper grows in a narrow band between the Phnom Bokor massif and the sea, where quartz-flecked red soil, salt-laced winds and a quirk of drainage keep the vines thirsty, stressed and intensely aromatic. Chefs speak of eucalyptus, of flowers, of a slow heat that blooms and then politely leaves. The vines have grown here for centuries, and they have never once agreed to grow anywhere else with the same result.",
      },
      {
        type: 'heading',
        text: 'A spice with a memory',
      },
      {
        type: 'paragraph',
        text: "Pepper has been grown here since the Angkorian era, but the variety the world knows today was shaped in the late nineteenth century, when Khmer families in Kampot began cultivating it intensively. By the 1960s Cambodia exported thousands of tonnes a year. Then came decades of darkness, and the vines were abandoned. What grows in Kampot today is the work of returning families — grandparents teaching grandchildren the smell of a ripe peppercorn, the exact shade of green that means wait one more week.",
      },
      {
        type: 'image',
        image: '/images/farm-pepper-vines.jpg',
        caption: 'Pepper vines climbing living poles on a family farm outside Kep.',
      },
      {
        type: 'heading',
        text: 'Harvest by hand, sun by sun',
      },
      {
        type: 'paragraph',
        text: "Between February and May, whole families move through the rows, picking berry by berry. Green peppercorns become black pepper as they dry on clay terraces under full sun, turned by rake three times a day. White pepper is soaked overnight and rubbed free of its skin. Nothing is rushed, because everything about Kampot pepper — the eucalyptus lift, the slow heat, the famous finish of flowers — survives only in fruit treated gently.",
      },
      {
        type: 'quote',
        text: 'You cannot fake a good year. The pepper tastes the season — the rain, the sun, the soil. Our job is simply not to spoil it.',
        caption: 'Dara Touch, pepper farmer, Kampot',
      },
      {
        type: 'heading',
        text: 'Why it matters',
      },
      {
        type: 'paragraph',
        text: "In 2010 Kampot pepper received Protected Geographical Indication status — Cambodia's first. Buying genuine Kampot pepper is not nostalgia; it is an economic decision that keeps young people farming rather than leaving for the factories of Thailand and Vietnam. Each 100-gram tin from Sovann Farm returns a fair share directly to the family that grew it.",
      },
      {
        type: 'image',
        image: '/images/campaign-golden-harvest.jpg',
        caption: 'From the drying terrace to the hand-stamped tin — a journey measured in days, not seasons.',
      },
      {
        type: 'paragraph',
        text: "Grind it coarse over a fried egg at dawn. Cook it with crab, as the crab-market cooks of Kep have done for generations. Or simply taste one corn, slowly, and let the flowers arrive.",
      },
    ],
  },
  {
    id: 's-how-cambodian-jasmine-rice-is-grown',
    slug: 'how-cambodian-jasmine-rice-is-grown',
    title: 'How Cambodian Jasmine Rice Is Grown',
    titleKh: 'របៀបដាំស្រែផ្កាមលិសកម្ពុជា',
    excerpt:
      'From May rains to a December barn — how the fragrant rice of Prey Veng is grown, harvested and milled without losing its perfume.',
    category: 'Rice',
    author: 'Sokun Nary',
    date: '2026-01-05',
    readTime: 8,
    image: '/images/story-jasmine-rice.jpg',
    featured: false,
    relatedProductSlug: 'phka-malis-jasmine-rice',
    content: [
      {
        type: 'paragraph',
        text: "In Prey Veng, dawn smells of wet earth and something sweeter underneath — the fragrance of a rice that has made Cambodia famous at dinner tables far beyond its borders. The province's name means long forest, but for a thousand years it has been something better: an unbroken green distance of paddy, stitched to the Mekong by canals, some of them older than the temples at Angkor.",
      },
      {
        type: 'heading',
        text: 'A grain named for a flower',
      },
      {
        type: 'paragraph',
        text: "Phka Malis — jasmine flower — is Cambodia's most treasured rice, a tall, slender grain that carries the same pandan-like compound that perfumes jasmine and pandan leaf. It grows slowly, tolerates no shortcuts, and gives exactly one harvest a year in the floodplain fields where the Mekong spreads its silt. Millers say you can grade a sack blind: open it, and the room tells you.",
      },
      {
        type: 'image',
        image: '/images/farm-rice-fields.jpg',
        caption: 'Morning mist over Prey Veng paddies, where Phka Malis is transplanted by hand each July.',
      },
      {
        type: 'heading',
        text: 'The calendar of water',
      },
      {
        type: 'paragraph',
        text: "The season begins in May, when the first rains soften the ground and farmers start their nurseries — dense seedbeds of the best grain saved from the year before. By July the seedlings are transplanted by hand, bent rows of them laid into standing water. Through the autumn the flood arrives, thick with river silt, and the rice grows with it. In December the paddies turn gold almost overnight, and the whole province moves outside to cut, carry and dry.",
      },
      {
        type: 'quote',
        text: 'In Prey Veng the year is not measured in months but in water. When the flood comes, we know exactly where we are.',
        caption: 'Sokha Chea, rice farmer, Prey Veng',
      },
      {
        type: 'heading',
        text: 'Ducks, hands and patience',
      },
      {
        type: 'paragraph',
        text: "On Sokha Chea's farm the pesticides are feathered. Ducklings patrol the paddies from nursery to harvest, eating pests and fertilising the grain — his grandfather called them the small harvesters. Transplanting is by hand, seed selection is from the strongest plants each season, and the straw goes back to the soil as compost rather than smoke. None of this is nostalgia; it is simply what has always worked here, and what the land still rewards.",
      },
      {
        type: 'heading',
        text: 'From paddy to pot',
      },
      {
        type: 'paragraph',
        text: "Fragrance is fragile, so the rice is milled in small batches within days of harvest, never warehoused for months. In the kitchen, Phka Malis asks for little: rinse once, use slightly less water than instinct suggests, and let the pot rest before opening. Then lift the lid, and lean in — the perfume is the whole point, and it has travelled a long way to reach you.",
      },
      {
        type: 'image',
        image: '/images/hero-rice-fields.jpg',
        caption: 'The December harvest: twelve families, four days, and a barn that smells like a flower shop.',
      },
    ],
  },
  {
    id: 's-the-farmers-behind-the-harvest',
    slug: 'the-farmers-behind-the-harvest',
    title: 'The Farmers Behind the Harvest',
    titleKh: 'កសិករនៅខាងក្រោយរដូវចម្រុះ',
    excerpt:
      'Six farm families, six provinces, one standard: meet the hands behind every tin, bag and jar in the collection.',
    category: 'People',
    author: 'Sovann Farm Journal',
    date: '2025-12-18',
    readTime: 6,
    image: '/images/story-farmers-behind.jpg',
    featured: false,
    relatedProductSlug: 'golden-harvest-gift-box',
    content: [
      {
        type: 'paragraph',
        text: "Every tin, bag and jar in the Sovann Farm collection begins in the same place — a pair of hands, usually before sunrise. This is a brief field guide to those hands: six farm families across six provinces, and the villages that work beside them.",
      },
      {
        type: 'heading',
        text: 'Six farms, one table',
      },
      {
        type: 'paragraph',
        text: "The collective stretches from the pepper coast of Kampot to the pine hills of Mondulkiri: rice paddies in Prey Veng, a palm grove in Kampong Thom, cashew highlands in Kampong Cham, a mango orchard along the Sangker River and canal-fed gardens in Takeo. What unites them is not scale but standard — each farm grows the way it would grow for its own table, and each is paid a fair, published share of every sale.",
      },
      {
        type: 'image',
        image: '/images/story-farmers-behind.jpg',
        caption: 'Portraits from the 2025 harvest — six of the fourteen families in the Sovann Farm collective.',
      },
      {
        type: 'heading',
        text: 'The listeners',
      },
      {
        type: 'paragraph',
        text: "Dara Touch walks his pepper rows with his nose. Sokha Chea reads a paddy's health from the colour of its water. Vireak Pong keeps a ledger of 140 sugar palms — age, yield, temper — and admits that some have names. Malis Chen grafts from her father's sixty-year-old mango trees; Sopheap Try has spent three decades learning the patience of a cashew orchard; Rathanak Yim keeps his harvest ledger the way Bunong elders taught him, recording what the forest gave and what was left behind.",
      },
      {
        type: 'quote',
        text: 'We are not selling pepper or rice. We are selling our mornings — the climb, the flood, the patience.',
        caption: 'Vireak Pong, palm sugar artisan, Kampong Thom',
      },
      {
        type: 'heading',
        text: 'Fair shares, full barns',
      },
      {
        type: 'paragraph',
        text: "Every product page names the family behind it because we believe provenance is a form of respect — and a form of quality control. A named farmer answers for his harvest. The fair-share model has funded a drying house in Battambang, a mill upgrade in Prey Veng and, quietly, a generation of school fees. When you buy the Golden Harvest Gift Box, you are holding the work of four of these families in one box.",
      },
      {
        type: 'paragraph',
        text: "Come to any of the farms during harvest and you will be fed before you are interviewed — fresh rice, grilled fish, palm-sugar sweets. That, the farmers will tell you, is the real business model: feed people well, and they come back.",
      },
    ],
  },
  {
    id: 's-palm-sugar-cambodias-natural-sweetener',
    slug: 'palm-sugar-cambodias-natural-sweetener',
    title: "Palm Sugar: Cambodia's Natural Sweetener",
    titleKh: 'ស្ករត្នោត ស្ករធម្មជាតិនៃកម្ពុជា',
    excerpt:
      "From a twenty-five-metre climb at dawn to a three-hour wood fire — the ancient craft behind Cambodia's golden blocks of sugar.",
    category: 'Traditions',
    author: 'Pisey Kim',
    date: '2025-12-02',
    readTime: 6,
    image: '/images/story-palm-sugar-making.jpg',
    featured: false,
    relatedProductSlug: 'palm-sugar',
    content: [
      {
        type: 'paragraph',
        text: "Before dawn in Kampong Thom, the sugar palms rise out of the mist like a second skyline. Somewhere up in the dark, a man is climbing a twenty-five-metre trunk with a shoulder pole of bamboo tubes, keeping an appointment his grandfather kept before him. The sugar in your kitchen starts here — at the top of a tree, before the sun.",
      },
      {
        type: 'heading',
        text: 'The tree of a thousand uses',
      },
      {
        type: 'paragraph',
        text: "The sugar palm — the national tree of Cambodia — may be the most useful plant the country grows. Its sap becomes sugar and wine, its leaves become thatch and baskets, its wood becomes boats and its black fibres become rope. Temple bas-reliefs show it, proverbs cite it, and the palms standing over the paddies were planted by great-grandparents nobody alive has met. Cutting a healthy palm down is, in much of the countryside, still treated as a small crime.",
      },
      {
        type: 'image',
        image: '/images/farm-palm-grove.jpg',
        caption: 'A tapper starts the dawn climb in Kampong Thom, bamboo tubes balanced on his shoulder pole.',
      },
      {
        type: 'heading',
        text: 'Sap at first light',
      },
      {
        type: 'paragraph',
        text: "Twice a day the tapper climbs, slicing a thin channel from the flower stem and setting bamboo tubes to catch the sap that runs overnight. The work is a race against chemistry: fresh sap is sweet and clear, but within hours it begins to ferment. Dawn collections must reach the boiling shed before they warm. A good palm gives a litre to two a day, faithfully, for decades.",
      },
      {
        type: 'quote',
        text: 'You must beat the sun. The sap is sweetest before it warms — after that, it wants to become wine.',
        caption: 'Vireak Pong, palm sugar artisan, Kampong Thom',
      },
      {
        type: 'heading',
        text: 'Fire and patience',
      },
      {
        type: 'paragraph',
        text: "The transformation takes three hours of steady wood fire, skimming and stirring, until the clear liquid darkens through gold to amber and the steam turns caramel-sweet. Poured into palm-leaf moulds, it sets into the familiar golden blocks — crumbly, smoky, barely as sweet as cane sugar but far more interesting. Nothing is added: no sulphur, no bleach, no anti-caking agents. The ingredient list is one word long.",
      },
      {
        type: 'image',
        image: '/images/story-palm-sugar-making.jpg',
        caption: 'Wood-fired woks reduce fresh sap to amber syrup — three hours, no shortcuts.',
      },
      {
        type: 'paragraph',
        text: "Cooks prize palm sugar for its roundness: caramel, toasted coconut, a faint smoke that deepens curries, balances the salt of fish sauce and makes krolan — sticky rice roasted in bamboo — taste of celebration. It keeps the minerals of the sap, and its gentler sweetness has made it a quiet favourite far beyond Cambodia.",
      },
      {
        type: 'paragraph',
        text: "The tradition is under pressure from cheap refined sugar and from the simple danger of the climb. Every block bought from a tapper like Vireak Pong is a vote for the grove to keep standing — and for the dawn skyline of Kampong Thom to stay occupied.",
      },
    ],
  },
  {
    id: 's-life-along-the-mekong',
    slug: 'life-along-the-mekong',
    title: 'Life Along the Mekong',
    titleKh: 'ជីវិតតាមមាត់ទន្លេមេគង្គ',
    excerpt:
      "The river that sets Cambodia's calendar — floods, fish, silt and the villages that keep its appointments.",
    category: 'Places',
    author: 'Chan Dara',
    date: '2025-11-20',
    readTime: 9,
    image: '/images/story-life-mekong.jpg',
    featured: false,
    relatedProductSlug: 'seasonal-farm-box',
    content: [
      {
        type: 'paragraph',
        text: "The Mekong is Cambodia's first road, its pantry and its calendar. It enters the country from the north carrying silt from distant mountains, splits around Phnom Penh, and each autumn performs a trick no other river on earth manages: it pushes water backwards up the Tonle Sap, flooding a lake the size of a small sea. Everything about farming here — what is planted, caught, dried or sold — is arranged around that pulse.",
      },
      {
        type: 'heading',
        text: 'A calendar written in water',
      },
      {
        type: 'paragraph',
        text: "The flood is not a disaster here; it is a delivery. Silt settles over paddies like a slow fertiliser, fish spawn in the drowned forests of the lake, and when the water retreats in January it leaves behind the greenest fields in the country. Villages time their festivals to it, farmers plant after it, and children learn to swim, conveniently, exactly when they need to.",
      },
      {
        type: 'image',
        image: '/images/story-life-mekong.jpg',
        caption: 'Evening freight on the middle Mekong — rice, cattle and cashews moving slowly north.',
      },
      {
        type: 'heading',
        text: 'Kampong Cham mornings',
      },
      {
        type: 'paragraph',
        text: "Along the middle river, Kampong Cham wakes to markets laid out in the cool dark: cashews from the basalt highlands, river fish packed in ice, bundles of morning glory still dripping. The province's red soil feeds orchards of cashew, durian and rubber, and its long ferry landings remember when crossing the Mekong meant an hour of patience. The bridge changed that; the markets have not changed at all.",
      },
      {
        type: 'paragraph',
        text: "Downstream in Prey Veng, the river's influence is quieter — canals, not banks. Rice grows to the horizon in fields stitched together with family ties, and ox carts still share the levee roads with motorbikes carrying the day's jasmine to the mill.",
      },
      {
        type: 'quote',
        text: 'The Mekong gives the schedule and we keep it. When it is low we plant on the banks; when it is full, we fish. The river has never once missed an appointment with us.',
        caption: 'A fisherman in Kampong Cham, on forty years of river life',
      },
      {
        type: 'heading',
        text: 'What the river asks now',
      },
      {
        type: 'paragraph',
        text: "The old certainty is wobbling. Upstream dams hold back the silt that made the floodplain rich; sand dredging and unusual years have made the flood arrive thin, late or not at all. Farmers respond the way farmers always have — by adjusting, digging, reviving old canals, and arguing with the water. The Angkorian canal networks of Takeo, dug a thousand years ago, are being re-dug by hand, and they work.",
      },
      {
        type: 'image',
        image: '/images/about-landscape.jpg',
        caption: "Canals first dug in Angkorian times still carry river water to Takeo's gardens.",
      },
      {
        type: 'paragraph',
        text: "The Seasonal Farm Box comes from those revived canals — river water, river silt, river schedule. Eating from it is the closest a kitchen can get to tasting the Mekong's own calendar.",
      },
    ],
  },
  {
    id: 's-traditional-cambodian-farming',
    slug: 'traditional-cambodian-farming',
    title: 'Traditional Cambodian Farming',
    titleKh: 'កសិកម្មបែបប្រពៃណីខ្មែរ',
    excerpt:
      'The techniques carved on temple walls are still in the fields — what traditional Cambodian farming knows, and why it matters now.',
    category: 'Traditions',
    author: 'Sokun Nary',
    date: '2025-11-08',
    readTime: 7,
    image: '/images/story-traditional-farming.jpg',
    featured: false,
    relatedProductSlug: 'roasted-cashews',
    content: [
      {
        type: 'paragraph',
        text: "Carve the walls of Angkor's temples and you find the same scenes farmers stage every morning a thousand years later: rice being cut, fish being ferried, markets being argued over. Traditional Cambodian farming is not a re-enactment. It is a continuous technology, refined across centuries, and most of its patents are held by grandmothers.",
      },
      {
        type: 'heading',
        text: 'Water first, always',
      },
      {
        type: 'paragraph',
        text: "Khmer civilisation was built on hydraulic engineering — the barays, canals and dykes that made Angkor possible still pattern the countryside. Traditional farming begins with water management: capturing the monsoon, releasing it slowly, planting on the recession. A farmer's first skill is not growing rice but arranging for water to grow it.",
      },
      {
        type: 'image',
        image: '/images/story-traditional-farming.jpg',
        caption: 'Ploughing before the rains — a rhythm unchanged in a thousand years.',
      },
      {
        type: 'heading',
        text: 'The buffalo and the blade',
      },
      {
        type: 'paragraph',
        text: "Before the rains, the buffalo walks the field in slow spirals, treading stubble and mud into a seedbed no machine improves on. Rice is transplanted by hand — an entire village bent over the water, seedlings pinched between finger and thumb. Labour is communal and repaid in meals and reciprocity; a big harvest is, by definition, a shared one.",
      },
      {
        type: 'quote',
        text: 'Our fathers used no chemicals because they had none — and because the water below the house was also the drinking water. Care was survival.',
        caption: 'Sopheap Try, cashew farmer, Kampong Cham',
      },
      {
        type: 'heading',
        text: 'Seed, moon and season',
      },
      {
        type: 'paragraph',
        text: "The best plants are marked at harvest and their seed hung under the eaves for next year's nursery — a selection programme running unbroken for centuries. The Royal Ploughing Ceremony, older than most nations' constitutions, still opens the season; the lunar calendar still tells farmers when the rains mean it. Tradition here is not decoration. It is data, transmitted.",
      },
      {
        type: 'paragraph',
        text: "What does all this offer a modern market? Biodiversity, low inputs, and resilience — fields that survive a thin flood because they were never designed to expect a perfect one. Sovann Farm's work is mostly translation: finding farmers who already grow this way and building the bridge from their barns to your table, as with the sun-dried cashews of Kampong Cham, roasted the week they leave the shed.",
      },
      {
        type: 'image',
        image: '/images/about-hands-grain.jpg',
        caption: "Seed grain kept from the best plants, dried under the eaves for next year's nursery.",
      },
      {
        type: 'paragraph',
        text: "The future of this tradition is, quite simply, whether it pays. When it pays, the buffalo walks, the seed is saved, the grandchildren stay. That arithmetic is the most modern idea in Cambodian farming — and the oldest.",
      },
    ],
  },
  {
    id: 's-the-future-of-cambodian-agriculture',
    slug: 'the-future-of-cambodian-agriculture',
    title: 'The Future of Cambodian Agriculture',
    titleKh: 'អនាគតកសិកម្មកម្ពុជា',
    excerpt:
      'Young farmers, old knowledge and a premium bet: how Cambodian agriculture is choosing quality over volume.',
    category: 'Future',
    author: 'Pisey Kim',
    date: '2025-10-25',
    readTime: 8,
    image: '/images/story-future-agriculture.jpg',
    featured: false,
    relatedProductSlug: 'mondulkiri-coffee',
    content: [
      {
        type: 'paragraph',
        text: "Cambodia is young — most of its farmers' children are under thirty — and its agriculture stands at a fork. One path leads to volume: low prices, borrowed chemicals, rice sold by the tonne into a crowded market. The other, quieter path is being cut right now by people like the ones in this story, who believe the country's future lies in quality, provenance and patience.",
      },
      {
        type: 'heading',
        text: 'A generation returns',
      },
      {
        type: 'paragraph',
        text: "Something unexpected is happening in the villages: young people are coming back. Agronomists trained abroad are returning to graft orchards; former developers are running drying cooperatives; farmers' children are putting their parents' harvests online. Smartphones have reached the fields faster than tractors did, and with them — traceability, direct sales, and the radical idea that a sack of rice can tell its own story.",
      },
      {
        type: 'image',
        image: '/images/story-future-agriculture.jpg',
        caption: 'Shade-grown coffee on a Mondulkiri hillside — the new face of Cambodian farming.',
      },
      {
        type: 'heading',
        text: 'The highland laboratory',
      },
      {
        type: 'paragraph',
        text: "In Mondulkiri, that future already tastes like coffee. Under old forest canopy at 800 metres, growers are pairing Bunong indigenous knowledge with modern cupping and drying science, producing highland arabica that sells on quality rather than quantity. The wild honey business runs on the same logic: harvest gently, price fairly, keep the forest standing. The forest, it turns out, is the factory.",
      },
      {
        type: 'quote',
        text: 'Our grandmothers knew which trees the bees loved. We are simply writing it down — and putting it on the internet.',
        caption: 'Rathanak Yim, coffee and honey harvester, Mondulkiri',
      },
      {
        type: 'heading',
        text: 'Quality over quantity',
      },
      {
        type: 'paragraph',
        text: "The signals are encouraging. Kampot pepper's protected status — Cambodia's first — has raised farm-gate prices across the province. Fragrant Phka Malis rice now commands a premium in markets that once bought on weight alone. Certifications, geographical indications and honest labelling are turning Cambodian from a discount word into a provenance to pay for. The country cannot out-spend its neighbours; it can out-care them.",
      },
      {
        type: 'paragraph',
        text: "The challenges are real: a changing monsoon, thinning floods, land pressure and the pull of city wages. The responses are being tested now — agroforestry on the highlands, revived Angkorian canals on the plains, seed banks in village nurseries, and cooperatives that share drying houses the way they once shared buffalo.",
      },
      {
        type: 'heading',
        text: 'The next harvest',
      },
      {
        type: 'paragraph',
        text: "Ask Rathanak Yim what success looks like in twenty years and he does not mention tonnage. A Cambodia known not only for its ancient temples, he says, but for its living fields. Every tin of Mondulkiri coffee that reaches a kitchen far from the highlands is a small down payment on that future.",
      },
    ],
  },
];
