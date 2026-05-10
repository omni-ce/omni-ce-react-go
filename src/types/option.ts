export interface Option {
  value: unknown;
  label?: string;
  render?: React.ReactNode;
  array?: string[];
  meta?: Record<string, unknown>;
}

export enum Gender {
  Male = "L",
  Female = "P",
}
