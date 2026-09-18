"""The CV builder of record. Lives in the repository so every shipped CV is a git tag.

Usage:  python cv/build_cv.py <tag>     -> writes cv/build/<tag>/{pdf,html} (gitignored)
Source of every claim: the private master resume M:/AGENT_VAULT/PORTFOLIO/cv/MASTER_CV.md
(superset of every fact ever claimed, never pruned, never published). This file cuts the
one-page version from it. Every shipped
version: a row in cv/CHANGELOG.md, a tag `cv-r<N>`, the pdf at the repo root, in
site/public and in docs, and the hash in site/public/cv_version.json. The gate
tools/check_cv.py runs on every push and refuses a CV that drops a named section.
Rendering: ReportLab, A4, one column, since the 13 Sep build.
"""
from html import escape
from pathlib import Path
import re
import sys

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate

TAG = sys.argv[1] if len(sys.argv) > 1 else "untagged"
OUT = Path(__file__).resolve().parent / "build" / TAG
STEM = "Vo_Ba_Hoang_Minh_AI_Engineer_CV"
NAME = "VO BA HOANG MINH"
TITLE = "AI ENGINEER | EVALUATION, AGENTS & RETRIEVAL"
PORTFOLIO = "https://anhminhzui-dev.github.io/anhminhzui-dev/"
CONTACT = ('Ho Chi Minh City, Vietnam | Remote, worldwide | UTC+7<br/>'
           '<a href="mailto:minhhoang250803@gmail.com">minhhoang250803@gmail.com</a> | '
           '<a href="tel:+84902391936">+84 902 391 936</a><br/>'
           '<a href="https://github.com/anhminhzui-dev" color="#24557a"><u>github.com/anhminhzui-dev</u></a> | '
           '<a href="' + PORTFOLIO + '" color="#24557a"><u>Portfolio (anhminhzui-dev.github.io)</u></a> | '
           '<a href="https://doi.org/10.5281/zenodo.22675789" color="#24557a"><u>Research (doi.org/10.5281/zenodo.22675789)</u></a>')
INTRO = ("Founder of Gnomon, delivering paid writing-assessment work for teachers and clients. "
         "Engineering experience spans data science, retrieval, multimodal training and evaluation.")
REPORT = "https://doi.org/10.5281/zenodo.22675789"
PR = "https://github.com/EleutherAI/lm-evaluation-harness/pull/4115"

