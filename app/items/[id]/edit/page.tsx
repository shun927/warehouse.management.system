'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchItemById, updateItem, fetchCategories, fetchBoxes, fetchWarehouses } from '../../../../services/api'; 
import { Item, ItemType, Box, Warehouse, Category } from '../../../../types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UI_TEXTS_JP, ROUTE_PATHS, DEFAULT_IMAGE_URL } from '../../../../constants'; 
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Helper function to get display name for ItemType
const getItemTypeDisplay = (type: ItemType) => {
  switch (type) {
    case ItemType.UNIQUE: return "単品";
    case ItemType.COUNTABLE: return "数量管理品";
    case ItemType.CONSUMABLE: return "消耗品";
    default: return type;
  }
};

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = typeof params.id === 'string' ? params.id : undefined;

  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [itemType, setItemType] = useState<ItemType>(ItemType.COUNTABLE);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [warehouseName, setWarehouseName] = useState<string>('');
  
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState<boolean>(true); // For initial data load
  const [formLoading, setFormLoading] = useState<boolean>(false); // For form submission
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false); // To track if form has changes

  const loadItemData = useCallback(async () => {
    if (!itemId) {
      toast.error("部品IDが指定されていません。");
      setLoading(false);
      router.push(ROUTE_PATHS.ITEMS);
      return;
    }
    setLoading(true);
    try {
      // Replaced MOCK_BOXES and MOCK_WAREHOUSES with actual API calls
      const [fetchedItem, fetchedBoxesData, fetchedCategoriesData, fetchedWarehousesData] = await Promise.all([
        fetchItemById(itemId),
        fetchBoxes(), 
        fetchCategories(),
        fetchWarehouses() 
      ]);
      
      setBoxes(fetchedBoxesData);
      setCategories(fetchedCategoriesData);
      setWarehouses(fetchedWarehousesData);
      
      if (fetchedItem) {
        setItem(fetchedItem);
        setName(fetchedItem.name);
        setDescription(fetchedItem.description || '');
        setImageUrl(fetchedItem.imageUrl || '');
        setQuantity(fetchedItem.quantity);
        setItemType(fetchedItem.type);
        setSelectedBoxId(fetchedItem.boxId || '');
        setSelectedCategoryId(fetchedItem.categoryId || '');
        
        if (fetchedItem.boxId) {
            const box = fetchedBoxesData.find(b => b.id === fetchedItem.boxId);
            if (box) {
                const wh = fetchedWarehousesData.find(w => w.id === box.warehouseId);
                setWarehouseName(wh?.name || UI_TEXTS_JP.unknownWarehouse);
            }
        } else {
            setWarehouseName('');
        }
      } else {
        toast.error("指定された部品が見つかりませんでした。");
        router.push(ROUTE_PATHS.ITEMS);
      }
    } catch (err) {
      console.error("Failed to load item data:", err);
      toast.error(UI_TEXTS_JP.itemFetchError);
      router.push(ROUTE_PATHS.ITEMS);
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    loadItemData();
  }, [loadItemData]);

  useEffect(() => {
    if (itemType === ItemType.UNIQUE) {
      setQuantity(1);
    }
  }, [itemType]);

  useEffect(() => {
    if (selectedBoxId) {
      const selectedBox = boxes.find(b => b.id === selectedBoxId);
      if (selectedBox) {
        const wh = warehouses.find(w => w.id === selectedBox.warehouseId);
        setWarehouseName(wh?.name || UI_TEXTS_JP.unknownWarehouse);
      } else {
        setWarehouseName(''); // Box not found, clear warehouse name
      }
    } else {
      setWarehouseName(''); // No box selected, clear warehouse name
    }
  }, [selectedBoxId, boxes, warehouses]);

  useEffect(() => {
    if (!item) {
      setIsFormDirty(false);
      return;
    }

    const nameChanged = name !== item.name;
    const descriptionChanged = description !== (item.description || '');
    const imageUrlChanged = (imageUrl || null) !== (item.imageUrl || null);
    const quantityChanged = quantity !== item.quantity;
    const itemTypeChanged = itemType !== item.type;
    const boxIdChanged = (selectedBoxId || null) !== (item.boxId || null);
    const categoryIdChanged = selectedCategoryId !== (item.categoryId || '');

    setIsFormDirty(
      nameChanged ||
      descriptionChanged ||
      imageUrlChanged ||
      quantityChanged ||
      itemTypeChanged ||
      boxIdChanged ||
      categoryIdChanged
    );
  }, [name, description, imageUrl, quantity, itemType, selectedBoxId, selectedCategoryId, item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!itemId || !item) {
      toast.error("部品情報が読み込まれていません。");
      return;
    }
    if (!name.trim()) {
      toast.error(UI_TEXTS_JP.itemName + "は必須です。");
      return;
    }
    if (quantity < 0 && itemType !== ItemType.UNIQUE) {
        toast.error(UI_TEXTS_JP.quantity + "は0以上である必要があります。");
        return;
    }
    if (!selectedCategoryId) {
      toast.error(UI_TEXTS_JP.validationErrorMessages.categoryRequired);
      return;
    }

    setFormLoading(true);

    const updatedItemData: Partial<Item> = {};
    if (name !== item.name) updatedItemData.name = name;
    if (description !== (item.description || '')) updatedItemData.description = description;
    // Handle empty string for imageUrl to allow clearing it, only if changed
    if ((imageUrl || null) !== (item.imageUrl || null)) {
      updatedItemData.imageUrl = imageUrl === '' ? null : imageUrl; 
    }
    if (quantity !== item.quantity) updatedItemData.quantity = quantity;
    if (itemType !== item.type) updatedItemData.type = itemType;
    // Handle empty string for boxId to allow clearing it (set to null), only if changed
    if ((selectedBoxId || null) !== (item.boxId || null)) {
      updatedItemData.boxId = selectedBoxId === '' ? null : selectedBoxId;
    }
    if (selectedCategoryId !== (item.categoryId || '')) updatedItemData.categoryId = selectedCategoryId;

    try {
      await updateItem(itemId, updatedItemData); // Mock API call
      toast.success(UI_TEXTS_JP.itemSaveSuccess);
      setTimeout(() => {
        router.push(`${ROUTE_PATHS.ITEMS}/${itemId}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update item:", err);
      const errorMessage = err instanceof Error ? err.message : UI_TEXTS_JP.itemSaveError;
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p>{UI_TEXTS_JP.loadingItems}</p>
        </div>
      </div>
    );
  }

  if (!item) { // Handles case where item is not found after loading attempt
    return (
        <div className="container mx-auto p-4 text-center">
             <Button variant="ghost" onClick={() => router.push(ROUTE_PATHS.ITEMS)} className="mb-6">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                部品一覧へ戻る
            </Button>
            <p className="text-destructive bg-destructive/10 p-4 rounded-md">{UI_TEXTS_JP.noItemsFound}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{UI_TEXTS_JP.pageTitleEditItem}</CardTitle>
        </CardHeader>
        <CardContent>
          {item && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium mb-1">
                  {UI_TEXTS_JP.itemName} <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  id="itemName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="例: 高性能モーターX1"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  {UI_TEXTS_JP.description}
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="部品の詳細な説明を入力..."
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                  {UI_TEXTS_JP.imageUrlLabel}
                </label>
                <Input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                />
                <div className="mt-2 w-full max-h-48 relative aspect-video">
                  <Image 
                    src={imageUrl || item.imageUrl || DEFAULT_IMAGE_URL} 
                    alt={name || UI_TEXTS_JP.placeholderImagePreview}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain rounded-md border p-1 bg-muted/30"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== DEFAULT_IMAGE_URL) {
                            target.src = DEFAULT_IMAGE_URL;
                        }
                    }}
                  />
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="itemType" className="block text-sm font-medium mb-1">
                    {UI_TEXTS_JP.itemType} <span className="text-destructive">*</span>
                  </label>
                  <Select 
                    value={itemType} 
                    onValueChange={(value) => setItemType(value as ItemType)}
                    required
                  >
                    <SelectTrigger id="itemType">
                      <SelectValue placeholder="種類を選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ItemType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getItemTypeDisplay(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                    {UI_TEXTS_JP.quantity} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                    min={itemType === ItemType.UNIQUE ? 1 : 0}
                    disabled={itemType === ItemType.UNIQUE}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                  {UI_TEXTS_JP.categoryLabelForItem} <span className="text-destructive">*</span>
                </label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="カテゴリを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="boxId" className="block text-sm font-medium mb-1">
                    {UI_TEXTS_JP.boxLabel}
                  </label>
                  <Select 
                    value={selectedBoxId} 
                    onValueChange={setSelectedBoxId}
                  >
                    <SelectTrigger id="boxId">
                      <SelectValue placeholder={UI_TEXTS_JP.boxLabelForItem} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{UI_TEXTS_JP.noBoxSelected}</SelectItem> {/* Option to unassign box */}
                      {boxes.map((box) => (
                        <SelectItem key={box.id} value={box.id}>
                          {box.name} ({box.warehouse ? box.warehouse.name : UI_TEXTS_JP.boxWarehouseLabel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {UI_TEXTS_JP.warehouse}
                  </label>
                  <Input
                    type="text"
                    value={warehouseName}
                    readOnly
                    disabled
                    placeholder={UI_TEXTS_JP.placeholderWarehouse}
                    className="bg-muted/50"
                  />
                </div>
              </div>
            
              <div className="pt-4">
                <Button type="submit" disabled={formLoading || !isFormDirty} className="w-full">
                  {formLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {UI_TEXTS_JP.loading}</>
                  ) : UI_TEXTS_JP.saveItem}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
