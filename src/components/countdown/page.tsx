"use client";

import React, {
    useState,
    useEffect,
    useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

// ─── Configuration ───────────────────────────────────────────────────────────
// Single deadline: July 3rd, end of day (11:59:59 PM IST)
const DEADLINE = new Date("2026-07-03T23:59:59+05:30");

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
    const diff = Math.max(0, DEADLINE.getTime() - Date.now());
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
    tone: "navy" | "white";
    className?: string;
}

function Digit({ val, tone, className = "" }: DigitProps) {
    const color = tone === "white" ? "text-white" : "text-[#ff3b30]";
    return (
        <div className="relative inline-block align-top overflow-hidden">
            <span
                className={`invisible block font-bold tabular-nums leading-none ${className}`}
            >
                8
            </span>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={val}
                    className={`absolute top-0 left-0 right-0 bottom-0 block text-center font-bold tabular-nums leading-none ${color} ${className}`}
                    initial={{ y: "60%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
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
    tone: "navy" | "white";
    className?: string;
}

function NumberDisplay({ value, tone, className = "" }: NumberDisplayProps) {
    const str = String(value).padStart(2, "0");
    return (
        <div className="flex justify-center items-center">
            <Digit val={str[0]} tone={tone} className={className} />
            <Digit val={str[1]} tone={tone} className={className} />
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const CountDown = () => {
    const timeLeft = useCountdown();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const units = useMemo(() => [
        { value: timeLeft.days, label: "days", tone: "navy" as const },
        { value: timeLeft.hours, label: "hrs", tone: "navy" as const },
        { value: timeLeft.minutes, label: "min", tone: "navy" as const },
        { value: timeLeft.seconds, label: "sec", tone: "white" as const },
    ], [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]);

    if (!mounted) return null;

    if (timeLeft.isComplete) {
        return (
            <section className="w-full bg-transparent px-2 pt-2 mb-[-2.25rem] flex justify-center items-center">
                <div className="bg-white border border-[#0d3a66]/10 rounded-2xl shadow-sm px-8 py-5 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#0d3a66]/50 shrink-0" />
                    <span className="text-sm sm:text-base font-medium text-[#0d3a66]/70">
                        Counselling prices have increased
                    </span>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-transparent px-2 pt-2 mb-[-2.25rem] mt-4 flex justify-center items-center">
            <div className="bg-white border border-[#0d3a66]/10 rounded-[24px] sm:rounded-[32px] shadow-md px-6 py-5 min-[390px]:px-8 sm:px-12 sm:py-7 mx-auto flex flex-col items-center gap-3.5 sm:gap-5 w-fit max-w-[95%] sm:max-w-none">

                {/* Eyebrow */}
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff3b30] shrink-0" />
                    <span className="text-[11px] min-[390px]:text-[12px] sm:text-[15px] font-bold tracking-[0.1em] uppercase text-[#0d3a66]">
                        Counselling prices increase in
                    </span>
                </div>

                {/* Cards row */}
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                    {units.map((u, i) => (
                        <React.Fragment key={u.label}>
                            {i > 0 && (
                                <span className="text-[#0d3a66]/20 text-xl sm:text-4xl font-bold self-center px-0.5">
                                    :
                                </span>
                            )}
                            <div
                                className={`flex flex-col items-center justify-center rounded-2xl w-[64px] h-[64px] min-[390px]:w-[72px] min-[390px]:h-[72px] sm:w-[100px] sm:h-[100px] shrink-0 transition-transform duration-200 hover:-translate-y-0.5 shadow-sm ${
                                    u.tone === "white"
                                        ? "bg-[#ff3b30]"
                                        : "bg-[#0d3a66]/[0.04] border border-[#0d3a66]/10"
                                }`}
                            >
                                <NumberDisplay
                                    value={u.value}
                                    tone={u.tone}
                                    className="text-[22px] min-[390px]:text-[26px] sm:text-[38px]"
                                />
                                <span
                                    className={`mt-1 text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase ${
                                        u.tone === "white" ? "text-white/75" : "text-[#0d3a66]/50"
                                    }`}
                                >
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