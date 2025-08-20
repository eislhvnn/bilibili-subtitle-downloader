// Content Script
// 这个脚本会被注入到匹配的网页中

console.log('=== B站字幕下载插件已加载 ===');
console.log('当前页面URL:', window.location.href);
console.log('当前页面域名:', window.location.hostname);
console.log('当前页面路径:', window.location.pathname);

// 立即显示一个测试消息，确认脚本已注入
console.log('B站字幕下载插件已注入到页面！');

let apiHelper = null;

// 直接在content script中定义完整的B站字幕下载助手
class BiliWbiApiHelper {
    constructor() {
        console.log('BiliWbiApiHelper构造函数被调用');
        
        // --- Self-contained MD5 implementation ---
        this.md5 = (function() {
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }
            function bit_rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }
            function cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }
            function ff(a, b, c, d, x, s, t) {
                return cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }
            function gg(a, b, c, d, x, s, t) {
                return cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }
            function hh(a, b, c, d, x, s, t) {
                return cmn(b ^ c ^ d, a, b, x, s, t);
            }
            function ii(a, b, c, d, x, s, t) {
                return cmn(c ^ (b | (~d)), a, b, x, s, t);
            }
            function core_md5(x, len) {
                x[len >> 5] |= 0x80 << ((len) % 32);
                x[(((len + 64) >>> 9) << 4) + 14] = len;
                var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
                for (var i = 0; i < x.length; i += 16) {
                    var olda = a, oldb = b, oldc = c, oldd = d;
                    a = ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = ff(c, d, a, b, x[i + 2], 17, -1120210379);
                    b = ff(b, c, d, a, x[i + 3], 22, -40341101);
                    a = ff(a, b, c, d, x[i + 4], 7, -1502002290);
                    d = ff(d, a, b, c, x[i + 5], 12, 1236535329);
                    c = ff(c, d, a, b, x[i + 6], 17, -165796510);
                    b = ff(b, c, d, a, x[i + 7], 22, -1069501632);
                    a = ff(a, b, c, d, x[i + 8], 7, -187363961);
                    d = ff(d, a, b, c, x[i + 9], 12, 1163531501);
                    c = ff(c, d, a, b, x[i + 10], 17, -1444681467);
                    b = ff(b, c, d, a, x[i + 11], 22, -51403784);
                    a = ff(a, b, c, d, x[i + 12], 7, 1770035416);
                    d = ff(d, a, b, c, x[i + 13], 12, -1958414417);
                    c = ff(c, d, a, b, x[i + 14], 17, -42063);
                    b = ff(b, c, d, a, x[i + 15], 22, -1990404162);
                    a = gg(a, b, c, d, x[i + 1], 5, 1804603682);
                    d = gg(d, a, b, c, x[i + 6], 9, -40341101);
                    c = gg(c, d, a, b, x[i + 11], 14, -1502002290);
                    b = gg(b, c, d, a, x[i + 0], 20, 1236535329);
                    a = gg(a, b, c, d, x[i + 5], 5, -165796510);
                    d = gg(d, a, b, c, x[i + 10], 9, -1069501632);
                    c = gg(c, d, a, b, x[i + 15], 14, 643717713);
                    b = gg(b, c, d, a, x[i + 4], 20, -373897302);
                    a = gg(a, b, c, d, x[i + 9], 5, -701558691);
                    d = gg(d, a, b, c, x[i + 14], 9, 38016083);
                    c = gg(c, d, a, b, x[i + 3], 14, -660478335);
                    b = gg(b, c, d, a, x[i + 8], 20, -405537848);
                    a = gg(a, b, c, d, x[i + 13], 5, 568446438);
                    d = gg(d, a, b, c, x[i + 2], 9, -1019803690);
                    c = gg(c, d, a, b, x[i + 7], 14, -187363961);
                    b = gg(b, c, d, a, x[i + 12], 20, 1163531501);
                    a = hh(a, b, c, d, x[i + 5], 4, -1444681467);
                    d = hh(d, a, b, c, x[i + 8], 11, -51403784);
                    c = hh(c, d, a, b, x[i + 11], 16, 1770035416);
                    b = hh(b, c, d, a, x[i + 14], 23, -1958414417);
                    a = hh(a, b, c, d, x[i + 1], 4, -42063);
                    d = hh(d, a, b, c, x[i + 4], 11, -1990404162);
                    c = hh(c, d, a, b, x[i + 7], 16, 1804603682);
                    b = hh(b, c, d, a, x[i + 10], 23, -40341101);
                    a = hh(a, b, c, d, x[i + 13], 4, -1502002290);
                    d = hh(d, a, b, c, x[i + 0], 11, 1236535329);
                    c = hh(c, d, a, b, x[i + 3], 16, -165796510);
                    b = hh(b, c, d, a, x[i + 6], 23, -1069501632);
                    a = hh(a, b, c, d, x[i + 9], 4, 643717713);
                    d = hh(d, a, b, c, x[i + 12], 11, -373897302);
                    c = hh(c, d, a, b, x[i + 15], 16, -701558691);
                    b = hh(b, c, d, a, x[i + 2], 23, 38016083);
                    a = ii(a, b, c, d, x[i + 0], 6, -660478335);
                    d = ii(d, a, b, c, x[i + 7], 10, -405537848);
                    c = ii(c, d, a, b, x[i + 14], 15, 568446438);
                    b = ii(b, c, d, a, x[i + 5], 21, -1019803690);
                    a = ii(a, b, c, d, x[i + 12], 6, -187363961);
                    d = ii(d, a, b, c, x[i + 3], 10, 1163531501);
                    c = ii(c, d, a, b, x[i + 10], 15, -1444681467);
                    b = ii(b, c, d, a, x[i + 1], 21, -51403784);
                    a = ii(a, b, c, d, x[i + 8], 6, 1770035416);
                    d = ii(d, a, b, c, x[i + 15], 10, -1958414417);
                    c = ii(c, d, a, b, x[i + 6], 15, -42063);
                    b = ii(b, c, d, a, x[i + 13], 21, -1990404162);
                    a = ii(a, b, c, d, x[i + 4], 6, 1804603682);
                    d = ii(d, a, b, c, x[i + 11], 10, -40341101);
                    c = ii(c, d, a, b, x[i + 2], 15, -1502002290);
                    b = ii(b, c, d, a, x[i + 9], 21, 1236535329);
                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return [a, b, c, d];
            }
            function str2binl(str) {
                var bin = [];
                var mask = (1 << 8) - 1;
                for (var i = 0; i < str.length * 8; i += 8)
                    bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
                return bin;
            }
            function binl2hex(binarray) {
                var hex_tab = "0123456789abcdef";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                           hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
                }
                return str;
            }
            return function(s) {
                return binl2hex(core_md5(str2binl(s), s.length * 8));
            };
        }());

        this.mixinKeyEncTab = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
            33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
            61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
            36, 20, 34, 44, 52
        ];
        this.fixedDmParams = {

        };

        // 尝试从storage加载动态指纹
        try {
            chrome.storage && chrome.storage.local.get(['dynamicDmParams'], (res) => {
                if (res && res.dynamicDmParams) {
                    console.log('加载到已保存的动态指纹参数:', res.dynamicDmParams);
                    this._updateFixedDmParams(res.dynamicDmParams);
                } else {
                    // 首次无指纹，按需刷新一次页面以便网站自身发起的请求被后台拦截
                    try {
                        const alreadyReloaded = sessionStorage.getItem('dmParamsReloaded');
                        const isBilibiliVideo = window.location.href.includes('bilibili.com/video/');
                        if (!alreadyReloaded && isBilibiliVideo) {
                            sessionStorage.setItem('dmParamsReloaded', '1');
                            console.log('未检测到动态指纹参数，刷新页面以捕获指纹参数...');
                            window.location.reload();
                        }
                    } catch (e) {
                        console.warn('尝试触发一次刷新失败:', e);
                    }
                }
            });

            // 监听动态指纹的后续更新，实时合入
            if (chrome.storage && chrome.storage.onChanged) {
                chrome.storage.onChanged.addListener((changes, area) => {
                    try {
                        if (area === 'local' && changes.dynamicDmParams) {
                            const newVal = changes.dynamicDmParams.newValue;
                            console.log('检测到动态指纹参数更新:', newVal);
                            this._updateFixedDmParams(newVal);
                        }
                    } catch (e) {
                        console.warn('处理动态指纹变更时出错:', e);
                    }
                });
            }
        } catch (e) {
            console.warn('读取动态指纹失败:', e);
        }
    }

    _getBvId() {
        console.log('开始获取BVID，当前URL:', window.location.href);
        console.log('当前路径:', window.location.pathname);
        
        const match = window.location.pathname.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
        if (match) {
            console.log('通过路径匹配找到BVID:', match[0]);
            return match[0];
        }
        
        const seriesMatch = window.location.pathname.match(/\/series\/(BV[1-9A-HJ-NP-Za-km-z]{10})/i);
        if (seriesMatch) {
            console.log('通过系列匹配找到BVID:', seriesMatch[1]);
            return seriesMatch[1];
        }
        
        console.error("BV ID not found in the current URL.");
        return null;
    }

    _updateFixedDmParams(newParams) {
        if (!newParams || typeof newParams !== 'object') return;
        const keys = [
            'isGaiaAvoided',
            'web_location',
            'dm_img_list',
            'dm_img_str',
            'dm_cover_img_str',
            'dm_img_inter'
        ];
        let changed = false;
        keys.forEach(k => {
            if (newParams[k] != null && this.fixedDmParams[k] !== newParams[k]) {
                this.fixedDmParams[k] = newParams[k];
                changed = true;
            }
        });
        if (changed) {
            console.log('fixedDmParams已更新为:', this.fixedDmParams);
        }
    }

    _signRequest(params, mixinKey) {
        params['wts'] = Math.round(Date.now() / 1000);
        const sortedKeys = Object.keys(params).sort();
        const queryParts = [];
        for (const key of sortedKeys) {
            const value = String(params[key]).replace(/[!'()*]/g, '');
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        const query = queryParts.join('&');
        const stringToHash = query + mixinKey;
        const w_rid = this.md5(stringToHash);
        return { w_rid: w_rid, wts: params.wts };
    }
    
    _convertToSrt(subtitleJson) {
        if (!subtitleJson.body || subtitleJson.body.length === 0) return '';
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = Math.floor(seconds % 60).toString().padStart(2, '0');
            const ms = Math.round((seconds - Math.floor(seconds)) * 1000).toString().padStart(3, '0');
            return `${h}:${m}:${s},${ms}`;
        };
        let srtContent = '';
        subtitleJson.body.forEach((line, index) => {
            srtContent += `${index + 1}\n`;
            srtContent += `${formatTime(line.from)} --> ${formatTime(line.to)}\n`;
            srtContent += `${line.content}\n\n`;
        });
        return srtContent;
    }

    _triggerDownload(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`✅ Download started for ${filename}`);
    }

    async _getMixinKey() {
        try {
            const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
                cache: 'no-store',
                headers: { 'User-Agent': navigator.userAgent, 'Referer': 'https://www.bilibili.com/' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json_data = await response.json();
            if (json_data.code !== 0) throw new Error(`API error: [${json_data.code}] ${json_data.message}`);
            const img_url = json_data.data.wbi_img.img_url;
            const sub_url = json_data.data.wbi_img.sub_url;
            const original_key = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')) + sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
            let shuffled_key = '';
            for (const i of this.mixinKeyEncTab) {
                shuffled_key += original_key[i];
            }
            return shuffled_key.slice(0, 32);
        } catch (error) {
            console.error("Failed to get mixinKey:", error);
            return null;
        }
    }

    async _getAllPartsList(bvid) {
        console.log(`➡️ Fetching comprehensive video info for BVID: ${bvid}...`);
        const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': navigator.userAgent, 'Referer': `https://www.bilibili.com/video/${bvid}/` },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json_data = await response.json();
            if (json_data.code !== 0) throw new Error(`API error: ${json_data.message}`);

            const videoData = json_data.data;
            const results = [];
            const processedCids = new Set();
            
            const mainBvid = videoData.bvid;
            const mainAid = videoData.aid;

            if (videoData.pages && videoData.pages.length > 0) {
                 videoData.pages.forEach(page => {
                    if (page.cid && !processedCids.has(page.cid)) {
                        results.push({
                            title: page.part || `P${page.page}`,
                            bvid: mainBvid,
                            cid: page.cid,
                            aid: mainAid
                        });
                        processedCids.add(page.cid);
                    }
                 });
            }

            if (videoData.ugc_season && videoData.ugc_season.sections) {
                videoData.ugc_season.sections.forEach(section => {
                    section.episodes.forEach(episode => {
                        if (episode.cid && !processedCids.has(episode.cid)) {
                            results.push({
                                title: episode.title,
                                bvid: episode.bvid,
                                cid: episode.cid,
                                aid: episode.aid
                            });
                            processedCids.add(episode.cid);
                        }
                    });
                });
            }
            
            if (results.length === 0 && videoData.cid && !processedCids.has(videoData.cid)) {
                 results.push({
                    title: videoData.title,
                    bvid: mainBvid,
                    cid: videoData.cid,
                    aid: mainAid
                });
            }

            console.log(`✅ Found ${results.length} unique video parts.`);
            return results;
        } catch (error) {
            console.error("❌ Failed to get or process comprehensive video parts list:", error);
            return null;
        }
    }

    async _fetchAndDownloadSubtitleForPart(partInfo, lang) {
        console.log(`🚀 Starting process for: "${partInfo.title}" (cid: ${partInfo.cid})`);
        
        const mixinKey = await this._getMixinKey();
        if (!mixinKey) return;
        console.log("✅ Got WBI mixinKey.");

        let baseParams = { aid: partInfo.aid, cid: partInfo.cid, ...this.fixedDmParams };
        const signature = this._signRequest(baseParams, mixinKey);
        const finalParams = { ...baseParams, ...signature };
        const finalUrl = `https://api.bilibili.com/x/player/wbi/v2?${new URLSearchParams(finalParams)}`;

        console.log("➡️ Sending signed request for player data...");
        try {
            const response = await fetch(finalUrl, {
                credentials: 'include',
                headers: { 'Referer': `https://www.bilibili.com/video/${partInfo.bvid}/`, 'User-Agent': navigator.userAgent }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const videoData = await response.json();
            if (videoData.code !== 0) throw new Error(`Player API error: [${videoData.code}] ${videoData.message}`);

            const subtitles = videoData.data.subtitle?.subtitles;
            if (!subtitles || subtitles.length === 0) {
                console.error("❌ No subtitles found for this video part.");
                alert("未找到字幕");
                return;
            }
            let targetSubtitle = subtitles.find(sub => sub.lan === lang);
            if (!targetSubtitle) {
                console.warn(`⚠️ Language "${lang}" not found. Defaulting to first available: "${subtitles[0].lan_doc}".`);
                targetSubtitle = subtitles[0];
            } else {
                console.log(`✅ Found subtitle track: "${targetSubtitle.lan_doc}"`);
            }
            
            const subtitleUrl = `https:${targetSubtitle.subtitle_url}`;
            const subResponse = await fetch(subtitleUrl, {
                headers: { 'User-Agent': navigator.userAgent, 'Referer': `https://www.bilibili.com/video/${partInfo.bvid}/` }
            });
            if (!subResponse.ok) throw new Error(`Subtitle fetch error! status: ${subResponse.status}`);
            const subtitleJson = await subResponse.json();
            
            console.log("➡️ Converting JSON to SRT format...");
            const srtContent = this._convertToSrt(subtitleJson);

            const filename = `${partInfo.bvid}_${partInfo.title.replace(/[\/\\?%*:|"<>]/g, '-')}.srt`;
            this._triggerDownload(srtContent, filename, 'application/x-subrip');

        } catch (error) {
            console.error("❌ An error occurred during the final subtitle processing:", error);
            alert("字幕下载失败: " + error.message);
        }
    }

    async selectAndDownloadSubtitle(lang = 'ai-zh') {
        console.log('开始执行selectAndDownloadSubtitle方法');
        
        const bvid = this._getBvId();
        console.log('获取到的BVID:', bvid);
        if (!bvid) {
            console.error('无法获取BVID');
            alert('无法获取BVID');
            return;
        }

        const partsList = await this._getAllPartsList(bvid);
        console.log('获取到的视频分P列表:', partsList);
        if (!partsList || partsList.length === 0) {
            console.error("❌ Could not retrieve any video parts. Please check the BVID or network.");
            alert("无法获取视频分P信息");
            return;
        }

        // 在Chrome插件环境中，直接下载第一个分P的字幕
        console.log('在插件环境中，自动选择第一个分P进行下载');
        const selectedPart = partsList[0];
        console.log('选择的视频分P:', selectedPart);
        
        await this._fetchAndDownloadSubtitleForPart(selectedPart, lang);
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面DOM加载完成');
    checkAndLoadSubtitleHelper();
});

// 检查并加载字幕下载助手
function checkAndLoadSubtitleHelper() {
    console.log('检查页面类型...');
    console.log('URL包含bilibili.com:', window.location.href.includes('bilibili.com'));
    console.log('URL包含video:', window.location.href.includes('video'));
    console.log('路径包含video:', window.location.pathname.includes('video'));
    
    // 检查是否是B站视频页面
    if (window.location.href.includes('bilibili.com/video/') || 
        window.location.pathname.includes('/video/')) {
        console.log('✅ 检测到B站视频页面，准备加载字幕下载功能');
        loadSubtitleHelper();
    } else {
        console.log('❌ 当前页面不是B站视频页面');
    }
}

// 加载字幕下载助手
function loadSubtitleHelper() {
    console.log('开始加载字幕下载助手...');
    console.log('当前页面URL:', window.location.href);
    
    try {
        // 直接使用内联的BiliWbiApiHelper类
        console.log('使用内联的BiliWbiApiHelper类');
        apiHelper = new BiliWbiApiHelper();
        console.log('✅ BiliWbiApiHelper实例创建成功:', apiHelper);
        console.log('字幕下载助手加载成功！');
        
        // 延迟检查实例是否正确创建
        setTimeout(() => {
            console.log('延迟检查 - apiHelper状态:', apiHelper);
            if (apiHelper && typeof apiHelper._getBvId === 'function') {
                console.log('✅ apiHelper实例验证成功');
            } else {
                console.error('❌ apiHelper实例验证失败');
                alert('字幕下载助手实例验证失败');
            }
        }, 1000);
    } catch (error) {
        console.error('❌ 创建BiliWbiApiHelper实例失败:', error);
        console.error('错误堆栈:', error.stack);
        alert('创建字幕下载助手实例失败: ' + error.message);
    }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Content script收到消息:', request);
    console.log('当前apiHelper状态:', apiHelper);
    
    if (request.action === 'downloadSubtitle') {
        console.log('🎯 收到下载字幕请求');
        console.log('多P模式:', request.multiMode);
        
        // 简单的测试响应
        if (!apiHelper) {
            console.error('❌ apiHelper未加载');
            alert('字幕下载助手未加载，请刷新页面后重试');
            sendResponse({ success: false, error: '字幕下载助手未加载' });
            return true;
        }
        
        try {
            if (request.multiMode) {
                // 多P模式：显示分P选择界面
                console.log('🚀 多P模式：显示分P选择界面...');
                showMultiPartSelection();
                sendResponse({ success: true, message: '多P模式已启动' });
            } else {
                // 单P模式：直接下载第一个分P
                console.log('🚀 单P模式：开始调用selectAndDownloadSubtitle方法...');
                apiHelper.selectAndDownloadSubtitle();
                console.log('✅ selectAndDownloadSubtitle调用成功');
                sendResponse({ success: true });
            }
        } catch (error) {
            console.error('❌ 字幕下载启动失败:', error);
            alert('字幕下载启动失败: ' + error.message);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    return true;
});

// 检查页面是否已经加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        checkAndLoadSubtitleHelper();
    });
} else {
    console.log('页面已经加载完成，直接检查');
    checkAndLoadSubtitleHelper();
}

