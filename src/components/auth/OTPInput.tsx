"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    error?: boolean;
}

export function OTPInput({ length = 6, onComplete, error }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputsRef.current[0]) {
            inputsRef.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (error) {
            // Vibrate on error if supported
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
            }
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Allow only last entered character
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Trigger onComplete if filled
        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }

        // Auto-advance
        if (value && index < length - 1 && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
            // Move back on backspace if empty
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);

        if (pastedData.length === length) {
            onComplete(pastedData);
            inputsRef.current[length - 1]?.focus();
        } else {
            inputsRef.current[pastedData.length]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <motion.input
                    key={index}
                    ref={el => { inputsRef.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`
                        w-12 h-14 text-center text-2xl font-bold rounded-xl border bg-void-900 text-white outline-none transition-all
                        ${error
                            ? 'border-red-500/50 focus:border-red-500 ring-red-500/20'
                            : 'border-neural-700 focus:border-neural-500 focus:ring-2 focus:ring-neural-500/20'}
                    `}
                />
            ))}
        </div>
    );
}
