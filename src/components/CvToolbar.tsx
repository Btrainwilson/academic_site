import { Printer } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "cv", label: "CV", panel: "cv", variant: "executive" },
  { id: "cv-academic", label: "Academic CV", panel: "cv", variant: "academic" },
  { id: "research", label: "Research statement", panel: "research" },
  { id: "teaching", label: "Teaching statement", panel: "teaching" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_PDF: Record<TabId, string> = {
  cv: "/cv.pdf",
  "cv-academic": "/cv-academic.pdf",
  research: "/research-statement.pdf",
  teaching: "/teaching-statement.pdf",
};

export function CvToolbar() {
  const [active, setActive] = React.useState<TabId>("cv");

  React.useEffect(() => {
    const tab = TABS.find((t) => t.id === active)!;
    document.querySelectorAll<HTMLElement>(".cv-panel").forEach((el) => {
      const isActive = el.dataset.panel === tab.panel;
      el.dataset.active = isActive ? "true" : "false";
      el.hidden = !isActive;
    });
    const cvPanel = document.querySelector<HTMLElement>('.cv-panel[data-panel="cv"]');
    if (cvPanel && "variant" in tab) {
      cvPanel.dataset.variant = tab.variant;
    }
  }, [active]);

  const print = () => {
    window.open(TAB_PDF[active], "_blank");
  };

  return (
    <div
      className="no-print cv-toolbar mb-8 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between"
      role="toolbar"
      aria-label="CV document sections"
    >
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Choose section">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            variant={active === tab.id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "rounded-md",
              active === tab.id && "ring-1 ring-border",
            )}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 gap-2"
        onClick={print}
        aria-label="Download PDF"
      >
        <Printer className="size-4" aria-hidden />
        Download PDF
      </Button>
    </div>
  );
}
