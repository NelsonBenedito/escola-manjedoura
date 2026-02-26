import React from 'react';
import { motion } from 'framer-motion';

export default function RotationButton({ item, href }) {
    return (
        <motion.a
            href={href}
            initial="initial"
            whileHover="hover"
            className="relative flex items-center justify-center cursor-pointer group px-4 py-2"
            style={{ transformPerspective: 1200 }}
        >
            {/* Container for the 3D space */}
            <div className="relative flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>

                {/* Arm 1 (Default Text) */}
                <motion.div
                    className="relative z-10 text-[11px] tracking-[0.2em] font-medium text-white uppercase origin-right"
                    variants={{
                        initial: { rotate: 0, opacity: 1, y: 0 },
                        hover: { rotate: 25, opacity: 0, y: -5 }
                    }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                >
                    {item}
                </motion.div>

                {/* Arm 2 (Background Pill) */}
                <motion.div
                    className="absolute inset-x-[-12px] inset-y-[-6px] z-0 bg-white/10 rounded-full origin-right"
                    variants={{
                        initial: { rotate: -18, opacity: 0, scale: 0.9 },
                        hover: { rotate: 0, opacity: 1, scale: 1 }
                    }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                />

                {/* Arm 3 (Hover Text) */}
                <motion.div
                    className="absolute z-20 text-[11px] tracking-[0.2em] font-medium text-spiritual-gold uppercase origin-right"
                    variants={{
                        initial: { rotate: -35, opacity: 0, scale: 0.6 },
                        hover: { rotate: 0, opacity: 1, scale: 1 }
                    }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5, delay: 0.025 }}
                >
                    {item}
                </motion.div>
            </div>
        </motion.a>
    );
}
