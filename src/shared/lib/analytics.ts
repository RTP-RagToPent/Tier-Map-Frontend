// イベントトラッキング用のユーティリティ
// 実装時は Supabase の Logs 機能または Analytics サービスと連携

export type AnalyticsEvent =
  | "rally_started"
  | "spot_evaluated"
  | "rally_completed"
  | "tier_viewed"
  | "share_clicked";

interface EventData {
  rallyId?: string;
  spotId?: string;
  rating?: number;
  shareType?: "line" | "twitter" | "link";
  [key: string]: unknown;
}

export async function trackEvent(
  event: AnalyticsEvent,
  data?: EventData
): Promise<void> {
  // TODO: 実際の Supabase Logs API または Analytics サービスに送信
  const eventPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  console.log("Analytics Event:", eventPayload);

  // 将来的な実装例:
  // await fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(eventPayload),
  // });

  // または Supabase クライアント経由:
  // await supabase.from('analytics_events').insert(eventPayload);
}

// 便利なラッパー関数
export const analytics = {
  rallyStarted: (rallyId: string) =>
    trackEvent("rally_started", { rallyId }),

  spotEvaluated: (rallyId: string, spotId: string, rating: number) =>
    trackEvent("spot_evaluated", { rallyId, spotId, rating }),

  rallyCompleted: (rallyId: string) =>
    trackEvent("rally_completed", { rallyId }),

  tierViewed: (rallyId: string) =>
    trackEvent("tier_viewed", { rallyId }),

  shareClicked: (rallyId: string, shareType: "line" | "twitter" | "link") =>
    trackEvent("share_clicked", { rallyId, shareType }),
};

