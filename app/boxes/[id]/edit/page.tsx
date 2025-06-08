'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchBoxById, updateBox, MOCK_WAREHOUSES } from '@/services/api';
import { Box, Warehouse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';

const LoadingSpinner: React.FC<{ size?: string; color?: string; message?: string }> = ({
  size = 'h-8 w-8',
  color = 'text-blue-600',
  message,
}) => (
  <div className={`flex flex-col items-center justify-center ${message ? 'space-y-2' : ''}`}>
    <svg
      className={`animate-spin ${size} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    {message && <p className="text-sm text-gray-600">{message}</p>}
  </div>
);


export default function EditBoxPage() {
  const params = useParams();
  const router = useRouter();
  const boxId = params.id as string;

  const [box, setBox] = useState<Box | null>(null);
  const [name, setName] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [initialName, setInitialName] = useState('');
  const [initialWarehouseId, setInitialWarehouseId] = useState('');


  const loadBoxData = useCallback(async () => {
    if (!boxId) {
      toast.error("箱IDが指定されていません。");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedBox = await fetchBoxById(boxId);
      const fetchedWarehouses = MOCK_WAREHOUSES; 
      
      if (fetchedBox) {
        setBox(fetchedBox);
        setName(fetchedBox.name);
        setSelectedWarehouseId(fetchedBox.warehouseId);
        setInitialName(fetchedBox.name);
        setInitialWarehouseId(fetchedBox.warehouseId);
      } else {
        toast.error("指定された箱が見つかりませんでした。");
      }
      setWarehouses(fetchedWarehouses);
    } catch (err) {
      console.error("Failed to load box data:", err);
      toast.error(UI_TEXTS_JP.error);
    } finally {
      setLoading(false);
    }
  }, [boxId]);

  useEffect(() => {
    loadBoxData();
  }, [loadBoxData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!boxId) {
      toast.error("箱IDが不明です。");
      return;
    }
    if (!name.trim()) {
      toast.error(UI_TEXTS_JP.boxNameLabel + "は必須です。");
      return;
    }
    if (!selectedWarehouseId) {
        toast.error(UI_TEXTS_JP.warehouse + "は必須です。");
        return;
    }

    const hasChanged = name !== initialName || selectedWarehouseId !== initialWarehouseId;

    if (!hasChanged) {
        toast.info("変更がありません。");
        return;
    }

    setFormLoading(true);

    const updateData: { name?: string; warehouseId?: string } = {};
    if (name !== initialName) {
        updateData.name = name;
    }
    if (selectedWarehouseId !== initialWarehouseId) {
        updateData.warehouseId = selectedWarehouseId;
    }

    try {
      await updateBox(boxId, updateData);
      toast.success(UI_TEXTS_JP.editBoxSuccessMessage);
      setInitialName(name); // Update initial values to prevent "no changes" on immediate resubmit
      setInitialWarehouseId(selectedWarehouseId);
      setTimeout(() => {
        router.push(`${ROUTE_PATHS.BOXES}/${boxId}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update box:", err);
      const errorMessage = err instanceof Error ? err.message : UI_TEXTS_JP.editBoxErrorMessage;
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-150px)]"><LoadingSpinner message={UI_TEXTS_JP.loading} /></div>;
  }

  if (!box && !loading) {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 text-center text-lg">{UI_TEXTS_JP.noBoxesFound}</p>
            <Button onClick={() => router.push(ROUTE_PATHS.BOXES)} variant="outline" className="mt-6">
                {UI_TEXTS_JP.boxes}
            </Button>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6 text-blue-600 hover:text-blue-800">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{UI_TEXTS_JP.pageTitleEditBox}</CardTitle>
        </CardHeader>
        <CardContent>
          {box && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="boxName" className="block text-sm font-medium text-gray-700 mb-1">
                  {UI_TEXTS_JP.boxNameLabel} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="boxName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={UI_TEXTS_JP.boxNameLabel}
                />
              </div>

              <div>
                <label htmlFor="warehouseId" className="block text-sm font-medium text-gray-700 mb-1">
                  {UI_TEXTS_JP.boxWarehouseLabel} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedWarehouseId}
                  onValueChange={setSelectedWarehouseId}
                  required
                >
                  <SelectTrigger id="warehouseId">
                    <SelectValue placeholder="倉庫を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {box.warehouse?.name && (
                <div>
                    <p className="text-sm text-gray-500">{UI_TEXTS_JP.boxWarehouseLabel}: {box.warehouse?.name}</p>
                </div>
              )}
              <CardFooter className="pt-8 flex justify-end">
                <Button type="submit" disabled={formLoading || loading} className="w-full sm:w-auto">
                  {formLoading ? <LoadingSpinner size="h-5 w-5" /> : UI_TEXTS_JP.editBox}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
