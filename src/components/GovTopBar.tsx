import { useState, useEffect } from "react";

export function GovTopBar() {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === 1) {
      root.style.fontSize = "110%";
    } else if (fontSizeLevel === -1) {
      root.style.fontSize = "92%";
    } else {
      root.style.fontSize = "";
    }
  }, [fontSizeLevel]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast-mode");
    } else {
      document.documentElement.classList.remove("high-contrast-mode");
    }
  }, [highContrast]);

  const handleSkipToContent = (e: React.MouseEvent) => {
    e.preventDefault();
    const main =
      document.getElementById("main-content") || document.querySelector("main");
    if (main) {
      main.tabIndex = -1;
      main.focus();
      main.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScreenReader = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(
      "This portal complies with Government of India Guidelines for Indian Government Websites (GIGW) and is accessible with standard screen readers including NVDA, JAWS, and Windows Narrator.",
    );
  };

  return (
    <div className="w-full bg-[#084d28] text-white text-[9.5px] sm:text-[10px] font-body antialiased border-b border-[#063f21] select-none z-50">
      <div className="mx-auto flex h-7 w-full max-w-7xl items-center justify-between px-3 sm:px-1 lg:px-1">
        <div className="font-medium tracking-tight text-white flex items-center gap-1.5">
          <span className="truncate">
            Government of National Capital Territory of Delhi
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 text-white/90 text-[8.5px] sm:text-[9.5px]">
          <button
            type="button"
            onClick={handleScreenReader}
            className="hover:text-white transition hidden sm:inline"
            title="Screen Reader Access information"
          >
            Screen Reader Access
          </button>

          <span className="text-white/25 hidden sm:inline">|</span>

          <a
            href="#main-content"
            onClick={handleSkipToContent}
            className="hover:text-white transition whitespace-nowrap"
          >
            Skip to Main Content
          </a>

          <span className="text-white/25">|</span>

          <button
            type="button"
            onClick={() => setHighContrast((v) => !v)}
            className={`border border-white/50 rounded px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-medium leading-tight transition ${
              highContrast
                ? "bg-white text-[#084d28] font-bold"
                : "hover:bg-white/10 text-white"
            }`}
            title="Toggle High Contrast Mode"
          >
            High Contrast
          </button>

          <span className="text-white/25">|</span>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setFontSizeLevel(1)}
              className={`rounded px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-bold leading-tight shadow-sm transition ${
                fontSizeLevel === 1
                  ? "bg-emerald-200 text-slate-900"
                  : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
              title="Increase font size (A+)"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLevel(0)}
              className={`rounded px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-bold leading-tight shadow-sm transition ${
                fontSizeLevel === 0
                  ? "bg-emerald-200 text-slate-900"
                  : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
              title="Reset font size (A)"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLevel(-1)}
              className={`rounded px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-bold leading-tight shadow-sm transition ${
                fontSizeLevel === -1
                  ? "bg-emerald-200 text-slate-900"
                  : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
              title="Decrease font size (A-)"
            >
              A-
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
