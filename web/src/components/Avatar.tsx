export function Avatar({
  src,
  alt,
  size = 40,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs, no next/image domain config needed
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-500 dark:bg-zinc-800"
      style={{ width: size, height: size }}
    >
      {alt.charAt(0).toUpperCase()}
    </div>
  );
}
