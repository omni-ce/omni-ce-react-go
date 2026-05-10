import { useState, useEffect, useRef, useMemo } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { useLanguageStore, SUPPORTED_LANGUAGES } from "@/stores/languageStore";
import { Switch } from "@/components/ui/Switch";
import * as flags from "country-flag-icons/react/3x2";
import { countries } from "@/world";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import { HOST_API } from "@/environment";
import BlankUser from "@/assets/blank-user.svg";
import BlankCompany from "@/assets/blank-company.svg";
import type { Option } from "@/types/option";
import { IconComponent } from "@/components/ui/IconSelector";
import CameraSelector from "@/components/ui/CameraSelector";
import Captcha, { type CaptchaSecurity } from "@/components/ui/CaptchaInput";
import ColorPickerSelector from "@/components/ui/ColorPickerSelector";
import CountrySelector from "@/components/ui/CountrySelector";
import IconSelector from "@/components/ui/IconSelector";
import PhoneNumber from "@/components/ui/PhoneNumber";
import type { LanguageKey } from "@/types/world";
import { spanMap, mdMap, lgMap, xlMap } from "@/responsive";
import { formatFileSize } from "@/utils/format";
import MapPicker, { type MapCoordinates } from "@/components/ui/MapPicker";

export interface DynamicFormFieldOption {
  value: string;
  label: string;
  icon?: string;
  default?: boolean;
  array?: string[];
}

export enum FileType {
  Jpeg = "image/jpeg",
  Png = "image/png",
  Gif = "image/gif",
  Webp = "image/webp",
  Svg = "image/svg+xml",
  AudioMpeg = "audio/mpeg",
  AudioWav = "audio/wav",
  AudioOgg = "audio/ogg",
  AudioWebm = "audio/webm",
  Mp4 = "video/mp4",
  Webm = "video/webm",
  Ogg = "video/ogg",
  Pdf = "application/pdf",
  Doc = "application/msword",
  Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  Xls = "application/vnd.ms-excel",
  Xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  Zip = "application/zip",
  TextPlain = "text/plain",
  Csv = "text/csv",
}

export const FileTypeGroup = {
  Images: [
    FileType.Jpeg,
    FileType.Png,
    FileType.Gif,
    FileType.Webp,
    FileType.Svg,
  ],
  Audios: [
    FileType.AudioMpeg,
    FileType.AudioWav,
    FileType.AudioOgg,
    FileType.AudioWebm,
  ],
  Videos: [FileType.Mp4, FileType.Webm, FileType.Ogg],
  Documents: [
    FileType.Pdf,
    FileType.Doc,
    FileType.Docx,
    FileType.Xls,
    FileType.Xlsx,
    FileType.Zip,
    FileType.TextPlain,
    FileType.Csv,
  ],
} as const;

export type DynamicFormFieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "address"
  | "file"
  | "select"
  | "textarea"
  | "array"
  | "col"
  | "key"
  | "camera"
  | "captcha"
  | "color"
  | "country"
  | "icon"
  | "phone"
  | "date"
  | "checkbox"
  | "switch"
  | "map"
  | "geolocation";

export type DynamicFormFieldNormal<T = unknown> = {
  key: string;
  type: DynamicFormFieldType;
  selectOptions?: DynamicFormFieldOption[] | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  ref?: string;
  debounce?: string;
  fileTarget?: string;
  fileMaxSize?: number;
  fileType?: (FileType | FileType[])[];
  fileTemplate?: "profile" | "company" | "default";
  captchaSecurity?: CaptchaSecurity;
  captchaLength?: number;
  phoneDefaultCountry?: LanguageKey;
  phoneFirstAntiZero?: boolean;
  children?: DynamicFormField<T>[];
  textMultiLanguage?: boolean;
  rule?: string;
  numberSuffix?: string;
  textareaRows?: number;
  booleanDefault?: boolean;
  selectFormat?: (row: T) => DynamicFormFieldOption;
};

type DynamicFormFieldChildren<T = unknown> = {
  key?: never;
  type?: never;
  children: DynamicFormField<T>[];
};

export type DynamicFormField<T = unknown> = {
  label: string;
  col?: number;
  colMobile?: number;
  colTablet?: number;
  colLaptop?: number;
  colDesktop?: number;
  strict?: boolean;
  only?: "create" | "update";
} & (DynamicFormFieldNormal<T> | DynamicFormFieldChildren<T>);

const getColClass = (field: DynamicFormField | DynamicFormFieldNormal) => {
  const m =
    (field as DynamicFormField).colMobile ||
    (field as DynamicFormField).col ||
    12;
  const t =
    (field as DynamicFormField).colTablet ||
    (field as DynamicFormField).col ||
    12;
  const l =
    (field as DynamicFormField).colLaptop ||
    (field as DynamicFormField).col ||
    12;
  const d =
    (field as DynamicFormField).colDesktop ||
    (field as DynamicFormField).col ||
    12;
  return `${spanMap[m] || "col-span-12"} ${mdMap[t] || "md:col-span-12"} ${
    lgMap[l] || "lg:col-span-12"
  } ${xlMap[d] || "xl:col-span-12"}`;
};

