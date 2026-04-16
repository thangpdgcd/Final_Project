export const blogs = [
  {
    id: 'robusta',
    title: 'Robusta: Mạnh mẽ, dày body và “đá” caffeine',
    author: 'Phan Coffee Lab',
    date: '2026-03-18',
    excerpt:
      'Robusta không chỉ là “đắng”: nếu rang đúng và pha đúng, robusta có body dày, crema đẹp và vị cacao/đậu rang rất cuốn.',
    image:
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1400&q=80',
    tags: ['robusta', 'beans', 'vietnam'],
    content: {
      intro:
        'Robusta (Coffea canephora) nổi tiếng với hàm lượng caffeine cao và cấu trúc vị mạnh. Ở Việt Nam, robusta là “xương sống” của nhiều ly cà phê sữa đá nhờ body dày, vị đậm và hậu vị kéo dài.',
      sections: [
        {
          title: 'Hương vị đặc trưng',
          bullets: [
            'Body dày, cảm giác “nặng” và chắc',
            'Nốt cacao, đậu rang, caramel cháy, đôi khi hơi gỗ/đất nếu xử lý kém',
            'Crema dày khi chiết espresso (đặc biệt với blend robusta)',
          ],
        },
        {
          title: 'Vì sao robusta dễ bị hiểu lầm?',
          bullets: [
            'Rang quá đậm để “che” khuyết điểm khiến vị đắng gắt',
            'Pha quá chiết (over-extract) làm chát và khô',
            'Chất lượng hạt không đồng đều khiến mùi “khét”/“cao su” xuất hiện',
          ],
        },
        {
          title: 'Gợi ý pha ngon (dễ áp dụng)',
          bullets: [
            'Phin: giảm nhiệt độ nước (90–92°C) và rút ngắn thời gian để bớt đắng gắt',
            'Espresso: giảm yield hoặc giảm thời gian nếu thấy vị chát',
            'Cold brew robusta: cho ra vị cacao và ngọt dịu bất ngờ',
          ],
        },
      ],
      conclusion:
        'Robusta ngon là robusta được xử lý tốt và rang cân bằng. Nếu bạn thích ly cà phê “đậm – tỉnh”, robusta là lựa chọn rất đáng thử.',
    },
  },
  {
    id: 'arabica',
    title: 'Arabica: Thanh thoát, thơm và đa tầng hương',
    author: 'Minh Nguyen',
    date: '2026-02-11',
    excerpt:
      'Arabica thường nổi bật bởi hương hoa/quả, độ chua dễ chịu và hậu vị sạch. Điểm hay nhất: mỗi vùng trồng cho một “tính cách” khác nhau.',
    image:
      'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=1400&q=80',
    tags: ['arabica', 'single-origin', 'brew'],
    content: {
      intro:
        'Arabica (Coffea arabica) thường được đánh giá cao nhờ độ thơm và sự đa dạng hương vị. Nếu robusta cho cảm giác “mạnh”, arabica cho cảm giác “tinh tế”.',
      sections: [
        {
          title: 'Arabica ngon thường có gì?',
          bullets: [
            'Hương hoa, trái cây, mật ong hoặc chocolate sữa',
            'Độ chua cân bằng (không “gắt”), hậu vị sạch',
            'Body vừa phải, dễ uống đen hoặc latte',
          ],
        },
        {
          title: 'Chọn arabica theo gu',
          bullets: [
            'Thích thơm hoa/quả: ưu tiên rang sáng (light–medium)',
            'Thích ngọt và êm: rang medium, notes caramel/chocolate',
            'Thích latte: chọn rang medium–dark để nổi vị sữa',
          ],
        },
        {
          title: 'Pha pour-over để “mở” hương',
          bullets: [
            'Tỉ lệ gợi ý: 1:15 đến 1:16',
            'Bloom 30–45s để khí CO₂ thoát ra',
            'Chia nước thành 2–3 lần rót để ổn định chiết xuất',
          ],
        },
      ],
      conclusion:
        'Arabica phù hợp khi bạn muốn “nghe” rõ hương vị của từng vùng trồng. Chỉ cần thay cách pha và mức rang, bạn sẽ có trải nghiệm hoàn toàn khác.',
    },
  },
  {
    id: 'cold-brew',
    title: 'Cold Brew: Mịn, ngọt dịu và ít gắt',
    author: 'Anh Vu',
    date: '2026-01-26',
    excerpt:
      'Cold brew ủ lạnh cho ra ly cà phê ít chua gắt, vị ngọt tự nhiên và rất hợp để pha cùng sữa/tonic trong ngày nóng.',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1400&q=80',
    tags: ['cold brew', 'iced', 'brew'],
    content: {
      intro:
        'Cold brew là phương pháp ủ cà phê với nước lạnh trong thời gian dài. Do cơ chế chiết xuất khác, cold brew thường “êm” hơn, ít gắt và dễ uống.',
      sections: [
        {
          title: 'Cold brew khác iced coffee thế nào?',
          bullets: [
            'Iced coffee: pha nóng rồi làm lạnh → sáng vị, có độ “tươi”',
            'Cold brew: ủ lạnh → mịn, ít chua gắt, thiên về cacao/caramel',
          ],
        },
        {
          title: 'Công thức cold brew dễ làm',
          bullets: [
            'Tỉ lệ concentrate: 1:5 (cà phê:nước) ủ 12–16 giờ',
            'Uống: pha loãng 1:1 với nước/đá hoặc thêm sữa',
            'Xay thô để giảm đục và giảm over-extract',
          ],
        },
        {
          title: 'Mẹo để cold brew ngon hơn',
          bullets: [
            'Dùng rang medium để có vị ngọt rõ',
            'Lọc 2 lớp (rây + giấy) để sạch vị',
            'Bảo quản lạnh 3–5 ngày, hương vị ổn định',
          ],
        },
      ],
      conclusion:
        'Cold brew là lựa chọn “an toàn” cho ngày nóng: dễ làm, dễ uống, linh hoạt mix đồ uống.',
    },
  },
  {
    id: 'kon-tum',
    title: 'Cà phê Tây Nguyên: Kon Tum có gì đặc biệt?',
    author: 'Phan Coffee Lab',
    date: '2026-03-03',
    excerpt:
      'Kon Tum nằm ở vùng Tây Nguyên với khí hậu và thổ nhưỡng đặc trưng. Nhiều lô hạt cho vị cacao, hạt dẻ và hậu vị sạch rất hợp gu Việt.',
    image:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80',
    tags: ['kon tum', 'tay nguyen', 'vietnam', 'origin'],
    content: {
      intro:
        'Kon Tum thuộc Tây Nguyên, có cao độ và khí hậu phù hợp cho robusta chất lượng, và một số vùng còn trồng arabica. Khi được chế biến tốt, cà phê Kon Tum có profile rất “dễ ghiền”.',
      sections: [
        {
          title: 'Profile vị thường gặp',
          bullets: [
            'Cacao, hạt dẻ, caramel',
            'Body tròn, hậu vị sạch',
            'Rất hợp phin, espresso blend và cold brew',
          ],
        },
        {
          title: 'Yếu tố tạo nên khác biệt',
          bullets: [
            'Thổ nhưỡng bazan và mùa nắng rõ rệt giúp hạt phát triển đậm vị',
            'Chế biến (honey/washed/natural) quyết định độ sạch và nốt hương',
            'Rang vừa giúp giữ ngọt, rang quá đậm dễ mất hương',
          ],
        },
        {
          title: 'Gợi ý chọn hạt Kon Tum',
          bullets: [
            'Ưu tiên thông tin lô: vùng trồng, độ cao, phương pháp chế biến',
            'Tìm roast date mới (2–6 tuần) để hương thơm rõ',
            'Nếu pha phin: chọn rang medium–dark cân bằng',
          ],
        },
      ],
      conclusion:
        'Nếu bạn muốn một ly cà phê đậm vị nhưng vẫn “sạch”, Kon Tum là một origin Việt Nam rất đáng khám phá.',
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

