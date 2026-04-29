import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { removeUser, switchUserRole } from "@/services/user.service";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import type { User } from "@/types/user";
import Pagination, {
  type PaginationColumn,
  type PaginationHandle,
} from "@/components/Pagination";
import BlankUser from "@/assets/blank-user.svg";

interface UsersPageProps {}
export default function UsersPage({}: UsersPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paginationRef = useRef<PaginationHandle>(null);
  const { language } = useLanguageStore();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const openEdit = (user: User) => {
    setEditingUser(user);
    setPassword("");
    setConfirmPassword("");
    setDialogOpen(true);
  };

  const openDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    if (!password || password !== confirmPassword) return;

    setIsSubmitting(true);
    try {
      setDialogOpen(false);
      setConfirmPassword("");
      setPassword("");
      await paginationRef.current?.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = async (id: string) => {
    setIsSubmitting(true);
    try {
      const updated = (await switchUserRole(id)) as User;
      return updated;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    try {
      await removeUser(deletingUser.id as string);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      await paginationRef.current?.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<PaginationColumn<User>[]>(
    () => [
      {
        header: language({ id: "Aksi", en: "Action" }),
        strict: true,
        align: "right",
        render: (user) => {
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(user)}
              >
                <HiOutlinePencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDelete(user)}
                className="text-neon-red hover:bg-neon-red/10"
              >
                <HiOutlineTrash size={16} />
              </Button>
            </div>
          );
        },
      },
      {
        header: language({ id: "Peran", en: "Role" }),
        sort: true,
        search: "role",
        render: (user, _index, helpers) => {
          return (
            <button
              type="button"
              onClick={async () => {
                if (isSubmitting) {
                  return;
                }

                const updated = await toggleRole(user.id as string);
                if (!updated) {
                  return;
                }

                helpers.setRows((prev) =>
                  prev.map((u) =>
                    (u as User).id === user.id
                      ? { ...(u as User), ...updated }
                      : u,
                  ),
                );
              }}
              className="cursor-pointer"
              title={language({
                id: "Klik untuk ganti peran",
                en: "Click to switch role",
              })}
            >
              <Badge
                variant={
                  user.role?.toLowerCase() === "su" ? "default" : "secondary"
                }
              >
                {user.role?.toUpperCase()}
              </Badge>
            </button>
          );
        },
      },
      {
        header: language({ id: "Dibuat Pada", en: "Created At" }),
        sort: true,
        search: "created_at",
        render: (user) => formatDateTime(user.created_at),
      },
    ],
    [isSubmitting, language],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Pengguna", en: "Users" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua pengguna pada sistem",
              en: "Manage all users in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Pengguna", en: "User List" })}
        columns={columns}
        module="user"
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        width="560px"
      >
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {language({
                id: "Ubah Password Pengguna",
                en: "Change User Password",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">
                {language({ id: "Password Baru", en: "New Password" })}
              </Label>
              <Input
                id="new-password"
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language({
                  id: "Masukkan password baru",
                  en: "Enter new password",
                })}
              />
            </div>
            <div>
              <Label htmlFor="repeat-password">
                {language({ id: "Ulangi Password", en: "Repeat Password" })}
              </Label>
              <Input
                id="repeat-password"
                type="password"
                className="mt-1.5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language({
                  id: "Ulangi password baru",
                  en: "Repeat new password",
                })}
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-neon-red">
                {language({
                  id: "Password tidak sama",
                  en: "Passwords do not match",
                })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword
              }
            >
              {language({ id: "Simpan", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogContent onClose={() => setDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Hapus Pengguna", en: "Delete User" })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-dark-300">
            {language({
              id: "Apakah Anda yakin ingin menghapus pengguna",
              en: "Are you sure you want to delete user",
            })}{" "}
            <strong className="text-foreground">{deletingUser?.name}</strong>?
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
    </div>
  );
}
