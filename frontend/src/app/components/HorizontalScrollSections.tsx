"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  Ref,
} from "react";
import "./BlockSlider.css";

export interface HorizontalScrollSectionsProps {
  children: ReactNode;
}

export interface HorizontalScrollSectionsHandle {
  goToNextSection: () => void;
  goToSection: (idx: number) => void;
  getActiveIndex: () => number;
}

const HorizontalScrollSections = forwardRef<
  HorizontalScrollSectionsHandle,
  HorizontalScrollSectionsProps
>(({ children }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionsRef = useRef<Array<React.RefObject<HTMLElement>>>([]);

  // Set up refs for each section
  const childrenArray = React.Children.toArray(children);
  sectionsRef.current = childrenArray.map(
    (_, i) => sectionsRef.current[i] ?? React.createRef<HTMLElement>()
  );

  // Expose goToNextSection to parent
  useImperativeHandle(
    ref,
    () => ({
      goToNextSection: () => {
        if (activeIndex + 1 < childrenArray.length) {
          scrollToSection(activeIndex + 1);
        }
      },
      goToSection: (idx: number) => {
        if (idx >= 0 && idx < childrenArray.length) {
          scrollToSection(idx);
        }
      },
      getActiveIndex: () => activeIndex,
    }),
    [activeIndex, childrenArray.length]
  );

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    setProgress((scrollLeft / maxScroll) * 100);

    // Add or remove class to body based on scroll position
    if (scrollLeft >= 50) {
      document.body.classList.add("horizontal-scrolling");
    } else {
      document.body.classList.remove("horizontal-scrolling");
    }

    // Find the active section
    let newActive = 0;
    sectionsRef.current.forEach((ref, idx) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (
        rect.left <= containerRect.left + containerRect.width * 0.5 &&
        rect.right >= containerRect.left + containerRect.width * 0.5
      ) {
        newActive = idx;
      }
    });
    setActiveIndex(newActive);
  }, []);

  // Attach scroll event
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        container.scrollBy({
          left: -window.innerWidth * 0.8,
          behavior: "smooth",
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollBy({
          left: window.innerWidth * 0.8,
          behavior: "smooth",
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Enable vertical wheel to control horizontal scroll on desktop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isDesktop = () => window.innerWidth >= 768;
    const onWheel = (e: WheelEvent) => {
      if (isDesktop() && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY,
          behavior: "auto",
        });
      }
    };
    if (isDesktop()) {
      container.addEventListener("wheel", onWheel as EventListener, {
        passive: false,
      });
    }
    return () => {
      container.removeEventListener("wheel", onWheel as EventListener);
    };
  }, []);

  // Scroll to section on dot click
  const scrollToSection = (idx: number) => {
    const container = scrollContainerRef.current;
    const ref = sectionsRef.current[idx];
    if (container && ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  // Initial active dot
  useEffect(() => {
    setActiveIndex(0);
  }, [childrenArray.length]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: "100%",
          background: "#eee",
          zIndex: 2,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#333",
            transition: "width 0.2s",
          }}
        />
      </div>
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x proximity",
          width: "100vw",
          height: "100%",
        }}
        tabIndex={0}
        id="scrollContainer"
        className="horizontal-scroll-container"
      >
        {childrenArray.map((child, idx) => {
          const isNatural =
            (child as any).props &&
            (child as any).props.className &&
            (child as any).props.className.includes("section-natural");
          return (
            <section
              key={idx}
              ref={sectionsRef.current[idx]}
              className={isNatural ? "section-natural" : "section-snap"}
              style={{
                ...(isNatural
                  ? {
                      flex: "0 0 auto",
                    }
                  : {
                      minWidth: "100vw",
                      maxWidth: "100vw",
                      flex: "0 0 100vw",
                    }),
                scrollSnapAlign: "start",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {child}
            </section>
          );
        })}
      </div>
      {/* Navigation Dots */}
      <div
        id="navDots"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 24,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        {childrenArray.map((child, idx) => (
          <div
            key={idx}
            className={"dot" + (activeIndex === idx ? " active" : "")}
            style={{
              width: 14,
              height: 14,
              margin: 2,
              background: activeIndex === idx ? "#333" : "#bbb",
              borderRadius:
                (child as any).props &&
                (child as any).props.className &&
                (child as any).props.className.includes("section-natural")
                  ? 2
                  : "50%",
              cursor: "pointer",
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              transition: "background 0.2s, border-radius 0.2s",
            }}
            title={
              (child as any).props &&
              (child as any).props.className &&
              (child as any).props.className.includes("section-natural")
                ? "Natural scroll section"
                : "Snap section"
            }
            onClick={() => scrollToSection(idx)}
          />
        ))}
      </div>
    </div>
  );
});

export default HorizontalScrollSections;
