import { useLanguageStore } from "@/stores/languageStore";

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
  placeholder = "#22c35b",
  label,
  required = false,
  disabled = false,
}: Props) {
  const { language } = useLanguageStore();

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || placeholder}
          disabled={disabled}
          // @ts-ignore
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={value || placeholder}
          disabled={disabled}
          // @ts-ignore
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {language({
          id: "Pilih warna menggunakan pemilih atau masukkan kode hex",
          en: "Choose a color using the picker or enter a hex code",
        })}
      </p>
    </div>
  );
}
