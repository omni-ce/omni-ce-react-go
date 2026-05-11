import { type ReactNode } from "react";

import { usePermission } from "@/hooks/usePermission";
import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
import RulePermissionPage from "@/pages/error/RulePermissionPage";

interface Props {
  ruleKey: string;
  children: ReactNode;
  title?: Record<LanguageCode, string>;
  subtitle?: Record<LanguageCode, string>;
  useHeader?: boolean;
}
export default function GuardLayout({
  ruleKey,
  children,
  title,
  subtitle,
  useHeader = true,
}: Props) {
  const perm = usePermission(ruleKey);
  const { language } = useLanguageStore();

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      {useHeader && title && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {language(title)}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-dark-400">{language(subtitle)}</p>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
