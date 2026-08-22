"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
  fullWidth?: boolean;
}

export default function Tabs({
  tabs,
  activeTabId,
  onChange,
  className = "",
  fullWidth = false,
}: TabsProps){
  return (
    <div
      className={["flex border-b border-outline-variant overflow-x-auto hide-scrollbar", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "relative px-4 py-3 font-label-md transition-colors whitespace-nowrap",
              fullWidth ? "flex-1 text-center" : "",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={[
"ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-label-xs",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant",
                ].join(" ")}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
