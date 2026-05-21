/** Admin event create/edit form, list, and related UI */

export const adminEventFormEn = {
  adminLabel: "Admin",
  allEvents: "← All events",
  listTitle: "Events",
  listDescription:
    "Create activities, copy a share link for Instagram or WhatsApp, and manage details. Visitors can open the link; joining the club still happens on this site.",
  upcomingSection: "Upcoming events",
  pastSection: "Past events",
  showPastEvents: "Past events",
  showUpcomingEvents: "Upcoming events",
  newEvent: "New event",
  newEventTitle: "New event",
  newEventBlurb: "After you save, you get a stable share link for social posts.",
  editEvent: "Edit event",
  viewEvent: "View event",
  readOnlyBlurb:
    "This event has ended. Details are read-only; you can still review participants below or delete the event.",
  eventNotFound: "Event not found",
  editPageTitle: "Edit — {title}",
  pastBadge: "Past",
  noCover: "No cover",
  noPastEvents: "No past events yet.",
  noUpcomingEvents: "No upcoming events.",
  createOne: "Create one",
  emptyOr: "or",
  viewPastEvents: "view past events",
  view: "View",
  viewPublicPage: "View public page →",
  visibilityAria: "Visibility",
  edit: "Edit",
  details: "Details",
  share: "Share",
  copied: "Copied",
  copyShareLinkFor: "Copy share link for",

  shareLink: "Share link",
  shareLinkHint:
    "Anyone with this link can open the activity page. Joining still requires an account on this site.",
  copy: "Copy",

  basics: "Basics",
  title: "Title",
  eventType: "Event type",
  activityPresetsHint:
    "Pick a template or enter your own name and emoji. Anything goes for custom activities.",
  activityPresetsAria: "Activity type presets",
  typeName: "Type name",
  typeNamePlaceholder: "e.g. Trail run, Club dinner…",
  emojiOptional: "Emoji (optional)",
  emojiHint: "Leave blank to auto-match known types, or paste any emoji.",
  presets: {
    Run: "Run",
    Hike: "Hike",
    Barbecue: "Barbecue",
    Walk: "Walk",
    Social: "Social",
    Ride: "Ride",
  } as Record<string, string>,

  notesDescription: "Notes / description",
  starts: "Starts",
  endsOptional: "Ends (optional)",
  visibility: "Visibility",
  visibilityPublic: "Public — listed on home page; account required to join",
  visibilityMembers:
    "Members only — listed on home page; account required to view & join",
  visibilityPrivate: "Private — not listed on home page",
  visibilityHint:
    "Public and members-only events appear in Upcoming Runs on the site. Joining always requires a signed-in account.",

  meetingPoint: "Meeting point",
  placeName: "Place name",
  address: "Address",
  latitudeOptional: "Latitude (optional)",
  longitudeOptional: "Longitude (optional)",

  activityDetails: "Activity details",
  typeMetricsHeading: "Details for this activity",
  typeMetricsBlurb:
    "Fields below follow the type name (e.g. pace for runs, difficulty for hikes). You can still leave them blank.",
  distanceKm: "Distance (km)",
  distancePlaceholder: "e.g. 5.2",
  pace: "Pace",
  pacePlaceholder: "e.g. ~7:30/km",
  difficulty: "Difficulty",
  difficultyPlaceholder: "e.g. moderate, steep sections",

  cost: "Cost",
  costLegend: "Participation cost",
  costFree: "Free to join",
  costPaid: "Paid / contribution",
  costDetails: "Cost details",
  costDetailsPlaceholder: "e.g. 150 TRY per person, pay at registration…",

  requiredItems: "Required items",
  requiredItemsPlaceholder: "Water, visibility gear…",
  coordinator: "Coordinator",
  maxParticipants: "Max participants",
  joinDeadline: "Join deadline",
  joinDeadlineHint: "Leave empty to close registration 24 hours before the start time.",
  weatherConditions: "Weather / conditions",

  coverImage: "Cover image",
  coverImageHint:
    "Upload JPEG, PNG, WebP, or GIF up to {maxMb} MB, or paste an https image URL below. If upload fails, try a smaller image (under {maxKb} KB) or use a hosted link.",
  coverImageHintDev:
    "With {token} set, uploads go to Vercel Blob (up to {maxMb} MB). Without it, smaller images ({maxKb} KB or less) are embedded in the database.",
  uploadTooLarge: "Image must be {maxMb} MB or smaller.",
  uploadTooLargeInline:
    "Image is too large (max {maxKb} KB for uploads here). Try a smaller file or paste an https image URL below.",
  uploadBadMime: "Use JPEG, PNG, WebP, or GIF.",
  uploadImage: "Upload image",
  uploading: "Uploading…",
  uploadFailed: "Upload failed.",
  removeImage: "Remove image",
  imageUrlOptional: "Or image URL (https)",
  imageUrlPlaceholder: "https://…",

  createEvent: "Create event",
  eventCreatedSuccess: "Event created successfully.",
  saveChanges: "Save changes",
  saving: "Saving…",

  registrationHeading: "Registration form",
  registrationBlurb:
    "Add questions participants answer when joining — like a short Google Form. You can show follow-up questions only when another answer is checked.",
  noQuestionsYet:
    'No registration questions yet. Add one to collect info (e.g. "Coming with a car?") or leave empty for a simple sign-up button.',
  questionN: "Question {n}",
  questionLabel: "Question label",
  questionLabelPlaceholder: 'e.g. "Are you coming with your own car?"',
  answerType: "Answer type",
  required: "Required",
  showOnlyWhen: "Show this question only when",
  alwaysShow: "Always show",
  untitled: "(untitled)",
  dependsYes: "…is Yes",
  dependsNo: "…is No",
  dependsChecked: "…is checked",
  dependsUnchecked: "…is not checked",
  addQuestion: "+ Add question",
  remove: "Remove",

  questionTypeCheckbox: "Checkbox (yes / no toggle)",
  questionTypeYesNo: "Yes / No",
  questionTypeText: "Short text",
  questionTypeNumber: "Number",

  ruleWhenChecked: "Is checked",
  ruleWhenUnchecked: "Is not checked",
  ruleWhenYes: "Answer is Yes",
  ruleWhenNo: "Answer is No",
  ruleWhenEquals: "Equals",
  ruleWhenNotEquals: "Does not equal",

  joinApproval: "Join approval",
  joinApprovalBlurb:
    "Control whether someone is signed up immediately or waits for coordinator approval.",
  approvalAuto: "Auto-accept",
  approvalAutoHint: "Everyone who joins is confirmed (waitlist still applies if full).",
  approvalManual: "Always require approval",
  approvalManualHint: "Every registration stays pending until an admin accepts it.",
  approvalConditional: "Conditional approval",
  approvalConditionalHint:
    "Pending or auto-accept based on an answer (e.g. no car → pending).",
  approvalConditionalNeedQuestion: "Add at least one question to use conditional approval.",
  whenAnswer: "When this answer…",
  selectQuestion: "Select question…",
  valueToMatch: "Value to match",
  thenStatus: "…then set status to",
  statusPending: "Pending approval",
  statusAutoAccepted: "Auto-accepted",
  switchOutcome: "(switch)",
  everyoneElse: "Everyone else",
  defaultAutoAccept: "Auto-accept",
  defaultPending: "Pending approval",

  delete: "Delete",
  deleteEvent: "Delete event",
  deleteConfirmBlurb:
    "This cannot be undone. Type the event title exactly as shown below to confirm.",
  deleteConfirmPlaceholder: "Type the full title",
  cancel: "Cancel",
  deletePermanently: "Delete permanently",
  deleting: "Deleting…",
  confirmTitleSr: "Type title to confirm",

  actions: {
    mustSignIn: "You must be signed in.",
    noPermission: "You do not have permission to manage events.",
    invalidEvent: "Invalid event.",
    eventNotFound: "Event not found.",
    eventNotEditable: "This event has ended and can no longer be edited.",
    invalidInput: "Invalid input.",
    startRequired: "Start date and time are required.",
    eventUpdated: "Event updated.",
    coverTooLarge: "Cover image data is too large. Use a smaller file or Vercel Blob.",
    invalidCover: "Invalid cover image.",
    confirmDeleteHint: "Type the event title exactly to confirm deletion.",
    confirmTitleMismatch: "Confirmation text must match the event title exactly.",
    titleRequired: "Title is required.",
    invalidCoverUrl:
      "Cover must be an https URL, an uploaded image, or a small embedded image from upload.",
    questionLabelRequired: "Each registration question needs a label.",
    conditionalApprovalNeedsQuestion:
      "Add at least one registration question for conditional approval.",
    followUpParentRemoved:
      "A follow-up question references a removed parent question.",
    followUpParentInvalid:
      "Follow-up questions can only depend on a Yes/No or checkbox question.",
    followUpMustFollowParent:
      "Place the parent question above the follow-up (use the ↑ button).",
  },
} as const;

