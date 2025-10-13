"use client";

import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";

type Props = {
  value?: Date;
  onChange?: (d?: Date) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  buttonClassName
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal gap-2",
            buttonClassName
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
