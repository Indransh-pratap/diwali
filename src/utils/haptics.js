// Safe mobile haptic feedback helper
export function triggerHaptic(pattern = 25) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Ignore if not supported
    }
  }
}
