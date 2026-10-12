import { useMotionValue, useSpring } from 'framer-motion'
import { useIsCoarsePointer, usePrefersReducedMotion } from './useMediaQuery'

// A subtle magnetic pull toward the cursor — used sparingly (the three
// primary mode-entry buttons only, not every button site-wide) so it reads
// as a premium touch rather than a gimmick applied everywhere. Naturally a
// no-op on touch (no hover/mousemove to react to) and explicitly disabled
// under prefers-reduced-motion.
//
// Takes the target ref rather than creating and returning one itself —
// bundling a ref inside a returned object alongside other values reads as
// an unsafe ref access to React's stricter hook linting, even though only
// the ref *object* (never `.current`) is touched during render. Accepting
// it as a parameter keeps the ref entirely in the caller's own component,
// where `ref={myRef}` is always the standard, always-allowed pattern.
//
// maxOffset hard-caps how far the pull can ever move the element, in
// pixels, regardless of how big the element is or how close the cursor
// gets to its edge. Without this, strength * distance-from-center scales
// with the element's own size — on a wide element like a mode card,
// strength 0.2 alone could produce ~24px of pull, more than the 20px gap
// between cards in the grid, so at the edge of one card it could visually
// overlap its neighbor. The cap keeps the pull proportionally subtle and
// guarantees it stays well inside the layout's own spacing regardless of
// element size.
export function useMagnetic(ref, strength = 0.25, maxOffset = 8) {
  const coarse = useIsCoarsePointer()
  const reducedMotion = usePrefersReducedMotion()
  const disabled = coarse || reducedMotion

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 })

  if (disabled) {
    return { style: {}, onMouseMove: undefined, onMouseLeave: undefined }
  }

  const clamp = (v) => Math.max(-maxOffset, Math.min(maxOffset, v))

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set(clamp((e.clientX - (rect.left + rect.width / 2)) * strength))
    y.set(clamp((e.clientY - (rect.top + rect.height / 2)) * strength))
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { style: { x: springX, y: springY }, onMouseMove, onMouseLeave }
}
