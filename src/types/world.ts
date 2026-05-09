import * as flags from "country-flag-icons/react/3x2";

export enum LanguageKey {
  ID = "id", // Bahasa Indonesia - Indonesia
  EN = "en", // English - United States
  MS = "ms", // Bahasa Malaysia - Malaysia
  TH = "th", // Thai - Thailand
  FIL = "fil", // Filipino - Philippines
  VI = "vi", // Vietnamese - Vietnam
  ZH = "zh", // Chinese - China
  JA = "ja", // Japanese - Japan
  KO = "ko", // Korean - South Korea
  HI = "hi", // Hindi - India
  FR = "fr", // French - France
  DE = "de", // German - Germany
  IT = "it", // Italian - Italy
  ES = "es", // Spanish - Spain
  PT = "pt", // Portuguese - Portugal
  NL = "nl", // Dutch - Netherlands
  RU = "ru", // Russian - Russia
  AR = "ar", // Arabic - Saudi Arabia
  TR = "tr", // Turkish - Turkey
  PL = "pl", // Polish - Poland
  SV = "sv", // Swedish - Sweden
  NO = "no", // Norwegian - Norway
  DA = "da", // Danish - Denmark
  FI = "fi", // Finnish - Finland
  EL = "el", // Greek - Greece
  CS = "cs", // Czech - Czechia
  HU = "hu", // Hungarian - Hungary
  RO = "ro", // Romanian - Romania
  UK = "uk", // Ukrainian - Ukraine
  HE = "he", // Hebrew - Israel
  UR = "ur", // Urdu - Pakistan
  BN = "bn", // Bengali - Bangladesh
  SI = "si", // Sinhala - Sri Lanka
  MY = "my", // Burmese - Myanmar
  KM = "km", // Khmer - Cambodia
  LO = "lo", // Lao - Laos
  NE = "ne", // Nepali - Nepal
  AM = "am", // Amharic - Ethiopia
  SW = "sw", // Swahili - Tanzania
  FA = "fa", // Persian - Iran
  TA = "ta", // Tamil - India
  TE = "te", // Telugu - India
  MR = "mr", // Marathi - India
  GU = "gu", // Gujarati - India
  PA = "pa", // Punjabi - India
  JV = "jv", // Javanese - Indonesia
  SU = "su", // Sundanese - Indonesia
  UZ = "uz", // Uzbek - Uzbekistan
  AZ = "az", // Azerbaijani - Azerbaijan
  KK = "kk", // Kazakh - Kazakhstan
  BG = "bg", // Bulgarian - Bulgaria
  SR = "sr", // Serbian - Serbia
  HR = "hr", // Croatian - Croatia
  SK = "sk", // Slovak - Slovakia
  LT = "lt", // Lithuanian - Lithuania
  LV = "lv", // Latvian - Latvia
  ET = "et", // Estonian - Estonia
  IS = "is", // Icelandic - Iceland
  GA = "ga", // Irish - Ireland
  CY = "cy", // Welsh - United Kingdom
  MT = "mt", // Maltese - Malta
  SQ = "sq", // Albanian - Albania
  MK = "mk", // Macedonian - North Macedonia
  BS = "bs", // Bosnian - Bosnia and Herzegovina
  SL = "sl", // Slovenian - Slovenia
  KA = "ka", // Georgian - Georgia
  HY = "hy", // Armenian - Armenia
  EU = "eu", // Basque - Spain
  CA = "ca", // Catalan - Spain
  GL = "gl", // Galician - Spain
}

export interface Language {
  name: string;
  flag: keyof typeof flags;
}

export interface Country {
  code: string;
  name: string;
  language_key: LanguageKey;
  phoneCode: number;
  flag: keyof typeof flags;
}
