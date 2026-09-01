import { useEffect, useMemo, useState } from "react";
import { useCamera } from "./hooks/useCamera";
import { compositePhoto } from "./utils/canvas";
import { frames, FRAME_WIDTH, FRAME_HEIGHT } from "./frames";
import FrameStrip from "./components/FrameStrip";
import "./App.css";

const COUNT_FROM = 3;
const TICK_MS = 700;

export default function App() {
  const { videoRef, status: cameraStatus, retry } = useCamera();

  const [selectedFrameId, setSelectedFrameId] = useState(frames[0]?.id ?? null);
  const [count, setCount] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [overlayFailed, setOverlayFailed] = useState(false);

  const selectedFrame = useMemo(
    () => frames.find((f) => f.id === selectedFrameId) || null,
    [selectedFrameId]
  );

  // Reset the "this PNG is missing" flag whenever the person picks a
  // different frame, so a broken frame doesn't stay silently disabled.
  useEffect(() => setOverlayFailed(false), [selectedFrameId]);

  const takePhoto = async () => {
    if (cameraStatus !== "ready" || capturing) return;
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

    setPhoto(dataUrl);
    setCapturing(false);
  };

  const backToCamera = () => setPhoto(null);

  const download = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.href = photo;
    link.download = `photobooth-${Date.now()}.png`;
    link.click();
  };

  const readout = photo
    ? "captured"
    : selectedFrame
    ? selectedFrame.name.toLowerCase()
    : "no frame";

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__mark">Film&nbsp;Co.</span>
        <h1>Photobooth</h1>
        <p>Pick a frame, strike a pose, take one home.</p>
      </header>

      <main className="camera-body">
        <FrameStrip
          frames={frames}
          selectedId={selectedFrameId}
          onSelect={setSelectedFrameId}
          disabled={capturing || !!photo}
        />

        <div
          className="viewfinder"
          style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
        >
          {photo ? (
            <img className="viewfinder__result" src={photo} alt="Your captured photo" />
          ) : (
            <>
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

              <CameraStatus status={cameraStatus} onRetry={retry} />

              {count !== null && (
                <div className="viewfinder__countdown" aria-live="polite">
                  <span>{count}</span>
                </div>
              )}
            </>
          )}

          <span className="viewfinder__readout">{readout}</span>
        </div>

        <div className="deck">
          {photo ? (
            <>
              <button className="btn btn--ghost" onClick={backToCamera}>
                Retake
              </button>
              <button className="btn btn--ghost" onClick={backToCamera}>
                Change frame
              </button>
              <button className="btn btn--primary" onClick={download}>
                Download photo
              </button>
            </>
          ) : (
            <button
              type="button"
              className="shutter"
              onClick={takePhoto}
              disabled={cameraStatus !== "ready" || capturing}
              aria-label="Take photo"
            >
              <span className="shutter__ring" />
            </button>
          )}
        </div>
      </main>
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
            Camera access was blocked. Allow it from your browser's address bar,
            then try again.
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