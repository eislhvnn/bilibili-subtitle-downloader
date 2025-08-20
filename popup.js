// 弹出窗口的JavaScript逻辑
document.addEventListener('DOMContentLoaded', function() {
    const subtitleToggle = document.getElementById('subtitleToggle');
    const downloadButton = document.getElementById('downloadButton');
    const openBlankPageButton = document.getElementById('openBlankPageButton');
    const multiModeToggle = document.getElementById('multiModeToggle');
    const statusDiv = document.getElementById('status');
    const progressDiv = document.getElementById('progress');
    
    // 加载保存的设置
    chrome.storage.local.get(['subtitleEnabled', 'multiModeEnabled'], function(result) {
        if (result.subtitleEnabled) {
            subtitleToggle.checked = true;
            downloadButton.disabled = false;
        }
        if (result.multiModeEnabled) {
            multiModeToggle.checked = true;
        }
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
        console.log('下载按钮被点击');
        statusDiv.textContent = '正在检查当前页面...';
        progressDiv.textContent = '';
        
        // 检查当前标签页是否是B站视频页面
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log('当前标签页URL:', url);
            
            if (!url.includes('bilibili.com/video/')) {
                console.error('当前页面不是B站视频页面');
                statusDiv.textContent = '错误：当前页面不是B站视频页面';
                return;
            }
            
            console.log('向content script发送下载字幕消息');
            // 向content script发送消息，启动字幕下载
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'downloadSubtitle',
                multiMode: multiModeToggle.checked
            }, function(response) {
                console.log('收到content script响应:', response);
                console.log('chrome.runtime.lastError:', chrome.runtime.lastError);
                
                if (chrome.runtime.lastError) {
                    console.error('与页面通信失败:', chrome.runtime.lastError);
                    statusDiv.textContent = '错误：无法与页面通信，请刷新页面后重试';
                    return;
                }
                
                if (response && response.success) {
                    console.log('字幕下载启动成功');
                    statusDiv.textContent = '字幕下载功能已启动，请查看页面提示';
                } else {
                    console.error('字幕下载启动失败:', response);
                    statusDiv.textContent = '启动字幕下载失败: ' + (response ? response.error : '未知错误');
                }
            });
        });
    });
    
    // 打开空白页面按钮点击事件
    openBlankPageButton.addEventListener('click', function() {
        console.log('打开空白页面按钮被点击');
        statusDiv.textContent = '正在打开空白页面...';
        
        // 创建新标签页打开空白页面
        chrome.tabs.create({
            url: 'blank-page.html'
        }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('打开空白页面失败:', chrome.runtime.lastError);
                statusDiv.textContent = '打开空白页面失败';
            } else {
                console.log('空白页面已打开，标签页ID:', tab.id);
                statusDiv.textContent = '空白页面已打开';
            }
        });
    });
    
    // 页面加载完成后的初始化
    statusDiv.textContent = '插件已加载完成，请在B站视频页面使用';
}); 