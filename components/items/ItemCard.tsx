import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Item, ItemType } from '../../types';
import { UI_TEXTS_JP, DEFAULT_IMAGE_URL } from '../../constants';
import { CubeIcon, TagIcon, ArchiveBoxIcon, MapPinIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ItemCardProps {
  item: Item;
}

const getItemTypeDisplay = (type: ItemType) => {
  switch (type) {
    case ItemType.UNIQUE: return "単品";
    case ItemType.COUNTABLE: return "数量管理品";
    case ItemType.CONSUMABLE: return "消耗品";
    default: return type;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <Card className="overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col h-full">
      <div className="relative w-full h-48">
        <Image 
          className="object-cover" 
          src={item.imageUrl || DEFAULT_IMAGE_URL} 
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            if (e.target instanceof HTMLImageElement) {
              e.target.src = DEFAULT_IMAGE_URL;
            }
          }}
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold truncate" title={item.name}>{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow space-y-2">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center">
            <CubeIcon className="h-4 w-4 mr-2 text-primary" />
            {UI_TEXTS_JP.quantity}: {item.quantity} {item.type === ItemType.COUNTABLE ? '個/セット' : ''}
          </p>
          <p className="flex items-center">
            <TagIcon className="h-4 w-4 mr-2 text-green-600" />
            {UI_TEXTS_JP.itemType}: {getItemTypeDisplay(item.type)}
          </p>
          {item.category?.name && (
             <p className="flex items-center">
                <BookmarkIcon className="h-4 w-4 mr-2 text-indigo-600" />
                {UI_TEXTS_JP.categoryLabel}: {item.category.name}
            </p>
          )}
          {item.box?.name && (
             <p className="flex items-center">
                <ArchiveBoxIcon className="h-4 w-4 mr-2 text-purple-600" />
                {item.box.name}
            </p>
          )}
          {item.box?.warehouse?.name && (
             <p className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-yellow-600" />
                {item.box.warehouse.name}
            </p>
          )}
        </div>
        
        <p className="text-sm text-foreground h-10 overflow-hidden truncate-2-lines flex-grow" title={item.description || ''}>
          {item.description || '説明はありません。'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <NextLink href={`/items/${item.id}`} passHref legacyBehavior>
          <Button variant="default" className="w-full">
            {UI_TEXTS_JP.itemDetails}
          </Button>
        </NextLink>
      </CardFooter>
    </Card>
  );
};