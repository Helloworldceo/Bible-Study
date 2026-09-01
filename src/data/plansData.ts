import { StudyPlan } from '../types';

export const PREBUILT_STUDY_PLANS: StudyPlan[] = [
  {
    id: 'plan-bible-year',
    slug: 'bible-in-a-year',
    titleEn: 'Through the Bible in One Year',
    titleAm: 'መጽሐፍ ቅዱስን በአንድ ዓመት ውስጥ',
    descriptionEn: 'A balanced daily journey through the Old Testament, Psalms, and the New Testament across 365 days.',
    descriptionAm: 'ብሉይ ኪዳንን፣ መዝሙረ ዳዊትን እና ሐዲስ ኪዳንን በ365 ቀናት ውስጥ የሚያጠናቅቅ ሚዛናዊ የንባብ ጉዞ።',
    durationDays: 365,
    category: 'comprehensive',
    iconName: 'BookOpen',
    days: [
      {
        day: 1,
        titleEn: 'Day 1: In the Beginning & The Eternal Word',
        titleAm: 'ቀን 1፡ በመጀመሪያ እና የዘላለም ቃል',
        passages: [
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 1 },
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 2 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 1 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 1 }
        ],
        devotionalSummaryEn: 'Witness the majesty of God breathing the cosmos into existence and the arrival of the promised Messiah.',
        devotionalSummaryAm: 'እግዚአብሔር ፍጥረታትን ሁሉ በቃሉ ሲፈጥር እና የተስፋው መሲሕ የዘር ሐረግ ሲገለጥ ይመልከቱ።',
        prayerFocusEn: 'Praise God for His sovereign authority and new beginnings in your spiritual life.',
        prayerFocusAm: 'ስለ እግዚአብሔር ሉዓላዊ ሥልጣን እና በሕይወትህ ስላለው አዲስ ጅማሬ አመስግን።'
      },
      {
        day: 2,
        titleEn: 'Day 2: The Fall, The Promise & Christ’s Birth',
        titleAm: 'ቀን 2፡ የሰው መውደቅ፣ ተስፋው እና የክርስቶስ ልደት',
        passages: [
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 3 },
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 4 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 2 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 2 }
        ],
        devotionalSummaryEn: 'Even in humanity’s darkest failure, God immediately introduced the seed of redemption (Genesis 3:15).',
        devotionalSummaryAm: 'ሰው በወደቀበት በዚያ ጨለማ ሰዓት እንኳ እግዚአብሔር የድነትን ተስፋ አበሰረ (ዘፍጥረት 3:15)።',
        prayerFocusEn: 'Thank Jesus for stepping into human history to rescue and redeem us from sin.',
        prayerFocusAm: 'ኢየሱስ ክርስቶስ ከኃጢአት ሊያድነን ወደ ዓለም ስለመጣ ከልብ አመስግነው።'
      },
      {
        day: 3,
        titleEn: 'Day 3: Noah’s Ark, Faith & The Baptism of Jesus',
        titleAm: 'ቀን 3፡ የኖኅ መርከብ፣ እምነት እና የኢየሱስ ጥምቀት',
        passages: [
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 6 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 3 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 3 }
        ],
        devotionalSummaryEn: 'Noah found grace in the eyes of the Lord, while the voice from heaven declared: "This is My beloved Son."',
        devotionalSummaryAm: 'ኖኅ በእግዚአብሔር ፊት ጸጋን አገኘ፤ ከሰማይም "የምወደው ልጄ ይህ ነው" የሚል ድምፅ ተሰማ።',
        prayerFocusEn: 'Ask the Holy Spirit to strengthen your obedience and daily walk of faith.',
        prayerFocusAm: 'በመታዘዝ እና በእምነት እንድትመላለስ መንፈስ ቅዱስ እንዲያበረታህ ጸልይ።'
      },
      {
        day: 4,
        titleEn: 'Day 4: The Covenant Rainbow & Overcoming Temptation',
        titleAm: 'ቀን 4፡ የቀስተ ደመናው ቃል ኪዳን እና ፈተናን ማሸነፍ',
        passages: [
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 9 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 4 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 4 }
        ],
        devotionalSummaryEn: 'Jesus used the written Word to shatter Satan’s temptations: "It is written!"',
        devotionalSummaryAm: 'ኢየሱስ የዲያብሎስን ፈተናዎች በቅዱስ ቃሉ አሸነፈ፦ "ተብሎ ተጽፎአል!"',
        prayerFocusEn: 'Pray for mastery of Scripture to withstand everyday spiritual battles.',
        prayerFocusAm: 'የዕለት ፈተናዎችን በቅዱስ ቃሉ ድል እንድትነሣ ጥበብንና ኃይልን ለምን።'
      },
      {
        day: 5,
        titleEn: 'Day 5: The Beatitudes & Kingdom Character',
        titleAm: 'ቀን 5፡ ተራራው ስብከት እና የመንግሥቱ ባሕርያት',
        passages: [
          { bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', chapter: 12 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 5 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5 }
        ],
        devotionalSummaryEn: 'Christ outlines the counter-cultural lifestyle of kingdom citizens: pure in heart, peacemakers, and salt of the earth.',
        devotionalSummaryAm: 'ክርስቶስ የመንግሥቱ ዜጎች ሊኖራቸው የሚገባውን ቅዱስ ባሕርይ ያሳያል፦ የልብ ንጽሕና፣ ሰላም ፈጣሪነት እና የዓለም ጨው መሆን።',
        prayerFocusEn: 'Ask God to reflect His Beatitudes in your speech, attitude, and actions.',
        prayerFocusAm: 'እግዚአብሔር በንግግርህ፣ በአመለካከትህና በድርጊትህ ውስጥ የክርስቶስን ባሕርይ እንዲገልጽ ጸልይ።'
      }
    ]
  },
  {
    id: 'plan-gospels-30',
    slug: 'gospels-walk',
    titleEn: 'Walking with Jesus: The 4 Gospels in 30 Days',
    titleAm: 'ከኢየሱስ ጋር መመላለስ፡ 4ቱ ወንጌላት በ30 ቀናት',
    descriptionEn: 'Immerse yourself deeply in the life, miracles, parables, death, and resurrection of Jesus Christ.',
    descriptionAm: 'በጌታ በኢየሱስ ክርስቶስ ሕይወት፣ ተአምራት፣ ምሳሌዎች፣ ሞትና ትንሣኤ ውስጥ በጥልቀት ተመላለስ።',
    durationDays: 30,
    category: 'gospels',
    iconName: 'HeartHandshake',
    days: [
      {
        day: 1,
        titleEn: 'Day 1: The Genealogy & Miraculous Virgin Birth',
        titleAm: 'ቀን 1፡ የዘር ሐረግ እና የድንግል ማርያም ድንቅ ፅንስ',
        passages: [
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 1 },
          { bookId: 'LUK', bookNameEn: 'Luke', bookNameAm: 'የሉቃስ ወንጌል', chapter: 1 }
        ],
        devotionalSummaryEn: 'God fulfills centuries of prophetic anticipation as Emmanuel—God with us—enters the world.',
        devotionalSummaryAm: 'አማኑኤል—እግዚአብሔር ከእኛ ጋር—ወደ ዓለም ሲመጣ የዘመናት የትንቢት ተስፋ ተፈጸመ።'
      },
      {
        day: 2,
        titleEn: 'Day 2: The Ministry Begins: Baptism and Wilderness',
        titleAm: 'ቀን 2፡ የአገልግሎት መጀመሪያ፡ ጥምቀት እና የምድረ በዳ ፈተና',
        passages: [
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 3 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 4 }
        ],
        devotionalSummaryEn: 'Filled with the Holy Spirit, Jesus launches His public ministry and calls His first disciples.',
        devotionalSummaryAm: 'በመንፈስ ቅዱስ ኃይል ተሞልቶ ኢየሱስ ይፋዊ አገልግሎቱን ጀመረ፥ የመጀመሪያዎቹንም ደቀ መዛሙርት ጠራ።'
      },
      {
        day: 3,
        titleEn: 'Day 3: The Sermon on the Mount: The Lord’s Prayer',
        titleAm: 'ቀን 3፡ የተራራው ስብከት፡ የጌታ ጸሎት እና አትጨነቁ',
        passages: [
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6 },
          { bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 7 }
        ],
        devotionalSummaryEn: 'Discover the heart of intimacy in prayer and building your house upon the Rock.',
        devotionalSummaryAm: 'የእውነተኛ ጸሎትን ምስጢር እና ቤትህን በዓለት ላይ እንዴት እንደምትሠራ ተማር።'
      }
    ]
  },
  {
    id: 'plan-psalms-proverbs-30',
    slug: 'psalms-proverbs',
    titleEn: 'Psalms & Proverbs for Daily Wisdom & Worship (30 Days)',
    titleAm: 'መዝሙራት እና ምሳሌ ለዕለት ጥበብ እና አምልኮ (30 ቀናት)',
    descriptionEn: 'Daily spiritual nourishment combining the deep heart cries of the Psalms with the sharp practical wisdom of Proverbs.',
    descriptionAm: 'የመዝሙረ ዳዊትን ልባዊ አምልኮ ከምሳሌ ተግባራዊ ጥበብ ጋር በማጣመር በየቀኑ መንፈስህን አድስ።',
    durationDays: 30,
    category: 'wisdom',
    iconName: 'Compass',
    days: [
      {
        day: 1,
        titleEn: 'Day 1: The Two Paths & The Beginning of Wisdom',
        titleAm: 'ቀን 1፡ ሁለቱ መንገዶች እና የጥበብ መጀመሪያ',
        passages: [
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 1 },
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 2 },
          { bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 1 }
        ],
        devotionalSummaryEn: 'Blessed is the person who does not walk in the counsel of the ungodly, but delights in the law of the Lord.',
        devotionalSummaryAm: 'በክፉዎች ምክር ያልሄደ፥ በእግዚአብሔር ሕግ ግን ደስ የሚለው ሰው ምስጉን ነው።'
      },
      {
        day: 2,
        titleEn: 'Day 2: Peace in Turmoil & Trusting with All Your Heart',
        titleAm: 'ቀን 2፡ በጭንቀት ውስጥ ያለ ሰላም እና በሙሉ ልብ መታመን',
        passages: [
          { bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23 },
          { bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 3 }
        ],
        devotionalSummaryEn: 'The Lord is my Shepherd; in all your ways acknowledge Him and He shall direct your paths.',
        devotionalSummaryAm: 'እግዚአብሔር እረኛዬ ነው፤ በመንገድህ ሁሉ እርሱን እወቅ እርሱም ጎዳናህን ያቀናልሃል።'
      }
    ]
  },
  {
    id: 'plan-romans-grace-14',
    slug: 'romans-grace',
    titleEn: 'Romans: The Gospel of Grace & Freedom (14 Days)',
    titleAm: 'የሮሜ መልእክት፡ የጸጋ ወንጌል እና ነጻነት (14 ቀናት)',
    descriptionEn: 'Understand justification by faith, life in the Holy Spirit, and victorious Christian living.',
    descriptionAm: 'በእምነት መጽደቅን፣ በመንፈስ ቅዱስ መመላለስን እና የክርስቲያን የድል ሕይወትን ተረዳ።',
    durationDays: 14,
    category: 'topical',
    iconName: 'ShieldCheck',
    days: [
      {
        day: 1,
        titleEn: 'Day 1: Unashamed of the Gospel',
        titleAm: 'ቀን 1፡ በወንጌል አለማፈር',
        passages: [
          { bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 1 }
        ],
        devotionalSummaryEn: 'The gospel is the power of God for salvation to everyone who believes.',
        devotionalSummaryAm: 'ወንጌል ለሚያምኑ ሁሉ የእግዚአብሔር የማዳን ኃይል ነው።'
      },
      {
        day: 2,
        titleEn: 'Day 2: Justified Freely by His Grace',
        titleAm: 'ቀን 2፡ በጸጋው በነጻ መጽደቅ',
        passages: [
          { bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 3 }
        ],
        devotionalSummaryEn: 'All have sinned and fall short of the glory of God, being justified freely by His grace.',
        devotionalSummaryAm: 'ሁሉ ኃጢአትን ሠርተዋልና የእግዚአብሔርም ክብር ጎድሎአቸዋል፤ በጸጋው በነጻ ይጸድቃሉ።'
      },
      {
        day: 3,
        titleEn: 'Day 3: No Condemnation & Life in the Spirit',
        titleAm: 'ቀን 3፡ ኩነኔ የለም እና በመንፈስ መመላለስ',
        passages: [
          { bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8 }
        ],
        devotionalSummaryEn: 'There is now no condemnation for those in Christ Jesus.',
        devotionalSummaryAm: 'በክርስቶስ ኢየሱስ ላሉት አሁን ምንም ኩነኔ የለባቸውም።'
      }
    ]
  }
];

