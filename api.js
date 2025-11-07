// 文件路径: netlify/functions/api.js

export const handler = async (event, context) => {

  // 1. 设置跨域头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 2. 浏览器预检请求 (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: '',
    };
  }

  let targetUrl;

  try {
    // 3. 解析参数 (Netlify 已帮你解析好)
    // 我们用 URLSearchParams 来方便地操作它
    const params = new URLSearchParams(event.queryStringParameters);

    // 4. ✨ 检查有没有“暗号” (type=lyric) ✨
    if (params.get('type') === 'lyric') {
        // --- 目标：网易云歌词 ---
        // 移除我们的自定义暗号，剩下的参数传给网易云
        params.delete('type');
        // 确保必要的网易云参数存在 (lv=1, kv=1, tv=-1)
        if (!params.has('lv')) params.append('lv', '1');
        if (!params.has('kv')) params.append('kv', '1');
        if (!params.has('tv')) params.append('tv', '-1');
        
        targetUrl = `http://music.163.com/api/song/lyric?${params.toString()}`;

    } else {
        // --- 目标：vkeys 搜索/详情 (默认) ---
        targetUrl = `https://api.vkeys.cn/v2/music/netease?${params.toString()}`;
    }

    // 5. 发起请求 (这是我帮你补全的逻辑)
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`请求目标API失败，状态码: ${response.status}`);
    }

    const data = await response.json();

    // 6. 转发结果
    return {
      statusCode: 200,
      headers: {
        ...headers, // 包含跨域头
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Netlify body 必须是字符串
    };

  } catch (error) {
    // 7. 错误处理
    return {
      statusCode: 500,
      headers: {
        ...headers, // 包含跨域头
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: '转发失败', details: error.message, target: targetUrl }),
    };
  }
};