export interface TranslationItem {
  en: string;
  bn: string;
  category: "nav" | "footer" | "common" | "about" | "deities" | "puja" | "events" | "contact" | "status";
  label?: string;
}

export type SiteTranslations = Record<string, TranslationItem>;

export const defaultTranslations: SiteTranslations = {
  // --- Navigation ---
  "nav.home": { en: "Home", bn: "হোম", category: "nav", label: "Navigation: Home" },
  "nav.about": { en: "About", bn: "পরিচিতি", category: "nav", label: "Navigation: About" },
  "nav.deities": { en: "Deities", bn: "বিগ্রহ ও তীর্থ", category: "nav", label: "Navigation: Deities" },
  "nav.pujas": { en: "Puja & Rituals", bn: "পূজা ও আচার", category: "nav", label: "Navigation: Puja & Rituals" },
  "nav.track_booking": { en: "Track Booking", bn: "বুকিং ট্র্যাক", category: "nav", label: "Navigation: Track Booking" },
  "nav.festivals": { en: "Festivals", bn: "উৎসব ও তিথি", category: "nav", label: "Navigation: Festivals" },
  "nav.gallery": { en: "Gallery", bn: "গ্যালারি", category: "nav", label: "Navigation: Gallery" },
  "nav.contact": { en: "Contact", bn: "যোগাযোগ", category: "nav", label: "Navigation: Contact" },
  "nav.admin": { en: "Admin", bn: "প্রশাসন", category: "nav", label: "Navigation: Admin" },

  // --- Footer ---
  "footer.description": {
    en: "An abode of eternal devotion, Vedic rites, and inner peace. Serving pilgrims and community through daily divine darshan, wholesome Annadanam, and timeless sacred heritage.",
    bn: "চিরন্তন ভক্তি, বৈদিক আচার এবং আধ্যাত্মিক শান্তির পবিত্র ধাম। নিত্য দর্শন, অন্নদান ও পুণ্য ঐতিহ্যে ভক্তসেবায় নিয়োজিত।",
    category: "footer",
    label: "Footer Description",
  },
  "footer.navigation": { en: "Navigation", bn: "ন্যাভিগেশন", category: "footer", label: "Footer Navigation Heading" },
  "footer.location": { en: "Temple Location", bn: "মন্দির অবস্থান", category: "footer", label: "Footer Location Heading" },
  "footer.darshan_hours": { en: "Darshan Hours", bn: "দর্শনের সময়সূচি", category: "footer", label: "Footer Darshan Heading" },
  "footer.morning_hours": { en: "Morning: 05:00 AM – 12:30 PM", bn: "প্রাতঃকাল: ০৫:০০ - ১২:৩০", category: "footer", label: "Footer Morning Hours" },
  "footer.evening_hours": { en: "Evening: 04:30 PM – 09:30 PM", bn: "সন্ধ্যা: ০৪:৩০ - ০৯:৩০", category: "footer", label: "Footer Evening Hours" },
  "footer.copyright": {
    en: "© 2026 Golpahar Mohashoshan Kali Mandir Committee. All rights reserved.",
    bn: "© ২০২৬ গোলপাহাড় মহাশ্মশান কালী মন্দির কমিটি। সর্বস্বত্ব সংরক্ষিত।",
    category: "footer",
    label: "Footer Copyright",
  },

  // --- Common Buttons & Badges ---
  "common.plan_visit": { en: "Plan A Visit", bn: "মন্দির দর্শন", category: "common", label: "Button: Plan Visit" },
  "common.book_puja": { en: "Book Puja Offering", bn: "পূজা বুকিং করুন", category: "common", label: "Button: Book Puja" },
  "common.view_darshan": { en: "View Darshan", bn: "দর্শন করুন", category: "common", label: "Button: View Darshan" },
  "common.quick_overview": { en: "Quick Overview", bn: "সংক্ষিপ্ত বিবরণ", category: "common", label: "Button: Quick Overview" },
  "common.contact_desk": { en: "Contact Devotee Desk", bn: "ভক্ত সেবা ডেস্কে যোগাযোগ", category: "common", label: "Button: Contact Desk" },
  "common.open_maps": { en: "Open in Google Maps", bn: "গুগল ম্যাপে দেখুন", category: "common", label: "Button: Open Maps" },
  "common.check_status": { en: "Check Status", bn: "স্ট্যাটাস দেখুন", category: "common", label: "Button: Check Status" },
  "common.submit": { en: "Submit", bn: "জমা দিন", category: "common", label: "Button: Submit" },
  "common.loading": { en: "Loading...", bn: "লোড হচ্ছে...", category: "common", label: "Text: Loading" },

  // --- About Page ---
  "about.hero_badge": {
    en: "Sacred Abode of Divine Mother · Established Heritage",
    bn: "শ্রী শ্রী আনন্দময়ী মা ভবতারিণী · ঐতিহ্যবাহী মহাতীর্থ",
    category: "about",
    label: "About Hero Badge",
  },
  "about.hero_title": {
    en: "Sanctuary of Devotion, Peace & Community",
    bn: "ভক্তি, শান্তি ও মানবতার পবিত্র তীর্থভূমি",
    category: "about",
    label: "About Hero Title",
  },
  "about.origins_heading": {
    en: "Sacred Origins & Historical Milestones",
    bn: "পবিত্র সূচনা ও ঐতিহাসিক পর্বসমূহ",
    category: "about",
    label: "About Origins Heading",
  },
  "about.admin_heading": {
    en: "Temple Governance & Administration",
    bn: "মন্দির পরিচালনা ও প্রশাসনিক পরিষদ",
    category: "about",
    label: "About Admin Heading",
  },

  // --- Deities Page ---
  "deities.hero_badge": { en: "Sacred Sanctum & Shrines", bn: "পবিত্র গর্ভগৃহ ও বিগ্রহসমূহ", category: "deities", label: "Deities Hero Badge" },
  "deities.hero_title": { en: "The Sacred Deities", bn: "মন্দিরের জাগ্রত বিগ্রহ ও দেব-দেবী", category: "deities", label: "Deities Hero Title" },
  "deities.hero_subtitle": {
    en: "The consecrated deities and eternal shrines of Golpahar Mohashoshan Kali Mandir, established across generations to bestow peace, divine protection, and spiritual solace upon all devotees.",
    bn: "শ্রী শ্রী গোলপাহাড় মহাশ্মশান কালী মন্দিরের জাগ্রত বিগ্রহ ও পুণ্য ধাম, যা ভক্তদের অপার শান্তি, দৈব রক্ষা ও মুক্তি দান করে।",
    category: "deities",
    label: "Deities Hero Subtitle",
  },
  "deities.darshan_kicker": { en: "Sanctum Darshan & Rituals", bn: "গর্ভগৃহ দর্শন ও নিত্য পূজা", category: "deities", label: "Deities Darshan Kicker" },
  "deities.darshan_title": { en: "Daily Darshan for Devotees & Pilgrims", bn: "ভক্ত ও দর্শনার্থীদের জন্য দৈনিক দর্শন", category: "deities", label: "Deities Darshan Title" },
  "deities.darshan_desc": {
    en: "The temple sanctum opens daily for morning prayers, noon bhog, and evening sandhya aarti. Devotees and visitors from all backgrounds are welcome to offer silent prayers, receive consecrated prasad, and participate in peace and devotion.",
    bn: "প্রতিদিন প্রাতঃকালীন পূজা, মধ্যাহ্ন ভোগরাগ ও সান্ধ্য আরতির জন্য গর্ভগৃহ উন্মুক্ত থাকে। সকল ভক্ত প্রসাদ গ্রহণ ও শান্তিময় প্রার্থনায় অংশ নিতে পারেন।",
    category: "deities",
    label: "Deities Darshan Description",
  },
  "deities.puja_services_btn": { en: "Puja Services & Charges", bn: "পূজা সেবা ও দক্ষিণা তালিকা", category: "deities", label: "Deities Puja Services Button" },

  // --- Puja & Rituals Page ---
  "puja.hero_badge": { en: "Sacred Worship & Devotion", bn: "নিত্য সেবা ও বৈদিক অর্চনা", category: "puja", label: "Puja Hero Badge" },
  "puja.hero_title": { en: "Puja & Daily Rituals", bn: "পূজা ও নিত্য সেবা কর্ম", category: "puja", label: "Puja Hero Title" },
  "puja.hero_subtitle": {
    en: "Vedic rituals, sacred sankalpa offerings, and timeless daily aartis conducted with solemn devotion and traditional sanctity at Golpahar Mohashoshan Kali Mandir.",
    bn: "বৈদিক আচার, সংকল্প পূজা এবং ভক্তিপূর্ণ নিত্য আরতি সনাতন ঐতিহ্যে সম্পন্ন হয়।",
    category: "puja",
    label: "Puja Hero Subtitle",
  },
  "puja.offerings_kicker": { en: "Devotee Offerings", bn: "ভক্তদের পূজা মানত", category: "puja", label: "Puja Offerings Kicker" },
  "puja.offerings_title": { en: "Puja Services & Sankalpa Charges", bn: "পূজা সেবা ও সংকল্প দক্ষিণা তালিকা", category: "puja", label: "Puja Offerings Title" },
  "puja.offerings_sub": {
    en: "Devotees may sponsor individual pujas with family name and gotra pronounced in the sacred Vedic sankalpa.",
    bn: "ভক্তবৃন্দ পরিবারবর্গের নাম ও গোত্র উচ্চারণপূর্বক বৈদিক সংকল্পের মাধ্যমে পূজা উৎসর্গ করতে পারেন।",
    category: "puja",
    label: "Puja Offerings Subtitle",
  },
  "puja.request_booking": { en: "Request Puja Booking", bn: "পূজা বুকিং আবেদন করুন", category: "puja", label: "Puja Request Booking Button" },
  "puja.puja_list_link": { en: "Puja List & Charges", bn: "পূজা তালিকা ও দক্ষিণা", category: "puja", label: "Puja List & Charges Link" },
  "puja.custom_kicker": { en: "Devotee Assistance Desk", bn: "ভক্ত সহায়তা কেন্দ্র", category: "puja", label: "Puja Custom Rites Kicker" },
  "puja.custom_title": { en: "Custom Rites & Special Occasions", bn: "বিশেষ পূজা ও পারিবারিক সংকল্প", category: "puja", label: "Puja Custom Rites Title" },
  "puja.custom_desc": {
    en: "For ancestral shraddha, special Chandi path, birth blessings, or specific family sankalpa rites, please connect directly with the temple priests or administration office.",
    bn: "বাৎসরিক শ্রাদ্ধ, চণ্ডীপাঠ, শান্তিস্বস্ত্যয়ন বা বিশেষ পারিবারিক পূজার জন্য মন্দির অফিসে সরাসরি যোগাযোগ করুন।",
    category: "puja",
    label: "Puja Custom Rites Description",
  },

  // --- Festivals & Events Page ---
  "events.hero_badge": { en: "Sacred Calendar & Celebrations", bn: "পুণ্য পঞ্জিকা ও মহোৎসব", category: "events", label: "Events Hero Badge" },
  "events.hero_title": { en: "Festivals & Sacred Events", bn: "বাৎসরিক মহোৎসব ও পবিত্র তিথি", category: "events", label: "Events Hero Title" },
  "events.hero_subtitle": {
    en: "Annual celebrations, holy vrata observances, and sacred tithis celebrated with traditional joy and devotional solemnity at Golpahar Mohashoshan Kali Mandir.",
    bn: "বাৎসরিক কালীপূজা, শিবরাত্রি ও ধর্মীয় মহোৎসবসমূহ নিষ্ঠা ও উৎসবমুখর পরিবেশে উদযাপিত হয়।",
    category: "events",
    label: "Events Hero Subtitle",
  },
  "events.filter_all": { en: "All Sacred Events", bn: "সকল ধর্মীয় অনুষ্ঠান", category: "events", label: "Events Tab: All" },
  "events.filter_upcoming": { en: "Upcoming Dates", bn: "আসন্ন অনুষ্ঠানসমূহ", category: "events", label: "Events Tab: Upcoming" },
  "events.filter_festivals": { en: "Major Festivals", bn: "প্রধান মহোৎসব", category: "events", label: "Events Tab: Festivals" },

  // --- Contact Page ---
  "contact.hero_badge": { en: "Pilgrim Helpline & Office Desk", bn: "ভক্ত সহায়তা ও মন্দির অফিস", category: "contact", label: "Contact Hero Badge" },
  "contact.hero_title": { en: "Contact Mandir Office", bn: "মন্দির কার্যালয়ে যোগাযোগ", category: "contact", label: "Contact Hero Title" },
  "contact.hero_subtitle": {
    en: "Welcome to Golpahar Mohashoshan Kali Mandir. Whether you are planning a pilgrim visit, arranging a special puja offering, or seeking temple trust guidance, our office desk is here to assist.",
    bn: "শ্রী শ্রী গোলপাহাড় মহাশ্মশান কালী মন্দিরে আপনাকে স্বাগতম। মন্দির দর্শন, পূজা বুকিং বা অনুদান সংক্রান্ত তথ্যের জন্য সহায়তা পেতে আমাদের সাথে যোগাযোগ করুন।",
    category: "contact",
    label: "Contact Hero Subtitle",
  },
  "contact.open_daily": { en: "Mandir Open Daily", bn: "মন্দির প্রতিদিন উন্মুক্ত", category: "contact", label: "Contact Open Daily" },
  "contact.morning_hours": { en: "Morning 05:00 AM – 12:30 PM", bn: "প্রাতঃকাল ০৫:০০ - ১২:৩০", category: "contact", label: "Contact Morning Hours" },
  "contact.evening_hours": { en: "Evening 04:30 PM – 09:30 PM", bn: "সন্ধ্যা ০৪:৩০ - ০৯:৩০", category: "contact", label: "Contact Evening Hours" },
  "contact.location_title": { en: "Temple Location", bn: "মন্দিরের অবস্থান ও ঠিকানা", category: "contact", label: "Contact Location Title" },
  "contact.landmark": {
    en: "Landmark: Situated opposite Chittagong Medical College East Gate area, near Prabartak Circle.",
    bn: "ল্যান্ডমার্ক: চট্টগ্রাম মেডিকেল কলেজ পূর্ব গেটের বিপরীতে, প্রবর্তক মোড়ের সন্নিকটে।",
    category: "contact",
    label: "Contact Landmark Note",
  },
  "contact.channels_title": { en: "Helpline & Direct Channels", bn: "হেল্পলাইন ও সরাসরি যোগাযোগ", category: "contact", label: "Contact Channels Title" },
  "contact.desk_label": { en: "Temple Devotee Desk", bn: "মন্দির ভক্ত সেবা কেন্দ্র", category: "contact", label: "Contact Devotee Desk Label" },
  "contact.whatsapp_label": { en: "Devotee WhatsApp Assistance", bn: "ভক্ত সেবা হোয়াটসঅ্যাপ", category: "contact", label: "Contact WhatsApp Label" },
  "contact.email_label": { en: "Official Inquiries & Trust Email", bn: "অফিসিয়াল ট্রাস্ট ইমেইল", category: "contact", label: "Contact Email Label" },
  "contact.form_title": { en: "Devotee Message & Inquiry", bn: "ভক্ত অনুসন্ধান ও বার্তা প্রেরণ", category: "contact", label: "Contact Form Title" },
  "contact.form_name": { en: "Full Name", bn: "আপনার পূর্ণ নাম", category: "contact", label: "Form: Name Label" },
  "contact.form_phone": { en: "Mobile Phone Number", bn: "মোবাইল নম্বর", category: "contact", label: "Form: Phone Label" },
  "contact.form_email": { en: "Email Address (Optional)", bn: "ইমেইল ঠিকানা (ঐচ্ছিক)", category: "contact", label: "Form: Email Label" },
  "contact.form_category": { en: "Inquiry Category", bn: "বার্তার ধরন", category: "contact", label: "Form: Category Label" },
  "contact.form_message": { en: "Your Message", bn: "আপনার বার্তা লিখুন", category: "contact", label: "Form: Message Label" },
  "contact.form_submit": { en: "Send Message to Mandir Office", bn: "মন্দির অফিসে বার্তা পাঠান", category: "contact", label: "Form: Submit Button" },

  // --- Booking Status Page ---
  "status.hero_badge": { en: "Devotee Sankalpa Desk", bn: "ভক্ত সংকল্প সেবা", category: "status", label: "Status Hero Badge" },
  "status.hero_title": { en: "Puja Booking Status", bn: "পূজা বুকিং স্ট্যাটাস অনুসন্ধান", category: "status", label: "Status Hero Title" },
  "status.hero_subtitle": {
    en: "Track the review, confirmation, and scheduling of your sacred puja offering at Golpahar Kali Mandir.",
    bn: "আপনার পূজা বুকিং আবেদন, তারিখ নির্ধারণ ও সেবার অগ্রগতি ট্র্যাক করুন।",
    category: "status",
    label: "Status Hero Subtitle",
  },
  "status.lookup_label": {
    en: "Enter Booking Reference Code or Mobile Phone Number",
    bn: "বুকিং রেফারেন্স কোড অথবা মোবাইল নম্বর দিন",
    category: "status",
    label: "Status Lookup Label",
  },
  "status.lookup_btn": { en: "Check Status", bn: "স্ট্যাটাস দেখুন", category: "status", label: "Status Lookup Button" },
  "status.lookup_hint": {
    en: "You can track your puja using the unique reference code or the mobile number entered during booking.",
    bn: "বুকিং রেফারেন্স কোড অথবা বুকিংয়ে প্রদত্ত মোবাইল নম্বর দিয়ে স্ট্যাটাস জানা যাবে।",
    category: "status",
    label: "Status Lookup Hint",
  },
};
