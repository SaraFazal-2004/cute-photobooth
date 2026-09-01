// src/components/FrameStrip.jsx
//
// Renders one thumbnail per entry in frames.js, plus a built-in "No frame"
// option. Knows nothing about any specific frame design — new frames appear
// here automatically once they're added to the config.

import { useState } from "react";

export default function FrameStrip({ frames, selectedId, onSelect, disabled }) {
  return (
    <div className="frame-strip" role="radiogroup" aria-label="Choose a frame">
      <Sprockets />
      <div className="frame-strip__track">
        <FrameThumb
          label="No frame"
          selected={selectedId === null}
          onClick={() => onSelect(null)}
          disabled={disabled}
        />
        {frames.map((frame) => (
          <FrameThumb
            key={frame.id}
            label={frame.name}
            image={frame.thumbnail || frame.image}
            selected={selectedId === frame.id}
            onClick={() => onSelect(frame.id)}
            disabled={disabled}
          />
        ))}
      </div>
      <Sprockets />
    </div>
  );
}

function FrameThumb({ label, image, selected, onClick, disabled }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`frame-thumb${selected ? " is-selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="frame-thumb__preview">
        {image && !failed ? (
          <img src={image} alt="" onError={() => setFailed(true)} />
        ) : (
          <span className="frame-thumb__fallback">{image ? "?" : "—"}</span>
        )}
      </span>
      <span className="frame-thumb__label">{label}</span>
    </button>
  );
}

function Sprockets() {
  return (
    <div className="frame-strip__sprockets" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}