// i18n dictionary. Keys are referenced via [data-i18n="key"] in templates.
// Only static UI strings live here; content collections (services/faq/blog/team/portfolio)
// stay in their source files and are not translated by this mechanism.

export type Locale = 'en' | 'vi';

export const translations: Record<string, Record<Locale, string>> = {
  // Header
  'nav.services': { en: 'Services', vi: 'Dịch vụ' },
  'nav.team': { en: 'Team', vi: 'Đội ngũ' },
  'nav.portfolio': { en: 'Portfolio', vi: 'Dự án' },
  'nav.blog': { en: 'Blog', vi: 'Blog' },
  'nav.contact': { en: 'Contact', vi: 'Liên hệ' },

  // Hero
  'hero.badge': { en: 'HT Labs · Comprehensive AI', vi: 'HT Labs · AI toàn diện' },
  'hero.title.build': { en: 'Build with', vi: 'Xây dựng cùng' },
  'hero.title.intelligent': { en: 'intelligent', vi: 'hệ thống thông minh' },
  'hero.title.systems': { en: 'systems,', vi: ',' },
  'hero.title.endtoend': { en: 'end-to-end.', vi: 'từ đầu đến cuối.' },
  'hero.subtitle': {
    en: 'From infrastructure to agents to integration — we deliver complete AI solutions for businesses ready to operate with intelligence.',
    vi: 'Từ hạ tầng đến trợ lý AI và tích hợp hệ thống — chúng tôi cung cấp giải pháp AI toàn diện cho doanh nghiệp sẵn sàng vận hành thông minh.'
  },
  'hero.cta.start': { en: 'Start a project', vi: 'Bắt đầu dự án' },
  'hero.cta.explore': { en: 'Explore services', vi: 'Khám phá dịch vụ' },
  'hero.status.accepting': { en: 'Accepting Projects', vi: 'Đang nhận dự án' },
  'hero.card.chatbot.title': { en: 'AI Chatbot', vi: 'AI Chatbot' },
  'hero.card.chatbot.desc': { en: '24/7 customer care · auto-routing', vi: 'Chăm sóc 24/7 · điều hướng tự động' },
  'hero.card.social.title': { en: 'Social Agents', vi: 'Trợ lý mạng xã hội' },
  'hero.card.social.desc': { en: 'content · trends · engagement', vi: 'nội dung · xu hướng · tương tác' },
  'hero.card.crm.title': { en: 'CRM & Analytics', vi: 'CRM & Phân tích' },
  'hero.card.crm.desc': { en: 'behavior · funnels · lifecycle', vi: 'hành vi · phễu · vòng đời' },
  'hero.card.online': { en: '● online', vi: '● trực tuyến' },
  'hero.card.uptime': { en: 'uptime', vi: 'thời gian hoạt động' },
  'hero.stat.pillars.label': { en: 'Pillars', vi: 'Trụ cột' },
  'hero.stat.pillars.value': { en: '3 / Layers', vi: '3 / Lớp' },
  'hero.stat.approach.label': { en: 'Approach', vi: 'Phương pháp' },
  'hero.stat.approach.value': { en: 'End-to-end', vi: 'Toàn diện' },
  'hero.stat.founded.label': { en: 'Founded', vi: 'Thành lập' },
  'hero.stat.status.label': { en: 'Status', vi: 'Trạng thái' },
  'hero.stat.status.value': { en: 'Available', vi: 'Sẵn sàng' },

  // About
  'about.eyebrow': { en: 'About Us', vi: 'Về chúng tôi' },
  'about.title': { en: 'Pioneering AI and automation for modern businesses.', vi: 'Tiên phong AI và tự động hóa cho doanh nghiệp hiện đại.' },
  'about.body': {
    en: 'HT Labs specializes in providing comprehensive artificial intelligence and information technology solutions that cover every stage from strategic planning to the deployment of production ready systems. Our primary focus involves delivering sophisticated automation tools and intelligent agents designed to optimize organizational structures across a variety of professional sectors. We empower companies to integrate advanced technologies into their workflows without the need to coordinate with several different vendors.',
    vi: 'HT Labs cung cấp giải pháp AI và công nghệ thông tin toàn diện — từ hoạch định chiến lược đến triển khai hệ thống sẵn sàng vận hành. Chúng tôi tập trung xây dựng công cụ tự động hóa và trợ lý AI giúp tối ưu vận hành doanh nghiệp ở nhiều lĩnh vực, để khách hàng ứng dụng công nghệ mà không cần làm việc với nhiều nhà cung cấp khác nhau.'
  },

  // Partners / AI stack
  'partners.eyebrow': { en: 'AI Stack', vi: 'Nền tảng AI' },
  'partners.title': { en: 'Powered by the latest AI tools on the market.', vi: 'Được vận hành bởi các công cụ AI hàng đầu thị trường.' },
  'partners.body': {
    en: 'We continuously adopt and integrate leading AI models and platforms to deliver effective, accurate, and cost-optimized solutions for our clients.',
    vi: 'Chúng tôi liên tục cập nhật và tích hợp các mô hình AI hàng đầu để đem đến giải pháp hiệu quả, chính xác và tối ưu chi phí cho khách hàng.'
  },

  // Services
  'services.eyebrow': { en: 'Our Services', vi: 'Dịch vụ' },
  'services.title': { en: 'End-to-end AI capabilities.', vi: 'Năng lực AI toàn diện.' },
  'services.body': {
    en: 'HT Labs delivers end-to-end AI solutions — infrastructure, agents, integration, and strategy — so businesses can adopt AI without juggling multiple vendors.',
    vi: 'HT Labs cung cấp giải pháp AI trọn gói — hạ tầng, trợ lý, tích hợp và chiến lược — giúp doanh nghiệp ứng dụng AI mà không cần phối hợp nhiều nhà cung cấp.'
  },

  // WhyUs
  'why.eyebrow': { en: 'Why Choose Us', vi: 'Vì sao chọn chúng tôi' },
  'why.title': { en: 'We commit to high-quality IT and AI services.', vi: 'Cam kết dịch vụ AI và IT chất lượng cao.' },
  'why.body': {
    en: "Supporting our clients' growth is the foundational reason HT Labs is chosen as a long-term IT partner. We work as an extension of your team — measurable results, no jargon.",
    vi: 'Đồng hành cùng sự phát triển của khách hàng là lý do HT Labs được chọn làm đối tác IT dài hạn. Chúng tôi vận hành như một phần đội ngũ của bạn — kết quả đo lường được, không nói suông.'
  },
  'why.metric.value': { en: '95%', vi: '95%' },
  'why.metric.label': { en: 'Client retention rate — measured year over year.', vi: 'Tỷ lệ giữ chân khách hàng — đo lường hằng năm.' },
  'why.r1.title': { en: '24/7 Engineering Support', vi: 'Hỗ trợ kỹ thuật 24/7' },
  'why.r1.desc': { en: 'On-call response from senior engineers — never a generic helpdesk.', vi: 'Phản hồi trực tiếp từ kỹ sư cấp cao — không phải tổng đài chung.' },
  'why.r2.title': { en: 'Certified Specialists', vi: 'Chuyên gia có chứng chỉ' },
  'why.r2.desc': { en: 'Cloud, ML, security — credentials backed by shipping production systems.', vi: 'Cloud, ML, bảo mật — chứng chỉ đi kèm hệ thống đã vận hành thực tế.' },
  'why.r3.title': { en: 'On-site & Remote', vi: 'Tại chỗ & Từ xa' },
  'why.r3.desc': { en: 'Embed with your team or operate fully remote — same quality bar.', vi: 'Làm việc trực tiếp tại doanh nghiệp hoặc từ xa — cùng một chuẩn chất lượng.' },
  'why.r4.title': { en: 'Transparent SLAs', vi: 'SLA minh bạch' },
  'why.r4.desc': { en: 'Clear timelines, clear ownership, clear escalation paths.', vi: 'Tiến độ rõ ràng, trách nhiệm rõ ràng, quy trình xử lý rõ ràng.' },

  // Process
  'process.eyebrow': { en: 'How We Work', vi: 'Quy trình làm việc' },
  'process.title': { en: 'A simple, proven 4-step workflow.', vi: 'Quy trình 4 bước đơn giản, đã được kiểm chứng.' },
  'process.body': {
    en: 'We follow a streamlined process — designed to remove friction and deliver value early.',
    vi: 'Chúng tôi áp dụng quy trình tinh gọn — giảm rào cản, mang lại giá trị sớm.'
  },
  'process.s1.title': { en: 'Intake & Analysis', vi: 'Tiếp nhận & Phân tích' },
  'process.s1.desc': { en: 'Clarify your goals and define the real problem before proposing anything.', vi: 'Làm rõ mục tiêu và xác định vấn đề thực sự trước khi đề xuất giải pháp.' },
  'process.s2.title': { en: 'Solution Proposal', vi: 'Đề xuất giải pháp' },
  'process.s2.desc': { en: 'Practical, applicable options with honest trade-offs and a recommendation.', vi: 'Phương án khả thi, đánh đổi minh bạch và khuyến nghị rõ ràng.' },
  'process.s3.title': { en: 'Deployment', vi: 'Triển khai' },
  'process.s3.desc': { en: 'Build and ship to production — fast iterations, working software each step.', vi: 'Phát triển và đưa lên môi trường thực — lặp nhanh, mỗi bước đều có sản phẩm chạy được.' },
  'process.s4.title': { en: 'Handover & Support', vi: 'Bàn giao & Hỗ trợ' },
  'process.s4.desc': { en: 'Training, documentation, and continuous improvement after go-live.', vi: 'Đào tạo, tài liệu và cải tiến liên tục sau khi vận hành.' },

  // Portfolio
  'portfolio.eyebrow': { en: 'Portfolio', vi: 'Dự án' },
  'portfolio.title': { en: 'Proof in production.', vi: 'Bằng chứng từ thực tế.' },
  'portfolio.body': { en: 'Real systems deployed, running in production, delivering measurable results.', vi: 'Các hệ thống thật, đang vận hành, mang lại kết quả đo lường được.' },
  'portfolio.coming': { en: 'Coming soon', vi: 'Sắp ra mắt' },

  // Team
  'team.eyebrow': { en: 'Our Team', vi: 'Đội ngũ' },
  'team.title': { en: 'The people behind the intelligence.', vi: 'Những con người đằng sau hệ thống AI.' },
  'team.body': { en: 'A focused team of engineers, architects, and strategists building AI solutions that work in production.', vi: 'Đội ngũ kỹ sư, kiến trúc sư và chuyên gia chiến lược tập trung xây dựng giải pháp AI vận hành thực tế.' },

  // FAQ
  'faq.eyebrow': { en: 'FAQ', vi: 'Câu hỏi thường gặp' },
  'faq.title': { en: 'Common questions.', vi: 'Câu hỏi phổ biến.' },
  'faq.body': { en: 'Everything you need to know before getting started with HT Labs.', vi: 'Mọi điều bạn cần biết trước khi bắt đầu với HT Labs.' },

  // Blog preview
  'blog.eyebrow': { en: 'Insights', vi: 'Bài viết' },
  'blog.title': { en: 'Latest articles and insights.', vi: 'Bài viết và góc nhìn mới nhất.' },
  'blog.body': { en: "Notes from the field — what we're learning, building, and shipping.", vi: 'Ghi chép từ thực chiến — những gì chúng tôi đang học, xây dựng và triển khai.' },
  'blog.readmore': { en: 'Read more →', vi: 'Đọc tiếp →' },
  'blog.viewall': { en: 'View all posts →', vi: 'Xem tất cả bài viết →' },

  // PreFooter
  'pre.badge': { en: 'Get Started', vi: 'Bắt đầu' },
  'pre.title': { en: 'Ready to operate AI?', vi: 'Sẵn sàng vận hành AI?' },
  'pre.body': { en: 'Get started with HT Labs today. Email us for a free discovery call.', vi: 'Bắt đầu cùng HT Labs hôm nay. Email để đặt buổi tư vấn miễn phí.' },
  'pre.cta': { en: 'Get Started', vi: 'Bắt đầu' },

  // Footer
  'footer.tagline': { en: 'Operational intelligence and workflow automation. We eliminate manual friction across your stack.', vi: 'Trí tuệ vận hành và tự động hoá quy trình. Chúng tôi loại bỏ thao tác thủ công trên toàn bộ hệ thống của bạn.' },
  'footer.explore': { en: 'Explore', vi: 'Khám phá' },
  'footer.company': { en: 'Company', vi: 'Công ty' },
  'footer.about': { en: 'About', vi: 'Giới thiệu' },
  'footer.process': { en: 'Process', vi: 'Quy trình' },
  'footer.copyright': { en: '© 2026 htlabs. All rights reserved.', vi: '© 2026 htlabs. Bảo lưu mọi quyền.' },
  'footer.systems': { en: 'All Systems Operational', vi: 'Tất cả hệ thống đang hoạt động' },
};
