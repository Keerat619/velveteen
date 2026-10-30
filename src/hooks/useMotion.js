import { useLayoutEffect } from 'react';
import { initMotion } from '../motion.js';

export function useMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let active = true;
    let stopMotion = null;
    const opening = root.querySelector('#opening');
    const hold = opening?.querySelector('.op__hold');
    let openingObserver = null;

    /* data-8b-part: section-script:opening — pause the hero drift outside its hold. */
    if (opening && hold && 'IntersectionObserver' in window) {
      openingObserver = new IntersectionObserver(([entry]) => {
        opening.classList.toggle('is-off', !entry.isIntersecting);
      });
      openingObserver.observe(hold);
    }

    const fontsReady = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve();
    fontsReady.then(() => {
      if (active) stopMotion = initMotion(root);
    });

    return () => {
      active = false;
      openingObserver?.disconnect();
      stopMotion?.();
    };
  }, [rootRef]);
}
