// src/components/PhotoStrip.jsx
//
// Shows the 4 slots that make up a finished strip, filling in as shots are
// taken. Purely presentational — App.jsx owns the actual capture logic.

export default function PhotoStrip({ photos, maxShots }) {
  return (
    <div className="photo-strip">
      {Array.from({ length: maxShots }).map((_, i) => {
        const shot = photos[i];
        return (
          <div className="photo-strip__slot" key={i}>
            {shot ? (
              <img src={shot.src} alt={`Shot ${i + 1} of ${maxShots}`} />
            ) : (
              <span className="photo-strip__empty">{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}