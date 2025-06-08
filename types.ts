export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ItemType {
  UNIQUE = 'UNIQUE', // 1点モノ
  COUNTABLE = 'COUNTABLE', // 数量管理
  CONSUMABLE = 'CONSUMABLE', // 消耗品
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string | null; // Prisma schema allows null
  imageUrl?: string | null;    // Prisma schema allows null
  quantity: number;
  type: ItemType;
  categoryId?: string | null;  // Prisma schema allows null
  category?: Category | null;  // For included relation
  boxId?: string | null;       // Prisma schema allows null
  box?: Box | null;            // For included relation
  qrCodeUrl?: string | null;   // Prisma schema allows null
  createdAt: string; // ISO Date string
  updatedAt: string; // Added based on typical Prisma models
}

export interface Box {
  id: string;
  name: string;
  warehouseId: string;
  warehouse?: Warehouse; 
  qrCodeUrl?: string | null;   // Prisma schema allows null
  items?: Item[]; 
  // Added from Prisma schema
  createdAt: string; 
  updatedAt: string; 
}

export interface Warehouse {
  id: string;
  name: string;
  // Added from Prisma schema
  createdAt: string; 
  updatedAt: string; 
}

export interface Rental {
  id: string;
  itemId: string;
  item: Item; 
  userId: string;
  user?: User; 
  quantity: number; 
  rentedAt: string; 
  dueDate: string; // Prisma schema has this as non-optional
  returnedAt?: string | null; // Prisma schema allows null
  // Added from Prisma schema
  createdAt: string; 
  updatedAt: string; 
}

export interface Movement {
  id: string;
  boxId: string;
  boxName?: string; // Added to include the box name directly
  box?: Box; // For included relation
  fromWarehouseId: string;
  fromWarehouseName?: string; // Added
  fromWarehouse?: Warehouse; // For included relation
  toWarehouseId: string;
  toWarehouseName?: string; // Added
  toWarehouse?: Warehouse; // For included relation
  movedAt: string; 
  // Added from Prisma schema
  createdAt: string; 
  updatedAt: string; 
}

export interface Notification {
  id: string;
  title: string; // Added title
  message: string;
  type: 'overdue' | 'info' | 'long_rental'; // Added long_rental type
  relatedRentalId?: string;
  date: string; // Added date (assuming it's a string like createdAt)
  createdAt: string;
}