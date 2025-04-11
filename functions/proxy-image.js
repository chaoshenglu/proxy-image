// 移除 export 语句，直接使用 addEventListener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const { request } = event;
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing "url" parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(imageUrl).origin,
        'Origin': new URL(imageUrl).origin
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 86400
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Failed to fetch image: ${response.status} ${response.statusText}\n${errorText}`, {
        status: 502
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (err) {
    return new Response(`Error fetching image: ${err}`, { status: 500 });
  }
}