// Background Service Worker
// 这个文件在插件的后台运行，处理插件的核心逻辑

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(function() {
    console.log('B站字幕下载插件已安装');
    
    // 初始化设置
    chrome.storage.local.set({
        'pluginInstalled': true,
        'installDate': new Date().toISOString(),
        'subtitleEnabled': false
    });
});

// 监听来自popup或content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('收到消息:', request);
    
    if (request.action === 'buttonClicked') {
        console.log('按钮被点击，时间戳:', request.timestamp);
        
        // 发送响应回popup
        sendResponse({
            success: true,
            message: '消息已收到'
        });
    }
    
    // 必须返回true以保持消息通道开放（如果使用异步响应）
    return true;
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        console.log('标签页加载完成:', tab.url);
        
        // 如果是B站视频页面，可以在这里添加特殊处理
        if (tab.url && tab.url.includes('bilibili.com/video/')) {
            console.log('检测到B站视频页面:', tab.url);
        }
    }
}); 

// 监听B站 player wbi 接口请求，提取并保存动态指纹参数
try {
    const targetUrls = [
        "https://api.bilibili.com/x/player/wbi/v2*"
    ];

    chrome.webRequest.onBeforeRequest.addListener(function(details) {
        try {
            const urlObj = new URL(details.url);
            const sp = urlObj.searchParams;
            const keys = [
                'isGaiaAvoided',
                'web_location',
                'dm_img_list',
                'dm_img_str',
                'dm_cover_img_str',
                'dm_img_inter'
            ];

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
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.warn('保存动态指纹失败:', chrome.runtime.lastError.message);
                    } else {
                        console.log('已捕获并保存动态指纹参数:', dmParams);
                    }
                });
            }
        } catch (e) {
            console.warn('解析wbi/v2请求时出错:', e);
        }
    }, { urls: targetUrls }, []);
} catch (err) {
    console.warn('注册webRequest监听失败:', err);
}