"use client";

import { useState } from "react";

/**
 * A YouTube video that loads the player only when someone asks for it.
 *
 * The embedded player pulls in about 1 MB of third-party script on page load
 * (Lighthouse, /demo/, 2026-10-09: 1,501 KiB page weight and a 7.8 s mobile LCP,
 * most of it the player). Until the reader presses play this is a link to the
 * video with its thumbnail, so it also works with JavaScript off: the link opens
 * the video on YouTube. On click it becomes the privacy-enhanced (nocookie) embed,
 * playing.
 */
export default function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    );
  }

  return (
    <a
      href={`https://www.youtube.com/watch?v=${id}`}
      onClick={(event) => {
        event.preventDefault();
        setPlaying(true);
      }}
      aria-label={`Play video: ${title}`}
      style={{ position: "absolute", inset: 0, display: "block", background: "#000" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, external thumbnail */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "68px",
          height: "48px",
          borderRadius: "12px",
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
          <path d="M0 0 L20 11 L0 22 Z" fill="#fff" />
        </svg>
      </span>
    </a>
  );
}
