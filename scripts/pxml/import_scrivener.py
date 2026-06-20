#!/usr/bin/env python3
"""
import_scrivener.py - convert a Scrivener "Compile" plain/MMD export
into PXML-v2 (and/or the .poem surface).

Observed DharmaMist_1111 format:

  Title: DharmaMist_1111
  Author: Per Bergman
  ## 001 03/24 20:20 Greyhound/Good Morning ... 2015/1 ##
  <body lines...>
  ----
  ## 002 03/24 20:36 in the Fog 2015/2 ##
  <body...>
  ----

Header line grammar (between ## ... ##):
  <seq> <MM/DD> <HH:MM> <title...> <YYYY/idx>
  - seq:   zero-padded sequence number
  - MM/DD: month/day (year unknown here; taken from the YYYY/idx tail)
  - HH:MM: time of writing
  - title: free text (may itself contain '/')
  - YYYY/idx: year and per-year index, trailing token

Structural conventions carried into PXML-v2:
  - '----' (4+ dashes) alone on a line  -> poem boundary (separator)
  - '---'  (exactly 3 dashes) alone     -> <break type="section"/> inside a poem
  - blank line                          -> stanza boundary
  - '/' within a line                   -> caesura; preserved verbatim,
                                           and also marked structurally
  - a poem whose body has no newlines   -> a single prose line, verbatim
"""

import sys
import re
import html
from datetime import datetime

HEADER_RE = re.compile(r'^\s*##\s*(.*?)\s*##\s*$')
# seq, MM/DD, HH:MM, <title>, YYYY/idx   (title is greedy-minus-tail)
INNER_RE = re.compile(
    r'^(?P<seq>\d+)\s+'
    r'(?P<md>\d{1,2}/\d{1,2})\s+'
    r'(?P<time>\d{1,2}:\d{2})\s+'
    r'(?P<title>.*?)'
    # The trailing "YYYY/idx" is not always present in a compile; make it
    # optional so seq/date/time/title still parse. The year is back-filled
    # from the collection's dominant year in to_pxml().
    r'(?:\s+(?P<year>\d{4})/(?P<idx>\d+))?\s*$'
)

# MultiMarkdown link reference definition:  [label]: url
REFDEF_RE = re.compile(r'^\[([^\]]+)\]:\s*(\S+)\s*$')
# A line that is solely an image:  ![alt](src) | ![alt][ref] | ![ref]
IMAGE_RE = re.compile(r'^!\[([^\]]*)\](?:\(([^)]+)\)|\[([^\]]*)\])?\s*$')
# A "# YYYY #" group header (the Scrivener year-folder name) — the explicit
# collection year, applied to poems whose own header omits the YYYY/idx tail.
YEAR_RE = re.compile(r'^#\s*(\d{4})\s*#\s*$')


def esc(s):
    return html.escape(s, quote=False)


def slugify(title, seq):
    base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    base = base[:40].rstrip('-') or "poem"
    return f"{base}-{seq}" if seq else base


def parse(text):
    lines = text.replace('\r\n', '\n').replace('\r', '\n').split('\n')

    collection = None
    author = None
    poems = []          # list of dicts
    cur = None
    body = []

    def flush():
        nonlocal cur, body
        if cur is not None:
            # trim leading/trailing blank lines
            while body and body[0].strip() == "":
                body.pop(0)
            while body and body[-1].strip() == "":
                body.pop()
            cur["body"] = body
            poems.append(cur)
        cur = None
        body = []

    for ln in lines:
        if cur is None and ln.startswith("Title:"):
            collection = ln.split(":", 1)[1].strip()
            continue
        if cur is None and ln.startswith("Author:"):
            author = ln.split(":", 1)[1].strip()
            continue

        m = HEADER_RE.match(ln)
        if m:
            flush()
            inner = m.group(1)
            im = INNER_RE.match(inner)
            if im:
                cur = {
                    "seq": im.group("seq"),
                    "md": im.group("md"),
                    "time": im.group("time"),
                    "title": im.group("title"),
                    "year": im.group("year") or "",
                    "idx": im.group("idx") or "",
                    "raw": inner,
                }
            else:
                # header that doesn't match the rich grammar: keep raw title
                cur = {"seq": "", "md": "", "time": "", "title": inner,
                       "year": "", "idx": "", "raw": inner}
            continue

        if re.match(r'^-{4,}\s*$', ln):   # poem separator
            flush()
            continue

        if cur is not None:
            body.append(ln)

    flush()
    return collection, author, poems


def iso_date(year, md):
    if not (year and md):
        return ""
    try:
        mm, dd = md.split("/")
        return f"{year}-{int(mm):02d}-{int(dd):02d}"
    except Exception:
        return ""


