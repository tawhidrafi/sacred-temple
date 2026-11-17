export interface LocalizedString {
  en: string;
  bn: string;
}

export interface InitialPuja {
  slug: string;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  significance?: LocalizedString;
  requirements?: LocalizedString;
  offered?: LocalizedString;
  priceBdt: number;
  duration: string;
  bookable: boolean;
  active: boolean;
  sortOrder: number;
  image?: string;
}

export interface InitialDonationCategory {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  status: "active" | "inactive";
  sortOrder: number;
}

export interface InitialTimeSlot {
  id: string;
  name: LocalizedString;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  capacity: number;
}

export interface InitialAddon {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  priceBdt: number;
}

export const initialPujas: InitialPuja[] = [
  {
    slug: "general-puja",
    name: { en: "General Puja", bn: "সাধারণ নিত্য পূজা" },
    shortDescription: {
      en: "Daily auspicious prayers and archana offered before Maa Kali for health and well-being.",
      bn: "সুস্বাস্থ্য ও সার্বিক মঙ্গলের জন্য মা কালীর চরণে দৈনিক নিত্য অর্চণা ও পুষ্পাঞ্জলি।",
    },
    description: {
      en: "General Puja is performed daily at the sanctum sanctorum by temple priests with sacred flowers, sandalwood paste, incense, and deepam. Devotees receive sacred charanamrita and blessed flower prasadam.",
      bn: "মন্দিরের পুরোহিতগণ কর্তৃক চন্দন, কর্পূর, ধূপ ও পুষ্প সহযোগে মা কালীর চরণে সাধারণ পূজা নিবেদন করা হয়। ভক্তগণ চরণামৃত ও নির্মাল্য লাভ করেন।",
    },
    significance: {
      en: "Brings peace, clears domestic obstacles, and starts the day with divine grace.",
      bn: "পারিবারিক শান্তি আনয়ন ও বিঘ্ন বিনাশে প্রতিদিনের শুভ সূচনা।",
    },
    requirements: {
      en: "Devotee's name and gotra (if known). Clean mind and respectful devotion.",
      bn: "ভক্তের নাম ও গোত্র (জানা থাকলে)।",
    },
    offered: {
      en: "Red hibiscus flowers, sacred water, belpatra, and batashe.",
      bn: "জবা ফুল, গঙ্গাজল, বেলপাতা ও বাতাস প্রসাদ।",
    },
    priceBdt: 201,
    duration: "30 minutes",
    bookable: true,
    active: true,
    sortOrder: 1,
    image: "/images/deities/kali.webp",
  },
  {
    slug: "special-puja",
    name: { en: "Special Puja", bn: "বিশেষ পূজা ও ভোগ নিবেদন" },
    shortDescription: {
      en: "Elaborate puja performed on chosen auspicious tithis with dedicated bhog offering.",
      bn: "পবিত্র তিথিতে উৎসর্গকৃত বিশেষ ভোগ ও ষোড়শোপচার নিবেদনের মাধ্যমে সম্পন্ন পূজা।",
    },
    description: {
      en: "Special Puja involves 16 sacred offerings (Shodashopachara) presented directly before the deity with special sankalpa chanted with the devotee's family gotra.",
      bn: "ষোড়শোপচারে মায়ের বিগ্রহে বিশেষ ভোগ ও সঙ্কল্পসহ নিবেদিত ভক্তিপূর্ণ আরাধনা।",
    },
    priceBdt: 501,
    duration: "45 minutes",
    bookable: true,
    active: true,
    sortOrder: 2,
    image: "/images/deities/kali.webp",
  },
  {
    slug: "rudrabhishek",
    name: { en: "Rudrabhishek", bn: "রুদ্রাভিষেক পূজা" },
    shortDescription: {
      en: "Sacred bathing ritual of Lord Shiva with panchamrita, milk, and bilva leaves.",
      bn: "পঞ্চামৃত, গঙ্গাজল ও বেলপাতার সহযোগে মহাদেবের পরম কল্যাণকর পবিত্র রুদ্রাভিষেক।",
    },
    description: {
      en: "Rudrabhishek is a powerful Vedic ceremony invoking Sri Rudra to eliminate negative energies, grant longevity, and bestow spiritual elevation.",
      bn: "রুদ্রসূক্ত পাঠের মাধ্যমে অশুভ শক্তি দূরীকরণ ও দীর্ঘায়ু কামনায় শিবের পবিত্র অভিষেক।",
    },
    priceBdt: 1100,
    duration: "1 hour",
    bookable: true,
    active: true,
    sortOrder: 3,
    image: "/images/deities/shiva.webp",
  },
  {
    slug: "satyanarayan-puja",
    name: { en: "Satyanarayan Puja", bn: "শ্রী শ্রী সত্যনারায়ণ পূজা" },
    shortDescription: {
      en: "Traditional household and temple worship of Lord Vishnu for harmony and prosperity.",
      bn: "পরিবারের সুখ, শান্তি ও শ্রী বৃদ্ধির কামনায় ভক্তিবিনম্র সত্যনারায়ণ ব্রতকথা ও পূজা।",
    },
    description: {
      en: "Performed with shinni prasadam, banana, milk, and Vedic hymns, followed by recital of the sacred Satyanarayan katha.",
      bn: "শিরনি ভোগ, ফলমূল ও সত্যনারায়ণ পাঁচালী পাঠ সহকারে সম্পন্ন ভক্তিমূলক আচার।",
    },
    priceBdt: 801,
    duration: "1 hour",
    bookable: true,
    active: true,
    sortOrder: 4,
  },
  {
    slug: "durga-puja",
    name: { en: "Durga Puja Archana", bn: "মা দুর্গা বিশেষ অর্চনা" },
    shortDescription: {
      en: "Special archana offered to Maa Durga for courage, victory, and protection.",
      bn: "বিপদনাশ ও বিজয়ের কামনায় দশভুজা মা দুর্গার চরণে পুষ্পাঞ্জলি ও অর্চনা।",
    },
    description: {
      en: "Invoking the Mother of the Universe with Chandipath verses, lotus flowers, and sacred mantras to protect against all adversity.",
      bn: "চণ্ডীপাঠ ও পদ্ম পুষ্প নিবেদনের মাধ্যমে সকল প্রকার বাধা ও বিপত্তি থেকে রক্ষার বিশেষ প্রার্থনা।",
    },
    priceBdt: 751,
    duration: "45 minutes",
    bookable: true,
    active: true,
    sortOrder: 5,
  },
  {
    slug: "lakshmi-puja",
    name: { en: "Lakshmi Puja", bn: "মা লক্ষ্মী পূজা ও সৌভাগ্য প্রার্থনা" },
    shortDescription: {
      en: "Worship of the Goddess of Wealth and Prosperity for auspicious beginnings and abundance.",
      bn: "ধনধান্য ও গৃহে সৌভাগ্য বৃদ্ধির কামনায় ধনদাত্রী মা লক্ষ্মীর সান্ধ্য পূজা।",
    },
    description: {
      en: "Devotional puja offered with fresh fruits, white flowers, kheer bhog, and Lakshmi Ashtakam hymns.",
      bn: "পায়সান্ন ভোগ ও ধূপ-দীপের সহযোগে গৃহস্থালির কল্যাণ ও সমৃদ্ধির জন্য নিবেদিত প্রার্থনা।",
    },
    priceBdt: 501,
    duration: "40 minutes",
    bookable: true,
    active: true,
    sortOrder: 6,
  },
  {
    slug: "ganesh-puja",
    name: { en: "Ganesh Puja", bn: "শ্রী গণেশ পূজা ও বিঘ্নহর্তা বন্দনা" },
    shortDescription: {
      en: "Invoking Lord Ganesha to remove obstacles and bless new ventures, businesses, and exams.",
      bn: "নতুন ব্যবসা, পড়াশোনা ও যেকোনো শুভকাজের প্রাক্কালে বিঘ্নবিনাশক গণেশের আরাধনা।",
    },
    description: {
      en: "Performed with modak, durva grass, and Atharvashirsha chants to remove hurdles from one's path.",
      bn: "দুর্বা, মোদক ও অথর্বশীর্ষ স্তোত্র সহযোগে সিদ্ধিদাতার চরণে বিশেষ নৈবেদ্য প্রদান।",
    },
    priceBdt: 501,
    duration: "30 minutes",
    bookable: true,
    active: true,
    sortOrder: 7,
  },
  {
    slug: "havan-yajna",
    name: { en: "Havan / Sacred Yajna", bn: "পবিত্র হোম ও যজ্ঞ অনুষ্ঠান" },
    shortDescription: {
      en: "Purifying Vedic fire sacrifice conducted by temple priests for spiritual purification.",
      bn: "পবিত্র ঘৃত ও সুগন্ধি আহুতির মাধ্যমে পরিবেশ ও অন্তঃকরণ শুদ্ধিকরণের বৈদিক যজ্ঞ।",
    },
    description: {
      en: "Havan ritual with sacred wood, pure cow ghee, and Vedic samagri offered into Agni Dev while chanting planetary and Vedic peace mantras.",
      bn: "নবগ্রহ ও শান্তির মন্ত্র পাঠসহ অগ্নিতে পবিত্র সামগ্রীর আহুতি দ্বারা গ্রহশান্তি ও পরিশুদ্ধি যজ্ঞ।",
    },
    priceBdt: 1501,
    duration: "1.5 hours",
    bookable: true,
    active: true,
    sortOrder: 8,
  },
  {
    slug: "anniversary-puja",
    name: { en: "Anniversary Puja", bn: "বিবাহবার্ষিকী কল্যাণ পূজা" },
    shortDescription: {
      en: "Special blessings and prayer for marital harmony, togetherness, and enduring love.",
      bn: "দাম্পত্য জীবনের সুখ, সুস্বাস্থ্য ও দীর্ঘায়ু কামনায় যুগল কল্যাণ পূজা।",
    },
    description: {
      en: "Couples receive special blessings from the priest with sacred vermilion, sacred thread, and consecrated garland offering.",
      bn: "পুরোহিত মহাশয় কর্তৃক যুগল আশীর্বাদ, রক্ষা সূত্র এবং বিশেষ প্রসাদ নিবেদন।",
    },
    priceBdt: 601,
    duration: "40 minutes",
    bookable: true,
    active: true,
    sortOrder: 9,
  },
  {
    slug: "birthday-puja",
    name: { en: "Birthday Puja & Ayushya Havan", bn: "জন্মদিন আয়ুষ্য পূজা" },
    shortDescription: {
      en: "Prayers for good health, wisdom, long life, and spiritual protection on one's birthday.",
      bn: "জন্মদিনে পরমায়ু, বিদ্যা ও সুস্থতা কামনায় মা কালীর চরণে কৃতজ্ঞতা ও প্রার্থনা।",
    },
    description: {
      en: "Personalized puja with sankalpa in the name of the birthday celebrant, followed by sweet bhog distribution.",
      bn: "জন্মদিনের শুভ কামনায় আয়ুষ্য হোম ও পরিবারের পক্ষে বিশেষ ভোগ প্রদান।",
    },
    priceBdt: 501,
    duration: "35 minutes",
    bookable: true,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "personalized-sankalpa-puja",
    name: { en: "Personalized Sankalpa Puja", bn: "ব্যক্তিগত সঙ্কল্প পূজা" },
    shortDescription: {
      en: "Custom prayer dedicated to a specific wish, illness recovery, or examination success.",
      bn: "রোগমুক্তি, পরীক্ষায় সাফল্য বা বিশেষ মানত পূরণের উদ্দেশ্যে নিজস্ব সঙ্কল্পে পূজা।",
    },
    description: {
      en: "The priest recites the devotee's specific wish (manat) and personal sankalpa directly at the altar with dedicated offerings.",
      bn: "ভক্তের একান্ত মনোবাসনা পুরোহিত মহাশয় কর্তৃক মায়ের চরণে নিবেদিত বিশেষ প্রার্থনা।",
    },
    priceBdt: 701,
    duration: "45 minutes",
    bookable: true,
    active: true,
    sortOrder: 11,
  },
  {
    slug: "online-puja-participation",
    name: { en: "Online Puja Participation", bn: "দূরবর্তী / অনলাইন পূজা ও প্রসাদ" },
    shortDescription: {
      en: "For devotees unable to visit physically; puja performed in absentia in devotee's name.",
      bn: "দূরদূরান্তের ভক্তদের জন্য মন্দিরে উপস্থিত না হয়েও দূর থেকে সঙ্কল্প ও পূজা সেবা।",
    },
    description: {
      en: "Puja is performed on the devotee's behalf with their name and gotra. A confirmation photo and blessing message is shared with the devotee.",
      bn: "ভক্তের নাম ও গোত্রে পুরোহিত মহাশয় পূজা সম্পন্ন করেন এবং সঙ্কল্পের ছবি ও আশীর্বাদ বার্তা পাঠানো হয়।",
    },
    priceBdt: 851,
    duration: "40 minutes",
    bookable: true,
    active: true,
    sortOrder: 12,
  },
];

