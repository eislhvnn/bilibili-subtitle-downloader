// 简化的B站字幕下载助手类
class BiliWbiApiHelper {
    constructor() {
        console.log('BiliWbiApiHelper构造函数被调用');
        
        // 简化的MD5实现
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
            'isGaiaAvoided': 'false',
            'web_location': '1315873',
            'dm_img_list': '[]',
            'dm_img_str': 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
            'dm_cover_img_str': 'QU5HTEUgKEludGVsLCBJbnRlbChSKSBVSEQgR3JhcGhpY3MgNjIwICgweDAwMDA1OTE3KSBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKUdvb2dsZSBJbmMuIChJbnRlbC',
            'dm_img_inter': '{"ds":[],"wh":[2959,5003,33],"of":[264,528,264]}'
        };
    }

    _getBvId() {
        const match = window.location.pathname.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
        if (match) return match[0];
        return null;
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
                throw new Error("未找到字幕");
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
            throw error;
        }
    }

    async selectAndDownloadSubtitle(lang = 'ai-zh', customBvid = null) {
        console.log('开始执行selectAndDownloadSubtitle方法');
        
        const bvid = customBvid || this._getBvId();
        console.log('获取到的BVID:', bvid);
        if (!bvid) {
            console.error('无法获取BVID');
            throw new Error('无法获取BVID');
        }

        const partsList = await this._getAllPartsList(bvid);
        console.log('获取到的视频分P列表:', partsList);
        if (!partsList || partsList.length === 0) {
            console.error("❌ Could not retrieve any video parts. Please check the BVID or network.");
            throw new Error("无法获取视频分P信息");
        }

        // 在Chrome插件环境中，直接下载第一个分P的字幕
        console.log('在插件环境中，自动选择第一个分P进行下载');
        const selectedPart = partsList[0];
        console.log('选择的视频分P:', selectedPart);
        
        await this._fetchAndDownloadSubtitleForPart(selectedPart, lang);
    }
}

// 全局变量存储当前视频的分P信息
let currentPartsList = [];
let currentBvid = null;

// 下载字幕功能
async function downloadSubtitle() {
    const videoInput = document.getElementById('videoInput');
    const multiModeToggle = document.getElementById('multiModeToggle');
    const input = videoInput.value.trim();
    
    if (!input) {
        showStatus('请输入B站链接或BV号', 'error');
        return;
    }
    
    // 提取BV号
    let bvid = extractBVID(input);
    if (!bvid) {
        showStatus('无法识别BV号，请检查输入格式', 'error');
        return;
    }
    
    showStatus('正在处理，请稍候...', 'info');
    
    try {
        // 创建新的BiliWbiApiHelper实例
        const apiHelper = new BiliWbiApiHelper();
        
        // 获取视频分P列表
        const partsList = await apiHelper._getAllPartsList(bvid);
        if (!partsList || partsList.length === 0) {
            throw new Error("无法获取视频分P信息");
        }
        
        // 存储当前视频信息
        currentPartsList = partsList;
        currentBvid = bvid;
        
        if (multiModeToggle.checked) {
            // 多P模式：显示分P列表
            showPartsList(partsList);
            showStatus(`找到 ${partsList.length} 个分P，请选择要下载的分P`, 'info');
        } else {
            // 单P模式：直接下载第一个分P
            await apiHelper._fetchAndDownloadSubtitleForPart(partsList[0], 'ai-zh');
            showStatus('字幕下载已启动！', 'success');
        }
        
    } catch (error) {
        console.error('下载失败:', error);
        showStatus('下载失败: ' + error.message, 'error');
    }
}

// 显示分P列表
function showPartsList(partsList) {
    const partsContainer = document.getElementById('partsContainer');
    const partsListDiv = document.getElementById('partsList');
    
    partsContainer.innerHTML = '';
    
    partsList.forEach((part, index) => {
        const partItem = document.createElement('div');
        partItem.className = 'part-item';
        partItem.innerHTML = `
            <span class="part-title">${part.title}</span>
            <button class="part-download-btn" onclick="downloadPart(${index})">下载字幕</button>
        `;
        partsContainer.appendChild(partItem);
    });
    
    partsListDiv.style.display = 'block';
}

// 下载指定分P的字幕
async function downloadPart(partIndex) {
    if (!currentPartsList || !currentPartsList[partIndex]) {
        showStatus('分P信息无效', 'error');
        return;
    }
    
    const part = currentPartsList[partIndex];
    const button = event.target;
    
    // 禁用按钮防止重复点击
    button.disabled = true;
    button.textContent = '下载中...';
    
    try {
        const apiHelper = new BiliWbiApiHelper();
        await apiHelper._fetchAndDownloadSubtitleForPart(part, 'ai-zh');
        
        button.textContent = '下载完成';
        button.style.background = 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
        showStatus(`${part.title} 字幕下载已启动！`, 'success');
        
    } catch (error) {
        console.error('下载失败:', error);
        button.textContent = '下载失败';
        button.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        showStatus(`下载失败: ${error.message}`, 'error');
        
        // 3秒后恢复按钮状态
        setTimeout(() => {
            button.disabled = false;
            button.textContent = '下载字幕';
            button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        }, 3000);
    }
}

// 提取BV号
function extractBVID(input) {
    // 匹配BV号格式
    const bvMatch = input.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
    if (bvMatch) {
        return bvMatch[0];
    }
    
    // 匹配B站链接中的BV号
    const urlMatch = input.match(/bilibili\.com\/video\/(BV[1-9A-HJ-NP-Za-km-z]{10})/i);
    if (urlMatch) {
        return urlMatch[1];
    }
    
    return null;
}

// 显示状态信息
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
}

// 关闭页面
function closePage() {
    window.close();
}

// 访问B站
function visitBilibili() {
    window.open('https://www.bilibili.com', '_blank');
}

// 页面加载完成后初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 回车键触发下载
    document.getElementById('videoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            downloadSubtitle();
        }
    });
    
    // 为按钮添加事件监听器
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
    document.getElementById('closeBtn').addEventListener('click', closePage);
    document.getElementById('visitBtn').addEventListener('click', visitBilibili);
    
    // 多P模式切换事件
    document.getElementById('multiModeToggle').addEventListener('change', function() {
        const partsList = document.getElementById('partsList');
        if (!this.checked) {
            // 切换到单P模式时隐藏分P列表
            partsList.style.display = 'none';
            showStatus('已切换到单P模式', 'info');
        } else {
            showStatus('已切换到多P模式', 'info');
        }
    });
}); 