import { Printer } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "cv" as const, label: "CV" },
  { id: "research" as const, label: "Research statement" },
  { id: "teaching" as const, label: "Teaching statement" },
] as const;

const TAB_PDF: Record<(typeof TABS)[number]["id"], string> = {
  cv: "/cv.pdf",
  research: "/research-statement.pdf",
  teaching: "/teaching-statement.pdf",
};

export function CvToolbar() {
  const [active, setActive] = React.useState<(typeof TABS)[number]["id"]>("cv");

  React.useEffect(() => {
    document.querySelectorAll<HTMLElement>(".cv-panel").forEach((el) => {
      const panel = el.dataset.panel;
      const isActive = panel === active;
      el.dataset.active = isActive ? "true" : "false";
      el.hidden = !isActive;
    });
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
