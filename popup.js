// 弹出窗口的JavaScript逻辑
document.addEventListener('DOMContentLoaded', function() {
    const subtitleToggle = document.getElementById('subtitleToggle');
    const downloadButton = document.getElementById('downloadButton');
    const openBlankPageButton = document.getElementById('openBlankPageButton');
    const multiModeToggle = document.getElementById('multiModeToggle');
    const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
    const statusDiv = document.getElementById('status');
    const progressDiv = document.getElementById('progress');

    // 加载保存的设置
    chrome.storage.local.get(['subtitleEnabled', 'multiModeEnabled', 'exportFormat'], function(result) {
        if (result.subtitleEnabled) {
            subtitleToggle.checked = true;
            downloadButton.disabled = false;
        }
        if (result.multiModeEnabled) {
            multiModeToggle.checked = true;
        }
        if (result.exportFormat) {
            const saved = document.querySelector(`input[name="exportFormat"][value="${result.exportFormat}"]`);
            if (saved) saved.checked = true;
        }
    });

    // 导出格式切换事件
    formatRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (!this.checked) return;
            chrome.storage.local.set({ exportFormat: this.value });
            statusDiv.textContent = this.value === 'txt' ? '导出格式：TXT 纯文本' : '导出格式：SRT 字幕';
        });
    });
    
    // 切换开关事件
    subtitleToggle.addEventListener('change', function() {
        const isEnabled = subtitleToggle.checked;
        downloadButton.disabled = !isEnabled;
        
        // 保存设置
        chrome.storage.local.set({ subtitleEnabled: isEnabled });
        
        if (isEnabled) {
            statusDiv.textContent = '字幕下载功能已启用';
        } else {
            statusDiv.textContent = '字幕下载功能已禁用';
        }
    });
    
    // 多P模式切换事件
    multiModeToggle.addEventListener('change', function() {
        const isMultiMode = multiModeToggle.checked;
        
        // 保存设置
        chrome.storage.local.set({ multiModeEnabled: isMultiMode });
        
        if (isMultiMode) {
            statusDiv.textContent = '多P模式已启用';
        } else {
            statusDiv.textContent = '单P模式已启用';
        }
    });
    
    // 下载按钮点击事件
    downloadButton.addEventListener('click', function() {
        statusDiv.textContent = '正在检查当前页面...';
        progressDiv.textContent = '';

        // 检查当前标签页是否是B站视频页面
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;

            if (!url.includes('bilibili.com/video/')) {
                statusDiv.textContent = '错误：当前页面不是B站视频页面';
                return;
            }

            const selectedFormat = document.querySelector('input[name="exportFormat"]:checked')?.value || 'srt';
            // 向content script发送消息，启动字幕下载
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'downloadSubtitle',
                multiMode: multiModeToggle.checked,
                format: selectedFormat
            }, function(response) {
                if (chrome.runtime.lastError) {
                    statusDiv.textContent = '错误：无法与页面通信，请刷新页面后重试';
                    return;
                }

                if (response && response.success) {
                    statusDiv.textContent = '字幕下载功能已启动，请查看页面提示';
                } else {
                    statusDiv.textContent = '启动字幕下载失败: ' + (response ? response.error : '未知错误');
                }
            });
        });
    });

    // 打开控制面板按钮点击事件
    openBlankPageButton.addEventListener('click', function() {
        statusDiv.textContent = '正在打开控制面板...';
        chrome.tabs.create({ url: 'blank-page.html' }, function(tab) {
            statusDiv.textContent = chrome.runtime.lastError ? '打开控制面板失败' : '控制面板已打开';
        });
    });
    
    // 页面加载完成后的初始化
    statusDiv.textContent = '插件已加载完成，请在B站视频页面使用';
}); 