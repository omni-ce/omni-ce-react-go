import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRuleStore } from "@/stores/ruleStore";

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSet: boolean;
}

/**
 * Hook to check permissions for a given rule key.
 * - If `ruleKey` is not provided, all permissions are `true` (no restriction).
 * - If the user is "su", all permissions are `true`.
 * - Otherwise, checks the rules store for the selected role's permissions.
 */
export function usePermission(ruleKey?: string): Permission {
  const { user } = useAuthStore();
  const { role_selected, rules } = useRuleStore();

  return useMemo(() => {
    const allTrue: Permission = {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canSet: true,
    };

    // No ruleKey provided = unrestricted
    if (!ruleKey) return allTrue;

    // SU always has full access
    if (user?.role === "su") return allTrue;

    // No role selected = no access
    if (!role_selected) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canSet: false,
      };
    }

    const roleId = Number(role_selected.role_id);

    const check = (action: string): boolean =>
      rules.some(
        (r) =>
          r.role_id === roleId &&
          r.key === ruleKey &&
          r.action === action &&
          r.state,
      );

    return {
      canCreate: check("create"),
      canRead: check("read"),
      canUpdate: check("update"),
      canDelete: check("delete"),
      canSet: check("set"),
    };
  }, [ruleKey, user, role_selected, rules]);
}