def extract_refs(text):
    """Pull MultiMarkdown link reference definitions ([label]: url) out of the
    text so they are not treated as verse; return (refs, cleaned_text)."""
    refs = {}
    kept = []
    for ln in text.replace('\r\n', '\n').replace('\r', '\n').split('\n'):
        m = REFDEF_RE.match(ln)
        if m:
            refs[m.group(1).strip().lower()] = m.group(2)
        else:
            kept.append(ln)
    return refs, "\n".join(kept)


def line_to_xml(raw, refs):
    content = raw.rstrip()
    if re.match(r'^-{3}\s*$', content):
        return ('break', None)
    im = IMAGE_RE.match(content)
    if im:
        alt = im.group(1)
        src = im.group(2)               # inline ![alt](src)
        if src is None:                 # reference ![alt][ref] or shortcut ![ref]
            label = (im.group(3) or im.group(1)).strip().lower()
            src = refs.get(label, "")
        if src:
            a = f' alt="{esc(alt)}"' if alt else ""
            return ('image', f'<image src="{esc(src)}"{a}/>')
    role = ' role="turn"' if content.startswith("- ") else ""
    # caesura: a line containing '/' as an internal prosodic mark.
    # Preserve verbatim text; also expose count for backends that want it.
    caes = content.count("/")
    attr = role
    if caes:
        attr += f' caesura="{caes}"'
    return ('line', f'<line{attr}>{esc(content)}</line>')


def emit_stanzas(body, refs):
    out, stanza = [], []

    def flush():
        if stanza:
            inner = "\n".join("        " + s for s in stanza)
            out.append("      <stanza>\n" + inner + "\n      </stanza>")
            stanza.clear()

    for ln in body:
        if ln.strip() == "":
            flush()
            continue
        kind, payload = line_to_xml(ln, refs)
        if kind == 'break':
            flush()
            out.append('      <break type="section"/>')
        elif kind == 'image':
            flush()
            out.append('      ' + payload)
        else:
            stanza.append(payload)
    flush()
    return "\n".join(out)


def to_pxml(text, explicit_year=""):
    refs, text = extract_refs(text)
    collection, author, poems = parse(text)
    # Collection year priority: caller-supplied (e.g. from the folder name) >
    # a "# YYYY #" group header in the compile > the dominant per-poem year.
    # Back-fill it into poems whose header lacked the "YYYY/idx" tail.
    if not explicit_year:
        for ln in text.split('\n'):
            m = YEAR_RE.match(ln.strip())
            if m:
                explicit_year = m.group(1)
                break
    years = [p["year"] for p in poems if p["year"]]
    default_year = explicit_year or (
        max(set(years), key=years.count) if years else ""
    )
    for p in poems:
        if not p["year"]:
            p["year"] = default_year
    dates = [iso_date(p["year"], p["md"]) for p in poems if iso_date(p["year"], p["md"])]
    span = f"{min(dates)}..{max(dates)}" if dates else ""

    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<poetry>']
    out.append(f'  <about name="{esc(collection or "untitled")}" '
               f'date="{span}" uri="">')
    if author:
        out.append(f'    {esc(author)}')
    out.append('  </about>')

    for p in poems:
        date = iso_date(p["year"], p["md"])
        pid = slugify(p["title"], p["seq"])
        meta = (f' seq="{esc(p["seq"])}" date="{esc(date)}" '
                f'time="{esc(p["time"])}" year="{esc(p["year"])}" '
                f'index="{esc(p["idx"])}"')
        out.append('  <poems>' if False else '')  # placeholder removed below
    # rebuild cleanly with a single <poems> wrapper
    out = [l for l in out if l != '']
    out.append('  <poems>')
    for p in poems:
        date = iso_date(p["year"], p["md"])
        pid = slugify(p["title"], p["seq"])
        meta = (f' seq="{esc(p["seq"])}" date="{esc(date)}"'
                f' time="{esc(p["time"])}" year="{esc(p["year"])}"'
                f' index="{esc(p["idx"])}"')
        out.append(f'    <poem name="{esc(p["title"])}" id="{pid}"{meta} '
                   f'xml:space="preserve">')
        out.append(emit_stanzas(p["body"], refs))
        out.append('    </poem>')
    out.append('  </poems>')
    out.append('</poetry>')
    return "\n".join(out), poems


if __name__ == "__main__":
    # Optional --year YYYY / --year=YYYY (e.g. derived from the collection folder
    # name) sets the authoritative collection year; remaining arg is the file.
    args = sys.argv[1:]
    year = ""
    files = []
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--year" and i + 1 < len(args):
            year = args[i + 1]
            i += 2
        elif a.startswith("--year="):
            year = a.split("=", 1)[1]
            i += 1
        else:
            files.append(a)
            i += 1
    src = sys.stdin.read() if not files else open(files[0]).read()
    xml, poems = to_pxml(src, year)
    sys.stdout.write(xml + "\n")
    sys.stderr.write(f"[imported {len(poems)} poems]\n")
