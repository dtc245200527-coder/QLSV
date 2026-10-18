import subprocess
import os

def render_terminal(title, command, output, out_png, width=1100):
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{
    margin: 0;
    padding: 30px;
    background: #0f172a;
    display: flex;
    justify-content: center;
    font-family: 'Consolas', 'Courier New', monospace;
  }}
  .window {{
    background: #1e1e1e;
    width: {width}px;
    border-radius: 10px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    overflow: hidden;
    border: 1px solid #334155;
  }}
  .header {{
    background: #2d3748;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #4a5568;
  }}
  .dots {{
    display: flex;
    gap: 8px;
    margin-right: 16px;
  }}
  .dot {{
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }}
  .dot-red {{ background: #ef4444; }}
  .dot-yellow {{ background: #f59e0b; }}
  .dot-green {{ background: #10b981; }}
  .title {{
    color: #cbd5e1;
    font-size: 13px;
    font-weight: bold;
    flex-grow: 1;
    text-align: center;
    padding-right: 50px;
  }}
  .body {{
    padding: 20px;
    color: #f8fafc;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }}
  .prompt {{
    color: #38bdf8;
    font-weight: bold;
  }}
  .cmd {{
    color: #facc15;
    font-weight: bold;
  }}
</style>
</head>
<body>
<div class="window">
  <div class="header">
    <div class="dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="title">{title}</div>
  </div>
  <div class="body"><span class="prompt">dtc245200527@server:~/QLSV$</span> <span class="cmd">{command}</span>
{output}</div>
</div>
</body>
</html>"""
    tmp_html = f"/tmp/{os.path.basename(out_png)}.html"
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    subprocess.run([
        "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
        f"--screenshot={out_png}", f"--window-size={width+80},800",
        "--default-background-color=00000000", tmp_html
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Captured: {out_png}")

# 1. Docker compose ps
out1 = subprocess.check_output(["docker", "compose", "ps"], text=True)
render_terminal("Docker Compose - Trạng thái các container", "docker compose ps", out1, "docs/screenshots/06_terminal_docker_compose_ps.png", width=1200)

# 2. Hardening Non-root check
out2 = subprocess.check_output(["docker", "compose", "exec", "app", "id"], text=True)
out2 += subprocess.check_output(["docker", "compose", "exec", "app", "whoami"], text=True)
render_terminal("Hardening - Xác minh Non-root User container", "docker compose exec app id && whoami", out2, "docs/screenshots/07_terminal_non_root_check.png", width=1000)

# 3. Application Winston & Morgan Logs
out3 = subprocess.check_output(["docker", "compose", "logs", "app", "--tail", "15"], text=True)
render_terminal("Winston & Morgan - Kiểm tra log hoạt động của ứng dụng", "docker compose logs app --tail 15", out3, "docs/screenshots/08_terminal_app_winston_logs.png", width=1200)

# 4. Git config
out4 = subprocess.check_output(["git", "config", "--list", "--local"], text=True)
out4 += "\n" + subprocess.check_output(["git", "remote", "-v"], text=True)
render_terminal("Git - Cấu hình tài khoản sinh viên & GitHub Remote", "git config --list --local && git remote -v", out4, "docs/screenshots/09_terminal_git_config.png", width=1000)
