import { AboutBlocksRenderer } from "@/components/about-blocks-renderer";
import { getPublishedSiteAbout } from "@/lib/site-about";

export default async function Home() {
  const { blocks, pageStyle } = await getPublishedSiteAbout();

  return (
    <div className="min-h-[calc(100dvh-5.5rem)]">
      <AboutBlocksRenderer blocks={blocks} pageStyle={pageStyle} />
    </div>
  );
}
