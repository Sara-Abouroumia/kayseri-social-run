import { redirect } from "next/navigation";

/** Admin site page builder — disabled; restore implementation below when re-enabling nav link. */
export default function AdminAboutPage() {
  redirect("/dashboard/admin/events");
}

// import { getDictionary } from "@/i18n/get-dictionary";
// import { getLocale } from "@/i18n/get-locale";
// import { siteContainerClass } from "@/lib/layout";
// import { getDraftSiteAbout } from "@/lib/site-about";
// import { cn } from "@/lib/utils";
//
// import { AboutPageEditor } from "./about-editor";
//
// export default async function AdminAboutPage() {
//   const locale = await getLocale();
//   const dict = getDictionary(locale);
//   const draft = await getDraftSiteAbout();
//
//   return (
//     <main className={cn(siteContainerClass, "flex-1 py-8")}>
//       <AboutPageEditor
//         initialDraftBlocks={draft.draftBlocks}
//         initialDraftStyle={draft.draftPageStyle}
//         publishedBlocks={draft.publishedBlocks}
//         publishedStyle={draft.publishedPageStyle}
//         publishedAt={draft.publishedAt}
//         copy={dict.aboutEditor}
//       />
//     </main>
//   );
// }
