import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  onChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  const activeContent = items.find((i) => i.id === activeTab)?.content;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex border-b border-border/40 space-x-2 overflow-x-auto">
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 py-2.5 px-4 text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">{activeContent}</div>
    </div>
  );
};
