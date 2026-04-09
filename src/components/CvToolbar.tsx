import { Printer } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "cv" as const, label: "CV" },
  { id: "research" as const, label: "Research statement" },
  { id: "teaching" as const, label: "Teaching statement" },
];

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
    // If we're on the CV tab, download the LaTeX PDF instead of browser printing
    if (active === "cv") {
      window.open("/cv.pdf", "_blank");
    } else {
      window.print();
    }
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
        aria-label={active === "cv" ? "Download PDF CV" : "Print or save as PDF"}
      >
        <Printer className="size-4" aria-hidden />
        {active === "cv" ? "Download PDF" : "Print / PDF"}
      </Button>
    </div>
  );
}
