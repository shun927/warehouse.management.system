export const ROUTE_PATHS = {
  LOGIN: "/login",
  DASHBOARD: "/",
  ITEMS: "/items",
  ITEM_DETAIL: "/items/:id",
  ITEM_EDIT: "/items/:id/edit",
  ITEMS_ADD: "/items/new", // Added new route for adding items
  RENTALS_MY: "/rentals/me",
  RENTALS_ALL: "/rentals/all", 
  SCAN_QR: "/scan",
  BOXES: "/boxes",
  BOX_DETAIL: "/boxes/:id",
  BOX_EDIT: "/boxes/:id/edit", 
  BOX_NEW: "/boxes/new",
  BOXES_ADD: "/boxes/new", // Added for consistency
  ITEMS_ALL: "/items", // Added for consistency
  ADMIN_USERS: "/admin/users", 
  ADMIN_USER_EDIT: "/admin/users/:userId/edit", 
  ADMIN_MOVEMENTS: "/admin/movements", 
  PROFILE: "/profile",
};

export const DEFAULT_IMAGE_URL = '/icons/icon-512x512.png'; // Default image
export const USER_AVATAR_URL = DEFAULT_IMAGE_URL; // Added for user avatar fallback

// RENTAL_NOTICE_PERIOD_DAYS, ADMIN_DASHBOARD_RENTAL_LIMIT, DEFAULT_DUE_PERIOD_DAYS are now in config.ts
export const CSV_EXPECTED_HEADERS = ['name', 'description', 'imageUrl', 'quantity', 'type', 'categoryId', 'boxId'];

