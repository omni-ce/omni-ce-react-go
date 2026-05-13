import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import type { Rule } from "@/types/rule";
import { sidebarSystemLinks } from "@/routers";
import sidebarLinks from "@/sidebar";
import {
  roleService,
  type RoleItem,
  type DivisionGroup,
} from "@/services/role.service";
import { IconComponent } from "@/components/ui/IconSelector";
import { cn } from "@/lib/utils";

interface Props {
  ruleKey?: string;
}
export default function RolePage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const { languageCode, language } = useLanguageStore();
  const [divisions, setDivisions] = useState<DivisionGroup[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [originalRules, setOriginalRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [openDivisions, setOpenDivisions] = useState<Set<number>>(new Set());
  const [openRoles, setOpenRoles] = useState<Set<number>>(new Set());
  const initialLoad = useRef(true);

  // Division dialog
  const [divDialogOpen, setDivDialogOpen] = useState(false);
  const [divEditId, setDivEditId] = useState<number | null>(null);
  const [divForm, setDivForm] = useState({ name: "", description: "" });
  const [divSubmitting, setDivSubmitting] = useState(false);

  // Role dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleEditId, setRoleEditId] = useState<number | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [roleDivId, setRoleDivId] = useState<number | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "division" | "role";
    id: number;
    name: string;
  } | null>(null);

  const getErrorMessage = (e: unknown) => {
    const err = e as { response?: { data?: { message?: string } } };
    return err.response?.data?.message ?? "Failed";
  };

  const ACTIONS = useMemo<
    {
      key: string;
      label: string;
    }[]
  >(
    () => [
      {
        key: "create",
        label: language({
          id: "Tambah",
          en: "create",
        }),
      },
      {
        key: "read",
        label: language({
          id: "Baca",
          en: "read",
        }),
      },
      {
        key: "update",
        label: language({
          id: "Edit",
          en: "update",
        }),
      },
      {
        key: "delete",
        label: language({
          id: "Hapus",
          en: "delete",
        }),
      },
      {
        key: "set",
        label: language({
          id: "Ubah",
          en: "set",
        }),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  interface MenuListItem {
    key: string;
    label: string;
    level: number;
    isHeader?: boolean;
    extraRuleKeys?: { key: string; label: string; level: number }[];
  }

  const menuList = useMemo(() => {
    const flatten = (
      links: typeof sidebarSystemLinks,
      level = 0,
      base = "",
    ): MenuListItem[] => {
      return links.flatMap((link) => {
        if (link.isHide) return [];
        const items: MenuListItem[] = [];
        const fullPath = base ? `${base}/${link.path}` : (link.path ?? "");

        const hasStrictChildren = (l: typeof link): boolean => {
          if (l.strict) return true;
          if (l.children) return l.children.some(hasStrictChildren);
          return false;
        };

        const hasStrictChild = link.children?.some(hasStrictChildren);

        if (link.strict === true && fullPath) {
          items.push({
            key: fullPath,
            label: language(link.label),
            level,
            extraRuleKeys: link.extraRuleKeys?.map((extra) => ({
              key: extra.ruleKey,
              label: language(extra.label),
              level: level + 1,
            })),
          });
        } else if (hasStrictChild) {
          items.push({
            key: `header-${fullPath}`,
            label: language(link.label),
            level,
            isHeader: true,
          });
        }

        if (link.children) {
          items.push(...flatten(link.children, level + 1, fullPath));
        }

        return items;
      });
    };

    return flatten([...sidebarSystemLinks, ...sidebarLinks]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode, language]);

  const allMenuKeys = useMemo(() => {
    const keys: { key: string; label: string }[] = [];
    for (const menu of menuList) {
      if (menu.isHeader) continue;
      keys.push({ key: menu.key, label: menu.label });
      if (menu.extraRuleKeys) {
        for (const extra of menu.extraRuleKeys) {
          keys.push({ key: extra.key, label: extra.label });
        }
      }
    }
    return keys;
  }, [menuList]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, rulesRes] = await Promise.all([
        roleService.getAll(),
        roleService.getRules(),
      ]);
      const divs = rolesRes.data.divisions;
      const fetchedRules = rulesRes.data.rows;
      setDivisions(divs);
      setRules(fetchedRules);
      setOriginalRules(fetchedRules);

      if (initialLoad.current) {
        // Keep divisions open but hide role permissions by default to avoid clutter
        setOpenDivisions(new Set(divs.map((d) => d.id)));
        setOpenRoles(new Set());
        initialLoad.current = false;
      }
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (perm.canRead) fetchData();
  }, [perm, fetchData]);

  const getRuleState = useCallback(
    (roleId: number, menuKey: string, action: string): boolean => {
      const r = rules.find(
        (x) => x.role_id === roleId && x.key === menuKey && x.action === action,
      );
      return r ? r.state : false;
    },
    [rules],
  );

  // Local-only toggle (no API call)
  const toggleRule = (roleId: number, menuKey: string, action: string) => {
    setRules((prev) => {
      const idx = prev.findIndex(
        (r) => r.role_id === roleId && r.key === menuKey && r.action === action,
      );
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = { ...u[idx], state: !u[idx].state };
        return u;
      }
      return [
        ...prev,
        { id: 0, role_id: roleId, key: menuKey, action, state: true },
      ];
    });
  };

  const toggleRow = (roleId: number, menuKey: string) => {
    const allOn = ACTIONS.every((a) => getRuleState(roleId, menuKey, a.key));
    const s = !allOn;
    setRules((prev) => {
      const u = [...prev];
      for (const act of ACTIONS) {
        const idx = u.findIndex(
          (r) =>
            r.role_id === roleId && r.key === menuKey && r.action === act.key,
        );
        if (idx >= 0) u[idx] = { ...u[idx], state: s };
        else
          u.push({
            id: 0,
            role_id: roleId,
            key: menuKey,
            action: act.key,
            state: s,
          });
      }
      return u;
    });
  };

  const toggleCol = (roleId: number, action: string) => {
    const allOn = allMenuKeys.every((m) => getRuleState(roleId, m.key, action));
    const s = !allOn;
    setRules((prev) => {
      const u = [...prev];
      for (const menu of allMenuKeys) {
        const idx = u.findIndex(
          (r) =>
            r.role_id === roleId && r.key === menu.key && r.action === action,
        );
        if (idx >= 0) u[idx] = { ...u[idx], state: s };
        else
          u.push({ id: 0, role_id: roleId, key: menu.key, action, state: s });
      }
      return u;
    });
  };

  // Check if rules have changed
  const hasChanges = useMemo(() => {
    const allRoleIds = new Set<number>();
    divisions.forEach((d) => d.roles.forEach((r) => allRoleIds.add(r.id)));
    for (const roleId of allRoleIds) {
      for (const menu of allMenuKeys) {
        for (const act of ACTIONS) {
          const cur = rules.find(
            (r) =>
              r.role_id === roleId &&
              r.key === menu.key &&
              r.action === act.key,
          );
          const orig = originalRules.find(
            (r) =>
              r.role_id === roleId &&
              r.key === menu.key &&
              r.action === act.key,
          );
          const curState = cur ? cur.state : false;
          const origState = orig ? orig.state : false;
          if (curState !== origState) return true;
        }
      }
    }
    return false;
  }, [rules, originalRules, divisions, allMenuKeys, ACTIONS]);

  // Save all rules
  const handleSave = async () => {
    const allRoleIds: number[] = [];
    divisions.forEach((d) => d.roles.forEach((r) => allRoleIds.push(r.id)));

    const data: {
      role_id: number;
      key: string;
      action: string;
      state: boolean;
    }[] = [];
    for (const roleId of allRoleIds) {
      for (const menu of allMenuKeys) {
        for (const act of ACTIONS) {
          data.push({
            role_id: roleId,
            key: menu.key,
            action: act.key,
            state: getRuleState(roleId, menu.key, act.key),
          });
        }
      }
    }
    setIsSaving(true);
    try {
      await roleService.setRules(data);
      await fetchData();
    } catch {
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Division CRUD
  const openDivCreate = () => {
    setDivEditId(null);
    setDivForm({ name: "", description: "" });
    setDivDialogOpen(true);
  };
  const openDivEdit = (d: DivisionGroup) => {
    setDivEditId(d.id);
    setDivForm({ name: d.name, description: d.description });
    setDivDialogOpen(true);
  };
  const handleDivSubmit = async () => {
    if (!divForm.name.trim()) return;
    setDivSubmitting(true);
    try {
      const payload = {
        name: divForm.name.trim(),
        description: divForm.description.trim(),
      };
      if (divEditId) await roleService.divisionUpdate(divEditId, payload);
      else await roleService.divisionCreate(payload);
      setDivDialogOpen(false);
      await fetchData();
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    } finally {
      setDivSubmitting(false);
    }
  };
  const handleDivToggle = async (id: number) => {
    try {
      await roleService.divisionSetActive(id);
      await fetchData();
    } catch {
      /* */
    }
  };
  const handleDivDelete = async (id: number) => {
    try {
      await roleService.divisionDelete(id);
      await fetchData();
    } catch {
      /* */
    }
  };

  // Role CRUD
  const openRoleCreate = (divId: number) => {
    setRoleEditId(null);
    setRoleDivId(divId);
    setRoleForm({ name: "", description: "" });
    setRoleDialogOpen(true);
  };
  const openRoleEdit = (r: RoleItem) => {
    setRoleEditId(r.id);
    setRoleForm({ name: r.name, description: r.description });
    setRoleDialogOpen(true);
  };
  const handleRoleSubmit = async () => {
    if (!roleForm.name.trim()) return;
    setRoleSubmitting(true);
    try {
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
      };
      if (roleEditId) await roleService.update(roleEditId, payload);
      else
        await roleService.create({
          role_division_id: roleDivId ?? 0,
          ...payload,
        });
      setRoleDialogOpen(false);
      await fetchData();
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    } finally {
      setRoleSubmitting(false);
    }
  };
  const handleRoleToggle = async (id: number) => {
    try {
      await roleService.setActive(id);
      await fetchData();
    } catch {
      /* */
    }
  };
  const handleRoleDelete = async (id: number) => {
    try {
      await roleService.delete(id);
      await fetchData();
    } catch {
      /* */
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "division") handleDivDelete(deleteTarget.id);
    else handleRoleDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toggleDivision = (id: number) =>
    setOpenDivisions((p) => {
      const n = new Set(p);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleRoleAccordion = (id: number) =>
    setOpenRoles((p) => {
      const n = new Set(p);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  if (!perm.canRead) return <RulePermissionPage />;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Peran & Hak Akses", en: "Roles & Permissions" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola peran dan hak akses menu pada sistem",
              en: "Manage roles and menu permissions in the system",
            })}
          </p>
        </div>
        {perm.canCreate && (
          <Button onClick={openDivCreate} className="gap-2">
            <IconComponent iconName="Hi2/HiOutlinePlus" size={16} />
            {language({ id: "Tambah Divisi", en: "Add Division" })}
          </Button>
        )}
      </div>

      {/* Divisions */}
      <div className="space-y-4">
        {divisions.map((division) => (
          <Card key={division.id}>
            <CardHeader
              className="cursor-pointer select-none hover:bg-dark-800 transition-colors"
              onClick={() => toggleDivision(division.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-dark-400">
                    {openDivisions.has(division.id) ? (
                      <IconComponent iconName="Hi2/HiChevronDown" size={18} />
                    ) : (
                      <IconComponent iconName="Hi2/HiChevronRight" size={18} />
                    )}
                  </span>
                  <div>
                    <CardTitle className="text-base">{division.name}</CardTitle>
                    {division.description && (
                      <p className="text-xs text-dark-400 mt-0.5">
                        {division.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle active */}
                  {perm.canSet && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDivToggle(division.id);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${division.is_active ? "bg-accent-500" : "bg-dark-600"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${division.is_active ? "translate-x-4.5" : "translate-x-0.75"}`}
                      />
                    </button>
                  )}
                  {/* Edit */}
                  {perm.canUpdate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDivEdit(division);
                      }}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-accent-500 hover:bg-dark-800 transition-all"
                    >
                      <IconComponent
                        iconName="Hi2/HiOutlinePencilSquare"
                        size={15}
                      />
                    </button>
                  )}
                  {/* Delete */}
                  {perm.canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          type: "division",
                          id: division.id,
                          name: division.name,
                        });
                      }}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-all"
                    >
                      <IconComponent iconName="Hi2/HiOutlineTrash" size={15} />
                    </button>
                  )}
                  <Badge variant="outline">
                    {division.roles.length}{" "}
                    {language({ id: "peran", en: "roles" })}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {openDivisions.has(division.id) && (
              <CardContent className="space-y-3 pt-2">
                {perm.canCreate && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRoleCreate(division.id);
                      }}
                    >
                      <IconComponent iconName="Hi2/HiOutlinePlus" size={14} />
                      {language({ id: "Tambah Peran", en: "Add Role" })}
                    </Button>
                  </div>
                )}

                {division.roles.length === 0 ? (
                  <p className="text-sm text-dark-400 text-center py-4">
                    {language({
                      id: "Tidak ada peran dalam divisi ini",
                      en: "No roles in this division",
                    })}
                  </p>
                ) : (
                  division.roles.map((role) => (
                    <div
                      key={role.id}
                      className="border border-dark-600/40 rounded-xl overflow-hidden"
                    >
                      {/* Role Header */}
                      <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-dark-800 transition-colors", `role-item-${role.name.replace(/\s+/g, "-")}`)}>
                        <button
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          onClick={() => toggleRoleAccordion(role.id)}
                        >
                          <span className="text-dark-400">
                            {openRoles.has(role.id) ? (
                              <IconComponent
                                iconName="Hi2/HiChevronDown"
                                size={16}
                              />
                            ) : (
                              <IconComponent
                                iconName="Hi2/HiChevronRight"
                                size={16}
                              />
                            )}
                          </span>
                          <span className="font-medium text-sm text-foreground truncate">
                            {role.name}
                          </span>
                          {role.description && (
                            <span className="text-xs text-dark-400 truncate hidden sm:inline">
                              — {role.description}
                            </span>
                          )}
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          {perm.canSet && (
                            <button
                              onClick={() => handleRoleToggle(role.id)}
                              disabled={!division.is_active || !perm.canSet}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${role.is_active ? "bg-accent-500" : "bg-dark-600"} disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${role.is_active ? "translate-x-4.5" : "translate-x-0.75"}`}
                              />
                            </button>
                          )}
                          {perm.canUpdate && (
                            <button
                              onClick={() => openRoleEdit(role)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-accent-500 hover:bg-dark-800 transition-all"
                            >
                              <IconComponent
                                iconName="Hi2/HiOutlinePencilSquare"
                                size={15}
                              />
                            </button>
                          )}
                          {perm.canDelete && (
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "role",
                                  id: role.id,
                                  name: role.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-all"
                            >
                              <IconComponent
                                iconName="Hi2/HiOutlineTrash"
                                size={15}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Permission Grid */}
                      {openRoles.has(role.id) && (
                        <div className="border-t border-dark-600/40 px-4 py-3">
                          <div className="overflow-x-auto">
                            <div
                              className="grid gap-2 min-w-150 items-center mb-2"
                              style={{
                                gridTemplateColumns:
                                  "minmax(140px, 1fr) repeat(5, 80px)",
                              }}
                            >
                              <div className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider px-2">
                                {language({ id: "Menu", en: "Menu" })}
                              </div>
                              {ACTIONS.map((act) => {
                                const allOn = allMenuKeys.every((m) =>
                                  getRuleState(role.id, m.key, act.key),
                                );
                                return (
                                  <div
                                    key={act.key}
                                    className="flex flex-col items-center gap-1"
                                  >
                                    <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">
                                      {act.label}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={allOn}
                                      onChange={() =>
                                        toggleCol(role.id, act.key)
                                      }
                                      disabled={
                                        !role.is_active ||
                                        !division.is_active ||
                                        !perm.canSet
                                      }
                                      className="w-3.5 h-3.5 rounded border-dark-500 text-accent-500 focus:ring-accent-500/30 focus:ring-offset-0 bg-dark-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            {menuList.map((menu) => {
                              if (menu.isHeader) {
                                return (
                                  <React.Fragment key={menu.key}>
                                    <div
                                      className={cn(
                                        "grid gap-2 min-w-150 items-center py-1.5 border-t border-dark-600/20 bg-dark-800",
                                        `sidebar-menu-${menu.key.replace(/^header-/, "").replace(/\//g, "-")}`,
                                      )}
                                      style={{
                                        gridTemplateColumns:
                                          "minmax(140px, 1fr) repeat(5, 80px)",
                                      }}
                                    >
                                      <div
                                        className="flex items-center gap-2 px-2"
                                        style={{
                                          paddingLeft: `${menu.level * 24 + 8}px`,
                                        }}
                                      >
                                        <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">
                                          {menu.label}
                                        </span>
                                      </div>
                                      {/* Empty columns for actions on header */}
                                      {ACTIONS.map((act) => (
                                        <div key={act.key} />
                                      ))}
                                    </div>
                                  </React.Fragment>
                                );
                              }

                              const allOn = ACTIONS.every((a) =>
                                getRuleState(role.id, menu.key, a.key),
                              );
                              return (
                                <React.Fragment key={menu.key}>
                                  <div
                                    className={cn(
                                      "grid gap-2 min-w-150 items-center py-1.5 border-t border-dark-600/20 hover:bg-dark-700/20 rounded transition-colors",
                                      `sidebar-menu-${menu.key.replace(/\//g, "-")}`,
                                    )}
                                    style={{
                                      gridTemplateColumns:
                                        "minmax(140px, 1fr) repeat(5, 80px)",
                                    }}
                                  >
                                    <div
                                      className="flex items-center gap-2 px-2"
                                      style={{
                                        paddingLeft: `${menu.level * 24 + 8}px`,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={allOn}
                                        onChange={() =>
                                          toggleRow(role.id, menu.key)
                                        }
                                        disabled={
                                          !role.is_active ||
                                          !division.is_active ||
                                          !perm.canSet
                                        }
                                        className="w-3.5 h-3.5 rounded border-dark-500 text-accent-500 focus:ring-accent-500/30 focus:ring-offset-0 bg-dark-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                      />
                                      <span className="text-sm text-foreground font-medium">
                                        {menu.level > 0
                                          ? `└ ${menu.label}`
                                          : menu.label}
                                      </span>
                                    </div>
                                    {ACTIONS.map((act) => (
                                      <div
                                        key={act.key}
                                        className="flex justify-center"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={getRuleState(
                                            role.id,
                                            menu.key,
                                            act.key,
                                          )}
                                          onChange={() =>
                                            toggleRule(
                                              role.id,
                                              menu.key,
                                              act.key,
                                            )
                                          }
                                          disabled={
                                            !role.is_active ||
                                            !division.is_active ||
                                            !perm.canSet
                                          }
                                          className="w-4 h-4 rounded border-dark-500 text-accent-500 focus:ring-accent-500/30 focus:ring-offset-0 bg-dark-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  {/* Render Extra Rule Keys */}
                                  {menu.extraRuleKeys?.map((extra) => {
                                    const extraAllOn = ACTIONS.every((a) =>
                                      getRuleState(role.id, extra.key, a.key),
                                    );
                                    return (
                                      <div
                                        key={extra.key}
                                        className="grid gap-2 min-w-150 items-center py-1.5 border-t border-dark-600/10 hover:bg-dark-700/10 rounded transition-colors"
                                        style={{
                                          gridTemplateColumns:
                                            "minmax(140px, 1fr) repeat(5, 80px)",
                                        }}
                                      >
                                        <div
                                          className="flex items-center gap-2 px-2"
                                          style={{
                                            paddingLeft: `${extra.level * 24 + 8}px`,
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={extraAllOn}
                                            onChange={() =>
                                              toggleRow(role.id, extra.key)
                                            }
                                            disabled={
                                              !role.is_active ||
                                              !division.is_active ||
                                              !perm.canSet
                                            }
                                            className="w-3.5 h-3.5 rounded border-dark-500 text-accent-500 focus:ring-accent-500/30 focus:ring-offset-0 bg-dark-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                          />
                                          <span className="text-sm text-dark-400 font-medium">
                                            └ {extra.label}
                                          </span>
                                        </div>
                                        {ACTIONS.map((act) => (
                                          <div
                                            key={act.key}
                                            className="flex justify-center"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={getRuleState(
                                                role.id,
                                                extra.key,
                                                act.key,
                                              )}
                                              onChange={() =>
                                                toggleRule(
                                                  role.id,
                                                  extra.key,
                                                  act.key,
                                                )
                                              }
                                              disabled={
                                                !role.is_active ||
                                                !division.is_active ||
                                                !perm.canSet
                                              }
                                              className="w-4 h-4 rounded border-dark-500 text-accent-500 focus:ring-accent-500/30 focus:ring-offset-0 bg-dark-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {divisions.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-dark-400 text-center py-8">
                {language({
                  id: "Tidak ada divisi ditemukan",
                  en: "No divisions found",
                })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      {hasChanges && perm.canSet && (
        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 shadow-lg shadow-accent-500/20"
          >
            {isSaving
              ? language({ id: "Menyimpan...", en: "Saving..." })
              : language({ id: "Simpan Perubahan", en: "Save Changes" })}
          </Button>
        </div>
      )}

      {/* Division Dialog */}
      <Dialog
        open={divDialogOpen}
        onClose={() => {
          // skip ...
        }}
      >
        <DialogContent onClose={() => setDivDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {divEditId
                ? language({ id: "Edit Divisi", en: "Edit Division" })
                : language({ id: "Tambah Divisi", en: "Add Division" })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {language({ id: "Nama Divisi", en: "Division Name" })}
              </Label>
              <Input
                value={divForm.name}
                onChange={(e) =>
                  setDivForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={language({
                  id: "Masukkan nama divisi",
                  en: "Enter division name",
                })}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>{language({ id: "Deskripsi", en: "Description" })}</Label>
              <Input
                value={divForm.description}
                onChange={(e) =>
                  setDivForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder={language({
                  id: "Masukkan deskripsi (opsional)",
                  en: "Enter description (optional)",
                })}
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDivDialogOpen(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button
              onClick={handleDivSubmit}
              disabled={!divForm.name.trim() || divSubmitting}
            >
              {divSubmitting
                ? language({ id: "Menyimpan...", en: "Saving..." })
                : language({ id: "Simpan", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => {
          // skip ...
        }}
      >
        <DialogContent onClose={() => setRoleDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {roleEditId
                ? language({ id: "Edit Peran", en: "Edit Role" })
                : language({ id: "Tambah Peran", en: "Add Role" })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language({ id: "Nama Peran", en: "Role Name" })}</Label>
              <Input
                value={roleForm.name}
                onChange={(e) =>
                  setRoleForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={language({
                  id: "Masukkan nama peran",
                  en: "Enter role name",
                })}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>{language({ id: "Deskripsi", en: "Description" })}</Label>
              <Input
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder={language({
                  id: "Masukkan deskripsi (opsional)",
                  en: "Enter description (optional)",
                })}
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button
              onClick={handleRoleSubmit}
              disabled={!roleForm.name.trim() || roleSubmitting}
            >
              {roleSubmitting
                ? language({ id: "Menyimpan...", en: "Saving..." })
                : language({ id: "Simpan", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogContent onClose={() => setDeleteTarget(null)}>
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Konfirmasi Hapus", en: "Confirm Delete" })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-dark-300">
            {language({
              id: `Yakin ingin menghapus "${deleteTarget?.name}"? Semua data terkait akan ikut terhapus.`,
              en: `Are you sure you want to delete "${deleteTarget?.name}"? All related data will be removed.`,
            })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {language({ id: "Hapus", en: "Delete" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
