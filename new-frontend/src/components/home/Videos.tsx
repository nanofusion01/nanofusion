import { SectionHeader } from "@/components/ui/section-header";
import { VideosCarousel } from "./VideosCarousel";
import { supabase } from "@/lib/supabase";

export async function Videos() {
  // Načteme samostatné položky (videa a jednotlivé fotky bez alba)
  const { data: standaloneItems } = await supabase
    .from('gallery_items')
    .select('*')
    .is('album_id', null)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  // Načteme alba (skupiny fotek přidané společně)
  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*, gallery_items(*)')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  const formattedAlbums = (albums || []).map((album: any) => {
    const photos = (album.gallery_items || [])
      .filter((it: any) => it.is_active !== false)
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

    return {
      id: album.id,
      type: 'album' as const,
      title: album.title || album.caption || 'Fotogalerie',
      caption: album.caption || album.title,
      order_index: album.order_index ?? 0,
      url: photos[0]?.url || '',
      photos: photos.map((p: any) => ({ url: p.url, caption: p.caption || '' })),
      count: photos.length,
    };
  }).filter((a: any) => a.photos.length > 0);

  const formattedStandalone = (standaloneItems || []).map((item: any) => ({
    id: item.id,
    type: item.type as 'youtube' | 'image',
    youtube_id: item.youtube_id,
    url: item.url,
    title: item.caption || (item.type === 'youtube' ? 'Video' : 'Fotografie'),
    caption: item.caption,
    order_index: item.order_index ?? 0,
    photos: [{ url: item.url, caption: item.caption || '' }],
    count: 1,
  }));

  // Sloučíme a seřadíme podle order_index
  const allItems = [...formattedAlbums, ...formattedStandalone].sort(
    (a, b) => a.order_index - b.order_index
  );

  if (allItems.length === 0) return null;

  return (
    <section id="galerie" className="py-12 md:py-16 bg-white font-sans relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Špičková péče o váš majetek v detailech"
          variant="default"
        />
        <VideosCarousel videos={allItems} />
      </div>
    </section>
  );
}
