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
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
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
import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { usePermission } from "@/hooks/usePermission";
import satellite from "@/lib/satellite";
import type { Response, WithPagination } from "@/types/response";
import { toast } from "react-toastify";

import type {
  DynamicFormFieldOption as PaginationFieldOption,
  DynamicFormField as PaginationField,
} from "@/components/DynamicForm";
import DynamicForm, {
  type DynamicFormFieldNormal,
} from "@/components/DynamicForm";
import { IconComponent } from "@/components/ui/IconSelector";
import type { RuleType } from "@/stores/ruleStore";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";
import type { LanguageKey } from "@/types/world";

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

export interface PaginationColumn<T, TFilter = unknown> {
  key: string;
  header: string;
  strict?: boolean;
  align?: "left" | "center" | "right";
  sort?: boolean;
  search?: boolean;
  options?: { label: string; value: string | number }[] | string;
  ref?: string | string[];
  headerClassName?: string;
  cellClassName?: string;
  rule?: RuleType;
  onlySuperAdmin?: boolean;
  selectFormat?: (row: TFilter) => { label: string; value: string | number };
  render: (row: T, index: number, helpers: PaginationHelpers<T>) => ReactNode;
}

export interface PaginationExtraAction<T> {
  icon?: string;
  label: Record<LanguageCode, string>;
  width?: string | number;
  height?: string | number;
  button?: (row: T, onClose: () => void) => ReactNode;
  component?: ReactNode | ((row: T, onClose: () => void) => ReactNode);
}

export interface PaginationProps<T, F = unknown> {
  title: string;
  columns: PaginationColumn<T>[];
  module: string;
  fields?: PaginationField<F>[];
  useIsActive?: boolean;
  extraActions?: PaginationExtraAction<T>[];
  dataSelected?: string | number | string[] | number[] | (string | number)[];
  ruleKey?: string;
  dataDeleteName?: (row: T) => string;
  onSelectRow?: (row: T) => void;
  dummyData?: unknown[];
  popupWidth?: string | number;
  popupHeight?: string | number;
}

export interface PaginationHandle {
  reload: () => Promise<void>;
}

export type { PaginationFieldOption, PaginationField };

const flattenFields = <F,>(
  fields: PaginationField<F>[],
): PaginationField<F>[] => {
  const result: PaginationField<F>[] = [];
  for (const field of fields) {
    if (!field.key && field.children && field.type !== "array") {
      result.push(...flattenFields(field.children));
    } else {
      result.push(field);
    }
  }
  return result;
};

