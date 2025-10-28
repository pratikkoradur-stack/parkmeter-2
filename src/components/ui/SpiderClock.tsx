import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './spider-clock.css';

export const SpiderClock: React.FC = () => {
  const faceRef = useRef<SVGCircleElement | null>(null);
  const secRef = useRef<SVGPathElement | null>(null);
  const minRef = useRef<SVGPathElement | null>(null);
  const hrRef = useRef<SVGPathElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // show wrapper
    if (wrapperRef.current) wrapperRef.current.style.visibility = 'visible';

    // simple clock update loop using gsap.set for smooth transforms
    let rafId = 0;
    const tick = () => {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;

      if (secRef.current) gsap.set(secRef.current, { rotation: s * 6, transformOrigin: '50% 50%' });
      if (minRef.current) gsap.set(minRef.current, { rotation: m * 6, transformOrigin: '50% 50%' });
      if (hrRef.current) gsap.set(hrRef.current, { rotation: h * 30, transformOrigin: '50% 50%' });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // small idle animations
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 6 });
    tl.to(faceRef.current, { scale: 1.03, transformOrigin: '50% 50%', duration: 0.6, yoyo: true, repeat: 1 });

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
    };
  }, []);

  return (
    <div className="spider-clock-wrapper" ref={wrapperRef}>
      <div id="wBody" className="w-full">
        <div id="watch">
          <svg id="watchSVG" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g id="faceGroup">
              <circle id="face" ref={faceRef} cx="50" cy="50" r="46" fill="#0b1220" stroke="#ffffff22" strokeWidth="1" />
              <g id="ticks">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const x1 = 50 + Math.cos(angle) * 40;
                  const y1 = 50 + Math.sin(angle) * 40;
                  const x2 = 50 + Math.cos(angle) * 44;
                  const y2 = 50 + Math.sin(angle) * 44;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff66" strokeWidth={i % 3 === 0 ? 1.8 : 0.9} />
                  );
                })}
              </g>
            </g>

            {/* Clock hands as groups so rotation origin is center */}
            <g id="hand-hr" ref={hrRef}>
              <path d="M49.5 50 L50 30 L50.8 50 Z" fill="#ffffff" opacity="0.9" />
            </g>
            <g id="hand-min" ref={minRef}>
              <path d="M49.8 50 L50 20 L50.2 50 Z" fill="#ffffff" opacity="0.75" />
            </g>
            <g id="hand-sec" ref={secRef}>
              <path d="M50 52 L50 14" stroke="#ff6b6b" strokeWidth={1.6} strokeLinecap="round" />
              <circle cx="50" cy="50" r="1.6" fill="#ff6b6b" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SpiderClock;
