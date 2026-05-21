import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export async function getAdminEventFormCopy() {
  return getDictionary(await getLocale()).adminEventForm;
}
