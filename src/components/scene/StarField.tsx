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

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
      initStars(canvas.offsetWidth, canvas.offsetHeight)
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }

    handleResize()
    handleScroll()

    const tint = getTimeOfDayHue()

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

        // Draw star with time-of-day tint
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, star.size * 2)
        gradient.addColorStop(0, `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${alpha * 0.3})`)
        gradient.addColorStop(1, `rgba(${tint.r}, ${tint.g}, ${tint.b}, 0)`)

        ctx.beginPath()
        ctx.arc(px, py, star.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
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

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('scroll', handleScroll)
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
