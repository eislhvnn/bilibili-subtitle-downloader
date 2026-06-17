// Content Script —— 注入 B 站视频页，负责接收 popup 指令并驱动字幕下载。
// 核心逻辑在 bilibili-subtitle-helper.js（manifest 中先于本文件注入）。

const DEBUG = false;
const log = (...args) => { if (DEBUG) console.log('[字幕助手]', ...args); };

let apiHelper = null;

// 页面内轻量提示（替代 alert）
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        z-index: 1000000; padding: 10px 18px; border-radius: 6px;
        font-size: 14px; color: #fff; max-width: 80%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        background: ${isError ? '#dc3545' : '#28a745'};
        font-family: 'Segoe UI', Tahoma, sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 检测是否为 B 站视频页，是则初始化下载助手
function initSubtitleHelper() {
    if (!(window.location.href.includes('bilibili.com/video/') || window.location.pathname.includes('/video/'))) {
        log('非 B 站视频页，跳过初始化');
        return;
    }
    try {
        apiHelper = new BiliWbiApiHelper();
        log('字幕下载助手已就绪');
    } catch (error) {
        console.error('[字幕助手] 初始化失败:', error);
        showToast('字幕下载助手初始化失败', true);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubtitleHelper);
} else {
    initSubtitleHelper();
}

// 接收来自 popup 的下载指令
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action !== 'downloadSubtitle') return;

    if (!apiHelper) {
        showToast('字幕下载助手未加载，请刷新页面后重试', true);
        sendResponse({ success: false, error: '字幕下载助手未加载' });
        return true;
    }

    // 记录本次导出格式（单P / 多P 下载均会读取该值）
    apiHelper.exportFormat = request.format === 'txt' ? 'txt' : 'srt';
    log('导出格式:', apiHelper.exportFormat, '多P模式:', request.multiMode);

    try {
        if (request.multiMode) {
            showMultiPartSelection();
            sendResponse({ success: true, message: '多P模式已启动' });
        } else {
            runSinglePartDownload()
                .catch(err => {
                    console.error('[字幕助手] 下载失败:', err);
                    showToast('下载失败：' + err.message, true);
                });
            sendResponse({ success: true });
        }
    } catch (error) {
        console.error('[字幕助手] 启动下载失败:', error);
        showToast('启动下载失败：' + error.message, true);
        sendResponse({ success: false, error: error.message });
    }
    return true;
});

// ---------- 单P下载（当前播放分P）----------
async function runSinglePartDownload() {
    const bvid = apiHelper._getBvId();
    if (!bvid) { showToast('无法获取视频 BV 号', true); return; }

    const partsList = await apiHelper._getAllPartsList(bvid);
    if (!partsList || partsList.length === 0) { showToast('无法获取视频分P信息', true); return; }

    const part = apiHelper._getCurrentPart(partsList);
    await downloadForPart(part);
}

// 下载某分P：单字幕轨直接下，多字幕轨弹出语言选择
// 返回 true 表示已立即开始下载；false 表示弹出了语言选择浮层
async function downloadForPart(part) {
    const tracks = await apiHelper._getSubtitleTracks(part);
    if (!tracks || tracks.length === 0) { showToast('该视频没有可用字幕', true); return false; }

    if (tracks.length === 1) {
        await apiHelper._downloadTrack(tracks[0], part);
        showToast('字幕下载已开始');
        return true;
    }
    showTrackChooser(part, tracks);
    return false;
}

// ---------- 字幕语言选择浮层 ----------
let trackChooserOverlay = null;

function showTrackChooser(part, tracks) {
    if (trackChooserOverlay) trackChooserOverlay.remove();

    trackChooserOverlay = document.createElement('div');
    trackChooserOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000001;
        display: flex; justify-content: center; align-items: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        background: white; border-radius: 10px; padding: 20px;
        max-width: 420px; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    const title = document.createElement('h3');
    title.textContent = '🌐 选择字幕语言';
    title.style.cssText = 'margin: 0 0 16px 0; color: #333; font-size: 18px; text-align: center;';
    container.appendChild(title);

    tracks.forEach(track => {
        const btn = document.createElement('button');
        btn.textContent = track.lan_doc || track.lan || '未知语言';
        btn.style.cssText = `
            display: block; width: 100%; margin: 8px 0; padding: 12px;
            background: #f8f9fa; color: #333; border: 1px solid #e9ecef;
            border-radius: 6px; cursor: pointer; font-size: 14px;
        `;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = '下载中...';
            try {
                await apiHelper._downloadTrack(track, part);
                closeTrackChooser();
                showToast('字幕下载已开始');
            } catch (error) {
                console.error('[字幕助手] 下载失败:', error);
                showToast('下载失败：' + error.message, true);
                btn.disabled = false;
                btn.textContent = track.lan_doc || track.lan || '未知语言';
            }
        });
        container.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '取消';
    closeBtn.style.cssText = `
        display: block; width: 100%; margin-top: 12px; padding: 10px;
        background: #6c757d; color: white; border: none; border-radius: 5px;
        cursor: pointer; font-size: 14px;
    `;
    closeBtn.addEventListener('click', closeTrackChooser);
    container.appendChild(closeBtn);

    trackChooserOverlay.appendChild(container);
    document.body.appendChild(trackChooserOverlay);
}

