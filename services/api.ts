import { Item, User, Rental, Box, Warehouse, Role, ItemType, Notification, Movement, Category } from '../types';
import { ROUTE_PATHS, UI_TEXTS_JP, DEFAULT_IMAGE_URL } from '../constants';
import { RENTAL_NOTICE_PERIOD_DAYS, DEFAULT_DUE_PERIOD_DAYS, APP_NAME } from '../config'; // APP_NAME might not be used here but good to show pattern if other configs were needed

// Mock Data
export let MOCK_USERS: User[] = [
  { id: 'user1', email: 'admin@example.com', name: '管理者 一郎', role: Role.ADMIN, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'user2', email: 'member@example.com', name: 'メンバー 二郎', role: Role.MEMBER, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export let MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh1', name: '大宮', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wh2', name: '豊洲', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export let MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: '電子部品' },
  { id: 'cat2', name: '工具' },
  { id: 'cat3', name: '素材' },
  { id: 'cat4', name: '測定器' },
];

export let MOCK_BOXES: Box[] = [
  { id: 'box1', name: '工具箱1', warehouseId: 'wh1', warehouse: MOCK_WAREHOUSES.find(w => w.id === 'wh1'), qrCodeUrl: 'qr_box1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'box2', name: '電子部品箱A', warehouseId: 'wh1', warehouse: MOCK_WAREHOUSES.find(w => w.id === 'wh1'), qrCodeUrl: 'qr_box2', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'box3', name: '材料箱X', warehouseId: 'wh2', warehouse: MOCK_WAREHOUSES.find(w => w.id === 'wh2'), qrCodeUrl: 'qr_box3', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export let MOCK_ITEMS: Item[] = [
  { id: 'item1', name: 'ドリルドライバー', description: '充電式ドリルドライバーセット', imageUrl: DEFAULT_IMAGE_URL, quantity: 1, type: ItemType.UNIQUE, boxId: 'box1', /*boxName: '工具箱1', warehouseName: '大宮',*/ qrCodeUrl: 'qr_item1', categoryId: 'cat2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item2', name: 'M3ネジ (100個入)', description: 'ステンレス製M3ネジ', imageUrl: DEFAULT_IMAGE_URL, quantity: 5, type: ItemType.COUNTABLE, boxId: 'box2', /*boxName: '電子部品箱A', warehouseName: '大宮',*/ qrCodeUrl: 'qr_item2', categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item3', name: 'はんだ (1ロール)', description: '鉛フリーはんだ', imageUrl: DEFAULT_IMAGE_URL, quantity: 10, type: ItemType.CONSUMABLE, boxId: 'box2', /*boxName: '電子部品箱A', warehouseName: '大宮',*/ qrCodeUrl: 'qr_item3', categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item4', name: 'Raspberry Pi 4', description: '教育用シングルボードコンピュータ', imageUrl: DEFAULT_IMAGE_URL, quantity: 1, type: ItemType.UNIQUE, boxId: 'box3', /*boxName: '材料箱X', warehouseName: '豊洲',*/ qrCodeUrl: 'qr_item4', categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item5', name: 'アルミニウム板', description: '20x30cm 厚さ1mm', quantity: 3, type: ItemType.COUNTABLE, boxId: 'box3', /*boxName: '材料箱X', warehouseName: '豊洲',*/ qrCodeUrl: 'qr_item5', categoryId: 'cat3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item6', name: 'テスター', description: 'デジタルマルチメーター', imageUrl: DEFAULT_IMAGE_URL, quantity: 1, type: ItemType.UNIQUE, boxId: 'box1', /*boxName: '工具箱1', warehouseName: '大宮',*/ qrCodeUrl: 'qr_item6', categoryId: 'cat4', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Initial population of box.items - this should be done carefully if MOCK_ITEMS can change
MOCK_BOXES = MOCK_BOXES.map(box => {
  const itemsInBox = MOCK_ITEMS.filter(item => item.boxId === box.id).map(item => {
    const category = MOCK_CATEGORIES.find(c => c.id === item.categoryId);
    // Add box and warehouse to item for consistency if needed, or ensure Item type doesn't strictly require them if they are derived
    return { 
      ...item, 
      categoryName: category?.name,
      // Populate box and warehouse for item based on its boxId
      box: MOCK_BOXES.find(b => b.id === item.boxId), 
      // warehouse: MOCK_WAREHOUSES.find(w => w.id === (MOCK_BOXES.find(b => b.id === item.boxId)?.warehouseId)) 
    };
  });
  return { ...box, items: itemsInBox };
});


export let MOCK_RENTALS: Rental[] = [
  {
    id: 'rental1',
    itemId: 'item1',
    item: MOCK_ITEMS.find(i => i.id === 'item1')!,
    userId: 'user2',
    user: MOCK_USERS.find(u => u.id === 'user2')!,
    quantity: 1,
    rentedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
    returnedAt: undefined,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Assuming createdAt is same as rentedAt for mock
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Assuming updatedAt is same as rentedAt for mock
  },
  {
    id: 'rental2',
    itemId: 'item2',
    item: MOCK_ITEMS.find(i => i.id === 'item2')!,
    userId: 'user2',
    user: MOCK_USERS.find(u => u.id === 'user2')!,
    quantity: 1, // 1 pack of 100 screws
    rentedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (over 1 month)
    dueDate: new Date(new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).getTime() + DEFAULT_DUE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    returnedAt: undefined,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // Assuming createdAt is same as rentedAt for mock
    updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // Assuming updatedAt is same as rentedAt for mock
  }
];

export let MOCK_MOVEMENTS: Movement[] = [];

// Mock API functions
const simulateDelay = <T,>(data: T, delay: number = 300): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

const checkOnlineStatus = () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    // UI_TEXTS_JP.offlineError を直接参照する代わりに、エラーメッセージを返すか、より汎用的なエラーをスローすることを検討
    throw new Error("ネットワーク接続がありません。"); 
  }
};

// API基本URL（環境変数などから取得するのが望ましい）
const API_BASE_URL = '/api';

export const getCurrentUser = async (userId: string): Promise<User | null> => {
  // This function might be replaced by a call to /api/me or similar
  // For now, keeping mock, assuming it's handled by AuthContext or a dedicated /api/me
  const user = MOCK_USERS.find(u => u.id === userId);
  return simulateDelay(user || null);
};

export const fetchCategories = async (): Promise<Category[]> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/warehouses`);
  if (!response.ok) {
    throw new Error('Failed to fetch warehouses');
  }
  return response.json();
};


export const fetchItems = async (searchTerm?: string, categoryId?: string): Promise<Item[]> => {
  checkOnlineStatus();
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (categoryId) params.append('categoryId', categoryId);
  
  const response = await fetch(`${API_BASE_URL}/items?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
};

