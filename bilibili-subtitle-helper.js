/**
 * Bilibili WBI & Subtitle Helper
 *
 * 字幕下载核心模块：WBI 签名（含内置 MD5）、视频分P/合集信息获取、
 * 字幕拉取与 SRT / TXT 转换、触发浏览器下载。
 *
 * 唯一实现来源，同时被内容脚本(content.js)与控制面板(blank-page.js)复用。
 * 方法均不直接弹窗，失败时抛出异常，由调用方负责界面提示。
 */
class BiliWbiApiHelper {
    constructor() {
        // --- 内置 MD5 实现 ---
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

        // WBI mixin key 重排表
        this.mixinKeyEncTab = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
            33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
            61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
            36, 20, 34, 44, 52
        ];

        // dm 指纹参数：默认值保证基本可用；运行时若后台从播放器请求中捕获到更新，会覆盖这些默认值
        this.fixedDmParams = {
            'isGaiaAvoided': 'false',
            'web_location': '1315873',
            'dm_img_list': '[]',
            'dm_img_str': 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
            'dm_cover_img_str': 'QU5HTEUgKEludGVsLCBJbnRlbChSKSBVSEQgR3JhcGhpY3MgNjIwICgweDAwMDA1OTE3KSBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKUdvb2dsZSBJbmMuIChJbnRlbC',
            'dm_img_inter': '{"ds":[],"wh":[2959,5003,33],"of":[264,528,264]}'
        };

        // 导出格式：'srt'（带时间轴）或 'txt'（纯文本），由调用方按需设置
        this.exportFormat = 'srt';

