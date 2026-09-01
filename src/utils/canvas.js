// src/utils/canvas.js
//
// Pure canvas helpers, independent of React and of any specific frame.

// Draws `source` into a dw x dh rectangle at (0,0), cropping (never
// stretching) to fill it — the canvas equivalent of CSS `object-fit: cover`.
export function drawCover(ctx, source, sw, sh, dw, dh) {
  const sourceRatio = sw / sh;
  const destRatio = dw / dh;

  let sx = 0;
  let sy = 0;
  let sWidth = sw;
  let sHeight = sh;

  if (sourceRatio > destRatio) {
    sWidth = sh * destRatio;
    sx = (sw - sWidth) / 2;
  } else {
    sHeight = sw / destRatio;
    sy = (sh - sHeight) / 2;
  }

  ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, dw, dh);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
}

// Composites the current video frame (mirrored, cropped to fill the target
// size) with an optional transparent frame PNG drawn on top, exactly as the
// live viewfinder previews it. Returns a PNG data URL.
export async function compositePhoto({ video, frameSrc, width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Mirror horizontally to match the selfie-style live preview.
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  drawCover(ctx, video, video.videoWidth, video.videoHeight, width, height);
  ctx.restore();

  if (frameSrc) {
    try {
      const frameImg = await loadImage(frameSrc);
      // The frame PNG is authored at exactly width x height, so it's drawn
      // edge-to-edge with no cropping or distortion.
      ctx.drawImage(frameImg, 0, 0, width, height);
    } catch {
      // Frame PNG missing or failed to load — fall back to the plain photo
      // rather than failing the whole capture.
    }
  }

  return canvas.toDataURL("image/png");
}