const Pagination = forwardRef(function Pagination<T, F = unknown>(
  {
    title,
    columns,
    module,
    fields = [],
    useIsActive = true,
    extraActions = [],
    dataSelected,
    ruleKey,
    dataDeleteName,
    onSelectRow,
    dummyData,
    popupWidth,
    popupHeight,
  }: PaginationProps<T, F>,
  ref: Ref<PaginationHandle>,
) {
  const perm = usePermission(ruleKey);
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
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
  const [saveError, setSaveError] = useState<Record<
    LanguageKey,
    string
  > | null>(null);

  // Per-column search state
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>(
    {},
  );
  const [debouncedColumnSearches, setDebouncedColumnSearches] = useState<
    Record<string, string>
  >({});
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, { label: string; value: string | number }[]>
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
  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const f = field as DynamicFormFieldNormal;
      if (!f.rule) return true;
      if (f.rule === "create") return perm.canCreate;
      if (f.rule === "read") return perm.canRead;
      if (f.rule === "update") return perm.canUpdate;
      if (f.rule === "delete") return perm.canDelete;
      if (f.rule === "set") return perm.canSet;
      return true;
    });
  }, [fields, perm]) as PaginationField[];
  const hasCrud = filteredFields.length > 0;

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
      await satellite.patch<Response<unknown>>(setActiveUrl(id));
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
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Toggle failed";
      toast.error(msg);
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Build merged columns (auto action column + user columns)
  const mergedColumns = useMemo<PaginationColumn<T>[]>(() => {
    const isSuperAdmin = user?.role === "su";
    const baseColumns = columns.filter((col) => {
      if (col.onlySuperAdmin) return isSuperAdmin;
      return true;
    });

    if (!hasCrud || filteredFields.length === 0) return baseColumns;

    // Check if we need the action column at all
    const showToggle = useIsActive && perm.canSet;
    const showEdit = perm.canUpdate;
    const showDelete = perm.canDelete;
    const hasAnyAction =
      showToggle ||
      showEdit ||
      showDelete ||
      extraActions.length > 0;

    const result: PaginationColumn<T>[] = [];

    if (hasAnyAction) {
      const actionColumn: PaginationColumn<T> = {
        key: "__action__",
        header: language({ id: "AKSI", en: "ACTION" }),
        strict: true,
        align: "center",
        render: (row) => {
          return (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-1">
                {showToggle && (
                  <Switch
                    checked={getRowIsActive(row)}
                    onCheckedChange={() => handleToggleActive(row)}
                    disabled={togglingActiveId === getRowId(row)}
                  />
                )}
                {showEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title={language({ id: "Ubah", en: "Edit" })}
                    onClick={() => openEdit(row)}
                  >
                    <IconComponent iconName="Hi/HiOutlinePencil" size={16} />
                  </Button>
                )}
                {showDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title={language({ id: "Hapus", en: "Delete" })}
                    onClick={() => openDelete(row)}
                    className="text-neon-red hover:bg-neon-red/10"
                  >
                    <IconComponent iconName="Hi/HiOutlineTrash" size={16} />
                  </Button>
                )}
              </div>
              {extraActions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 max-w-30">
                  {extraActions.map((action, idx) => {
                    const reload = () =>
                      fetchRows(
                        currentPage,
                        debouncedSearch,
                        limit,
                        sortBy,
                        sortOrder,
                        debouncedColumnSearches,
                      );

                    return (
                      <div key={`ea-${idx}`} className="contents">
                        {action.icon && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={language(action.label)}
                            onClick={() => {
                              if (action.button) action.button(row, reload);
                              if (action.component)
                                setExtraActionState({ actionIndex: idx, row });
                            }}
                          >
                            <IconComponent iconName={action.icon} size={16} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        },
      };
      result.push(actionColumn);
    }

    // Checkbox column for multi-select (only if delete is allowed)
    if (perm.canDelete) {
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
              className="h-4 w-4 rounded border-dark-600 bg-dark-900 text-accent-500 focus:ring-accent-500/30 cursor-pointer accent-accent-500"
            />
          );
        },
      };
      result.push(checkboxColumn);
    }

    // Filter user columns based on rules
    const filteredColumns = columns.filter((col) => {
      if (col.onlySuperAdmin && !isSuperAdmin) return false;
      if (!col.rule) return true;
      if (col.rule === "create") return perm.canCreate;
      if (col.rule === "read") return perm.canRead;
      if (col.rule === "update") return perm.canUpdate;
      if (col.rule === "delete") return perm.canDelete;
      return perm.canSet;
      return true;
    });

    return [...result, ...filteredColumns];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    hasCrud,
    filteredFields,
    language,
    useIsActive,
    togglingActiveId,
    perm,
    extraActions,
    user,
  ]);

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

  // Has any column with search: true or options defined
  const hasColumnSearch = useMemo(() => {
    return mergedColumns.some((col) => col.search ?? col.options);
  }, [mergedColumns]);

  // Fetch dynamic options on demand
  const handleFetchOptions = useCallback(
    <F,>(col: PaginationColumn<T, F>) => {
      if (typeof col.options === "string") {
        let endpoint = col.options;

        if (col.ref) {
          const refs = Array.isArray(col.ref) ? col.ref : [col.ref];
          let hasAllRefs = true;

          for (const r of refs) {
            const refValue = columnSearches[r];
            if (!refValue) {
              hasAllRefs = false;
              break;
            }

            // Find the ID/Value for this label in the ref column's options
            const refCol = mergedColumns.find((c) => c.key === r);
            if (refCol) {
              const refOptions =
                typeof refCol.options === "string"
                  ? dynamicOptions[refCol.key]
                  : refCol.options;
              const found = refOptions?.find((o) => o.label === refValue);
              if (found) {
                endpoint = endpoint.replace(`{${r}}`, String(found.value));
              } else {
                endpoint = endpoint.replace(`{${r}}`, refValue);
              }
            }
          }

          if (!hasAllRefs) {
            setDynamicOptions((prev) => ({ ...prev, [col.key]: [] }));
            return;
          }
        }

        satellite
          .get<Response<F[]>>(`/api/option/${endpoint}`)
          .then((res) => {
            const data = res.data.data;
            const format = col.selectFormat;
            setDynamicOptions((prev) => ({
              ...prev,
              [col.key]: data.map((d) => {
                if (format) {
                  const formatted = format(d);
                  return {
                    value: String(formatted.value),
                    label: formatted.label,
                  };
                }
                const item = d as unknown as { label: string; value: unknown };
                let label = item.label;
                try {
                  if (label.startsWith("{")) {
                    label = language(JSON.parse(label) as Record<LanguageCode, string>);
                  }
                } catch (e) {
                  // fallback to raw label
                }
                return {
                  value: String(item.value),
                  label,
                };
              }),
            }));
          })
          .catch(() => {
            // skip ...
          });
      }
    },
    [columnSearches, dynamicOptions, language, mergedColumns],
  );

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
      if (dummyData && dummyData.length > 0) {
        let filtered = [...dummyData];

        // Global search
        if (q) {
          const lowerQ = q.toLowerCase();
          filtered = filtered.filter((item) => {
            return searchableFields.some((field) => {
              const val = (item as Record<string, unknown>)[field];
              return (typeof val === "string" || typeof val === "number") && String(val).toLowerCase().includes(lowerQ);
            });
          });
        }

        // Column search
        for (const [key, val] of Object.entries(colSearches)) {
          if (val.trim()) {
            const lowerVal = val.trim().toLowerCase();
            filtered = filtered.filter((item) => {
              const itemVal = (item as Record<string, unknown>)[key];
              return (
                (typeof itemVal === "string" || typeof itemVal === "number") && String(itemVal).toLowerCase().includes(lowerVal)
              );
            });
          }
        }

        // Sorting
        if (sb) {
          filtered.sort((a, b) => {
            const valA = (a as Record<string, unknown>)[sb] ?? "";
            const valB = (b as Record<string, unknown>)[sb] ?? "";
            if (valA < valB) return so === "ASC" ? -1 : 1;
            if (valA > valB) return so === "ASC" ? 1 : -1;
            return 0;
          });
        }

        // Pagination
        const start = (page - 1) * l;
        const paged = filtered.slice(start, start + l);

        setRows(paged as T[]);
        setTotal(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / l)));
        setIsLoading(false);
        return;
      }

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
            params[`col_${key}`] = val.trim();
          }
        }

        const response = await satellite.get<Response<WithPagination<T>>>(
          paginateUrl,
          { params },
        );
        const data = response.data.data;

        setRows(data.rows);
        setTotal(data.pagination.total);
        setTotalPages(Math.max(1, data.pagination.total_pages));

        if (
          page > data.pagination.total_pages &&
          data.pagination.total_pages > 0
        ) {
          setCurrentPage(data.pagination.total_pages);
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    dummyData,
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
      if (filteredFields.length === 0) return {};
      const data: Record<string, unknown> = {};
      const flatFields = flattenFields(filteredFields);
      for (const field of flatFields) {
        if (row !== undefined && typeof row === "object" && row !== null) {
          const key = field.key;
          if (!key) continue;
          const val = (row as Record<string, unknown>)[key];
          if (field.type === "array") {
            data[key] = Array.isArray(val) ? val : [];
          } else if (typeof val === "object" && val !== null) {
            data[key] = val;
          } else {
            data[key] = (typeof val === "string" || typeof val === "number") ? String(val) : "";
          }
        } else {
          if (field.type === "array") {
            data[field.key] = [];
          } else if (
            field.type === "select" &&
            Array.isArray((field as DynamicFormFieldNormal).selectOptions) &&
            (
              (field as DynamicFormFieldNormal)
                .selectOptions as PaginationFieldOption[]
            ).length > 0
          ) {
            const options = (field as DynamicFormFieldNormal)
              .selectOptions as PaginationFieldOption[];
            const defaultOption = options.find((opt) => opt.default === true);
            data[field.key] = defaultOption ? defaultOption.value : "";
          } else if (
            (field.type === "switch" || field.type === "checkbox") &&
            (field as DynamicFormFieldNormal).booleanDefault !== undefined
          ) {
            data[field.key] = (field as DynamicFormFieldNormal).booleanDefault;
          } else {
          if (field.key) {
            data[field.key] = "";
          }
          }
        }
      }
      return data;
    },
    [filteredFields],
  );

  const openCreate = () => {
    setEditingRow(null);
    setFormData(initFormData());
    setFieldErrors({});
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingRow(row);
    setFormData(initFormData(row));
    setFieldErrors({});
    setSaveError(null);
    setDialogOpen(true);
  };

  const openDelete = (row: T) => {
    setDeletingRow(row);
    setDeleteDialogOpen(true);
  };

  const getRowLabel = (row: T): string => {
    if (dataDeleteName) return dataDeleteName(row);
    if (typeof row === "object" && row !== null) {
      const obj = row as Record<string, unknown>;
      if (typeof obj.name === "string") return obj.name;
      if (typeof obj.title === "string") return obj.title;
      if (typeof obj.key === "string") return obj.key;
    }
    return String(getRowId(row));
  };

  const isFormValid = useCallback(() => {
    const flatFields = flattenFields(filteredFields);
    for (const field of flatFields) {
      const isCreate = !editingRow;
      if (field.only === "create" && !isCreate) continue;
      if (field.only === "update" && isCreate) continue;

      if (field.type === "array") {
        const arr = (formData[field.key] ?? []) as Record<string, unknown>[];
        if (field.required && arr.length === 0) return false;
        if (field.minLength !== undefined && arr.length < field.minLength)
          return false;
        if (field.strict && field.children) {
          const childKeys = field.children.map((child) => child.key);
          const stringified = arr.map((item) => {
            const relevantData: Record<string, unknown> = {};
            for (const key of childKeys) {
              if (key) relevantData[key] = item[key];
            }
            return JSON.stringify(relevantData);
          });
          const unique = new Set(stringified);
          if (unique.size !== arr.length) return false;
        }
        if (field.children) {
          for (const item of arr) {
            for (const child of field.children) {
              const key = child.key;
              if (!key) continue;
              const val = item[key] ?? "";
              if (
                (child as DynamicFormFieldNormal).required &&
                !(typeof val === "string" || typeof val === "number" ? String(val) : "").trim()
              )
                return false;
            }
          }
        }
      } else {
        const val = formData[(field as DynamicFormFieldNormal).key] ?? "";
        if ((field as DynamicFormFieldNormal).required && !(typeof val === "string" || typeof val === "number" ? String(val) : "").trim())
          return false;
          
        if (field.type === "weight" && (field as DynamicFormFieldNormal).required) {
          const unitKey = `${(field as DynamicFormFieldNormal).key}_unit_id`;
          const unitVal = formData[unitKey] ?? "";
          if (!(typeof unitVal === "string" || typeof unitVal === "number" ? String(unitVal) : "").trim())
            return false;
        }
        
        if (typeof val === "string") {
          if (
            (field as DynamicFormFieldNormal).minLength &&
            val.length < ((field as DynamicFormFieldNormal).minLength ?? 0)
          )
            return false;
          if (
            (field as DynamicFormFieldNormal).maxLength &&
            val.length > ((field as DynamicFormFieldNormal).maxLength ?? 0)
          )
            return false;
        }
      }
      if (field.key && fieldErrors[field.key]) return false;
    }
    return true;
  }, [filteredFields, formData, fieldErrors, editingRow]);

  const handleSave = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {};
      const flatFields = flattenFields(filteredFields);
      for (const field of flatFields) {
        const isCreate = !editingRow;
        if (field.only === "create" && !isCreate) continue;
        if (field.only === "update" && isCreate) continue;

        if (field.type === "array") {
          payload[field.key] = formData[field.key] ?? [];
        } else {
          const fieldKey = (field as DynamicFormFieldNormal).key;
          payload[fieldKey] =
            typeof formData[fieldKey] === "string"
              ? (formData[fieldKey]).trim()
              : formData[fieldKey];
              
          if (field.type === "weight") {
            const unitKey = `${fieldKey}_unit_id`;
            payload[unitKey] = formData[unitKey];
          }
        }
      }

      if (editingRow) {
        await satellite.put<Response<unknown>>(
          editUrl(getRowId(editingRow)),
          payload,
        );
      } else {
        await satellite.post<Response<unknown>>(createUrl, payload);
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
    } catch (err) {
      const error = err as AxiosError<{ message: Record<LanguageKey, string> }>;
      setSaveError(error.response?.data.message ?? null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    setIsSubmitting(true);
    try {
      await satellite.delete<Response<unknown>>(
        removeUrl(getRowId(deletingRow)),
      );
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
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Delete failed";
      toast.error(msg);
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
      await satellite.post<Response<unknown>>(bulkRemoveUrl, {
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
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Bulk delete failed";
      toast.error(msg);
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
              {hasCrud && perm.canCreate && (
                <Button
                  onClick={openCreate}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <IconComponent iconName="Hi/HiOutlinePlus" size={16} />
                  {language({ id: "Tambah Data", en: "Add Data" })}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => helpers.reload()}
                disabled={isLoading}
                className="w-9 h-9 rounded-full border-dark-600/40 bg-dark-900 text-dark-400 hover:text-foreground transition-all shrink-0"
              >
                <IconComponent
                  iconName="Hi/HiOutlineRefresh"
                  size={16}
                  className={cn(isLoading && "animate-spin text-accent-500")}
                />
              </Button>

              <div className="relative">
                <IconComponent
                  iconName="Hi/HiOutlineSearch"
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
                        className="h-4 w-4 rounded border-dark-600 bg-dark-900 text-accent-500 focus:ring-accent-500/30 cursor-pointer accent-accent-500"
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
                        className={(column.strict
                          ? `inline-flex items-center gap-2 ${getStrictHeaderButtonClassName(column.align)}`
                          : `flex w-full items-center gap-2 ${getHeaderButtonClassName(column.align)}`
                        ).trim()}
                      >
                        <span>{column.header}</span>
                        <span className="text-dark-400">
                          {sortBy === column.key ? (
                            sortOrder === "DESC" ? (
                              <IconComponent
                                iconName="Hi/HiOutlineChevronDown"
                                size={14}
                              />
                            ) : (
                              <IconComponent
                                iconName="Hi/HiOutlineChevronUp"
                                size={14}
                              />
                            )
                          ) : (
                            <IconComponent
                              iconName="Hi/HiOutlineChevronUp"
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
                  {mergedColumns.map((column) => {
                    const colOptions =
                      typeof column.options === "string"
                        ? dynamicOptions[column.key]
                        : column.options;

                    return (
                      <TableHead key={`search-${column.key}`} className="py-1">
                        <div className="flex flex-col gap-1 w-full">
                          {column.search && (
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
                              className="h-7 text-xs px-2 w-full"
                            />
                          )}
                          {column.options && (
                            <SearchableSelect
                              size="sm"
                              disabled={
                                column.ref
                                  ? Array.isArray(column.ref)
                                    ? column.ref.some((r) => !columnSearches[r])
                                    : !columnSearches[column.ref]
                                  : false
                              }
                              onOpen={() => handleFetchOptions(column)}
                              value={(() => {
                                const currentSearch =
                                  columnSearches[column.key] ?? "";
                                if (!currentSearch) return "all";
                                const found = colOptions?.find(
                                  (o) => o.label === currentSearch,
                                );
                                return found ? String(found.value) : "all";
                              })()}
                              onChange={(val) => {
                                let searchVal = "";
                                if (val !== "all") {
                                  const selected = colOptions?.find(
                                    (o) => String(o.value) === val,
                                  );
                                  searchVal = selected ? selected.label : val;
                                }

                                setColumnSearches((prev) => {
                                  const newState = {
                                    ...prev,
                                    [column.key]: searchVal,
                                  };

                                  // Cascading clear: if this column is cleared, clear all columns that depend on it
                                  if (!searchVal || searchVal === "") {
                                    mergedColumns.forEach((c) => {
                                      if (c.ref) {
                                        const isDependent = Array.isArray(c.ref)
                                          ? c.ref.includes(column.key)
                                          : c.ref === column.key;
                                        if (isDependent) {
                                          newState[c.key] = "";
                                        }
                                      }
                                    });
                                  }

                                  return newState;
                                });
                                setCurrentPage(1);
                              }}
                              placeholder={language({ id: "Semua", en: "All" })}
                              options={[
                                {
                                  value: "all",
                                  label: language({ id: "Semua", en: "All" }),
                                },
                                ...(colOptions ?? []).map((opt) => {
                                  const format = column.selectFormat;
                                  const item = format ? format(opt) : opt;
                                  let label = item.label;
                                  try {
                                    if (label.startsWith("{")) {
                                      label = language(
                                        JSON.parse(label) as Record<LanguageCode, string>,
                                      );
                                    }
                                  } catch (e) {
                                    // fallback to raw label
                                  }
                                  return {
                                    value: String(opt.value),
                                    label,
                                  };
                                }),
                              ]}
                              className={cn(column.search ? "mt-1" : "")}
                            />
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
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

                  const isSelected = (() => {
                    if (dataSelected === undefined)
                      return false;
                    const rowId = getRowId(row);
                    if (Array.isArray(dataSelected)) {
                      return dataSelected.some(
                        (id) => String(id) === String(rowId),
                      );
                    }
                    return String(dataSelected) === String(rowId);
                  })();

                  return (
                    <TableRow
                      key={key}
                      className={
                        isSelected
                          ? "bg-accent-500/10 hover:bg-accent-500/15"
                          : ""
                      }
                    >
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
          {hasCrud && perm.canDelete && selectedIds.size > 0 && (
            <div className="mt-3">
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <IconComponent iconName="Hi/HiOutlineTrash" size={14} />
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
                className="w-16 h-8 px-0 py-0 text-[11px] border-dark-600 bg-dark-900 hover:border-accent-500/40 transition-all text-center"
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
                <IconComponent iconName="Hi/HiOutlineChevronLeft" size={14} />
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
                <IconComponent iconName="Hi/HiOutlineChevronRight" size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add / Edit Dialog ──────────────────────────────────────── */}
      {hasCrud && (
        <Dialog
          open={dialogOpen}
          onClose={() => {
            // skip ...
          }}
          width={popupWidth ? String(popupWidth) : "520px"}
          height={popupHeight ? String(popupHeight) : "auto"}
        >
          <DialogContent
            onClose={() => setDialogOpen(false)}
            className={popupHeight ? "h-full flex flex-col" : ""}
          >
            <DialogHeader>
              <DialogTitle>
                {editingRow
                  ? language({ id: "Edit Data", en: "Edit Data" })
                  : language({ id: "Tambah Data", en: "Add Data" })}
                : {title}
              </DialogTitle>
            </DialogHeader>
            <div
              className={cn(
                "overflow-y-auto -mx-6 px-6 py-1",
                popupHeight ? "flex-1" : "max-h-[60vh]",
              )}
            >
              <DynamicForm
                  fields={filteredFields}
                  formData={formData}
                  onChange={(key, val) =>
                    setFormData((prev) => ({ ...prev, [key]: val }))
                  }
                  fieldErrors={fieldErrors}
                  editingRow={editingRow}
                  onError={(key, err) =>
                    setFieldErrors((prev) => ({ ...prev, [key]: err }))
                  }
                />
            </div>
            {saveError && (
              <p className="px-6 text-xs text-neon-red font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                {language(saveError)}
              </p>
            )}
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            // skip ...
          }}
        >
          <DialogContent onClose={() => setDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {language({ id: "Hapus Data", en: "Delete Data" })}: {title}
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
        <Dialog
          open={bulkDeleteDialogOpen}
          onClose={() => {
            // skip ...
          }}
        >
          <DialogContent onClose={() => setBulkDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {language({ id: "Hapus Data", en: "Delete Data" })}: {title}
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
        extraActions[extraActionState.actionIndex] && (
          <Dialog
            open={true}
            onClose={() => {
              // skip ...
            }}
            width={
              (typeof extraActions[extraActionState.actionIndex].width ===
              "number"
                ? `${extraActions[extraActionState.actionIndex].width}px`
                : extraActions[extraActionState.actionIndex].width) as string
            }
            height={
              (typeof extraActions[extraActionState.actionIndex].height ===
              "number"
                ? `${extraActions[extraActionState.actionIndex].height}px`
                : extraActions[extraActionState.actionIndex].height) as string
            }
          >
            <DialogContent
              onClose={() => setExtraActionState(null)}
              className={
                extraActions[extraActionState.actionIndex].height
                  ? "h-full flex flex-col"
                  : ""
              }
            >
              <div
                className={cn(
                  "overflow-y-auto -mx-6 px-6 py-1",
                  extraActions[extraActionState.actionIndex].height
                    ? "flex-1"
                    : "max-h-[80vh]",
                )}
              >
                {typeof extraActions[extraActionState.actionIndex].component ===
                "function"
                  ? (
                      extraActions[extraActionState.actionIndex]
                        .component as (row: T, onClose: () => void) => ReactNode
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
                    : (extraActions[extraActionState.actionIndex].component as ReactNode)}
              </div>
            </DialogContent>
          </Dialog>
        )}
    </>
  );
}) as <T>(
  props: PaginationProps<T> & { ref?: Ref<PaginationHandle> },
) => ReactNode;

export default Pagination;
