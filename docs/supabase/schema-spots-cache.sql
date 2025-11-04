-- スポットキャッシュテーブル
-- Google Places APIから取得したスポット情報をキャッシュして、API呼び出し回数を削減

CREATE TABLE IF NOT EXISTS spots_cache (
  -- Primary Key
  place_id TEXT PRIMARY KEY,
  
  -- スポット情報
  name TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating DOUBLE PRECISION,
  photo_reference TEXT,
  
  -- 検索条件（キャッシュキー生成用）
  region TEXT NOT NULL,
  genre TEXT NOT NULL,
  
  -- メタデータ
  business_status TEXT,
  types TEXT[], -- JSONB配列
  
  -- キャッシュ管理
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'), -- 7日間のTTL
  fetch_count INTEGER DEFAULT 1 -- 取得回数（人気度指標）
);

-- インデックス: 地域・ジャンル検索用
CREATE INDEX IF NOT EXISTS idx_spots_cache_region_genre 
  ON spots_cache(region, genre);

-- インデックス: 有効期限管理用
CREATE INDEX IF NOT EXISTS idx_spots_cache_expires_at 
  ON spots_cache(expires_at);

-- インデックス: 更新日時順
CREATE INDEX IF NOT EXISTS idx_spots_cache_updated_at 
  ON spots_cache(updated_at DESC);

-- RLS (Row Level Security) 有効化
ALTER TABLE spots_cache ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 全員が読み取り可能
CREATE POLICY "spots_cache_select_policy" 
  ON spots_cache 
  FOR SELECT 
  USING (true);

-- RLS ポリシー: サービスロール/認証済みユーザーのみ書き込み可能
CREATE POLICY "spots_cache_insert_policy" 
  ON spots_cache 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "spots_cache_update_policy" 
  ON spots_cache 
  FOR UPDATE 
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 自動更新用トリガー (updated_at)
CREATE OR REPLACE FUNCTION update_spots_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_spots_cache_updated_at
  BEFORE UPDATE ON spots_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_spots_cache_updated_at();

-- 期限切れキャッシュの削除関数
CREATE OR REPLACE FUNCTION delete_expired_spots_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM spots_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON TABLE spots_cache IS 'Google Places APIのスポット情報キャッシュ（TTL: 7日間）';
COMMENT ON COLUMN spots_cache.place_id IS 'Google Places API の Place ID（Primary Key）';
COMMENT ON COLUMN spots_cache.expires_at IS 'キャッシュ有効期限（7日間）';
COMMENT ON COLUMN spots_cache.fetch_count IS '取得回数（人気度の指標として利用可能）';