        this._loadDynamicDmParams();
    }

    // 从 storage 读取后台捕获的动态指纹参数，并监听后续更新
    _loadDynamicDmParams() {
        try {
            if (!(typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)) return;
            chrome.storage.local.get(['dynamicDmParams'], (res) => {
                if (res && res.dynamicDmParams) this._updateFixedDmParams(res.dynamicDmParams);
            });
            if (chrome.storage.onChanged) {
                chrome.storage.onChanged.addListener((changes, area) => {
                    if (area === 'local' && changes.dynamicDmParams) {
                        this._updateFixedDmParams(changes.dynamicDmParams.newValue);
                    }
                });
            }
        } catch (e) {
            // storage 不可用时静默忽略，沿用默认指纹
        }
    }

    _updateFixedDmParams(newParams) {
        if (!newParams || typeof newParams !== 'object') return;
        const keys = ['isGaiaAvoided', 'web_location', 'dm_img_list', 'dm_img_str', 'dm_cover_img_str', 'dm_img_inter'];
        keys.forEach(k => {
            if (newParams[k] != null) this.fixedDmParams[k] = newParams[k];
        });
    }

    _getBvId() {
        const match = window.location.pathname.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
        if (match) return match[0];
        const seriesMatch = window.location.pathname.match(/\/series\/(BV[1-9A-HJ-NP-Za-km-z]{10})/i);
        if (seriesMatch) return seriesMatch[1];
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
        const w_rid = this.md5(query + mixinKey);
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

    _convertToTxt(subtitleJson) {
        if (!subtitleJson.body || subtitleJson.body.length === 0) return '';
        // 纯文本：每条字幕一行，仅保留文字内容，不含序号与时间轴
        return subtitleJson.body
            .map(line => (line.content || '').trim())
            .filter(text => text.length > 0)
            .join('\n');
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
    }

    async _getMixinKey() {
        const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
            cache: 'no-store',
            headers: { 'User-Agent': navigator.userAgent, 'Referer': 'https://www.bilibili.com/' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json_data = await response.json();
        if (json_data.code !== 0) throw new Error(`获取签名密钥失败：[${json_data.code}] ${json_data.message}`);
        const img_url = json_data.data.wbi_img.img_url;
        const sub_url = json_data.data.wbi_img.sub_url;
        const original_key = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')) +
                             sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
        let shuffled_key = '';
        for (const i of this.mixinKeyEncTab) shuffled_key += original_key[i];
        return shuffled_key.slice(0, 32);
    }

    async _getAllPartsList(bvid) {
        const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': navigator.userAgent, 'Referer': `https://www.bilibili.com/video/${bvid}/` },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json_data = await response.json();
        if (json_data.code !== 0) throw new Error(`获取视频信息失败：${json_data.message}`);

        const videoData = json_data.data;
        const results = [];
        const processedCids = new Set();
        const mainBvid = videoData.bvid;
        const mainAid = videoData.aid;

        // 分P
        if (videoData.pages && videoData.pages.length > 0) {
            videoData.pages.forEach(page => {
                if (page.cid && !processedCids.has(page.cid)) {
                    results.push({ title: page.part || `P${page.page}`, bvid: mainBvid, cid: page.cid, aid: mainAid, page: page.page });
                    processedCids.add(page.cid);
                }
            });
        }

        // 合集 / 系列
        if (videoData.ugc_season && videoData.ugc_season.sections) {
            videoData.ugc_season.sections.forEach(section => {
                section.episodes.forEach(episode => {
                    if (episode.cid && !processedCids.has(episode.cid)) {
                        results.push({ title: episode.title, bvid: episode.bvid, cid: episode.cid, aid: episode.aid });
                        processedCids.add(episode.cid);
                    }
                });
            });
        }

        // 兜底：单视频
        if (results.length === 0 && videoData.cid && !processedCids.has(videoData.cid)) {
            results.push({ title: videoData.title, bvid: mainBvid, cid: videoData.cid, aid: mainAid });
        }

        return results;
    }

    // 获取某分P的可用字幕轨列表（已做 WBI 签名）。返回数组，每项含 lan / lan_doc / subtitle_url。
    async _getSubtitleTracks(partInfo) {
        const mixinKey = await this._getMixinKey();
        if (!mixinKey) throw new Error('无法获取 WBI 签名密钥');

        const baseParams = { aid: partInfo.aid, cid: partInfo.cid, ...this.fixedDmParams };
        const signature = this._signRequest(baseParams, mixinKey);
        const finalParams = { ...baseParams, ...signature };
        const finalUrl = `https://api.bilibili.com/x/player/wbi/v2?${new URLSearchParams(finalParams)}`;

        const response = await fetch(finalUrl, {
            credentials: 'include',
            headers: { 'Referer': `https://www.bilibili.com/video/${partInfo.bvid}/`, 'User-Agent': navigator.userAgent }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const videoData = await response.json();
        if (videoData.code !== 0) throw new Error(`获取播放信息失败：[${videoData.code}] ${videoData.message}`);

        return videoData.data.subtitle?.subtitles || [];
    }

    // 下载指定字幕轨，按 exportFormat 输出 SRT / TXT
    async _downloadTrack(track, partInfo) {
        const subResponse = await fetch(`https:${track.subtitle_url}`, {
            headers: { 'User-Agent': navigator.userAgent, 'Referer': `https://www.bilibili.com/video/${partInfo.bvid}/` }
        });
        if (!subResponse.ok) throw new Error(`字幕拉取失败！status: ${subResponse.status}`);
        const subtitleJson = await subResponse.json();

        const safeTitle = (partInfo.title || partInfo.bvid).replace(/[\/\\?%*:|"<>]/g, '-');
        const langTag = track.lan ? `_${track.lan}` : '';
        let outputContent, mimeType, ext;
        if (this.exportFormat === 'txt') {
            outputContent = this._convertToTxt(subtitleJson);
            mimeType = 'text/plain';
            ext = 'txt';
        } else {
            outputContent = this._convertToSrt(subtitleJson);
            mimeType = 'application/x-subrip';
            ext = 'srt';
        }
        this._triggerDownload(outputContent, `${partInfo.bvid}_${safeTitle}${langTag}.${ext}`, mimeType);
    }

    // 便捷方法：按语言自动挑选并下载（无界面，供程序化/控制面板调用）
    async _fetchAndDownloadSubtitleForPart(partInfo, lang = 'ai-zh') {
        const tracks = await this._getSubtitleTracks(partInfo);
        if (!tracks || tracks.length === 0) throw new Error('该视频没有可用字幕');
        const target = tracks.find(t => t.lan === lang) || tracks[0];
        await this._downloadTrack(target, partInfo);
    }

    // 根据 URL 的 ?p= 与当前 BV 号，定位当前正在播放的分P
    _getCurrentPart(partsList) {
        const currentBvid = this._getBvId();
        const p = parseInt(new URLSearchParams(window.location.search).get('p') || '1', 10);
        const sameBvid = partsList.filter(part => part.bvid === currentBvid);
        if (sameBvid.length > 1) return sameBvid.find(part => part.page === p) || sameBvid[0];
        if (sameBvid.length === 1) return sameBvid[0];
        return partsList[0];
    }

    // 下载当前正在播放的分P（单P模式）。customBvid 供控制面板按 BV 号直接下载。
    async selectAndDownloadSubtitle(lang = 'ai-zh', customBvid = null) {
        const bvid = customBvid || this._getBvId();
        if (!bvid) throw new Error('无法获取 BV 号');

        const partsList = await this._getAllPartsList(bvid);
        if (!partsList || partsList.length === 0) throw new Error('无法获取视频分P信息');

        const target = customBvid ? partsList[0] : this._getCurrentPart(partsList);
        await this._fetchAndDownloadSubtitleForPart(target, lang);
    }
}

// 作为全局类暴露，供内容脚本与扩展页面共用
if (typeof window !== 'undefined') window.BiliWbiApiHelper = BiliWbiApiHelper;
if (typeof module !== 'undefined' && module.exports) module.exports = BiliWbiApiHelper;
