import { Creator, SummaryItem, DailyDigest, NotificationItem } from "../types";

export const INITIAL_CREATORS: Creator[] = [
  {
    id: "vox",
    name: "Vox News & Explains",
    handle: "@vox",
    avatar: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Current Affairs",
    bio: "Explaining the news and the world around us through visual journalism.",
    followersCount: "11.8M",
    isFollowed: true,
    verified: true,
    channelUrl: "https://youtube.com/@vox",
  },
  {
    id: "kurzgesagt",
    name: "Kurzgesagt – In a Nutshell",
    handle: "@Kurzgesagt",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Education",
    bio: "Videos explaining things with optimistic nihilism and scientific rigor.",
    followersCount: "22.4M",
    isFollowed: true,
    verified: true,
    channelUrl: "https://youtube.com/@kurzgesagt",
  },
  {
    id: "reuters",
    name: "Reuters Wire",
    handle: "@Reuters",
    avatar: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=120&auto=format&fit=crop&q=80",
    platform: "x",
    category: "News",
    bio: "Top and breaking news, business insights, and verified global reports.",
    followersCount: "25.7M",
    isFollowed: true,
    verified: true,
    channelUrl: "https://x.com/Reuters",
  },
  {
    id: "economist",
    name: "The Economist",
    handle: "@theeconomist",
    avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
    platform: "instagram",
    category: "Finance",
    bio: "Authoritative weekly insight on international news, politics, and macroeconomics.",
    followersCount: "6.2M",
    isFollowed: true,
    verified: true,
    channelUrl: "https://instagram.com/theeconomist",
  },
  {
    id: "cleo_abram",
    name: "Cleo Abram (Huge If True)",
    handle: "@cleoabram",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Technology",
    bio: "Optimistic, curiosity-driven tech journalism exploring the next frontier.",
    followersCount: "3.5M",
    isFollowed: true,
    verified: true,
    channelUrl: "https://youtube.com/@cleoabram",
  },
  {
    id: "mit_tech_review",
    name: "MIT Technology Review",
    handle: "@techreview",
    avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80",
    platform: "news",
    category: "Technology",
    bio: "Independent journalism from the world-renowned institution on emerging tech.",
    followersCount: "1.4M",
    isFollowed: false,
    verified: true,
    channelUrl: "https://technologyreview.com",
  },
  {
    id: "nature_journal",
    name: "Nature Climate & Science",
    handle: "@nature",
    avatar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&auto=format&fit=crop&q=80",
    platform: "news",
    category: "Health",
    bio: "Peer-reviewed findings on ecological biodiversity, medicine, and planetary science.",
    followersCount: "2.8M",
    isFollowed: false,
    verified: true,
    channelUrl: "https://nature.com",
  },
  {
    id: "espn",
    name: "ESPN Global Brief",
    handle: "@espn",
    avatar: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80",
    platform: "x",
    category: "Sports",
    bio: "Real-time sporting championships, analytics, player transfers, and tournament records.",
    followersCount: "48.2M",
    isFollowed: false,
    verified: true,
    channelUrl: "https://x.com/espn",
  },
];

