import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
  type ReactNode,
  isValidElement,
  cloneElement,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import type { Response, WithPagination } from "@/types/response";

interface PaginationFetchParams {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  search_fields?: string;
  [key: `col_${string}`]: string | undefined;
}

export interface PaginationHelpers<T> {
  reload: () => Promise<void>;
  setRows: (updater: T[] | ((prev: T[]) => T[])) => void;
}

export interface PaginationColumn<T> {
  key: string;
  header: string;
  strict?: boolean;
  align?: "left" | "center" | "right";
  sort?: boolean;
  search?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number, helpers: PaginationHelpers<T>) => ReactNode;
}

export interface PaginationFieldOption {
  value: string;
  label: string;
}

export interface PaginationField {
  key: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "password"
    | "select"
    | "textarea"
    | "array";
  options?: PaginationFieldOption[] | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  col?: number;
  ref?: string;
  debounce?: string;
  strict?: boolean;
  children?: PaginationField[];
}

export interface PaginationExtraAction<T> {
  icon: ReactNode;
  component: ReactNode | ((row: T, onClose: () => void) => ReactNode);
}

interface PaginationProps<T> {
  title: string;
  columns: PaginationColumn<T>[];
  module: string;
  fields?: PaginationField[];
  useIsActive?: boolean;
  extraActions?: PaginationExtraAction<T>[];
}

export interface PaginationHandle {
  reload: () => Promise<void>;
}