// 添加测试函数
function testSubtitleHelper() {
    console.log('测试字幕下载助手...');
    console.log('当前页面URL:', window.location.href);
    console.log('apiHelper状态:', apiHelper);
    
    if (apiHelper) {
        console.log('apiHelper方法列表:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiHelper)));
        console.log('测试_getBvId方法...');
        const bvid = apiHelper._getBvId();
        console.log('获取到的BVID:', bvid);
    } else {
        console.log('apiHelper未加载');
    }
}

// 多P选择界面相关函数
let currentPartsList = [];
let multiPartOverlay = null;

// 显示多P选择界面
async function showMultiPartSelection() {
    try {
        const bvid = apiHelper._getBvId();
        if (!bvid) {
            alert('无法获取视频BV号');
            return;
        }
        
        console.log('获取视频分P列表...');
        const partsList = await apiHelper._getAllPartsList(bvid);
        if (!partsList || partsList.length === 0) {
            alert('无法获取视频分P信息');
            return;
        }
        
        currentPartsList = partsList;
        createMultiPartOverlay(partsList);
        
    } catch (error) {
        console.error('获取分P列表失败:', error);
        alert('获取分P列表失败: ' + error.message);
    }
}

// 创建多P选择覆盖层
function createMultiPartOverlay(partsList) {
    // 移除已存在的覆盖层
    if (multiPartOverlay) {
        document.body.removeChild(multiPartOverlay);
    }
    
    // 创建覆盖层
    multiPartOverlay = document.createElement('div');
    multiPartOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    // 创建内容容器
    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    // 标题
    const title = document.createElement('h3');
    title.textContent = `📺 视频分P列表 (共${partsList.length}个分P)`;
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
        text-align: center;
    `;
    container.appendChild(title);
    
    // 分P列表
    const partsContainer = document.createElement('div');
    partsContainer.style.cssText = `
        margin-bottom: 20px;
    `;
    
    partsList.forEach((part, index) => {
        const partItem = document.createElement('div');
        partItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
        `;
        
        const partTitle = document.createElement('span');
        partTitle.textContent = part.title;
        partTitle.style.cssText = `
            flex: 1;
            font-size: 14px;
            color: #333;
            margin-right: 10px;
        `;
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载字幕';
        downloadBtn.style.cssText = `
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: transform 0.2s ease;
        `;
        
        downloadBtn.addEventListener('click', () => downloadPart(index));
        downloadBtn.addEventListener('mouseenter', () => {
            downloadBtn.style.transform = 'translateY(-1px)';
            downloadBtn.style.background = 'linear-gradient(135deg, #218838 0%, #1ea085 100%)';
        });
        downloadBtn.addEventListener('mouseleave', () => {
            downloadBtn.style.transform = 'none';
            downloadBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        });
        
        partItem.appendChild(partTitle);
        partItem.appendChild(downloadBtn);
        partsContainer.appendChild(partItem);
    });
    
    container.appendChild(partsContainer);
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
    `;
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(multiPartOverlay);
        multiPartOverlay = null;
    });
    container.appendChild(closeBtn);
    
    multiPartOverlay.appendChild(container);
    document.body.appendChild(multiPartOverlay);
}

// 下载指定分P的字幕
async function downloadPart(partIndex) {
    if (!currentPartsList || !currentPartsList[partIndex]) {
        alert('分P信息无效');
        return;
    }
    
    const part = currentPartsList[partIndex];
    const button = event.target;
    
    // 禁用按钮防止重复点击
    button.disabled = true;
    button.textContent = '下载中...';
    button.style.background = '#6c757d';
    
    try {
        await apiHelper._fetchAndDownloadSubtitleForPart(part, 'ai-zh');
        
        button.textContent = '下载完成';
        button.style.background = '#28a745';
        
        // 3秒后恢复按钮状态
        setTimeout(() => {
            if (button.parentNode) {
                button.disabled = false;
                button.textContent = '下载字幕';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            }
        }, 3000);
        
    } catch (error) {
        console.error('下载失败:', error);
        button.textContent = '下载失败';
        button.style.background = '#dc3545';
        
        // 3秒后恢复按钮状态
        setTimeout(() => {
            if (button.parentNode) {
                button.disabled = false;
                button.textContent = '下载字幕';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            }
        }, 3000);
        
        alert('下载失败: ' + error.message);
    }
}

// 在控制台中暴露测试函数
window.testSubtitleHelper = testSubtitleHelper;

// 立即执行一次测试
console.log('🔧 执行初始测试...');
setTimeout(() => {
    console.log('🔧 延迟测试 - 检查插件状态');
    console.log('当前页面:', window.location.href);
    console.log('apiHelper状态:', apiHelper);
    if (apiHelper) {
        console.log('✅ apiHelper已加载');
        testSubtitleHelper();
    } else {
        console.log('❌ apiHelper未加载');
    }
}, 2000); 