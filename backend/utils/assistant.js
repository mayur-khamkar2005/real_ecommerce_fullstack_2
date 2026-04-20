/**
 * Smart Shopping Assistant - Conversational AI Engine
 * 
 * Features:
 * - Multi-language support (English, Hindi, Hinglish, Marathi)
 * - Word-based dynamic sentence generation
 * - Intent detection (greeting, smalltalk, suggestion, unknown)
 * - Natural conversation flow with randomized responses
 */

// ==========================================
// WORD MEMORY SYSTEM (200-300 words per category per language)
// ==========================================

const WORD_BANKS = {
  en: {
    greetings: [
      'Hey', 'Hi', 'Hello', 'Hey there', 'Hi there', 'Greetings', 'Welcome',
      'Hey friend', 'Hi buddy', 'Hello pal', 'Hey champ', 'Hi superstar',
      'Hey lovely', 'Hi amazing', 'Hello wonderful', 'Hey gorgeous',
      'What\'s up', 'Howdy', 'Heyya', 'Hiya', 'Hello mate', 'Hey buddy',
      'Good to see you', 'Nice to meet you', 'Welcome back', 'Hey stranger'
    ],
    verbs: [
      'looking', 'searching', 'finding', 'helping', 'assisting', 'discovering',
      'exploring', 'checking', 'browsing', 'shopping', 'thinking', 'considering',
      'planning', 'wanting', 'needing', 'seeking', 'hunting', 'scanning',
      'reviewing', 'analyzing', 'comparing', 'selecting', 'choosing', 'picking',
      'grabbing', 'getting', 'buying', 'ordering', 'purchasing', 'exploring',
      'checking out', 'hunting for', 'searching for', 'looking for'
    ],
    emotions: [
      'happy', 'excited', 'great', 'awesome', 'amazing', 'wonderful',
      'fantastic', 'brilliant', 'excellent', 'perfect', 'lovely', 'nice',
      'cool', 'interesting', 'fun', 'pleasant', 'delightful', 'superb',
      'outstanding', 'magnificent', 'marvelous', 'terrific', 'fabulous',
      'incredible', 'impressive', 'remarkable', 'spectacular', 'phenomenal',
      'stunning', 'gorgeous', 'beautiful', 'elegant', 'stylish', 'trendy'
    ],
    fillers: [
      'I think', 'probably', 'maybe', 'perhaps', 'likely', 'definitely',
      'absolutely', 'sure', 'certainly', 'obviously', 'clearly', 'seems like',
      'looks like', 'appears', 'I guess', 'I believe', 'I assume', 'I suppose',
      'honestly', 'actually', 'basically', 'essentially', 'generally',
      'typically', 'usually', 'normally', 'well', 'you know', 'I mean',
      'let me see', 'hmm', 'okay', 'alright', 'got it'
    ],
    connectors: [
      'and', 'also', 'plus', 'additionally', 'moreover', 'furthermore',
      'besides', 'however', 'but', 'though', 'although', 'yet',
      'still', 'nevertheless', 'meanwhile', 'therefore', 'thus',
      'consequently', 'so', 'hence', 'accordingly', 'as a result',
      'in addition', 'on top of that', 'what\'s more', 'not only that',
      'more importantly', 'at the same time', 'in fact', 'indeed'
    ],
    shopping_terms: [
      'product', 'item', 'deal', 'offer', 'discount', 'sale',
      'price', 'budget', 'quality', 'brand', 'review', 'rating',
      'popular', 'trending', 'bestseller', 'new arrival', 'featured',
      'recommended', 'top-rated', 'premium', 'affordable', 'value',
      'worth', 'bargain', 'steal', 'investment', 'purchase', 'choice',
      'collection', 'range', 'selection', 'variety', 'options', 'catalog'
    ],
    products: [
      'laptop', 'phone', 'shoes', 'headphones', 'camera', 'watch',
      'bag', 'shirt', 'jeans', 'speaker', 'TV', 'tablet', 'monitor',
      'keyboard', 'mouse', 'charger', 'backpack', 'jacket', 'sneakers',
      'earbuds', 'smartwatch', 'desktop', 'printer', 'router'
    ],
    helpful_phrases: [
      'I\'d be happy to help', 'Let me assist you', 'I can help with that',
      'Sure thing', 'No problem', 'Absolutely', 'Of course', 'Certainly',
      'I\'m here for you', 'Happy to help', 'Glad to assist',
      'My pleasure', 'Anytime', 'You got it', 'Consider it done',
      'I\'ll take care of it', 'Leave it to me', 'I\'m on it',
      'Just tell me what you need', 'I\'m ready to help', 'Let\'s find it together'
    ],
    questions: [
      'What can I do for you?', 'How can I help?', 'What are you looking for?',
      'Need any assistance?', 'Looking for something specific?', 'Tell me more!',
      'What do you need?', 'How can I assist you today?', 'What brings you here?',
      'What can I help you find?', 'Need recommendations?', 'Want me to search?'
    ],
    observations: [
      'you seem to be browsing', 'you might be shopping', 'you could be exploring',
      'you appear to be searching', 'you look like you need help',
      'you might need assistance', 'you seem interested', 'you\'re browsing around',
      'you\'re checking things out', 'you\'re exploring options'
    ]
  },

  hi: {
    greetings: [
      'नमस्ते', 'हाय', 'हेलो', 'स्वागत है', 'जी', 'नमस्कार',
      'राधे राधे', 'जय हिंद', 'प्रणाम', 'सत् श्री अकाल', 'नमो',
      'हर हर महादेव', 'हेलो दोस्त', 'हाय यार', 'कैसे हैं आप',
      'हेलो भाई', 'हाय दीदी', 'नमस्ते जी', 'कैसे हो दोस्त', 'हाय दोस्त',
      'खुश आमदीद', 'आपका स्वागत है', 'मिलके खुशी हुई'
    ],
    verbs: [
      'ढूंढ रहे', 'खोज रहे', 'देख रहे', 'मदद कर रहे', 'बता रहे',
      'सोच रहे', 'विचार कर रहे', 'पसंद कर रहे', 'चुन रहे', 'खरीद रहे',
      'ब्राउज़ कर रहे', 'चेक कर रहे', 'तलाश कर रहे', 'समझ रहे',
      'जानना चाहते', 'पूछ रहे', 'देखना चाहते', 'खरीदना चाहते',
      'तलाश रहे हो', 'ढूंढ रहे हो', 'सोच रहे हो', 'विचार रहे हो'
    ],
    emotions: [
      'खुश', 'बहुत अच्छा', 'शानदार', 'बेहतरीन', 'ज़बरदस्त', 'कमाल',
      'अद्भुत', 'श्रेष्ठ', 'उत्तम', 'प्यारा', 'सुंदर', 'मज़ेदार',
      'दिलचस्प', 'रोमांचक', 'अविश्वसनीय', 'प्रभावशाली', 'लाजवाब',
      'तगड़ा', 'बढ़िया', 'वाह', 'शांडार', 'खूबसूरत', 'अच्छा',
      'बहुत बढ़िया', 'ज़बर्दस्त', 'कमाल का', 'शानदार', 'बेहतरीन'
    ],
    fillers: [
      'मुझे लगता है', 'शायद', 'हो सकता है', 'जाहिर है', 'बिल्कुल',
      'निश्चित रूप से', 'सच कहूं तो', 'असल में', 'मूल रूप से',
      'आम तौर पर', 'ज़्यादातर', 'अक्सर', 'हमें लगता है',
      'मेरा मानना है', 'मेरे ख्याल से', 'लगभग', 'काफी', 'एकदम',
      'पूरी तरह', 'सही से', 'अच्छा', 'ठीक है', 'चलो', 'देखो',
      'सुनो', 'रुको', 'ज़रा', 'थोड़ा', 'बस', 'हाँ', 'हाँ जी'
    ],
    connectors: [
      'और', 'साथ ही', 'इसके अलावा', 'लेकिन', 'परंतु', 'हालांकि',
      'फिर भी', 'इसलिए', 'अतः', 'इस प्रकार', 'नतीजतन', 'यानी',
      'मतलब', 'वैसे', 'वैसे भी', 'उपरि', 'साथ में', 'इसके साथ',
      'न केवल', 'बल्कि', 'या तो', 'या फिर', 'अगर', 'तो',
      'क्योंकि', 'जबकि', 'जैसे', 'ताकि', 'इसीलिए', 'फिर'
    ],
    shopping_terms: [
      'प्रोडक्ट', 'सामान', 'चीज़', 'डील', 'ऑफर', 'छूट',
      'सेल', 'कीमत', 'बजट', 'गुणवत्ता', 'ब्रांड', 'समीक्षा',
      'रेटिंग', 'लोकप्रिय', 'ट्रेंडिंग', 'बेस्टसेलर', 'नया',
      'फ़ीचर्ड', 'अनुशंसित', 'टॉप रेटेड', 'प्रीमियम', 'सस्ता',
      'किफायती', 'वैल्यू', 'लाभदायक', 'सौदा', 'खरीद', 'विकल्प',
      'संग्रह', 'श्रृंखला', 'चयन', 'विविधता', 'विकल्प'
    ],
    products: [
      'लैपटॉप', 'फ़ोन', 'जूते', 'हेडफ़ोन', 'कैमरा', 'घड़ी',
      'बैग', 'शर्ट', 'जीन्स', 'स्पीकर', 'टीवी', 'टैबलेट',
      'मॉनिटर', 'कीबोर्ड', 'माउस', 'चार्जर', 'बैकपैक', 'जैकेट',
      'स्नीकर्स', 'ईयरबड्स', 'स्मार्टवॉच', 'डेस्कटॉप', 'प्रिंटर'
    ],
    helpful_phrases: [
      'मैं मदद कर सकता हूँ', 'ज़रूर बताता हूँ', 'कोई बात नहीं',
      'बिल्कुल', 'जी हाँ', 'अवश्य', 'निश्चित रूप से', 'मेरी खुशी है',
      'मैं यहाँ हूँ आपकी मदद के लिए', 'खुशी से बताऊंगा',
      'ज़रूर', 'बताइए', 'कहिए', 'हाँ जी', 'ठीक है', 'चलिए देखते हैं',
      'मदद करने में खुशी होगी', 'बताओ क्या चाहिए', 'मैं हूँ ना'
    ],
    questions: [
      'क्या मदद करूं?', 'क्या चाहिए आपको?', 'क्या ढूंढ रहे हैं?',
      'कैसे मदद कर सकता हूँ?', 'क्या बताऊं?', 'क्या देखना है?',
      'आपको क्या चाहिए?', 'मैं क्या कर सकता हूँ?', 'बताइए क्या चाहिए?',
      'क्या खोज रहे हैं?', 'क्या सुझाऊं?', 'क्या दिखाना है?'
    ],
    observations: [
      'आप शायद कुछ ढूंढ रहे हैं', 'लगता है आप खरीदारी कर रहे हैं',
      'शायद आपको मदद चाहिए', 'आप ब्राउज़ कर रहे हैं',
      'लगता है आप कुछ देख रहे हैं', 'आप तलाश कर रहे हैं',
      'शायद आपको कुछ चाहिए', 'आप विकल्प देख रहे हैं',
      'लगता है आप सोच रहे हैं', 'आप खरीदारी के बारे में सोच रहे हैं'
    ]
  },

  hinglish: {
    greetings: [
      'Hey', 'Hi', 'Hello', 'Kya haal hai', 'Kaise ho', 'Hey bro',
      'Hi yaar', 'Hello dost', 'Kya chal raha', 'Aur bhai', 'Kaise ho yaar',
      'Hey friend', 'Hi dude', 'Hello ji', 'Namaste', 'Kya scene hai',
      'Sab badhiya', 'Hey yaar', 'Hi bhai', 'Hello sis', 'Kya baat hai',
      'Yo bro', 'Hey dude', 'Hi pal', 'What\'s up yaar', 'Hello friend'
    ],
    verbs: [
      'dhund raha', 'search kar raha', 'dekh raha', 'help kar raha',
      'bata raha', 'soch raha', 'check kar raha', 'browse kar raha',
      'shop kar raha', 'explore kar raha', 'try kar raha', 'choose kar raha',
      'pick kar raha', 'buy kar raha', 'order kar raha', 'find kar raha',
      'hunt kar raha', 'scan kar raha', 'review kar raha', 'compare kar raha',
      'dekhnna chahta', 'khareedna chahta', 'search karna', 'dhundhna'
    ],
    emotions: [
      'badhiya', 'mast', 'awesome', 'great', 'ekdum sahi', 'zabardast',
      'kamaal', 'shandar', 'amazing', 'cool', 'nice', 'lovely',
      'perfect', 'superb', 'fantastic', 'brilliant', 'outstanding',
      'tagda', 'bekaar', 'mast', 'dhamaka', 'jhakaas', 'kadak',
      'solah kala', 'top', 'first class', 'dil khush', 'maza', 'interesting'
    ],
    fillers: [
      'I think', 'shayad', 'maybe', 'probably', 'definitely',
      'bilkul', 'for sure', 'obviously', 'clearly', 'lagta hai',
      'I guess', 'I believe', 'honestly', 'actually', 'basically',
      'yaar', 'matlab', 'actually bataun', 'sach kahun', 'ekdum',
      'kaafi', 'almost', 'nearly', 'bas', 'sirf', 'acha', 'theek hai',
      'chalo', 'dekh', 'sun', 'ruk', 'zara', 'thoda', 'haan', 'okay'
    ],
    connectors: [
      'aur', 'also', 'plus', 'but', 'par', 'lekin', 'however',
      'therefore', 'isliye', 'so', 'hence', 'toh', 'waise',
      'vaise bhi', 'by the way', 'anyway', 'anyways', 'or',
      'ya', 'ya toh', 'agar', 'if', 'then', 'toh phir', 'basically',
      'actually', 'matlab', 'kyunki', 'jabki', 'jaise', 'taaki'
    ],
    shopping_terms: [
      'product', 'item', 'cheez', 'deal', 'offer', 'discount',
      'sale', 'price', 'budget', 'quality', 'brand', 'review',
      'rating', 'popular', 'trending', 'bestseller', 'new',
      'featured', 'recommended', 'top-rated', 'premium', 'affordable',
      'sasta', 'mehenga', 'worth it', 'value for money', 'paisa vasool',
      'collection', 'range', 'selection', 'variety', 'options', 'catalog'
    ],
    products: [
      'laptop', 'phone', 'shoes', 'headphones', 'camera', 'watch',
      'bag', 'shirt', 'jeans', 'speaker', 'TV', 'tablet', 'monitor',
      'keyboard', 'mouse', 'charger', 'backpack', 'jacket', 'sneakers',
      'earbuds', 'smartwatch', 'desktop', 'printer', 'mobile'
    ],
    helpful_phrases: [
      'I can help', 'help kar sakta hoon', 'bata sakta hoon',
      'sure yaar', 'no problem', 'bilkul', 'of course', 'definitely',
      'happy to help', 'koi baat nahi', 'tension mat lo',
      'main hoon na', 'leave it on me', 'I\'ll handle it',
      'don\'t worry', 'chill yaar', 'easy hai', 'simple hai',
      'batana kya chahiye', 'main help karunga', 'koi nahi yaar'
    ],
    questions: [
      'Kya help karoon?', 'Kya chahiye?', 'Kya dhund rahe ho?',
      'How can I help?', 'Kya bataun?', 'Kya dekhna hai?',
      'What do you need?', 'Kya search karun?', 'Kya dikhaun?',
      'Need help?', 'Kya chahiye yaar?', 'Batao kya dhundna hai?',
      'Want suggestions?', 'Kya dekh rahe ho?', 'Search karun?'
    ],
    observations: [
      'lagta hai tum kuch dhund rahe ho', 'shayad tum shopping kar rahe ho',
      'tum browse kar rahe ho', 'lagta hai tum dekh rahe ho',
      'tum search kar rahe ho', 'lagta hai tum soch rahe ho',
      'tum options dekh rahe ho', 'shayad tumhe kuch chahiye',
      'tum explore kar rahe ho', 'lagta hai tum compare kar rahe ho'
    ]
  },

  mr: {
    greetings: [
      'नमस्कार', 'हाय', 'हेलो', 'स्वागत', 'कसे आहात', 'नमस्ते',
      'हरि ओम', 'राम राम', 'जय महाराष्ट्र', 'नमस्कार मित्रा',
      'हाय دوست', 'हेलो बाबा', 'कसे हो', 'स्वागत आहे', 'भेटून आनंद झाला',
      'पुन्हा भेटलो', 'कसे काय', 'सर्व कसे', 'काय चाललंय', 'नमस्कार जी'
    ],
    verbs: [
      'शोधत आहे', 'पाहत आहे', 'मदत करत आहे', 'सांगत आहे', 'विचार करत आहे',
      'निवडत आहे', 'खरेदी करत आहे', 'ब्राउझ करत आहे', 'तपासत आहे',
      'ढूंढत आहे', 'शोधत आहेस', 'पाहत आहेस', 'घेणार', 'घेत आहे',
      'बघत आहे', 'विचारत आहे', 'समजून घेत आहे', 'तपासणी करत आहे'
    ],
    emotions: [
      'छान', 'उत्तम', 'अद्भुत', 'शानदार', 'भयंकर', 'कमाल',
      'सुंदर', 'मस्त', 'छान', 'बहुत बरं', 'अतिशय उत्तम', 'खूप छान',
      'प्रभावशाली', 'अद्भुत', 'लाजवाब', 'जबरदस्त', 'वाह',
      'शानदार', 'उत्तम', 'छान', 'मस्त', 'बहर', 'खुश', 'आनंद'
    ],
    fillers: [
      'मला वाटतं', 'कदाचित', 'कदाचित', 'नक्कीच', 'अर्थात',
      'नक्की', 'स्पष्टपणे', 'दिसतं', 'वाटतं', 'असं वाटतं',
      'खरं सांगू', 'प्रत्यक्षात', 'मुळात', 'सामान्यतः', 'बऱ्याचदा',
      'हो', 'ठीक आहे', 'चला', 'पहा', 'ऐका', 'थांबा', 'जरा',
      'थोडं', 'फक्त', 'होय', 'हो बाबा', 'ठीक', 'चल', 'बरं'
    ],
    connectors: [
      'आणि', 'तसेच', 'शिवाय', 'पण', 'परंतु', 'तरीही',
      'म्हणून', 'म्हणजे', 'व', 'किंवा', 'तर', 'जर',
      'कारण', 'जरी', 'जेव्हा', 'जेणेकरून', 'त्यामुळे',
      'याव्यतिरिक्त', 'खरं तर', 'वास्तविक', 'म्हणजेच', 'तर मग'
    ],
    shopping_terms: [
      'प्रॉडक्ट', 'वस्तू', 'चीज', 'डील', 'ऑफर', 'डिस्काउंट',
      'सेल', 'किंमत', 'बजेट', 'गुणवत्ता', 'ब्रँड', 'रिव्ह्यू',
      'रेटिंग', 'लोकप्रिय', 'ट्रेंडिंग', 'बेस्टसेलर', 'नवीन',
      'फिचर्ड', 'शिफारस', 'टॉप रेटेड', 'प्रीमियम', 'स्स्त',
      'परवडणारे', 'मूल्य', 'फायदेशीर', 'सौदा', 'खरेदी', 'पर्याय',
      'संग्रह', 'श्रेणी', 'निवड', 'विविधता', 'विकल्प'
    ],
    products: [
      'लॅपटॉप', 'फोन', 'बूट', 'हेडफोन', 'कॅमेरा', 'घड्याळ',
      'बॅग', 'शर्ट', 'जीन्स', 'स्पीकर', 'टीव्ही', 'टॅबलेट',
      'मॉनिटर', 'कीबोर्ड', 'माउस', 'चार्जर', 'बॅकपॅक', 'जॅकेट',
      'स्नीकर्स', 'इयरबड्स', 'स्मार्टवॉच', 'डेस्कटॉप', 'प्रिंटर'
    ],
    helpful_phrases: [
      'मी मदत करू शकतो', 'नक्की सांगतो', 'काही हरकत नाही',
      'अर्थात', 'होय', 'नक्कीच', 'नक्की', 'माझी इच्छा आहे',
      'मी तुमच्या मदतीसाठी इथे आहे', 'आनंदाने सांगेन',
      'नक्की', 'सांगा', 'बोला', 'होय जी', 'ठीक आहे', 'चला पाहूया',
      'मदत करण्यास आनंद होईल', 'काय हवं सांगा', 'मी आहे ना'
    ],
    questions: [
      'मी काय मदत करू?', 'तुम्हाला काय हवं?', 'तुम्ही काय शोधत आहात?',
      'मी कशी मदत करू शकतो?', 'मी काय सांगू?', 'तुम्हाला काय पाहायचंय?',
      'तुम्हाला काय लागतं?', 'मी काय करू शकतो?', 'सांगा काय हवं?',
      'तुम्ही काय शोधत आहात?', 'मी काय सुचवू?', 'काय दाखवायचंय?',
      'मदत हवी?', 'काय शोधत आहात?', 'शोध करू?'
    ],
    observations: [
      'तुम्ही काहीतरी शोधत आहात', 'लगतं तुम्ही खरेदी करत आहात',
      'तुम्ही ब्राउझ करत आहात', 'लगतं तुम्ही पाहत आहात',
      'तुम्ही शोधत आहात', 'लगतं तुम्ही विचार करत आहात',
      'तुम्ही पर्याय पाहत आहात', 'कदाचित तुम्हाला काहीतरी हवं',
      'तुम्ही एक्सप्लोर करत आहात', 'लगतं तुम्ही तुलना करत आहात'
    ]
  }
};

