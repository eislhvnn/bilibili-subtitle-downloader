// Background Service Worker
// 负责：安装初始化 + 捕获 B 站播放器请求中的动态指纹参数(dm_*)供签名使用。

// 安装时初始化设置
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        'pluginInstalled': true,
        'installDate': new Date().toISOString(),
        'subtitleEnabled': false
    });
});

// 监听 player wbi 接口请求，提取并保存动态指纹参数
try {
    const targetUrls = ["https://api.bilibili.com/x/player/wbi/v2*"];

    chrome.webRequest.onBeforeRequest.addListener(function(details) {
        try {
            const sp = new URL(details.url).searchParams;
            const keys = ['isGaiaAvoided', 'web_location', 'dm_img_list', 'dm_img_str', 'dm_cover_img_str', 'dm_img_inter'];

            const dmParams = {};
            let hasAny = false;
            for (const k of keys) {
                if (sp.has(k)) {
                    dmParams[k] = sp.get(k);
                    hasAny = true;
                }
            }

            if (hasAny) {
                chrome.storage.local.set({
                    dynamicDmParams: dmParams,
                    dynamicDmParamsUpdatedAt: Date.now()
                });
            }
        } catch (e) {
            console.warn('解析 wbi/v2 请求时出错:', e);
        }
    }, { urls: targetUrls }, []);
} catch (err) {
    console.warn('注册 webRequest 监听失败:', err);
}