export function createCustomStudyPlan(params: {
  title: string;
  durationDays: number;
  selectedBookIds: string[];
  lang: 'en' | 'am';
}): StudyPlan {
  const planDays = [];
  const daysCount = Math.max(1, Math.min(params.durationDays, 365));
  
  for (let d = 1; d <= daysCount; d++) {
    const bookId = params.selectedBookIds[(d - 1) % params.selectedBookIds.length] || 'MAT';
    const chapterNum = ((d - 1) % 10) + 1;
    
    planDays.push({
      day: d,
      titleEn: `Day ${d}: ${params.title} - Reading & Prayer`,
      titleAm: `ቀን ${d}፡ ${params.title} - ንባብ እና ጸሎት`,
      passages: [
        {
          bookId,
          bookNameEn: bookId,
          bookNameAm: bookId,
          chapter: chapterNum
        }
      ],
      devotionalSummaryEn: `Reflect on God's truth in ${bookId} Chapter ${chapterNum}. Take 5 minutes for quiet prayer.`,
      devotionalSummaryAm: `በ${bookId} ምዕራፍ ${chapterNum} ላይ አሰላስል። ለጸሎት አጭር ጊዜ ውሰድ።`,
      prayerFocusEn: 'Pray for wisdom, application of the Word, and spiritual fruitfulness.',
      prayerFocusAm: 'ለጥበብ፣ ለቃሉ መታዘዝ እና ለመንፈስ ፍሬ ጸልይ።'
    });
  }

  return {
    id: `custom-plan-${Date.now()}`,
    slug: `custom-${Date.now()}`,
    titleEn: params.title || 'My Personal Study Plan',
    titleAm: params.title || 'የግል የመጽሐፍ ቅዱስ ጥናት እቅዴ',
    descriptionEn: `Custom reading plan tailored for ${daysCount} days.`,
    descriptionAm: `ለ${daysCount} ቀናት የተዘጋጀ የግል የንባብ እቅድ።`,
    durationDays: daysCount,
    category: 'topical',
    iconName: 'Sparkles',
    isCustom: true,
    days: planDays
  };
}
