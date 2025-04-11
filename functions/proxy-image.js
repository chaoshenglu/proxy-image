export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing "url" parameter', { status: 400 });
    }

    try {
      // 模拟完整浏览器请求
      const headers = new Headers({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://en.numista.com/',
        'Origin': 'https://en.numista.com',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'DNT': '1'
      });

      // 保留原始请求的部分headers
      if (request.headers.get('Accept-Encoding')) {
        headers.set('Accept-Encoding', request.headers.get('Accept-Encoding'));
      }

      const response = await fetch(imageUrl, {
        headers,
        cf: {
          // 使用不同的Cloudflare缓存策略
          cacheKey: `${imageUrl}|proxied`,
          cacheTtl: 86400
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // 返回图片响应
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(`Error fetching image: ${err}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}