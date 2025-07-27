"use client"

import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current

    if (!cursor || !follower) return

    let mouseX = 0
    let mouseY = 0
    let followerX = 0
    let followerY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      cursor.style.left = `${mouseX}px`
      cursor.style.top = `${mouseY}px`
    }

    const handleMouseEnter = () => {
      cursor.classList.add("cursor-hover")
      follower.classList.add("cursor-hover")
    }

    const handleMouseLeave = () => {
      cursor.classList.remove("cursor-hover")
      follower.classList.remove("cursor-hover")
    }

    const animateFollower = () => {
      const dx = mouseX - followerX
      const dy = mouseY - followerY

      followerX += dx * 0.1
      followerY += dy * 0.1

      follower.style.left = `${followerX}px`
      follower.style.top = `${followerY}px`

      requestAnimationFrame(animateFollower)
    }

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]')

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    document.addEventListener("mousemove", handleMouseMove)
    animateFollower()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={followerRef} className="custom-cursor-follower" />
    </>
  )
}