function DynamicSelect({
  field,
  formData,
  onChange,
}: {
  field: PaginationField;
  formData: Record<string, string>;
  onChange: (val: string) => void;
}) {
  const [opts, setOpts] = useState<PaginationFieldOption[]>([]);
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
    if (typeof field.options === "string") {
      endpoint = field.options;
      if (field.ref) {
        const refVal = formData[field.ref];
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
        endpoint = endpoint.replace(`{${field.ref}}`, String(refVal));
        // We clear the value whenever the parent dependency changes,
        // so we don't accidentally submit a stale child value.
        if (prevRefVal.current !== undefined && prevRefVal.current !== refVal) {
          onChangeRef.current("");
        }
        prevRefVal.current = refVal;
      }
    } else if (Array.isArray(field.options)) {
      setOpts(field.options);
      setDisabled(false);
      return;
    } else {
      return;
    }

    let isMounted = true;
    setLoading(true);
    satellite
      .get<Response<{ key: unknown; value: string }[]>>(
        `/api/option/${endpoint}`,
      )
      .then((res) => {
        if (isMounted) {
          const data = res.data.data || [];
          const mapped = data.map((d) => ({
            value: String(d.key),
            label: d.value,
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
  }, [field.options, field.ref, field.ref ? formData[field.ref] : undefined]);

  return (
    <Select
      id={`field-${field.key}`}
      className="mt-1.5"
      value={formData[field.key] ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
    >
      <option value="" disabled hidden>
        {loading ? "Loading..." : language({ id: "Pilih...", en: "Choose..." })}
      </option>
      {opts.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}

function ArrayField({
  field,
  value,
  onChange,
}: {
  field: PaginationField;
  value: Record<string, unknown>[];
  onChange: (val: Record<string, unknown>[]) => void;
}) {
  const { language } = useLanguageStore();
  const handleAdd = () => {
    const newItem: Record<string, unknown> = {};
    if (field.children) {
      field.children.forEach((child) => {
        if (
          child.type === "select" &&
          Array.isArray(child.options) &&
          child.options.length > 0
        ) {
          newItem[child.key] = child.options[0].value;
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
            <HiOutlineTrash className="w-4 h-4" />
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
                  required={child.required}
                >
                  {child.label}
                </Label>
                {child.type === "select" ? (
                  <DynamicSelect
                    field={child}
                    formData={item as Record<string, string>}
                    onChange={(val) => handleChildChange(index, child.key, val)}
                  />
                ) : child.type === "textarea" ? (
                  <textarea
                    id={`field-${field.key}-${index}-${child.key}`}
                    className="mt-1.5 w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50 min-h-[80px] resize-y"
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
                    value={String(item[child.key] ?? "")}
                    onChange={(e) =>
                      handleChildChange(index, child.key, e.target.value)
                    }
                    minLength={child.minLength}
                    maxLength={child.maxLength}
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
        <HiOutlinePlus className="w-4 h-4" />
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
  field: PaginationField;
  formData: Record<string, string>;
  onChange: (val: string) => void;
  onError: (key: string, error: string | null) => void;
  initialValue?: string;
}) {
  const { language } = useLanguageStore();
  const value = formData[field.key] ?? "";
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    text: Record<string, string>;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
    if (!field.debounce || !value || value === initialValue) {
      setMsg(null);
      onError(field.key, null);
      return;
    }

    setMsg(null);
    onError(field.key, "typing"); // block save while typing/debouncing

    const timer = setTimeout(() => {
      setLoading(true);
      satellite
        .post<{
          message: string;
          data: { available: boolean; message: Record<string, string> };
        }>(`/api/debounce/${field.debounce}`, { value })
        .then((res) => {
          const data = res.data?.data;

          if (data && data.available === false) {
            setMsg({ text: data.message, isError: true });
            onError(field.key, res.data.message);
          } else {
            setMsg({ text: data.message, isError: false });
            onError(field.key, null);
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
          onError(field.key, "Error");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, field.debounce, field.key, initialValue, language]);

  return (
    <div className="relative mt-1.5">
      <Input
        id={`field-${field.key}`}
        type={field.type}
        className={loading ? "pr-10" : ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={field.minLength}
        maxLength={field.maxLength}
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

const Pagination = forwardRef(function PaginationInner<T>(
  {
    title,
    columns,
    module,
    fields,
    useIsActive,
    extraActions,
  }: PaginationProps<T>,
  ref: Ref<PaginationHandle>,
) {
  const { language } = useLanguageStore();
  const [rows, setRows] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>(
    undefined,
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const baseUrl = `/api/${module}`;
  const paginateUrl = `${baseUrl}/paginate`;
  const createUrl = `${baseUrl}/create`;
  const editUrl = (id: string | number) => `${baseUrl}/edit/${id}`;
  const removeUrl = (id: string | number) => `${baseUrl}/remove/${id}`;
  const bulkRemoveUrl = `${baseUrl}/bulk-remove`;
  const setActiveUrl = (id: string | number) => `${baseUrl}/set-active/${id}`;

  // CRUD state
  const hasCrud = Boolean(fields && fields.length > 0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [deletingRow, setDeletingRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<
    string | number | null
  >(null);

  // Per-column search state
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>(
    {},
  );
  const [debouncedColumnSearches, setDebouncedColumnSearches] = useState<
    Record<string, string>
  >({});

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Extra Actions state
  const [extraActionState, setExtraActionState] = useState<{
    actionIndex: number;
    row: T;
  } | null>(null);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  // ─── Row helpers ──────────────────────────────────────────────────

  const getRowId = (row: T): string | number => {
    if (typeof row === "object" && row !== null && "id" in row) {
      return (row as { id: string | number }).id;
    }
    return 0;
  };

  const getRowIsActive = (row: T): boolean => {
    if (typeof row === "object" && row !== null && "is_active" in row) {
      return Boolean((row as { is_active: unknown }).is_active);
    }
    return false;
  };

  // ─── Toggle is_active ────────────────────────────────────────────

  const handleToggleActive = async (row: T) => {
    const id = getRowId(row);
    setTogglingActiveId(id);
    try {
      await satellite.patch(setActiveUrl(id));
      // Optimistic update
      setRows((prev) =>
        prev.map((r) => {
          if (getRowId(r) === id) {
            return { ...r, is_active: !getRowIsActive(r) };
          }
          return r;
        }),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Toggle failed";
      alert(msg);
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Build merged columns (auto action column + user columns)
  const mergedColumns = useMemo(() => {
    if (!hasCrud || !fields) return columns;

    const actionColumn: PaginationColumn<T> = {
      key: "__action__",
      header: language({ id: "AKSI", en: "ACTION" }),
      strict: true,
      align: "left",
      render: (row) => {
        return (
          <div className="flex items-center gap-1">
            {useIsActive && (
              <Switch
                checked={getRowIsActive(row)}
                onCheckedChange={() => handleToggleActive(row)}
                disabled={togglingActiveId === getRowId(row)}
              />
            )}
            {extraActions?.map((action, idx) => (
              <Button
                key={`ea-${idx}`}
                variant="ghost"
                size="icon"
                onClick={() => setExtraActionState({ actionIndex: idx, row })}
              >
                {action.icon}
              </Button>
            ))}
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
              <HiOutlinePencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDelete(row)}
              className="text-neon-red hover:bg-neon-red/10"
            >
              <HiOutlineTrash size={16} />
            </Button>
          </div>
        );
      },
    };

    // Checkbox column for multi-select
    const checkboxColumn: PaginationColumn<T> = {
      key: "__checkbox__",
      header: "#",
      strict: true,
      align: "center",
      render: (row) => {
        const id = getRowId(row);
        return (
          <input
            type="checkbox"
            checked={selectedIdsRef.current.has(id)}
            onChange={(e) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (e.target.checked) {
                  next.add(id);
                } else {
                  next.delete(id);
                }
                return next;
              });
            }}
            className="h-4 w-4 rounded border-dark-500 bg-dark-900/60 text-accent-500 focus:ring-accent-500/30 cursor-pointer accent-accent-500"
          />
        );
      },
    };

    return [actionColumn, checkboxColumn, ...columns];
  }, [columns, hasCrud, fields, language, useIsActive, togglingActiveId]);

  // Derive searchable field keys from columns with search: true
  // Stabilize reference: only recalculate when the actual keys change
  const searchableFieldsKey = useMemo(() => {
    return mergedColumns
      .filter((column) => column.search)
      .map((column) => column.key)
      .join(",");
  }, [mergedColumns]);

  const searchableFields = useMemo(() => {
    return searchableFieldsKey ? searchableFieldsKey.split(",") : [];
  }, [searchableFieldsKey]);

  // Has any column with search: true
  const hasColumnSearch = searchableFields.length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  // Debounce per-column searches
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedColumnSearches((prev) => {
        // Skip update if nothing changed (prevents extra fetch on mount)
        if (JSON.stringify(prev) === JSON.stringify(columnSearches))
          return prev;
        return columnSearches;
      });
    }, 500);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [columnSearches]);

  const fetchRows = useCallback(
    async (
      page: number,
      q: string,
      l: number,
      sb: string | undefined,
      so: "ASC" | "DESC" | undefined,
      colSearches: Record<string, string>,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      try {
        const params: PaginationFetchParams = {
          page,
          limit: l,
          search: q || undefined,
          sort_by: sb,
          sort_order: so,
          search_fields:
            searchableFields.length > 0
              ? searchableFields.join(",")
              : undefined,
        };

        // Add per-column search params
        for (const [key, val] of Object.entries(colSearches)) {
          if (val.trim()) {
            params[`col_${key}` as `col_${string}`] = val.trim();
          }
        }

        const response = await satellite.get<Response<WithPagination<T>>>(
          paginateUrl,
          { params },
        );
        const data = response.data.data;

        setRows(data.rows ?? []);
        setTotal(data.pagination.total ?? 0);
        setTotalPages(Math.max(1, data.pagination.total_pages ?? 1));

        if (
          page > (data.pagination.total_pages ?? 1) &&
          (data.pagination.total_pages ?? 1) > 0
        ) {
          setCurrentPage(data.pagination.total_pages);
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [paginateUrl, searchableFieldsKey],
  );

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
    }
    fetchRows(
      currentPage,
      debouncedSearch,
      limit,
      sortBy,
      sortOrder,
      debouncedColumnSearches,
    );
  }, [
    currentPage,
    debouncedSearch,
    limit,
    sortBy,
    sortOrder,
    debouncedColumnSearches,
    fetchRows,
  ]);

  useImperativeHandle(ref, () => ({
    reload: async () => {
      await fetchRows(
        currentPage,
        debouncedSearch,
        limit,
        sortBy,
        sortOrder,
        debouncedColumnSearches,
      );
    },
  }));

  // ─── CRUD helpers ─────────────────────────────────────────────────

  const initFormData = useCallback(
    (row?: T) => {
      if (!fields) return {};
      const data: Record<string, unknown> = {};
      for (const field of fields) {
        if (row && typeof row === "object" && row !== null) {
          const val = (row as Record<string, unknown>)[field.key];
          if (field.type === "array") {
            data[field.key] = Array.isArray(val) ? val : [];
          } else {
            data[field.key] = val != null ? String(val) : "";
          }
        } else {
          if (field.type === "array") {
            data[field.key] = [];
          } else if (
            field.type === "select" &&
            Array.isArray(field.options) &&
            field.options.length > 0
          ) {
            data[field.key] = field.options[0].value;
          } else {
            data[field.key] = "";
          }
        }
      }
      return data;
    },
    [fields],
  );

  const openCreate = () => {
    setEditingRow(null);
    setFormData(initFormData());
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingRow(row);
    setFormData(initFormData(row));
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openDelete = (row: T) => {
    setDeletingRow(row);
    setDeleteDialogOpen(true);
  };

  const getRowLabel = (row: T): string => {
    if (typeof row === "object" && row !== null) {
      const obj = row as Record<string, unknown>;
      if (typeof obj.name === "string") return obj.name;
      if (typeof obj.title === "string") return obj.title;
      if (typeof obj.key === "string") return obj.key;
    }
    return String(getRowId(row));
  };

  const isFormValid = useCallback(() => {
    if (!fields) return false;
    for (const field of fields) {
      if (field.type === "array") {
        const arr = (formData[field.key] || []) as Record<string, unknown>[];
        if (field.required && arr.length === 0) return false;
        if (field.minLength !== undefined && arr.length < field.minLength)
          return false;
        if (field.strict) {
          const stringified = arr.map((item) => JSON.stringify(item));
          const unique = new Set(stringified);
          if (unique.size !== arr.length) return false;
        }
        if (field.children) {
          for (const item of arr) {
            for (const child of field.children) {
              const val = item[child.key] ?? "";
              if (child.required && !String(val).trim()) return false;
            }
          }
        }
      } else {
        const val = formData[field.key] ?? "";
        if (field.required && !String(val).trim()) return false;
        if (typeof val === "string") {
          if (field.minLength && val.length < field.minLength) return false;
          if (field.maxLength && val.length > field.maxLength) return false;
        }
      }
      if (fieldErrors[field.key]) return false;
    }
    return true;
  }, [fields, formData, fieldErrors]);

  const handleSave = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (fields) {
        for (const field of fields) {
          if (field.type === "array") {
            payload[field.key] = formData[field.key] || [];
          } else {
            payload[field.key] =
              typeof formData[field.key] === "string"
                ? (formData[field.key] as string).trim()
                : formData[field.key];
          }
        }
      }

      if (editingRow) {
        await satellite.put(editUrl(getRowId(editingRow)), payload);
      } else {
        await satellite.post(createUrl, payload);
      }

      setDialogOpen(false);
      await fetchRows(
        currentPage,
        debouncedSearch,
        limit,
        sortBy,
        sortOrder,
        debouncedColumnSearches,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Operation failed";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    setIsSubmitting(true);
    try {
      await satellite.delete(removeUrl(getRowId(deletingRow)));
      setDeleteDialogOpen(false);
      setDeletingRow(null);
      await fetchRows(
        currentPage,
        debouncedSearch,
        limit,
        sortBy,
        sortOrder,
        debouncedColumnSearches,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Delete failed";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Bulk select helpers ──────────────────────────────────────────

  const isAllChecked =
    rows.length > 0 && rows.every((row) => selectedIds.has(getRowId(row)));

  const toggleSelectAll = () => {
    if (isAllChecked) {
      setSelectedIds(new Set());
    } else {
      const ids = new Set(rows.map((row) => getRowId(row)));
      setSelectedIds(ids);
    }
  };

  // Clear selection when rows change (page change, search, etc.)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [rows]);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      await satellite.post(bulkRemoveUrl, {
        ids: Array.from(selectedIds),
      });
      setBulkDeleteDialogOpen(false);
      setSelectedIds(new Set());
      await fetchRows(
        currentPage,
        debouncedSearch,
        limit,
        sortBy,
        sortOrder,
        debouncedColumnSearches,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Bulk delete failed";
      alert(msg);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ─── Pagination window ───────────────────────────────────────────

  const paginationWindow = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safeCurrentPage, totalPages]);

  const helpers = useMemo<PaginationHelpers<T>>(
    () => ({
      reload: async () => {
        await fetchRows(
          currentPage,
          debouncedSearch,
          limit,
          sortBy,
          sortOrder,
          debouncedColumnSearches,
        );
      },
      setRows,
    }),
    [
      currentPage,
      debouncedSearch,
      debouncedColumnSearches,
      fetchRows,
      limit,
      sortBy,
      sortOrder,
    ],
  );

  const getAlignClassName = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const getHeaderButtonClassName = (align?: "left" | "center" | "right") => {
    if (align === "center") return "justify-center";
    if (align === "right") return "justify-end";
    return "justify-start";
  };

  const getStrictHeaderButtonClassName = (
    align?: "left" | "center" | "right",
  ) => {
    if (align === "center") return "mx-auto";
    if (align === "right") return "ml-auto";
    return "";
  };

  const from = total === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const to =
    total === 0
      ? 0
      : Math.min((safeCurrentPage - 1) * limit + rows.length, total);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center gap-3">
              {hasCrud && (
                <Button
                  onClick={openCreate}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <HiOutlinePlus size={16} />
                  {language({ id: "Tambah Data", en: "Add Data" })}
                </Button>
              )}
              <div className="relative">
                <HiOutlineSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                />
                <Input
                  placeholder={language({
                    id: "Cari data...",
                    en: "Search data...",
                  })}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-64 pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {mergedColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={
                      column.key === "__checkbox__"
                        ? "w-px whitespace-nowrap text-center"
                        : `${getAlignClassName(column.align)} ${column.strict ? "w-px whitespace-nowrap" : ""} ${column.headerClassName ?? ""}`.trim()
                    }
                  >
                    {column.key === "__checkbox__" ? (
                      <input
                        type="checkbox"
                        checked={isAllChecked}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-dark-500 bg-dark-900/60 text-accent-500 focus:ring-accent-500/30 cursor-pointer accent-accent-500"
                      />
                    ) : column.sort ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === column.key) {
                            if (sortOrder === "DESC") {
                              setSortOrder("ASC");
                            } else {
                              setSortBy(undefined);
                              setSortOrder(undefined);
                            }
                          } else {
                            setSortBy(column.key);
                            setSortOrder("DESC");
                          }
                          setCurrentPage(1);
                        }}
                        className={`${
                          column.strict
                            ? `inline-flex items-center gap-2 ${getStrictHeaderButtonClassName(column.align)}`
                            : `flex w-full items-center gap-2 ${getHeaderButtonClassName(column.align)}`
                        }`.trim()}
                      >
                        <span>{column.header}</span>
                        <span className="text-dark-400">
                          {sortBy === column.key ? (
                            sortOrder === "DESC" ? (
                              <HiOutlineChevronDown size={14} />
                            ) : (
                              <HiOutlineChevronUp size={14} />
                            )
                          ) : (
                            <HiOutlineChevronUp
                              size={14}
                              className="opacity-30"
                            />
                          )}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
              {/* Per-column search row */}
              {hasColumnSearch && (
                <TableRow>
                  {mergedColumns.map((column) => (
                    <TableHead key={`search-${column.key}`} className="py-1">
                      {column.search ? (
                        <Input
                          placeholder={`${language({ id: "Cari", en: "Search" })}...`}
                          value={columnSearches[column.key] ?? ""}
                          onChange={(e) => {
                            setColumnSearches((prev) => ({
                              ...prev,
                              [column.key]: e.target.value,
                            }));
                            setCurrentPage(1);
                          }}
                          className="h-7 text-xs px-2"
                        />
                      ) : null}
                    </TableHead>
                  ))}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={mergedColumns.length}
                    className="py-8 text-center text-dark-400"
                  >
                    {isLoading
                      ? language({
                          id: "Memuat data...",
                          en: "Loading data...",
                        })
                      : language({
                          id: "Tidak ada data ditemukan",
                          en: "No data found",
                        })}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const key =
                    typeof row === "object" && row !== null && "id" in row
                      ? String((row as { id?: string | number }).id ?? idx)
                      : String(idx);

                  return (
                    <TableRow key={key}>
                      {mergedColumns.map((column) => (
                        <TableCell
                          key={`${key}-${column.key}`}
                          className={`${getAlignClassName(column.align)} ${column.strict ? "w-px whitespace-nowrap" : ""} ${column.cellClassName ?? ""}`.trim()}
                        >
                          {column.render(row, idx, helpers)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Bulk delete button */}
          {hasCrud && selectedIds.size > 0 && (
            <div className="mt-3">
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <HiOutlineTrash size={14} />
                {language({ id: "Hapus", en: "Delete" })} {selectedIds.size}{" "}
                {language({ id: "data", en: "items" })}
              </Button>
            </div>
          )}

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <p className="text-xs text-dark-400">
                {language({ id: "Menampilkan", en: "Showing" })} {from} - {to}{" "}
                {language({ id: "dari", en: "of" })} {total}{" "}
                {language({ id: "data", en: "items" })}
              </p>
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-16 h-8 px-0 py-0 text-[11px] border-accent-500/20 bg-dark-900/40 hover:border-accent-500/40 transition-all text-center"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-8 h-8 p-0 rounded-full"
              >
                <HiOutlineChevronLeft size={14} />
              </Button>

              {paginationWindow[0] > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    1
                  </Button>
                  {paginationWindow[0] > 2 && (
                    <span className="px-1 text-xs text-dark-400">...</span>
                  )}
                </>
              )}

              {paginationWindow.map((page) => (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  {page}
                </Button>
              ))}

              {paginationWindow[paginationWindow.length - 1] < totalPages && (
                <>
                  {paginationWindow[paginationWindow.length - 1] <
                    totalPages - 1 && (
                    <span className="px-1 text-xs text-dark-400">...</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 p-0 rounded-full"
              >
                <HiOutlineChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add / Edit Dialog ──────────────────────────────────────── */}
      {hasCrud && fields && (
        <Dialog open={dialogOpen} onClose={() => {}} width="520px">
          <DialogContent onClose={() => setDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {editingRow
                  ? language({ id: "Edit Data", en: "Edit Data" })
                  : language({ id: "Tambah Data", en: "Add Data" })}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-12 gap-4">
              {fields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    gridColumn: `span ${field.col || 12} / span ${field.col || 12}`,
                  }}
                >
                  <Label
                    htmlFor={`field-${field.key}`}
                    required={field.required}
                  >
                    {field.label}
                  </Label>
                  {field.type === "array" ? (
                    <ArrayField
                      field={field}
                      value={
                        (formData[field.key] as Record<string, unknown>[]) || []
                      }
                      onChange={(newVal) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: newVal,
                        }))
                      }
                    />
                  ) : field.type === "select" ? (
                    <DynamicSelect
                      field={field}
                      formData={formData as Record<string, string>}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, [field.key]: val }))
                      }
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`field-${field.key}`}
                      className="mt-1.5 w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50 min-h-[80px] resize-y"
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                    />
                  ) : field.debounce ? (
                    <DebouncedInput
                      field={field}
                      formData={formData as Record<string, string>}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, [field.key]: val }))
                      }
                      onError={(key, err) =>
                        setFieldErrors((prev) => ({ ...prev, [key]: err }))
                      }
                      initialValue={
                        editingRow && typeof editingRow === "object"
                          ? String(
                              (editingRow as Record<string, unknown>)[
                                field.key
                              ] ?? "",
                            )
                          : ""
                      }
                    />
                  ) : (
                    <Input
                      id={`field-${field.key}`}
                      type={field.type}
                      className="mt-1.5"
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {language({ id: "Batal", en: "Cancel" })}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting || !isFormValid()}
              >
                {language({ id: "Simpan", en: "Save" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Delete Confirmation Dialog ─────────────────────────────── */}
      {hasCrud && (
        <Dialog open={deleteDialogOpen} onClose={() => {}}>
          <DialogContent onClose={() => setDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {language({ id: "Hapus Data", en: "Delete Data" })}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-dark-300">
              {language({
                id: "Apakah Anda yakin ingin menghapus",
                en: "Are you sure you want to delete",
              })}{" "}
              <strong className="text-foreground">
                {deletingRow ? getRowLabel(deletingRow) : ""}
              </strong>
              ?{" "}
              {language({
                id: "Tindakan ini tidak dapat dibatalkan.",
                en: "This action cannot be undone.",
              })}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {language({ id: "Batal", en: "Cancel" })}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {language({ id: "Hapus", en: "Delete" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Bulk Delete Confirmation Dialog ──────────────────────────── */}
      {hasCrud && (
        <Dialog open={bulkDeleteDialogOpen} onClose={() => {}}>
          <DialogContent onClose={() => setBulkDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {language({ id: "Hapus Data", en: "Delete Data" })}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-dark-300">
              {language({
                id: "Apakah Anda yakin ingin menghapus",
                en: "Are you sure you want to delete",
              })}{" "}
              <strong className="text-foreground">
                {selectedIds.size} {language({ id: "data", en: "items" })}
              </strong>
              ?{" "}
              {language({
                id: "Tindakan ini tidak dapat dibatalkan.",
                en: "This action cannot be undone.",
              })}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkDeleteDialogOpen(false)}
              >
                {language({ id: "Batal", en: "Cancel" })}
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                {language({ id: "Hapus", en: "Delete" })} {selectedIds.size}{" "}
                {language({ id: "data", en: "items" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Extra Action Dialog ─────────────────────────────── */}
      {extraActionState !== null &&
        extraActions?.[extraActionState.actionIndex] && (
          <Dialog open={true} onClose={() => {}}>
            <DialogContent onClose={() => setExtraActionState(null)}>
              {typeof extraActions[extraActionState.actionIndex].component ===
              "function"
                ? (
                    extraActions[extraActionState.actionIndex]
                      .component as Function
                  )(extraActionState.row, () => setExtraActionState(null))
                : typeof extraActions[extraActionState.actionIndex]
                      .component === "object" &&
                    isValidElement(
                      extraActions[extraActionState.actionIndex].component,
                    )
                  ? cloneElement(
                      extraActions[extraActionState.actionIndex]
                        .component as React.ReactElement,
                      {
                        // @ts-ignore
                        row: extraActionState.row,
                        onClose: () => setExtraActionState(null),
                      },
                    )
                  : extraActions[extraActionState.actionIndex].component}
            </DialogContent>
          </Dialog>
        )}
    </>
  );
}) as <T>(
  props: PaginationProps<T> & { ref?: Ref<PaginationHandle> },
) => ReactNode;

export default Pagination;
