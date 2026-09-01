import { useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "./hooks/useCamera";
import { compositePhoto } from "./utils/canvas";
import { frames, FRAME_WIDTH, FRAME_HEIGHT } from "./frames";
import { THEMES, THEME_ORDER } from "./themes";
import { buildStickerLayout } from "./utils/stickers";
import FrameStrip from "./components/FrameStrip";
import ThemePicker from "./components/themepicker";
import StartGate from "./components/startgate";
import PhotoStrip from "./components/photostrip";
import "./App.css";

const MAX_SHOTS = 4;
const COUNT_FROM = 3;
const TICK_MS = 700;

export default function App() {
  const { videoRef, status: cameraStatus, start: startCamera } = useCamera();

  const [themeId, setThemeId] = useState("girlish");
  const [started, setStarted] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState(frames[0]?.id ?? null);
  const [count, setCount] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [overlayFailed, setOverlayFailed] = useState(false);
  const stripCanvasRef = useRef(null);

  const theme = THEMES[themeId];
  const complete = photos.length >= MAX_SHOTS;
  const stickerLayout = useMemo(() => buildStickerLayout(theme.stickers), [themeId]);

  const selectedFrame = useMemo(
    () => frames.find((f) => f.id === selectedFrameId) || null,
    [selectedFrameId]
  );

  useEffect(() => setOverlayFailed(false), [selectedFrameId]);

  const handleEnableCamera = () => {
    setStarted(true);
    startCamera();
  };

  const takeShot = async () => {
    if (cameraStatus !== "ready" || capturing || complete) return;
    setCapturing(true);

    for (let n = COUNT_FROM; n >= 1; n -= 1) {
      setCount(n);
      await wait(TICK_MS);
    }
    setCount(null);

    const dataUrl = await compositePhoto({
      video: videoRef.current,
      frameSrc: selectedFrame && !overlayFailed ? selectedFrame.image : null,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
    });

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setPhotos((prev) => [...prev, { src: dataUrl, time, theme: themeId }]);
    setCapturing(false);
  };

  const retakeAll = () => setPhotos([]);

  const downloadStrip = () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || photos.length === 0) return;

    // If every shot was taken under the same theme, style the exported
    // strip to match it; otherwise fall back to a neutral cream strip.
    const sameTheme = photos.every((p) => p.theme === photos[0].theme);
    const stripTheme = sameTheme ? THEMES[photos[0].theme] : THEMES.girlish;

    const padding = 30;
    const photoW = 480;
    const photoH = 360;
    const gap = 24;
    const captionH = 40;
    const headerH = 80;
    const cellH = photoH + captionH + gap;
    const totalH = headerH + photos.length * cellH + padding;
    const totalW = photoW + padding * 2;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = stripTheme.cream;
    ctx.fillRect(0, 0, totalW, totalH);

    ctx.fillStyle = stripTheme.headline;
    ctx.font = "700 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${stripTheme.label} photobooth`, totalW / 2, 48);

    let loaded = 0;
    photos.forEach((p, i) => {
      const img = new Image();
      img.onload = () => {
        const y = headerH + i * cellH;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(padding, y, photoW, photoH);
        ctx.drawImage(img, padding, y, photoW, photoH);
        ctx.fillStyle = stripTheme.accent;
        ctx.font = "500 16px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`frame ${i + 1} · ${p.time}`, padding, y + photoH + 26);

        loaded += 1;
        if (loaded === photos.length) {
          const link = document.createElement("a");
          link.download = "photobooth-strip.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      img.src = p.src;
    });
  };

  const themeVars = {
    "--bg": theme.bg,
    "--ink": theme.ink,
    "--cream": theme.cream,
    "--accent": theme.accent,
    "--accent-soft": theme.accentSoft,
    "--text": theme.text,
    "--subtext": theme.subtext,
    "--headline": theme.headline,
    "--font-headline": theme.headlineFont,
    "--font-body": theme.bodyFont,
  };

  return (
    <div className="app" style={themeVars}>
      {theme.grain && <span className="app__grain" aria-hidden="true" />}

      {stickerLayout.map((s, i) => (
        <span
          key={i}
          className="app__sticker"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            "--delay": `${s.delay}s`,
            "--rotate": `${s.rotate}deg`,
          }}
          aria-hidden="true"
        >
          {s.symbol}
        </span>
      ))}

      <header className="app__header">
        <span className="app__mark">Photobooth</span>
        <h1>{theme.label} booth</h1>
        <p>Pick a theme, strike four poses, take the strip home.</p>
      </header>

      <ThemePicker
        themes={THEMES}
        order={THEME_ORDER}
        themeId={themeId}
        onSelect={setThemeId}
        disabled={capturing}
      />

      {!started ? (
        <StartGate onEnable={handleEnableCamera} />
      ) : (
        <main className="camera-body">
          <FrameStrip
            frames={frames}
            selectedId={selectedFrameId}
            onSelect={setSelectedFrameId}
            disabled={capturing || complete}
          />

          <div
            className="viewfinder"
            style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="viewfinder__video"
              style={{ opacity: cameraStatus === "ready" ? 1 : 0 }}
            />

            {cameraStatus === "ready" && selectedFrame && !overlayFailed && (
              <img
                className="viewfinder__frame"
                src={selectedFrame.image}
                alt=""
                onError={() => setOverlayFailed(true)}
              />
            )}

            <CameraStatus status={cameraStatus} onRetry={startCamera} />

            {count !== null && (
              <div className="viewfinder__countdown" aria-live="polite">
                <span>{count}</span>
              </div>
            )}

            <span className="viewfinder__readout">
              {complete ? "strip complete" : `shot ${photos.length + 1} of ${MAX_SHOTS}`}
            </span>
          </div>

          <PhotoStrip photos={photos} maxShots={MAX_SHOTS} />

          <div className="deck">
            {complete ? (
              <>
                <button className="btn btn--ghost" onClick={retakeAll}>
                  Retake all
                </button>
                <button className="btn btn--primary" onClick={downloadStrip}>
                  Download strip
                </button>
              </>
            ) : (
              <button
                type="button"
                className="shutter"
                onClick={takeShot}
                disabled={cameraStatus !== "ready" || capturing}
                aria-label="Take photo"
              >
                <span className="shutter__ring" />
              </button>
            )}
          </div>
        </main>
      )}

      <canvas ref={stripCanvasRef} style={{ display: "none" }} />
    </div>
  );
}

function CameraStatus({ status, onRetry }) {
  if (status === "ready") return null;

  return (
    <div className="viewfinder__status">
      {status === "loading" && <p>Waking up the camera…</p>}
      {status === "denied" && (
        <>
          <p>
            Camera access was blocked. Allow it from your browser's address
            bar, then try again.
          </p>
          <button className="btn btn--ghost" onClick={onRetry}>
            Try again
          </button>
        </>
      )}
      {status === "unsupported" && <p>This browser can't reach a camera here.</p>}
    </div>
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}