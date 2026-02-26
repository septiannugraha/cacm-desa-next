'use client'

import { motion } from 'framer-motion'
import React from 'react'

export default function PremiumButton({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      {children}
    </motion.button>
  )
}