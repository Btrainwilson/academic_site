import type { LandingCollaborator } from "@/types/data";

function LogoTile({ c }: { c: LandingCollaborator }) {
  const img = (
    <img
      src={c.logo}
      alt={c.name}
      className="h-14 w-auto max-w-[180px] object-contain opacity-90 transition-opacity hover:opacity-100 dark:brightness-95"
      loading="lazy"
      decoding="async"
    />
  );
  return (
    <div className="flex shrink-0 items-center justify-center">
      {c.href ? (
        <a
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

export function CollaboratorCarousel({ items }: { items: LandingCollaborator[] }) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden py-4" role="region" aria-label="Affiliation logos">
      <div className="collaborator-marquee-track">
        {loop.map((c, i) => (
          <LogoTile key={`${c.name}-${i}`} c={c} />
        ))}
      </div>
    </div>
  );
}
