'use client'

import React, { useEffect, useRef } from 'react'
import Typed from 'typed.js'

export default function TypewriterEffect() {
  const el = useRef(null)

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        'Chat with any doc',
        'in real-time',
      ],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 2000,
      startDelay: 500,
      showCursor: true,
      loop: true
    })

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy()
    }
  }, [])

  return (
    <p aria-live="polite">
      <span ref={el} className='text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500' />
    </p>
  )
}
