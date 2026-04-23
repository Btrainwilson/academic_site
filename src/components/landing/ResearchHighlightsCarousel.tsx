import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { ResearchHighlight } from "@/types/data";

interface Props {
  highlights: ResearchHighlight[];
  /** Map from researchDirectionId → direction title */
  directionTitles: Record<string, string>;
}

function DotIndicators() {
  const { api } = useCarousel();
  const [selected, setSelected] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  if (count <= 1) return null;

  return (
    <div className="flex justify-center gap-1.5 pt-4" role="tablist" aria-label="Slide indicators">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === selected}
          aria-label={`Go to slide ${i + 1}`}
          className={cn(
            "size-2 rounded-full transition-colors",
            i === selected ? "bg-primary" : "bg-foreground/20",
          )}
          onClick={() => api?.scrollTo(i)}
        />
      ))}
    </div>
  );
}

function SlideMetadata({
  h,
  directionTitles,
  className,
}: {
  h: ResearchHighlight;
  directionTitles: Record<string, string>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-foreground text-sm font-medium leading-snug group-hover:underline">
        {h.title}
      </p>
      {h.description && (
        <p className="text-muted-foreground text-sm leading-relaxed">{h.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{h.venue}</span>
        {directionTitles[h.researchDirectionId] && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex h-5 items-center rounded-full bg-secondary px-2 font-medium text-secondary-foreground">
              {directionTitles[h.researchDirectionId]}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function FigureImages({
  figures,
  caption,
}: {
  figures: string[];
  caption: string;
}) {
  if (figures.length === 1) {
    return (
      <img
        src={figures[0]}
        alt={caption}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <div
      className={cn(
        "grid h-full gap-1",
        figures.length === 2 && "grid-cols-2",
        figures.length >= 3 && "grid-cols-3",
      )}
    >
      {figures.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${caption} (${i + 1} of ${figures.length})`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ))}
    </div>
  );
}

function SlideLink({
  h,
  children,
  className,
}: {
  h: ResearchHighlight;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={h.url ?? `/research/${h.researchDirectionId}`}
      target={h.url ? "_blank" : undefined}
      rel={h.url ? "noopener noreferrer" : undefined}
      className={cn("group block", className)}
    >
      {children}
    </a>
  );
}

function FigureSlide({
  h,
  directionTitles,
}: {
  h: ResearchHighlight;
  directionTitles: Record<string, string>;
}) {
  const figures = Array.isArray(h.figure) ? h.figure : [h.figure];

  return (
    <SlideLink h={h}>
      <div className="h-64 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 md:h-80">
        <FigureImages figures={figures} caption={h.caption} />
      </div>
      <SlideMetadata h={h} directionTitles={directionTitles} className="mt-3" />
    </SlideLink>
  );
}

function HeroSlide({
  h,
  directionTitles,
}: {
  h: ResearchHighlight;
  directionTitles: Record<string, string>;
}) {
  const figures = Array.isArray(h.figure) ? h.figure : [h.figure];

  return (
    <SlideLink h={h}>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 md:h-80 md:w-3/5">
          {figures.length === 1 ? (
            <img
              src={figures[0]}
              alt={h.caption}
              loading="lazy"
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className={cn(
              "flex h-full items-center justify-center gap-1",
            )}>
              {figures.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${h.caption} (${i + 1} of ${figures.length})`}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center md:w-2/5">
          <SlideMetadata h={h} directionTitles={directionTitles} />
        </div>
      </div>
    </SlideLink>
  );
}

export function ResearchHighlightsCarousel({ highlights, directionTitles }: Props) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  if (highlights.length === 0) return null;

  return (
    <Carousel
      opts={{ loop: true, align: "center" }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent>
        {highlights.map((h) => (
          <CarouselItem key={h.id}>
            {h.layout === "hero" ? (
              <HeroSlide h={h} directionTitles={directionTitles} />
            ) : (
              <FigureSlide h={h} directionTitles={directionTitles} />
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        className="left-2 top-[calc(50%-2rem)] bg-background/80 backdrop-blur-sm"
      />
      <CarouselNext
        className="right-2 top-[calc(50%-2rem)] bg-background/80 backdrop-blur-sm"
      />

      <DotIndicators />
    </Carousel>
  );
}
