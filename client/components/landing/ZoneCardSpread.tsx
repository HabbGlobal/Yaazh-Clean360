import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

export type ZoneSpreadItem = {
  zone: string;
  lorry: string;
  image: StaticImageData;
  accent: "purple" | "yellow" | "pink" | "mint";
};

export default function ZoneCardSpread({ zones }: { zones: ZoneSpreadItem[] }) {
  return (
    <div className="np-zone-spread-wrap">
      <div className="np-zone-spread" aria-label="Yaazh Clean360 collection zones">
        {zones.map((zone, index) => (
          <article
            className={`np-spread-card np-accent--${zone.accent}`}
            style={{ "--card-index": index } as CSSProperties}
            key={zone.zone}
          >
            <div className="np-spread-card__image">
              <Image src={zone.image} alt={`${zone.zone} collection map`} sizes="(max-width: 780px) 82vw, 380px" />
            </div>
            <div className="np-spread-card__body">
              <span>{zone.zone}</span>
              <strong>{zone.lorry}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="np-zone-spread-panel">
        <p className="np-sticker np-sticker--yellow">Hover the deck</p>
        <h3>Five zones. One clean selection flow.</h3>
        <p>
          The maps stay compact on the landing page, then spread open so residents can quickly compare their zone and assigned lorry.
        </p>
        <Link className="np-text-link" href="/signup">Select my zone &gt;</Link>
      </div>
    </div>
  );
}
