import * as flags from "country-flag-icons/react/3x2";

export interface Country {
  code: string;
  name: string;
  key: string;
  phoneCode: number;
  flag: keyof typeof flags;
}
