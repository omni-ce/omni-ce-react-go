import { Fragment } from "react/jsx-runtime";
import { useThemeStore } from "@/stores/themeStore";
import { useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "./ui/IconSelector";
import LanguageSelector from "./ui/LanguageSelector";

export default function ControlButton() {
  const { language } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <Fragment>
      {/* Language toggle */}
      <LanguageSelector />

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-dark-400 hover:text-foreground hover:bg-dark-800 transition-all"
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
