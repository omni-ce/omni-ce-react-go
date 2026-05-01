import { create } from "zustand";

export interface Rule {
  id: number;
  role_id: number;
  key: string;
  action: string;
  state: boolean;
}

export interface RoleSelected {
  division_id: string;
  role_id: string;
}

interface RuleState {
  role_selected: RoleSelected | null;
  setRoleSelected: (role_selected: RoleSelected | null) => void;
  clearRoleSelected: () => void;
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
}

function loadRoleSelected(): RoleSelected | null {
  try {
    const raw = localStorage.getItem("role_selected");
    if (raw) return JSON.parse(raw) as RoleSelected;
  } catch {
    // ignore
  }
  return null;
}

export const useRuleStore = create<RuleState>()((set) => ({
  role_selected: loadRoleSelected(),
  setRoleSelected: (role_selected: RoleSelected | null) => {
    if (role_selected) {
      localStorage.setItem("role_selected", JSON.stringify(role_selected));
    } else {
      localStorage.removeItem("role_selected");
    }
    set({ role_selected });
  },
  clearRoleSelected: () => {
    localStorage.removeItem("role_selected");
    set({ role_selected: null });
  },
  rules: [],
  setRules: (rules: Rule[]) => set({ rules }),
}));
