'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPickerDropdown } from '@/components/layout/date-selector';
import { Button } from "@/components/ui/button"

interface DateFieldProps {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
}

export function DateField({ value, onChange, required }: DateFieldProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value) : undefined;

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;

            if (
                wrapperRef.current?.contains(target) ||
                target.closest('[data-slot="select-content"]')
            ) {
                return;
            }

            // ✅ Klik di luar -> tutup
            setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const currentYear = new Date().getFullYear();


    return (
        <div className="relative" ref={wrapperRef}>
            {/* Input Trigger */}
            <input
                type="text"
                readOnly
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onClick={() => setOpen((prev) => !prev)}
                placeholder="Select date"
                className="glass border-0 h-11 w-full px-3 rounded-md cursor-pointer"
                required={required}
            />

            {/* Calendar with animation */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-2 bg-card p-4 rounded-xl shadow-lg"
                    >
                        <DayPicker
                            animate
                            navLayout="around"
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (!date) return;
                                onChange(format(date, 'yyyy-MM-dd'));
                                setOpen(false);
                            }}
                            components={{
                                Dropdown: DayPickerDropdown,
                            }}
                            captionLayout="dropdown"
                            fromYear={currentYear - 10}
                            toYear={currentYear + 10}
                            footer={
                                <div className="flex justify-end border-t pt-3 mt-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            onChange('');
                                            setOpen(false);
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