export const initialDonationCategories: InitialDonationCategory[] = [
  {
    slug: "general-temple-donation",
    name: { en: "General Temple Donation", bn: "সাধারণ মন্দির দান" },
    description: {
      en: "Unrestricted support used where the temple and pilgrim community need it most.",
      bn: "মন্দিরের সার্বিক পরিচালন ও ভক্তসেবায় সাধারণ অনুদান।",
    },
    status: "active",
    sortOrder: 1,
  },
  {
    slug: "temple-maintenance",
    name: { en: "Temple Maintenance & Renovation", bn: "মন্দির সংস্কার ও সংরক্ষণ তহবিল" },
    description: {
      en: "Supports structural upkeep, sacred altar repairs, and heritage preservation of Golpahar hill.",
      bn: "গোলপাহাড় মহাশ্মশান কালী মন্দিরের চত্বর ও বিগ্রহের সংস্কার সংরক্ষণ।",
    },
    status: "active",
    sortOrder: 2,
  },
  {
    slug: "religious-activities",
    name: { en: "Religious Activities & Rituals", bn: "নিত্য পূজা ও ধর্মীয় আচার তহবিল" },
    description: {
      en: "Funding daily flowers, incense, pure ghee, and samagri for morning and evening pujas.",
      bn: "মন্দিরের প্রাত্যহিক পূজার পুষ্প, ধূপ, ঘৃত ও সামগ্রী সংস্থান।",
    },
    status: "active",
    sortOrder: 3,
  },
  {
    slug: "annadanam",
    name: { en: "Annadanam (Food Distribution)", bn: "অন্নদান ও মহাপ্রসাদ বিতরণ" },
    description: {
      en: "Sacred distribution of warm cooked meals and consecrated mahaprasad to visiting pilgrims and the needy.",
      bn: "তীর্থযাত্রী, ভক্ত ও দুস্থদের মাঝে পবিত্র অন্নভোগ ও মহাপ্রসাদ বিতরণ সেবা।",
    },
    status: "active",
    sortOrder: 4,
  },
  {
    slug: "festival-contributions",
    name: { en: "Festival Contributions", bn: "উৎসব ও শ্যামা পূজা তহবিল" },
    description: {
      en: "Support annual Shyama Puja, Kali Puja, Maha Shivaratri, and Janmashtami temple arrangements.",
      bn: "শ্যামা পূজা, দীপাবলি, মহাশিবরাত্রি সহ বাৎসরিক বৃহৎ উৎসবের আয়োজন তহবিল।",
    },
    status: "active",
    sortOrder: 5,
  },
  {
    slug: "charity-and-social-welfare",
    name: { en: "Charity & Social Welfare", bn: "মানবকল্যাণ ও সামাজিক সেবা" },
    description: {
      en: "Medical relief, student educational aid, and emergency assistance for the underprivileged.",
      bn: "অসহায়দের চিকিৎসা সহায়তা, বস্ত্র বিতরণ ও শিক্ষা সহায়ক সামাজিক কার্যক্রম।",
    },
    status: "active",
    sortOrder: 6,
  },
  {
    slug: "other-contributions",
    name: { en: "Other Contributions", bn: "অন্যান্য কল্যাণমূলক অনুদান" },
    description: {
      en: "Special devotee dedications, memorial funds, and custom charitable seva.",
      bn: "পূর্বপুরুষের স্মৃতির উদ্দেশ্যে বা ভক্তের বিশেষ ইচ্ছানুযায়ী নিবেদিত দান।",
    },
    status: "active",
    sortOrder: 7,
  },
];

