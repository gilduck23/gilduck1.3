"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../lib/utils"

interface Variant {
  id: string
  name: string
  image_url?: string
}

interface VariantSelectProps {
  variants: Variant[]
  selectedVariant: Variant | null
  onSelectVariant: (variant: Variant) => void
}

export default function VariantSelect({ variants, selectedVariant, onSelectVariant }: VariantSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!variants || variants.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No variants available</p>
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="variant-select-label"
      >
        <span className="block truncate">{selectedVariant ? selectedVariant.name : "Select a variant"}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {variants.map((variant) => (
            <li
              key={variant.id}
              className={cn(
                "relative cursor-default select-none py-2 pl-10 pr-4",
                selectedVariant?.id === variant.id
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100"
                  : "text-gray-900 dark:text-gray-100",
              )}
              onClick={() => {
                onSelectVariant(variant)
                setIsOpen(false)
              }}
            >
              <span
                className={cn("block truncate", selectedVariant?.id === variant.id ? "font-medium" : "font-normal")}
              >
                {variant.name}
              </span>
              {selectedVariant?.id === variant.id && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

