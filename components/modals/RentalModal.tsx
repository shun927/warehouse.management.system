"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription, // Added DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Item, ItemType } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onRentalSuccess?: (rental: any) => void;
}

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  item,
  onRentalSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.type === ItemType.UNIQUE ? 1 : 1);
      setDueDate(undefined);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handleRental = async () => {
    if (!dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    if (item.type === ItemType.UNIQUE && quantity !== 1) {
      toast.error("Unique items can only be rented one at a time.");
      return;
    }

    if (item.type !== ItemType.UNIQUE && quantity > item.quantity) {
      toast.error(`Not enough stock. Available: ${item.quantity}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          quantity: quantity,
          dueDate: dueDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create rental");
      }

      toast.success(`${item.name} rented successfully.`);
      if (onRentalSuccess) {
        onRentalSuccess(result);
      }
      onClose();
    } catch (error: any) {
      console.error("Rental error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rent Item: {item.name}</DialogTitle>
          <DialogDescription>
            Select the quantity and due date for your rental.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itemName" className="text-right">
              Item
            </Label>
            <Input id="itemName" value={item.name} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itemType" className="text-right">
              Type
            </Label>
            <Input id="itemType" value={item.type} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="availableQuantity" className="text-right">
              Available
            </Label>
            <Input
              id="availableQuantity"
              value={
                item.type === ItemType.UNIQUE
                  ? item.quantity > 0
                    ? "1"
                    : "0"
                  : item.quantity
              }
              disabled
              className="col-span-3"
            />
          </div>

          {item.type !== ItemType.UNIQUE && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="col-span-3"
                min="1"
                max={item.quantity}
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Added Date type
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleRental} disabled={isLoading || !dueDate}>
            {isLoading ? "Renting..." : "Confirm Rental"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalModal;