export const initialTimeSlots: InitialTimeSlot[] = [
  {
    id: "slot-morning",
    name: { en: "Morning Mangala Aarti & Puja", bn: "সকাল মঙ্গলারতি ও প্রাতঃ পূজা" },
    startTime: "07:30",
    endTime: "09:00",
    capacity: 15,
  },
  {
    id: "slot-noon",
    name: { en: "Midday Madhyahna Bhog Puja", bn: "দুপুর মধ্যাহ্ন ভোগ পূজা" },
    startTime: "11:30",
    endTime: "13:00",
    capacity: 10,
  },
  {
    id: "slot-evening",
    name: { en: "Evening Sandhya Aarti & Puja", bn: "সন্ধ্যা আরতি ও সান্ধ্য পূজা" },
    startTime: "17:30",
    endTime: "19:00",
    capacity: 20,
  },
  {
    id: "slot-night",
    name: { en: "Night Special Kali Aarti", bn: "রাত্রি বিশেষ কালিকা আরতি" },
    startTime: "20:00",
    endTime: "21:30",
    capacity: 12,
  },
];

export const initialAddons: InitialAddon[] = [
  {
    id: "addon-pushpanjali",
    name: { en: "Special Pushpanjali Flowers & Belpatra", bn: "বিশেষ পুষ্পাঞ্জলি ও ১০৮ বেলপাতা" },
    description: {
      en: "Fresh lotuses, fragrant garlands, and handpicked bilva leaves offered at Maa's feet.",
      bn: "তাজা পদ্মফুল, রজনীগন্ধার মালা ও ১০৮ বেলপাতা সহযোগে নিবেদন।",
    },
    priceBdt: 150,
  },
  {
    id: "addon-mahaprasad",
    name: { en: "Temple Mahaprasad & Bhog Offering", bn: "বিশেষ ভোগ নৈবেদ্য ও মহাপ্রসাদ" },
    description: {
      en: "Dedicated pot of khichuri or payasam offered in the sanctum sanctorum on your behalf.",
      bn: "ভক্তের নামে নিবেদিত পবিত্র খিচুড়ি ভোগ ও পায়েস পাত্র।",
    },
    priceBdt: 350,
  },
  {
    id: "addon-ghee-deepam",
    name: { en: "Pure Cow Ghee Akhanda Deepam", bn: "গাওয়া ঘৃতের অখণ্ড প্রদীপ প্রজ্জ্বলন" },
    description: {
      en: "Pure cow ghee lamp lit before the deity, burning continuously throughout the evening aarti.",
      bn: "সন্ধ্যারতির প্রাক্কালে মায়ের সম্মুখে প্রজ্বলিত পবিত্র গাওয়া ঘৃতের প্রদীপ।",
    },
    priceBdt: 200,
  },
  {
    id: "addon-chunari",
    name: { en: "Sacred Red Chunari & Sindoor Offering", bn: "পবিত্র লাল চুনরি ও সিঁদুর অর্পণ" },
    description: {
      en: "Consecrated red chunari and sanctified vermilion dedicated to Maa Kali.",
      bn: "মা কালীর শ্রীঅঙ্গে নিবেদিত মঙ্গলময় লাল চুনরি ও পবিত্র সিঁদুর।",
    },
    priceBdt: 250,
  },
  {
    id: "addon-navagraha",
    name: { en: "Navagraha Shanti Samagri", bn: "নবগ্রহ শান্তি সামগ্রী" },
    description: {
      en: "Nine sacred grains, black sesame, and planetary offerings for planetary peace.",
      bn: "নবগ্রহ শান্তির উদ্দেশ্যে নবধান্য, তিল ও বিশেষ আহুতি সামগ্রী।",
    },
    priceBdt: 500,
  },
];
