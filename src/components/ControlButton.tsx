import { Fragment } from "react/jsx-runtime";
import { useLanguageStore } from "@/stores/languageStore";
import { useThemeStore } from "@/stores/themeStore";
import { IconComponent } from "./ui/IconSelector";

export default function ControlButton() {
  const { languageCode, toggleLanguage, language } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <Fragment>
      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-dark-300 hover:text-foreground hover:bg-dark-700/50 rounded-lg transition-all"
        title={language({
          id: "Ganti bahasa",
          en: "Switch language",
        })}
      >
        <IconComponent iconName="Ri/RiTranslate2" className="w-3.5 h-3.5" />
        <span className="uppercase">{languageCode}</span>
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-all"
        title={
          isDarkMode
            ? language({ id: "Mode terang", en: "Switch to light mode" })
            : language({ id: "Mode gelap", en: "Switch to dark mode" })
        }
      >
        {isDarkMode ? (
          <IconComponent iconName="Ri/RiSunLine" className="w-4 h-4" />
        ) : (
          <IconComponent iconName="Ri/RiMoonLine" className="w-4 h-4" />
        )}
      </button>
    </Fragment>
  );
}
