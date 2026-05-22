export const developerAnalyticsEn = {
  title: "Public usage",
  subtitle:
    "First-party page views from the live site. Registered members are linked by account; everyone else is tracked by anonymous visitor id and IP/location when the host provides it.",
  migrationHint:
    "Analytics table is missing. Run npm run db:migrate against this environment’s DATABASE_URL, then redeploy.",
  periodDays: "{days} days",
  stats: {
    totalViews: "Page views",
    uniqueVisitors: "Unique visitors",
    registeredViews: "Views (signed in)",
    anonymousViews: "Views (guest)",
    uniqueMembers: "Unique signed-in visitors",
  },
  visitorMap: "Visitor map",
  visitorMapHint:
    "Dot size reflects page views. Hover for location. Coordinates are approximate (city or country centroid from host headers).",
  mapEmpty: "No location data yet. Views from production will appear after visitors browse the site.",
  topPages: "Most visited pages",
  topTime: "Where people stay longest (avg time)",
  topLocations: "Top locations",
  topLocationsHint: "Ranked by page views in the selected period.",
  recent: "Recent activity",
  recentHint: "Latest page views, newest first.",
  table: {
    page: "Page",
    views: "Views",
    visitors: "Visitors",
    avgTime: "Avg time",
    totalTime: "Total time",
    location: "Location",
    when: "When",
    visitor: "Visitor",
    ip: "IP",
    referrer: "Referrer",
    guest: "Guest",
  },
  backSystem: "← System settings",
  privacyNote:
    "For privacy, share this dashboard only with bootstrap developers. IP and location are approximate (Vercel/host headers).",
} as const;

type StringLeaf<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: StringLeaf<T[K]> }
    : never;

export type DeveloperAnalyticsCopy = StringLeaf<typeof developerAnalyticsEn>;

export const developerAnalyticsTr: DeveloperAnalyticsCopy = {
  title: "Herkese açık kullanım",
  subtitle:
    "Canlı siteden ilk taraf sayfa görüntülemeleri. Kayıtlı üyeler hesapla eşlenir; diğerleri anonim ziyaretçi kimliği ve mümkünse IP/konum ile izlenir.",
  migrationHint:
    "Analitik tablosu yok. Bu ortamın DATABASE_URL değeriyle npm run db:migrate çalıştırın, ardından yeniden deploy edin.",
  periodDays: "{days} gün",
  stats: {
    totalViews: "Sayfa görüntüleme",
    uniqueVisitors: "Benzersiz ziyaretçi",
    registeredViews: "Görüntüleme (giriş yapmış)",
    anonymousViews: "Görüntüleme (misafir)",
    uniqueMembers: "Benzersiz üye ziyaretçi",
  },
  visitorMap: "Ziyaretçi haritası",
  visitorMapHint:
    "Nokta boyutu sayfa görüntülemesini yansıtır. Konum için üzerine gelin. Koordinatlar yaklaşıktır (şehir veya ülke merkezi).",
  mapEmpty:
    "Henüz konum verisi yok. Ziyaretçiler siteyi gezdikçe görünür.",
  topPages: "En çok ziyaret edilen sayfalar",
  topTime: "En uzun kalınan sayfalar (ort. süre)",
  topLocations: "En çok konum",
  topLocationsHint: "Seçilen dönemdeki sayfa görüntülemesine göre sıralı.",
  recent: "Son etkinlik",
  recentHint: "En yeni sayfa görüntülemeleri.",
  table: {
    page: "Sayfa",
    views: "Görüntüleme",
    visitors: "Ziyaretçi",
    avgTime: "Ort. süre",
    totalTime: "Toplam süre",
    location: "Konum",
    when: "Zaman",
    visitor: "Ziyaretçi",
    ip: "IP",
    referrer: "Yönlendiren",
    guest: "Misafir",
  },
  backSystem: "← Sistem ayarları",
  privacyNote:
    "Gizlilik için bu paneli yalnızca bootstrap geliştiricilerle paylaşın. IP ve konum yaklaşıktır (Vercel/host başlıkları).",
};
