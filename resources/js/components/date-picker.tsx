"use client";

import * as React from "react";
import { format } from "date-fns";
import { startOfToday } from "date-fns";               // ⬅️ batas tanggal
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value?: Date;
  onChange?: (d?: Date) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal & waktu",
  className,
  buttonClassName,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const hh = value ? value.getHours() : 9;
  const mm = value ? value.getMinutes() : 0;
  const [time, setTime] = React.useState(`${pad(hh)}:${pad(mm)}`);

  React.useEffect(() => {
    if (!value) return;
    setTime(`${pad(value.getHours())}:${pad(value.getMinutes())}`);
  }, [value]);

  const combine = (base?: Date, timeStr?: string) => {
    if (!base) return undefined;
    const [h, m] = (timeStr ?? time).split(":").map((x) => parseInt(x || "0", 10));
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const display =
    value ? `${format(value, "PPP")}, ${pad(value.getHours())}:${pad(value.getMinutes())}` : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className={cn(
            "w-full justify-between rounded-xl border-white/70 bg-white/60 backdrop-blur px-3 py-2",
            "data-[empty=true]:text-muted-foreground hover:bg-white/80",
            buttonClassName
          )}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {display ?? <span>{placeholder}</span>}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn("w-auto p-0 rounded-xl border bg-background shadow-lg", className)}
      >
        <div className="flex flex-col gap-2 p-2">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              const next = combine(d ?? undefined);
              onChange?.(next);
            }}
            initialFocus
            // ⬇️ Blokir semua hari sebelum hari ini
            disabled={{ before: startOfToday() }}
            className="rounded-xl"
            classNames={{
              months: "flex flex-col space-y-3 p-2",
              month: "space-y-3",
              caption: "flex items-center justify-between px-2 pt-2",
              caption_label: "text-sm font-semibold",
              nav: "flex items-center gap-1",
              nav_button:
                "h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground",
              table: "w-full border-collapse",
              head_row: "grid grid-cols-7 gap-1 px-2",
              head_cell:
                "text-[11px] font-medium text-muted-foreground h-7 grid place-items-center",
              row: "grid grid-cols-7 gap-1 px-2 pb-2",
              cell: "relative p-0",
              day: "h-9 w-9 grid place-items-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "ring-1 ring-primary",
              day_outside: "text-muted-foreground/50",
              day_disabled: "opacity-40 cursor-not-allowed", // tampilan nonaktif
            }}
          />

          {/* Time picker */}
          <div className="flex items-center gap-2 px-2 pb-2">
            <label htmlFor="time" className="text-xs text-muted-foreground">
              Waktu
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => {
                const v = e.target.value;
                setTime(v);
                const next = combine(value ?? new Date(), v);
                onChange?.(next);
              }}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            />
            <Button size="sm" className="ml-auto rounded-md" onClick={() => setOpen(false)}>
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
