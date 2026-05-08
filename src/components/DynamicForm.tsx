import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import { HOST_API } from "@/environment";
import BlankUser from "@/assets/blank-user.svg";
import type { Option } from "@/types/option";
import { IconComponent } from "@/components/ui/IconSelector";
import CameraSelector from "@/components/ui/CameraSelector";
import Captcha, { type CaptchaSecurity } from "@/components/ui/CaptchaInput";
import ColorPickerSelector from "@/components/ui/ColorPickerSelector";
import CountrySelector from "@/components/ui/CountrySelector";
import IconSelector from "@/components/ui/IconSelector";
import PhoneNumber from "@/components/ui/PhoneNumber";
import type { CountryKey } from "@/types/language";

export interface DynamicFormFieldOption {
  value: string;
  label: string;
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
  | "phone";

type DynamicFormFieldNormal = {
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
  fileTemplate?: "profile" | "default";
  captchaSecurity?: CaptchaSecurity;
  captchaLength?: number;
  phoneDefaultCountry?: CountryKey;
  phoneFirstAntiZero?: boolean;
  children?: DynamicFormField[];
};

type DynamicFormFieldChildren = {
  key?: never;
  type?: never;
  children: DynamicFormField[];
};

export type DynamicFormField = {
  label: string;
  col?: number;
  strict?: boolean;
  only?: "create" | "update";
} & (DynamicFormFieldNormal | DynamicFormFieldChildren);

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
  const { language } = useLanguageStore();

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const prevRefVal = useRef<string | undefined>(undefined);

  useEffect(() => {
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
          if (
            prevRefVal.current !== undefined &&
            prevRefVal.current !== refVal
          ) {
            onChangeRef.current("");
          }
          prevRefVal.current = refVal;
          return;
        }
        setDisabled(false);
        endpoint = endpoint.replace(
          `{${(field as DynamicFormFieldNormal).ref}}`,
          String(refVal),
        );
        // We clear the value whenever the parent dependency changes,
        // so we don't accidentally submit a stale child value.
        if (prevRefVal.current !== undefined && prevRefVal.current !== refVal) {
          onChangeRef.current("");
        }
        prevRefVal.current = refVal;
      }
    } else if (Array.isArray((field as DynamicFormFieldNormal).selectOptions)) {
      setOpts(
        (field as DynamicFormFieldNormal)
          .selectOptions as DynamicFormFieldOption[],
      );
      setDisabled(false);
      return;
    } else {
      return;
    }

    let isMounted = true;
    setLoading(true);
    satellite
      .get<Response<Option[]>>(`/api/option/${endpoint}`)
      .then((res) => {
        if (isMounted) {
          const data = res.data.data || [];
          const mapped = data.map((d) => ({
            value: String(d.value),
            label: d.label,
          }));
          setOpts(mapped);
        }
      })
      .catch(() => {
        if (isMounted) setOpts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
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
  ]);

  return (
    <SearchableSelect
      id={`field-${field.key}`}
      className="mt-1.5"
      value={formData[(field as DynamicFormFieldNormal).key] ?? ""}
      onChange={(val) => onChange(val)}
      options={opts}
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
  const [errorMsg, setErrorMsg] = useState("");

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
    const formData = new FormData();
    formData.append("file", file);

    satellite
      .post(
        `/api/upload/${(field as DynamicFormFieldNormal).fileTarget}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
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
          <audio src={value} controls className="w-full h-12" />
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
          />
        </div>
      );
    }

    return (
      <span className="text-xs text-neon-green break-all mt-1 block">
        Uploaded: {value}
      </span>
    );
  };

  if ((field as DynamicFormFieldNormal).fileTemplate === "profile") {
    const imageUrl = value
      ? value.startsWith("http")
        ? value
        : HOST_API + value
      : BlankUser;

    return (
      <div className="mt-1.5 flex flex-row items-center gap-6 p-4 rounded-xl border border-dark-600/50 bg-dark-900/30">
        <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-dark-500 bg-dark-800">
          <img
            src={imageUrl}
            alt="Profile Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full overflow-hidden">
          <Input
            id={`field-${field.key}`}
            type="file"
            onChange={handleFileChange}
            disabled={disabled || loading}
            className={loading ? "opacity-50" : ""}
            accept={
              (field as DynamicFormFieldNormal).fileType
                ? ((field as DynamicFormFieldNormal).fileType as FileType[])
                    .flat()
                    .join(",")
                : undefined
            }
          />
          {errorMsg && (
            <span className="text-xs text-neon-red">{errorMsg}</span>
          )}
          {loading && (
            <span className="text-xs text-accent-500">Uploading...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex flex-col gap-2">
      <Input
        id={`field-${field.key}`}
        type="file"
        onChange={handleFileChange}
        disabled={disabled || loading}
        className={loading ? "opacity-50" : ""}
        accept={
          (field as DynamicFormFieldNormal).fileType
            ? ((field as DynamicFormFieldNormal).fileType as FileType[])
                .flat()
                .join(",")
            : undefined
        }
      />
      {errorMsg && <span className="text-xs text-neon-red">{errorMsg}</span>}
      {loading && <span className="text-xs text-accent-500">Uploading...</span>}
      {!loading && renderPreview()}
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
                style={{
                  gridColumn: `span ${child.col || 12} / span ${
                    child.col || 12
                  }`,
                }}
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
  if (!field.key && field.children) {
    return (
      <div
        style={{
          gridColumn: `span ${field.col || 12} / span ${field.col || 12}`,
        }}
        className="space-y-4 border border-dark-600/50 rounded-xl p-4 bg-dark-800/30 mt-2"
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
    <div
      style={{
        gridColumn: `span ${field.col || 12} / span ${field.col || 12}`,
      }}
    >
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
          minLength={field.minLength}
          maxLength={field.maxLength}
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
          phoneDefaultCountry={field.phoneDefaultCountry}
          phoneFirstAntiZero={field.phoneFirstAntiZero}
          error={(errors[field.key] as string) || undefined}
          disabled={disabled}
        />
      ) : (
        <Input
          id={`field-${field.key}`}
          type={field.type}
          className="mt-1.5"
          value={String(formData[field.key] ?? "")}
          onChange={(e) => onChange(field.key!, e.target.value)}
          minLength={field.minLength}
          maxLength={field.maxLength}
        />
      )}
    </div>
  );
}
