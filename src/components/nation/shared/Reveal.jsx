'use client'
import { motion } from 'framer-motion'

// Scroll-triggered fade/slide reveal, used to give every section on the Nation
// site a subtle motion entrance instead of appearing all at once.
export default function Reveal({ children, delay = 0, y = 24, className = '', style, as = 'div' }) {
  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
