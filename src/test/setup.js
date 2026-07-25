import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement IntersectionObserver — needed by framer-motion's
// whileInView (used throughout the Destiny Nation section's scroll-reveal animations).
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = global.IntersectionObserver || MockIntersectionObserver
