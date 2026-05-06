import type { BlogPost } from '@/types/blog/blog.types';

export const blogs: BlogPost[] = [
  {
    id: 'mang-den',
    title: 'Mang Den (Kon Tum): “Little Da Lat” and the story of highland coffee',
    title_vi: 'Măng Đen (Kon Tum): “Tiểu Đà Lạt” và câu chuyện cà phê cao nguyên',
    author: 'Phan Coffee Lab',
    date: '2026-04-19',
    excerpt:
      'Cool weather, morning mist, and pine forests shape a distinctive origin. Mang Den coffees often taste clean, gently sweet, and aromatic.',
    excerpt_vi:
      'Khí hậu mát mẻ, sương sớm và rừng thông tạo nên một nguồn gốc khác biệt. Cà phê Măng Đen thường sạch vị, ngọt dịu và thơm rõ.',
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
    content_vi: {
      intro:
        'Măng Đen thuộc huyện Kon Plông (Kon Tum), nổi tiếng với khí hậu mát quanh năm và hệ sinh thái rừng. Với cà phê, điều kiện này thường giúp quả chín chậm hơn, đường phát triển tốt hơn và tách cà phê mượt — sạch — rõ vị.',
      sections: [
        {
          title: 'Khí hậu và thổ nhưỡng ảnh hưởng tách cà phê thế nào?',
          bullets: [
            'Nhiệt độ mát và chênh lệch ngày–đêm giúp hương thơm phức hợp hơn',
            'Đất đỏ/bazan giàu khoáng góp phần tạo thân vị tròn và hậu vị dài',
            'Mùa mưa–khô rõ rệt tác động đến độ ngọt và độ “clarity” của sơ chế',
          ],
        },
        {
          title: 'Dấu hiệu hương vị thường gặp (dễ nhận ra)',
          bullets: [
            'Ngọt dịu kiểu caramel/mật ong',
            'Ca cao, hạt (nutty), đôi khi có chút hương hoa nhẹ',
            'Hậu vị sạch, ít “khét” hơn khi rang vừa (medium)',
          ],
        },
        {
          title: 'Gợi ý rang & pha cho cà phê Măng Đen',
          bullets: [
            'Rang vừa (medium): cân bằng ngọt–thơm, hợp pour-over và espresso',
            'Vừa–đậm (medium–dark): hợp phin và cà phê sữa đá, nhưng tránh rang quá tối',
            'Pha phin: dùng nước 90–92°C để tách cà phê êm và bớt gắt',
          ],
        },
      ],
      conclusion:
        'Nếu bạn muốn một trải nghiệm cà phê nguồn gốc Việt Nam nhưng vẫn tinh tế và sạch sẽ, Măng Đen xứng đáng cho một buổi thưởng thức riêng.',
    },
  },
  {
    id: 'robusta',
    title: 'Robusta: bold, full-bodied, and caffeine-forward',
    title_vi: 'Robusta: đậm, thân dày và giàu caffeine',
    author: 'Phan Coffee Lab',
    date: '2026-03-18',
    excerpt:
      'Robusta isn’t just “bitter”. With good green coffee, proper roasting, and the right brew, it delivers heavy body, thick crema, and addictive cocoa/roasted-nut notes.',
    excerpt_vi:
      'Robusta không chỉ là “đắng”. Với hạt tốt, rang chuẩn và pha đúng, robusta cho thân vị dày, crema dày và nốt ca cao/hạt rang rất cuốn.',
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
    content_vi: {
      intro:
        'Robusta (Coffea canephora) nổi bật với caffeine cao và cấu trúc mạnh. Ở Việt Nam, robusta là “xương sống” của nhiều ly cà phê sữa đá nhờ thân dày, vị đậm và hậu vị kéo dài.',
      sections: [
        {
          title: 'Hương vị đặc trưng',
          bullets: [
            'Thân vị nặng, cảm giác miệng dày và “đằm”',
            'Ca cao, hạt rang, caramel cháy; nếu hạt kém có thể bị gỗ/đất',
            'Crema dày khi pha espresso (đặc biệt ở blend thiên robusta)',
          ],
        },
        {
          title: 'Vì sao robusta hay bị hiểu lầm?',
          bullets: [
            'Rang quá đậm để “che” khuyết điểm khiến đắng gắt',
            'Chiết xuất quá tay gây chát và hậu khô',
            'Lô hạt không ổn định dễ tạo mùi khét/cao su',
          ],
        },
        {
          title: 'Mẹo pha dễ áp dụng',
          bullets: [
            'Pha phin: dùng nước 90–92°C và rút ngắn thời gian để giảm gắt',
            'Espresso: giảm yield hoặc thời gian nếu bị chát',
            'Cold brew robusta: thường cho nốt ca cao rõ và ngọt dịu bất ngờ',
          ],
        },
      ],
      conclusion:
        'Robusta ngon là robusta được sơ chế tốt và rang cân bằng. Nếu bạn thích cà phê đậm và “đã”, robusta rất đáng để khám phá.',
    },
  },
  {
    id: 'arabica',
    title: 'Arabica: refined, aromatic, and layered',
    title_vi: 'Arabica: tinh tế, thơm và nhiều tầng hương',
    author: 'Minh Nguyen',
    date: '2026-02-11',
    excerpt:
      'Arabica often shines with floral/fruit aromatics, pleasant acidity, and a clean finish. The best part: each origin has a distinct “personality”.',
    excerpt_vi:
      'Arabica thường nổi bật với hương hoa/quả, độ chua dễ chịu và hậu vị sạch. Điểm hay nhất: mỗi vùng trồng có một “tính cách” riêng.',
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
    content_vi: {
      intro:
        'Arabica (Coffea arabica) được yêu thích vì độ thơm và sự đa dạng hương vị. Nếu robusta “mạnh mẽ”, arabica thường “tinh tế” và nhiều lớp hơn.',
      sections: [
        {
          title: 'Arabica ngon thường có vị thế nào?',
          bullets: [
            'Hương hoa, trái cây, mật ong hoặc kiểu chocolate sữa',
            'Độ chua cân bằng (không gắt) và hậu vị sạch',
            'Thân vị vừa — dễ uống đen hoặc pha sữa',
          ],
        },
        {
          title: 'Chọn arabica theo gu',
          bullets: [
            'Thích hương hoa/quả: rang sáng đến vừa (light–medium)',
            'Thích ngọt và “comfort”: rang vừa với nốt caramel/chocolate',
            'Pha latte: rang vừa–đậm để “đứng” với sữa',
          ],
        },
        {
          title: 'Pour-over để “mở” hương',
          bullets: [
            'Tỷ lệ gợi ý: 1:15 đến 1:16',
            'Bloom 30–45s để xả CO₂',
            'Chia 2–3 nhịp rót để chiết xuất ổn định hơn',
          ],
        },
      ],
      conclusion:
        'Arabica phù hợp khi bạn muốn cảm nhận nguồn gốc một cách rõ ràng. Chỉ cần đổi phương pháp pha hoặc mức rang, trải nghiệm có thể khác hẳn.',
    },
  },
  {
    id: 'cold-brew',
    title: 'Cold brew: smooth, gently sweet, and less harsh',
    title_vi: 'Cold brew: êm, ngọt dịu và ít gắt',
    author: 'Anh Vu',
    date: '2026-01-26',
    excerpt:
      'Cold brew tends to be less sharp, naturally sweet, and perfect to mix with milk or tonic on hot days.',
    excerpt_vi:
      'Cold brew thường ít “sắc” hơn, ngọt tự nhiên và rất hợp pha cùng sữa hoặc tonic trong ngày nóng.',
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
    content_vi: {
      intro:
        'Cold brew là cà phê ủ lạnh trong nước ở thời gian dài. Do cơ chế chiết xuất ở nhiệt độ thấp khác với pha nóng, cold brew thường cho vị êm và dễ uống hơn.',
      sections: [
        {
          title: 'Cold brew khác gì cà phê đá (iced coffee)?',
          bullets: [
            'Iced coffee: pha nóng rồi làm lạnh → tươi, sáng và “fresh” hơn',
            'Cold brew: ủ lạnh → êm, ít gắt, thiên về ca cao/caramel',
          ],
        },
        {
          title: 'Công thức cold brew đơn giản',
          bullets: [
            'Tỷ lệ concentrate: 1:5 (cà phê:nước), ủ 12–16 giờ',
            'Khi uống: pha loãng 1:1 với nước/đá, hoặc thêm sữa',
            'Xay thô để giảm đục và tránh chiết xuất quá mức',
          ],
        },
        {
          title: 'Mẹo để ngon hơn',
          bullets: [
            'Dùng rang vừa để vị ngọt rõ và sạch',
            'Lọc 2 lần (lưới + giấy) cho tách sạch hơn',
            'Bảo quản lạnh 3–5 ngày, hương vị khá ổn định',
          ],
        },
      ],
      conclusion:
        'Cold brew là lựa chọn “an toàn” cho ngày nóng: dễ làm, dễ uống và linh hoạt khi pha trộn.',
    },
  },
  {
    id: 'kon-tum',
    title: 'Central Highlands coffee: what makes Kon Tum special?',
    title_vi: 'Cà phê Tây Nguyên: điều gì làm Kon Tum đặc biệt?',
    author: 'Phan Coffee Lab',
    date: '2026-03-03',
    excerpt:
      'Kon Tum sits in Vietnam’s Central Highlands with distinctive climate and soils. Many lots show cocoa, nutty notes, and a clean finish that fits local preferences.',
    excerpt_vi:
      'Kon Tum nằm ở Tây Nguyên với khí hậu và thổ nhưỡng đặc trưng. Nhiều lô cà phê có nốt ca cao, hạt rang và hậu vị sạch — hợp gu uống Việt.',
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
    content_vi: {
      intro:
        'Kon Tum thuộc vùng Tây Nguyên, có độ cao và khí hậu phù hợp cho robusta chất lượng; một số khu vực cũng trồng arabica. Khi sơ chế tốt, cà phê Kon Tum rất “đã” mà vẫn sạch vị, dễ yêu.',
      sections: [
        {
          title: 'Chân dung hương vị thường gặp',
          bullets: ['Ca cao, hạt, caramel', 'Thân vị tròn và hậu vị sạch', 'Hợp phin, blend espresso và cold brew'],
        },
        {
          title: 'Điều gì tạo nên khác biệt?',
          bullets: [
            'Đất bazan và mùa khô rõ rệt giúp hương vị có chiều sâu',
            'Sơ chế (honey/washed/natural) quyết định độ sạch và hương',
            'Rang vừa giữ độ ngọt; rang quá đậm dễ “dìm” hương',
          ],
        },
        {
          title: 'Chọn hạt Kon Tum thế nào?',
          bullets: [
            'Ưu tiên thông tin rõ ràng: vùng, độ cao, phương pháp sơ chế',
            'Chọn ngày rang mới hơn (2–6 tuần) để hương rõ',
            'Pha phin: có thể chọn vừa–đậm nhưng giữ cân bằng',
          ],
        },
      ],
      conclusion:
        'Nếu bạn thích vị đậm nhưng vẫn sạch và “gọn”, Kon Tum là một nguồn gốc Việt Nam rất đáng khám phá.',
    },
  },
  {
    id: 'kon-tum-processing',
    title: 'Washed / Honey / Natural: which process fits Kon Tum coffee best?',
    title_vi: 'Washed / Honey / Natural: sơ chế nào hợp cà phê Kon Tum nhất?',
    author: 'Phan Coffee Lab',
    date: '2026-04-10',
    excerpt:
      'Same origin, different processing—completely different personalities. Pick the right process to match your taste without pushing the roast too dark.',
    excerpt_vi:
      'Cùng một nguồn gốc nhưng sơ chế khác nhau sẽ cho “tính cách” hoàn toàn khác. Chọn đúng sơ chế để hợp gu mà không cần rang quá đậm.',
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
    content_vi: {
      intro:
        'Sơ chế sau thu hoạch ảnh hưởng rất mạnh đến hương vị cuối cùng. Với cà phê Kon Tum, bạn sẽ thường gặp washed, honey và natural.',
      sections: [
        {
          title: 'Washed: sạch và sáng',
          bullets: [
            'Hậu vị sạch, độ ngọt dễ nhận',
            'Hợp pour-over và espresso kiểu sáng',
            'Nếu bạn không thích mùi lên men, washed là lựa chọn an toàn',
          ],
        },
        {
          title: 'Honey: ngọt hơn, thân dày hơn',
          bullets: [
            'Giữ lại một phần lớp nhầy → ngọt và dày hơn washed',
            'Hợp phin và blend espresso (crema + hậu vị dài)',
            'Nếu bạn thích “êm – ngọt – thơm”, honey là lựa chọn cân bằng',
          ],
        },
        {
          title: 'Natural: trái cây hơn, hơi “winey”',
          bullets: [
            'Có thể làm nổi bật nốt trái cây chín rõ',
            'Dễ xuất hiện mùi “ferment” nếu sơ chế không ổn định',
            'Hợp cold brew hoặc pour-over nếu bạn thích trải nghiệm mới',
          ],
        },
      ],
      conclusion:
        'Dùng hằng ngày: ưu tiên washed/honey. Muốn thử nghiệm: chọn natural từ roaster uy tín, thông tin lô rõ ràng.',
    },
  },
  {
    id: 'arabica-vs-robusta-vn',
    title: 'Arabica vs Robusta (Vietnamese preferences): which for phin, espresso, and iced milk coffee?',
    title_vi: 'Arabica vs Robusta (gu Việt): chọn gì cho phin, espresso và cà phê sữa đá?',
    author: 'Phan Coffee Lab',
    date: '2026-04-05',
    excerpt:
      'There is no “best bean”—only the bean that fits your taste. Match Arabica/Robusta to your brew style for better cups without complicated technique.',
    excerpt_vi:
      'Không có “hạt ngon nhất”, chỉ có hạt hợp gu. Ghép Arabica/Robusta với cách pha bạn uống nhiều nhất để nâng cấp tách cà phê mà không cần kỹ thuật phức tạp.',
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
    content_vi: {
      intro:
        'Arabica thường thơm, nhiều tầng hương và có độ chua cân bằng. Robusta đậm, thân dày và nhiều caffeine. Với gu Việt, cả hai đều rất “đúng bài” nếu đi với phương pháp pha phù hợp.',
      sections: [
        {
          title: 'Nếu bạn pha phin',
          bullets: [
            'Cà phê sữa đá đậm: robusta hoặc blend robusta–arabica (thân dày, vị “đứng” với sữa)',
            'Cà phê đen êm: arabica rang vừa hoặc honey robusta chất lượng',
            'Giảm gắt: dùng nước 90–92°C và tránh nén quá mạnh',
          ],
        },
        {
          title: 'Nếu bạn pha espresso',
          bullets: [
            'Thêm robusta vào blend giúp crema và body cho đồ uống sữa',
            'Single-origin arabica hợp espresso sáng hoặc Americano',
            'Nếu chua: xay mịn hơn/tăng thời gian. Nếu đắng/chát: xay thô hơn/giảm yield',
          ],
        },
        {
          title: 'Nếu bạn làm cold brew',
          bullets: [
            'Robusta thường ra nốt ca cao/caramel rõ và êm hơn bạn nghĩ',
            'Arabica có thể cho hương hoa/quả nhẹ, hợp pha tonic',
            'Ủ 12–16h, xay thô, lọc kỹ để hậu vị sạch',
          ],
        },
      ],
      conclusion:
        'Hãy bắt đầu từ cách pha bạn uống nhiều nhất, rồi chọn hạt hợp gu — đó là cách nhanh nhất để “lên level” cà phê.',
    },
  },
  {
    id: 'b5',
    title: 'Espresso 101: Understanding Ratio, Yield, and Extraction',
    title_vi: 'Espresso 101: hiểu về ratio, yield và chiết xuất',
    author: 'Phan Coffee Lab',
    date: '2026-02-28',
    excerpt:
      'Bitter? Sour? Thin? Learn how espresso ratio and yield translate into taste, and which variable to change first.',
    excerpt_vi:
      'Đắng? Chua? Loãng? Tìm hiểu ratio/yield ảnh hưởng đến vị ra sao và nên chỉnh biến số nào trước.',
    image:
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'b6',
    title: 'Coffee Culture: Why Cafés Became Our Third Place',
    title_vi: 'Văn hoá cà phê: vì sao quán cà phê trở thành “không gian thứ ba”?',
    author: 'Linh Tran',
    date: '2026-01-09',
    excerpt:
      'Cafés are more than caffeine stops—learn how community, design, and rituals turned coffee spaces into modern sanctuaries.',
    excerpt_vi:
      'Quán cà phê không chỉ để nạp caffeine—cộng đồng, thiết kế và nghi thức đã biến nơi này thành “chốn trú ẩn” hiện đại.',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=80',
  },
];
