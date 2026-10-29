/* ============================================================
   SEC//LAB · 工具数据（一）：环境基础 / 信息收集 / Web 渗透
   ============================================================ */

TOOLS.push(
/* ---------------- 环境基础 ---------------- */
{
  id: "vmware", name: "VMware Workstation Pro", cat: "env", icon: "VM", ver: "17.x",
  desc: "桌面虚拟化工具，跑 Kali / Windows 靶机最顺手，快照、克隆、仅主机网络都成熟，个人使用已免费。",
  tags: ["虚拟机", "快照", "靶机"], plat: "Win / Linux", lvl: "入门",
  official: "https://www.vmware.com/", dl: "https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion",
  steps: [
    { t: "注册 Broadcom 账号并下载", d: "VMware 已被 Broadcom 收购，下载在 Broadcom 支持站。注册免费账号 → 找到 VMware Cloud Foundation / Workstation Pro 分区 → 选 Windows 版 exe，勾选同意协议后下载。", hint: "个人使用可在安装后选「用于个人用途」获得免费许可，无需找注册机。" },
    { t: "安装", d: "双击 exe → Next → 接受协议 → 安装路径建议改到 D 盘 → 取消「加入客户体验提升计划」→ 取消「启动时检查更新」→ Install → 完成重启。" },
    { t: "关闭冲突的虚拟化功能", d: "如果开机报「此主机不支持 64 位客户机」，去「启用或关闭 Windows 功能」取消 Hyper-V、虚拟机平台、Windows 虚拟机监控程序平台，然后 bcdedit 关闭 hypervisor 启动项。", cmd: "bcdedit /set hypervisorlaunchtype off", hint: "改完必须重启。「内核隔离 / 内存完整性」也要在 Windows 安全中心关掉。" },
    { t: "配置虚拟网络（做内网靶场必看）", d: "编辑 → 虚拟网络编辑器 → 更改设置（需管理员）→ 选中 VMnet8（NAT）确认已启用；需要靶机和 Kali 互通时，给 VMnet1（仅主机）设一个网段如 192.168.100.0/24。" },
    { t: "验证", d: "新建一台任意 Linux 虚拟机能否正常开机、能否 ping 通外网。能通说明 NAT、DNS、虚拟网卡都正常。" }
  ],
  pit: "最常见坑：装了 WSL2 后 VMware 起不来，因为 Hyper-V 抢了虚拟化。要么关 Hyper-V，要么升级到 VMware 17 以上版本并开启「虚拟化 Windows 虚拟机监控程序」兼容设置。"
},
{
  id: "virtualbox", name: "Oracle VirtualBox", cat: "env", icon: "VB", ver: "7.x",
  desc: "开源免费虚拟机，体积小、能导入 .ova，配合 VulnHub 靶机开箱即用，没有授权顾虑。",
  tags: ["开源", "ova导入", "轻量"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.virtualbox.org/", dl: "https://www.virtualbox.org/wiki/Downloads",
  steps: [
    { t: "下载主程序 + 扩展包", d: "下载页同时取两个文件：平台安装包（Windows hosts）和 Oracle VM VirtualBox Extension Pack（同版本号）。扩展包提供 USB 2.0/3.0、VRDP 支持。" },
    { t: "安装主程序", d: "双击安装 → Next → 自定义路径 → 提示「网络接口将重置连接」点 Yes → Install。安装时会短暂断网，正常现象。" },
    { t: "安装扩展包", d: "双击 .vbox-extpack → 自动调起 VirtualBox → 点「安装」→ 滚到底点「同意」。", cmd: "VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-7.x.vbox-extpack" },
    { t: "导入靶机", d: "管理 → 导入虚拟电脑 → 选 VulnHub 下载的 .ova 文件 → 下一步 → 可勾选「重新初始化所有网卡的 MAC 地址」（同一靶机多次导入时必勾）→ 导入。" },
    { t: "验证", d: "启动靶机，看到登录界面即成功。若报 VT-x 不可用，同样需要进 BIOS 开虚拟化并关 Hyper-V。" }
  ],
  pit: "VirtualBox 和 VMware 不能同时装：两者都会装虚拟网卡驱动，容易导致宿主机断网。选一个用。"
},
{
  id: "kali", name: "Kali Linux", cat: "env", icon: "KL", ver: "2025.x",
  desc: "预装 600+ 安全工具的 Debian 发行版，渗透测试事实标准环境。新手直接下预装虚拟机镜像。",
  tags: ["渗透发行版", "预装工具", "Debian"], plat: "VM / 裸机 / WSL", lvl: "入门",
  official: "https://www.kali.org/", dl: "https://www.kali.org/get-kali/",
  steps: [
    { t: "选对版本", d: "下载页三选一：Installer Images（ISO，自己装系统）、Virtual Machines（预装 VMware/VirtualBox 镜像，新手选这个）、Live Boot（U 盘启动不留痕）。" },
    { t: "国内高速下载", d: "官方源在国外，直接用清华或中科大镜像站，速度差别很大。", cmd: "https://mirrors.tuna.tsinghua.edu.cn/kali-images/current/" },
    { t: "解压导入", d: "7-Zip 解压 .7z 到无中文空格的路径（如 D:\\VMs\\kali）→ VMware 文件 → 打开 → 选 .vmx。", cmd: "7z x kali-linux-2025.x-vmware-amd64.7z -oD:\\VMs\\" },
    { t: "首次配置", d: "默认账号 kali / 密码 kali，进桌面第一件事改密码并更新源。", cmd: "passwd && sudo apt update && sudo apt full-upgrade -y", hint: "预装镜像的默认源是 http.kali.org，国内慢就换成清华源：sudo sed -i 's|http.kali.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list" },
    { t: "装中文输入法与常用补全", d: "可选，但强烈建议：中文字体、输入法、以及 zsh 自动补全，能省大量敲命令的时间。", cmd: "sudo apt install -y fcitx5 fcitx5-chinese-addons zsh-completions" },
    { t: "拍快照", d: "关机 → 右键 → 快照 → 拍摄「clean-base」。之后任何实验搞崩了 30 秒回滚。" }
  ],
  pit: "预装镜像体积大（3-4G 压缩包，解压后 15G+），磁盘要留够。另外 Kali 不是「黑客系统」，它只是把工具装好了，不装工具你也一样能挖洞。"
},
{
  id: "python", name: "Python 3.12", cat: "env", icon: "PY", ver: "3.12.x",
  desc: "安全工具最主流的开发语言，sqlmap、impacket、pwntools 全靠它。装 3.11/3.12，别追最新版。",
  tags: ["脚本", "pip", "venv"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.python.org/", dl: "https://www.python.org/downloads/windows/",
  steps: [
    { t: "下载 Windows installer", d: "官网 Download Windows installer (64-bit)。不要下 Microsoft Store 版本，路径被重定向到 WindowsApps，很多工具找不到解释器。" },
    { t: "安装时勾选 Add to PATH", d: "安装首屏必须勾「Add python.exe to PATH」，再点 Customize installation → 全勾 → 安装路径改成 C:\\Python312（短路径，避免后续编译报错）。" },
    { t: "改国内源", d: "默认源在国内经常超时。写一份 pip.ini 到 %APPDATA%\\pip\\ 永久生效。", cmd: "pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple" },
    { t: "装虚拟环境管理", d: "每个工具一个 venv，避免依赖互踩。", cmd: "py -3.12 -m venv D:\\tools\\venv-demo && D:\\tools\\venv-demo\\Scripts\\activate" },
    { t: "验证", d: "三条命令都出版本号即完成。", cmd: "python --version && pip --version && python -c \"import ssl;print(ssl.OPENSSL_VERSION)\"" }
  ],
  pit: "不要用 3.13/3.14 跑安全工具：pycryptodome、lxml、capstone 等常用库还没有对应 wheel，pip 会尝试本地编译然后失败。"
},
{
  id: "git", name: "Git for Windows", cat: "env", icon: "GT", ver: "2.4x",
  desc: "拉取 GitHub 工具的必备客户端，也顺手解决「clone 下来是 zip 但没法更新」的问题。自带 Git Bash。",
  tags: ["版本控制", "clone", "GitHub"], plat: "Win / Linux", lvl: "入门",
  official: "https://git-scm.com/", dl: "https://git-scm.com/download/win",
  steps: [
    { t: "下载安装", d: "官网自动识别 Windows 版本下载 64-bit 安装包，双击运行。" },
    { t: "安装选项", d: "默认编辑器选 VS Code 或 Notepad++；PATH 选「Git from the command line and also from 3rd-party software」；换行符选「Checkout Windows-style, commit Unix-style」；其余 Next 到底。" },
    { t: "配置身份", d: "提交记录需要名字和邮箱，随便填但建议统一。", cmd: "git config --global user.name \"你的名字\" && git config --global user.email \"you@example.com\"" },
    { t: "拉一个安全工具试试", d: "以 sqlmap 为例，clone 到工具目录。", cmd: "git clone https://github.com/sqlmapproject/sqlmap.git D:\\tools\\sqlmap" },
    { t: "验证", d: "在 PowerShell 里能直接调 git（不用开 Git Bash）即完成。", cmd: "git --version && git config --list" }
  ],
  pit: "国内 clone 经常卡在 0%：给 git 配代理（git config --global http.proxy http://127.0.0.1:7890）或改用镜像。注意用完把代理关掉，否则内网 git 也走代理会失败。"
},
{
  id: "nodejs", name: "Node.js", cat: "env", icon: "JS", ver: "20 LTS",
  desc: "跑前端类安全工具（Xray 插件、Vue 靶场、Burp 插件构建）和部分信息收集脚本的运行时。",
  tags: ["npm", "前端", "插件"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://nodejs.org/", dl: "https://nodejs.org/zh-cn/download",
  steps: [
    { t: "下载 LTS 版", d: "选 20.x LTS 的 Windows Installer (.msi)，不要用 Current 尝鲜版。" },
    { t: "安装", d: "双击 msi → Next → 接受协议 → 安装路径 D:\\nodejs → 保持默认组件（npm 必选）→ 不勾「自动安装编译工具」→ Install。" },
    { t: "换 npm 国内源", d: "npm 官方源国内很慢，换成淘宝源。", cmd: "npm config set registry https://registry.npmmirror.com" },
    { t: "验证", d: "两个版本号都出来就 OK。", cmd: "node -v && npm -v" },
    { t: "跑一个常用工具", d: "例如用 npx 直接跑 js-beautify 格式化混淆的 JS：", cmd: "npx js-beautify -f obf.js -o pretty.js" }
  ],
  pit: "PowerShell 里 npm 报「无法加载文件 npm.ps1，因为在此系统上禁止运行脚本」：执行 Set-ExecutionPolicy -Scope CurrentUser RemoteSigned，或改用 npm.cmd。"
},
{
  id: "docker", name: "Docker Desktop", cat: "env", icon: "DK", ver: "4.x",
  desc: "一条命令起 Vulhub 漏洞环境，不用再折腾 PHP/MySQL 版本。现代打靶和复现 CVE 的最省事方式。",
  tags: ["容器", "Vulhub", "复现"], plat: "Win(WSL2) / Linux", lvl: "入门",
  official: "https://www.docker.com/", dl: "https://www.docker.com/products/docker-desktop/",
  steps: [
    { t: "安装 WSL2 前置", d: "Docker Desktop for Windows 依赖 WSL2 或 Hyper-V。管理员 PowerShell 执行下面命令并重启。", cmd: "wsl --install", hint: "开了 WSL2 后 VMware 可能起不来（虚拟化冲突），见 VMware 那条的说明。" },
    { t: "安装 Docker Desktop", d: "下载 exe → 双击 → 勾「Use WSL 2 instead of Hyper-V」→ 安装 → 重启 → 首次启动同意协议并跳过登录（选 Skip）。" },
    { t: "配置国内镜像加速", d: "Settings → Docker Engine，在 registry-mirrors 里加镜像站，Apply & Restart。", cmd: "{\"registry-mirrors\":[\"https://docker.m.daocloud.io\"]}" },
    { t: "验证并起一个靶场", d: "跑 hello-world 验证，再起一个 vulhub 环境。", cmd: "docker run --rm hello-world" },
    { t: "起真实漏洞环境（示例）", d: "进 vulhub 对应目录执行 compose up，访问映射端口即可。", cmd: "git clone https://github.com/vulhub/vulhub.git && cd vulhub/struts2/s2-045 && docker compose up -d" }
  ],
  pit: "C 盘很快被镜像撑爆：Settings → Resources → Disk image location 改到 D 盘。另外国内拉镜像经常超时，镜像加速配置是必须的。"
},
{
  id: "phpstorm", name: "PhpStorm", cat: "env", icon: "PS", ver: "2023.2+",
  desc: "JetBrains 的 PHP/前端 IDE，本站就是用它写的。代码审计时看 PHP 项目、断点调试、全局搜索非常好用。",
  tags: ["IDE", "代码审计", "调试"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.jetbrains.com/phpstorm/", dl: "https://www.jetbrains.com/phpstorm/download/",
  steps: [
    { t: "下载并安装", d: "官网下载 Windows .exe → 双击 → 选安装位置（可改 D 盘）→ 勾选「创建桌面快捷方式」「关联 .php 文件」→ Install。" },
    { t: "打开项目", d: "File → Open → 选择项目根目录（例如 D:\\phpstudy_pro\\WWW\\dvwa）→ Trust Project。IDE 会自动索引，右下角进度条跑完再操作。" },
    { t: "配置 PHP 解释器", d: "Settings → PHP → CLI Interpreter → + → 选 phpStudy 自带的 php.exe（或 XAMPP 的），确定后能看到版本号。" },
    { t: "本地预览网页", d: "右键 index.html → Open In → Browser → 选 Chrome。或者右上角运行配置里加 PHP Built-in Web Server。", cmd: "php -S 127.0.0.1:8080", hint: "纯静态页不需要解释器，右键 Open in Browser 即可；本机没装 PHP CLI 时这条命令会报错，改用 PhpStorm 内置预览。" },
    { t: "审计必备设置", d: "Settings → Editor → General → 勾「Show whitespaces」；Settings → Tools → Actions on Save 开自动格式化；用 Ctrl+Shift+F 全局搜索 $_GET、eval、include 这类危险函数。" }
  ],
  pit: "打开大项目后 IDE 卡：Settings → Directories 把 vendor、node_modules 标记为 Excluded，索引会快很多。"
},

/* ---------------- 信息收集 ---------------- */
{
  id: "nmap", name: "Nmap", cat: "recon", icon: "NM", ver: "7.9x",
  desc: "端口与服务探测的行业标准。能识别开放端口、服务版本、操作系统，还支持 NSE 脚本做漏洞探测。",
  tags: ["端口扫描", "服务识别", "NSE"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://nmap.org/", dl: "https://nmap.org/download.html",
  steps: [
    { t: "下载自解压安装包", d: "下载页 Windows 区选 nmap-x.xx-setup.exe。同时装 Zenmap（图形界面，新手先用它建立直觉）。" },
    { t: "组件页勾选 Npcap", d: "安装到组件选择页时，确保 Npcap 勾上，并勾「Install Npcap in WinPcap API-compatible Mode」。Npcap 是抓包驱动，Wireshark 也依赖它。" },
    { t: "验证", d: "PowerShell 里出版本号即成功。", cmd: "nmap --version" },
    { t: "第一次扫描（无需管理员）", d: "-sT 是 TCP 连接扫描，普通权限即可，最适合新手。", cmd: "nmap -sT -Pn --top-ports 100 127.0.0.1" },
    { t: "常用进阶组合", d: "-sV 探版本，-sC 跑默认脚本，-O 猜系统（需管理员）。", cmd: "nmap -sV -sC -O -p 1-1000 192.168.1.10 -oN scan.txt", hint: "Windows 上 -sS 半连接、-O 系统识别都需要「以管理员身份运行」，否则会静默降级成 -sT。" }
  ],
  pit: "在某些虚拟网卡上 nmap 会报 dnet 相关错误直接退出，加 --send-ip 参数可绕过。全端口 -p- 在本地环回上可能跑很久，先用 --top-ports 1000。"
},
{
  id: "fscan", name: "fscan", cat: "recon", icon: "FS", ver: "1.8+",
  desc: "国产内网综合扫描器：主机存活、端口、常见服务弱口令、Web 指纹、MS17-010 一把梭。内网横向开局神器。",
  tags: ["内网扫描", "弱口令", "指纹"], plat: "Win / Linux", lvl: "进阶",
  official: "https://github.com/shadow1ng/fscan", dl: "https://github.com/shadow1ng/fscan/releases",
  steps: [
    { t: "下载对应架构的 release", d: "Releases 页按系统取：Windows 用 fscan_windows_amd64.exe，Linux 用 fscan_linux_amd64。单文件，无需安装。" },
    { t: "放到工具目录并重命名", d: "统一放 D:\\tools\\bin 并改名 fscan.exe，方便直接调用。" },
    { t: "测试内网段（只扫你自己的靶场）", d: "-h 指定网段，-p 指定端口范围。", cmd: "fscan.exe -h 192.168.100.0/24 -p 22,80,443,3306,3389", hint: "在别人的网段跑这个 = 非法扫描，别试。" },
    { t: "开弱口令探测（靶场环境）", d: "加 -p 指定服务端口时会自动尝试内置弱口令字典。", cmd: "fscan.exe -h 192.168.100.10 -p 21,22,3306,6379 -user root -pwd 123456" },
    { t: "结果解读", d: "输出里的 [+] 是成功项（存活/弱口令/漏洞），[!] 是失败。结果会自动写入 result.txt。" }
  ],
  pit: "fscan 免杀性很差，Windows Defender 基本必杀。学习时把工具目录加进排除项即可；真实授权项目里不要用未改特征的原版，也别指望它能绕过 EDR。"
},
{
  id: "amass", name: "OWASP Amass", cat: "recon", icon: "AM", ver: "4.x",
  desc: "最完整的子域枚举框架：被动数据源 + 主动爆破 + 证书透明日志，输出可视化关系图。",
  tags: ["子域枚举", "资产测绘", "被动"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://owasp.org/www-project-amass/", dl: "https://github.com/owasp-amass/amass/releases",
  steps: [
    { t: "Windows 直接下 release 压缩包", d: "Releases 页找 amass_windows_amd64.zip，解压出 amass.exe 放进 D:\\tools\\bin。", hint: "Linux/Kali 直接 apt install amass，或 go install github.com/owasp-amass/amass/v4/...@master。" },
    { t: "配置 API Key（可选但强烈建议）", d: "免费的被动源（如 crt.sh、hackertarget）不用 key 也能跑，加 key 命中率大幅提升。配置文件放 %USERPROFILE%\\.config\\amass\\config.yaml。" },
    { t: "被动枚举（推荐先用这个）", d: "-passive 不打目标服务器，只查公开数据源，最安全。", cmd: "amass enum -passive -d example.com -o subs.txt" },
    { t: "主动枚举", d: "会发 DNS 查询和爆破，可能被对方 DNS 记录到日志。仅对授权目标使用。", cmd: "amass enum -active -d example.com -brute -w dict.txt" },
    { t: "结果整理", d: "输出的 subs.txt 直接喂给 httpx 探活。", cmd: "httpx -l subs.txt -title -status-code -o alive.txt" }
  ],
  pit: "Amass 首次运行会编译/加载大量字典，比较慢；跑 -active + -brute 时流量明显，别在非授权目标上用，也不要长时间挂着跑。"
},
{
  id: "subfinder", name: "Subfinder", cat: "recon", icon: "SF", ver: "2.6+",
  desc: "ProjectDiscovery 出品的被动子域枚举，速度快、并发高，几秒出结果，日常信息收集首选。",
  tags: ["子域", "快速", "被动"], plat: "Win / Linux", lvl: "入门",
  official: "https://github.com/projectdiscovery/subfinder", dl: "https://github.com/projectdiscovery/subfinder/releases",
  steps: [
    { t: "下载二进制", d: "Releases 页取 subfinder_x.x.x_windows_amd64.zip，解压放进 PATH。" },
    { t: "验证", d: "", cmd: "subfinder -version" },
    { t: "基本用法", d: "-d 目标域名，-all 用全部数据源（慢但全），-silent 只输出结果。", cmd: "subfinder -d example.com -all -silent -o subs.txt" },
    { t: "配置 API key 提升质量", d: "把 shodan、virustotal、censys 等 key 写进 %USERPROFILE%\\.config\\subfinder\\provider-config.yaml，不限速后结果多一倍。" },
    { t: "接上探活与指纹", d: "ProjectDiscovery 全家桶可以流水线组合。", cmd: "subfinder -d example.com -silent | httpx -silent -sc -title | tee alive.txt" }
  ],
  pit: "只跑被动源不会碰到目标服务器，这是它的优势；但结果只代表「公开信息里出现过」，还需要 httpx 探活确认是否真活着。"
},
{
  id: "httpx", name: "httpx", cat: "recon", icon: "HX", ver: "1.6+",
  desc: "高速 HTTP 探活与指纹提取：批量确认主机是否存活、状态码、标题、技术栈、CDN 与证书信息。",
  tags: ["探活", "指纹", "批量"], plat: "Win / Linux", lvl: "入门",
  official: "https://github.com/projectdiscovery/httpx", dl: "https://github.com/projectdiscovery/httpx/releases",
  steps: [
    { t: "下载并放入 PATH", d: "取 windows_amd64.zip 解压出 httpx.exe。注意别和 Python 的 httpx 库搞混，这是同名不同物。" },
    { t: "基础探活", d: "-l 读文件，-sc 状态码，-title 标题，-td 技术栈。", cmd: "httpx -l subs.txt -sc -title -td -o alive.txt" },
    { t: "只看活着的", d: "-mc 200,301,302,403 过滤响应码，-silent 清爽输出。", cmd: "cat subs.txt | httpx -silent -mc 200,302,403" },
    { t: "提取证书与 CDN 信息", d: "用于判断是否挂在 CDN/WAF 后面。", cmd: "httpx -l subs.txt -cdn -cl -csp -silent" }
  ],
  pit: "默认会跟 10 层重定向，可能导致重复结果；用 -no-redirect 或 -fr 去掉。"
},
{
  id: "oneforall", name: "OneForAll", cat: "recon", icon: "OA", ver: "0.4.5",
  desc: "国产子域收集集成工具，聚合 30+ 接口 + 证书 + 爆破，自带结果验证与存活检测，适合挖 SRC 做资产梳理。",
  tags: ["子域", "聚合", "验证"], plat: "Win / Linux", lvl: "进阶",
  official: "https://github.com/shmilylty/OneForAll", dl: "https://github.com/shmilylty/OneForAll/releases",
  steps: [
    { t: "下载 release 或 clone", d: "推荐下载 release 压缩包（含依赖），解压到 D:\\tools\\OneForAll。", cmd: "git clone https://github.com/shmilylty/OneForAll.git" },
    { t: "安装依赖", d: "用 Python 3.8-3.11（太高版本会踩依赖坑）。", cmd: "pip3 install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple" },
    { t: "跑一个目标", d: "第一次不加 --brute，先只做接口收集。", cmd: "python oneforall.py --target example.com run" },
    { t: "开启爆破与验证", d: "加 --brute True 会做 DNS 爆破，速度慢但更全。", cmd: "python oneforall.py --target example.com --brute True run" },
    { t: "看结果", d: "结果在 results/<域名>.csv，含子域、IP、状态码、标题、指纹。" }
  ],
  pit: "很多内置接口需要 API key，不配就只能拿到一小部分；跑 --brute 会产生大量 DNS 请求，务必限速并对授权目标使用。"
},
{
  id: "whatweb", name: "WhatWeb", cat: "recon", icon: "WW", ver: "0.5.5",
  desc: "Web 指纹识别：CMS、框架、JS 库、服务器、中间件版本，一眼看出目标技术栈，为后续选漏洞提供方向。",
  tags: ["指纹", "CMS", "版本"], plat: "Win / Linux", lvl: "入门",
  official: "https://github.com/urbanadventurer/WhatWeb", dl: "https://github.com/urbanadventurer/WhatWeb/releases",
  steps: [
    { t: "Kali 直接用", d: "Kali 预装了，跳过安装。", cmd: "whatweb -v https://example.com" },
    { t: "Windows 安装（Ruby）", d: "先装 RubyInstaller（含 Devkit），再 gem 安装 whatweb。", cmd: "gem install whatweb" },
    { t: "常用参数", d: "--aggression 3 更激进（更多请求），-a 1 最温和。", cmd: "whatweb -a 3 --color=never https://example.com" },
    { t: "批量识别", d: "结合 httpx 输出批量跑。", cmd: "whatweb --input-file=alive.txt --log-brief=指纹.txt" }
  ],
  pit: "激进模式会发大量探测请求，可能触发 WAF 告警。授权测试里默认用 -a 1 或 3，别用 4。"
},
{
  id: "arl", name: "灯塔 ARL", cat: "recon", icon: "AR", ver: "2.x",
  desc: "Tophant 开源的资产侦察灯塔：自动子域、端口、指纹、截图、目录扫描，Web 界面管理，做资产测绘很省事。",
  tags: ["资产测绘", "可视化", "Docker"], plat: "Linux(Docker)", lvl: "进阶",
  official: "https://github.com/TophantTechnology/ARL", dl: "https://github.com/TophantTechnology/ARL",
  steps: [
    { t: "准备 Linux 环境", d: "需要 Docker + Docker Compose。Kali 或一台 Ubuntu 虚拟机都行。" },
    { t: "clone 并启动", d: "官方提供 docker-compose，一条命令起全套服务。", cmd: "git clone https://github.com/TophantTechnology/ARL.git && cd ARL/docker && docker compose up -d" },
    { t: "访问面板", d: "浏览器打开 http://<你的IP>:5003，默认账号 admin / 密码 admin（首次登录要求改）。" },
    { t: "配置扫描策略", d: "「策略配置」里选 docker 模式、设置端口范围、是否截图；然后「任务管理」新建任务填目标域名。" },
    { t: "看结果", d: "任务结束后在「资产组」里看子域、站点、IP、截图，全量结果可导出 Excel。" }
  ],
  pit: "5003 面板有历史未授权漏洞，不要暴露到公网；运行时占内存较多（建议 4G+），起不来先看 docker logs。"
},
{
  id: "theharvester", name: "theHarvester", cat: "recon", icon: "TH", ver: "4.x",
  desc: "OSINT 邮箱、用户名、主机、子域收集，从搜索引擎与公开数据源抓，社工与钓鱼演练前期常用。",
  tags: ["OSINT", "邮箱", "社工"], plat: "Linux / Win(Py)", lvl: "入门",
  official: "https://github.com/laramies/theHarvester", dl: "https://github.com/laramies/theHarvester",
  steps: [
    { t: "Kali 直接装", d: "Kali 预装。Windows 用 pip 装。", cmd: "sudo apt install -y theharvester" },
    { t: "基础用法", d: "-d 域名，-b 数据源（baidu、bing、duckduckgo、crtsh 等）。", cmd: "theHarvester -d example.com -b baidu,bing,crtsh -l 200" },
    { t: "只要邮箱", d: "输出到 HTML 报告方便查看。", cmd: "theHarvester -d example.com -b all -f report.html" },
    { t: "结果用途", d: "邮箱用于了解企业命名规则（如 name.surname@corp.com），子域喂给 httpx。仅做信息整理，不要用于发送钓鱼邮件。" }
  ],
  pit: "很多数据源已要求 API key，不加 key 结果很少；Google 源经常被限流，用 bing/baidu/crtsh 更稳。"
},

/* ---------------- Web 渗透 ---------------- */
{
  id: "burp", name: "Burp Suite", cat: "web", icon: "BP", ver: "2025.x",
  desc: "Web 渗透的核心工作台：抓包改包、重放、爆破、扫描、插件生态。免费版足够日常挖洞。",
  tags: ["抓包", "改包", "重放", "Intruder"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://portswigger.net/burp", dl: "https://portswigger.net/burp/communitydownload",
  steps: [
    { t: "下载 Community 版", d: "选 Community Edition，免费。安装包自带 JRE，不需要另装 Java。" },
    { t: "设置代理监听", d: "Proxy → Options → 确认 127.0.0.1:8080；被占用改 8081。新版在 Settings → Tools → Proxy。" },
    { t: "浏览器配置代理", d: "Firefox 网络设置里手动填 HTTP 代理 127.0.0.1:8080 并勾 HTTPS；或用 Burp 内置浏览器（Proxy → Open browser）零配置。", hint: "只想抓某个域名时，用 Proxy → Options → 添加 Target scope，避免被无关流量淹没。" },
    { t: "安装 CA 证书（抓 HTTPS 必做）", d: "浏览器访问 http://burp 下载 cacert.der → 双击 → 安装到「受信任的根证书颁发机构」。", cmd: "certutil -addstore -f Root cacert.der" },
    { t: "验证抓包", d: "开着 Intercept 访问 https 站点，HTTP history 有记录即成功。", cmd: "curl.exe -x http://127.0.0.1:8080 -k https://example.com -I" },
    { t: "装插件", d: "Extender → BApp Store：Logger++（全量日志）、Turbo Intruder（高速爆破）、JWT Editor（改 JWT）、Param Miner（隐藏参数发现）。" }
  ],
  pit: "新版 Burp 默认拦截范围变窄，抓不到包先看 Target scope 和「过滤掉静态资源」的设置。另外打开 Repeater 前记得把请求先 Send to Repeater。"
},
{
  id: "zap", name: "OWASP ZAP", cat: "web", icon: "ZP", ver: "2.15+",
  desc: "开源 Web 扫描器 + 代理，能自动爬站扫漏洞，也支持手工改包与脚本扩展，完全免费无功能阉割。",
  tags: ["开源", "自动扫描", "爬虫"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.zaproxy.org/", dl: "https://www.zaproxy.org/download/",
  steps: [
    { t: "下载安装包", d: "选 Windows 64-bit Installer，装完首次启动选「No, I do not want to persist this session」用于临时测试。" },
    { t: "快速扫描", d: "输入目标 URL → Attack → 自动扫描，ZAP 会先爬站再扫。", hint: "自动扫描会发大量请求，只在授权目标或本地靶场上用。它会触发告警，可能被 WAF 封 IP。" },
    { t: "手工模式抓包", d: "设置浏览器代理到 127.0.0.1:8080 → 打开 ZAP 的 HUD 或直接看 History 标签 → 右键请求 Send to Repeater。" },
    { t: "装 HTTPS 证书", d: "Tools → Options → Dynamic SSL Certificates 导出，或直接访问 http://zap 下载证书装进系统信任区。" },
    { t: "出报告", d: "Report → Generate HTML Report，按风险等级列出漏洞，附证据与修复建议。" }
  ],
  pit: "ZAP 的自动扫描误报较多，报告里每条都要手工复现一遍再定级，不然写出来会被打回。"
},
{
  id: "sqlmap", name: "sqlmap", cat: "web", icon: "SM", ver: "1.8+",
  desc: "SQL 注入检测与利用的王者：自动识别注入点、判断数据库、爆库爆表、甚至拿 shell，支持几十种数据库。",
  tags: ["SQL注入", "爆库", "自动化"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://sqlmap.org/", dl: "https://github.com/sqlmapproject/sqlmap",
  steps: [
    { t: "获取源码", d: "git clone 或直接下 zip，解压到 D:\\tools\\sqlmap。它是纯 Python 脚本，不需要安装。", cmd: "git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git D:\\tools\\sqlmap" },
    { t: "验证能跑", d: "看到 banner 即成功。", cmd: "python sqlmap.py --version" },
    { t: "对 DVWA 做第一次注入", d: "注意必须带 cookie 才能通过 DVWA 登录态；先用浏览器登录后在 Burp 里复制 Cookie。", cmd: "python sqlmap.py -u \"http://127.0.0.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit\" --cookie=\"PHPSESSID=xxx;security=low\" --batch --dbs" },
    { t: "导数据", d: "--dump 会导出整表，靶场里玩玩就好。", cmd: "python sqlmap.py -u \"...\" --cookie=\"...\" -D dvwa -T users -C user,password --dump" },
    { t: "从 Burp 请求文件跑", d: "把 Burp 里的请求 Save item 存成 req.txt，跑 -r 更准确。", cmd: "python sqlmap.py -r req.txt --batch --level 3 --risk 2 --dbs" }
  ],
  pit: "不加 --batch 会卡在「Press Enter」等人机交互。默认 level/risk 太低漏测，授权测试时用 --level 3 --risk 2，但 risk 3 会尝试 OR 型注入可能改数据，别乱开。"
},
{
  id: "xray", name: "Xray", cat: "web", icon: "XR", ver: "1.9.x",
  desc: "长亭出品的被动/主动漏洞扫描器，社区版免费。挂代理边浏览边扫，准确率高、误报少，SRC 常用。",
  tags: ["被动扫描", "社区版", "POC"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://xray.cool/", dl: "https://github.com/chaitin/xray/releases",
  steps: [
    { t: "下载对应版本", d: "Releases 页取 xray_windows_amd64.exe.zip，解压出 exe。首次运行会生成 config.yaml。" },
    { t: "生成 CA 证书", d: "抓 HTTPS 必须用它自己的证书。", cmd: "xray_windows_amd64.exe genca" },
    { t: "装证书", d: "把生成的 ca.crt 双击装进「受信任的根证书颁发机构」，和 Burp 的证书可以共存。" },
    { t: "启动被动扫描", d: "浏览器代理指向 7777，xray 监听并被动分析流量。", cmd: "xray_windows_amd64.exe webscan --listen 127.0.0.1:7777 --html-output result.html" },
    { t: "主动扫描单个 URL", d: "确需主动扫时用这个，注意会发大量请求。", cmd: "xray_windows_amd64.exe webscan --basic-crawler http://127.0.0.1/dvwa/ --html-output dvwa.html" }
  ],
  pit: "社区版有功能与频率限制；主动爬虫在 SRC 目标上极易触发风控甚至封号，用被动模式 + 手工浏览更安全。"
},
{
  id: "yakit", name: "Yakit", cat: "web", icon: "YK", ver: "1.x",
  desc: "国产一体化安全平台（Yaklang）：抓包、重放、漏洞检测、Web Fuzzer、插件市场、反连平台都有，界面现代。",
  tags: ["一体化", "Web Fuzzer", "插件"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.yaklang.com/", dl: "https://www.yaklang.com/products/download",
  steps: [
    { t: "下载安装", d: "官网下载页选对应系统安装包（Windows 是 exe），装完首次启动会引导初始化引擎。" },
    { t: "启动 MITM 抓包", d: "左侧「MITM 交互式劫持」→ 选网卡/端口（默认 8083）→ 点「免配置启动」会自动配好系统代理和证书。", hint: "它会改系统代理，用完记得点「关闭」恢复，否则其他软件上网异常。" },
    { t: "Web Fuzzer 手测", d: "把抓到的请求右键「发送到 Web Fuzzer」，改参数、加 payload、批量发包，比 Burp Intruder 免费版不限制速度。" },
    { t: "跑内置漏洞检测", d: "「插件商店」搜 sqli / xss / 未授权，选中后对目标批量执行，结果带请求响应证据。" },
    { t: "反连平台", d: "做 SSRF / Log4j 盲打时用内置反连（类似 dnslog），「反连管理」里看回连记录。" }
  ],
  pit: "Yakit 和 Burp 同时开容易抢 8080 端口，改一个。另外它的插件执行强度较大，非授权目标别开批量检测。"
},
{
  id: "antsword", name: "AntSword 蚁剑", cat: "web", icon: "AS", ver: "2.1.x",
  desc: "开源 Webshell 管理客户端，支持 PHP/ASP/JSP，插件化、可自定义编码器，学习文件上传利用时用来验证。",
  tags: ["Webshell", "管理端", "编码器"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/AntSwordProject/antSword", dl: "https://github.com/AntSwordProject/antSword/releases",
  steps: [
    { t: "下载加载器", d: "Releases 里取 antSword-Loader-vX-win64.zip（加载器）+ 源码包。加载器是壳，源码是核心，两者版本要匹配。" },
    { t: "首次运行选源码目录", d: "解压源码到 D:\\tools\\antSword，启动加载器时选择该目录作为初始化路径。" },
    { t: "添加 Shell", d: "右键「添加数据」→ URL 填 shell 地址 → 连接密码 → 编码器默认 default → 测试连接。" },
    { t: "验证", d: "连接成功后在「文件管理」里能看到目标目录结构即打通。" }
  ],
  pit: "只在自己的靶场里用。把 webshell 挂到任何非授权站点都是刑法 285 条；另外蚁剑默认流量特征明显，真实项目里会被 WAF/EDR 抓。"
},
{
  id: "behinder", name: "冰蝎 Behinder", cat: "web", icon: "BH", ver: "4.x",
  desc: "加密流量型 Webshell 管理工具，内置 AES 加密与多种免杀马，流量特征比蚁剑弱，理解加密马原理的必看工具。",
  tags: ["加密马", "AES", "免杀"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/rebeyond/Behinder", dl: "https://github.com/rebeyond/Behinder/releases",
  steps: [
    { t: "下载 jar", d: "Releases 页取 Behinder_vX.X_YYYYMMDD.jar。需要 Java 8+ 运行环境。" },
    { t: "启动", d: "双击 jar，或命令行启动（方便看报错）。", cmd: "java -jar Behinder_v4.1_20240115.jar" },
    { t: "生成 Shell", d: "「传输协议」选 default → 右键「生成服务端」→ 选 PHP/JSP/ASPX → 得到加密马内容。" },
    { t: "上传并连接", d: "把马传到靶场的上传点，回到冰蝎填入 URL 与密码（默认 rebeyond），点「连接」。" },
    { t: "基础功能", d: "文件管理、命令执行、数据库管理、内存马注入（进阶）。先只玩文件管理和命令执行。", hint: "冰蝎 4 默认 AES 加密，抓包看不到明文是正常的，这正是它与蚁剑的区别。" }
  ],
  pit: "冰蝎马查杀率很高（尤其 JSP 内存马），学习价值大于实战价值。非授权环境绝不能上传。"
},
{
  id: "gobuster", name: "Gobuster", cat: "web", icon: "GB", ver: "3.6+",
  desc: "Go 写的目录/子域/DNS/VHost 爆破器，速度快、单文件免安装，配合字典能找到后台、备份文件、接口。",
  tags: ["目录爆破", "子域", "字典"], plat: "Win / Linux", lvl: "入门",
  official: "https://github.com/OJ/gobuster", dl: "https://github.com/OJ/gobuster/releases",
  steps: [
    { t: "下载二进制", d: "Releases 取 gobuster_Windows_x86_64.zip，解压出 gobuster.exe 放进 PATH。" },
    { t: "准备字典", d: "推荐 SecLists 的 Discovery/Web-Content 目录（common.txt、directory-list-2.3-medium.txt）。", cmd: "git clone --depth 1 https://github.com/danielmiessler/SecLists.git D:\\tools\\SecLists" },
    { t: "目录扫描", d: "-x 指定后缀（php、bak、zip、sql 常能捡到备份）。", cmd: "gobuster dir -u http://127.0.0.1/dvwa -w D:\\tools\\SecLists\\Discovery\\Web-Content\\common.txt -x php,bak,txt,zip" },
    { t: "子域枚举", d: "", cmd: "gobuster dns -d example.com -w subs.txt -t 50" },
    { t: "虚拟主机枚举", d: "同一 IP 上挂多个站点时用这个找内网站点。", cmd: "gobuster vhost -u http://192.168.1.10 -w vhosts.txt" }
  ],
  pit: "线程默认 10，调到 50 以上容易把小型站点打挂或触发 WAF；扫描前先确认目标授权范围，SRC 里跑大字典常被判违规。"
},
{
  id: "ffuf", name: "ffuf", cat: "web", icon: "FF", ver: "2.1+",
  desc: "极快的模糊测试器：目录、参数、子域、POST 数据都能 FUZZ。按响应大小/字数/状态码过滤，结果干净。",
  tags: ["模糊测试", "参数发现", "过滤"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/ffuf/ffuf", dl: "https://github.com/ffuf/ffuf/releases",
  steps: [
    { t: "下载 release", d: "取 ffuf_x.x.x_windows_amd64.zip，解压放进 PATH。" },
    { t: "目录扫描", d: "-mc 只保留指定状态码，FUZZ 是占位符。", cmd: "ffuf -u http://127.0.0.1/FUZZ -w common.txt -mc 200,301,302,403" },
    { t: "按响应大小过滤（关键技巧）", d: "批量 404 页面大小都一样，-fs 过滤掉它们，避免几千条干扰。", cmd: "ffuf -u http://127.0.0.1/FUZZ -w common.txt -fs 1234" },
    { t: "参数发现", d: "从 Burp 请求里拆出参数名做爆破。", cmd: "ffuf -u \"http://target/api?FUZZ=1\" -w params.txt -fs 42" },
    { t: "POST 表单爆破", d: "", cmd: "ffuf -u http://target/login -X POST -d \"user=admin&pass=FUZZ\" -w pass.txt -fc 401" }
  ],
  pit: "-fs 的数值要自己看基线响应决定，写错了会把有用结果全过滤掉。先用 -mc all 跑一次看噪声大小。"
},
{
  id: "dirsearch", name: "dirsearch", cat: "web", icon: "DS", ver: "0.4.3",
  desc: "Python 写的目录扫描器，自带字典、递归、代理支持，输出美观，挖 SRC 找备份文件和后台很实用。",
  tags: ["目录扫描", "递归", "备份文件"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://github.com/maurosoria/dirsearch", dl: "https://github.com/maurosoria/dirsearch",
  steps: [
    { t: "获取源码", d: "Kali 已预装；Windows 用 git clone。", cmd: "git clone https://github.com/maurosoria/dirsearch.git D:\\tools\\dirsearch" },
    { t: "安装依赖", d: "", cmd: "cd D:\\tools\\dirsearch && pip install -r requirements.txt" },
    { t: "基础扫描", d: "-e 指定后缀，--exclude-status 排除噪声。", cmd: "python dirsearch.py -u http://127.0.0.1/dvwa -e php,txt,zip,bak" },
    { t: "递归 + 限速", d: "递归别开太深，容易把目标拖慢。", cmd: "python dirsearch.py -u http://127.0.0.1/dvwa -r -R 2 --max-rate 20 --exclude-status 404,500" },
    { t: "走代理进 Burp", d: "想看请求细节就让它走代理。", cmd: "python dirsearch.py -u http://target --proxy http://127.0.0.1:8080" }
  ],
  pit: "默认线程 30，小站容易打出 502。授权目标上加 --max-rate 10~20 限速，是「不影响业务」的基本礼貌。"
},
{
  id: "nikto", name: "Nikto", cat: "web", icon: "NK", ver: "2.5.0",
  desc: "经典 Web 服务器扫描器：检查危险文件、默认页面、过期组件、错误配置，虽然老但快速筛查仍好用。",
  tags: ["服务器扫描", "配置检查", "老牌"], plat: "Linux / Win(Perl)", lvl: "入门",
  official: "https://github.com/sullo/nikto", dl: "https://github.com/sullo/nikto",
  steps: [
    { t: "Kali 直接用", d: "预装，跳过安装。", cmd: "nikto -h http://127.0.0.1" },
    { t: "Windows 安装", d: "需要 Perl（Strawberry Perl）+ 下载 nikto 源码，用 perl nikto.pl 运行。" },
    { t: "常用参数", d: "-Tuning 控制测试项，-ssl 强制 HTTPS，-o 输出报告。", cmd: "nikto -h https://target -ssl -Tuning 123 -o nikto.html -F html" },
    { t: "走代理", d: "", cmd: "nikto -h http://target -useproxy http://127.0.0.1:8080" }
  ],
  pit: "噪声极大，几乎必触 WAF。SRC 场景下优先级很低，只适合在自有服务器上做基线检查。"
},
{
  id: "nuclei", name: "Nuclei", cat: "web", icon: "NC", ver: "3.x",
  desc: "基于 YAML 模板的漏洞扫描器，社区模板几千个，覆盖 CVE、默认口令、未授权访问。可自己写模板做精准验证。",
  tags: ["模板扫描", "CVE", "YAML"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/projectdiscovery/nuclei", dl: "https://github.com/projectdiscovery/nuclei/releases",
  steps: [
    { t: "下载二进制", d: "取 nuclei_x.x.x_windows_amd64.zip，解压出 nuclei.exe 放进 PATH。" },
    { t: "更新模板", d: "首次使用必须拉模板，否则扫不出东西。", cmd: "nuclei -update-templates" },
    { t: "单目标扫描", d: "-tags 按类型筛，别一上来全跑。", cmd: "nuclei -u http://127.0.0.1 -tags cve,misconfig -severity critical,high" },
    { t: "批量扫子域", d: "", cmd: "nuclei -l alive.txt -t http/cves/ -o result.txt -rl 30" },
    { t: "写自己的模板", d: "针对某个 CVE 复现，把请求特征写成 YAML，跑 -t my.yaml 精准验证。", cmd: "nuclei -u http://target -t my-poc.yaml -debug" }
  ],
  pit: "模板会发真实攻击请求，对 SRC 目标全量跑等于自动攻击，容易封号。用 -rl 限速并只跑与目标指纹匹配的模板。"
},
{
  id: "postman", name: "Postman", cat: "web", icon: "PM", ver: "11.x",
  desc: "API 调试与测试工具，做接口渗透时整理请求、批量发包、环境变量切换很方便，配合 Burp 抓包互补。",
  tags: ["API测试", "接口", "批量"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.postman.com/", dl: "https://www.postman.com/downloads/",
  steps: [
    { t: "下载安装", d: "官网选 Windows 64-bit，装完可跳过登录直接用（跳过会有些云功能不可用）。" },
    { t: "建 Collection", d: "按目标站点建集合，每个接口一个请求，方便复盘和交付。" },
    { t: "配环境变量", d: "右上角齿轮 → Environments → 加 {{baseUrl}}、{{token}}，切换环境不用改请求。" },
    { t: "走 Burp 看流量", d: "Settings → Proxy → 加 http://127.0.0.1:8080，请求就会出现在 Burp 里。" },
    { t: "批量跑（越权测试常用）", d: "用 Runner 或 Collection 跑不同账号的 token，对比响应判断越权。", hint: "越权验证的正确做法：A 账号的 token 请求 B 账号的资源 ID，能拿到数据才算成立。" }
  ],
  pit: "免费版有集合数量限制；测试环境别把生产 token 存进共享 Collection。"
}
);
