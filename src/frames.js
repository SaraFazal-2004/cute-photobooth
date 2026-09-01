// src/frames.js
//
// This is the ONLY file you need to touch to add a new frame.
//
// How to add a frame:
//   1. Design it in Figma and export as a transparent PNG, exactly 1200 × 900 px.
//   2. Save the file into  public/frames/  (e.g. public/frames/birthday.png).
//   3. Add one line to the `frames` array below, pointing at that file.
//   4. Save — the new frame shows up in the picker automatically, live preview
//      and final capture included. No other code changes are needed.
//
// `thumbnail` is optional — if you don't provide one, the full frame PNG is
// used as its own thumbnail. Add a smaller/cropped thumbnail only if you want
// the picker to show something different from the full overlay.

export const FRAME_WIDTH = 1200;
export const FRAME_HEIGHT = 900;

export const frames = [
  {
    id: "birthday",
    name: "Birthday",
    image: "/frames/birthday.png",
  },
  {
    id: "hearts",
    name: "Hearts",
    image: "/frames/hearts.png",
  },
  {
    id: "floral",
    name: "Floral",
    image: "/frames/floral.png",
  },
  {
    id: "vintage",
    name: "Vintage",
    image: "/frames/vintage.png",
  },
  {
    id: "graduation",
    name: "Graduation",
    image: "/frames/graduation.png",
  },
];
