'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export interface NextTopLoaderProps {
  color?: string;
  initialPosition?: number;
  crawlSpeed?: number;
  height?: number;
  crawl?: boolean;
  showSpinner?: boolean;
  easing?: string;
  speed?: number;
  shadow?: string | false;
  zIndex?: number;
}

function NavigationWatcher({ onFinish }: { onFinish: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFinish();
  }, [pathname, searchParams, onFinish]);

  return null;
}

export default function NextTopLoader({
  color = '#4F46E5',
  initialPosition = 0.12,
  crawlSpeed = 200,
  height = 3,
  crawl = true,
  showSpinner = false,
  easing = 'ease',
  speed = 200,
  shadow = '0 0 10px #4F46E5, 0 0 5px #4F46E5',
  zIndex = 99999,
}: NextTopLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    timerRef.current = null;
    fadeTimeoutRef.current = null;
    resetTimeoutRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearAllTimers();
    setVisible(true);
    setOpacity(1);
    setProgress(initialPosition);

    if (crawl) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 0.94) return prev;
          let inc = 0;
          if (prev < 0.3) {
            inc = 0.1;
          } else if (prev < 0.6) {
            inc = 0.04;
          } else if (prev < 0.8) {
            inc = 0.02;
          } else {
            inc = 0.005;
          }
          return Math.min(prev + inc, 0.94);
        });
      }, crawlSpeed);
    }
  }, [clearAllTimers, crawl, crawlSpeed, initialPosition]);

  const finish = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(1);

    fadeTimeoutRef.current = setTimeout(() => {
      setOpacity(0);
      resetTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, speed + 50);
    }, 150);
  }, [speed]);

  // Handle link clicks across the site
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement | null;
        const anchor = target?.closest('a');

        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href) return;

        // Skip modified clicks (new tab, ctrl, shift, meta)
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
          return;
        }

        // Skip target other than self
        const targetAttr = anchor.getAttribute('target');
        if (targetAttr && targetAttr !== '_self') return;

        // Skip download links, mailto, tel, javascript
        if (anchor.hasAttribute('download')) return;
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

        // Parse destination
        const currentUrl = new URL(window.location.href);
        const destinationUrl = new URL(anchor.href, window.location.href);

        // Skip external links
        if (destinationUrl.origin !== currentUrl.origin) return;

        // Skip hash jumps on current page
        if (
          destinationUrl.pathname === currentUrl.pathname &&
          destinationUrl.search === currentUrl.search &&
          destinationUrl.hash !== ''
        ) {
          return;
        }

        // Skip identical URL
        if (destinationUrl.href === currentUrl.href) return;

        start();
      } catch {
        // Ignore URL parsing errors
      }
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      clearAllTimers();
    };
  }, [start, clearAllTimers]);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationWatcher onFinish={finish} />
      </Suspense>

      {visible && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: `${height}px`,
            zIndex,
            pointerEvents: 'none',
            opacity,
            transition: `opacity ${speed}ms linear`,
          }}
        >
          {/* Main Glowing Progress Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              backgroundColor: color,
              transform: `translate3d(-${(1 - progress) * 100}%, 0, 0)`,
              transition: `transform ${speed}ms ${easing}`,
            }}
          >
            {/* Right-edge glowing peg */}
            {shadow && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '100px',
                  height: '100%',
                  boxShadow: typeof shadow === 'string' ? shadow : `0 0 10px ${color}, 0 0 5px ${color}`,
                  transform: 'rotate(3deg) translate(0px, -4px)',
                  opacity: 1,
                }}
              />
            )}
          </div>

          {/* Optional Corner Spinner */}
          {showSpinner && (
            <div
              style={{
                position: 'fixed',
                top: '14px',
                right: '16px',
                zIndex: zIndex + 1,
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  boxSizing: 'border-box',
                  border: `2px solid transparent`,
                  borderTopColor: color,
                  borderLeftColor: color,
                  borderRadius: '50%',
                  animation: 'next-top-loader-spin 400ms linear infinite',
                }}
              />
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes next-top-loader-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `,
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
