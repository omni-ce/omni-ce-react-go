import { useLanguageStore } from "@/stores/languageStore";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function ColorPickerSelector({
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
}: Props) {
  const { language } = useLanguageStore();

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-foreground/80">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-20 shrink-0 overflow-hidden rounded-xl border border-dark-600 bg-dark-900 transition-all hover:border-accent-500/50">
          <input
            type="color"
            value={value || placeholder}
            disabled={disabled}
            // @ts-ignore
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent p-0 disabled:cursor-not-allowed [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <input
          type="text"
          value={value || placeholder}
          disabled={disabled}
          // @ts-ignore
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex-1 rounded-xl border border-dark-600 bg-dark-900 px-4 py-2.5 text-sm text-foreground transition-all outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-dark-400 hover:bg-dark-800",
          )}
          placeholder={placeholder}
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      <p className="mt-1.5 text-xs text-dark-400">
        {language({
          id: "Pilih warna menggunakan pemilih atau masukkan kode hex",
          en: "Choose a color using the picker or enter a hex code",
        })}
      </p>
    </div>
  );
}
