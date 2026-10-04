#!/usr/bin/env python3
"""Regenerate the Whispering Lore project report.

Produces WHISPERING-LORE-REPORT.pdf (10 pages, ~11 charts) at the repo root.
Data comes live from the git log and the datasets; a few curated totals
are embedded and updated alongside the corpus.

Usage:
    python3 archive/scripts/generate-report.py

Dependencies (matplotlib + reportlab) are auto-bootstrapped into a private
venv under $TMPDIR the first time — the system Python is used if it already
has both libraries.
"""
import os
import struct
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_PDF = os.path.join(ROOT, "WHISPERING-LORE-REPORT.pdf")

# private matplotlib cache: a shared/user cache can be poisoned by stale
# font-cache locks (e.g. after SIGKILL), which makes `import matplotlib`
# block forever in a fresh process
os.environ["MPLCONFIGDIR"] = os.path.join(tempfile.gettempdir(), "wl-mplconfig")


def importable(py):
    try:
        subprocess.run([py, "-c", "import matplotlib, reportlab"],
                       check=True, capture_output=True, timeout=90)
        return True
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return False


def resolve_python():
    # the running interpreter first: when the re-exec'd venv re-enters here,
    # it must recognise itself and stop (its sys.executable string points at
    # /private/tmp/wl-venv/... while the candidate path is /tmp/wl-venv/...,
    # so a naive string comparison would cascade forever)
    if importable(sys.executable):
        return sys.executable
    candidates = [
        os.environ.get("WL_REPORT_VENV"),
        "/tmp/wl-venv",
        os.path.join(tempfile.gettempdir(), "wl-report-venv"),
    ]
    for venv in candidates:
        if not venv:
            continue
        py = os.path.join(venv, "bin", "python")
        if os.path.exists(py) and importable(py):
            return py
    venv = os.path.join(tempfile.gettempdir(), "wl-report-venv")
    subprocess.run([sys.executable, "-m", "venv", venv], check=True)
    py = os.path.join(venv, "bin", "python")
    subprocess.run([py, "-m", "pip", "-q", "install", "matplotlib", "reportlab"],
                   check=True)
    return py


