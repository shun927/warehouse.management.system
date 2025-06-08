// filepath: c:\\Users\\popco\\project\\shiba-lab-倉庫管理システムv2\\app\\items\\new\\page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner"; // Using sonner for toasts
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';
import { Category, Box, ItemType } from '@/types'; // Using actual types

// Mock API functions - replace with your actual API calls
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 'cat1', name: 'Electronics' },
    { id: 'cat2', name: 'Tools' },
    { id: 'cat3', name: 'Office Supplies' },
  ]), 500));
};

const fetchBoxes = async (): Promise<Box[]> => {
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 'box1', name: 'Shelf A-1', warehouseId: 'wh1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'box2', name: 'Cabinet B-3', warehouseId: 'wh1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'box3', name: 'Storage Room C', warehouseId: 'wh2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]), 500));
};

const createItem = async (itemData: any): Promise<{ success: boolean; message?: string }> => {
  // Simulate API call
  console.log("Submitting item:", itemData);
  return new Promise(resolve => setTimeout(() => {
    if (Math.random() > 0.2) {
      resolve({ success: true });
    } else {
      resolve({ success: false, message: "Failed to save item to the server." });
    }
  }, 1000));
};


export default function AddNewItemPage() {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [itemType, setItemType] = useState<ItemType | ''>(ItemType.COUNTABLE); // Default to COUNTABLE or an appropriate default
  const [categoryId, setCategoryId] = useState<string | ''>('');
  const [boxId, setBoxId] = useState<string | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cats, bxs] = await Promise.all([fetchCategories(), fetchBoxes()]);
        setCategories(cats);
        setBoxes(bxs);
      } catch (error) {
        console.error("Failed to load categories or boxes", error);
        toast.error("カテゴリまたは箱の読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!itemName.trim()) newErrors.itemName = UI_TEXTS_JP.validationErrorMessages.nameRequired;
    if (quantity === '' || quantity === null) newErrors.quantity = UI_TEXTS_JP.validationErrorMessages.quantityRequired;
    else if (isNaN(Number(quantity))) newErrors.quantity = UI_TEXTS_JP.validationErrorMessages.quantityMustBeNumber;
    else if (Number(quantity) < 1) newErrors.quantity = UI_TEXTS_JP.validationErrorMessages.quantityMin;
    if (!itemType) newErrors.itemType = UI_TEXTS_JP.validationErrorMessages.typeRequired;
    if (!categoryId) newErrors.categoryId = UI_TEXTS_JP.validationErrorMessages.categoryRequired;
    if (imageUrl && !/^https?:\/\/.+\..+/.test(imageUrl)) newErrors.imageUrl = UI_TEXTS_JP.validationErrorMessages.imageUrlInvalid;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("入力内容にエラーがあります。確認してください。");
      return;
    }

    setIsLoading(true);
    try {
      const newItemData = {
        name: itemName,
        description,
        quantity: Number(quantity),
        type: itemType,
        categoryId,
        boxId: boxId || null, 
        imageUrl,
        notes,
      };
      const response = await createItem(newItemData);
      if (response.success) {
        toast.success(UI_TEXTS_JP.addItemSuccessMessage);
        router.push(ROUTE_PATHS.ITEMS);
      } else {
        toast.error(response.message || UI_TEXTS_JP.addItemErrorMessage);
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error(UI_TEXTS_JP.addItemErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get display names for ItemType enum
  const getItemTypeDisplayName = (type: ItemType) => {
    switch (type) {
      case ItemType.UNIQUE: return "一点物";
      case ItemType.COUNTABLE: return "数量管理";
      case ItemType.CONSUMABLE: return "消耗品";
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{UI_TEXTS_JP.addNewItemPageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="itemName">{UI_TEXTS_JP.itemNameLabel}</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!errors.itemName}
              />
              {errors.itemName && <p className="text-sm text-red-500 mt-1">{errors.itemName}</p>}
            </div>

            <div>
              <Label htmlFor="description">{UI_TEXTS_JP.descriptionLabel}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="quantity">{UI_TEXTS_JP.quantityLabel}</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                disabled={isLoading}
                aria-invalid={!!errors.quantity}
              />
              {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <Label htmlFor="itemType">{UI_TEXTS_JP.itemTypeLabel}</Label>
              <Select
                value={itemType}
                onValueChange={(value) => setItemType(value as ItemType)}
                disabled={isLoading}
              >
                <SelectTrigger id="itemType" aria-invalid={!!errors.itemType}>
                  <SelectValue placeholder="種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ItemType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getItemTypeDisplayName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemType && <p className="text-sm text-red-500 mt-1">{errors.itemType}</p>}
            </div>
            
            <div>
              <Label htmlFor="category">{UI_TEXTS_JP.categoryLabelForItem}</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value)}
                disabled={isLoading || categories.length === 0}
              >
                <SelectTrigger id="category" aria-invalid={!!errors.categoryId}>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <Label htmlFor="box">{UI_TEXTS_JP.boxLabelForItem}</Label>
              <Select
                value={boxId}
                onValueChange={(value) => setBoxId(value)}
                disabled={isLoading || boxes.length === 0}
              >
                <SelectTrigger id="box">
                  <SelectValue placeholder="保管箱を選択 (任意)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{UI_TEXTS_JP.noBoxSelected}</SelectItem>
                  {boxes.map((box) => (
                    <SelectItem key={box.id} value={box.id}>
                      {box.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">{UI_TEXTS_JP.imageUrlLabelForItem}</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={isLoading}
                aria-invalid={!!errors.imageUrl}
              />
              {errors.imageUrl && <p className="text-sm text-red-500 mt-1">{errors.imageUrl}</p>}
            </div>

            <div>
              <Label htmlFor="notes">{UI_TEXTS_JP.notesLabel}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="特記事項があれば入力"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? UI_TEXTS_JP.loading : UI_TEXTS_JP.submitAddItem}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            {UI_TEXTS_JP.cancel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
