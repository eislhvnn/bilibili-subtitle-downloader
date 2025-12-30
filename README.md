# B站字幕下载Chrome插件

这是一个专为B站视频设计的Chrome插件，可以一键下载视频字幕文件。
([https://www.bilibili.com/video/你的视频BV号](https://www.bilibili.com/video/BV1K9vhBHEkb/?spm_id_from=333.1387.homepage.video_card.click))

## 文件结构

```
插件/
├── manifest.json                    # 插件配置文件
├── popup.html                      # 弹出窗口HTML
├── popup.css                       # 弹出窗口样式
├── popup.js                        # 弹出窗口脚本
├── background.js                    # 后台服务脚本
├── content.js                      # 内容脚本
├── bilibili-subtitle-helper.js     # B站字幕下载核心功能
├── icons/                          # 图标文件夹
└── README.md                       # 说明文档
```

## 主要文件说明

### manifest.json
- 插件的配置文件，定义了插件的基本信息、权限和功能
- 使用Manifest V3格式
- 包含弹出窗口、后台脚本和内容脚本的配置
- 添加了B站域名访问权限

### popup.html/popup.css/popup.js
- 插件的弹出窗口界面
- 当用户点击插件图标时显示
- 包含字幕下载功能的开关和下载按钮
- 提供用户友好的交互界面

### background.js
- 后台服务脚本，在插件后台运行
- 处理插件的核心逻辑
- 监听各种事件和消息
- 管理插件设置和状态

### content.js
- 内容脚本，会被注入到B站视频页面中
- 检测B站视频页面并加载字幕下载功能
- 与popup通信，响应用户操作

### bilibili-subtitle-helper.js
- B站字幕下载的核心功能模块
- 包含完整的WBI签名算法
- 支持多P视频和合集视频的字幕下载
- 自动转换为SRT格式

## 安装方法

1. 打开Chrome浏览器
2. 进入扩展程序页面：`chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择此文件夹

## 使用说明

1. **启用功能**：点击插件图标，在弹出窗口中打开"启用字幕下载"开关
2. **下载字幕**：在B站视频页面点击"下载字幕"按钮
3. **选择分P**：在弹出的提示中选择要下载字幕的视频分P
4. **自动下载**：插件会自动下载并转换为SRT格式的字幕文件

## 注意事项

- 需要在`icons`文件夹中添加图标文件：
  - icon16.png (16x16像素)
  - icon48.png (48x48像素)
  - icon128.png (128x128像素)
- 插件仅在B站视频页面（bilibili.com/video/）工作
- 需要确保视频有可用的字幕
- 在开发过程中，修改代码后需要在扩展程序页面点击刷新按钮

## 开发建议

- 使用Chrome开发者工具调试插件
- 在扩展程序页面查看插件的错误信息
- 使用`console.log`进行调试

- 注意Manifest V3的API变化 
