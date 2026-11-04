import { useLayoutEffect } from 'react';

export function useMotion(rootRef, dependency = 0) {
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
      if (!active) return;
      import('../motion.js')
        .then(({ initMotion }) => {
          if (active) stopMotion = initMotion(root);
        })
        .catch((error) => console.error('Velveteen motion could not be initialized.', error));
    });

    return () => {
      active = false;
      openingObserver?.disconnect();
      stopMotion?.();
    };
  }, [rootRef, dependency]);
}
