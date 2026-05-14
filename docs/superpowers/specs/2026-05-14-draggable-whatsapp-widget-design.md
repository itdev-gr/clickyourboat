# Draggable WhatsApp Widget — Design

**Date:** 2026-05-14
**Status:** Approved

## Goal

Allow site visitors to drag the existing green WhatsApp floating button (loaded by the third-party script at `https://cbl.link/b/semTkLV.js`) to any position on screen, and remember that position across page loads.

## Constraints

- Keep the third-party widget as-is — do not replace it.
- Work on desktop (mouse) and mobile (touch).
- Tapping/clicking the button (without dragging) must still open `https://wa.me/+306975857647` as it does today.
- No errors if the third-party script is blocked or its DOM structure changes.

## Approach

A single inline script added to `src/layouts/Layout.astro` (loaded on every page). It locates the third-party widget's custom element, pierces its open Shadow DOM, and applies drag handlers to the inner positioned container.

### 1. Locate the widget

The third-party script defines `<button-tool-widget>` (via `customElements.define`) with an open `shadowRoot`. Inside that shadowRoot lives a div with id matching `button-tool-widget-*` styled `position: fixed; bottom: 1rem; right: 1rem; z-index: 99999`.

The script must wait for that element. Strategy:

1. `customElements.whenDefined('button-tool-widget')` resolves once the custom element is registered.
2. After that, query the document for an existing `<button-tool-widget>` element. If absent, use a `MutationObserver` on `document.body` watching for its insertion. Disconnect once found.
3. Inside the host's `shadowRoot`, query for `[id^="button-tool-widget-"]` to get the positioned container. Inside that, query for `button` to get the green circle.

If any step fails (no shadowRoot, no inner div, no button), the script silently no-ops.

### 2. Switch positioning model from bottom/right to left/top

The third-party inline style uses `bottom: 1rem; right: 1rem`. The script:

- Computes the initial pixel position equivalent (so first-time visitors see no visual change): `left = innerWidth - rect.width - 16`, `top = innerHeight - rect.height - 16`.
- If `localStorage["tyb_whatsapp_pos"]` exists and parses to `{ left: number, top: number }`, use that instead (after bounds clamping — see §5).
- Applies `style.left = "<x>px"; style.top = "<y>px"; style.right = "auto"; style.bottom = "auto"`.

### 3. Drag with Pointer Events

Attach listeners to the inner `button` element (so press-and-hold over the icon initiates drag — the surrounding container is invisible padding only).

- `button.style.touchAction = "none"` — prevents the page from scrolling while dragging on touch devices.
- `pointerdown`: record `{ startX, startY, originLeft, originTop, pointerId }`. Call `button.setPointerCapture(pointerId)` so subsequent move/up events fire on the button even if the pointer leaves it.
- `pointermove`: compute `dx = e.clientX - startX`, `dy = e.clientY - startY`. If `√(dx² + dy²) > 5px`, set `dragging = true`. While dragging, update container's `left = originLeft + dx`, `top = originTop + dy` (clamped — see §5).
- `pointerup` / `pointercancel`: release pointer capture. If `dragging`, persist final position to localStorage and arm the click-suppressor (§4). Reset state.

### 4. Distinguish click from drag

The third-party `<button>` has an inline `onclick="window.open('https://wa.me/...')"`. After a real drag, that click should NOT fire.

Strategy: when `pointerup` ends a drag, set a flag `suppressNextClick = true`. Register one persistent `click` listener on the button in capture phase that — if the flag is set — calls `e.stopPropagation()` and `e.preventDefault()` and clears the flag, then returns. Otherwise it does nothing and the third-party `onclick` runs.

If movement was below the 5px threshold, the flag is never set, so the original `onclick` fires normally and WhatsApp opens.

### 5. Bounds + resize

After every position update (initial load, drag, restore from localStorage), clamp:

```
left = max(0, min(innerWidth - btnRect.width, left))
top  = max(0, min(innerHeight - btnRect.height, top))
```

Bind a `window.resize` handler that re-clamps the current position so the button doesn't end up off-screen if the viewport shrinks. Use `requestAnimationFrame` to throttle.

### 6. Persistence

- Key: `tyb_whatsapp_pos`
- Value: `JSON.stringify({ left: number, top: number })`
- Write only on `pointerup` after a real drag, not during move (avoid spamming).
- Wrap `localStorage` access in try/catch in case storage is unavailable (private browsing edge cases).

## Failure Modes

| Scenario | Behavior |
|---|---|
| Third-party script blocked (ad-blocker, network) | `<button-tool-widget>` never appears; MutationObserver waits indefinitely but does nothing. No errors. |
| Third-party DOM structure changes (no inner `#button-tool-widget-*` or no `button`) | Query returns null; script no-ops. No errors. |
| `localStorage` unavailable | try/catch around get/set; drag still works for the current session, just doesn't persist. |
| User rotates device / resizes window so button is offscreen | `resize` handler re-clamps to viewport. |
| Multiple `<button-tool-widget>` instances | Apply to the first one found. (Not expected, but defensive.) |

## Out of Scope

- Edge snapping
- A dedicated drag handle separate from the click target
- Drag animations / inertia
- Custom styling of the button itself
- Replacing the third-party script with a native implementation

## Files Touched

- `src/layouts/Layout.astro` — append one inline `<script>` block before `</body>`, ~80 lines.

No other files change.