// ==========================================
// SENTENCE PATTERN TEMPLATES
// ==========================================

const SENTENCE_PATTERNS = {
  greeting: [
    '{greeting}! 👋 {emotion} {observation}. {helpful}. {question}',
    '{greeting}! {filler} {verb} {shopping_terms}. {helpful}! {question}',
    '{greeting}! {emotion} to see you. {helpful}. {question}',
    '{greeting}! {filler} {observation}. {helpful}? {question}'
  ],
  smalltalk: [
    '{filler} {emotion}! {connector} {helpful}. {observation}. {question}',
    '{helpful}! {connector} {filler} {verb} {shopping_terms}. {question}',
    '{filler} {observation}. {connector} {helpful}. {question}',
    'That\'s {emotion}! {filler} {verb} to {helpful}. {question}'
  ],
  suggestion_with_products: [
    '{filler}... {emotion} news! I found {count} {shopping_terms} {verb} your needs. {helpful}! Check them out:',
    '{connector} I\'ve discovered {count} {emotion} options. {filler}, these are the best ones:',
    '{emotion}! Found {count} products that might work. {helpful}! Take a look:',
    '{filler}... Perfect! Got {count} {shopping_terms} for you. Here are my top picks:'
  ],
  suggestion_no_products: [
    '{filler}... couldn\'t find exact matches, {connector} don\'t worry! Here are some {emotion} alternatives:',
    '{filler} that\'s tricky, {connector} I\'ve got some {shopping_terms} that could work. Check these out:',
    'Hmm... {connector} no exact results. {connector} here are some {emotion} options you might like:'
  ],
  unknown: [
    '{helpful}! {connector} {filler} you might be {verb} for {shopping_terms}. Try saying "suggest {product}" or "show me {product}"!',
    'Hmm, {filler} trying to understand, {connector} no worries! {helpful}. Just tell me what you\'re {verb}!',
    '{filler} not sure what you mean, {connector} {helpful}. Try asking for {shopping_terms} or {products}!'
  ]
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// LANGUAGE DETECTION
// ==========================================

function detectLanguage(text) {
  if (!text || text.trim().length === 0) return 'en';
  
  const hindiPattern = /[\u0900-\u097F]/;
  const marathiPattern = /[\u0900-\u097F]/; // Marathi also uses Devanagari
  
  // Check for Devanagari script (Hindi or Marathi)
  if (hindiPattern.test(text)) {
    // Marathi indicators
    const marathiWords = ['आहात', 'मला', 'तुम्हाला', 'काय', 'करू', 'शकतो', 'हवं', 'आहे', 'ना', 'मित्रा', 'महाराष्ट्र'];
    const hasMarathi = marathiWords.some(word => text.includes(word));
    
    if (hasMarathi) return 'mr';
    
    // If it has Devanagari but also English words, it's Hinglish
    const englishWords = text.match(/[a-zA-Z]{3,}/g);
    if (englishWords && englishWords.length > 0) {
      return 'hinglish';
    }
    return 'hi';
  }
  
  // Check for Hinglish patterns (Hindi words in Latin script)
  const hinglishIndicators = [
    'hai', 'kya', 'kaise', 'ho', 'rah', 'mera', 'tumhara',
    'chahiye', 'karo', 'batao', 'yaar', 'bro', 'bhai', 'theek',
    'accha', 'bahut', 'zyada', 'kam', 'mere', 'tere', 'uska',
    'dhund', 'dhundh', 'lagta', 'mujhe', 'tumhe', 'kuch'
  ];
  
  const lowerText = text.toLowerCase();
  const hinglishCount = hinglishIndicators.filter(word => lowerText.includes(word)).length;
  
  if (hinglishCount >= 2) {
    return 'hinglish';
  }
  
  // Default to English
  return 'en';
}

// ==========================================
// INTENT DETECTION (PRIORITY-BASED)
// ==========================================

const INTENT_PATTERNS = {
  greeting: {
    en: /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|what'?s up|hey there|hi there|hello there)|^(hi|hello|hey)\s*(!)?$/i,
    hi: /^(नमस्ते|नमस्कार|हाय|हेलो|स्वागत|राधे राधे|जय हिंद|प्रणाम|सत् श्री अकाल)/i,
    hinglish: /^(namaste|namaskar|hello|hi|hey|sup|hey yaar|hi bro|hello dost|kya scene)/i,
    mr: /^(नमस्कार|हाय|हेलो|स्वागत|हरि ओम|राम राम|जय महाराष्ट्र)/i
  },
  
  smalltalk: {
    en: /^(how are you|how'?s it going|what'?s up|how do you do|who are you|what can you do|tell me about|help me|can you help|are you there|what are you doing)/i,
    hi: /^(कैसे हो|क्या हाल|कैसे हैं|बात करो|मदद करो|कौन हो तुम|क्या कर सकते|क्या कर रहे)/i,
    hinglish: /^(kya haal|kaise ho|how are you|help|kaun ho|kya kar|baat kar|madad|kya kar rahe)/i,
    mr: /^(कसे आहात|कसे हो|काय चाललंय|सर्व कसे|कसं काय)/i
  },
  
  suggestion: {
    en: /(suggest|recommend|show me|find me|search for|looking for|need to buy|want to buy|I need|I want|get me|laptop|phone|shoes|headphones|camera|watch|bag|shirt|jeans|gaming laptop|speaker|tv|tablet|mobile)/i,
    hi: /(चाहिए|दो|दिखाओ|ढूंढ|खरीद|ज़रूरत|सजेशन|लैपटॉप|फ़ोन|जूते|हेडफ़ोन|कैमरा)/i,
    hinglish: /(chahiye|dikhao|dhund|suggest|recommend|laptop|phone|shoes|headphones|camera|buy|need|want|khareed)/i,
    mr: /(हवं|दाखव|शोध|खरेदी|लॅपटॉप|फोन|बूट|हेडफोन|कॅमेरा)/i
  }
};

function detectIntent(text, language = 'en') {
  if (!text || text.trim().length === 0) return 'unknown';
  
  const trimmedText = text.trim();
  
  // Priority 1: Check greeting (exact match only)
  const greetingPattern = INTENT_PATTERNS.greeting[language] || INTENT_PATTERNS.greeting.en;
  if (greetingPattern.test(trimmedText)) {
    return 'greeting';
  }
  
  // Priority 2: Check smalltalk (exact match only)
  const smalltalkPattern = INTENT_PATTERNS.smalltalk[language] || INTENT_PATTERNS.smalltalk.en;
  if (smalltalkPattern.test(trimmedText)) {
    return 'smalltalk';
  }
  
  // Priority 3: Check suggestion (broader match - shopping intent)
  const suggestionPattern = INTENT_PATTERNS.suggestion[language] || INTENT_PATTERNS.suggestion.en;
  if (suggestionPattern.test(trimmedText)) {
    return 'suggestion';
  }
  
  // Default: unknown
  return 'unknown';
}

// ==========================================
// DYNAMIC SENTENCE GENERATOR
// ==========================================

function generateSentence(intent, language, productCount = 0) {
  const words = WORD_BANKS[language];
  if (!words) return generateSentence(intent, 'en', productCount);
  
  let pattern;
  
  // Select pattern based on intent
  if (intent === 'greeting') {
    pattern = getRandomItem(SENTENCE_PATTERNS.greeting);
  } else if (intent === 'smalltalk') {
    pattern = getRandomItem(SENTENCE_PATTERNS.smalltalk);
  } else if (intent === 'suggestion' && productCount > 0) {
    pattern = getRandomItem(SENTENCE_PATTERNS.suggestion_with_products);
  } else if (intent === 'suggestion' && productCount === 0) {
    pattern = getRandomItem(SENTENCE_PATTERNS.suggestion_no_products);
  } else {
    pattern = getRandomItem(SENTENCE_PATTERNS.unknown);
  }
  
  // Replace placeholders with random words
  let sentence = pattern
    .replace('{greeting}', getRandomItem(words.greetings))
    .replace('{verb}', getRandomItem(words.verbs))
    .replace('{emotion}', getRandomItem(words.emotions))
    .replace('{filler}', getRandomItem(words.fillers))
    .replace('{connector}', getRandomItem(words.connectors))
    .replace('{shopping_terms}', getRandomItem(words.shopping_terms))
    .replace('{product}', getRandomItem(words.products))
    .replace('{helpful}', getRandomItem(words.helpful_phrases))
    .replace('{question}', getRandomItem(words.questions))
    .replace('{observation}', getRandomItem(words.observations))
    .replace('{count}', productCount.toString());
  
  return sentence;
}

// ==========================================
// MAIN CONVERSATION PROCESSOR
// ==========================================

function processConversation(query, existingSuggestions = []) {
  const language = detectLanguage(query);
  const intent = detectIntent(query, language);
  const productCount = existingSuggestions.length;
  
  console.log('Query:', query);
  console.log('Intent:', intent);
  console.log('Language:', language);
  
  let message;
  let suggestions = [];
  
  switch (intent) {
    case 'greeting':
      message = generateSentence('greeting', language, 0);
      suggestions = [];
      break;
      
    case 'smalltalk':
      message = generateSentence('smalltalk', language, 0);
      suggestions = [];
      break;
      
    case 'suggestion':
      if (productCount > 0) {
        message = generateSentence('suggestion', language, productCount);
        suggestions = existingSuggestions;
      } else {
        message = generateSentence('suggestion', language, 0);
        suggestions = [];
      }
      break;
      
    default:
      message = generateSentence('unknown', language, 0);
      suggestions = [];
      break;
  }
  
  return {
    message,
    suggestions,
    metadata: {
      language,
      intent,
      timestamp: new Date().toISOString()
    }
  };
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  WORD_BANKS,
  SENTENCE_PATTERNS,
  detectLanguage,
  detectIntent,
  generateSentence,
  processConversation
};