export const fetchItemById = async (id: string): Promise<Item | null> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/items/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch item');
  }
  return response.json();
};


export const fetchUserRentals = async (userId: string): Promise<Rental[]> => {
  // Assuming /api/rentals/me handles fetching for the currently authenticated user
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/rentals/me`);
  if (!response.ok) {
    throw new Error('Failed to fetch user rentals');
  }
  return response.json();
};

export const fetchAllRentals = async (): Promise<Rental[]> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/rentals`);
  if (!response.ok) {
    throw new Error('Failed to fetch all rentals');
  }
  return response.json();
};

export const lendItem = async (itemId: string, userId: string, quantity: number, dueDate?: string): Promise<Rental> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, userId, quantity, dueDate }), // userId might be handled by backend session
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to lend item' }));
    throw new Error(errorData.message || 'Failed to lend item');
  }
  return response.json();
};

export const returnItem = async (rentalId: string): Promise<Rental> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/return`, {
    method: 'POST', // Or PUT, depending on API design
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to return item' }));
    throw new Error(errorData.message || 'Failed to return item');
  }
  return response.json();
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  // This might be fetched via a dedicated endpoint or WebSocket
  // Keeping mock for now as it's complex and depends on user session
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) return simulateDelay([]);

  const notifications: Notification[] = [];
  const userActiveRentals = MOCK_RENTALS.filter(r => r.userId === userId && !r.returnedAt)
    .map(r => ({ ...r, item: MOCK_ITEMS.find(i => i.id === r.itemId)! }));


  userActiveRentals.forEach(r => {
    if (r.dueDate) {
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      now.setHours(0,0,0,0); 
      dueDate.setHours(0,0,0,0);

      if (dueDate < now) {
        notifications.push({
          id: `notif_overdue_${r.id}`,
          title: '返却期限超過', // Added title
          message: `「${r.item.name}」の返却期限が過ぎています。(期限: ${dueDate.toLocaleDateString('ja-JP')})`,
          type: 'overdue',
          relatedRentalId: r.id,
          date: new Date().toISOString(), // Added date
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  
  userActiveRentals.filter(r => {
      const rentedDate = new Date(r.rentedAt);
      const noticeDate = new Date(rentedDate.getTime()); 
      noticeDate.setDate(noticeDate.getDate() + RENTAL_NOTICE_PERIOD_DAYS);
      return new Date() > noticeDate;
    })
    .forEach(r => {
       notifications.push({
        id: `notif_long_rental_${r.id}`,
        title: '長期レンタル', // Added title
        message: `「${r.item.name}」は長期間レンタルされています。(貸出日: ${new Date(r.rentedAt).toLocaleDateString('ja-JP')})`,
        type: 'long_rental', 
        relatedRentalId: r.id,
        date: new Date().toISOString(), // Added date
        createdAt: new Date().toISOString(),
      });
    });
  
  const notificationMap = new Map<string, Notification>();
  notifications.forEach(n => {
    const existing = notificationMap.get(n.relatedRentalId || n.id);
    if (!existing || (existing.type === 'long_rental' && n.type === 'overdue')) {
        notificationMap.set(n.relatedRentalId || n.id, n);
    } else if (existing.type === 'overdue' && n.type === 'long_rental') {
        // Keep the overdue one
    } else if (!notificationMap.has(n.id)){
        notificationMap.set(n.id, n);
    }
  });
  
  const uniqueNotifications = Array.from(notificationMap.values());
  return simulateDelay(uniqueNotifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const fetchBoxes = async (): Promise<Box[]> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/boxes`);
  if (!response.ok) {
    throw new Error('Failed to fetch boxes');
  }
  return response.json();
};

