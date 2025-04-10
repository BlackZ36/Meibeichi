import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { addCategory, deleteCategory, getAllCategories } from "@/services/CategoryService";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

export function Combobox({ value, onValueChange, placeholder, className, error }) {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedOption, setselectedOption] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getAllCategories();
      console.log("categories", response);

      setTypes(response);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setselectedOption(types.find((option) => option.value === value));
    fetchData();
    setIsLoading(false);
  }, []);

  // Handle adding a custom value
  const handleAddCustomValue = async () => {
    if (isAddingNew) {
      setIsLoading(true);
      if (newValue.trim()) {
        const categoryData = {
          name: newValue,
          value: newValue.toLowerCase(),
        };

        try {
          const addedCategory = await addCategory(categoryData);
          fetchData();
          onValueChange(addedCategory.name); // hoặc chỉ truyền `addedCategory.value` nếu bạn chỉ cần value
          setNewValue("");
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to add category", error);
          setIsLoading(false);
        }
      }
      setIsAddingNew(false);
    } else {
      setIsAddingNew(true);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setIsLoading(true);
    try {
      await deleteCategory(categoryId);
      fetchData();
      onValueChange(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to delete category", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-muted-foreground/20 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", error && "border border-red-500", className)}>
          {value ? selectedOption?.label || value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {types &&
                types.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      onValueChange(option.name);
                      setOpen(false);
                    }}
                    className="w-[200px] flex flex-row justify-between p-0"
                  >
                    <Check className={cn("mr-4 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-red-500"
                      onClick={() => {
                        handleDeleteCategory(option.id);
                        onValueChange("");
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CommandItem>
                ))}

              {isAddingNew ? (
                <div className="flex items-center gap-2 p-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Nhập giá trị mới"
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddCustomValue();
                        setOpen(false);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      handleAddCustomValue();
                      setOpen(false);
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              ) : (
                <CommandItem onSelect={handleAddCustomValue} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm mới
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
