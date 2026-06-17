// 控制面板页面逻辑：按 BV 号 / 链接直接下载字幕。
// 核心逻辑在 bilibili-subtitle-helper.js（本文件之前由 blank-page.html 加载）。

let currentPartsList = [];
let currentBvid = null;

// 提取 BV 号（支持纯 BV 号或 B 站链接）
function extractBVID(input) {
    const bvMatch = input.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
    if (bvMatch) return bvMatch[0];
    const urlMatch = input.match(/bilibili\.com\/video\/(BV[1-9A-HJ-NP-Za-km-z]{10})/i);
    if (urlMatch) return urlMatch[1];
    return null;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
}

async function downloadSubtitle() {
    const input = document.getElementById('videoInput').value.trim();
    const multiModeToggle = document.getElementById('multiModeToggle');

    if (!input) { showStatus('请输入 B 站链接或 BV 号', 'error'); return; }

    const bvid = extractBVID(input);
    if (!bvid) { showStatus('无法识别 BV 号，请检查输入格式', 'error'); return; }

    showStatus('正在处理，请稍候...', 'info');

    try {
        const apiHelper = new BiliWbiApiHelper();
        const partsList = await apiHelper._getAllPartsList(bvid);
        if (!partsList || partsList.length === 0) throw new Error('无法获取视频分P信息');

        currentPartsList = partsList;
        currentBvid = bvid;

        if (multiModeToggle.checked) {
            showPartsList(partsList);
            showStatus(`找到 ${partsList.length} 个分P，请选择要下载的分P`, 'info');
        } else {
            await apiHelper._fetchAndDownloadSubtitleForPart(partsList[0], 'ai-zh');
            showStatus('字幕下载已启动！', 'success');
        }
    } catch (error) {
        console.error('下载失败:', error);
        showStatus('下载失败：' + error.message, 'error');
    }
}

function showPartsList(partsList) {
    const partsContainer = document.getElementById('partsContainer');
    const partsListDiv = document.getElementById('partsList');
    partsContainer.innerHTML = '';

    partsList.forEach((part, index) => {
        const partItem = document.createElement('div');
        partItem.className = 'part-item';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'part-title';
        titleSpan.textContent = part.title;

        const btn = document.createElement('button');
        btn.className = 'part-download-btn';
        btn.textContent = '下载字幕';
        btn.addEventListener('click', () => downloadPart(index, btn));

        partItem.appendChild(titleSpan);
        partItem.appendChild(btn);
        partsContainer.appendChild(partItem);
    });

    partsListDiv.style.display = 'block';
}

async function downloadPart(partIndex, button) {
    const part = currentPartsList && currentPartsList[partIndex];
    if (!part) { showStatus('分P信息无效', 'error'); return; }

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
        showStatus(`下载失败：${error.message}`, 'error');
        setTimeout(() => {
            button.disabled = false;
            button.textContent = '下载字幕';
            button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('videoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') downloadSubtitle();
    });
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
    document.getElementById('closeBtn').addEventListener('click', () => window.close());
    document.getElementById('visitBtn').addEventListener('click', () => window.open('https://www.bilibili.com', '_blank'));

    document.getElementById('multiModeToggle').addEventListener('change', function() {
        const partsList = document.getElementById('partsList');
        if (!this.checked) {
            partsList.style.display = 'none';
            showStatus('已切换到单P模式', 'info');
        } else {
            showStatus('已切换到多P模式', 'info');
        }
    });
});
