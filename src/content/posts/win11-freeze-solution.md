---
title: 临时解决 Windows 11 24H2/25H2 下 Chromium 应用程序冻屏问题
published: 2025-11-25
updated: 2025-11-25
description: 'Win11 24H2更新后Chrome、Edge、VSCode等Chromium应用频繁冻屏？屏幕出现画面残留、部分区域卡死？实测通过注册表禁用MPO或调整OverlayMinFPS参数可有效解决这一由微软Rust重写图形组件引发的兼容性问题。'
image: '../_assets/images/win11-freeze-solution/cover_pixiv_123773799.webp'
tags: [Windows11,Bug,Chromium,MPO]
category: '杂谈'
draft: false
---
cover: `pixiv@Z-wumi:123773799`
# Win11 24H2 冻屏问题
> 屏幕一半卡在上个页面，另一半正常滚动？巧了，我也是。

前一段时间更新到 Win11 24H2 后，我的 Chromium 系软件开始抽风：**屏幕会随机出现画面残留**，滚动时部分内容更新，但总有一块区域固执地保持静止。

***我没有留截图***

沟槽的给我vscode卡成狗了，忍受了将近两个月后，我实在是受不了巨硬的狗屎Bug了，于是决定研究（百度）一下。

## 万恶之源：生锈的巨硬
微软在 24H2 中用 Rust 重写了图形设备接口（GDI）和 DWriteCore，虽然长期来看是好事，但短期兼容性问题让 Chromium 应用遭了殃。

## 解决方案
### 方案一：注册表禁用 MPO
这是目前最有效的方案，虽然 MPO 本意是为了提升性能...

在管理员权限的终端中执行第一条命令：
```powershell
# 设置 OverlayTestMode=5 可禁用或调整 MPO 的某些功能，恢复正常。
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Dwm" /v OverlayTestMode /t REG_DWORD /d 5 /f

# 如果你想恢复 MPO 功能，只需删除该注册表项，执行下面的命令
reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Dwm" /v OverlayTestMode /f
```
重启后，问题应该就解决了。

### 方案二：调整 OverlayMinFPS 参数（在用）
如果你想要留着MPO，试试这个来自用户社区的偏方。同样是管理员权限的终端中执行：
```powershell
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Dwm" /v OverlayMinFPS /t REG_DWORD /d 0 /f
```
这样就可以在不完全禁用MPO的情况下解决冻屏问题。

### 方案三：关闭浏览器硬件加速（未测试）
这是网上查到的，不清楚有有没有用。以下是 Edge 的设置：

1. 打开 edge://settings/system/manageSystem
2. 找到 **"在可用时使用图形加速"**，**关闭它**
3. 重启浏览器

**记得对所有基于 Chromium 的软件都执行相同操作**。

## 总结
问题的原因一般是MPO，通常情况下禁用MPO即可解决问题，但如果你想要保留MPO，可以尝试调整 OverlayMinFPS 参数。

这个Bug存在的时间也不算短了，会严重影响使用体验，微软现在还没修，真是效率感人。
