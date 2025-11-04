/**
 * バックエンドAPIクライアント
 * Supabase Edge Functions との通信を担当
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * セッショントークンの取得
 * TODO: 実際の認証実装後に localStorage または Cookie から取得
 */
function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

/**
 * セッショントークンの保存
 */
export function setSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sessionToken', token);
}

/**
 * セッショントークンの削除
 */
export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sessionToken');
}

/**
 * APIリクエストのラッパー
 */
interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  // ヘッダーの構築
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 認証が必要な場合はセッショントークンを追加
  if (requiresAuth) {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Session token not found. Please login first.');
    }
    // TypescriptでHeadersInit型にインデックスアクセスする時の型エラー回避のため、オブジェクトとして扱う
    (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${sessionToken}`;
  }

  // リクエスト実行
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  // レスポンス処理
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * API Client
 */
export const apiClient = {
  // ========================================
  // 認証
  // ========================================

  /**
   * ログイン
   */
  async login(accessToken: string) {
    return apiRequest<{ sessionToken: string; message: string }>('/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ accessToken }),
    });
  },

  // ========================================
  // プロフィール
  // ========================================

  /**
   * プロフィール取得
   */
  async getProfile() {
    return apiRequest<{ id: number; name: string; message: string }>('/profiles');
  },

  /**
   * プロフィール作成
   */
  async createProfile(name: string) {
    return apiRequest<{ id: number; name: string; message: string }>('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  /**
   * プロフィール更新
   */
  async updateProfile(name: string) {
    return apiRequest<{ id: number; name: string; message: string }>('/profiles', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  // ========================================
  // ラリー
  // ========================================

  /**
   * ラリー一覧取得
   */
  async getRallies() {
    return apiRequest<{
      rallies: Array<{ id: number; name: string; genre: string }>;
      message: string;
    }>('/rallies');
  },

  /**
   * ラリー作成
   */
  async createRally(name: string, genre: string) {
    return apiRequest<{ id: number; name: string; genre: string; message: string }>('/rallies', {
      method: 'POST',
      body: JSON.stringify({ name, genre }),
    });
  },

  /**
   * ラリー詳細取得
   */
  async getRally(rallyId: number) {
    return apiRequest<{ id: number; name: string; genre: string; message: string }>(
      `/rallies/${rallyId}`
    );
  },

  /**
   * ラリー更新
   */
  async updateRally(rallyId: number, name?: string, genre?: string) {
    return apiRequest<{ id: number; name: string; genre: string; message: string }>(
      `/rallies/${rallyId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name, genre }),
      }
    );
  },

  // ========================================
  // スポット
  // ========================================

  /**
   * ラリーのスポット一覧取得
   */
  async getRallySpots(rallyId: number) {
    return apiRequest<{
      spots: Array<{ id: string; name: string; order_no: number }>;
      message: string;
    }>(`/rallies/${rallyId}/spots`);
  },

  /**
   * ラリーにスポットを追加
   */
  async addRallySpots(rallyId: number, spots: Array<{ spot_id: string; name: string }>) {
    return apiRequest<{
      spots: Array<{ id: string; name: string; order_no: number }>;
      message: string;
    }>(`/rallies/${rallyId}/spots`, {
      method: 'POST',
      body: JSON.stringify({ spots }),
    });
  },

  /**
   * スポット詳細取得
   */
  async getRallySpot(rallyId: number, spotId: string) {
    return apiRequest<{
      id: string;
      name: string;
      order_no: number;
      message: string;
    }>(`/rallies/${rallyId}/spots/${spotId}`);
  },

  // ========================================
  // 評価
  // ========================================

  /**
   * ラリーの評価一覧取得
   */
  async getRallyRatings(rallyId: number) {
    return apiRequest<{
      ratings: Array<{
        id: number;
        spot_id: string;
        name: string;
        order_no: number;
        stars: number;
        memo: string;
      }>;
      message: string;
    }>(`/rallies/${rallyId}/ratings`);
  },

  /**
   * 評価作成
   */
  async createRating(rallyId: number, spotId: string, stars: number, memo?: string) {
    return apiRequest<{
      id: number;
      spot_id: string;
      name: string;
      order_no: number;
      stars: number;
      memo: string;
      message: string;
    }>(`/rallies/${rallyId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ spot_id: spotId, stars, memo }),
    });
  },

  /**
   * スポットの評価取得
   */
  async getRating(rallyId: number, spotId: string) {
    return apiRequest<{
      id: number;
      spot_id: string;
      name: string;
      order_no: number;
      stars: number;
      memo: string;
      message: string;
    }>(`/rallies/${rallyId}/ratings/${spotId}`);
  },
};

/**
 * APIが設定されているかチェック
 */
export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}