function closeTrackChooser() {
    if (trackChooserOverlay) {
        trackChooserOverlay.remove();
        trackChooserOverlay = null;
    }
}

// ---------- 多P选择浮层 ----------
let currentPartsList = [];
let multiPartOverlay = null;

async function showMultiPartSelection() {
    try {
        const bvid = apiHelper._getBvId();
        if (!bvid) { showToast('无法获取视频 BV 号', true); return; }

        const partsList = await apiHelper._getAllPartsList(bvid);
        if (!partsList || partsList.length === 0) { showToast('无法获取视频分P信息', true); return; }

        currentPartsList = partsList;
        createMultiPartOverlay(partsList);
    } catch (error) {
        console.error('[字幕助手] 获取分P列表失败:', error);
        showToast('获取分P列表失败：' + error.message, true);
    }
}

function createMultiPartOverlay(partsList) {
    if (multiPartOverlay) document.body.removeChild(multiPartOverlay);

    multiPartOverlay = document.createElement('div');
    multiPartOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 999999;
        display: flex; justify-content: center; align-items: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        background: white; border-radius: 10px; padding: 20px;
        max-width: 500px; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    const title = document.createElement('h3');
    title.textContent = `📺 视频分P列表 (共${partsList.length}个分P)`;
    title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 18px; text-align: center;';
    container.appendChild(title);

    const partsContainer = document.createElement('div');
    partsContainer.style.cssText = 'margin-bottom: 20px;';

    partsList.forEach((part, index) => {
        const partItem = document.createElement('div');
        partItem.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px; margin: 8px 0; background: #f8f9fa;
            border-radius: 6px; border: 1px solid #e9ecef;
        `;

        const partTitle = document.createElement('span');
        partTitle.textContent = part.title;
        partTitle.style.cssText = 'flex: 1; font-size: 14px; color: #333; margin-right: 10px;';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载字幕';
        downloadBtn.style.cssText = `
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white; border: none; padding: 8px 16px; border-radius: 4px;
            cursor: pointer; font-size: 12px;
        `;
        downloadBtn.addEventListener('click', () => downloadPart(index, downloadBtn));

        partItem.appendChild(partTitle);
        partItem.appendChild(downloadBtn);
        partsContainer.appendChild(partItem);
    });

    container.appendChild(partsContainer);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        background: #6c757d; color: white; border: none; padding: 10px 20px;
        border-radius: 5px; cursor: pointer; font-size: 14px; width: 100%;
    `;
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(multiPartOverlay);
        multiPartOverlay = null;
    });
    container.appendChild(closeBtn);

    multiPartOverlay.appendChild(container);
    document.body.appendChild(multiPartOverlay);
}

async function downloadPart(partIndex, button) {
    const part = currentPartsList && currentPartsList[partIndex];
    if (!part) { showToast('分P信息无效', true); return; }

    const defaultBg = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    button.disabled = true;
    button.textContent = '下载中...';
    button.style.background = '#6c757d';

    try {
        const done = await downloadForPart(part);
        button.textContent = done ? '下载完成' : '请选择语言';
        button.style.background = done ? '#28a745' : '#6c757d';
    } catch (error) {
        console.error('[字幕助手] 下载失败:', error);
        button.textContent = '下载失败';
        button.style.background = '#dc3545';
        showToast('下载失败：' + error.message, true);
    } finally {
        setTimeout(() => {
            if (button.parentNode) {
                button.disabled = false;
                button.textContent = '下载字幕';
                button.style.background = defaultBg;
            }
        }, 3000);
    }
}
