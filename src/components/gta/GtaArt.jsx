import { getImageProps } from "next/image";
import { cn } from "../../lib/cn";

/**
 * Illustration en deux formats (lib/gtaImages.js) : `mobile` sous `breakpoint` px, `desktop` au-dessus. Remplit son
 * parent (positionné), comme une Image `fill` ; le navigateur ne charge que le format affiché.
 */
export function GtaArt({ mobile, desktop, breakpoint = 1024, sizes = "100vw", priority = false, className, style }) {
  const common = { alt: "", sizes, priority };
  const {
    props: { srcSet: large },
  } = getImageProps({ ...common, ...desktop });
  const {
    props: { srcSet: small, ...rest },
  } = getImageProps({ ...common, ...mobile });
  return (
    <picture>
      <source media={`(min-width: ${breakpoint}px)`} srcSet={large} />
      <source media={`(max-width: ${breakpoint - 1}px)`} srcSet={small} />
      {/* eslint-disable-next-line @next/next/no-img-element -- art direction : <picture> autour de getImageProps */}
      <img {...rest} alt="" className={cn("absolute inset-0 h-full w-full", className)} style={style} />
    </picture>
  );
}