export const adminEventFormTr = {
  adminLabel: "Yönetici",
  allEvents: "← Tüm etkinlikler",
  listTitle: "Etkinlikler",
  listDescription:
    "Etkinlik oluşturun, Instagram veya WhatsApp için paylaşım bağlantısı kopyalayın ve ayrıntıları yönetin. Ziyaretçiler bağlantıyı açabilir; kulübe katılım yine bu sitede olur.",
  upcomingSection: "Yaklaşan etkinlikler",
  pastSection: "Geçmiş etkinlikler",
  showPastEvents: "Geçmiş etkinlikler",
  showUpcomingEvents: "Yaklaşan etkinlikler",
  newEvent: "Yeni etkinlik",
  newEventTitle: "Yeni etkinlik",
  newEventBlurb: "Kaydettikten sonra sosyal paylaşımlar için sabit bir bağlantınız olur.",
  editEvent: "Etkinliği düzenle",
  viewEvent: "Etkinliği görüntüle",
  readOnlyBlurb:
    "Bu etkinlik sona erdi. Ayrıntılar salt okunur; aşağıdan katılımcıları inceleyebilir veya etkinliği silebilirsiniz.",
  eventNotFound: "Etkinlik bulunamadı",
  editPageTitle: "Düzenle — {title}",
  pastBadge: "Geçmiş",
  noCover: "Kapak yok",
  noPastEvents: "Henüz geçmiş etkinlik yok.",
  noUpcomingEvents: "Yaklaşan etkinlik yok.",
  createOne: "Bir tane oluştur",
  emptyOr: "veya",
  viewPastEvents: "geçmiş etkinliklere bak",
  view: "Görüntüle",
  viewPublicPage: "Herkese açık sayfayı gör →",
  visibilityAria: "Görünürlük",
  edit: "Düzenle",
  details: "Ayrıntılar",
  share: "Paylaş",
  copied: "Kopyalandı",
  copyShareLinkFor: "Paylaşım bağlantısını kopyala:",

  shareLink: "Paylaşım bağlantısı",
  shareLinkHint:
    "Bu bağlantıya sahip herkes etkinlik sayfasını açabilir. Katılmak için yine bu sitede hesap gerekir.",
  copy: "Kopyala",

  basics: "Temel bilgiler",
  title: "Başlık",
  eventType: "Etkinlik türü",
  activityPresetsHint:
    "Bir şablon seçin veya kendi adınızı ve emojinizi girin. Özel etkinlikler için her şey geçerlidir.",
  activityPresetsAria: "Etkinlik türü şablonları",
  typeName: "Tür adı",
  typeNamePlaceholder: "ör. Patika koşusu, Kulüp yemeği…",
  emojiOptional: "Emoji (isteğe bağlı)",
  emojiHint: "Bilinen türler için otomatik eşleşme için boş bırakın veya emoji yapıştırın.",
  presets: {
    Run: "Koşu",
    Hike: "Yürüyüş",
    Barbecue: "Barbekü",
    Walk: "Yürüyüş",
    Social: "Sosyal",
    Ride: "Bisiklet",
  } as Record<string, string>,

  notesDescription: "Notlar / açıklama",
  starts: "Başlangıç",
  endsOptional: "Bitiş (isteğe bağlı)",
  visibility: "Görünürlük",
  visibilityPublic: "Herkese açık — ana sayfada listelenir; katılmak için hesap gerekir",
  visibilityMembers:
    "Yalnızca üyeler — ana sayfada listelenir; görmek ve katılmak için hesap gerekir",
  visibilityPrivate: "Özel — ana sayfada listelenmez",
  visibilityHint:
    "Herkese açık ve yalnızca üye etkinlikleri sitede Yaklaşan Koşularda görünür. Katılmak için her zaman giriş yapılmış hesap gerekir.",

  meetingPoint: "Buluşma noktası",
  placeName: "Yer adı",
  address: "Adres",
  latitudeOptional: "Enlem (isteğe bağlı)",
  longitudeOptional: "Boylam (isteğe bağlı)",

  activityDetails: "Etkinlik ayrıntıları",
  typeMetricsHeading: "Bu aktivite için ayrıntılar",
  typeMetricsBlurb:
    "Aşağıdaki alanlar tür adına göre değişir (ör. koşularda tempo, yürüyüşte zorluk). Boş bırakabilirsiniz.",
  distanceKm: "Mesafe (km)",
  distancePlaceholder: "ör. 5,2",
  pace: "Tempo",
  pacePlaceholder: "ör. ~7:30/km",
  difficulty: "Zorluk",
  difficultyPlaceholder: "ör. orta, dik bölümler",

  cost: "Ücret",
  costLegend: "Katılım ücreti",
  costFree: "Ücretsiz",
  costPaid: "Ücretli / katkı",
  costDetails: "Ücret ayrıntıları",
  costDetailsPlaceholder: "ör. Kişi başı 150 TL, kayıtta ödeme…",

  requiredItems: "Gerekli eşyalar",
  requiredItemsPlaceholder: "Su, görünürlük ekipmanı…",
  coordinator: "Koordinatör",
  maxParticipants: "Maks. katılımcı",
  joinDeadline: "Kayıt son tarihi",
  joinDeadlineHint: "Boş bırakırsanız kayıt başlangıçtan 24 saat önce kapanır.",
  weatherConditions: "Hava / koşullar",

  coverImage: "Kapak görseli",
  coverImageHint:
    "JPEG, PNG, WebP veya GIF yükleyin (en fazla {maxMb} MB) veya aşağıya https görsel URL'si yapıştırın. Yükleme başarısız olursa daha küçük bir dosya ({maxKb} KB altı) veya barındırılan bir bağlantı deneyin.",
  coverImageHintDev:
    "{token} ayarlıysa yüklemeler Vercel Blob'a gider (en fazla {maxMb} MB). Yoksa daha küçük görseller ({maxKb} KB veya altı) veritabanına gömülür.",
  uploadTooLarge: "Görsel en fazla {maxMb} MB olmalıdır.",
  uploadTooLargeInline:
    "Görsel çok büyük (burada en fazla {maxKb} KB). Daha küçük bir dosya deneyin veya aşağıya https görsel URL'si yapıştırın.",
  uploadBadMime: "JPEG, PNG, WebP veya GIF kullanın.",
  uploadImage: "Görsel yükle",
  uploading: "Yükleniyor…",
  uploadFailed: "Yükleme başarısız.",
  removeImage: "Görseli kaldır",
  imageUrlOptional: "Veya görsel URL'si (https)",
  imageUrlPlaceholder: "https://…",

  createEvent: "Etkinlik oluştur",
  eventCreatedSuccess: "Etkinlik başarıyla oluşturuldu.",
  saveChanges: "Değişiklikleri kaydet",
  saving: "Kaydediliyor…",

  registrationHeading: "Kayıt formu",
  registrationBlurb:
    "Katılımcıların katılırken yanıtladığı soruları ekleyin — kısa bir Google Form gibi. Başka bir yanıt işaretlendiğinde yalnızca o zaman görünen sorular ekleyebilirsiniz.",
  noQuestionsYet:
    'Henüz kayıt sorusu yok. Bilgi toplamak için bir soru ekleyin (ör. "Kendi arabanızla mı geliyorsunuz?") veya basit kayıt için boş bırakın.',
  questionN: "Soru {n}",
  questionLabel: "Soru metni",
  questionLabelPlaceholder: 'ör. "Kendi arabanızla mı geliyorsunuz?"',
  answerType: "Yanıt türü",
  required: "Zorunlu",
  showOnlyWhen: "Bu soruyu yalnızca şu durumda göster",
  alwaysShow: "Her zaman göster",
  untitled: "(başlıksız)",
  dependsYes: "…Evet ise",
  dependsNo: "…Hayır ise",
  dependsChecked: "…işaretli ise",
  dependsUnchecked: "…işaretli değilse",
  addQuestion: "+ Soru ekle",
  remove: "Kaldır",

  questionTypeCheckbox: "Onay kutusu (evet / hayır)",
  questionTypeYesNo: "Evet / Hayır",
  questionTypeText: "Kısa metin",
  questionTypeNumber: "Sayı",

  ruleWhenChecked: "İşaretli",
  ruleWhenUnchecked: "İşaretli değil",
  ruleWhenYes: "Yanıt Evet",
  ruleWhenNo: "Yanıt Hayır",
  ruleWhenEquals: "Eşittir",
  ruleWhenNotEquals: "Eşit değildir",

  joinApproval: "Katılım onayı",
  joinApprovalBlurb:
    "Birinin hemen kayıt olup olmayacağını veya koordinatör onayı bekleyeceğini belirleyin.",
  approvalAuto: "Otomatik kabul",
  approvalAutoHint: "Katılan herkes onaylanır (doluysa yedek liste geçerlidir).",
  approvalManual: "Her zaman onay gerekir",
  approvalManualHint: "Her kayıt bir yönetici kabul edene kadar bekler.",
  approvalConditional: "Koşullu onay",
  approvalConditionalHint:
    "Bir yanıta göre beklemede veya otomatik kabul (ör. araba yok → beklemede).",
  approvalConditionalNeedQuestion: "Koşullu onay için en az bir soru ekleyin.",
  whenAnswer: "Bu yanıt…",
  selectQuestion: "Soru seçin…",
  valueToMatch: "Eşleşecek değer",
  thenStatus: "…ise durum",
  statusPending: "Onay bekliyor",
  statusAutoAccepted: "Otomatik kabul",
  switchOutcome: "(değiştir)",
  everyoneElse: "Diğer herkes",
  defaultAutoAccept: "Otomatik kabul",
  defaultPending: "Onay bekliyor",

  delete: "Sil",
  deleteEvent: "Etkinliği sil",
  deleteConfirmBlurb:
    "Bu işlem geri alınamaz. Onaylamak için etkinlik başlığını aşağıdaki gibi yazın.",
  deleteConfirmPlaceholder: "Tam başlığı yazın",
  cancel: "İptal",
  deletePermanently: "Kalıcı olarak sil",
  deleting: "Siliniyor…",
  confirmTitleSr: "Onay için başlığı yazın",

  actions: {
    mustSignIn: "Giriş yapmalısınız.",
    noPermission: "Etkinlikleri yönetme yetkiniz yok.",
    invalidEvent: "Geçersiz etkinlik.",
    eventNotFound: "Etkinlik bulunamadı.",
    eventNotEditable: "Bu etkinlik sona erdi ve artık düzenlenemez.",
    invalidInput: "Geçersiz giriş.",
    startRequired: "Başlangıç tarihi ve saati zorunludur.",
    eventUpdated: "Etkinlik güncellendi.",
    coverTooLarge:
      "Kapak görseli çok büyük. Daha küçük bir dosya veya Vercel Blob kullanın.",
    invalidCover: "Geçersiz kapak görseli.",
    confirmDeleteHint: "Silmeyi onaylamak için etkinlik başlığını aynen yazın.",
    confirmTitleMismatch: "Onay metni etkinlik başlığıyla birebir eşleşmeli.",
    titleRequired: "Başlık zorunludur.",
    invalidCoverUrl:
      "Kapak, https URL, yüklenen görsel veya küçük gömülü görsel olmalıdır.",
    questionLabelRequired: "Her kayıt sorusunun bir etiketi olmalıdır.",
    conditionalApprovalNeedsQuestion:
      "Koşullu onay için en az bir kayıt sorusu ekleyin.",
    followUpParentRemoved: "Bir takip sorusu kaldırılmış bir üst soruya referans veriyor.",
    followUpParentInvalid:
      "Takip soruları yalnızca Evet/Hayır veya onay kutusu sorusuna bağlanabilir.",
    followUpMustFollowParent:
      "Üst soruyu takip sorusunun üstüne taşıyın (↑ düğmesi).",
  },
} as const;

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

export type AdminEventFormCopy = WidenStrings<typeof adminEventFormEn>;