function DynamicSelect({
  field,
  formData,
  onChange,
}: {
  field: DynamicFormField;
  formData: Record<string, string>;
  onChange: (val: string) => void;
}) {
  const [opts, setOpts] = useState<DynamicFormFieldOption[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { languageCode, language } = useLanguageStore();

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const prevRefVal = useRef<string | undefined>(undefined);

  const fetchOptions = () => {
    let endpoint = "";
    if (
      (field as DynamicFormFieldNormal).selectOptions &&
      typeof (field as DynamicFormFieldNormal).selectOptions === "string"
    ) {
      endpoint = (field as DynamicFormFieldNormal).selectOptions as string;
      if ((field as DynamicFormFieldNormal).ref) {
        const refVal = formData[(field as DynamicFormFieldNormal).ref!];
        if (!refVal) {
          setOpts([]);
          setDisabled(true);
          return;
        }
        setDisabled(false);
        endpoint = endpoint.replace(
          `{${(field as DynamicFormFieldNormal).ref}}`,
          String(refVal),
        );
      }
    } else {
      return;
    }

    setLoading(true);
    satellite
      .get<Response<Option[]>>(`/api/option/${endpoint}`)
      .then((res) => {
        const data = res.data.data || [];
        const format = (field as DynamicFormFieldNormal).selectFormat;
        const mapped = data.map((d) => {
          if (format) {
            const formatted = format(d);
            return {
              ...formatted,
              value: String(formatted.value),
            };
          }
          const item = d as unknown as Option;
          return {
            value: String(item.value),
            label: item.label,
            icon: (item as unknown as { icon?: string }).icon,
            array: (item as unknown as { array?: string[] }).array,
          };
        });
        setOpts(mapped);
      })
      .catch(() => {
        setOpts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (Array.isArray((field as DynamicFormFieldNormal).selectOptions)) {
      const format = (field as DynamicFormFieldNormal).selectFormat;
      const opts = (field as DynamicFormFieldNormal)
        .selectOptions as DynamicFormFieldOption[];

      if (format) {
        setOpts(
          opts.map((o) => {
            const formatted = format(o);
            return {
              ...formatted,
              value: String(formatted.value),
            };
          }),
        );
      } else {
        setOpts(opts);
      }
      setDisabled(false);
      return;
    }

    // Auto fetch if has value (Edit Mode)
    const val = formData[(field as DynamicFormFieldNormal).key];
    if (
      val &&
      typeof (field as DynamicFormFieldNormal).selectOptions === "string" &&
      opts.length === 0 &&
      !loading
    ) {
      fetchOptions();
    }

    if ((field as DynamicFormFieldNormal).ref) {
      const refVal = formData[(field as DynamicFormFieldNormal).ref!];
      if (!refVal) {
        setOpts([]);
        setDisabled(true);
      } else {
        setDisabled(false);
      }

      if (prevRefVal.current !== undefined && prevRefVal.current !== refVal) {
        onChangeRef.current("");
        setOpts([]); // Clear options when dependency changes
      }
      prevRefVal.current = refVal;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (field as DynamicFormFieldNormal).selectOptions,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (field as DynamicFormFieldNormal).ref,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (field as DynamicFormFieldNormal).ref
      ? formData[(field as DynamicFormFieldNormal).ref!]
      : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    formData[(field as DynamicFormFieldNormal).key], // Re-run if value changes externally
  ]);

  const translatedOpts = useMemo(() => {
    return opts.map((opt) => {
      let label = opt.label;
      if (typeof label === "string" && label.startsWith("{")) {
        try {
          label = language(JSON.parse(label));
        } catch (e) {
          // fallback
        }
      }
      return { ...opt, label };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts, languageCode, language]);

  return (
    <SearchableSelect
      id={`field-${field.key}`}
      className="mt-1.5"
      value={formData[(field as DynamicFormFieldNormal).key] ?? ""}
      onChange={(val) => onChange(val)}
      options={translatedOpts}
      onOpen={fetchOptions}
      placeholder={language({ id: "Pilih...", en: "Choose..." })}
      disabled={disabled}
      loading={loading}
    />
  );
}

function DynamicAddress({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [provinceOptions, setProvinceOptions] = useState<
    DynamicFormFieldOption[]
  >([]);
  const [regencyOptions, setRegencyOptions] = useState<
    DynamicFormFieldOption[]
  >([]);
  const [districtOptions, setDistrictOptions] = useState<
    DynamicFormFieldOption[]
  >([]);
  const [villageOptions, setVillageOptions] = useState<
    DynamicFormFieldOption[]
  >([]);

  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [isLoadingRegency, setIsLoadingRegency] = useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  const [isLoadingVillage, setIsLoadingVillage] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [hasFetchedProvince, setHasFetchedProvince] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
    if (
      !initRef.current &&
      value &&
      typeof value === "string" &&
      value.includes(".")
    ) {
      const parts = value.split(".");
      if (parts.length === 4) {
        setSelectedProvince(parts[0] || "");
        setSelectedRegency(`${parts[0]}.${parts[1]}`);
        setSelectedDistrict(`${parts[0]}.${parts[1]}.${parts[2]}`);
        setSelectedVillage(value);
      }
      initRef.current = true;
    }
  }, [value]);

  const fetchProvinces = () => {
    if (!hasFetchedProvince) {
      setHasFetchedProvince(true);
      setIsLoadingProvince(true);
      satellite
        .get("/api/address/provinces")
        .then((response) => {
          if (response.data.status === 200 && response.data.data) {
            setProvinceOptions(response.data.data);
          }
        })
        .catch((error) => console.error("Failed to fetch provinces:", error))
        .finally(() => setIsLoadingProvince(false));
    }
  };

  const fetchRegencies = (provinceCode: string) => {
    setIsLoadingRegency(true);
    satellite
      .get(`/api/address/regencies/${provinceCode}`)
      .then((response) => {
        if (response.data.status === 200 && response.data.data) {
          setRegencyOptions(response.data.data);
        }
      })
      .catch((error) => console.error("Failed to fetch regencies:", error))
      .finally(() => setIsLoadingRegency(false));
  };

  const fetchDistricts = (regencyCode: string) => {
    setIsLoadingDistrict(true);
    satellite
      .get(`/api/address/districts/${regencyCode}`)
      .then((response) => {
        if (response.data.status === 200 && response.data.data) {
          setDistrictOptions(response.data.data);
        }
      })
      .catch((error) => console.error("Failed to fetch districts:", error))
      .finally(() => setIsLoadingDistrict(false));
  };

  const fetchVillages = (districtCode: string) => {
    setIsLoadingVillage(true);
    satellite
      .get(`/api/address/villages/${districtCode}`)
      .then((response) => {
        if (response.data.status === 200 && response.data.data) {
          setVillageOptions(response.data.data);
        }
      })
      .catch((error) => console.error("Failed to fetch villages:", error))
      .finally(() => setIsLoadingVillage(false));
  };

  useEffect(() => {
    fetchProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchRegencies(selectedProvince);
    } else {
      setRegencyOptions([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedRegency) {
      fetchDistricts(selectedRegency);
    } else {
      setDistrictOptions([]);
    }
  }, [selectedRegency]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchVillages(selectedDistrict);
    } else {
      setVillageOptions([]);
    }
  }, [selectedDistrict]);

  return (
    <div className="space-y-3 mt-1.5 p-3 rounded-xl border border-dark-600/50 bg-dark-900/30">
      <SearchableSelect
        id="province"
        options={provinceOptions}
        value={selectedProvince}
        onChange={(val) => {
          setSelectedProvince(val);
          setSelectedRegency("");
          setSelectedDistrict("");
          setSelectedVillage("");
          onChange("");
        }}
        disabled={disabled}
        loading={isLoadingProvince}
        placeholder="Pilih Provinsi..."
      />
      <SearchableSelect
        id="regency"
        options={regencyOptions}
        value={selectedRegency}
        onChange={(val) => {
          setSelectedRegency(val);
          setSelectedDistrict("");
          setSelectedVillage("");
          onChange("");
        }}
        disabled={disabled || !selectedProvince}
        loading={isLoadingRegency}
        placeholder="Pilih Kabupaten/Kota..."
      />
      <SearchableSelect
        id="district"
        options={districtOptions}
        value={selectedDistrict}
        onChange={(val) => {
          setSelectedDistrict(val);
          setSelectedVillage("");
          onChange("");
        }}
        disabled={disabled || !selectedRegency}
        loading={isLoadingDistrict}
        placeholder="Pilih Kecamatan..."
      />
      <SearchableSelect
        id="village"
        options={villageOptions}
        value={selectedVillage}
        onChange={(val) => {
          setSelectedVillage(val);
          onChange(val);
        }}
        disabled={disabled || !selectedDistrict}
        loading={isLoadingVillage}
        placeholder="Pilih Desa/Kelurahan..."
      />
    </div>
  );
}

function DynamicFile({
  field,
  value,
  onChange,
  disabled,
}: {
  field: DynamicFormField;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguageStore();

  const fileName = useMemo(() => {
    if (!value) return null;
    const parts = value.split("/");
    return parts[parts.length - 1];
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      (field as DynamicFormFieldNormal).fileMaxSize &&
      (file.size as number) >
        ((field as DynamicFormFieldNormal).fileMaxSize as number)
    ) {
      setErrorMsg(
        `Ukuran file melebihi batas ${(((field as DynamicFormFieldNormal).fileMaxSize as number) / (1024 * 1024)).toFixed(2)} MB`,
      );
      e.target.value = "";
      return;
    }

    let allowedTypes: FileType[] = [];
    if ((field as DynamicFormFieldNormal).fileType) {
      allowedTypes = (
        (field as DynamicFormFieldNormal).fileType as FileType[]
      ).flat() as FileType[];
    }

    if (allowedTypes.length > 0) {
      if (!allowedTypes.includes(file.type as FileType)) {
        setErrorMsg(
          `Tipe file tidak valid. Diperbolehkan: ${allowedTypes.join(", ")}`,
        );
        e.target.value = "";
        return;
      }
    }

    if (!(field as DynamicFormFieldNormal).fileTarget) {
      console.error("fileTarget is missing");
      return;
    }

    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);

    satellite
      .post(
        `/api/upload/${(field as DynamicFormFieldNormal).fileTarget}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setProgress(percentCompleted);
            }
          },
        },
      )
      .then((res) => {
        if (res.data.status === 200 && res.data.data?.path) {
          onChange(res.data.data.path);
        }
      })
      .catch((err) => {
        console.error("Upload failed", err);
        setErrorMsg("Gagal mengunggah file. Silakan coba lagi.");
      })
      .finally(() => {
        setLoading(false);
        setProgress(0);
      });
  };

  const renderPreview = () => {
    if (!value) return null;

    const lowerValue = value.toLowerCase();
    const isImage = lowerValue.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) != null;
    const isAudio = lowerValue.match(/\.(mp3|wav|ogg|m4a)$/) != null;
    const isVideo = lowerValue.match(/\.(mp4|webm|mov)$/) != null;

    if (isImage) {
      return (
        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-dark-600 bg-dark-900/50">
          <img
            src={HOST_API + value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    if (isAudio) {
      return (
        <div className="mt-2">
          <audio src={value} controls className="w-full h-12">
            <track kind="captions" />
          </audio>
        </div>
      );
    }
    if (isVideo) {
      return (
        <div className="mt-2">
          <video
            src={value}
            controls
            className="w-full max-w-sm rounded-lg border border-dark-600 bg-dark-900/50"
          >
            <track kind="captions" />
          </video>
        </div>
      );
    }

    return (
      <span className="text-xs text-neon-green break-all mt-1 block">
        Uploaded: {value}
      </span>
    );
  };

  const renderUploader = () => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={
            (field as DynamicFormFieldNormal).fileType
              ? ((field as DynamicFormFieldNormal).fileType as FileType[])
                  .flat()
                  .join(",")
              : undefined
          }
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!loading && !disabled) fileInputRef.current?.click();
            }
          }}
          onClick={() => !loading && !disabled && fileInputRef.current?.click()}
          className={`
            group flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed transition-all cursor-pointer
            ${
              loading
                ? "border-accent-500/50 bg-accent-500/5"
                : "border-dark-600 hover:border-accent-500/50 hover:bg-dark-800/50 bg-dark-900/40"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="shrink-0 w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 group-hover:text-accent-400 transition-colors">
            {loading ? (
              <span className="text-[10px] font-bold text-accent-500">
                {progress}%
              </span>
            ) : (
              <IconComponent
                iconName="Hi/HiOutlineCloudUpload"
                className="w-5 h-5"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-foreground truncate">
              {loading
                ? language({ id: "Mengunggah...", en: "Uploading..." })
                : fileName || language({ id: "Pilih File", en: "Choose File" })}
            </span>
            {loading && (
              <div className="mt-1 w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {errorMsg && <span className="text-xs text-neon-red">{errorMsg}</span>}
        {!errorMsg &&
          !loading &&
          (field as DynamicFormFieldNormal).fileMaxSize && (
            <span className="text-[10px] text-dark-400 font-mono">
              Max:{" "}
              {formatFileSize((field as DynamicFormFieldNormal).fileMaxSize!)}
            </span>
          )}
      </div>
    );
  };

  const template = (field as DynamicFormFieldNormal).fileTemplate;
  if (template === "profile" || template === "company") {
    const imageUrl = value
      ? value.startsWith("http")
        ? value
        : HOST_API + value
      : template === "company"
        ? BlankCompany
        : BlankUser;

    return (
      <div className="mt-1.5 flex flex-row items-center gap-6 p-4 rounded-xl border border-dark-600/50 bg-dark-900/30">
        <div
          className={`shrink-0 w-24 h-24 ${
            template === "company" ? "rounded-none" : "rounded-full"
          } overflow-hidden border-2 border-dark-500 bg-dark-800`}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full overflow-hidden">
          {renderUploader()}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex flex-col gap-2">
      {renderUploader()}
      {renderPreview()}
    </div>
  );
}

function ArrayField({
  field,
  value,
  onChange,
}: {
  field: DynamicFormField;
  value: Record<string, unknown>[];
  onChange: (val: Record<string, unknown>[]) => void;
}) {
  const { language } = useLanguageStore();
  const handleAdd = () => {
    const newItem: Record<string, unknown> = {};
    if (field.children) {
      field.children.forEach((child) => {
        if (!child.key) return;
        if (
          child.type === "select" &&
          Array.isArray(child.selectOptions) &&
          child.selectOptions.length > 0
        ) {
          newItem[child.key] = child.selectOptions[0].value;
        } else {
          newItem[child.key] = "";
        }
      });
    }
    onChange([...value, newItem]);
  };

  const handleRemove = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const handleChildChange = (
    index: number,
    childKey: string,
    childVal: unknown,
  ) => {
    const next = [...value];
    next[index] = { ...next[index], [childKey]: childVal };
    onChange(next);
  };

  return (
    <div className="mt-2 space-y-4">
      {value.map((item, index) => (
        <div
          key={index}
          className="relative p-4 border border-dark-600 rounded-xl bg-dark-900/40"
        >
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-dark-400 hover:text-neon-red hover:bg-neon-red/10 transition-colors"
          >
            <IconComponent iconName="Hi/HiOutlineTrash" className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-12 gap-4 mt-2">
            {field.children?.map((child) => (
              <div
                key={child.key}
                className={getColClass(child as DynamicFormFieldNormal)}
              >
                <Label
                  htmlFor={`field-${field.key}-${index}-${child.key}`}
                  required={(child as DynamicFormFieldNormal).required}
                >
                  {child.label}
                </Label>
                {child.type === "select" ? (
                  <DynamicSelect
                    field={child}
                    formData={item as Record<string, string>}
                    onChange={(val) => handleChildChange(index, child.key, val)}
                  />
                ) : child.type === "address" ? (
                  <DynamicAddress
                    value={String(item[child.key] ?? "")}
                    onChange={(val) => handleChildChange(index, child.key, val)}
                  />
                ) : child.type === "file" ? (
                  <DynamicFile
                    field={child}
                    value={String(item[child.key] ?? "")}
                    onChange={(val) => handleChildChange(index, child.key, val)}
                  />
                ) : child.type === "textarea" ? (
                  <textarea
                    id={`field-${field.key}-${index}-${child.key}`}
                    className="mt-1.5 w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50 min-h-20 resize-y"
                    value={String(item[child.key] ?? "")}
                    onChange={(e) =>
                      handleChildChange(index, child.key, e.target.value)
                    }
                    minLength={child.minLength}
                    maxLength={child.maxLength}
                    rows={(child as DynamicFormFieldNormal).textareaRows}
                  />
                ) : (
                  <Input
                    id={`field-${field.key}-${index}-${child.key}`}
                    type={child.type}
                    className="mt-1.5"
                    value={String(
                      item[(child as DynamicFormFieldNormal).key] ?? "",
                    )}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        (child as DynamicFormFieldNormal).key,
                        e.target.value,
                      )
                    }
                    minLength={(child as DynamicFormFieldNormal).minLength}
                    maxLength={(child as DynamicFormFieldNormal).maxLength}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 border-dashed border-dark-500 text-dark-300 hover:text-foreground"
      >
        <IconComponent iconName="Hi/HiOutlinePlus" className="w-4 h-4" />
        {language({ id: "Tambah", en: "Add" })} {field.label}
      </Button>
    </div>
  );
}

function DebouncedInput({
  field,
  formData,
  onChange,
  onError,
  initialValue,
}: {
  field: DynamicFormField;
  formData: Record<string, string>;
  onChange: (val: string) => void;
  onError: (key: string, error: string | null) => void;
  initialValue?: string;
}) {
  const { language } = useLanguageStore();
  const value = formData[(field as DynamicFormFieldNormal).key] ?? "";
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    text: Record<string, string>;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
    if (
      !(field as DynamicFormFieldNormal).debounce ||
      !value ||
      value === initialValue
    ) {
      setMsg(null);
      onError((field as DynamicFormFieldNormal).key, null);
      return;
    }

    setMsg(null);
    onError((field as DynamicFormFieldNormal).key, "typing"); // block save while typing/debouncing

    const timer = setTimeout(() => {
      setLoading(true);
      satellite
        .post<{
          message: string;
          data: { available: boolean; message: Record<string, string> };
        }>(`/api/debounce/${(field as DynamicFormFieldNormal).debounce}`, {
          value,
        })
        .then((res) => {
          const data = res.data?.data;

          if (data && data.available === false) {
            setMsg({ text: data.message, isError: true });
            onError((field as DynamicFormFieldNormal).key, res.data.message);
          } else {
            setMsg({ text: data.message, isError: false });
            onError((field as DynamicFormFieldNormal).key, null);
          }
        })
        .catch(() => {
          setMsg({
            text: {
              id: "Terjadi kesalahan saat memeriksa ketersediaan",
              en: "Error checking availability",
            },
            isError: true,
          });
          onError((field as DynamicFormFieldNormal).key, "Error");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (field as DynamicFormFieldNormal).debounce,
    field.key,
    initialValue,
    language,
  ]);

  return (
    <div className="relative mt-1.5">
      <Input
        id={`field-${field.key}`}
        type={field.type}
        className={loading ? "pr-10" : ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={(field as DynamicFormFieldNormal).minLength}
        maxLength={(field as DynamicFormFieldNormal).maxLength}
        disabled={loading}
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="h-4 w-4 animate-spin text-dark-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {!loading && msg && (
        <span
          className={`text-xs mt-1 block ${
            msg.isError ? "text-neon-red" : "text-neon-green"
          }`}
        >
          {language(msg.text)}
        </span>
      )}
    </div>
  );
}

function DynamicPassword({
  field,
  value,
  onChange,
  disabled,
}: {
  field: DynamicFormField;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1.5 flex items-center">
      <Input
        id={`field-${field.key}`}
        type={show ? "text" : "password"}
        className="pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={(field as DynamicFormFieldNormal).minLength}
        maxLength={(field as DynamicFormFieldNormal).maxLength}
        disabled={disabled}
      />
      <div className="absolute right-3 z-10 flex items-center justify-center">
        <button
          type="button"
          className="text-dark-400 hover:text-foreground focus:outline-none"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          <IconComponent
            iconName={show ? "Hi/HiOutlineEyeOff" : "Hi/HiOutlineEye"}
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
}

// ─── Col / Responsive Column Picker ──────────────────────────────────

export interface ColValue {
  mobile: number;
  tablet: number;
  laptop: number;
  desktop: number;
}

const COL_BREAKPOINTS: {
  key: keyof ColValue;
  label: string;
  icon: string;
  desc: string;
  defaultVal: number;
}[] = [
  {
    key: "mobile",
    label: "Mobile",
    icon: "📱",
    desc: "≤ 425px",
    defaultVal: 12,
  },
  {
    key: "tablet",
    label: "Tablet",
    icon: "📋",
    desc: "768px",
    defaultVal: 6,
  },
  {
    key: "laptop",
    label: "Laptop",
    icon: "💻",
    desc: "1024px",
    defaultVal: 4,
  },
  {
    key: "desktop",
    label: "Desktop",
    icon: "🖥️",
    desc: "≥ 1440px",
    defaultVal: 3,
  },
];

function DynamicCol({
  value,
  onChange,
}: {
  value: ColValue;
  onChange: (val: ColValue) => void;
}) {
  const { language } = useLanguageStore();
  const colVal: ColValue = {
    mobile: value?.mobile ?? 12,
    tablet: value?.tablet ?? 6,
    laptop: value?.laptop ?? 4,
    desktop: value?.desktop ?? 3,
  };

  const handleChange = (key: keyof ColValue, v: number) => {
    onChange({ ...colVal, [key]: v });
  };

  return (
    <div className="grid grid-cols-1 gap-3 mt-1.5">
      {COL_BREAKPOINTS.map((bp) => (
        <div
          key={bp.key}
          className="bg-dark-900/60 border border-dark-600/40 rounded-xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{bp.icon}</span>
              <span className="text-xs font-semibold text-dark-200">
                {bp.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded">
              {colVal[bp.key]}/12
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={colVal[bp.key]}
            onChange={(e) => handleChange(bp.key, Number(e.target.value))}
            className="w-full h-1.5 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-500"
          />
          <div className="flex justify-between mt-1 text-[9px] text-dark-500">
            <span>1</span>
            <span>6</span>
            <span>12</span>
          </div>
          <p className="text-[9px] text-dark-500 mt-1 text-center">{bp.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main DynamicForm ──────────────────────────────────────────────

interface DynamicFormProps {
  fields: DynamicFormField[];
  formData: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  fieldErrors?: Record<string, string | null>;
  editingRow?: unknown;
  onError?: (key: string, err: string | null) => void;
  disabled?: boolean;
}

export default function DynamicForm({
  fields,
  formData,
  onChange,
  editingRow,
  onError,
  fieldErrors: errors = {},
  disabled = false,
}: DynamicFormProps) {
  const isCreate = !editingRow;
  const filteredFields = fields.filter((field) => {
    if (field.only === "create" && !isCreate) return false;
    if (field.only === "update" && isCreate) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-12 gap-4 mt-2">
      {filteredFields.map((field, idx) => (
        <DynamicFieldRenderer
          key={field.key || String(idx)}
          field={field}
          formData={formData}
          onChange={onChange}
          onError={onError}
          editingRow={editingRow}
          errors={errors as Record<string, string>}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function DynamicMapField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: DynamicFormFieldNormal;
  value: MapCoordinates | undefined;
  onChange: (val: MapCoordinates) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguageStore();

  console.log({ value });
  return (
    <>
      <div className="mt-1.5">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled) setIsOpen(true);
            }
          }}
          onClick={() => !disabled && setIsOpen(true)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer
            ${
              value
                ? "border-accent-500/50 bg-accent-500/5 hover:bg-accent-500/10"
                : "border-dark-600/50 bg-dark-900/40 hover:bg-dark-800/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              value ? "bg-accent-500 text-white" : "bg-dark-800 text-dark-400"
            }`}
          >
            <IconComponent
              iconName="Hi/HiOutlineLocationMarker"
              className="w-5 h-5"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={`text-sm font-medium truncate ${value && typeof value.latitude === "number" ? "text-accent-400" : "text-foreground"}`}
            >
              {value && typeof value.latitude === "number"
                ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
                : language({
                    id: "Pilih Lokasi di Peta",
                    en: "Pick Location on Map",
                  })}
            </span>
            {value && typeof value.latitude === "number" && (
              <span className="text-xs text-dark-400 mt-0.5">
                {language({
                  id: "Lokasi telah dipilih",
                  en: "Location selected",
                })}
              </span>
            )}
          </div>
          <IconComponent
            iconName="Hi/HiChevronRight"
            className="w-4 h-4 text-dark-400 shrink-0"
          />
        </div>
      </div>
      <MapPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialCoords={value}
        onSelect={onChange}
      />
    </>
  );
}

function DynamicGeolocationField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: DynamicFormFieldNormal;
  value: MapCoordinates | undefined;
  onChange: (val: MapCoordinates) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { language } = useLanguageStore();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="mt-1.5">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !loading) handleGetLocation();
          }
        }}
        onClick={() => !disabled && !loading && handleGetLocation()}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer
          ${
            value
              ? "border-accent-500/50 bg-accent-500/5 hover:bg-accent-500/10"
              : "border-dark-600/50 bg-dark-900/40 hover:bg-dark-800/50"
          }
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            value ? "bg-accent-500 text-white" : "bg-dark-800 text-dark-400"
          }`}
        >
          {loading ? (
            <IconComponent
              iconName="Ri/RiLoader4Line"
              className="w-5 h-5 animate-spin"
            />
          ) : (
            <IconComponent
              iconName="Hi/HiOutlineLocationMarker"
              className="w-5 h-5"
            />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-sm font-medium truncate ${
              value && typeof value.latitude === "number"
                ? "text-accent-400"
                : "text-foreground"
            }`}
          >
            {loading
              ? language({
                  id: "Mengambil Lokasi...",
                  en: "Getting Location...",
                })
              : value && typeof value.latitude === "number"
                ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
                : language({
                    id: "Ambil Lokasi Saat Ini",
                    en: "Get Current Location",
                  })}
          </span>
          {value && typeof value.latitude === "number" && !loading && (
            <span className="text-xs text-dark-400 mt-0.5">
              {language({
                id: "Lokasi berhasil diambil",
                en: "Location acquired",
              })}
            </span>
          )}
        </div>
        {!loading && (
          <IconComponent
            iconName="Hi/HiOutlineRefresh"
            className="w-4 h-4 text-dark-400 shrink-0"
          />
        )}
      </div>
    </div>
  );
}

function DynamicFieldRenderer({
  field,
  formData,
  onChange,
  onError,
  editingRow,
  errors,
  disabled,
}: {
  field: DynamicFormField;
  formData: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
  onError?: (key: string, err: string) => void;
  editingRow?: unknown;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const { language } = useLanguageStore();

  const handleBlur = (val: string) => {
    if (!field.key || !onError) return;
    const f = field as DynamicFormFieldNormal;
    const trimmedVal = val.trim();

    // Required validation
    if (f.required && !trimmedVal) {
      onError(
        field.key,
        language({
          id: "Field ini wajib diisi",
          en: "This field is required",
        }),
      );
      return;
    }

    if (!trimmedVal) {
      onError(field.key, "");
      return;
    }

    // Email validation
    if (f.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedVal)) {
        onError(
          field.key,
          language({
            id: "Format email tidak valid",
            en: "Invalid email format",
          }),
        );
        return;
      }
    }

    let checkVal = trimmedVal;
    if (f.type === "phone") {
      const parts = trimmedVal.split(" ");
      checkVal = parts.length > 1 ? parts[1] : trimmedVal;
    }
    if (f.minLength && checkVal.length < f.minLength) {
      onError(
        field.key,
        language({
          id: `Minimal ${f.minLength} karakter`,
          en: `Minimum ${f.minLength} characters`,
        }),
      );
    } else {
      onError(field.key, "");
    }
  };

  if (!field.key && field.children) {
    return (
      <div
        className={`${getColClass(
          field,
        )} space-y-4 border border-dark-600/50 rounded-xl p-4 bg-dark-800/30 mt-2`}
      >
        {field.label && (
          <h3 className="font-semibold text-sm text-foreground">
            {field.label}
          </h3>
        )}
        <div className="grid grid-cols-12 gap-4">
          {field.children.map((child, idx) => (
            <DynamicFieldRenderer
              key={child.key || String(idx)}
              field={child}
              formData={formData}
              onChange={onChange}
              onError={onError}
              editingRow={editingRow}
              errors={errors}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!field.key) return null;

  return (
    <div className={getColClass(field)}>
      <Label htmlFor={`field-${field.key}`} required={field.required}>
        {field.label}
      </Label>
      {field.type === "col" ? (
        <DynamicCol
          value={
            (formData[field.key] as ColValue) || {
              mobile: 12,
              tablet: 6,
              laptop: 4,
              desktop: 3,
            }
          }
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "array" ? (
        <ArrayField
          field={field}
          value={(formData[field.key] as Record<string, unknown>[]) || []}
          onChange={(newVal) => onChange(field.key!, newVal)}
        />
      ) : field.type === "select" ? (
        <DynamicSelect
          field={field}
          formData={formData as Record<string, string>}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "address" ? (
        <DynamicAddress
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "file" ? (
        <DynamicFile
          field={field}
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "textarea" ? (
        <textarea
          id={`field-${field.key}`}
          className="mt-1.5 w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50 min-h-20 resize-y"
          value={String(formData[field.key] ?? "")}
          onChange={(e) => onChange(field.key!, e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
          minLength={field.minLength}
          maxLength={field.maxLength}
          rows={(field as DynamicFormFieldNormal).textareaRows}
        />
      ) : field.debounce ? (
        <DebouncedInput
          field={field}
          formData={formData as Record<string, string>}
          onChange={(val) => onChange(field.key!, val)}
          onError={(key, err) => {
            if (onError) onError(key, err as string);
          }}
          initialValue={
            editingRow && typeof editingRow === "object"
              ? String((editingRow as Record<string, unknown>)[field.key] ?? "")
              : ""
          }
        />
      ) : field.type === "key" ? (
        <Input
          id={`field-${field.key}`}
          type="text"
          className="mt-1.5 font-mono"
          value={String(formData[field.key] ?? "")}
          onChange={(e) => {
            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
            onChange(field.key!, val);
          }}
          minLength={field.minLength}
          maxLength={field.maxLength}
        />
      ) : field.type === "password" ? (
        <DynamicPassword
          field={field}
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "camera" ? (
        <CameraSelector
          value={String(formData[field.key] ?? "")}
          onChange={(val) => {
            if (val instanceof Blob) {
              onChange(field.key!, URL.createObjectURL(val));
            } else {
              onChange(field.key!, val);
            }
          }}
        />
      ) : field.type === "captcha" ? (
        <Captcha
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
          security={field.captchaSecurity}
          length={field.captchaLength}
        />
      ) : field.type === "color" ? (
        <ColorPickerSelector
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "country" ? (
        <CountrySelector
          label={field.label}
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "icon" ? (
        <IconSelector
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
        />
      ) : field.type === "phone" ? (
        <PhoneNumber
          value={String(formData[field.key] ?? "")}
          onChange={(val) => onChange(field.key!, val)}
          phoneDefaultCountry={
            (field as DynamicFormFieldNormal).phoneDefaultCountry
          }
          phoneFirstAntiZero={
            (field as DynamicFormFieldNormal).phoneFirstAntiZero
          }
          maxLength={(field as DynamicFormFieldNormal).maxLength}
          error={(errors[field.key] as string) || undefined}
          disabled={disabled}
          onBlur={() => handleBlur(String(formData[field.key!] || ""))}
        />
      ) : field.type === "switch" ? (
        <div className="mt-2">
          <Switch
            checked={Boolean(formData[field.key])}
            onCheckedChange={(val) => onChange(field.key!, val)}
            disabled={disabled}
          />
        </div>
      ) : field.type === "date" ? (
        <div className="relative mt-1.5 flex items-center">
          <div className="absolute left-4 pointer-events-none text-dark-400">
            <IconComponent
              iconName="Hi/HiOutlineCalendar"
              className="w-5 h-5"
            />
          </div>
          <input
            id={`field-${field.key}`}
            type="date"
            className="w-full pl-12 pr-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50 scheme-dark"
            value={String(formData[field.key] ?? "")}
            onChange={(e) => onChange(field.key!, e.target.value)}
            disabled={disabled}
          />
        </div>
      ) : field.type === "map" ? (
        <DynamicMapField
          field={field as DynamicFormFieldNormal}
          value={(() => {
            console.log("formData:", formData);
            return (
              (formData[field.key!] as MapCoordinates | undefined) ||
              (formData["longitude"] !== undefined &&
              formData["latitude"] !== undefined &&
              formData["longitude"] !== null &&
              formData["latitude"] !== null
                ? {
                    longitude: Number(formData["longitude"]),
                    latitude: Number(formData["latitude"]),
                  }
                : undefined)
            );
          })()}
          onChange={(val) => onChange(field.key!, val)}
          disabled={disabled}
        />
      ) : field.type === "geolocation" ? (
        <DynamicGeolocationField
          field={field as DynamicFormFieldNormal}
          value={
            (formData[field.key!] as MapCoordinates | undefined) ||
            (formData["longitude"] !== undefined &&
            formData["latitude"] !== undefined &&
            formData["longitude"] !== null &&
            formData["latitude"] !== null
              ? {
                  longitude: Number(formData["longitude"]),
                  latitude: Number(formData["latitude"]),
                }
              : undefined)
          }
          onChange={(val) => onChange(field.key!, val)}
          disabled={disabled}
        />
      ) : field.type === "text" &&
        (field as DynamicFormFieldNormal).textMultiLanguage ? (
        <div className="space-y-2 mt-1.5">
          {SUPPORTED_LANGUAGES.map((langCode) => {
            const country = countries.find((c) => c.code === langCode);
            const Flag = country ? flags[country.flag] : null;

            let valObj: Record<string, string> = {};
            try {
              const rawVal = formData[field.key!];
              if (typeof rawVal === "string" && rawVal.startsWith("{")) {
                valObj = JSON.parse(rawVal);
              } else if (typeof rawVal === "object" && rawVal !== null) {
                valObj = rawVal as Record<string, string>;
              }
            } catch (e) {
              // fallback
            }

            return (
              <div key={langCode} className="relative flex items-center">
                <div className="absolute left-3 z-10 flex items-center justify-center w-5 h-4 overflow-hidden rounded-sm border border-dark-600/50">
                  {Flag ? (
                    <Flag className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] uppercase font-bold text-dark-400">
                      {langCode}
                    </span>
                  )}
                </div>
                <Input
                  className="pl-11"
                  placeholder={`${field.label} (${langCode.toUpperCase()})`}
                  value={valObj[langCode] ?? ""}
                  onChange={(e) => {
                    const newValObj = { ...valObj, [langCode]: e.target.value };
                    onChange(field.key!, JSON.stringify(newValObj));
                  }}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative mt-1.5 flex items-center">
          <Input
            id={`field-${field.key}`}
            type={field.type}
            className={
              (field as DynamicFormFieldNormal).numberSuffix ? "pr-12" : ""
            }
            value={String(formData[field.key] ?? "")}
            onChange={(e) => onChange(field.key!, e.target.value)}
            minLength={(field as DynamicFormFieldNormal).minLength}
            maxLength={(field as DynamicFormFieldNormal).maxLength}
            disabled={disabled}
            onBlur={(e) => handleBlur(e.target.value)}
            onWheel={(e) => field.type === "number" && e.currentTarget.blur()}
          />
          {(field as DynamicFormFieldNormal).numberSuffix && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              <span className="text-sm font-semibold text-dark-400 uppercase tracking-wider">
                {(field as DynamicFormFieldNormal).numberSuffix}
              </span>
            </div>
          )}
        </div>
      )}
      {errors[field.key] && field.type !== "phone" && (
        <p className="mt-1 text-[11px] text-neon-red font-medium pl-1">
          {errors[field.key]}
        </p>
      )}
    </div>
  );
}