export const fetchBoxById = async (id: string): Promise<Box | null> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/boxes/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch box');
  }
  return response.json();
};


export const scanQrCode = async (qrData: string): Promise<{ type: 'item' | 'box', data: Item | Box } | null> => {
  // This function would ideally call a backend endpoint that interprets the QR data
  // For now, it retains its mock logic but should be a priority to integrate with an API
  const item = MOCK_ITEMS.find(i => i.qrCodeUrl === qrData);
  if (item) {
    const box = MOCK_BOXES.find(b => b.id === item.boxId);
    const warehouse = box ? MOCK_WAREHOUSES.find(w => w.id === box.warehouseId) : undefined;
    const category = MOCK_CATEGORIES.find(c => c.id === item.categoryId);
    return simulateDelay({ type: 'item', data: {...item, boxName: box?.name, warehouseName: warehouse?.name, categoryName: category?.name} });
  }
  const box = MOCK_BOXES.find(b => b.qrCodeUrl === qrData);
  if (box) {
     const warehouse = MOCK_WAREHOUSES.find(w => w.id === box.warehouseId);
    return simulateDelay({ type: 'box', data: {...box, warehouseName: warehouse?.name, items: MOCK_ITEMS.filter(i => i.boxId === box.id).map(i => ({...i, boxName: box.name, warehouseName: warehouse?.name}))} });
  }
  return simulateDelay(null);
};

