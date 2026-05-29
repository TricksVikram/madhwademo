

# Subtle pulse glow and fuller-screen floor map

## Changes

### 1. Tone down the pulse animation (`BookingCanvasObjectRenderer.tsx`)
- Reduce opacity range from `0.08–0.20` to `0.03–0.08` (barely perceptible)
- Slow the period from `2000ms` to `3500ms` for a gentle breathe effect
- Shrink the glow spread from `±3px` to `±2px`

### 2. Make the floor map taller (`FloorMapCanvas.tsx`)
- Change the container height from `60vh / minHeight 400px` to `calc(100vh - 12rem) / minHeight 500px` so the map fills most of the viewport below the header and toolbar

### 3. Reduce page chrome (`FloorMapPage.tsx`)
- Tighten `space-y-4` to `space-y-2` between the header controls and the map to give more vertical room to the canvas

## Files
| File | Change |
|---|---|
| `BookingCanvasObjectRenderer.tsx` | Lower pulse opacity range, slower period, smaller spread |
| `FloorMapCanvas.tsx` | Increase container height to near-fullscreen |
| `FloorMapPage.tsx` | Reduce vertical spacing |

~10 lines changed across 3 files.

