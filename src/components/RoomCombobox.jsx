import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

import { Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

const RoomCombobox = ({ rooms, selectedRoom, onSelectRoom }) => {
  const [open, setOpen] = useState(false);

  const roomOptions = rooms.map(room => ({ label: room, value: room }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedRoom
            ? roomOptions.find((room) => room.value === selectedRoom)?.label
            : "Select room..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search room..." />
          <CommandList>
            <CommandEmpty>No room found.</CommandEmpty>
            <CommandGroup>
              {roomOptions.map((room) => (
                <CommandItem
                  key={room.value}
                  value={room.value}
                  onSelect={(currentValue) => {
                    onSelectRoom(currentValue === selectedRoom ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedRoom === room.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {room.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RoomCombobox;