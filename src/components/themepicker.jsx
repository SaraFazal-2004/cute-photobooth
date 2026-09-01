// src/components/ThemePicker.jsx
//
// One pill per entry in THEME_ORDER. Each pill is rendered in its own
// theme's headline font as a small preview of what selecting it will do.

export default function ThemePicker({ themes, order, themeId, onSelect, disabled }) {
  return (
    <div className="theme-picker" role="radiogroup" aria-label="Choose a theme">
      {order.map((id) => {
        const t = themes[id];
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={themeId === id}
            className={`theme-pill${themeId === id ? " is-selected" : ""}`}
            style={{
              "--pill-accent": t.accent,
              "--pill-accent-soft": t.accentSoft,
              fontFamily: t.headlineFont,
            }}
            onClick={() => onSelect(id)}
            disabled={disabled}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}