if __name__ == "__main__":
    py = resolve_python()
    if py != sys.executable:
        sys.exit(subprocess.call([py, os.path.abspath(__file__)] + sys.argv[1:]))

    # ---- chart + PDF generation runs below, in the resolved interpreter ----
    import matplotlib
    matplotlib.use("Agg")
    import numpy as np
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image,
        NextPageTemplate, PageBreak,
    )
    from reportlab.platypus.frames import Frame
    from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate

    ART = os.path.join(tempfile.gettempdir(), "wl-report-art")
    os.makedirs(ART, exist_ok=True)
    GIT = ["git", "-C", ROOT]

    # ---------------------------------------------------------------- charts
    BG = "#101010"
    BONE = "#D6D3C8"
    MUTED = "#A8A29E"
    CRIMSON = "#E05C5C"
    BORDER = "#292524"
    import matplotlib.pyplot as plt
    plt.rcParams.update({
        "figure.facecolor": BG, "axes.facecolor": BG,
        "savefig.facecolor": BG, "savefig.edgecolor": BG,
        "text.color": BONE, "axes.edgecolor": BORDER,
        "axes.labelcolor": MUTED, "xtick.color": MUTED,
        "ytick.color": MUTED, "axes.grid": True,
        "grid.color": BORDER, "grid.linewidth": 0.6,
        "font.family": "DejaVu Sans", "font.size": 10,
    })

    def bar(png, labels, vals, title, color=CRIMSON, fmt="{:,}", h=False):
        fig, ax = plt.subplots(figsize=(9.6, 4.6), dpi=150)
        if h:
            ax.barh(labels, vals, color=color, height=0.62)
            for b, v in zip(ax.patches, vals):
                ax.text(v + max(vals) * 0.01, b.get_y() + b.get_height() / 2,
                        fmt.format(v), va="center", fontsize=8.5, color=MUTED)
            ax.set_ylim(-0.6, len(labels) - 0.4)
        else:
            ax.bar(labels, vals, color=color, width=0.62)
            for b, v in zip(ax.patches, vals):
                ax.text(b.get_x() + b.get_width() / 2, v + max(vals) * 0.01,
                        fmt.format(v), ha="center", fontsize=8.5, color=MUTED)
            ax.tick_params(axis="x", rotation=28)
        ax.set_title(title, color=BONE, fontsize=13, pad=10, fontweight="bold")
        for s in ["top", "right"]:
            ax.spines[s].set_visible(False)
        fig.tight_layout()
        fig.savefig(os.path.join(ART, png), bbox_inches="tight")
        plt.close(fig)

    def donut(png, labels, vals, title):
        fig, ax = plt.subplots(figsize=(5.2, 4.6), dpi=150)
        colors = ["#E05C5C", "#B4534A", "#7F4A43", "#5A3B37"]
        wedges, _ = ax.pie(vals, colors=colors[:len(vals)], startangle=90,
                           counterclock=False,
                           wedgeprops=dict(width=0.42, edgecolor=BG))
        total = sum(vals)
        ax.text(0, 0, f"{total:,}", ha="center", va="center",
                fontsize=22, color=BONE, fontweight="bold")
        ax.legend(wedges, [f"{lab} — {v:,}" for lab, v in zip(labels, vals)],
                  loc="lower center", bbox_to_anchor=(0.5, -0.28), ncol=1,
                  frameon=False, fontsize=8, labelcolor=MUTED)
        ax.set_title(title, color=BONE, fontsize=13, pad=8, fontweight="bold")
        fig.tight_layout()
        fig.savefig(os.path.join(ART, png), bbox_inches="tight")
        plt.close(fig)

    months = {}
    for line in subprocess.run(
            GIT + ["log", "--format=%ad", "--date=format:%Y-%m"],
            capture_output=True, text=True, check=True).stdout.splitlines():
        months[line] = months.get(line, 0) + 1
    bar("commits.png", list(months), list(months.values()),
        "Git Commits by Month 2026")

    days = {}
    for line in subprocess.run(
            GIT + ["log", "--format=%ad", "--date=format:%m-%d"],
            capture_output=True, text=True, check=True).stdout.splitlines():
        days[line] = days.get(line, 0) + 1
    keys = sorted(days)
    fig, ax = plt.subplots(figsize=(9.6, 4.2), dpi=150)
    ax.bar(keys, [days[k] for k in keys], color=CRIMSON, width=0.75)
    ax.set_title("Commits per Day (Jul 16 – Sep 22)", color=BONE, fontsize=13,
                 pad=10, fontweight="bold")
    ax.tick_params(axis="x", labelsize=7)
    for s in ["top", "right"]:
        ax.spines[s].set_visible(False)
    for i in range(0, len(keys), 12):
        ax.axvline(i - 0.5, color=BORDER, lw=0.8, alpha=0.5)
    fig.tight_layout()
    fig.savefig(os.path.join(ART, "commits-daily.png"), bbox_inches="tight")
    plt.close(fig)

    bar("creatures-region.png",
        ["North America", "Nordic", "West Africa", "SE Asia", "South America",
         "Pacific", "Central Asia", "Mesoamerica", "East Africa", "South Asia",
         "Slavic", "Europe"],
        [942, 316, 225, 216, 200, 180, 159, 145, 143, 116, 111, 100],
        "Creatures by Region (top 12)", h=True)
    bar("creatures-type.png",
        ["spirit", "deity", "nature-spirit", "ghost", "water-spirit",
         "trickster", "guardian", "animal-spirit", "giant", "monster", "demon",
         "ancestor-spirit"],
        [800, 362, 202, 181, 180, 148, 141, 127, 125, 119, 109, 99],
        "Creatures by Canonical Type (top 12)", h=True)
    donut("source-type.png",
          ["oral_tradition", "literary", "archaeological", "secondary_scholarly"],
          [3263, 466, 6, 1], "Creature Source Type")
    bar("source-quality.png",
        ["good", "fair", "expert", "well-documented", "verified", "researched",
         "academic", "documented", "primary"],
        [1452, 1150, 529, 206, 119, 106, 100, 69, 5],
        "Creature Source Quality Grading", h=True)
    bar("stories-type.png",
        ["legend", "myth", "folktale", "fairy-tale", "folklore", "epic",
         "supernatural", "ritual", "romance", "saga", "deity", "ballad",
         "fable"],
        [744, 585, 270, 208, 203, 73, 56, 12, 12, 10, 5, 4, 3],
        "Stories by Type", h=True)
    bar("stories-period.png",
        ["ancient", "medieval", "19th century", "colonial era", "modern",
         "other"],
        [1368, 246, 239, 215, 94, 23], "Stories by Historical Period", h=True)
    bar("top-countries.png",
        ["United States", "Canada", "Norway", "Sweden", "Mexico", "Iceland",
         "Russia", "Denmark", "Nigeria", "India", "Japan", "Mali"],
        [676, 254, 139, 88, 84, 81, 73, 68, 59, 51, 50, 48],
        "Creatures by Country (top 12)", h=True)

    langs = ["sv", "no", "es"]
    cre = [440, 314, 523]
    ite = [349, 82, 76]
    sto = [123, 66, 144]
    fig, ax = plt.subplots(figsize=(9.6, 4.4), dpi=150)
    x = np.arange(len(langs))
    ax.bar(x - 0.25, cre, 0.25, label="Creatures", color="#E05C5C")
    ax.bar(x, ite, 0.25, label="Items", color="#B4534A")
    ax.bar(x + 0.25, sto, 0.25, label="Stories", color="#7F4A43")
    for xi, c, i, s in zip(x, cre, ite, sto):
        ax.text(xi - 0.25, c + 10, f"{c}", ha="center", fontsize=8.5,
                color=MUTED)
        ax.text(xi, i + 10, f"{i}", ha="center", fontsize=8.5, color=MUTED)
        ax.text(xi + 0.25, s + 10, f"{s}", ha="center", fontsize=8.5,
                color=MUTED)
    total = [sum(v) for v in zip(cre, ite, sto)]
    for xi, t in zip(x, total):
        ax.text(xi, max(total) * 1.05, f"Total {t:,}", ha="center",
                fontsize=9, color=BONE, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels([{"sv": "Swedish", "no": "Norwegian",
                         "es": "Spanish"}[l] + f"  ({l})" for l in langs])
    ax.legend(frameon=False, fontsize=9, labelcolor=MUTED, loc="upper left")
    ax.set_title("Native-Mode Translation Overlays (entries)", color=BONE,
                 fontsize=13, pad=10, fontweight="bold")
    for s in ["top", "right"]:
        ax.spines[s].set_visible(False)
    ax.set_ylim(0, max(total) * 1.28)
    fig.tight_layout()
    fig.savefig(os.path.join(ART, "i18n.png"), bbox_inches="tight")
    plt.close(fig)

    bar("footprint.png",
        ["data", "deploy", "archive", "creature pages", "node_modules",
         "story pages", "docs+tests+js", "item pages"],
        [96, 87, 16, 14, 12, 8.5, 2.2, 2.5],
        "Working-Tree Size by Directory (MB)", h=True)
    bar("quiz-level.png",
        ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"],
        [271, 136, 137, 129, 137, 268],
        "Quiz Question Files by Difficulty", h=True)

    # ---------------------------------------------------------------- styles
    ASH = HexColor("#1C1917")
    BLACK = HexColor("#0D0D0D")
    BLACK2 = HexColor("#050505")
    LIGHT = HexColor("#D6D3C8")
    GREY = HexColor("#6B6B66")
    RED_LINE = HexColor("#292524")

    ss = getSampleStyleSheet()
    H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                        fontSize=17, textColor=HexColor("#991B1B"),
                        spaceAfter=4, spaceBefore=6)
    H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                        fontSize=12.5, textColor=BLACK, spaceAfter=4,
                        spaceBefore=8)
    BODY = ParagraphStyle("BODY", parent=ss["BodyText"],
                          fontName="Helvetica", fontSize=9.3, leading=12.6,
                          textColor=BLACK, alignment=TA_LEFT)
    BUL = ParagraphStyle("BUL", parent=BODY, leftIndent=10, bulletIndent=2,
                         spaceAfter=2)
    SMALL = ParagraphStyle("SMALL", parent=BODY, fontSize=7.8, leading=10,
                           textColor=GREY)
    CAP = ParagraphStyle("CAP", parent=BODY, fontSize=8, textColor=GREY,
                         alignment=TA_CENTER, spaceBefore=2)

    def P(t, s=BODY):
        return Paragraph(t, s)

    def cell(t, style=BODY):
        return Paragraph(t, style)

    def table(headers, rows, widths=None):
        th = ParagraphStyle("th", parent=BODY, fontName="Helvetica-Bold",
                            textColor=LIGHT)
        data = [[cell(h, th) for h in headers]]
        data += [[cell(str(c)) for c in r] for r in rows]
        t = Table(data, colWidths=widths, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#991B1B")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [ASH, HexColor("#151311")]),
            ("GRID", (0, 0), (-1, -1), 0.5, RED_LINE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        return t

    paras = []

    def section(title):
        paras.append(Paragraph(title, H1))
        paras.append(Spacer(1, 3))

    def sub(title):
        paras.append(Paragraph(title, H2))

    def bullets(items):
        for it in items:
            paras.append(Paragraph(f"&bull; {it}", BUL))

    def png_size(p):
        with open(p, "rb") as f:
            f.read(16)
            w, h = struct.unpack(">II", f.read(8))
        return w, h

    def chart(name, cap, width=None):
        p = os.path.join(ART, name)
        pw, ph = png_size(p)
        width = width or (178 * mm if pw / ph > 1.6 else 104 * mm)
        paras.append(Image(p, width=width, height=width * ph / pw))
        paras.append(Paragraph(cap, CAP))
        paras.append(Spacer(1, 4))

    # ------------------------------------------------------------- cover PDF
    def page_canvas(c, d):
        if d.page == 1:
            c.setFillColor(BLACK2)
            c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
            c.setStrokeColor(HexColor("#991B1B"))
            c.setLineWidth(1.2)
            c.line(28 * mm, 200 * mm, A4[0] - 28 * mm, 200 * mm)
            c.setFillColor(LIGHT)
            c.setFont("Helvetica-Bold", 30)
            c.drawString(28 * mm, 235 * mm, "WHISPERING LORE")
            c.setFont("Helvetica", 16)
            c.setFillColor(HexColor("#A8A29E"))
            c.drawString(28 * mm, 220 * mm, "Project Report & Analytics")
            c.setFont("Helvetica", 10)
            c.setFillColor(GREY)
            c.drawString(28 * mm, 115 * mm,
                         "A digital compendium of world mythology and folklore")
            c.drawString(28 * mm, 107 * mm,
                         "static site · offline-first · i18n · SEO · tested")
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(LIGHT)
            c.drawString(28 * mm, 60 * mm, "Generated automatically")
            c.drawString(28 * mm, 52 * mm,
                         "whisperinglore.com · archive/scripts/generate-report.py")
            c.setFillColor(HexColor("#991B1B"))
            c.rect(28 * mm, 30 * mm, 30 * mm, 1.5 * mm, fill=1, stroke=0)
            return
        c.setFillColor(BLACK)
        c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        c.setStrokeColor(RED_LINE)
        c.setLineWidth(0.5)
        c.line(15 * mm, 12 * mm, A4[0] - 15 * mm, 12 * mm)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(GREY)
        c.drawString(16 * mm, 8.5 * mm, "Whispering Lore — Project Report")
        c.drawRightString(A4[0] - 16 * mm, 8.5 * mm, f"Page {d.page - 1}")

    doc = BaseDocTemplate(OUT_PDF, pagesize=A4, leftMargin=16 * mm,
                          rightMargin=16 * mm, topMargin=14 * mm,
                          bottomMargin=16 * mm)
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[Frame(0, 0, A4[0], A4[1])],
                     onPage=page_canvas),
        PageTemplate(id="body",
                     frames=[Frame(16 * mm, 16 * mm, A4[0] - 32 * mm,
                                   A4[1] - 30 * mm)], onPage=page_canvas),
    ])

    # ------------------------------------------------------------- content
    section("Executive Summary")
    paras.append(P(
        "Whispering Lore is a static, offline-first web encyclopedia of global folklore "
        "and mythology. It ships a curated, research-graded collection of mythical creatures, folklore "
        "stories and legendary artifacts — every entry carrying structured metadata (source grade, region, "
        "country, period, themes), bilingual translation overlays, and deep-linkable SEO pages. The site is "
        "pure static HTML/CSS/JS with no build step, deployed to Netlify, and quality-gated by Jest, "
        "ESLint, and a zero-violation axe accessibility suite.",))
    paras.append(Spacer(1, 4))
    paras.append(table(
        ["Metric", "Value", "Metric", "Value"],
        [["Creatures", "3,736 (dataset) / 3,700 SEO pages", "Countries covered", "218"],
         ["Stories", "2,185 (full text 2,185/2,185)", "Cross-references", "35,457 (0 broken)"],
         ["Legendary items", "641", "Regions (creatures)", "42"],
         ["Quiz questions", "1,071 × 10 variants, 6 levels", "Git commits", "376 (Jul–Sep 2026)"],
         ["Native UI translations", "sv · no · es", "GT toggle languages", "45"],
         ["Jest unit tests", "23 suites", "Playwright e2e", "~472 (chromium) + 80 cross-device"],
         ["ESLint", "0 errors", "Zenodo DOI", "10.5281/zenodo.21941501"]],
        widths=[40 * mm, 58 * mm, 40 * mm, 42 * mm]))
    paras.append(Spacer(1, 6))

    section("History at a Glance")
    paras.append(table(
        ["Phase", "Date", "What shipped"],
        [["v1.0 launch", "Jul 16, 2026", "Encyclopedia with 3,668 creatures + 1,719 stories; launch-day fixes"],
         ["v1.1–v1.2", "Jul–Aug 2026", "Items & artifacts, quiz 1,071 Q ×10 variants, My Lore archive, TTS narration"],
         ["v1.3.0 / Zenodo", "Aug 17, 2026", "Search page + a11y era; DOI published; marketing & PR kit"],
         ["i18n Phase 1–2", "Aug 22–Sep 13", "Google Translate toggle (45 lang), Swedish/Norwegian/Spanish native modes"],
         ["Perf sprint", "Sep 2026", "Slim index cold-paths; LCP 34s → 2.8s; Lighthouse perf 0.64 → 0.91"],
         ["Deep research", "Sep 18–22, 2026", "35 authored folklore entries (Perchta, Ciguapa, Nokken, Yowie, …)"],
         ["Latest", "Sep 2026", "Mythology blog, command palette, offline shard caching, source-quality validation"]],
        widths=[34 * mm, 26 * mm, 120 * mm]))
    paras.append(Spacer(1, 6))
    chart("commits.png", "Commit volume by month across Jul, Aug, Sep 2026.")

    section("Creature Database")
    paras.append(P(
        "The creature corpus is the core dataset — 3,736 records, exposed through 42 region shards and a "
        "2.4 MB slim index for the bestiary grid. Every record carries 40+ fields: aliases, appearance, "
        "habitat, behavior tags, motifs, cultural significance, source type and quality grade, "
        "living-tradition flag, and cross-references into stories and items."))
    paras.append(Spacer(1, 4))
    chart("creatures-region.png",
          "Creature distribution by folklore region — North America leads with 942 entries.")
    chart("creatures-type.png",
          "Canonical creature types — spirits (800) and deities (362) are the largest families.")
    paras.append(Spacer(1, 3))
    sub("Source provenance & grading")
    paras.append(P(
        "Every creature is classified by source_type (oral tradition vs literary vs archaeological) and "
        "graded for source_quality. 3,684 upgrade records were applied across 43 batches to reach "
        "100% Stage 3+ coverage."))
    chart("source-type.png", "81% of creatures trace to oral tradition; 12% literary.")
    chart("source-quality.png",
          "Quality grading distribution — 3,736 grade labels across the corpus.")
    paras.append(Spacer(1, 3))
    chart("top-countries.png", "Top creature-producing countries.")

    section("Folklore Stories & Items")
    paras.append(P(
        "2,185 stories — every one with full text, moral, period, themes and source. 13 canonical story "
        "types. 1,928 stories feature creature cross-references; the search index records 4.25 MB of "
        "creature→story mappings for instant related-content resolution."))
    chart("stories-type.png", "Legend (744) and myth (585) dominate the story corpus.")
    chart("stories-period.png",
          "Most tales are classified ancient-era (63%); medieval, 19th-century and colonial blocks follow.")
    paras.append(Spacer(1, 4))
    sub("Legendary Items")
    paras.append(P(
        "641 artifacts (from Mjölnir to Excalibur) with maker, material, era, powers, associated creatures "
        "and regional tags, served through a 687 KB slim index. 82 Nordic artifacts ship full Swedish and "
        "Norwegian translations."))

    section("Localization (i18n)")
    paras.append(P(
        "Three native modes route real translations by browser language: Swedish, Norwegian and Spanish. "
        "A Google-Translate toggle covers 45 further languages with graceful fallback. Translations are "
        "stored as region-keyed shard overlays and merged at runtime by the Shimmer loader — covered "
        "slivers show badge-free entries, uncovered ones fall back to English automatically."))
    chart("i18n.png",
          "Native translation overlay entries by language and content type (2,117 entries total).")
    paras.append(table(
        ["Language", "Creatures", "Items", "Stories", "UI chrome dict"],
        [["Swedish (sv)", "440 (440 complete)", "349 (349)", "123 (49)", "~230 keys, exact parity"],
         ["Norwegian (no)", "314 (314)", "82 (82)", "66 (10)", "—"],
         ["Spanish (es)", "523 (523)", "76 (76)", "144 (summary)", "226/226 keys"]],
        widths=[32 * mm, 44 * mm, 32 * mm, 40 * mm, 32 * mm]))
    paras.append(Spacer(1, 6))
    paras.append(P(
        "Overlay keys in the shard manifest: sv 21 · es 12 · no 3. hreflang alternates on all 11 pages. "
        "The Spanish overlay pipeline runs 24 parallel subagents per region chunked in ~25-entry batches, "
        "gated by slug parity, length, Cyrillic and doubled-word scans."))

    section("Platform Architecture")
    paras.append(P("Vanilla JavaScript, no framework, no build step. Served statically from Netlify."))
    bullets([
        "Shimmer shard loader — manifest-driven lazy loading of 42 creature region shards + story/item shards, with IndexedDB caching and XHR fallback.",
        "Slim index cold paths — grid/facets/search read precomputed indices (creatures 2.4 MB, stories 1.74 MB, items 687 KB, search 4.25 MB); full objects load on demand.",
        "Service worker — precaches 30+ core assets, trims runtime cache, serves 404.html for failed navigations.",
        "Offline-first — runtime cache widened to 250 entries + precached search index; full corpus searchable offline.",
        "No inline scripts — static HTML; JSON-LD (WebSite, SearchAction, FAQPage, CreativeWork per entity) injected at runtime.",
        "Text-to-Speech — Web Speech API narration on creature/story/item detail overlays.",
        "Related content — 35,457 bidirectional cross-reference links, audited at 0 broken.",
    ])

    sub("JavaScript modules (8,947 lines, 20 files)")
    rows = []
    for line in """shared-utils.js,1297,DOM helpers · slug utils · debounce · Shimmer · renderSources
i18n.js,1014,Chrome translation dictionary + data-i18n sweep
world-viewer.js,821,World page country list + region highlighting
creatures-viewer.js,817,Bestiary grid/facets/sort/detail overlay
stories-viewer.js,700,Stories grid/facets/sort/detail overlay
globe.js,682,Three.js interactive globe
items-viewer.js,616,Items grid + detail overlay + TTS
language-toggle.js,428,i18n UI toggle (native + Google Translate menu)
main.js,426,Shared entry — nav, scroll, theme, particles, daily feature
viewer-base.js,402,Shared viewer logic (sort/filter/pagination/narration)
translate.js,371,Gemini translate bridge, chunking, persistence
quiz.js,367,Examination engine (1,071 Q × 10 variants, 6 levels)
search-viewer.js,285,Full-text search across all datasets
daily-feature.js,175,Deterministic daily creature/story pick
mylore.js,166,Personal archive (favourites/bookmarks/export-import)
citations.js,139,Citation export
rune-scatter.js,126,Hero rune canvas animation
seo-entity.js,59,Runtime JSON-LD injection
region-glyphs.js,35,Region-themed SVG glyphs
theme-toggle.js,21,Light/dark toggle""".splitlines():
        f, l, d = line.split(",", 2)
        rows.append([f, l, d])
    paras.append(table(["File", "Lines", "Responsibility"], rows,
                       widths=[42 * mm, 14 * mm, 124 * mm]))
    paras.append(Spacer(1, 6))
    chart("footprint.png",
          "Working-tree footprint by directory (data/ 96 MB, deploy zips 87 MB, generated SEO pages 25 MB).")

    section("Performance & SEO")
    paras.append(P(
        "The September performance sprint removed the homepage's duplicate 34 MB shard corpus download: "
        "in-flight request coalescing, precomputed latest.json/daily.json feeds, and slim-index cold paths."))
    paras.append(table(
        ["Page", "Lighthouse perf before", "After", "LCP before → after"],
        [["Home (/)", "0.64", "0.91", "34.0 s → 2.8 s"],
         ["Bestiary", "0.71", "0.89", "33.9 s → 3.0 s"]],
        widths=[30 * mm, 40 * mm, 30 * mm, 40 * mm]))
    paras.append(Spacer(1, 6))
    bullets([
        "SEO: 6,536-URL sitemap generated by seo-build.py prerender; canonical + hreflang on every page; per-entity CreativeWork JSON-LD; SearchAction targets search.html?q=.",
        "Robots: noindex,follow on 404/search/quiz/mylore; sitemap + OG images everywhere.",
        "CI: GitHub Actions runs lint, Jest, Playwright e2e, an automated SEO-prerender/schema check and a Lighthouse CI job.",
    ])

    section("Testing & Quality Gates")
    bullets([
        "Jest — 778/778 passing across 23 suites (viewers, shimmer, i18n dict/badge/native, quiz pool, index parity, sitemap, secret-scan, geo-validation, normalize-type, source-quality).",
        "Cross-device e2e — 80 tests across 8 viewports (320–1920 px) × 7 pages: layout, overflow, hero/overlap, nav, brand, zero JS errors.",
        "Full e2e — ~472/472 chromium in ~7 min: navigation, filters, detail overlays, quiz flows, globe, axe accessibility gate (24 scans, zero violations), Ko-fi widget mocked.",
        "ESLint 0 errors · Prettier · secret-scan guard (no tracked .env / API keys).",
        "Index parity gates ensure generated indices match dataset masters; validation gates enforce slug parity, translation length and no Cyrillic-homoglyph import.",
    ])

    section("Repository & Git History")
    paras.append(P(
        "376 commits (all Mats Olsson) on main, July 16 – September 22, 2026 — all pushed to origin. "
        "Tags: folklore, v1.0.0, v1.1.0, v1.2.0, v1.3.0."))
    chart("commits-daily.png", "Per-day commit activity — the final deep-research sprint dominates late September.")

    section("Roadmap & Backlog")
    bullets([
        "Story database deep research (themes, morals, transmission-period terms) — plan written Sep 19.",
        "Progressive per-shard grid loading for bestiary (deferred until numbers matter).",
        "Illustrations, community submissions, recorded narrations, further multilingual coverage.",
    ])

    section("Deployment")
    bullets([
        "Netlify static deploy via netlify.toml; build-deploy.sh runs seo-build.py prerender then zips.",
        "Deploy artifacts: deploy/whispering_lore-netlify_deploy-2026-09-{14,19,22}.zip (~30 MB, ~14.6 k files each).",
        "Local dev: python3 -m http.server 3000; threaded server for Playwright load.",
    ])

    section("Design System — Bone & Ash")

    def swatch(name, hexv):
        t = Table([[Paragraph(
            f'<font color="#D6D3C8">{name}</font><br/><font size=7 color="#6B6B66">{hexv}</font>',
            ParagraphStyle("sw", parent=BODY, alignment=TA_CENTER))]],
            colWidths=[44 * mm], rowHeights=[13 * mm])
        t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), HexColor(hexv)),
                               ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                               ("BOX", (0, 0), (-1, -1), 0.5, RED_LINE)]))
        return t

    sw = Table([[swatch("bg-deep · Charcoal", "#0D0D0D"), swatch("bg-card · Ash", "#1C1917")],
                [swatch("bg-dark", "#050505"), swatch("text-primary · Bone", "#D6D3C8")],
                [swatch("text-secondary", "#A8A29E"), swatch("accent · Crimson", "#991B1B")],
                [swatch("accent-strong", "#E05C5C"), swatch("border", "#292524")]],
               colWidths=[44 * mm] * 2)
    sw.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                            ("TOPPADDING", (0, 0), (-1, -1), 0),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    paras.append(sw)
    paras.append(Spacer(1, 8))
    bullets([
        "Typography: Cinzel (display) for headings · Lora for body.",
        "Hero: 5-step even gradient with a 28-symbol rune scatter (Norse/Celtic/Greek/Egyptian) at 4–16% opacity, per-session random subset.",
        "Stats bar: 3,700 creatures · 2,185 stories · 212 countries; daily feature pill; ghost buttons.",
        "Accessibility: accent-strong #E05C5C reaches 4.5:1 on all surfaces; focus outlines, skip-links, ARIA labels, keyboard navigable i18n menu.",
        "Iconography: inline Phosphor icons (CDN removed — −648 KB).",
        "12 pages share css/styles.css (85 KB): index, bestiary, stories, items, search, world, about, mylore, quiz, methodology, blog, 404.",
    ])

    section("Appendix — Reading List")
    bullets([
        "README.md — setup, features, data stats, testing instructions.",
        "BUILD.md — shard-data.mjs, the 4 index builders, build-deploy.sh and seo-build.py.",
        "DESIGN.md — the Bone & Ash design system.",
        "docs/DATABASE-GUIDE.md · docs/DEVELOPERS.md · docs/DEPLOYMENT.md",
        "docs/{creature,story,items}-schema.md — dataset schemas · docs/COVERAGE.md — coverage · docs/RESEARCH_*.md — research procedure.",
    ])

    paras.insert(0, NextPageTemplate("body"))
    paras.insert(1, PageBreak())
    doc.build(paras)

    print(f"PDF written: {OUT_PDF} "
          f"({os.path.getsize(OUT_PDF) / 1e6:.2f} MB)")