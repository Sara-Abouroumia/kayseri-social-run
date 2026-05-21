/** Community idea box (dashboard + admin) */

export const ideaBoxEn = {
  sectionHeading: "DO YOU HAVE AN IDEA?",
  sectionBlurb:
    "Share your suggestions, event ideas, or feedback that you'd like to share with the community.",
  shareOpinion: "Share your opinion",
  formHeading: "Idea Box",
  formIntro:
    "You can share event suggestions, collaboration ideas, or any other ideas that would make the community better with us.",
  titleLabel: "Title",
  titlePlaceholder: "Short summary of your idea",
  detailLabel: "Explain in detail",
  detailPlaceholder: "Tell us more about your suggestion…",
  submit: "Send idea",
  cancel: "Cancel",
  sending: "Sending…",
  submitSuccess: "Thank you! Your idea was sent to the team.",
  submitError: "Could not send your idea. Please try again.",
  titleRequired: "Please enter a title.",
  titleTooLong: "Title must be at most 200 characters.",
  detailRequired: "Please explain your idea in detail.",
  detailTooLong: "Details must be at most 5000 characters.",
  mustSignIn: "Sign in to share an idea.",

  myIdeasHeading: "Your idea box",
  myIdeasEmpty: "Your box is empty — share an idea above.",
  myIdeasCount: "{count} ideas",
  myIdeasCountSuffix: "ideas",
  myIdeasCountEmpty: "empty",
  myIdeasTapOpen: "Tip the box to see your ideas",
  myIdeasTapClose: "Tip the box to close",
  myIdeaExpand: "Show details",
  myIdeaCollapse: "Hide details",

  adminLabel: "Admin",
  adminTitle: "Idea Box",
  adminBlurb: "Suggestions and feedback shared by community members.",
  adminEmpty: "No ideas submitted yet.",
  adminIdeasCount: "{count} submissions",
  adminListLabel: "All submissions",
  adminSelectTitle: "Select a submission to read",
  adminSelectHint:
    "Pick one from the list on the left — the full message and submitter will appear here.",
  adminSubmittedBy: "Submitted by",
  adminSubmitted: "Submitted",
  adminNavEvents: "Events",
  adminNavSystem: "System settings",
  backToDashboard: "Dashboard",
  systemIdeasHeading: "Community ideas",
  systemIdeasBlurb:
    "Read suggestions and feedback from members. Unread submissions show a badge in the nav.",
  openIdeaBox: "Open Idea Box",
} as const;

export const ideaBoxTr = {
  sectionHeading: "BİR FİKRİNİZ Mİ VAR?",
  sectionBlurb:
    "Toplulukla paylaşmak istediğiniz önerileri, etkinlik fikirlerini veya geri bildirimleri gönderin.",
  shareOpinion: "Görüşünü paylaş",
  formHeading: "Fikir Kutusu",
  formIntro:
    "Etkinlik önerileri, iş birliği fikirleri veya topluluğu geliştirecek başka fikirlerinizi bizimle paylaşabilirsiniz.",
  titleLabel: "Başlık",
  titlePlaceholder: "Fikrinizin kısa özeti",
  detailLabel: "Ayrıntılı açıklama",
  detailPlaceholder: "Önerinizi daha ayrıntılı anlatın…",
  submit: "Fikri gönder",
  cancel: "İptal",
  sending: "Gönderiliyor…",
  submitSuccess: "Teşekkürler! Fikriniz ekibe iletildi.",
  submitError: "Fikir gönderilemedi. Lütfen tekrar deneyin.",
  titleRequired: "Lütfen bir başlık girin.",
  titleTooLong: "Başlık en fazla 200 karakter olabilir.",
  detailRequired: "Lütfen fikrinizi ayrıntılı olarak açıklayın.",
  detailTooLong: "Açıklama en fazla 5000 karakter olabilir.",
  mustSignIn: "Fikir paylaşmak için giriş yapın.",

  myIdeasHeading: "Fikir kutunuz",
  myIdeasEmpty: "Kutunuz boş — yukarıdan bir fikir paylaşın.",
  myIdeasCount: "{count} fikir",
  myIdeasCountSuffix: "fikir",
  myIdeasCountEmpty: "boş",
  myIdeasTapOpen: "Fikirlerinizi görmek için kutuyu çevirin",
  myIdeasTapClose: "Kapatmak için kutuyu çevirin",
  myIdeaExpand: "Ayrıntıları göster",
  myIdeaCollapse: "Ayrıntıları gizle",

  adminLabel: "Yönetim",
  adminTitle: "Fikir Kutusu",
  adminBlurb: "Topluluk üyelerinin paylaştığı öneri ve geri bildirimler.",
  adminEmpty: "Henüz fikir gönderilmedi.",
  adminIdeasCount: "{count} gönderi",
  adminListLabel: "Tüm gönderiler",
  adminSelectTitle: "Okumak için bir gönderi seçin",
  adminSelectHint:
    "Soldaki listeden birini seçin — tam metin ve gönderen burada görünür.",
  adminSubmittedBy: "Gönderen",
  adminSubmitted: "Gönderim",
  adminNavEvents: "Etkinlikler",
  adminNavSystem: "Sistem ayarları",
  backToDashboard: "Panel",
  systemIdeasHeading: "Topluluk fikirleri",
  systemIdeasBlurb:
    "Üyelerin öneri ve geri bildirimlerini okuyun. Okunmamışlar menüde rozetle görünür.",
  openIdeaBox: "Fikir Kutusunu aç",
} as const;

export type IdeaBoxCopy = { [K in keyof typeof ideaBoxEn]: string };
