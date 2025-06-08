"use client"; // Required for useState, useEffect, event handlers

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // shadcn/ui
import { Input } from "@/components/ui/input"; // shadcn/ui
import { Label } from "@/components/ui/label"; // shadcn/ui
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // shadcn/ui
// Assuming Progress component is available or will be added if a visual progress bar is desired.
// For now, using text-based progress. If shadcn/ui Progress is installed, it can be used.
// import { Progress } from "@/components/ui/progress"; 
import { UI_TEXTS_JP, CSV_EXPECTED_HEADERS } from '../../constants';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Item, ItemType, Category, Box as BoxType } from '../../types';
import { addItem as apiAddItem } from '../../services/api';

interface ItemCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  categories: Category[];
  boxes: BoxType[];
}

interface CsvRowData {
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: string;
  type: string;
  categoryId: string;
  boxId?: string;
}

interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: { row: number; message: string }[];
}

const parseCSV = (csvText: string): { headers: string[], rows: string[][] } => {
    const lines = csvText.split(/\\r\\n|\\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => line.split(',').map(field => field.trim()));
    return { headers, rows };
};


export const ItemCsvImportModal: React.FC<ItemCsvImportModalProps> = ({ isOpen, onClose, onImportSuccess, categories, boxes }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setImportResult(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        setError(UI_TEXTS_JP.importErrorInvalidFormat || "無効なファイル形式です。CSVファイルをアップロードしてください。");
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const resetModalState = () => {
    setSelectedFile(null);
    setProcessing(false);
    setProgress(null);
    setImportResult(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError(UI_TEXTS_JP.importErrorNoFile || "ファイルが選択されていません。");
      return;
    }

    setProcessing(true);
    setError(null);
    setImportResult(null);
    setProgress({ current: 0, total: 0 });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) {
        setError(UI_TEXTS_JP.importErrorReadingFile || "ファイルの読み込みに失敗しました。");
        setProcessing(false);
        return;
      }
      
      const { headers, rows } = parseCSV(csvText);
      
      const normalizedExpectedHeaders = CSV_EXPECTED_HEADERS.map(h => h.toLowerCase());
      const allHeadersPresent = normalizedExpectedHeaders.every(expectedHeader => headers.includes(expectedHeader));

      if (!allHeadersPresent) {
          const missingHeaders = normalizedExpectedHeaders.filter(eh => !headers.includes(eh));
          setError(
            (UI_TEXTS_JP.importErrorInvalidHeaders && 
             UI_TEXTS_JP.importErrorInvalidHeaders(CSV_EXPECTED_HEADERS.join(', '), headers.join(', ') + (missingHeaders.length > 0 ? ` (不足: ${missingHeaders.join(', ')})` : ''))) ||
            `無効なCSVヘッダーです。期待されるヘッダー: ${CSV_EXPECTED_HEADERS.join(', ')}。現在のヘッダー: ${headers.join(', ')}` + (missingHeaders.length > 0 ? ` (不足: ${missingHeaders.join(', ')})` : '')
          );
          setProcessing(false);
          return;
      }

      const results: ImportResult = { successCount: 0, failureCount: 0, errors: [] };
      setProgress({ current: 0, total: rows.length });

      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i];
        const rowNumber = i + 2; 

        const itemDataFromCsv: Partial<CsvRowData> = {};
        headers.forEach((header, index) => {
            const expectedHeaderKey = CSV_EXPECTED_HEADERS.find(eh => eh.toLowerCase() === header.toLowerCase());
            if (expectedHeaderKey) {
                (itemDataFromCsv as any)[expectedHeaderKey] = rowData[index];
            }
        });
        
        // --- Validation (using keys from CSV_EXPECTED_HEADERS) ---
        // Ensure CSV_EXPECTED_HEADERS are correctly mapped to CsvRowData keys
        const nameKey = CSV_EXPECTED_HEADERS[0] as keyof CsvRowData; // 'name'
        const descriptionKey = CSV_EXPECTED_HEADERS[1] as keyof CsvRowData; // 'description'
        const imageUrlKey = CSV_EXPECTED_HEADERS[2] as keyof CsvRowData; // 'imageUrl'
        const quantityKey = CSV_EXPECTED_HEADERS[3] as keyof CsvRowData; // 'quantity'
        const typeKey = CSV_EXPECTED_HEADERS[4] as keyof CsvRowData; // 'type'
        const categoryIdKey = CSV_EXPECTED_HEADERS[5] as keyof CsvRowData; // 'categoryId'
        const boxIdKey = CSV_EXPECTED_HEADERS[6] as keyof CsvRowData; // 'boxId'


        if (!itemDataFromCsv[nameKey]?.trim()) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: "部品名(name)は必須です。" });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        if (!itemDataFromCsv[quantityKey]?.trim()) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: "数量(quantity)は必須です。" });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        const quantityNum = parseInt(itemDataFromCsv[quantityKey]!, 10);
        if (isNaN(quantityNum) || quantityNum < 0) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: "数量(quantity)は0以上の有効な数値である必要があります。" });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        const itemTypeRaw = itemDataFromCsv[typeKey]?.trim();
        if (!itemTypeRaw || !Object.values(ItemType).includes(itemTypeRaw.toUpperCase() as ItemType)) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: `種別(type)が無効です。有効な値: ${Object.values(ItemType).join('|')}` });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        const itemTypeEnum = itemTypeRaw.toUpperCase() as ItemType; // Safe due to previous check
        if (itemTypeEnum === ItemType.UNIQUE && quantityNum !== 1) {
            results.failureCount++;
            results.errors.push({ row: rowNumber, message: "単品(UNIQUE)の場合、数量は1である必要があります。" });
            setProgress({ current: i + 1, total: rows.length });
            continue;
        }
        const categoryIdRaw = itemDataFromCsv[categoryIdKey]?.trim();
        if (!categoryIdRaw || !categories.find(c => c.id === categoryIdRaw)) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: "カテゴリID(categoryId)が無効か、見つかりません。" });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        const boxIdRaw = itemDataFromCsv[boxIdKey]?.trim();
        if (boxIdRaw && !boxes.find(b => b.id === boxIdRaw)) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: "箱ID(boxId)が無効か、見つかりません。" });
          setProgress({ current: i + 1, total: rows.length });
          continue;
        }
        // --- End Validation ---
        
        const newItemApiData: Omit<Item, 'id' | 'createdAt' | 'qrCodeUrl' | 'boxName' | 'warehouseName' | 'categoryName'> = {
          name: itemDataFromCsv[nameKey]!,
          description: itemDataFromCsv[descriptionKey] || undefined,
          imageUrl: itemDataFromCsv[imageUrlKey] || undefined,
          quantity: quantityNum,
          type: itemTypeEnum,
          categoryId: categoryIdRaw,
          boxId: boxIdRaw || undefined,
          updatedAt: new Date().toISOString(), // Added to satisfy the type requirement
        };

        try {
          await apiAddItem(newItemApiData);
          results.successCount++;
        } catch (apiError: any) {
          results.failureCount++;
          results.errors.push({ row: rowNumber, message: `APIエラー: ${apiError.message || '不明なエラー'}` });
        }
        setProgress({ current: i + 1, total: rows.length });
      }

      setImportResult(results);
      setProcessing(false);
      if (results.failureCount === 0 && results.successCount > 0) {
        onImportSuccess();
      }
    };
    reader.onerror = () => {
      setError(UI_TEXTS_JP.importErrorReadingFile || "ファイルの読み込み中にエラーが発生しました。");
      setProcessing(false);
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DocumentArrowUpIcon className="h-6 w-6 mr-2 text-primary" />
            {UI_TEXTS_JP.csvImportItemsTitle || "CSV一括登録"}
          </DialogTitle>
          <DialogDescription>
            {UI_TEXTS_JP.csvImportDescription || "CSVファイルを使用して部品を一括登録します。"} 
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationCircleIcon className="h-5 w-5" />
            <AlertTitle>{UI_TEXTS_JP.errorDialogTitle || "エラー"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="csvFile" className="mb-1">
              {UI_TEXTS_JP.selectCsvFile || "CSVファイルを選択"} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              required
              disabled={processing}
              className="mt-1"
            />
          </div>

          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">
                {UI_TEXTS_JP.csvImportInstructionsTitle || "CSVファイルの形式"}
            </AlertTitle>
            <AlertDescription className="text-sm">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                    {UI_TEXTS_JP.csvImportInstructions || `以下のヘッダーを持つCSVファイルを用意してください:\n${CSV_EXPECTED_HEADERS.join(',')}`}
                </pre>
                <ul className="mt-2 text-xs list-disc list-inside pl-1">
                    <li><strong>{CSV_EXPECTED_HEADERS[0]} (name)</strong>: 部品名 (必須)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[1]} (description)</strong>: 説明 (任意)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[2]} (imageUrl)</strong>: 画像URL (任意)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[3]} (quantity)</strong>: 数量 (必須, {ItemType.UNIQUE}タイプの場合は1, それ以外は0以上の整数)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[4]} (type)</strong>: 種別 (必須, {Object.values(ItemType).join('|')} のいずれか)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[5]} (categoryId)</strong>: カテゴリID (必須, システム登録済みのID)</li>
                    <li><strong>{CSV_EXPECTED_HEADERS[6]} (boxId)</strong>: 箱ID (任意, システム登録済みのID)</li>
                </ul>
            </AlertDescription>
          </Alert>


          {processing && progress && (
            <div className="my-4 text-center space-y-2">
              <div className="flex justify-center items-center">
                <ArrowUpTrayIcon className="h-6 w-6 animate-bounce text-primary mr-2" /> 
                <p className="text-sm text-muted-foreground">
                  {(UI_TEXTS_JP.importInProgress && UI_TEXTS_JP.importInProgress(progress.current, progress.total)) || `処理中: ${progress.current}/${progress.total} 件`}
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {importResult && !processing && (
            <Alert variant={importResult.failureCount > 0 ? "destructive" : "default"} className="my-4">
              <AlertTitle className="flex items-center">
                {importResult.failureCount === 0 && importResult.successCount > 0 && <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />}
                {importResult.failureCount > 0 && <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-500" />}
                {UI_TEXTS_JP.importComplete || "インポート完了"}
              </AlertTitle>
              <AlertDescription className="space-y-1">
                <p className={`flex items-center ${importResult.successCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                   <CheckCircleIcon className="h-5 w-5 mr-1.5 text-green-500 opacity-75" /> 
                   成功: {importResult.successCount}件
                </p>
                <p className={`flex items-center ${importResult.failureCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                  <ExclamationCircleIcon className="h-5 w-5 mr-1.5 text-red-500 opacity-75" />
                  失敗: {importResult.failureCount}件
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 pt-2 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-destructive">{UI_TEXTS_JP.importFailures || "エラー詳細"}</h4>
                    <ul className="list-disc list-inside text-sm text-destructive max-h-32 overflow-y-auto bg-destructive/10 p-2 rounded mt-1">
                      {importResult.errors.map((err, index) => (
                        <li key={index}>{(UI_TEXTS_JP.importRowError && UI_TEXTS_JP.importRowError(err.row, err.message)) || `行 ${err.row}: ${err.message}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        
        <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                {UI_TEXTS_JP.cancel || "キャンセル"}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!selectedFile || processing || (!!importResult && importResult.failureCount === 0 && importResult.successCount === 0) || (!!importResult && importResult.failureCount > 0)}
            >
              {processing ? (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2 animate-bounce" />
                  {UI_TEXTS_JP.importingInProgressShort || "処理中..."}
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  {UI_TEXTS_JP.startImport || "インポート開始"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
