/**
 * PixelScene — full-bleed hero background using BG.png (converted to WebP).
 * Anchored near bottom (~70% object-position) so the developer, laptop, cat,
 * and night sky stay visible across 1768, 1440, 1280, tablet, and mobile breakpoints.
 * Includes subtle dark contrast gradient overlay for text readability on left
 * and bottom fade into page background.
 */
export function PixelScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* ── Background WebP Artwork ── */}
<picture className="absolute inset-0 block h-full w-full">
  <source
    media="(max-width: 1280px)"
    srcSet="/mobile_ui.png"
  />

  <img
    src="/main_ui_bg.png"
    alt=""
    aria-hidden="true"
    fetchPriority="high"
    width={1812}
    height={868}
    className="h-full w-full object-cover object-[22%_100%] [image-rendering:pixelated]"
  />
</picture>

{/* Top overlay for navbar contrast */}
<div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050B14]/55 via-[#050B14]/20 to-transparent" />

{/* Left contrast overlay for text readability */}
<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050B14]/55 via-[#050B14]/25 to-transparent lg:w-[65%]" />

{/* Bottom fade into page background */}
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050B14]/85 via-[#050B14]/35 to-transparent" />
    </div>
  )
}
