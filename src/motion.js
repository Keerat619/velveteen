import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * The original motion scenes are kept component-scoped and selector-compatible.
 * data-8b-part markers retained here: motion-queue, page-init, motion,
 * scene:dusk, scene:bench, scene:drift, scene:hours, scene:gather,
 * scene:miles, scene:letter, scene:card, scene:mark.
 */
export function initMotion(root) {
  if (!root) return () => {};

  gsap.registerPlugin(ScrollTrigger);
  let lenisInstance = null;
  const previousRefresh = window.refreshScroll;

  const navHeight = () => root.querySelector('#navigation')?.offsetHeight ?? 0;
  const refreshScroll = () => {
    document.documentElement.style.setProperty('--nav-h', `${navHeight()}px`);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };

  const context = gsap.context(() => {
    /* data-8b-part: page-init — Lenis smooth scrolling and ScrollTrigger sync */
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = (window.lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.95,
        anchors: { offset: -navHeight() },
      }));
      lenisInstance = lenis;
      const tick = (time) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        if (window.lenis === lenis) window.lenis = null;
        lenisInstance = null;
      };
    });

    /* data-8b-part: motion — original lift, rule, window and ribbon effects */
    const effects = {
      ribbon(element, vars = {}) {
        return gsap.timeline(vars).fromTo(element, { xPercent: 34 }, { xPercent: 0, ease: 'none' });
      },
      lift(element, vars = {}) {
        return gsap.timeline(vars).fromTo(
          element,
          { yPercent: 35, clipPath: 'inset(0% 0% 100% 0%)' },
          { yPercent: 0, clipPath: 'inset(0% 0% -25% 0%)', duration: 1, ease: 'power3.out', clearProps: 'clipPath,transform' },
        );
      },
      rule(element, vars = {}) {
        return gsap.timeline(vars).fromTo(
          element,
          { scaleX: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, duration: 1.1, ease: 'power2.inOut', clearProps: 'transform' },
        );
      },
      window(element, vars = {}) {
        const img = element.querySelector('img');
        const timeline = gsap.timeline(vars).fromTo(
          element,
          { clipPath: 'inset(0% 42% 0% 42%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut', clearProps: 'clipPath' },
        );
        if (img) timeline.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.7, ease: 'power2.out', clearProps: 'transform' }, 0);
        return timeline;
      },
    };

    const effectBindings = {
      ribbon: () => ({ start: 'top bottom', end: 'center 58%', scrub: 0.6 }),
      lift: () => ({ start: 'top 88%', once: true }),
      rule: () => ({ start: 'top 92%', once: true }),
      window: () => ({ start: 'top 85%', once: true }),
    };

    /* data-8b-part: motion-queue — all template motion selectors remain in place. */
    root.querySelectorAll('[data-8b-section]').forEach((section) => {
      Object.keys(effectBindings).forEach((name) => {
        const elements = section.querySelectorAll(`[data-8b-motion~="${name}"]`);
        if (!elements.length) return;
        const id = `effect:${name}:${section.id}`;
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          elements.forEach((element, index) => {
            const binding = effectBindings[name](element);
            const animation = effects[name](element, { paused: !binding.scrub });
            ScrollTrigger.create({ id: `${id}:${index}`, trigger: element, ...binding, animation });
          });
        });
      });
    });

    /* data-8b-part: scene:dusk — original sticky hero and expanding night reveal */
    {
      const section = root.querySelector('#opening');
      const night = section?.querySelector('.op__night');
      const img = section?.querySelector('.op__photo img');
      const word1 = section?.querySelector('.op__w--1');
      const word2 = section?.querySelector('.op__w--2');
      const and = section?.querySelector('.op__and');
      const statement = section?.querySelector('.op__statement');
      const ribbon = section?.querySelector('.op__ribbon');
      if (section && night && img && word1 && word2 && and && statement && ribbon) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const geometry = { rx: 0, ry: 0 };
          const measure = () => {
            const width = night.clientWidth;
            const height = window.innerHeight;
            geometry.rx = width * (width < 760 ? 0.62 : 0.55);
            geometry.ry = height * 0.9;
          };
          const dome = (progress) => {
            if (progress >= 0.999) {
              night.style.clipPath = 'none';
              return;
            }
            const t = Math.max(0, progress - 0.55) / 0.45;
            const grow = 1 + 80 * t * t * t;
            const rx = geometry.rx * grow;
            const ry = geometry.ry * grow;
            night.style.clipPath = `ellipse(${rx.toFixed(1)}px ${ry.toFixed(1)}px at 50% ${ry.toFixed(1)}px)`;
          };
          section.setAttribute('data-dusk', '');
          measure();
          const timeline = gsap.timeline({
            scrollTrigger: {
              id: 'dusk',
              trigger: night,
              start: 'top bottom',
              end: 'top top',
              scrub: 0.4,
              invalidateOnRefresh: true,
              onRefresh: (self) => { measure(); dome(self.progress); },
              onUpdate: (self) => dome(self.progress),
            },
          });
          timeline
            .fromTo(img, { scale: 1, filter: 'brightness(1) saturate(1)' }, { scale: 1.14, filter: 'brightness(0.5) saturate(1.2)', ease: 'none', duration: 1 }, 0)
            .to(word1, { xPercent: () => (window.innerWidth < 760 ? -10 : -16), ease: 'none', duration: 1 }, 0)
            .to(word2, { xPercent: () => (window.innerWidth < 760 ? 5 : 8), ease: 'none', duration: 1 }, 0)
            .to(and, { scale: 1.6, ease: 'none', duration: 1 }, 0)
            .fromTo(statement, { y: () => window.innerHeight * 0.16 }, { y: 0, ease: 'none', duration: 0.8 }, 0.2)
            .add(effects.ribbon(ribbon).duration(0.7), 0.3);
          dome(0);
          return () => {
            night.style.clipPath = '';
            section.removeAttribute('data-dusk');
          };
        });
      }
    }

    /* data-8b-part: scene:bench — sticky product photography follows the stem list */
    {
      const section = root.querySelector('#season');
      const photos = [...(section?.querySelectorAll('.bench__ph') ?? [])];
      const rows = [...(section?.querySelectorAll('.bench__row') ?? [])];
      const count = Math.min(photos.length, rows.length);
      if (section && count > 1) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const names = rows.slice(0, count).map((row) => row.querySelector('.bench__name'));
          const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim();
          const ink = getComputedStyle(names[0]).color;
          section.setAttribute('data-bench', '');
          photos.slice(0, count).forEach((photo, index) => gsap.set(photo, { zIndex: count - index }));
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { id: 'bench', trigger: section.querySelector('.bench__rows'), start: 'top 62%', end: 'bottom 62%', scrub: 0.5 },
          });
          photos.slice(0, count - 1).forEach((photo, index) => {
            const at = index + 0.55;
            timeline.fromTo(photo, { xPercent: 0 }, { xPercent: -100, duration: 0.45, ease: 'power2.inOut' }, at);
            const next = photos[index + 1].querySelector('img');
            if (next) timeline.fromTo(next, { scale: 1.14 }, { scale: 1, duration: 0.6, ease: 'power1.out' }, at);
          });
          names.forEach((name, index) => {
            timeline.fromTo(name, { fontWeight: 400, color: ink }, { fontWeight: 600, color: accent, duration: 0.25, immediateRender: index === 0 }, Math.max(0, index - 0.3));
            if (index < count - 1) timeline.to(name, { fontWeight: 400, color: ink, duration: 0.25 }, index + 0.7);
          });
          timeline.set({}, {}, count);
          return () => section.removeAttribute('data-bench');
        });
      }
    }

    /* data-8b-part: scene:drift — editorial grid drift retains desktop and mobile patterns */
    {
      const section = root.querySelector('#work');
      const grid = section?.querySelector('.work__grid');
      const items = [...(grid?.querySelectorAll('.work__item') ?? [])];
      if (section && grid && items.length) {
        const build = (pattern) => {
          const lefts = [...new Set(items.map((item) => Math.round(item.offsetLeft)))].sort((a, b) => a - b);
          const timeline = gsap.timeline({ scrollTrigger: { id: 'drift', trigger: grid, start: 'top bottom', end: 'center 55%', scrub: 0.6 } });
          items.forEach((item) => {
            const column = Math.max(0, lefts.indexOf(Math.round(item.offsetLeft)));
            timeline.fromTo(item, { y: `${pattern[column % pattern.length]}vh` }, { y: 0, ease: 'power1.out' }, 0);
          });
        };
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => build([18, -12, 30]));
        media.add('(prefers-reduced-motion: no-preference) and (max-width: 760px)', () => build([16, -10]));
      }
    }

    /* data-8b-part: scene:hours — the original horizontal, scrubbed five-panel sequence */
    {
      const section = root.querySelector('#dusk');
      const run = section?.querySelector('.dusk__run');
      const stage = section?.querySelector('.dusk__stage');
      const track = section?.querySelector('.dusk__track');
      const panels = [...(track?.querySelectorAll('.dusk__panel') ?? [])];
      if (section && run && stage && track && panels.length > 1) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          section.style.setProperty('--panels', panels.length);
          section.setAttribute('data-hours', '');
          const distance = () => track.scrollWidth - stage.clientWidth;
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { id: 'hours', trigger: run, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
          });
          timeline.to(track, { x: () => -distance(), duration: panels.length - 1 }, 0);
          panels.slice(1).forEach((panel, index) => {
            const number = panel.querySelector('.dusk__hour');
            const image = panel.querySelector('.dusk__ph img');
            if (number) timeline.fromTo(number, { xPercent: 28 }, { xPercent: 0, duration: 1 }, index);
            if (image) timeline.fromTo(image, { xPercent: -12, scale: 1.3 }, { xPercent: 0, scale: 1, duration: 1 }, index);
          });
          return () => {
            section.removeAttribute('data-hours');
            section.style.removeProperty('--panels');
          };
        });
      }
    }

    /* data-8b-part: scene:gather — six event images gather into the original editorial board */
    {
      const section = root.querySelector('#events');
      const board = section?.querySelector('.ev__board');
      const photos = [...(board?.querySelectorAll('.ev__ph') ?? [])];
      if (section && board && photos.length) {
        const turns = [-11, 7, -5, 9, -8, 4];
        const build = () => {
          const bounds = board.getBoundingClientRect();
          const timeline = gsap.timeline({ scrollTrigger: { id: 'gather', trigger: board, start: 'top 78%', end: 'center 52%', scrub: 0.6 } });
          const middle = (photos.length - 1) / 2;
          photos.forEach((photo, index) => {
            const photoBounds = photo.getBoundingClientRect();
            const xPercent = (bounds.left + bounds.width / 2 - (photoBounds.left + photoBounds.width / 2)) * 0.86 / photoBounds.width * 100;
            const yPercent = (bounds.top + bounds.height * 0.2 - (photoBounds.top + photoBounds.height / 2)) * 0.86 / photoBounds.height * 100;
            timeline.fromTo(photo, { xPercent, yPercent, rotation: turns[index % turns.length], scale: 0.72 },
              { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, ease: 'power2.inOut', duration: 1 }, Math.abs(index - middle) * 0.06);
          });
        };
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', build);
        media.add('(prefers-reduced-motion: no-preference) and (max-width: 760px)', build);
      }
    }

    /* data-8b-part: scene:miles — original progressive line-and-pin animation, adapted to craft steps */
    {
      const section = root.querySelector('#growers');
      const rows = [...(section?.querySelectorAll('.gr__row') ?? [])];
      if (section && rows.length) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const timeline = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: { id: 'miles', trigger: section.querySelector('.gr__rows'), start: 'top 82%', end: 'bottom 58%', scrub: 0.6, invalidateOnRefresh: true },
          });
          rows.forEach((row, index) => {
            const pin = row.querySelector('.gr__pin');
            const line = row.querySelector('.gr__line');
            if (pin) timeline.fromTo(pin, { x: () => -pin.offsetLeft }, { x: 0, duration: 1 }, index * 0.45);
            if (line) timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1 }, index * 0.45);
          });
        });
      }
    }

    /* data-8b-part: scene:letter — image/window parallax in the studio note */
    {
      const section = root.querySelector('#notes');
      const frame = section?.querySelector('.nt__frame');
      const img = frame?.querySelector('img');
      const letter = section?.querySelector('.nt__letter');
      if (section && frame && img && letter) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          gsap.timeline({
            scrollTrigger: { id: 'letter', trigger: window.innerWidth < 760 ? frame : letter, start: 'top 70%', end: 'bottom 70%', scrub: 0.6, invalidateOnRefresh: true },
          }).fromTo(img, { y: 0 }, { y: () => frame.clientHeight - img.offsetHeight, ease: 'none' }, 0);
        });
      }
    }

    /* data-8b-part: scene:card — original contact card and background parallax */
    {
      const section = root.querySelector('#contact');
      const card = section?.querySelector('.ct__card');
      const img = section?.querySelector('.ct__room img');
      if (section && card && img) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { id: 'card', trigger: section, start: 'top bottom', end: 'top 30%', scrub: 0.5 },
          })
            .fromTo(card, { x: '62vw', rotation: 4 }, { x: 0, rotation: 0, ease: 'power2.out' }, 0)
            .fromTo(img, { xPercent: -6, scale: 1.14 }, { xPercent: 0, scale: 1 }, 0);
        });
      }
    }

    /* data-8b-part: scene:mark — footer wordmark resolves into place on scroll */
    {
      const section = root.querySelector('#footer');
      const mark = section?.querySelector('.ft__mark');
      if (section && mark) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          gsap.timeline({ scrollTrigger: { id: 'mark', trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } })
            .fromTo(mark.querySelector('.ft__rect'), { xPercent: -70 }, { xPercent: 0, ease: 'power2.out' }, 0)
            .fromTo(mark.querySelector('.ft__dome'), { yPercent: 75 }, { yPercent: 0, ease: 'power2.out' }, 0)
            .fromTo(mark.querySelector('.ft__bar'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, ease: 'power1.inOut', duration: 0.6 }, 0.4);
        });
      }
    }
  }, root);

  window.refreshScroll = refreshScroll;
  window.addEventListener('resize', refreshScroll, { passive: true });
  window.addEventListener('load', refreshScroll, { once: true });
  refreshScroll();

  /* data-8b-part: section-script:navigation — menu state and auto-hide live in SiteChrome.jsx. */
  /* data-8b-part: section-script:opening — IntersectionObserver pause lives in useMotion.js. */
  /* data-8b-part: section-script:contact — enquiry draft is handled by the React Contact component. */

  return () => {
    window.removeEventListener('resize', refreshScroll);
    window.removeEventListener('load', refreshScroll);
    if (window.refreshScroll === refreshScroll) {
      if (previousRefresh) window.refreshScroll = previousRefresh;
      else delete window.refreshScroll;
    }
    context.revert();
    if (lenisInstance) {
      lenisInstance.destroy();
      if (window.lenis === lenisInstance) window.lenis = null;
    }
    document.documentElement.style.removeProperty('--nav-h');
    ScrollTrigger.refresh();
  };
}
