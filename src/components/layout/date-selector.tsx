"use client";

import * as React from "react";
import type { DropdownProps } from "react-day-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function DayPickerDropdown({ value, onChange, options }: DropdownProps) {
    // fallback element jika options undefined
    const items = options?.map((option) => (
        <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
        </SelectItem>
    )) ?? [];

    return (
        <Select
            value={String(value)}
            onValueChange={(val) => {
                onChange?.({
                    target: { value: val },
                } as React.ChangeEvent<HTMLSelectElement>);
            }}
        >
            <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
            </SelectTrigger>

            <SelectContent>
                {items.length > 0 ? items : <SelectItem value="">—</SelectItem>}
            </SelectContent>
        </Select>
    );
}