SECTIONS = [
 ('EXPERIENCE',
  [('Gnomon | Founder & AI Systems Engineer | 2024 - Present',
    None,
    ['Delivered paid teacher and client assessments; owned product design, triage, fixes and final review.',
     'Designed the facts-not-grades architecture: the model emits evidence grounded in source spans, a '
     'deterministic scorer maps facts to the result, and an abstain layer refuses on thin evidence.',
     'Built the fail-closed evaluation harness: 2,232 criterion units across 629 essays, 1,866 admitted and '
     '366 refused before scoring; LLM-as-judge runs on a frozen, hash-checked evidence window.',
     'Built KD-tree exemplar retrieval for Gnomon and a separate LangGraph pipeline that retrieves compliance '
     'rules with SQLite FTS5.',
     'Engineered selection across 101,175 records and 47 source labels; prepared 10,888 training and 578 '
     'validation records using 44 data-quality checks.',
     'Led multimodal supervised fine-tuning: QLoRA on a 27B open-weight model (4-bit NF4) with completion-only '
     'loss and chunked vocabulary projection; a separate 8B run processed 9,325 examples, 2,134 with images.',
     'Directed a two-provider coding-agent fleet under policy-as-code guardrails (resource-aware admission, '
     'spend/irreversibility classifier scored on a hash-pinned 1,219-case deck, output-hash delivery checks); '
     'shipped the React/TypeScript and FastAPI/SQLite product: 43 router modules, 79 migrations, TOTP MFA, 1,117 backend tests.']),
   ('FPT Software | Data Science | 2025 - 2026',
    None,
    ['Consolidated customer and business data (missing records, inconsistencies, duplicates); analysed sales and '
     'operational data for trends, seasonality and anomalies; compared forecasting models to recommend selection.']),
   ('FPT Education | Lecturer, AI for VFX | 2025 - 2026',
    None,
    ['Delivered paid instruction on applying AI to visual-effects workflows.'])]),
 ('FORWARD-DEPLOYED ENGINEERING - VFX AND AI | 2023 - 2025',
  [('OTSU Labs | Forward-Deployed 3D Generalist | 2025',
    None,
    ['Ran the 3D generalist workflow across projects in partnership with Sparta VFX and Sparx; owned render '
     'passes, asset management and look development, delivering shots to studio standard on deadline; converted '
     'realistic assets into stylised anime visuals with the 2D team.']),
   ('FPT, "Fragments of the Deep" | Creative Lead | 07/2024 - 2025',
    None,
    ['Led the artist team on an Unreal Engine 5 animated short, owning storyboard and camera direction; '
     'optimised real-time models for a 30% performance gain.']),
   ('Dihaan Media | Forward-Deployed 3D Artist | 2023',
    None,
    ['Embedded with the client production team on stage and booth environments for Sofitel Saigon Plaza; '
     'introduced IES-based lighting and new tools into their workflow.']),
   ('Contract engagements | VFX, education and government | 2023 - present',
    None,
    ['AI, data and pipeline work with VFX and education client teams; contractor work on Vietnam\'s OCR '
     'book-to-e-book digitisation programme.'])]),
 ('PROJECTS',
  [('failclosed-eval | Input validation',
    'https://github.com/anhminhzui-dev/failclosed-eval',
    ['Built fail-closed input validation for images, leakage and duplicates: 375 of 500 ELLIPSE-based '
     'payloads admitted, 125 malformed inputs refused; 239 tests, GitHub CI.']),
   ('policy-deck | Command classification',
    'https://github.com/anhminhzui-dev/policy-deck',
    ['Benchmarked 11 command-classification rules: 8 false positives/0 false negatives on 1,260 fitted '
     'cases; 2/0 on 190 separate cases; 455 tests. Classifier, not an execution sandbox.']),
   ('relay-gate | Completion-claim detection',
    'https://github.com/anhminhzui-dev/relay-gate',
    ['Built a detector for false agent completion claims; benchmarked on MAST and AgentRewardBench, with 81 tests.']),
   ('mcp-trajectory-judge | Tool-trajectory evaluation',
    'https://github.com/anhminhzui-dev/mcp-trajectory-judge',
    ['Replays MCP-style tool trajectories in a deterministic sandbox to check actions against completion claims.']),
   ('Hackathon and competition entries | September 2026',
    'https://github.com/anhminhzui-dev',
    ['Submitted a voice-agent entry with public code (uh-huh, 2 companion tools); scored an ARC White-Box '
     'Estimation leaderboard submission (arc-whest); Kaggle S6E9 public score 0.94151; OpenCV entry '
     'registered.'])]),
 ('PUBLICATIONS & OPEN SOURCE',
  [('Constructing Language Judgments: Rubric Distillation and Evidence-Grounded Reasoning',
    'https://doi.org/10.5281/zenodo.22675789',
    []),
   ('EleutherAI lm-evaluation-harness | Submitted PR #4115',
    'https://github.com/EleutherAI/lm-evaluation-harness/pull/4115',
    ['Added isolated DummyLM tests for construction, generation/error paths and chat templates.'])]),
 ('SKILLS',
  [('',
    None,
    ['Evaluation: LLM-as-judge on hashed evidence, structured-output validation, pytest, GitHub Actions CI.',
     'Retrieval and agents: LangGraph, KD-tree theta-kNN exemplar retrieval, SQLite FTS5, policy-as-code agent guardrails.']),
   ('', None, ['Machine Learning: Large Language Model (LLM) SFT, QLoRA, data-quality and leakage checks.']),
   ('',
    None,
    ['Languages, tools and serving: Python, PyTorch, PEFT/LoRA, TypeScript, React, FastAPI, SQLite.',
     'Spoken languages: Vietnamese: native | English: professional proficiency | Japanese: intermediate.'])]),
 ('EDUCATION', [('', None, ["FPT University | Bachelor's degree."])])]