export const INITIAL_SUMMARIES: SummaryItem[] = [
  {
    id: "sum-1",
    title: "Global Central Banks Announce Coordinated Liquidity Framework for AI & Tech Sovereign Bonds",
    creatorId: "economist",
    creatorName: "The Economist",
    creatorHandle: "@theeconomist",
    creatorAvatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
    platform: "instagram",
    category: "Finance",
    currentAffairsCategory: "Economy",
    publishDate: "2026-09-19T02:15:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://instagram.com/p/C_sample_econ",
    thumbnailUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "Seven major central banks ratified a unified protocol governing sovereign-backed green tech bonds.",
      "Introduces a standardized risk weighting index aimed at lowering institutional borrowing costs by 45 basis points.",
      "Includes mandatory transparent disclosure clauses on computing energy consumption for funded data hubs.",
      "Targeted to mobilize $1.2 trillion in private capital by mid-2027.",
    ],
    easySummary: "The world's biggest central banks have come together to make it much easier and cheaper to fund sustainable high-tech projects, like energy-efficient AI servers and green power grids. Instead of every country having different complicated rules, they created one unified playbook. This lowers the cost of borrowing money by almost half a percent, which will help unlock over a trillion dollars in private investment over the next year without burdening taxpayers.",
    detailedSummary: "In an unprecedented multilateral financial accord, central bank governors representing seven leading economies formalized the Sovereign Sustainable Innovation Framework. Historically, divergent regulatory classifications around tech infrastructure made institutional investors hesitant to underwrite long-term municipal and national debt instruments.\n\nThe framework introduces three pillars: standardized collateral eligibility, cross-border carbon-offset metrics linked to data center efficiency, and emergency liquidity windows for high-capex grid transitions. Economists project that removing cross-border friction could lower sovereign yield spreads by 35 to 50 basis points.\n\nCritiques remain regarding the strict monitoring of computing workloads, but international rating agencies have already indicated positive sovereign credit adjustments for early adopting jurisdictions.",
    keyFacts: {
      names: ["Federal Reserve", "European Central Bank", "Bank of Japan", "Bank of England", "Reserve Bank of India"],
      dates: ["September 19, 2026", "Effective Date: January 1, 2027", "Target Milestone: Mid-2027"],
      statistics: ["$1.2 Trillion capital target", "45 bps average cost reduction", "7 participating economies", "100% renewable energy audit requirement"],
      announcements: ["Launch of Sovereign Sustainable Innovation Framework", "Establishment of Joint Financial Stability Taskforce"],
      decisions: ["Unified risk weighting approved unanimously", "Semi-annual transparency audit mandated"],
    },
    examRelevance: "Crucial for Economy & GS Paper III (Public Finance, International Banking Regimes, and Sustainable Infrastructure Capitalization).",
    translations: {
      hi: {
        title: "वैश्विक केंद्रीय बैंकों ने AI और टेक सॉवरेन बॉन्ड के लिए समन्वित तरलता ढांचे की घोषणा की",
        quickSummary: [
          "सात प्रमुख केंद्रीय बैंकों ने सॉवरेन ग्रीन टेक बॉन्ड के लिए एक एकीकृत प्रोटोकॉल को मंजूरी दी।",
          "संस्थागत उधारी लागत में 45 आधार अंकों की कमी लाने के लिए जोखिम मानक तैयार किए गए।",
          "डेटा हब के लिए ऊर्जा खपत के अनिवार्य खुलासे का प्रावधान शामिल किया गया।",
          "2027 के मध्य तक $1.2 ट्रिलियन निजी पूंजी जुटाने का महत्वाकांक्षी लक्ष्य।"
        ],
        easySummary: "दुनिया के प्रमुख केंद्रीय बैंकों ने पर्यावरण-अनुकूल तकनीकी परियोजनाओं, जैसे ग्रीन डेटा सेंटर्स और ऊर्जा ग्रिडों के लिए ऋण लेना आसान बनाने हेतु एक नया साझा ढांचा तैयार किया है। इससे कर्ज की लागत में कमी आएगी और भारी मात्रा में निजी निवेश आकर्षित होगा।"
      },
      ur: {
        title: "عالمی مرکزی بینکوں نے اے آئی اور ٹیکنالوجی بانڈز کے لیے مشترکہ لیکویڈیٹی فریم ورک کا اعلان کیا",
        quickSummary: [
          "سات بڑے مرکزی بینکوں نے گرین ٹیکنالوجی بانڈز کے لیے متفقہ ضابطہ اخلاق کی منظوری دی۔",
          "قرض لینے کی لاگت میں 45 بیسس پوائنٹس کی کمی متوقع ہے۔",
          "کمپیوٹنگ ڈیٹا مراکز کے لیے توانائی کی شفافیت لازمی قرار دی گئی۔",
          "2027 کے وسط تک 1.2 ٹریلین ڈالر کی نجی سرمایہ کاری متحرک کرنے کا ہدف۔"
        ],
        easySummary: "دنیا کے اہم مرکزی بینکوں نے ماحول دوست ٹیکنالوجی منصوبوں کو مالی مدد فراہم کرنے کے لیے ایک نیا متحدہ فریم ورک تیار کیا ہے تاکہ بغیر کسی پیچیدگی کے بڑی سرمایہ کاری ممکن ہو سکے۔"
      }
    },
    isSaved: true,
    isRead: true,
    viewsCount: 14200,
    likesCount: 980,
  },
  {
    id: "sum-2",
    title: "Next-Generation Perovskite-Silicon Tandem Solar Cells Shatter 35% Efficiency Barrier in Commercial Trials",
    creatorId: "mit_tech_review",
    creatorName: "MIT Technology Review",
    creatorHandle: "@techreview",
    creatorAvatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80",
    platform: "news",
    category: "Technology",
    currentAffairsCategory: "Science & Technology",
    publishDate: "2026-09-19T01:30:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://technologyreview.com/2026/09/tandem-solar-breakthrough",
    thumbnailUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "Perovskite-silicon tandem solar cells crossed 35.2% operational conversion efficiency in outdoor durability trials.",
      "Surpasses traditional silicon panels (capped around 22-24%) by nearly 50% power output per square meter.",
      "New atomic layer passivation resolves the longstanding 10-year degradation bottleneck.",
      "Commercial rooftop and utility-scale deployments slated to begin manufacturing early next year.",
    ],
    easySummary: "Scientists and solar manufacturers have broken a huge technological barrier. Traditional solar panels can only turn about 22% of sunlight into electricity. By layering a special material called perovskite directly on top of traditional silicon, these new panels now convert more than 35% of sunlight into clean power. Even better, they figured out how to protect them from heat and moisture, meaning solar roofs can now generate 50% more electricity from the exact same footprint.",
    detailedSummary: "A collaborative consortium of university laboratories and photovoltaic fabricators published peer-reviewed outdoor test results documenting 35.2% power conversion efficiency on tandem cells. The breakthrough combines a wide-bandgap metal-halide perovskite top cell absorbing blue/green photons with a bottom heterojunction silicon layer absorbing red and near-infrared wavelengths.\n\nHistorically, perovskite devices suffered from ion migration under UV stress and ambient humidity. The new design incorporates a fluorinated molecular passivation monolayer that seals grain boundaries against micro-cracking.\n\nAccelerated aging tests indicate an estimated operational half-life exceeding 25 years with less than 0.4% annual output degradation. Standard silicon production lines can be retrofitted with minimal capital expenditure, promising immediate competitive advantage.",
    keyFacts: {
      names: ["MIT Solar Lab", "Fraunhofer Institute for Solar Energy Systems", "Oxford PV Consortium"],
      dates: ["Field Trial Period: Jan-Aug 2026", "Commercial Rollout: Q1 2027"],
      statistics: ["35.2% conversion efficiency achieved", "50% higher energy density per m²", "Estimated 25+ year lifespan with <0.4% annual decay"],
      announcements: ["Publication in Nature Energy", "Licensing pact with major PV module fabricators"],
      decisions: ["Certification of industrial-scale tandem cells approved by IEC"],
    },
    examRelevance: "High relevance for Science & Technology, Renewable Energy Transition, and Environmental Ecology.",
    translations: {
      hi: {
        title: "पेरोवस्कैट-सिलिकॉन टेंडेम सोलर सेल्स ने व्यावसायिक परीक्षणों में 35% दक्षता का रिकॉर्ड तोड़ा",
        quickSummary: [
          "पेरोवस्कैट-सिलिकॉन टेंडेम सोलर सेल्स ने 35.2% सौर रूपांतरण दक्षता हासिल की।",
          "पारंपरिक सिलिकॉन पैनलों की तुलना में प्रति वर्ग मीटर 50% अधिक ऊर्जा उत्पादन।",
          "परमाणु परत तकनीक ने पैनलों के लंबे जीवनकाल की समस्या को हल किया।"
        ],
        easySummary: "वैज्ञानिकों ने सौर ऊर्जा में ऐतिहासिक सफलता हासिल की है। नई तकनीक से सौर पैनल 35% से अधिक सूर्य के प्रकाश को सीधे बिजली में बदल सकते हैं, जिससे छतों पर समान जगह में 50% अधिक बिजली बनेगी।"
      },
      ur: {
        title: "پیروسکائٹ سلیکون ٹینڈم سولر سیلز نے تجارتی ٹیسٹوں میں 35 فیصد کارکردگی کا ریکارڈ توڑ دیا",
        quickSummary: [
          "نئے سولر سیلز نے 35.2 فیصد توانائی کی تبدیلی کی شرح حاصل کی۔",
          "روایتی پینلز کے مقابلے میں 50 فیصد زیادہ بجلی کی پیداوار۔",
          "25 سال سے زیادہ قابل اعتماد سروس لائف کی تصدیق۔"
        ],
        easySummary: "سائنسدانوں نے شمسی توانائی کے میدان میں بڑی پیش رفت کی ہے جہاں اب پینلز 35 فیصد سے زائد دھوپ کو بجلی میں تبدیل کر سکتے ہیں۔"
      }
    },
    isSaved: false,
    isRead: true,
    viewsCount: 18900,
    likesCount: 1420,
  },
  {
    id: "sum-3",
    title: "UN Climate Summit Approves Global Mangrove and Coastal Wetland Restoration Compact",
    creatorId: "vox",
    creatorName: "Vox News & Explains",
    creatorHandle: "@vox",
    creatorAvatar: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Current Affairs",
    currentAffairsCategory: "Environment",
    publishDate: "2026-09-18T20:00:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://youtube.com/watch?v=sample_mangroves",
    thumbnailUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "140 signatory nations adopted a legally binding compact to restore 15 million hectares of marine mangroves by 2035.",
      "Coastal blue-carbon ecosystems store up to 5 times more carbon per acre than terrestrial rainforests.",
      "Establishes an initial $18 billion coastal resilience fund managed by the Global Environment Facility.",
      "Provides direct satellite monitoring access to track coastal erosion and illegal clearing in real time.",
    ],
    easySummary: "At the latest global climate conference, 140 countries signed a landmark agreement to bring back 15 million hectares of coastal mangrove forests and wetlands. Mangroves are superhero ecosystems: their underwater root systems protect coastal cities from destructive storm surges and floods, while trapping five times more carbon from the atmosphere than land-based tropical forests. An $18 billion fund will directly finance local coastal communities and fishermen who help plant and guard these vital coastlines.",
    detailedSummary: "The newly adopted Coastal Blue Carbon and Mangrove Restoration Treaty represents one of the most comprehensive nature-based climate accords in recent decades. The agreement targets 15 million hectares across Southeast Asia, West Africa, South America, and the Indian Ocean rim.\n\nUnlike previous voluntary pledges, this compact binds member states to verifiable satellite verification protocols using synthetic aperture radar (SAR) to identify illegal deforestation within 48 hours.\n\nFurthermore, the pact explicitly recognizes the intellectual property and tenure rights of indigenous coastal populations, ensuring that at least 40% of blue-carbon credit revenue flows directly to local guardian cooperatives. Insurance consortia also highlighted that intact mangrove belts reduce shoreline infrastructure repair costs by an estimated $65 billion annually.",
    keyFacts: {
      names: ["UN Environment Programme (UNEP)", "Global Environment Facility", "Mangrove Action Project"],
      dates: ["Ratified: September 18, 2026", "2030 Interim Goal: 6M hectares", "2035 Final Target: 15M hectares"],
      statistics: ["140 Signatory countries", "15 Million hectares targeted", "$18 Billion initial funding", "5x higher carbon sequestration vs rainforests"],
      announcements: ["Launch of Global Mangrove Satellite Tracker", "First tranche of grants released for coastal communities"],
      decisions: ["Mandatory satellite verification protocol ratified", "40% revenue share earmarked for indigenous guardians"],
    },
    examRelevance: "Essential for Environment & Ecology, Disaster Management, International Treaties, and Blue Carbon Economy.",
    translations: {
      hi: {
        title: "संयुक्त राष्ट्र जलवायु शिखर सम्मेलन ने वैश्विक मैंग्रोव और तटीय आर्द्रभूमि बहाली समझौते को मंजूरी दी",
        quickSummary: [
          "140 देशों ने 2035 तक 1.5 करोड़ हेक्टेयर मैंग्रोव वनों को बहाल करने के समझौते पर हस्ताक्षर किए।",
          "तटीय मैंग्रोव सामान्य जंगलों की तुलना में 5 गुना अधिक कार्बन सोखते हैं।",
          "तटीय सुरक्षा के लिए $18 अरब का वैश्विक कोष स्थापित किया गया।"
        ],
        easySummary: "दुनिया के 140 देशों ने समुद्री किनारों पर मैंग्रोव जंगलों को बचाने और नए पौधे लगाने के लिए एक ऐतिहासिक समझौता किया है। ये पेड़ तूफानों से शहरों की रक्षा करते हैं और पर्यावरण से प्रदूषण तेजी से खत्म करते हैं।"
      },
      ur: {
        title: "اقوام متحدہ کے موسمیاتی اجلاس میں ساحلی مینگرووز کی بحالی کے عالمی معاہدے کی منظوری",
        quickSummary: [
          "140 ممالک نے 2035 تک 15 ملین ہیکٹر مینگرووز کی بحالی کا عزم کیا۔",
          "مینگرووز زمینی جنگلات کے مقابلے میں پانچ گنا زیادہ کاربن جذب کرتے ہیں۔",
          "18 ارب ڈالر کے خصوصی ساحلی فنڈ کا قیام عمل میں لایا گیا۔"
        ],
        easySummary: "اقوام متحدہ کے اجلاس میں ساحلی جنگلات کی حفاظت اور بحالی کے لیے بڑا عالمی فیصلہ کیا گیا ہے جس سے طوفانوں کے نقصانات میں نمایاں کمی آئے گی۔"
      }
    },
    isSaved: true,
    isRead: false,
    viewsCount: 22100,
    likesCount: 1890,
  },
  {
    id: "sum-4",
    title: "Supreme Court Delivers Unanimous Verdict on Digital Privacy & Automated Algorithmic Scoring",
    creatorId: "reuters",
    creatorName: "Reuters Wire",
    creatorHandle: "@Reuters",
    creatorAvatar: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=120&auto=format&fit=crop&q=80",
    platform: "x",
    category: "News",
    currentAffairsCategory: "National News",
    publishDate: "2026-09-18T16:45:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://x.com/Reuters/status/183600sample",
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "Constitution Bench ruled 9-0 that citizens have a fundamental 'Right to Algorithmic Explanation' for public service decisions.",
      "Government bodies and automated credit engines must provide human-interpretable reasoning when benefits or loans are denied.",
      "Prohibits 'black box' AI models from being utilized in criminal justice bail determinations.",
      "Sets a 90-day grace period for state agencies to audit and publish algorithm accountability registries.",
    ],
    easySummary: "In a landmark 9-0 ruling, the Supreme Court declared that when a computer algorithm or artificial intelligence decides to deny someone a bank loan, welfare payment, or government permit, the citizen has a fundamental constitutional right to know exactly why. The judges ruled that governments and financial institutions cannot hide behind 'secret software formulas.' If a machine makes a life-altering decision about you, it must be explained in plain language that any human can understand and contest.",
    detailedSummary: "Delivering a comprehensive 240-page judgment on data sovereignty and administrative jurisprudence, the constitutional bench established that opacity in automated decision-making violates the doctrine of natural justice.\n\nThe petitioner coalition had challenged welfare-disbursement rejections where automated biometric and predictive models disqualified thousands of low-income families without articulable grounds. The court affirmed that administrative discretion—whether exercised by a civil servant or an automated neural network—remains subject to constitutional scrutiny.\n\nThe ruling explicitly bars automated risk-scoring in criminal bail proceedings, holding that freedom and liberty cannot be subordinated to statistical probability matrices without human corroboration.",
    keyFacts: {
      names: ["Chief Justice of the Constitutional Bench", "Data Protection Authority", "Civil Liberties Coalition"],
      dates: ["Verdict Date: September 18, 2026", "Compliance Deadline: December 17, 2026 (90 days)"],
      statistics: ["9-0 unanimous verdict", "240-page written judgment", "Over 1.8M welfare applicants affected by previous automated audits"],
      announcements: ["Creation of Public Algorithmic Transparency Register", "Ban on opaque bail-prediction AI algorithms"],
      decisions: ["Right to Algorithmic Explanation affirmed as constitutional", "Mandatory human review process established for appeals"],
    },
    examRelevance: "Top priority for Indian Polity & Governance, Fundamental Rights (Article 21), Administrative Law, and Judicial Oversight of AI.",
    translations: {
      hi: {
        title: "सुप्रीम कोर्ट का ऐतिहासिक फैसला: डिजिटल गोपनीयता और स्वचालित एल्गोरिदम पर नागरिकों को मिला स्पष्टीकरण का अधिकार",
        quickSummary: [
          "संविधान पीठ का सर्वसम्मत 9-0 फैसला: सरकारी व वित्तीय फैसलों में एल्गोरिदम का कारण बताना अनिवार्य।",
          "क्रेडिट या कल्याणकारी लाभ अस्वीकार होने पर नागरिकों को कारण जानने का मौलिक अधिकार।",
          "आपराधिक मामलों में जमानत तय करने के लिए गोपनीय AI मॉडल के इस्तेमाल पर पूर्ण रोक।"
        ],
        easySummary: "सुप्रीम कोर्ट ने एक ऐतिहासिक फैसले में कहा है कि यदि कोई कंप्यूटर या AI आपके ऋण, कल्याणकारी लाभ या सरकारी सेवा को अस्वीकार करता है, तो आपको यह जानने का पूरा अधिकार है कि ऐसा क्यों किया गया।"
      },
      ur: {
        title: "سپریم کورٹ کا متفقہ تاریخی فیصلہ: خودکار الگورتھم فیصلوں میں شہریوں کو وضاحت کا آئینی حق مل گیا",
        quickSummary: [
          "9 رکنی بینچ کا متفقہ فیصلہ: سرکاری اور مالیاتی خدمات میں بلیک باکس AI کا استعمال کالعدم۔",
          "شہریوں کو اپنے قرض یا مراعات مسترد ہونے کی واضح وجوہات جاننے کا حق حاصل ہوا۔",
          "عدالتی نظام میں ضمانت کے لیے مصنوعی ذہانت کے استعمال پر پابندی عائد۔"
        ],
        easySummary: "سپریم کورٹ نے متفقہ فیصلے میں شہریوں کے حق میں فیصلہ دیا ہے کہ کوئی بھی کمپیوٹر یا ادارہ خفیہ فارمولے کے ذریعے کسی شہری کا حق نہیں چھین سکتا۔"
      }
    },
    isSaved: true,
    isRead: false,
    viewsCount: 31200,
    likesCount: 2950,
  },
  {
    id: "sum-5",
    title: "Quantum Computing Benchmark: 10,000 Logical Qubits Fault-Tolerant System Demonstrated",
    creatorId: "cleo_abram",
    creatorName: "Cleo Abram (Huge If True)",
    creatorHandle: "@cleoabram",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Technology",
    currentAffairsCategory: "Science & Technology",
    publishDate: "2026-09-18T14:10:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://youtube.com/watch?v=sample_quantum_qubits",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "Engineers showcased a cryogenic system sustaining 10,000 logical error-corrected qubits for over 12 minutes.",
      "Achieved a physical-to-logical qubit ratio of 40:1, down from prior estimates of 1,000:1.",
      "Successfully simulated complex nitrogenase enzyme molecular catalysts for room-temperature fertilizer synthesis.",
      "Marks the transition of quantum technology from experimental physics to scalable commercial chemistry.",
    ],
    easySummary: "Quantum computers have long been famous for being fragile—make one tiny vibration or temperature change, and the calculation gets ruined by errors. In this breakthrough video, researchers proved a system that stays completely stable with 10,000 error-corrected 'logical' qubits. They used this machine to simulate the exact molecular chemistry of fertilizer production at room temperature. This single discovery could save up to 2% of the entire world's energy consumption by eliminating the massive heat needed to make agricultural fertilizer.",
    detailedSummary: "Quantum hardware developer QuantaCore, in joint partnership with national laboratories, published experimental validation of topological surface codes operating across 10,000 logical qubits. Previous industry benchmarks struggled with thermal decoherence and crosstalk noise above 100 logical qubits.\n\nBy leveraging neutral-atom optical tweezers paired with superconducting resonators, the team achieved a dramatic compression in error-correction overhead, slashing the required physical-to-logical ratio to just 40:1.\n\nTo prove practical computational utility, the system calculated the ground-state Hamiltonian of the FeMoco nitrogenase cluster—a problem mathematically intractable for the world's fastest exascale classical supercomputers. The simulation revealed a low-barrier reaction pathway for ambient-temperature nitrogen fixation, unlocking revolutionary implications for global agriculture.",
    keyFacts: {
      names: ["QuantaCore Systems", "Argonne National Laboratory", "International Quantum Standards Group"],
      dates: ["Validation Date: September 2026", "Pilot Chemistry Deployments: Mid-2027"],
      statistics: ["10,000 logical qubits", "40:1 physical to logical ratio", "12+ minute coherence duration", "Potential 2% global energy reduction"],
      announcements: ["Successful FeMoco catalyst simulation", "Open-source quantum chemistry benchmark suite"],
      decisions: ["Commercial cloud API access initiated for research institutions"],
    },
    examRelevance: "High relevance for GS Paper III (Emerging Frontiers in Quantum Tech, Biotechnology & Sustainable Agriculture).",
    translations: {
      hi: {
        title: "क्वांटम कंप्यूटिंग में अभूतपूर्व प्रगति: 10,000 लॉजिकल क्यूबिट्स वाले त्रुटि-रहित सिस्टम का सफल प्रदर्शन",
        quickSummary: [
          "वैज्ञानिकों ने 10,000 लॉजिकल क्यूबिट्स के साथ 12 मिनट तक त्रुटि-रहित गणना की।",
          "उर्वरक निर्माण में ऊर्जा बचाने वाले उत्प्रेरक की सफल आणविक सिमुलेशन।",
          "क्वांटम तकनीक प्रयोगशाला से निकलकर वास्तविक औद्योगिक उपयोग के करीब पहुंची।"
        ],
        easySummary: "क्वांटम कंप्यूटर के क्षेत्र में सबसे बड़ी समस्या थी कि इसमें गलतियां बहुत जल्दी होती थीं। नए सिस्टम ने 10,000 सुरक्षित क्यूबिट्स के साथ शून्य त्रुटि के साथ काम करके दिखाया है। इससे खाद और दवाओं के निर्माण में क्रांतिकारी बदलाव आएंगे।"
      },
      ur: {
        title: "کوانٹم کمپیوٹنگ میں اہم سنگ میل: 10,000 لاجیکل کیوبٹس کا شاندار اور محفوظ مظاہرہ",
        quickSummary: [
          "غلطیوں سے پاک 10,000 کیوبٹس پر مشتمل سسٹم نے 12 منٹ سے زائد مستقل کام کیا۔",
          "کھاد کی تیاری میں عالمی سطح پر توانائی کی 2 فیصد بچت کا فارمولا دریافت۔",
          "سپر کمپیوٹرز کے مقابلے میں ہزاروں گنا تیز رفتار حساب ممکن ہوا۔"
        ],
        easySummary: "کوانٹم کمپیوٹرز نے اب تجرباتی مرحلے سے آگے بڑھ کر عملی سائنسی مسائل حل کرنا شروع کر دیے ہیں۔ اس ایجاد سے زرعی اور کیمیائی صنعتوں کو زبردست فائدہ ہوگا۔"
      }
    },
    isSaved: false,
    isRead: true,
    viewsCount: 45000,
    likesCount: 4100,
  },
  {
    id: "sum-6",
    title: "International Olympic Committee Finalizes Esports & Mixed Reality Disciplines for 2028 Games",
    creatorId: "espn",
    creatorName: "ESPN Global Brief",
    creatorHandle: "@espn",
    creatorAvatar: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80",
    platform: "x",
    category: "Sports",
    currentAffairsCategory: "Sports",
    publishDate: "2026-09-18T10:15:00Z",
    readingTimeMinutes: 1,
    originalUrl: "https://x.com/espn/status/183590sample",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "IOC Executive Board approved four physical esports (phygital) medal events for Los Angeles 2028.",
      "Included sports: Virtual Sailing, Connected Cycling, Mixed-Reality Archery, and Robotic Taekwondo.",
      "Strict anti-doping and hardware standardization guidelines codified for all qualifying tournaments.",
      "Designed to engage global youth demographics while maintaining rigorous physical exertion standards.",
    ],
    easySummary: "The International Olympic Committee has made history by officially adding four 'mixed reality' sports as full medal events for the 2028 Olympic Games. Rather than sedentary screen gaming, these events are 'phygital'—athletes exert real physical power on smart indoor bicycles, virtual ocean sailing simulators, and sensor-tracked mixed reality archery. The athletes will be tested for physical performance and anti-doping just like traditional track and field competitors.",
    detailedSummary: "The International Olympic Committee (IOC) concluded its extraordinary general session with a decisive vote approving the inclusion of four hybrid physical-digital events under the official Olympic Charter. The move follows six years of trial showcases that demonstrated high biometric exertion among competitors.\n\nCritically, the IOC reiterated that only disciplines requiring measurable cardiovascular and neuromuscular exertion would be eligible, excluding sedentary esports titles. Equipment manufacturers must submit all sensor rigs, haptic force-feedback suits, and timing peripherals to certified third-party cryptographic calibration to prevent software tampering.\n\nBroadcasters project that this integration will draw record digital streaming viewership across Gen Z and Gen Alpha demographics worldwide.",
    keyFacts: {
      names: ["International Olympic Committee (IOC)", "World Anti-Doping Agency (WADA)", "LA28 Organizing Committee"],
      dates: ["Decision Date: September 18, 2026", "Olympic Debut: July 2028"],
      statistics: ["4 Medal events ratified", "120 Participating nations expected in qualifications", "Minimum 160 bpm heart rate physical exertion threshold"],
      announcements: ["Official inclusion in 2028 Olympic Schedule", "Hardware certification standard ISO/IEC 29881 published"],
      decisions: ["Sedentary video games permanently excluded from medal events"],
    },
    examRelevance: "Relevant for Sports Current Affairs, Global Cultural Governance, and Technology in Physical Athletics.",
    translations: {
      hi: {
        title: "अंतर्राष्ट्रीय ओलंपिक समिति ने 2028 खेलों के लिए मिक्स्ड रियलिटी और फिजिटल खेलों को दी आधिकारिक मंजूरी",
        quickSummary: [
          "लॉस एंजिल्स 2028 ओलंपिक में 4 फिजिटल खेल पदक स्पर्धाओं के रूप में शामिल।",
          "स्मार्ट साइक्लिंग, वर्चुअल नौकायन और मिक्स्ड रियलिटी तीरंदाजी को हरी झंडी मिली।",
          "पारंपरिक खेलों की तरह ही कड़े एंटी-डोपिंग और शारीरिक परीक्षण नियम लागू होंगे।"
        ],
        easySummary: "ओलंपिक समिति ने 2028 के ओलंपिक खेलों में चार आधुनिक 'फिजिटल' खेलों को पदक स्पर्धा का दर्जा दे दिया है। इनमें खिलाड़ी असली ताकत और पसीने के साथ वर्चुअल तकनीक का उपयोग करेंगे।"
      },
      ur: {
        title: "بین الاقوامی اولمپک کمیٹی نے 2028 گیمز کے لیے مکسڈ رئیلٹی کھیلوں کو شامل کر لیا",
        quickSummary: [
          "لاس اینجلس 2028 اولمپکس میں چار ہائبرڈ فزیکل گیمز کے میڈلز کی منظوری۔",
          "ورچوئل سیلنگ، کنیکٹڈ سائیکلنگ اور مکسڈ رئیلٹی تیر اندازی شامل۔",
          "سخت اینٹی ڈوپنگ قوانین لاگو ہوں گے۔"
        ],
        easySummary: "اولمپک کمیٹی نے نوجوان نسل کو راغب کرنے کے لیے جسمانی محنت والے نئے ڈیجیٹل کھیلوں کو باقاعدہ اولمپک تمغوں کے لیے منتخب کر لیا ہے۔"
      }
    },
    isSaved: false,
    isRead: false,
    viewsCount: 27400,
    likesCount: 1680,
  },
  {
    id: "sum-7",
    title: "Global Education Forum Mandates Universal AI Literacy and Critical Thinking in Secondary Curricula",
    creatorId: "kurzgesagt",
    creatorName: "Kurzgesagt – In a Nutshell",
    creatorHandle: "@Kurzgesagt",
    creatorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    platform: "youtube",
    category: "Education",
    currentAffairsCategory: "Education",
    publishDate: "2026-09-17T18:30:00Z",
    readingTimeMinutes: 2,
    originalUrl: "https://youtube.com/watch?v=sample_ai_education",
    thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    quickSummary: [
      "UNESCO-backed consortium of 85 education ministries released the 2030 Global Curriculum Standard.",
      "Mandates that secondary school students learn algorithmic bias detection, prompt verification, and synthetic media fact-checking.",
      "Replaces traditional rote-memorization exams with interactive problem-solving evaluations.",
      "Provides free multilingual teaching toolkits to over 50,000 public schools in developing economies.",
    ],
    easySummary: "Instead of banning artificial intelligence in classrooms, educational leaders across 85 countries have agreed that students must be trained to use it responsibly. The new global curriculum standard shifts away from asking kids to memorize dates and formulas that any smartphone can look up in a second. Instead, students will be taught how to check whether AI answers are accurate, spot fake media, detect algorithmic bias, and use AI as an intellectual thinking partner for real-world science and social projects.",
    detailedSummary: "The UNESCO World Forum on Education concluded with unanimous ratification of the 'AI in Pedagogy Framework'. Education researchers stressed that preparing youth for the 2030 workforce requires dismantling legacy assessment formats reliant on memorization.\n\nThe benchmark establishes five core learning modules: data provenance, prompt engineering ethics, cognitive bias auditing, collaborative human-AI creative writing, and digital privacy defense.\n\nTo bridge the digital divide between high-income and low-income nations, the coalition allocated $450 million for offline-first localized AI learning modules distributed across rural educational districts.",
    keyFacts: {
      names: ["UNESCO", "Global Education Coalition", "International Bureau of Education"],
      dates: ["Adopted: September 17, 2026", "Phased School Implementation: 2027-2030"],
      statistics: ["85 Signatory education ministries", "50,000+ public schools targeted", "$450 Million equity fund for developing regions"],
      announcements: ["Launch of 2030 Global Curriculum Standard", "Discontinuation of standardized rote memorization tests"],
      decisions: ["Mandatory secondary school AI literacy requirement ratified"],
    },
    examRelevance: "Crucial for Education Reforms, Social Justice, Human Resource Development, and Technology in Governance.",
    translations: {
      hi: {
        title: "वैश्विक शिक्षा मंच ने माध्यमिक स्तर पर AI साक्षरता और आलोचनात्मक सोच को अनिवार्य किया",
        quickSummary: [
          "85 देशों के शिक्षा मंत्रालयों ने 2030 वैश्विक पाठ्यक्रम मानक को अपनाया।",
          "रटने की व्यवस्था खत्म करके समस्या-समाधान और AI सटीकता परखने की पढ़ाई होगी।",
          "विकासशील देशों के 50,000 से अधिक स्कूलों को मुफ्त आधुनिक शिक्षण सामग्री दी जाएगी।"
        ],
        easySummary: "शिक्षा में बड़ा बदलाव करते हुए 85 देशों ने तय किया है कि स्कूलों में रटने की जगह छात्रों को AI का सही उपयोग करना, गलत सूचनाओं को पहचानना और रचनात्मक सोच विकसित करना सिखाया जाएगा।"
      },
      ur: {
        title: "عالمی ایجوکیشن فورم نے ثانوی نصاب میں مصنوعی ذہانت کی تعلیم لازمی قرار دے دی",
        quickSummary: [
          "85 ممالک نے 2030 کے مشترکہ تعلیمی نصاب پر دستخط کیے۔",
          "رٹہ بازی کے امتحانات کی جگہ تخلیقی اور تنقیدی صلاحیتوں کی جانچ ہوگی۔",
          "50 ہزار سرکاری اسکولوں میں مفت تعلیمی مواد فراہم کیا جائے گا۔"
        ],
        easySummary: "دنیا بھر کے تعلیمی رہنماؤں نے متفقہ فیصلہ کیا ہے کہ اسکولوں میں طلباء کو سمارٹ ٹیکنالوجی اور فیک نیوز کی شناخت سکھائی جائے گی تاکہ وہ جدید دور کے چیلنجز کا سامنا کر سکیں۔"
      }
    },
    isSaved: false,
    isRead: false,
    viewsCount: 19800,
    likesCount: 1750,
  }
];

