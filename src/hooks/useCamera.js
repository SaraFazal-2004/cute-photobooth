// src/hooks/useCamera.js
//
// Encapsulates getUserMedia: requests the front camera, exposes a status
// state machine, and cleans the stream up on unmount. Kept separate from
// App.jsx so the capture/frame logic doesn't have to know how the camera
// was obtained.

import { useCallback, useEffect, useRef, useState } from "react";

// "loading" -> "ready" | "denied" | "unsupported"
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("loading");

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
    start();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [start]);

  return { videoRef, status, retry: start };
}