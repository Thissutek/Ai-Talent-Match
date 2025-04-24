"use client";

import { useRef, useEffect, useState } from "react";

export default function ScrollBackground({
  videoSrc = "/blender-animation.mp4",
  children,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    // Handle video loaded
    const handleVideoLoaded = () => {
      setIsLoaded(true);
      video.pause();
    };

    video.addEventListener("loadeddata", handleVideoLoaded);

    const handleScroll = () => {
      if (!isLoaded) return;

      // Get total scrollable height (total page height minus viewport height)
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Get current scroll position
      const scrollPosition = window.scrollY;

      // Calculate progress (0 to 1)
      const progress = Math.max(
        0,
        Math.min(1, scrollPosition / scrollableHeight),
      );

      // Set video time based on scroll position
      if (video.duration) {
        video.currentTime = progress * video.duration;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial call
    handleScroll();

    return () => {
      video.removeEventListener("loadeddata", handleVideoLoaded);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Fixed background video */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          src={videoSrc}
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Content that scrolls over the video */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
