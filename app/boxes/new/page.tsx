'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addBox, MOCK_WAREHOUSES } from '../../../services/api'; // Adjusted path
import { Warehouse } from '../../../types'; // Adjusted path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UI_TEXTS_JP, ROUTE_PATHS } from '../../../constants'; // Adjusted path
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function AddNewBoxPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  // Error and success states are handled by toast notifications

  useEffect(() => {
    setWarehouses(MOCK_WAREHOUSES);
    // Optionally pre-select first warehouse, but usually better to let user choose
    // if (MOCK_WAREHOUSES.length > 0) {
    //     setSelectedWarehouseId(MOCK_WAREHOUSES[0].id);
    // }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(UI_TEXTS_JP.boxName + "は必須です。");
      return;
    }
    if (!selectedWarehouseId) {
      toast.error(UI_TEXTS_JP.warehouse + "は必須です。");
      return;
    }

    setLoading(true);

    const newBoxData = {
      name,
      warehouseId: selectedWarehouseId,
    };

    try {
      await addBox(newBoxData); // This is a mock API call
      toast.success(UI_TEXTS_JP.addBoxSuccessMessage);
      setTimeout(() => {
        router.push(ROUTE_PATHS.BOXES);
      }, 1500);
    } catch (err) {
      console.error("Failed to add box:", err);
      const errorMessage = err instanceof Error ? err.message : UI_TEXTS_JP.addBoxErrorMessage;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{UI_TEXTS_JP.pageTitleNewBox}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="boxName" className="block text-sm font-medium mb-1">
                {UI_TEXTS_JP.boxName} <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                id="boxName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="例: 電子部品セットA"
              />
            </div>
            
            <div>
              <label htmlFor="warehouseId" className="block text-sm font-medium mb-1">
                {UI_TEXTS_JP.warehouse} <span className="text-destructive">*</span>
              </label>
              <Select 
                value={selectedWarehouseId} 
                onValueChange={setSelectedWarehouseId}
                required
              >
                <SelectTrigger id="warehouseId">
                  <SelectValue placeholder="倉庫を選択してください..." />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4"> {/* Adjusted padding */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : UI_TEXTS_JP.addNewBox}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
