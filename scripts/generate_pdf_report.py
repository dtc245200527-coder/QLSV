import markdown
import subprocess
import os

with open("docs/BAO_CAO_THUC_HANH_TKQTPM.md", "r", encoding="utf-8") as f:
    text = f.read()

# Fix image paths for html rendering
text = text.replace("screenshots/", os.path.abspath("docs/screenshots") + "/")

html_body = markdown.markdown(text, extensions=['tables', 'fenced_code', 'nl2br'])

full_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Báo cáo Bài tập lớn - TKQTHPTM - DTC245200527</title>
<style>
  @page {{
    size: A4;
    margin: 20mm 15mm 20mm 20mm;
    @bottom-center {{
      content: counter(page);
    }}
  }}
  body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 13pt;
    line-height: 1.5;
    color: #111;
  }}
  h1 {{
    font-size: 18pt;
    text-align: center;
    text-transform: uppercase;
    margin-top: 25px;
    margin-bottom: 15px;
    color: #0f172a;
    page-break-before: always;
  }}
  h1:first-of-type {{
    page-break-before: avoid;
  }}
  h2 {{
    font-size: 15pt;
    color: #1e3a8a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 5px;
    margin-top: 30px;
    page-break-before: always;
  }}
  h2:first-of-type {{
    page-break-before: avoid;
  }}
  h3 {{
    font-size: 13pt;
    color: #1e293b;
    margin-top: 15px;
  }}
  p {{
    text-align: justify;
    margin-bottom: 10px;
  }}
  img {{
    display: block;
    max-width: 95%;
    height: auto;
    margin: 15px auto 5px auto;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }}
  em {{
    display: block;
    text-align: center;
    font-size: 10.5pt;
    color: #475569;
    margin-bottom: 15px;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 11pt;
  }}
  th, td {{
    border: 1px solid #94a3b8;
    padding: 8px 10px;
    text-align: left;
  }}
  th {{
    background-color: #f1f5f9;
    font-weight: bold;
    color: #1e293b;
  }}
  pre {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 10pt;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }}
  code {{
    background-color: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 10.5pt;
    color: #0f172a;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

html_file = "/tmp/report.html"
with open(html_file, "w", encoding="utf-8") as f:
    f.write(full_html)

out_pdf = "docs/BAO_CAO_THUC_HANH_TKQTPM.pdf"
subprocess.run([
    "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
    "--print-to-pdf=" + out_pdf,
    "--print-to-pdf-no-header",
    html_file
], check=True)
print("Generated PDF successfully:", out_pdf)
