'use client'

import { useState, useEffect } from 'react'

export default function Typewriter({ 
  text = "Welcome to the looping typewriter effect!", 
  speed = 100,
  pauseDuration = 2000 
}) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
    } else if (isDeleting) {
      if (displayText) {
        timer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1))
        }, speed / 2)
      } else {
        setIsDeleting(false)
        setCurrentIndex(0)
      }
    } else if (currentIndex < text.length) {
      timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
    } else {
      setIsPaused(true)
    }

    return () => clearTimeout(timer)
  }, [currentIndex, displayText, isDeleting, isPaused, text, speed, pauseDuration])

  return (
    <p aria-live="polite">
      <span className='text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500'>{displayText}</span>
      <span>|</span>
    </p>
  )
}
