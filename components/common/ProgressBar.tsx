'use client'

import React from 'react'
import { useEffect, useState } from 'react'

export function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function updateScroll() {
      const currentScrollY = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight
      if (scrollHeight) {
        setProgress(Number((currentScrollY / scrollHeight).toFixed(2)) * 100)
      }
    }
    window.addEventListener('scroll', updateScroll)

    return () => {
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])
  return progress
}

export default function ProgressBar() {
  const progress = useReadingProgress()
  return (
    <div
      style={{
        transform: `translateX(${progress - 100}%)`,
      }}
      className="fixed left-0 top-0 z-10 h-1 w-full bg-primary-500 backdrop-blur-3xl transition-transform duration-75"
    />
  )
}
