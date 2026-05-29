import { useState, useEffect } from "react";

const radiusOptions = [
  { label: "None", value: "0px" },
  { label: "Subtle", value: "0.25rem" },
  { label: "Small", value: "0.375rem" },
  { label: "Medium", value: "0.5rem" },
  { label: "Default", value: "0.625rem" },
  { label: "Large", value: "0.75rem" },
  { label: "XL", value: "1rem" },
  { label: "2XL", value: "1.25rem" },
  { label: "Full", value: "1.5rem" },
];

export function DevRadiusPicker() {
  const [selected, setSelected] = useState("0.625rem");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty("--radius", selected);
    return () => {
      document.documentElement.style.removeProperty("--radius");
    };
  }, [selected]);

  const currentLabel = radiusOptions.find((o) => o.value === selected)?.label ?? "";

  return (
    <div className="fixed bottom-4 left-52 z-[9999] rounded-lg border border-border bg-card p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {collapsed ? `◻ Radius: ${currentLabel}` : "✕"}
        </button>
        {!collapsed && (
          <span className="text-xs font-semibold text-foreground">
            Border radius
          </span>
        )}
      </div>
      {!collapsed && (
        <div className="mt-2 flex flex-col gap-1">
          {radiusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors ${
                selected === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span
                className="inline-block h-4 w-4 border-2 border-current"
                style={{ borderRadius: opt.value }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
