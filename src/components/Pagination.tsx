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
}

export interface PaginationHelpers<T> {
  reload: () => Promise<void>;
  setRows: (updater: T[] | ((prev: T[]) => T[])) => void;
}

export interface PaginationColumn<T> {
  header: string;
  strict?: boolean;
  align?: "left" | "center" | "right";
  sort?: boolean;
  search?: string;
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
  type: "text" | "email" | "number" | "password" | "select" | "textarea";
  options?: PaginationFieldOption[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

interface PaginationProps<T> {
  title: string;
  columns: PaginationColumn<T>[];
  module: string;
  fields?: PaginationField[];
  useIsActive?: boolean;
}

export interface PaginationHandle {
  reload: () => Promise<void>;
}

const Pagination = forwardRef(function PaginationInner<T>(
  { title, columns, module, fields, useIsActive }: PaginationProps<T>,
  ref: Ref<PaginationHandle>,
) {
  const { language } = useLanguageStore();
  const [rows, setRows] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Derived URLs from module
  const baseUrl = `/api/${module}`;
  const paginateUrl = `${baseUrl}/paginate`;
  const createUrl = `${baseUrl}/create`;
  const editUrl = (id: string | number) => `${baseUrl}/edit/${id}`;
  const removeUrl = (id: string | number) => `${baseUrl}/remove/${id}`;
  const setActiveUrl = (id: string | number) => `${baseUrl}/set-active/${id}`;

  // CRUD state
  const hasCrud = Boolean(fields && fields.length > 0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [deletingRow, setDeletingRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<string | number | null>(null);

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
      header: language({ id: "Aksi", en: "Action" }),
      strict: true,
      align: "left",
      render: (row) => (
        <div className="flex items-center gap-1">
          {useIsActive && (
            <Switch
              checked={getRowIsActive(row)}
              onCheckedChange={() => handleToggleActive(row)}
              disabled={togglingActiveId === getRowId(row)}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(row)}
          >
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
      ),
    };

    return [actionColumn, ...columns];
  }, [columns, hasCrud, fields, language, useIsActive, togglingActiveId]);

  const searchableFields = useMemo(() => {
    return mergedColumns
      .map((column) => column.search?.trim())
      .filter((field): field is string => Boolean(field));
  }, [mergedColumns]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const fetchRows = useCallback(
    async (
      page: number,
      q: string,
      l: number,
      sb: string | undefined,
      so: "ASC" | "DESC",
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
    [paginateUrl, searchableFields],
  );

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
    }
    fetchRows(currentPage, debouncedSearch, limit, sortBy, sortOrder);
  }, [currentPage, debouncedSearch, limit, sortBy, sortOrder, fetchRows]);

  useImperativeHandle(ref, () => ({
    reload: async () => {
      await fetchRows(currentPage, debouncedSearch, limit, sortBy, sortOrder);
    },
  }));

  // ─── CRUD helpers ─────────────────────────────────────────────────

  const initFormData = useCallback(
    (row?: T) => {
      if (!fields) return {};
      const data: Record<string, string> = {};
      for (const field of fields) {
        if (row && typeof row === "object" && row !== null) {
          const val = (row as Record<string, unknown>)[field.key];
          data[field.key] = val != null ? String(val) : "";
        } else {
          data[field.key] = field.type === "select" && field.options?.length
            ? field.options[0].value
            : "";
        }
      }
      return data;
    },
    [fields],
  );

  const openCreate = () => {
    setEditingRow(null);
    setFormData(initFormData());
    setDialogOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingRow(row);
    setFormData(initFormData(row));
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
      const val = formData[field.key] ?? "";
      if (field.required && !val.trim()) return false;
      if (field.minLength && val.length < field.minLength) return false;
      if (field.maxLength && val.length > field.maxLength) return false;
    }
    return true;
  }, [fields, formData]);

  const handleSave = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {};
      if (fields) {
        for (const field of fields) {
          payload[field.key] = (formData[field.key] ?? "").trim();
        }
      }

      if (editingRow) {
        await satellite.put(editUrl(getRowId(editingRow)), payload);
      } else {
        await satellite.post(createUrl, payload);
      }

      setDialogOpen(false);
      await fetchRows(currentPage, debouncedSearch, limit, sortBy, sortOrder);
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
      await fetchRows(currentPage, debouncedSearch, limit, sortBy, sortOrder);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Delete failed";
      alert(msg);
    } finally {
      setIsSubmitting(false);
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
        await fetchRows(currentPage, debouncedSearch, limit, sortBy, sortOrder);
      },
      setRows,
    }),
    [currentPage, debouncedSearch, fetchRows, limit, sortBy, sortOrder],
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
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-20"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {mergedColumns.map((column) => (
                  <TableHead
                    key={column.header}
                    className={`${getAlignClassName(column.align)} ${column.strict ? "w-px whitespace-nowrap" : ""} ${column.headerClassName ?? ""}`.trim()}
                  >
                    {column.sort && column.search ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === column.search) {
                            setSortOrder((prev) =>
                              prev === "ASC" ? "DESC" : "ASC",
                            );
                          } else {
                            setSortBy(column.search);
                            setSortOrder("ASC");
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
                          <HiOutlineChevronUp
                            size={14}
                            className={
                              sortBy === column.search
                                ? sortOrder === "ASC"
                                  ? ""
                                  : "rotate-180"
                                : "opacity-30"
                            }
                          />
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={mergedColumns.length}
                    className="py-8 text-center text-dark-400"
                  >
                    {isLoading
                      ? language({ id: "Memuat data...", en: "Loading data..." })
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
                          key={`${key}-${column.header}`}
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

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-dark-400">
              {language({ id: "Menampilkan", en: "Showing" })} {from} - {to}{" "}
              {language({ id: "dari", en: "of" })} {total}{" "}
              {language({ id: "data", en: "items" })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <HiOutlineChevronLeft size={14} />
              </Button>

              {paginationWindow[0] > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
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
              >
                <HiOutlineChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add / Edit Dialog ──────────────────────────────────────── */}
      {hasCrud && fields && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          width="520px"
        >
          <DialogContent onClose={() => setDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>
                {editingRow
                  ? language({ id: "Edit Data", en: "Edit Data" })
                  : language({ id: "Tambah Data", en: "Add Data" })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`field-${field.key}`} required={field.required}>
                    {field.label}
                  </Label>
                  {field.type === "select" ? (
                    <Select
                      id={`field-${field.key}`}
                      className="mt-1.5"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`field-${field.key}`}
                      className="mt-1.5 w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50 min-h-[80px] resize-y"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                    />
                  ) : (
                    <Input
                      id={`field-${field.key}`}
                      type={field.type}
                      className="mt-1.5"
                      value={formData[field.key] ?? ""}
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
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
    </>
  );
}) as <T>(
  props: PaginationProps<T> & { ref?: Ref<PaginationHandle> },
) => ReactNode;

export default Pagination;
