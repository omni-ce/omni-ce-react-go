import * as flags from "country-flag-icons/react/3x2";

export enum LanguageKey {
  ID = "id",
  EN = "en",
  MS = "ms",
  TH = "th",
  FIL = "fil",
  VI = "vi",
  ZH = "zh",
  JA = "ja",
  KO = "ko",
  HI = "hi",
  FR = "fr",
  DE = "de",
  IT = "it",
  ES = "es",
  PT = "pt",
  NL = "nl",
  RU = "ru",
  AR = "ar",
  TR = "tr",
  PL = "pl",
  SV = "sv",
  NO = "no",
  DA = "da",
  FI = "fi",
  EL = "el",
  CS = "cs",
  HU = "hu",
  RO = "ro",
  UK = "uk",
  HE = "he",
  UR = "ur",
  BN = "bn",
  SI = "si",
  MY = "my",
  KM = "km",
  LO = "lo",
  NE = "ne",
  AM = "am",
  SW = "sw",
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
