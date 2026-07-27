'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMotionLevel } from '@/hooks/useMotionLevel'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinklePhase: number
  twinkleSpeed: number
}

function getTimeOfDayHue(): { r: number; g: number; b: number } {
  const hour = new Date().getHours()
  // Dawn (5-7): warm amber
  if (hour >= 5 && hour < 7) return { r: 255, g: 180, b: 100 }
  // Morning (7-11): bright white-blue
  if (hour >= 7 && hour < 11) return { r: 200, g: 220, b: 255 }
  // Midday (11-15): pure white
  if (hour >= 11 && hour < 15) return { r: 240, g: 240, b: 255 }
  // Afternoon (15-18): golden
  if (hour >= 15 && hour < 18) return { r: 246, g: 196, b: 120 }
  // Dusk (18-21): violet-pink
  if (hour >= 18 && hour < 21) return { r: 180, g: 140, b: 255 }
  // Night (21-5): deep cyan-violet
  return { r: 140, g: 180, b: 255 }
}

interface StarFieldProps {
  className?: string
}

export function StarField({ className }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const scrollRef = useRef(0)
  const rafRef = useRef<number>(0)
  const allowSacred = useMotionLevel('sacred')

  const initStars = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 3000), 400)
    const stars: Star[] = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      })
    }
    starsRef.current = stars
  }, [])

  useEffect(() => {
    if (!allowSacred) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Cached so the scroll handler never reads layout. `scrollHeight` is a
    // layout-forcing read, and because Lenis drives the page with a per-frame
    // `scrollTo`, a native scroll event fires roughly every frame — on the
    // same frames framer-motion is writing new inline transforms, so layout is
    // dirty and the read becomes a genuine forced synchronous reflow.
    let maxScroll = 0

    const measureScrollRange = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight
    }

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars(canvas.offsetWidth, canvas.offsetHeight)
      measureScrollRange()
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    const handleScroll = () => {
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }

    // Document height can change after mount (images, MDX, font swap), so
    // refresh the cached range from a ResizeObserver rather than per scroll.
    const docObserver = new ResizeObserver(measureScrollRange)
    docObserver.observe(document.documentElement)

    handleResize()
    handleScroll()

    const tint = getTimeOfDayHue()

    let isIntersecting = false
    let isRunning = false

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const scroll = scrollRef.current
      const mx = mouseRef.current.x - 0.5
      const my = mouseRef.current.y - 0.5

      // Scroll-driven emergence: deeper scroll = more visible stars
      const emergenceFactor = 0.4 + scroll * 0.6

      for (const star of starsRef.current) {
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        const alpha = star.opacity * twinkle * emergenceFactor

        // Mouse influence: subtle parallax based on star size (depth)
        const parallaxStrength = star.size * 3
        const px = star.x + mx * parallaxStrength
        const py = star.y + my * parallaxStrength

        // A small solid point is much cheaper than allocating a radial
        // gradient for every star on every frame.
        const radius = star.size * 0.75
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${alpha})`
        ctx.fill()

        // Bright core for larger stars
        if (star.size > 1.2) {
          ctx.beginPath()
          ctx.arc(px, py, star.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
          ctx.fill()
        }
      }

      // Subtle nebula glow near center, scroll-reactive
      const nebulaCenterX = w * 0.5 + mx * 30
      const nebulaCenterY = h * 0.35 + my * 20
      const nebulaRadius = Math.min(w, h) * 0.4
      const nebulaGrad = ctx.createRadialGradient(
        nebulaCenterX, nebulaCenterY, 0,
        nebulaCenterX, nebulaCenterY, nebulaRadius
      )
      nebulaGrad.addColorStop(0, `rgba(124, 92, 255, ${0.06 * emergenceFactor})`)
      nebulaGrad.addColorStop(0.5, `rgba(84, 226, 233, ${0.03 * emergenceFactor})`)
      nebulaGrad.addColorStop(1, 'rgba(10, 15, 31, 0)')
      ctx.fillStyle = nebulaGrad
      ctx.fillRect(0, 0, w, h)

      if (isRunning) rafRef.current = requestAnimationFrame(animate)
    }

    const start = () => {
      if (isRunning || document.hidden) return
      isRunning = true
      rafRef.current = requestAnimationFrame(animate)
    }

    const stop = () => {
      isRunning = false
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting
        if (isIntersecting) start()
        else stop()
      },
      { rootMargin: '120px' },
    )

    const handleVisibility = () => {
      if (document.hidden || !isIntersecting) stop()
      else start()
    }

    observer.observe(canvas)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      observer.disconnect()
      docObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [allowSacred, initStars])

  if (!allowSacred) {
    // Still mode: static gradient fallback
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(124,92,255,0.08) 0%, rgba(10,15,31,0) 70%)',
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  )
}
