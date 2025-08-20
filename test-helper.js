// 简化的B站字幕下载助手测试版本
class BiliWbiApiHelper {
    constructor() {
        console.log('BiliWbiApiHelper构造函数被调用');
        this.testMode = true;
    }

    _getBvId() {
        console.log('_getBvId方法被调用');
        const match = window.location.pathname.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/i);
        if (match) {
            console.log('找到BVID:', match[0]);
            return match[0];
        }
        console.log('未找到BVID');
        return null;
    }

    async selectAndDownloadSubtitle(lang = 'ai-zh') {
        console.log('selectAndDownloadSubtitle方法被调用');
        const bvid = this._getBvId();
        if (!bvid) {
            alert('无法获取BVID');
            return;
        }
        alert('测试成功！BVID: ' + bvid);
    }
}

// 导出类
console.log('开始导出BiliWbiApiHelper类...');

// 确保类在全局作用域中可用
window.BiliWbiApiHelper = BiliWbiApiHelper;
console.log('BiliWbiApiHelper已添加到window对象');

// 也尝试在模块环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiliWbiApiHelper;
    console.log('BiliWbiApiHelper已通过module.exports导出');
}

console.log('BiliWbiApiHelper类导出完成'); 