def build():
    all_texts = [t for _, items in SECTIONS for _, _, ts in items for t in ts]
    banned = re.compile(r"(?i)MAE|accuracy|agreement|correlation|\bband\b|Co-Authored|Claude|GPT|ChatGPT")
    for t in all_texts:
        assert not banned.search(t), f"BANNED TERM in bullet: {t[:80]}"
    assert "FPT University | Bachelor's degree." in " ".join(all_texts), "degree line drift"
    assert "field of study" not in " ".join(all_texts).lower()

    OUT.mkdir(parents=True, exist_ok=True)
    ink = colors.HexColor("#202020")
    base = dict(fontName="Helvetica", fontSize=9.0, leading=10.4, textColor=ink)
    styles = {
        "body": ParagraphStyle("Body", **base, spaceAfter=1.6),
        "bullet": ParagraphStyle("Bullet", **base, leftIndent=9, bulletIndent=0, spaceAfter=0.8),
        "name": ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=18.5, leading=20.5, textColor=ink, spaceAfter=2),
        "title": ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=10.4, leading=12.6, textColor=ink, spaceAfter=2.5),
        "contact": ParagraphStyle("Contact", **{**base, "fontSize": 8.6, "leading": 10.4}, spaceAfter=1.8),
        "section": ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=9.8, leading=11.4, textColor=ink, spaceBefore=3.6, spaceAfter=1.8, keepWithNext=True),
        "item": ParagraphStyle("Item", fontName="Helvetica-Bold", fontSize=9.0, leading=10.4, textColor=ink, spaceBefore=0.7, spaceAfter=0.7, keepWithNext=True),
    }
    story = [Paragraph(NAME, styles["name"]), Paragraph(escape(TITLE), styles["title"]), Paragraph(CONTACT, styles["contact"]), Paragraph(escape(INTRO), styles["body"])]
    html = [f"<h1>{NAME}</h1><p class='title'>{escape(TITLE)}</p><p class='contact'>{CONTACT}</p><p>{escape(INTRO)}</p>"]
    for heading, items in SECTIONS:
        story.append(Paragraph(escape(heading), styles["section"]))
        html.append(f"<section><h2>{escape(heading)}</h2>")
        for label, url, texts in items:
            label_html = escape(label)
            if url:
                label_html += f' | <a href="{escape(url, quote=True)}" color="#24557a"><u>View</u></a>'
            block = [Paragraph(label_html, styles["item"])] if label else []
            html.append("<article>" + (f"<h3>{label_html}</h3><ul>" if label else ""))
            for value in texts:
                block.append(Paragraph(escape(value), styles["bullet" if label else "body"], bulletText="-" if label else None))
                tag = "li" if label else "p"
                html.append(f"<{tag}>{escape(value)}</{tag}>")
            html.append(("</ul>" if label else "") + "</article>")
            story.append(KeepTogether(block))
        html.append("</section>")
    pdf = OUT / f"{STEM}.pdf"
    SimpleDocTemplate(str(pdf), pagesize=A4, leftMargin=28, rightMargin=28, topMargin=18, bottomMargin=18,
                       title=f"{NAME} | {TITLE}", author="Vo Ba Hoang Minh", pageCompression=1).build(story)

    css = ("@page{size:A4;margin:12mm 12.5mm}*{box-sizing:border-box}body{margin:0;background:#edf0f3;"
           "color:#202020;font:13px/1.24 Arial,Helvetica,sans-serif}main{max-width:794px;margin:24px auto;"
           "padding:40px 46px;background:white}h1{font-size:26px;line-height:1.15;margin:0 0 4px}"
           ".title{font-size:14.2px;font-weight:700;margin:0 0 5px}.contact{font-size:11.8px;line-height:1.26;"
           "margin-bottom:8px}h2{font-size:13px;margin:9px 0 4.5px;border-bottom:1px solid #202020;"
           "padding-bottom:1px}h3{font-size:13px;margin:3.5px 0}p{margin:0 0 3.5px}ul{padding-left:12px;"
           "margin:0}li{margin:0 0 3.5px}article{break-inside:avoid}a{color:#24557a;text-decoration:underline}"
           "a:focus-visible{outline:2px solid #24557a;outline-offset:3px}@media(max-width:600px){main{margin:0;"
           "padding:24px 20px}.contact{overflow-wrap:anywhere}}@media print{body{background:white;font-size:9.4pt}"
           "main{margin:0;padding:0}h1{font-size:19pt}.title{font-size:10.6pt}h2,h3{font-size:9.4pt}"
           ".contact{font-size:8.8pt}}")
    page = ("<!doctype html><html lang='en'><head><meta charset='utf-8'>"
            "<meta name='viewport' content='width=device-width,initial-scale=1'>"
            "<title>Vo Ba Hoang Minh | AI Resume</title><style>" + css + "</style></head><body><main>"
            + "".join(html) + "</main></body></html>")
    html_path = OUT / f"{STEM}.html"
    html_path.write_text(page, encoding="utf-8")

    reader = PdfReader(pdf)
    text = " ".join(" ".join(p.extract_text() or "" for p in reader.pages).split())
    npages = len(reader.pages)
    print(f"PAGES={npages}")
    assert all(" ".join(t.split()) in text for t in all_texts), "Content lost in PDF"
    expected = {PORTFOLIO, REPORT, PR, "https://github.com/anhminhzui-dev", "mailto:minhhoang250803@gmail.com", "tel:+84902391936"} | {url for _, items in SECTIONS for _, url, _ in items if url}
    links = {a.get_object().get("/A", {}).get("/URI") for p in reader.pages for a in p.get("/Annots", []) or []}
    assert expected <= links, f"Lost clickable proof: {expected - links}"
    assert not any("127.0.0.1" in str(link) or "localhost" in str(link) for link in links)
    print(f"BUILD_OK pdf={pdf} html={html_path} pages={npages} words={len(text.split())} links={len(expected)}")


if __name__ == "__main__":
    build()
