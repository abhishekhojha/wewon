'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, X } from 'lucide-react' // Modern icons
import Image from 'next/image'

export default function Newsletter() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Timer to show the modal
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Close modal on 'Escape' key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false)
    }
    if (visible) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible])

  // NEW: Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setVisible(false)
      }
    }
    // Bind the event listener
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible]) // Only re-run if 'visible' changes

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="We Won Academy updates"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl sm:p-8"
      >
        {/* --- Close Button --- */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Close modal"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* --- Icon --- */}
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full">
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>

        {/* --- Content --- */}
        <h2 className="mt-5 text-2xl font-semibold text-gray-900">
          Secure Your Dream College Now!
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Get expert counselling, personalized guidance, and the best college options.
        </p>

        {/* --- Actions --- */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push('/counseling')}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Open College predictor"
          >
            Go to Counselling Program
          </button>

          <button
            onClick={() => setVisible(false)}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition-colors hover:bg-gray-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
