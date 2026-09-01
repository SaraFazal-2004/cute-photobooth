// src/hooks/useCamera.js
//
// Owns getUserMedia. Camera access is only requested when `start()` is
// called from a real user click (the "Enable camera" button), rather than
// automatically on page load — that's both better UX (no surprise
// permission prompt) and required by some browsers, which block
// getUserMedia unless it happens inside a user gesture.

import { useCallback, useEffect, useRef, useState } from "react";

// "idle" -> "loading" -> "ready" | "denied" | "unsupported"
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");

  const start = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 1600 }, height: { ideal: 1200 } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("ready");
      })
      .catch(() => setStatus("denied"));
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status, start };
}