export const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'qrCodeUrl' | 'boxName' | 'warehouseName' | 'categoryName'>): Promise<Item> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add item' }));
    throw new Error(errorData.message || 'Failed to add item');
  }
  return response.json();
};

export const updateItem = async (itemId: string, itemData: Partial<Omit<Item, 'id' | 'createdAt' | 'qrCodeUrl' | 'boxName' | 'warehouseName' | 'categoryName'>>): Promise<Item | null> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({ message: 'Failed to update item' }));
    throw new Error(errorData.message || 'Failed to update item');
  }
  return response.json();
};

export const deleteItem = async (itemId: string): Promise<boolean> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    // Consider how to handle errors, e.g., item not found vs. server error
    // For now, assume any non-ok response means deletion failed or item didn't exist
    // Returning response.ok directly reflects if the operation was successful (e.g. 200, 204)
    // If API returns 404 for "already deleted" or "not found", this will correctly return false if !response.ok
    // However, if the API returns 200/204 on successful delete, and something else on failure:
    // throw new Error('Failed to delete item'); // Or return false after checking status
    return false; 
  }
  return true; // Typically a 200 or 204 No Content indicates success
};

export const fetchUsers = async (): Promise<User[]> => {
  // This should fetch from /api/users or similar, restricted to admins
  // Keeping mock for now
  return simulateDelay(MOCK_USERS.map(u => ({ ...u }))); // Return copies
}

export const updateUser = async (userId: string, data: Partial<Pick<User, 'name' | 'role'>>): Promise<User | null> => {
  // This should PUT to /api/users/:id, restricted to admins
  // Keeping mock for now
  checkOnlineStatus();
  const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    console.error(`User with ID ${userId} not found for update.`);
    return simulateDelay(null);
  }
  
  const updatedUser = { ...MOCK_USERS[userIndex], ...data }; // Create updated user copy
  
  MOCK_USERS = MOCK_USERS.map(u => u.id === userId ? { ...updatedUser } : u); // Store copy
  
  MOCK_RENTALS = MOCK_RENTALS.map(rental => {
    if (rental.userId === userId && rental.user) { 
      return { ...rental, user: { ...updatedUser} }; // Update rental's user copy
    }
    return rental;
  });

  return simulateDelay({ ...updatedUser }); // Return copy
};

export const inviteUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  // This should POST to /api/users/invite or similar, restricted to admins
  // Keeping mock for now
  checkOnlineStatus();
  const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    throw new Error(UI_TEXTS_JP.inviteUserErrorExistingEmail(userData.email));
  }
  const newUser: User = {
    ...userData,
    id: `user${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_USERS = [...MOCK_USERS, { ...newUser }]; // Store copy
  return simulateDelay({ ...newUser }); // Return copy
};


export const updateBox = async (boxId: string, data: { name?: string; warehouseId?: string }): Promise<Box | null> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/boxes/${boxId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({ message: 'Failed to update box' }));
    throw new Error(errorData.message || 'Failed to update box');
  }
  return response.json();
};

export const addBox = async (boxData: { name: string; warehouseId: string }): Promise<Box> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/boxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boxData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add box' }));
    throw new Error(errorData.message || 'Failed to add box');
  }
  return response.json();
};

export const fetchMovements = async (): Promise<Movement[]> => {
  // This should fetch from /api/movements or similar, restricted to admins
  // Keeping mock for now
  return simulateDelay([...MOCK_MOVEMENTS].map(m => ({ ...m })).sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())); // Return copies
};

export const createWarehouse = async (warehouseData: Omit<Warehouse, 'id'>): Promise<Warehouse> => {
  checkOnlineStatus();
  const response = await fetch(`${API_BASE_URL}/warehouses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(warehouseData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create warehouse' }));
    throw new Error(errorData.message || 'Failed to create warehouse');
  }
  return response.json();
};
