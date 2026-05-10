import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRuleStore } from "@/stores/ruleStore";

export interface Tab {
  key: string; // for ruleKey
  label: string;
  render: () => React.ReactNode;
}

interface Props {
  tabs: Tab[];
  useRule?: boolean;
}

export default function Tabs({ tabs, useRule }: Props) {
  const { user } = useAuthStore();
  const { role_selected, rules } = useRuleStore();

  const visibleTabs = tabs.filter((tab) => {
    if (!useRule) return true;
    if (user?.role === "su") return true;
    if (!role_selected) return false;

    const roleId = Number(role_selected.role_id);
    return rules.some(
      (r) =>
        r.role_id === roleId &&
        r.key === tab.key &&
        r.action === "read" &&
        r.state === true
    );
  });

  const [activeTab, setActiveTab] = useState<string | undefined>(
    visibleTabs[0]?.key
  );

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  if (visibleTabs.length === 0) {
    return null;
  }

  const activeContent = visibleTabs.find((t) => t.key === activeTab)?.render();

  return (
    <div className="flex flex-col space-y-6">
      <div className="border-b border-dark-600/60">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors outline-none focus:outline-none ${
                activeTab === tab.key
                  ? "border-accent-500 text-accent-500"
                  : "border-transparent text-dark-400 hover:text-foreground hover:border-dark-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="w-full">
        {activeContent}
      </div>
    </div>
  );
}
