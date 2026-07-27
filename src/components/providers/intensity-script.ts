/**
 * Pre-paint intensity resolution.
 *
 * Runs as a blocking inline script in `<head>` so `data-intensity` is on
 * `<html>` before the first paint. Without it the CSS gates in globals.css
 * match nothing until hydration finishes, which meant:
 *
 *  - a Still-mode user (or one whose OS says reduced-motion) saw the full
 *    cosmic atmosphere painted, then watched it disappear;
 *  - `.oe-stage__layer` rendered at its default `opacity: 1`, so a story's
 *    chapter backgrounds all showed at once before snapping to the right one.
 *
 * The quietest mode had the loudest hydration snap. This is the standard
 * no-flash pattern; it mirrors `resolveEffectiveMode` in stores/intensity.ts —
 * keep the two in sync.
 *
 * Minified by hand rather than by a build step: it ships inline in every
 * document, and a helper import would defeat the point of running pre-paint.
 */
export const INTENSITY_SCRIPT = `(function(){try{
var m='balanced';
var s=localStorage.getItem('oe-intensity-mode');
if(s){var v=JSON.parse(s);if(v&&v.state&&v.state.mode)m=v.state.mode;}
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)m='still';
document.documentElement.setAttribute('data-intensity',m);
}catch(e){document.documentElement.setAttribute('data-intensity','balanced');}})();`
