import type { Locale } from "../config";

export const transactionalEmailEn = {
  brandName: "Kayseri Social Run",
  footerTagline: "Community runs and activities in Kayseri.",
  footerIgnore: "If you did not request this email, you can safely ignore it.",
  visitSite: "Visit our website",

  verifySubject: "Verify your email — Kayseri Social Run",
  verifyHeading: "Confirm your email address",
  verifyGreetingNamed: "Hi {name},",
  verifyGreetingGeneric: "Hello,",
  verifyIntro:
    "Thanks for creating an account with Kayseri Social Run. Please confirm your email address so you can sign in, join activities, and stay up to date with upcoming runs.",
  verifyCta: "Verify my email",
  verifyLinkHint: "Or copy and paste this link into your browser:",
  verifyExpiry: "This link expires after a limited time for your security.",
  verifyIgnore:
    "If you did not create an account, you can ignore this message — no changes will be made.",

  inviteSubject: "You're invited — Kayseri Social Run admin access",
  inviteHeading: "Platform admin invitation",
  inviteGreeting: "Hello,",
  inviteIntro:
    "You have been invited to help manage Kayseri Social Run on our website. As a platform admin you can publish activities, review sign-ups, and support the community.",
  inviteEmailLabel: "Use this email when you register:",
  inviteCta: "Accept invitation & register",
  inviteLinkHint: "Or copy and paste this registration link:",
  inviteExpiry: "This invitation link expires in 14 days.",
  inviteStepsHeading: "What happens next",
  inviteStep1: "Open the button above and create your account with the email address shown.",
  inviteStep2: "We will send you a second email with a link to verify your email address.",
  inviteStep3: "After verification, your admin access is enabled automatically.",
  inviteIgnore:
    "If you were not expecting this invitation, you can ignore this email.",
} as const;

export const transactionalEmailTr = {
  brandName: "Kayseri Social Run",
  footerTagline: "Kayseri'de topluluk koşuları ve etkinlikleri.",
  footerIgnore: "Bu e-postayı siz istemediyseniz güvenle yok sayabilirsiniz.",
  visitSite: "Web sitemizi ziyaret edin",

  verifySubject: "E-postanızı doğrulayın — Kayseri Social Run",
  verifyHeading: "E-posta adresinizi onaylayın",
  verifyGreetingNamed: "Merhaba {name},",
  verifyGreetingGeneric: "Merhaba,",
  verifyIntro:
    "Kayseri Social Run hesabınızı oluşturduğunuz için teşekkürler. Giriş yapabilmek, etkinliklere katılabilmek ve yaklaşan koşulardan haberdar olmak için lütfen e-posta adresinizi doğrulayın.",
  verifyCta: "E-postamı doğrula",
  verifyLinkHint: "Veya bu bağlantıyı tarayıcınıza yapıştırın:",
  verifyExpiry: "Güvenliğiniz için bu bağlantının süresi sınırlıdır.",
  verifyIgnore:
    "Hesap oluşturmadıysanız bu mesajı yok sayabilirsiniz — herhangi bir işlem yapılmaz.",

  inviteSubject: "Davetlisiniz — Kayseri Social Run yönetici erişimi",
  inviteHeading: "Platform yöneticisi daveti",
  inviteGreeting: "Merhaba,",
  inviteIntro:
    "Kayseri Social Run web sitemizi yönetmek için davet edildiniz. Platform yöneticisi olarak etkinlik yayınlayabilir, kayıtları inceleyebilir ve topluluğu destekleyebilirsiniz.",
  inviteEmailLabel: "Kayıt olurken bu e-postayı kullanın:",
  inviteCta: "Daveti kabul et ve kayıt ol",
  inviteLinkHint: "Veya bu kayıt bağlantısını yapıştırın:",
  inviteExpiry: "Bu davet bağlantısının süresi 14 gün sonra dolacaktır.",
  inviteStepsHeading: "Sonraki adımlar",
  inviteStep1: "Yukarıdaki düğmeyi açın ve gösterilen e-posta adresiyle hesabınızı oluşturun.",
  inviteStep2: "E-posta adresinizi doğrulamanız için ikinci bir e-posta göndereceğiz.",
  inviteStep3: "Doğrulamadan sonra yönetici erişiminiz otomatik olarak açılır.",
  inviteIgnore:
    "Bu daveti beklemiyorsanız bu e-postayı yok sayabilirsiniz.",
} as const;

export type TransactionalEmailCopy =
  | typeof transactionalEmailEn
  | typeof transactionalEmailTr;

const copies: Record<Locale, TransactionalEmailCopy> = {
  en: transactionalEmailEn,
  tr: transactionalEmailTr,
};

export function getTransactionalEmailCopy(locale: Locale): TransactionalEmailCopy {
  return copies[locale] ?? transactionalEmailEn;
}
