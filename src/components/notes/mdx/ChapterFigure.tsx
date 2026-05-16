import Image from "next/image";

export function ChapterFigure({
  src,
  alt,
  caption,
  width = 1600,
  height = 900,
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-sm border border-rule bg-cream-elevated">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-[12.5px] leading-[1.65] text-ink-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