export const INITIAL_DAILY_DIGEST: DailyDigest = {
  date: "2026-09-19",
  totalContentToday: 42,
  estimatedReadingTimeMinutes: 5,
  briefingHeadline: "Sovereign Tech Bonds, Record Perovskite Solar Breakthrough & Judicial AI Privacy Safeguards",
  executiveOverview: "Today's macro briefing highlights decisive structural evolutions across three interconnected pillars: global finance, clean technology, and algorithmic civil liberties. Central banks formalized a $1.2T green tech liquidity treaty, while solar researchers broke through commercial 35% efficiency ceilings with tandem perovskite cells. Simultaneously, the judiciary established historic constitutional rights guarding citizens from opaque automated algorithms.",
  keyTakeaways: [
    "Global Central Banks unify sovereign green bond standards to unlock $1.2T in sustainable AI computing infrastructure.",
    "Perovskite-Silicon tandem solar cells shatter commercial records at 35.2% efficiency with guaranteed 25-year operational stability.",
    "Supreme Court 9-0 unanimous bench establishes the constitutional 'Right to Algorithmic Explanation' for public benefits and credit scoring.",
    "UN Climate Summit binds 140 countries to restore 15 million hectares of high-capacity carbon-capturing mangroves by 2035.",
    "10,000 logical qubit fault-tolerant quantum computer simulates room-temperature nitrogenase catalyst for global fertilizer production.",
  ],
  quoteOfTheDay: '"In an age of overwhelming noise and endless media feeds, true intelligence is knowing what to ignore and extracting the core signal in minutes." — SummaryHub Editorial',
  topSummaryIds: ["sum-1", "sum-2", "sum-4", "sum-3", "sum-5", "sum-6", "sum-7"],
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Daily Digest Ready",
    message: "Everything important from today synthesized into a 5-minute executive briefing.",
    type: "daily_digest",
    timestamp: "15m ago",
    read: false,
  },
  {
    id: "notif-2",
    title: "Breaking News Alert",
    message: "Supreme Court delivers unanimous 9-0 judgment on digital privacy and automated algorithmic scoring.",
    type: "breaking_news",
    timestamp: "1h ago",
    read: false,
    linkSummaryId: "sum-4",
  },
  {
    id: "notif-3",
    title: "The Economist published new analysis",
    message: "Global Central Banks Announce Coordinated Liquidity Framework for AI & Tech Sovereign Bonds.",
    type: "creator_upload",
    timestamp: "3h ago",
    read: true,
    linkSummaryId: "sum-1",
  },
  {
    id: "notif-4",
    title: "Weekly Current Affairs Digest",
    message: "7 key National & International events compiled for competitive exam aspirants.",
    type: "exam_alert",
    timestamp: "1d ago",
    read: true,
  },
];
