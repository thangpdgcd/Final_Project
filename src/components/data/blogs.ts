import type { BlogPost } from '@/types/blog/blog.types';

export const blogs: BlogPost[] = [
  {
    id: 'mang-den',
    title: 'Mang Den (Kon Tum): “Little Da Lat” and the story of highland coffee',
    author: 'Phan Coffee Lab',
    date: '2026-04-19',
    excerpt:
      'Cool weather, morning mist, and pine forests shape a distinctive origin. Mang Den coffees often taste clean, gently sweet, and aromatic.',
    image:
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80',
    tags: ['kon tum', 'mang den', 'origin', 'vietnam'],
    content: {
      intro:
        'Mang Den is in Kon Plong district (Kon Tum), known for its year-round cool climate and forest ecosystem. For coffee, these conditions often mean slower cherry ripening, better sugar development, and a cup that feels smooth and clean.',
      sections: [
        {
          title: 'How climate and soil shape the cup',
          bullets: [
            'Cool temperatures and day–night swings support aromatic complexity',
            'Basalt/red soils rich in minerals help build round body and a longer finish',
            'Distinct rainy/dry seasons influence sweetness and clarity in processing',
          ],
        },
        {
          title: 'Common flavor cues (easy to spot)',
          bullets: [
            'Gentle caramel/honey-like sweetness',
            'Cocoa, nutty notes, sometimes a light floral lift',
            'A clean finish with less “burnt” character when roasted medium',
          ],
        },
        {
          title: 'Roast and brew suggestions for Mang Den',
          bullets: [
            'Medium roast: balanced sweetness and aroma, great for pour-over and espresso',
            'Medium–dark: works for phin and iced milk coffee, but avoid going too dark',
            'Phin: aim for 90–92°C water to keep the cup smooth and less harsh',
          ],
        },
      ],
      conclusion:
        'If you want a Vietnamese origin experience that still feels refined and clean, Mang Den is worth a dedicated tasting session.',
    },
  },
  {
    id: 'robusta',
    title: 'Robusta: bold, full-bodied, and caffeine-forward',
    author: 'Phan Coffee Lab',
    date: '2026-03-18',
    excerpt:
      'Robusta isn’t just “bitter”. With good green coffee, proper roasting, and the right brew, it delivers heavy body, thick crema, and addictive cocoa/roasted-nut notes.',
    image:
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1400&q=80',
    tags: ['robusta', 'beans', 'vietnam'],
    content: {
      intro:
        'Robusta (Coffea canephora) is known for higher caffeine and a powerful structure. In Vietnam, it’s the backbone of many iced milk coffees thanks to its thick body, bold taste, and long finish.',
      sections: [
        {
          title: 'Signature flavor profile',
          bullets: [
            'Heavy body with a dense, weighty mouthfeel',
            'Cocoa, roasted nuts, burnt caramel; can turn woody/earthy if quality is low',
            'Thick crema in espresso (especially in robusta-forward blends)',
          ],
        },
        {
          title: 'Why robusta is often misunderstood',
          bullets: [
            'Over-roasting to “hide” defects creates harsh bitterness',
            'Over-extraction leads to astringency and a dry finish',
            'Inconsistent lots can produce burnt/rubbery off-notes',
          ],
        },
        {
          title: 'Easy brewing tips that work',
          bullets: [
            'Phin: use cooler water (90–92°C) and shorten brew time to reduce harshness',
            'Espresso: reduce yield or time if the cup turns astringent',
            'Robusta cold brew: surprisingly cocoa-forward with gentle sweetness',
          ],
        },
      ],
      conclusion:
        'Great robusta is well-processed and roasted with balance. If you love coffee that’s bold and energizing, robusta is absolutely worth exploring.',
    },
  },
  {
    id: 'arabica',
    title: 'Arabica: refined, aromatic, and layered',
    author: 'Minh Nguyen',
    date: '2026-02-11',
    excerpt:
      'Arabica often shines with floral/fruit aromatics, pleasant acidity, and a clean finish. The best part: each origin has a distinct “personality”.',
    image:
      'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=1400&q=80',
    tags: ['arabica', 'single-origin', 'brew'],
    content: {
      intro:
        'Arabica (Coffea arabica) is prized for its aroma and flavor diversity. If robusta feels “powerful”, arabica often feels “nuanced”.',
      sections: [
        {
          title: 'What great arabica usually tastes like',
          bullets: [
            'Floral, fruity, honeyed, or milk-chocolate-like notes',
            'Balanced acidity (not sharp) with a clean finish',
            'Medium body—easy to enjoy black or in a latte',
          ],
        },
        {
          title: 'Choosing arabica for your preferences',
          bullets: [
            'For floral/fruit aromatics: light to medium roast',
            'For sweetness and comfort: medium roast with caramel/chocolate notes',
            'For lattes: medium–dark to stand up to milk',
          ],
        },
        {
          title: 'Pour-over to “open up” the aromatics',
          bullets: [
            'Suggested ratio: 1:15 to 1:16',
            'Bloom 30–45s to release CO₂',
            'Split pours into 2–3 pulses for steadier extraction',
          ],
        },
      ],
      conclusion:
        'Arabica is ideal when you want to “hear” an origin clearly. Change the brew method or roast level and you can get a completely different experience.',
    },
  },
  {
    id: 'cold-brew',
    title: 'Cold brew: smooth, gently sweet, and less harsh',
    author: 'Anh Vu',
    date: '2026-01-26',
    excerpt:
      'Cold brew tends to be less sharp, naturally sweet, and perfect to mix with milk or tonic on hot days.',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1400&q=80',
    tags: ['cold brew', 'iced', 'brew'],
    content: {
      intro:
        'Cold brew is coffee steeped in cold water for an extended time. Because extraction behaves differently at low temperatures, it often tastes smoother and easier to drink.',
      sections: [
        {
          title: 'How cold brew differs from iced coffee',
          bullets: [
            'Iced coffee: brewed hot then chilled → brighter and more “fresh”',
            'Cold brew: steeped cold → smoother, less sharp, leaning cocoa/caramel',
          ],
        },
        {
          title: 'An easy cold brew recipe',
          bullets: [
            'Concentrate ratio: 1:5 (coffee:water), steep 12–16 hours',
            'Serve: dilute 1:1 with water/ice, or add milk',
            'Grind coarse to reduce muddiness and over-extraction',
          ],
        },
        {
          title: 'Tips to make it taste better',
          bullets: [
            'Use a medium roast for clearer sweetness',
            'Filter twice (mesh + paper) for a cleaner cup',
            'Store cold for 3–5 days; flavor stays stable',
          ],
        },
      ],
      conclusion:
        'Cold brew is a “safe win” for warm days: easy to make, easy to drink, and flexible for mixing.',
    },
  },
  {
    id: 'kon-tum',
    title: 'Central Highlands coffee: what makes Kon Tum special?',
    author: 'Phan Coffee Lab',
    date: '2026-03-03',
    excerpt:
      'Kon Tum sits in Vietnam’s Central Highlands with distinctive climate and soils. Many lots show cocoa, nutty notes, and a clean finish that fits local preferences.',
    image:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80',
    tags: ['kon tum', 'tay nguyen', 'vietnam', 'origin'],
    content: {
      intro:
        'Kon Tum is part of the Central Highlands, with elevations and climate suitable for quality robusta, and some areas also grow arabica. When processed well, Kon Tum coffee can be intensely satisfying and easy to love.',
      sections: [
        {
          title: 'Common cup profile',
          bullets: [
            'Cocoa, nuts, caramel',
            'Round body with a clean finish',
            'Great for phin, espresso blends, and cold brew',
          ],
        },
        {
          title: 'What creates the difference',
          bullets: [
            'Basalt soils and strong dry seasons help build depth of flavor',
            'Processing (honey/washed/natural) defines clarity and aromatics',
            'Medium roasts preserve sweetness; too dark can mute aromas',
          ],
        },
        {
          title: 'How to choose Kon Tum beans',
          bullets: [
            'Prefer transparent lot info: region, altitude, processing method',
            'Choose fresher roast dates (2–6 weeks) for clearer aroma',
            'For phin: go medium–dark but keep it balanced',
          ],
        },
      ],
      conclusion:
        'If you want bold flavor that still tastes clean, Kon Tum is a Vietnamese origin worth exploring.',
    },
  },
  {
    id: 'kon-tum-processing',
    title: 'Washed / Honey / Natural: which process fits Kon Tum coffee best?',
    author: 'Phan Coffee Lab',
    date: '2026-04-10',
    excerpt:
      'Same origin, different processing—completely different personalities. Pick the right process to match your taste without pushing the roast too dark.',
    image:
      'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1400&q=80',
    tags: ['processing', 'washed', 'honey', 'natural', 'kon tum'],
    content: {
      intro:
        'Post-harvest processing shapes the final flavor dramatically. With Kon Tum coffees, you’ll commonly see washed, honey, and natural processes.',
      sections: [
        {
          title: 'Washed: clean and bright',
          bullets: [
            'Clean finish with sweetness that’s easy to perceive',
            'Great for pour-over and brighter-style espresso',
            'If you dislike fermented notes, washed is the safest bet',
          ],
        },
        {
          title: 'Honey: sweeter, fuller body',
          bullets: [
            'Some mucilage is kept → more sweetness and body than washed',
            'Excellent for phin and espresso blends (crema + longer finish)',
            'If you like “smooth – sweet – aromatic”, honey is a balanced choice',
          ],
        },
        {
          title: 'Natural: fruitier with a light “winey” vibe',
          bullets: [
            'Can highlight ripe, bold fruit notes',
            'More likely to show fermenty notes if processing is inconsistent',
            'Great for cold brew or pour-over if you want something adventurous',
          ],
        },
      ],
      conclusion:
        'For everyday drinking, choose washed/honey. For experimentation, try natural (from a reliable roaster with transparent lot info).',
    },
  },
  {
    id: 'arabica-vs-robusta-vn',
    title: 'Arabica vs Robusta (Vietnamese preferences): which for phin, espresso, and iced milk coffee?',
    author: 'Phan Coffee Lab',
    date: '2026-04-05',
    excerpt:
      'There is no “best bean”—only the bean that fits your taste. Match Arabica/Robusta to your brew style for better cups without complicated technique.',
    image:
      'https://images.unsplash.com/photo-1516224498413-84ecf3a1e7aa?auto=format&fit=crop&w=1400&q=80',
    tags: ['arabica', 'robusta', 'phin', 'espresso', 'vietnam'],
    content: {
      intro:
        'Arabica is usually aromatic, layered, and balanced in acidity. Robusta is bold, full-bodied, and higher in caffeine. For Vietnamese preferences, both shine when paired with the right brew method.',
      sections: [
        {
          title: 'If you brew with a phin',
          bullets: [
            'For bold iced milk coffee: robusta or a robusta–arabica blend (thick body, flavors cut through milk)',
            'For smooth black coffee: medium-roast arabica or a well-made honey robusta',
            'Reduce harsh bitterness with 90–92°C water and avoid over-tamping',
          ],
        },
        {
          title: 'If you pull espresso',
          bullets: [
            'Robusta in a blend boosts crema and body for milk drinks',
            'Single-origin arabica fits brighter espresso or an Americano',
            'If it tastes sour: grind finer/increase time. If bitter/astringent: grind coarser/reduce yield',
          ],
        },
        {
          title: 'If you make cold brew',
          bullets: [
            'Robusta can taste cocoa/caramel-forward and smoother than you’d expect',
            'Arabica can be gently floral/fruity and pairs well with tonic',
            'Steep 12–16h, grind coarse, filter well for a clean finish',
          ],
        },
      ],
      conclusion:
        'Start with the brew method you drink most often, then pick the bean that fits—that’s the fastest way to level up your coffee.',
    },
  },
  {
    id: 'b5',
    title: 'Espresso 101: Understanding Ratio, Yield, and Extraction',
    author: 'Phan Coffee Lab',
    date: '2026-02-28',
    excerpt:
      'Bitter? Sour? Thin? Learn how espresso ratio and yield translate into taste, and which variable to change first.',
    image:
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'b6',
    title: 'Coffee Culture: Why Cafés Became Our Third Place',
    author: 'Linh Tran',
    date: '2026-01-09',
    excerpt:
      'Cafés are more than caffeine stops—learn how community, design, and rituals turned coffee spaces into modern sanctuaries.',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=80',
  },
];
