export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing "url" parameter', { status: 400 });
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          // 模拟浏览器访问，避免触发 Cloudflare 验证
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        return new Response('Failed to fetch image', { status: 502 });
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const imageBuffer = await response.arrayBuffer();

      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (err) {
      return new Response(`Error fetching image: ${err}`, { status: 500 });
    }
  },
};