export const UI_TEXTS_JP = {
  // APP_NAME is now in config.ts
  login: "ログイン",
  logout: "ログアウト",
  dashboard: "ダッシュボード",
  adminDashboard: "管理者ダッシュボード",
  memberDashboard: "メンバーダッシュボード",
  items: "部品一覧",
  myRentals: "自分の貸出",
  allRentals: "全貸出履歴", 
  scanQR: "QRスキャン",
  boxes: "箱一覧", 
  adminUsers: "ユーザー管理", 
  profile: "プロフィール",
  lend: "貸出",
  returnItem: "返却",
  moveBox: "箱を移動", 
  confirm: "確認",
  cancel: "キャンセル",
  loading: "読み込み中...",
  error: "エラーが発生しました",
  success: "成功しました",
  searchPlaceholder: "部品名で検索...",
  noItemsFound: "部品が見つかりません。",
  noRentalsFound: "貸出中の物品はありません。",
  back: "戻る",
  startScan: "スキャン開始",
  stopScan: "スキャン停止",
  qrScanInstruction: "QRコードをカメラに向けてください",
  itemDetails: "部品詳細",
  boxDetails: "箱詳細",
  quantity: "数量",
  location: "保管場所",
  itemType: "種別",
  categoryLabel: "カテゴリ", // Added for ItemCard
  itemName: "部品名",
  description: "説明",
  lendItem: "この部品を借りる",
  returnThisItem: "この部品を返却する",
  viewContents: "中身を見る",
  unknownError: "不明なエラーが発生しました。管理者に連絡してください。",
  email: "メールアドレス",
  password: "パスワード",
  admin: "管理者",
  member: "メンバー",
  name: "名前",
  role: "権限",
  welcome: "ようこそ、",
  notifications: "通知",
  noNotifications: "通知はありません。",
  itemScanned: "部品スキャン完了",
  boxScanned: "箱スキャン完了",
  selectAction: "操作を選択してください",
  rentalHistory: "貸出履歴",
  moveHistory: "移動履歴", // General term
  itemManagement: "部品管理",
  userManagement: "ユーザー管理",
  manageUsers: "ユーザーを管理", // Added
  warehouse: "倉庫",
  currentLocation: "現在地",
  addNewItem: "新しい部品を追加", 
  editItem: "部品情報を編集", 
  deleteItem: "部品を削除", 
  inviteUserTitle: "新しいユーザーを招待", 
  inviteUserSubmit: "招待を送信", 
  inviteUserSuccess: "ユーザー招待が送信されました。", 
  inviteUserErrorExistingEmail: (email: string) => `メールアドレス「${email}」は既に使用されています。`, 
  inviteUserErrorGeneral: "ユーザー招待に失敗しました。", 
  labelEmailRequired: "メールアドレス (必須)", 
  labelNameRequired: "名前 (必須)", 
  labelRoleRequired: "権限 (必須)", 
  itemQRCode: "部品QRコード",
  boxQRCode: "箱QRコード",
  itemsInThisBox: "箱の中の部品一覧",
  noItemsInThisBox: "この箱には部品がありません。",
  editBox: "箱情報を編集",
  addNewBox: "新しい箱を追加", // Added
  addItemToThisBox: "この箱に部品を追加",
  selectUser: "デモユーザーを選択",
  imageUrlLabel: "画像URL",
  boxLabel: "保管箱",
  addItemSuccess: "部品が正常に追加されました。",
  addItemError: "部品の追加に失敗しました。",
  saveItem: "部品を保存",
  noBoxSelected: "箱を選択しない",
  unknownWarehouse: "不明な倉庫",
  totalItems: "総アイテム数", // Added
  totalBoxes: "総箱数", // Added
  totalUsers: "総ユーザー数", // Added
  quickActions: "クイックアクション", // Added
  scanQrCode: "QRコードをスキャン", // Added
  recentMemberRentals: "最近のメンバー貸出", // Added
  viewAllRentals: "すべての貸出を見る", // Added
  noRecentMemberRentals: "最近のメンバー貸出はありません。", // Added
  viewAllMyRentals: "自分の貸出をすべて見る", // Added
  noCurrentRentals: "現在貸出中の物品はありません。", // Added
  currentRentals: "現在の貸出", // Added
  viewAllItems: "すべてのアイテムを見る", // Added
  viewAllBoxes: "すべての箱を見る", // Added
  myProfile: "マイプロフィール", // Added
  statusRented: "貸出中", // Added
  statusReturned: "返却済み", // Added
  rentedAtLabel: "貸出日", // Added
  dueDateLabel: "返却期限日", // Added
  returnedOnLabel: "返却日", // Added
  rentedByLabel: "借用者", // Added
  offlineStatus: "オフラインです", // Added for Navbar
  offline: "オフライン", // Added for Navbar
  menu: "メニュー", // Added for Navbar mobile sheet
  deleteItemConfirmation: "この部品を削除してもよろしいですか？この操作は元に戻せません。", // Added
  csvImportButton: "CSV一括登録", // Added
  filterByCategoryPlaceholder: "カテゴリで絞り込み", // Added
  allCategories: "すべてのカテゴリ", // Added
  loadingItems: "部品を読み込み中...", // Added
  clearFiltersButton: "フィルターをクリア", // Added
  itemQRCodeDescription: "このQRコードをスキャンして部品を識別できます。", // Added
  loadingQrCode: "QRコードを生成中...", // Added
  closeButton: "閉じる", // Added

  // Added for login page errors
  loginFailed: "ログインに失敗しました。メールアドレスまたはパスワードを確認してください。",
  redirecting: "リダイレクトしています...",
  loginDescription: "システムにアクセスするにはログイン情報を入力してください。",
  emailAddress: "メールアドレス", // Explicitly adding for clarity, though 'email' key also exists
  loginButton: "ログインする", // Added

  // CSV Import Modal specific texts
  csvImportItemsTitle: "CSVによる部品一括登録",
  csvImportDescription: "CSVファイルを使用して、複数の部品情報を一度にシステムに登録します。",
  selectCsvFile: "CSVファイルを選択",
  csvImportInstructionsTitle: "CSVファイルの形式について",
  csvImportInstructions: `以下のヘッダーを持つCSVファイルを用意してください (順番も同様):\n${CSV_EXPECTED_HEADERS.join(',')}\n各行が1つの部品情報に対応します。`,
  importErrorInvalidFormat: "無効なファイル形式です。CSVファイルをアップロードしてください。",
  importErrorNoFile: "ファイルが選択されていません。",
  importErrorReadingFile: "ファイルの読み込みに失敗しました。ファイルが破損していないか、文字コードがUTF-8であることを確認してください。",
  importErrorInvalidHeaders: (expected: string, actual: string) => `CSVヘッダーが不正です。\n期待されるヘッダー: ${expected}\n実際のヘッダー: ${actual}`,
  importInProgress: (current: number, total: number) => `登録処理中: ${current} / ${total} 件`,
  importingInProgressShort: "処理中...",
  importComplete: "インポート処理完了",
  importSuccessStats: (count: number) => `成功: ${count}件`,
  importFailureStats: (count: number) => `失敗: ${count}件`,
  importFailures: "登録失敗の詳細",
  importRowError: (row: number, message: string) => `行 ${row}: ${message}`,
  startImport: "インポート開始",
  errorDialogTitle: "エラー", // Generic error title for dialogs

  // Add New Item Page
  addNewItemPageTitle: "新しい部品の追加",
  itemNameLabel: "部品名 (必須)",
  descriptionLabel: "説明",
  quantityLabel: "数量 (必須)",
  itemTypeFormLabel: "種別 (必須)", // Renamed from itemTypeLabel
  categoryLabelForItem: "カテゴリ (必須)", // Renamed from categoryLabel to avoid conflict
  boxLabelForItem: "保管箱", // Renamed from boxLabel to avoid conflict
  imageUrlLabelForItem: "画像URL", // Renamed from imageUrlLabel to avoid conflict
  notesLabel: "備考",
  submitAddItem: "部品を登録",
  addItemSuccessMessage: "部品が正常に登録されました。",
  addItemErrorMessage: "部品の登録中にエラーが発生しました。",
  validationErrorMessages: {
    nameRequired: "部品名は必須です。",
    quantityRequired: "数量は必須です。",
    quantityMustBeNumber: "数量は数値で入力してください。",
    quantityMin: "数量は1以上で入力してください。",
    typeRequired: "種別は必須です。",
    categoryRequired: "カテゴリは必須です。",
    imageUrlInvalid: "有効な画像URLを入力してください。",
  },

  // Item Detail Page
  itemDetailPageTitle: "部品詳細",
  lendAction: "貸し出す",
  returnAction: "返却する",
  editAction: "編集する",
  deleteAction: "削除する", // Added
  confirmDeleteTitle: "削除の確認", // Added
  confirmDeleteMessage: (itemName: string) => `本当に「${itemName}」を削除しますか？この操作は元に戻せません。`, // Added
  itemDeletedSuccess: "部品が削除されました。", // Added
  itemDeletedError: "部品の削除に失敗しました。", // Added
  boxManagement: "箱管理", // Added
  movementManagement: "移動履歴管理", // Added
  errorFetchingMovements: "移動履歴の取得に失敗しました。", // Added

  // For rentals page
  errorFetchingRentals: "貸出情報の取得に失敗しました。",
  errorUnauthorized: "アクセス権限がありません",
  errorUnauthorizedAccess: "このページにアクセスする権限がありません。管理者にお問い合わせください。",
  overdue: "期限超過",
  goToDashboard: "ダッシュボードへ戻る",
  noRentalsFoundSystemWide: "貸出情報がありません",
  noRentalsYetSystem: "現在、システム全体で貸し出されている物品はありません。",
  borrower: "借用者",
  rentalDate: "貸出日",
  dueDate: "返却期限日", // Note: Different from dueDateLabel, used as table header
  returnDate: "返却日",
  status: "状態",
  unknownItem: "不明な物品",
  unknownUser: "不明なユーザー",
  notSet: "未設定",
  notReturnedYet: "未返却",
  loadingRentals: "貸出情報を読み込み中...",
  browseItemsToRent: "貸し出し可能な物品を見る",
  itemTypeConsumable: "消耗品",
  rentalQuantity: "貸出数量",
  // dueDate is already present as dueDateLabel, but let's add a specific one if needed for a different context
  // For now, we assume dueDateLabel can be reused or the page will use a more dynamic string like "あとX日"
  originalLocation: "元の保管場所",
  category: "カテゴリ", // Generic category, might need more specific if context differs
  returningProcess: "返却処理中...",
  returnCompleted: "返却済み",
  returnItemButton: "この物品を返却する",
  noReturnNeeded: "返却不要",

  // For Admin Rentals Page (if different texts are needed)
  allRentalsPageTitle: "全貸出履歴",
  filterByUserPlaceholder: "ユーザー名で絞り込み",
  filterByItemPlaceholder: "部品名で絞り込み",
  statusFilterLabel: "状態で絞り込み",
  statusAll: "すべて",
  // statusRented: "貸出中", (already exists)
  // statusReturned: "返却済み", (already exists)
  clearAllFiltersButton: "全フィルターをクリア",
  noRentalsMatchFilters: "条件に合う貸出履歴はありません。",

  // For RentalModal
  rentalModalTitle: (itemName: string) => `部品を借りる: ${itemName}`,
  dueDateSelectionPrompt: "返却予定日を選択してください。",
  quantityErrorPositive: "数量は1以上で入力してください。",
  quantityErrorUnique: "単品の部品は1つしか借りられません。",
  quantityErrorStock: (available: number) => `在庫が不足しています。残り: ${available}個`,
  rentalFailedError: "貸出処理に失敗しました。",
  rentalSuccessToast: (itemName: string) => `${itemName} を貸し出しました。`,
  confirmRentalButton: "貸出を確定する",
  rentingButton: "貸出処理中...",

  // For BoxFormModal & ItemFormModal (general)
  formErrorRequired: (fieldName: string) => `${fieldName}は必須です。`,
  formErrorInvalid: (fieldName: string) => `${fieldName}が無効です。`,
  formErrorMinLength: (fieldName: string, length: number) => `${fieldName}は${length}文字以上で入力してください。`,
  formErrorMaxLength: (fieldName: string, length: number) => `${fieldName}は${length}文字以内で入力してください。`,
  formErrorNumber: (fieldName: string) => `${fieldName}は数値で入力してください。`,
  formErrorPositiveNumber: (fieldName: string) => `${fieldName}は0より大きい数値で入力してください。`,
  formErrorNonNegativeNumber: (fieldName: string) => `${fieldName}は0以上の数値で入力してください。`,

  // For Box specific forms / pages
  boxNameLabel: "箱の名前 (必須)",
  boxWarehouseLabel: "保管倉庫 (必須)",
  addBoxSuccessMessage: "箱が正常に登録されました。",
  addBoxErrorMessage: "箱の登録中にエラーが発生しました。",
  editBoxSuccessMessage: "箱情報が正常に更新されました。",
  editBoxErrorMessage: "箱情報の更新中にエラーが発生しました。",
  deleteBoxSuccessMessage: "箱が正常に削除されました。",
  deleteBoxErrorMessage: "箱の削除中にエラーが発生しました。",
  deleteBoxConfirmationTitle: "箱削除の確認",
  deleteBoxConfirmationMessage: (boxName: string) => `箱「${boxName}」を削除してもよろしいですか？この操作は元に戻せません。箱の中に部品がある場合や移動履歴がある場合は削除できません。`,
  boxNameRequired: "箱の名前は必須です。",
  warehouseRequired: "保管倉庫は必須です。",
  boxHasItemsError: "箱の中に部品があるため削除できません。先に部品を移動または削除してください。",
  boxHasMovementsError: "箱に移動履歴があるため削除できません。",
  boxQrCodeModalTitle: "箱QRコード",

  // For Category specific forms / pages
  categoryNameLabel: "カテゴリ名 (必須)",
  addCategorySuccessMessage: "カテゴリが正常に登録されました。",
  addCategoryErrorMessage: "カテゴリの登録中にエラーが発生しました。",
  editCategorySuccessMessage: "カテゴリ情報が正常に更新されました。",
  editCategoryErrorMessage: "カテゴリ情報の更新中にエラーが発生しました。",
  deleteCategorySuccessMessage: "カテゴリが正常に削除されました。",
  deleteCategoryErrorMessage: "カテゴリの削除中にエラーが発生しました。",
  deleteCategoryConfirmationTitle: "カテゴリ削除の確認",
  deleteCategoryConfirmationMessage: (categoryName: string) => `カテゴリ「${categoryName}」を削除してもよろしいですか？この操作は元に戻せません。このカテゴリに属する部品がある場合は削除できません。`,
  categoryNameRequired: "カテゴリ名は必須です。",
  categoryHasItemsError: "このカテゴリに属する部品があるため削除できません。",

  // For User Profile Page
  userProfilePageTitle: "プロフィール編集",
  userNameLabel: "名前 (必須)",
  userGradeLabel: "学年 (必須)",
  updateProfileButton: "プロフィールを更新",
  profileUpdateSuccessMessage: "プロフィールが更新されました。",
  profileUpdateErrorMessage: "プロフィールの更新に失敗しました。",
  gradeRequired: "学年は必須です。",
  gradeMustBeNumber: "学年は数値で入力してください。",

  // For Admin User Edit Page
  adminUserEditPageTitle: "ユーザー情報編集",
  userRoleLabel: "権限 (必須)",
  updateUserButton: "ユーザー情報を更新",
  userUpdateSuccessMessage: "ユーザー情報が更新されました。",
  updateUserSuccess: "ユーザー情報が正常に更新されました。", // Added based on error message
  userUpdateErrorMessage: "ユーザー情報の更新に失敗しました。",
  updateUserError: "ユーザー情報の更新に失敗しました。", // Added based on the error message
  emailCannotBeChanged: "メールアドレスは変更できません。", // Added based on the new error message
  saveUserChanges: "変更を保存",
  errorFetchingUsers: "ユーザーの取得に失敗しました。",
  fillRequiredFields: "必須項目を入力してください。",
  loadingUsers: "ユーザーを読み込んでいます...",
  noUsersFound: "ユーザーが見つかりません。",
  inviteFirstUserPrompt: "最初のユーザーを招待してください。",
  actions: "操作",
  edit: "編集",
  placeholderUserName: "氏名",
  selectRole: "権限を選択",
  invitingUser: "ユーザーを招待中...",
  // Added missing page titles
  pageTitleItems: "備品一覧",
  pageTitleItemDetail: "備品詳細",
  pageTitleNewItem: "新規備品登録",
  pageTitleEditItem: "備品情報編集",
  pageTitleBoxes: "箱一覧", // Added
  pageTitleBoxDetail: "箱詳細",
  pageTitleNewBox: "新規箱登録",
  pageTitleEditBox: "箱情報編集",
  pageTitleCategories: "カテゴリ一覧",
  pageTitleNewCategory: "新規カテゴリ登録",
  pageTitleEditCategory: "カテゴリ情報編集",
  pageTitleWarehouses: "倉庫一覧",
  pageTitleMyRentals: "マイレンタル",
  pageTitleAllRentals: "全貸出履歴",
  pageTitleMovements: "移動履歴",
  pageTitleUsers: "ユーザー管理",
  pageTitleEditUser: "ユーザー編集",
  pageTitleProfile: "プロフィール",
  pageTitleScanQR: "QRコードスキャン",
  pageTitleLogin: "ログイン",
  unauthorized: "このページにアクセスする権限がありません。", // Added
  retry: "再試行", // Added
  noBoxesFound: "箱が見つかりませんでした。", // Added
  noMovementsFound: "移動履歴が見つかりませんでした。", // Added
  errorFetchingBoxes: "箱の情報の取得に失敗しました。", // Added
  boxName: "箱名", // Added
  movedFrom: "移動元", // Added
  movedTo: "移動先", // Added
  itemCount: "備品数", // Added
  movedAtLabel: "移動日時", // Added

  // Item specific
  itemDetail: "部品詳細",
  itemImages: "部品画像",
  itemHistory: "部品履歴",
  itemCurrentLocation: "現在の保管場所",
  itemMoveHistory: "移動履歴",
  itemRentedHistory: "貸出履歴",
  itemNotFound: "部品が見つかりませんでした。",
  itemFetchError: "部品情報の取得に失敗しました。",
  itemSaveSuccess: "部品情報が正常に保存されました。",
  itemSaveError: "部品情報の保存中にエラーが発生しました。",
  itemDeleteSuccess: "部品が正常に削除されました。",
  itemDeleteError: "部品の削除中にエラーが発生しました。",
  itemLendSuccess: "部品が正常に貸し出されました。",
  itemLendError: "部品の貸出中にエラーが発生しました。",
  itemReturnSuccess: "部品が正常に返却されました。",
  itemReturnError: "部品の返却中にエラーが発生しました。",
  itemQuantity: "数量",
  itemTypeLabel: "部品種別", // This was the conflicting key, now unique
  itemCategory: "部品カテゴリ",
  itemBox: "保管箱",
  itemImageUrl: "画像URL",
  itemNotes: "備考",
  itemActions: "部品操作",
  itemEdit: "部品編集",
  itemDeleteConfirmation: "この部品を削除してもよろしいですか？",
  itemLend: "部品貸出",
  itemReturn: "部品返却",
  itemViewDetails: "詳細を見る",
  itemScanQRCode: "QRコードをスキャン",
  itemAddToBox: "箱に追加",
  itemRemoveFromBox: "箱から削除",
  itemMoveToAnotherBox: "別の箱に移動",
  itemTransfer: "部品移動",
  itemImportCSV: "CSVからインポート",
  itemExportCSV: "CSVにエクスポート",
  itemBulkActions: "一括操作",
  itemSelectAll: "すべて選択",
  itemDeselectAll: "選択解除",
  itemDeleteSelected: "選択した部品を削除",
  itemLendSelected: "選択した部品を貸出",
  itemReturnSelected: "選択した部品を返却",
  itemMoveSelected: "選択した部品を移動",
  itemAddToBoxSelected: "選択した部品を箱に追加",
  itemRemoveFromBoxSelected: "選択した部品を箱から削除",
  itemTransferSelected: "選択した部品を移動",
  itemImportCSVSelected: "選択した部品をCSVからインポート",
  itemExportCSVSelected: "選択した部品をCSVにエクスポート",
  itemBulkEdit: "一括編集",
  itemBulkDelete: "一括削除",
  itemBulkLend: "一括貸出",
  itemBulkReturn: "一括返却",
  itemBulkMove: "一括移動",
  itemBulkAddToBox: "一括箱に追加",
  itemBulkRemoveFromBox: "一括箱から削除",
  itemBulkTransfer: "一括移動",
  itemBulkImportCSV: "一括CSVからインポート",
  itemBulkExportCSV: "一括CSVにエクスポート",
  itemImportTemplateDownload: "インポートテンプレートダウンロード",
  itemExportTemplateDownload: "エクスポートテンプレートダウンロード",
  itemImportSuccess: "部品が正常にインポートされました。",
  itemImportError: "部品のインポート中にエラーが発生しました。",
  itemExportSuccess: "部品が正常にエクスポートされました。",
  itemExportError: "部品のエクスポート中にエラーが発生しました。",
  itemBulkActionSuccess: "一括操作が正常に完了しました。",
  itemBulkActionError: "一括操作中にエラーが発生しました。",
  itemActionInProgress: "部品操作中...",
  itemActionComplete: "部品操作が完了しました。",
  itemActionFailed: "部品操作に失敗しました。",
  itemSelectNone: "選択なし",
  itemSelectSome: "一部選択",
  itemSelectAllItems: "すべての部品を選択",
  itemDeselectAllItems: "すべての部品の選択を解除",
  itemSelectVisibleItems: "表示中の部品を選択",
  itemDeselectVisibleItems: "表示中の部品の選択を解除",
  itemSelectFilteredItems: "フィルターされた部品を選択",
  itemDeselectFilteredItems: "フィルターされた部品の選択を解除",
  itemSelectGroupedItems: "グループ化された部品を選択",
  itemDeselectGroupedItems: "グループ化された部品の選択を解除",
  itemSelectAllInGroup: "グループ内のすべての部品を選択",
  itemDeselectAllInGroup: "グループ内のすべての部品の選択を解除",
  itemSelectNoneInGroup: "グループ内の部品を選択しない",
  itemSelectSomeInGroup: "グループ内の一部の部品を選択",
  itemSelectAllVisibleInGroup: "グループ内の表示中のすべての部品を選択",
  itemDeselectAllVisibleInGroup: "グループ内の表示中のすべての部品の選択を解除",
  itemSelectFilteredInGroup: "グループ内のフィルターされた部品を選択",
  itemDeselectFilteredInGroup: "グループ内のフィルターされた部品の選択を解除",
  itemSelectGroupedInGroup: "グループ内のグループ化された部品を選択",
  itemDeselectGroupedInGroup: "グループ内のグループ化された部品の選択を解除",
  itemSelectAllInPage: "ページ内のすべての部品を選択",
  itemDeselectAllInPage: "ページ内のすべての部品の選択を解除",
  itemSelectVisibleInPage: "ページ内の表示中の部品を選択",
  itemDeselectVisibleInPage: "ページ内の表示中の部品の選択を解除",
  itemSelectFilteredInPage: "ページ内のフィルターされた部品を選択",
  itemDeselectFilteredInPage: "ページ内のフィルターされた部品の選択を解除",
  itemSelectGroupedInPage: "ページ内のグループ化された部品を選択",
  itemDeselectGroupedInPage: "ページ内のグループ化された部品の選択を解除",
  itemSelectAllInSelection: "選択したすべての部品を選択",
  itemDeselectAllInSelection: "選択したすべての部品の選択を解除",
  itemSelectVisibleInSelection: "選択した表示中の部品を選択",
  itemDeselectVisibleInSelection: "選択した表示中の部品の選択を解除",
  itemSelectFilteredInSelection: "選択したフィルターされた部品を選択",
  itemDeselectFilteredInSelection: "選択したフィルターされた部品の選択を解除",
  itemSelectGroupedInSelection: "選択したグループ化された部品を選択",
  itemDeselectGroupedInSelection: "選択したグループ化された部品の選択を解除",
  itemSelectAllInGroupSelection: "グループ選択内のすべての部品を選択",
  itemDeselectAllInGroupSelection: "グループ選択内のすべての部品の選択を解除",
  itemSelectVisibleInGroupSelection: "グループ選択内の表示中の部品を選択",
  itemDeselectVisibleInGroupSelection: "グループ選択内の表示中の部品の選択を解除",
  itemSelectFilteredInGroupSelection: "グループ選択内のフィルターされた部品を選択",
  itemDeselectFilteredInGroupSelection: "グループ選択内のフィルターされた部品の選択を解除",
  itemSelectGroupedInGroupSelection: "グループ選択内のグループ化された部品を選択",
  itemDeselectGroupedInGroupSelection: "グループ選択内のグループ化された部品の選択を解除",
  itemSelectAllInPageSelection: "ページ選択内のすべての部品を選択",
  itemDeselectAllInPageSelection: "ページ選択内のすべての部品の選択を解除",
  itemSelectVisibleInPageSelection: "ページ選択内の表示中の部品を選択",
  itemDeselectVisibleInPageSelection: "ページ選択内の表示中の部品の選択を解除",
  itemSelectFilteredInPageSelection: "ページ選択内のフィルターされた部品を選択",
  itemDeselectFilteredInPageSelection: "ページ選択内のフィルターされた部品の選択を解除",
  itemSelectGroupedInPageSelection: "ページ選択内のグループ化された部品を選択",
  itemDeselectGroupedInPageSelection: "ページ選択内のグループ化された部品の選択を解除",
  details: "詳細", // Added for error details
  placeholderImagePreview: "プレビュー", // Added for image preview
  placeholderWarehouse: "倉庫を選択...", // Added for warehouse placeholder
  noActiveRentalsMessage: "現在貸し出し中の物品はありません。新しい貸し出しを行うか、過去の履歴を確認してください。" // Added for my-rentals page
};
