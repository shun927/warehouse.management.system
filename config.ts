// config.ts
// アプリケーション全体の設定値を管理するファイル

export const APP_NAME = "Shiba Lab 倉庫管理システム";

// レンタル関連の設定
export const DEFAULT_DUE_PERIOD_DAYS = 14; // 新規貸出時のデフォルト返却期限（日数）
export const RENTAL_NOTICE_PERIOD_DAYS = 28; // 長期貸出通知を行う期間（日数） / 4週間

// ダッシュボード表示関連
export const ADMIN_DASHBOARD_RENTAL_LIMIT = 5; // 管理者ダッシュボードに表示する最近の貸出履歴の件数

// API関連（将来の拡張用プレースホルダ）
// export const API_BASE_URL = "https://api.example.com/v1";

// その他の設定
export const DEBUG_MODE = process.env.NODE_ENV === 'development';
