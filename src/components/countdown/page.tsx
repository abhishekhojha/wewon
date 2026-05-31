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
    targets: [
        new Date("2026-06-01T00:00:01+05:30"), // June 1st deadline
        new Date("2026-06-02T00:00:01+05:30"), // June 2nd deadline
        new Date("2026-06-03T00:00:01+05:30"), // June 3rd deadline
    ],
};

function getTargetDate(): Date {
    const now = Date.now();
    for (const target of COUNTDOWN_CONFIG.targets) {
        if (target.getTime() > now) {
            return target;
        }
    }
    // Default to the last target if all are in the past
    return COUNTDOWN_CONFIG.targets[COUNTDOWN_CONFIG.targets.length - 1];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isComplete: boolean;
}

// ─── Compute remaining time ───────────────────────────────────────────────────
function computeTimeLeft(): TimeLeft {
    const target = getTargetDate();
    const diff = Math.max(0, target.getTime() - Date.now());
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return { days, hours, minutes, seconds, isComplete: total === 0 };
}

// ─── Hook: countdown ticker ───────────────────────────────────────────────────
function useCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft());

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState !== "hidden") {
                setTimeLeft(computeTimeLeft());
            }
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return timeLeft;
}

// ─── Animated number digit ────────────────────────────────────────────────────
interface DigitProps {
    val: string;
    className?: string;
}

function Digit({ val, className = "" }: DigitProps) {
    return (
        <div className="relative inline-block align-top overflow-hidden">
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
    const timeLeft = useCountdown();
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
        <section className="w-full bg-transparent px-2 pt-12 mb-[-2.25rem] flex justify-center items-center">
            <div className="relative bg-white border border-[#ffe5e5] rounded-[18px] sm:rounded-[24px] shadow-md px-2.5 py-4 min-[360px]:px-3 min-[390px]:px-4.5 sm:px-8 sm:py-6 mx-auto flex flex-col items-center gap-4 sm:gap-6 w-fit max-w-[95%] sm:max-w-none">

                {/* Top Banner / Badge */}
                <div className="flex items-center gap-1.5 sm:gap-3 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-red-100 flex-1"></div>
                    <div className="flex items-center gap-1.5 text-[#ff3b30] font-extrabold tracking-[0.06em] min-[360px]:tracking-[0.09em] sm:tracking-[0.14em] text-[9.5px] min-[360px]:text-[11px] sm:text-[14px] whitespace-nowrap">
                        <Timer className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 text-[#ff3b30] shrink-0" />
                        <span>COUNSELLING PRICES INCREASE IN</span>
                    </div>
                    <div className="h-px bg-gradient-to-l from-transparent to-red-100 flex-1"></div>
                </div>

                {/* Cards row */}
                <div className="flex items-center justify-center gap-[1.1vw] sm:gap-3 md:gap-4.5 w-full">
                    {units.map((u, i) => (
                        <React.Fragment key={u.label}>
                            {i > 0 && (
                                <span className="text-[#ff3b30] text-[4.2vw] sm:text-3xl md:text-4xl font-bold self-center -translate-y-[0.4vw] sm:-translate-y-2.5 px-0.5 sm:px-1.5">
                                    :
                                </span>
                            )}
                            <div className="flex flex-col items-center justify-center rounded-[9px] sm:rounded-[15px] bg-gradient-to-b from-[#ffe6e57d] to-[#fff5f5] border border-[#ffdbdb]/80 w-[14vw] h-[14vw] min-w-[40px] min-h-[40px] max-sm:max-w-[62px] max-sm:max-h-[62px] sm:w-[80px] sm:h-[80px] md:w-[92px] md:h-[92px] shadow-[inset_0_1.5px_8px_rgba(255,255,255,0.6),0_3px_9px_rgba(255,59,48,0.15)] transition-transform duration-300 hover:scale-[1.03] gap-[0.4vw] sm:gap-1 shrink-0">
                                <div className="flex items-center justify-center">
                                    <NumberDisplay 
                                        value={u.value} 
                                        className="text-[4.2vw] sm:text-[2.1rem] md:text-[2.4rem] lg:text-[2.6rem]" 
                                    />
                                </div>
                                <span className="text-[1.9vw] sm:text-[11px] md:text-[12px] font-bold text-primary tracking-wider uppercase">
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