// src/components/StartGate.jsx
//
// Explicit consent screen shown before any camera permission is requested.
// The browser's native permission prompt only fires once "Enable camera" is
// clicked, so the person always sees why the request is happening first.

export default function StartGate({ onEnable }) {
  return (
    <div className="start-gate">
      <p className="start-gate__lead">
        This booth needs your camera to take photos. Nothing is uploaded —
        your photos stay on this device, and only the strip you choose to
        download is saved anywhere.
      </p>
      <button type="button" className="btn btn--primary" onClick={onEnable}>
        Enable camera &amp; start
      </button>
    </div>
  );
}