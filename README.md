# SEC//LAB · 网络安全学习站

一个纯静态的网络安全学习导航站：学习路线 + 58 个安全工具的官方下载 + 逐个工具的配套安装教程 + 命令速查 + 靶场清单 + 合规提示。

**不需要 PHP / 数据库 / Node，双击 `index.html` 就能打开。**

---

## 一、用 PhpStorm 打开（3 步）

1. 打开 PhpStorm → 菜单 **File → Open**（不是 New Project）→ 选中文件夹
   `D:\ai挖洞\workspace\seclab-web` → 点 **OK** → 弹窗点 **Trust Project**。
2. 等右下角索引进度条跑完（第一次约 10 秒）。
3. 左侧项目树里右键 **index.html** → **Open In → Browser → Chrome**。
   或者点编辑器右上角的浏览器图标（悬浮时显示浏览器名称）。

> 如果 PhpStorm 提示配置 PHP 解释器：本站是纯静态页面，**直接忽略/取消**即可，不需要配 PHP。
> 想用内置服务器预览：**Tools → Web Browsers and Preview**，或在终端里执行下面的命令。

命令行预览（任选一种）：

```powershell
# 方式一：直接打开文件（最简单）
start .\index.html

# 方式二：起一个本地服务器（更接近真实环境，推荐）
python -m http.server 8099 --bind 127.0.0.1
# 然后浏览器访问 http://127.0.0.1:8099
```

---

## 二、文件结构

```
seclab-web/
├─ index.html                 页面骨架（导航 / 各区块 / 模态框）
├─ assets/
│  ├─ css/style.css           全部样式（深色科技风、霓虹青紫、网格背景）
│  └─ js/
│     ├─ data-core.js         分类、4 条安装主线、命令速查、靶场清单
│     ├─ data-tools-1.js      工具数据：环境基础 / 信息收集 / Web 渗透（30 个）
│     ├─ data-tools-2.js      工具数据：密码破解 / 内网 / 逆向 / 取证（28 个）
│     └─ app.js               渲染、搜索筛选、进度环、模态框、复制、粒子背景
├─ 一键预览.bat               双击直接用默认浏览器打开
├─ 启动本地服务器.bat         双击起 http://127.0.0.1:8099
└─ README.md                  本文件
```

⚠️ **JS 的加载顺序不能改**：`data-core.js` 先定义 `TOOLS = []`，后面两个文件往里 `push`，最后 `app.js` 渲染。顺序错了页面就是空白卡片。

---

## 三、怎么增删内容

### 1. 加一个工具

打开 `assets/js/data-tools-1.js`（或 `-2.js`），在 `TOOLS.push(` 里照抄一段改：

```js
{
  id: "mytool",                 // 唯一 id，用于保存"已安装"状态
  name: "工具名", cat: "web",    // cat 取值见 data-core.js 的 CATS
  icon: "MT", ver: "1.0",        // icon 是图标里显示的 1-3 个字符
  desc: "一句话说明它干什么。",
  tags: ["标签1", "标签2"], plat: "Win / Linux", lvl: "入门",
  official: "https://官网",
  dl: "https://官方下载页",
  steps: [
    { t: "第一步的标题", d: "具体怎么做，写到能照着操作。",
      cmd: "需要复制的命令（可省略）",
      hint: "可选提示 / 常见坑" },
    { t: "验证", d: "怎么确认装好了。", cmd: "命令" }
  ],
  pit: "这个工具最容易踩的坑。"
}
```

保存 → 刷新页面即可，不需要重新构建。

### 2. 加一条安装主线

在 `data-core.js` 里加 `GUIDES.xxx = { title, lead, steps: [...] }`，同时在 `index.html` 的 `#guideTabs` 里加一个按钮 `<button class="gt" data-g="xxx">⑤ 标题</button>`。

### 3. 换配色

`style.css` 开头 `:root` 里改这几个变量就够：

| 变量 | 作用 |
|---|---|
| `--cyan` | 主色（标题渐变、按钮、边框高亮） |
| `--violet` | 辅助色（渐变第二段） |
| `--bg` / `--bg-2` | 背景底色 |
| `--text` / `--dim` | 正文 / 次要文字 |

---

## 四、已实现的功能

- 58 个工具卡片，8 个分类，实时搜索（支持工具名 / 用途 / 平台 / 标签，快捷键 `/`）
- 点卡片弹出**该工具的完整安装教程**：编号步骤 + 可一键复制的命令 + 常见坑 + 官方下载链接
- 「标记已安装」写进 `localStorage`，右上角环形进度 + 工具库进度条同步；「重置」清空
- 4 条按键级安装主线：虚拟机 + Kali、Burp 抓 HTTPS、Python 环境、本地 DVWA
- 10 组命令速查（nmap / curl / sqlmap / ffuf / hydra / hashcat / msf / Linux / Windows / 隧道）
- 9 个靶场与练习平台，带难度标签
- 粒子网络背景、扫描线、滚动出现、数字滚动、终端打字机
- 响应式（手机宽度自动收成汉堡菜单），支持 `prefers-reduced-motion`

---

## 五、关于下载链接

所有 `dl` 字段都指向**官方站点或 GitHub Releases 原始地址**，没有任何网盘、破解版、绿色版。

站点里刻意写明了这一点，因为"集成工具包/破解版"是挖洞圈最典型的木马投毒渠道——尤其 VMware、Burp、Xray、蚁剑 这几个。

链接会过期（工具版本更新、仓库迁移），建议每季度核对一次；核对方式：打开 `data-core.js` / `data-tools-*.js`，搜 `dl:`，逐个点开看是否 404。

---

## 六、合规提醒

站内所有示例命令的目标都是 `127.0.0.1` 或 `192.168.100.x`（本地靶场网段）。

对**未授权**系统执行扫描、爆破、上传 webshell，属于《刑法》285/286 条范畴，后果是刑事责任，不是"删站了事"。SRC 平台也只接受范围内、按规则测试的结果。
