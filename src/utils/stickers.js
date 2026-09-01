// src/utils/stickers.js
//
// Scatters a theme's decorative emoji across the whole screen. Pure math
// (no Math.random) so the layout doesn't jump around on every re-render —
// it only changes when the theme itself changes.

export function buildStickerLayout(stickers, count = 18) {
  if (!stickers || stickers.length === 0) return [];

  const layout = [];
  for (let i = 0; i < count; i += 1) {
    layout.push({
      symbol: stickers[i % stickers.length],
      top: `${(i * 29.3) % 94}%`,
      left: `${(i * 41.7 + 11) % 96}%`,
      size: 16 + ((i * 7) % 22), // 16–38px
      delay: (i % 6) * 0.4,
      rotate: ((i * 53) % 40) - 20, // -20deg .. 20deg
    });
  }
  return layout;
}