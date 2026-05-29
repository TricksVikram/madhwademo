import { useState, useEffect } from "react";

const fonts = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "DM Sans", value: "'DM Sans', sans-serif" },
  { name: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { name: "Outfit", value: "'Outfit', sans-serif" },
  { name: "Manrope", value: "'Manrope', sans-serif" },
  { name: "Satoshi (Instrument Sans)", value: "'Instrument Sans', sans-serif" },
  { name: "Figtree", value: "'Figtree', sans-serif" },
  { name: "Geist (Source Sans 3)", value: "'Source Sans 3', sans-serif" },
];

const googleFontsUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap";

export function DevFontPicker() {
  const [selected, setSelected] = useState("Plus Jakarta Sans");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = googleFontsUrl;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const font = fonts.find((f) => f.name === selected);
    if (font) {
      document.documentElement.style.fontFamily = font.value;
    }
    return () => {
      document.documentElement.style.fontFamily = "";
    };
  }, [selected]);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] rounded-lg border border-border bg-card p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {collapsed ? "🔤 Font picker" : "✕"}
        </button>
        {!collapsed && (
          <span className="text-xs font-semibold text-foreground">
            Dev font picker
          </span>
        )}
      </div>
      {!collapsed && (
        <div className="mt-2 flex flex-col gap-1">
          {fonts.map((font) => (
            <button
              key={font.name}
              onClick={() => setSelected(font.name)}
              className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                selected === font.name
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
