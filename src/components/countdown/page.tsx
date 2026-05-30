"use client";

import React, {
    useState,
    useEffect,
    useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";

// ─── Configuration ───────────────────────────────────────────────────────────
const COUNTDOWN_CONFIG = {
    targetDate: new Date("2026-06-01T00:00:01+05:30"), // IST deadline
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isComplete: boolean;
}

// ─── Compute remaining time ───────────────────────────────────────────────────
function computeTimeLeft(target: Date): TimeLeft {
    const diff = Math.max(0, target.getTime() - Date.now());
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return { days, hours, minutes, seconds, isComplete: total === 0 };
}

// ─── Hook: countdown ticker ───────────────────────────────────────────────────
function useCountdown(target: Date) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(target));

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState !== "hidden") {
                setTimeLeft(computeTimeLeft(target));
            }
        }, 1000);
        return () => clearInterval(id);
    }, [target]);

    return timeLeft;
}

// ─── Animated number digit ────────────────────────────────────────────────────
interface DigitProps {
    val: string;
    className?: string;
}

function Digit({ val, className = "" }: DigitProps) {
    return (
        <div className="relative inline-block align-top">
            {/* Invisible placeholder to establish a firm, uncollapsible container size */}
            <span
                className={`invisible block font-extrabold tabular-nums leading-[1.2] ${className}`}
            >
                8
            </span>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={val}
                    className={`absolute top-0 left-0 right-0 bottom-0 block text-center font-extrabold text-[#ff3b30] tabular-nums leading-[1.2] ${className}`}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
                >
                    {val}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

// ─── Number display (two digits) ──────────────────────────────────────────────
interface NumberDisplayProps {
    value: number;
    className?: string;
}

function NumberDisplay({ value, className = "" }: NumberDisplayProps) {
    const str = String(value).padStart(2, "0");
    return (
        <div className="flex justify-center items-center">
            <Digit val={str[0]} className={className} />
            <Digit val={str[1]} className={className} />
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const CountDown = () => {
    const timeLeft = useCountdown(COUNTDOWN_CONFIG.targetDate);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const units = useMemo(() => [
        { value: timeLeft.days, label: "DAYS" },
        { value: timeLeft.hours, label: "HRS" },
        { value: timeLeft.minutes, label: "MIN" },
        { value: timeLeft.seconds, label: "SEC" },
    ], [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]);

    if (!mounted) return null;

    return (
        <section className="w-full bg-transparent px-3 py-6 md:py-12 flex justify-center items-center">
            <div className="relative bg-white border border-[#ffe5e5] rounded-[24px] sm:rounded-[32px] shadow-lg px-3 py-5 min-[360px]:px-4 min-[390px]:px-6 sm:px-10 sm:py-8 mx-auto flex flex-col items-center gap-5 sm:gap-8 max-w-[95%] sm:max-w-none">

                {/* Top Banner / Badge */}
                <div className="flex items-center gap-2 sm:gap-4 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-red-100 flex-1"></div>
                    <div className="flex items-center gap-1.5 text-[#ff3b30] font-extrabold tracking-[0.25em] min-[360px]:tracking-[0.12em] sm:tracking-[0.18em] text-[9px] min-[360px]:text-[10px] sm:text-[13px] whitespace-nowrap">
                        <Timer className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 text-[#ff3b30] shrink-0" />
                        <span>COUNSELLING PRICES INCREASE IN</span>
                    </div>
                    <div className="h-px bg-gradient-to-l from-transparent to-red-100 flex-1"></div>
                </div>

                {/* Cards row */}
                <div className="flex items-center justify-center gap-1 min-[360px]:gap-2 sm:gap-4 md:gap-6 w-full">
                    {units.map((u, i) => (
                        <React.Fragment key={u.label}>
                            {i > 0 && (
                                <span className="text-[#ff3b30] text-lg min-[360px]:text-xl min-[390px]:text-2xl sm:text-4xl md:text-5xl font-bold self-center -translate-y-1.5 min-[360px]:-translate-y-2 sm:-translate-y-3 px-0.5 min-[360px]:px-1 sm:px-2">
                                    :
                                </span>
                            )}
                            <div className="flex flex-col items-center justify-center rounded-[12px] sm:rounded-[20px] bg-gradient-to-b from-[#ffe6e57d] to-[#fff5f5] border border-[#ffdbdb]/80 w-[60px] h-[60px] min-[360px]:w-[68px] min-[360px]:h-[68px] min-[390px]:w-[76px] min-[390px]:h-[76px] sm:w-[105px] sm:h-[105px] md:w-[120px] md:h-[120px] shadow-[inset_0_2px_10px_rgba(255,255,255,0.6),0_4px_12px_rgba(255,59,48,0.15)] transition-transform duration-300 hover:scale-[1.03] gap-0.5 sm:gap-1.5 shrink-0">
                                <div className="flex items-center justify-center">
                                    <NumberDisplay 
                                        value={u.value} 
                                        className="text-[1.3rem] min-[360px]:text-[1.5rem] min-[390px]:text-[1.7rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.5rem]" 
                                    />
                                </div>
                                <span className="text-[9px] min-[360px]:text-[10px] min-[390px]:text-[11px] sm:text-[14px] md:text-[15px] font-bold text-primary tracking-wider uppercase">
                                    {u.label}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CountDown;