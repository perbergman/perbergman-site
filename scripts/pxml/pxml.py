#!/usr/bin/env python3
"""
pxml.py - parse the indentation-significant poetry surface into PXML v2.

Surface rules (all derived from layout; no quotes, no escaping):

  about <name> <date> <uri>      header; free text indented below
  keywords <free text...>        one line, or text indented below
  poem <name> #<id>              header; verse indented below
  %<form> <name> #<id>           directive header; runs a form macro

Inside a poem block:
  - blank line                   -> stanza boundary
  - a line that is only '---'    -> <break type="section"/>
  - a line beginning '- '        -> <line role="turn">  (dash kept)
  - everything else              -> <line> verbatim

Significant whitespace:
  The block's minimum indentation (the dedent baseline) is stripped.
  Any indentation BEYOND that baseline is preserved into the line as
  leading spaces (spatial offset). textwrap.dedent semantics.
"""

import sys
import re
from xml.sax.saxutils import escape

FORMS = {
    # form name -> (expected mora/syllable pattern or None, validator)
    "tanka": ([5, 7, 5, 7, 7], "mora"),
    "haiku": ([5, 7, 5], "mora"),
}


def split_blocks(text):
    """Yield (header_line, body_lines) top-level blocks.

    A block starts at a non-indented, non-blank line. Its body is the
    following lines that are blank or indented, up to the next header.
    """
    lines = text.splitlines()
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if line.strip() == "" or line[:1] in (" ", "\t"):
            i += 1
            continue
        header = line
        body = []
        i += 1
        while i < n:
            nxt = lines[i]
            if nxt.strip() != "" and nxt[:1] not in (" ", "\t"):
                break
            body.append(nxt)
            i += 1
        # trim trailing blank lines of the body
        while body and body[-1].strip() == "":
            body.pop()
        yield header, body


def dedent_baseline(body):
    """Minimum indentation across non-blank body lines (in columns,
    tabs expanded to 8)."""
    indents = []
    for ln in body:
        if ln.strip() == "":
            continue
        expanded = ln.expandtabs(8)
        indents.append(len(expanded) - len(expanded.lstrip(" ")))
    return min(indents) if indents else 0


def line_to_xml(raw, baseline):
    """Turn one verse line into a <line> element, preserving spatial
    indentation beyond the baseline."""
    expanded = raw.expandtabs(8)
    stripped = expanded.lstrip(" ")
    indent = len(expanded) - len(stripped)
    offset = max(0, indent - baseline)
    content = stripped.rstrip()

    if content == "---":
        return ('break', None)

    role = None
    if content.startswith("- "):
        role = "turn"

    lead = " " * offset
    attrs = ""
    if offset:
        attrs += f' indent="{offset}"'
    if role:
        attrs += f' role="{role}"'
    return ('line', f'<line{attrs}>{escape(lead + content)}</line>')


def emit_stanzas(body, baseline):
    """Group body lines into stanzas (blank-line separated) and emit."""
    out = []
    stanza = []

    def flush():
        if stanza:
            inner = "\n".join("      " + s for s in stanza)
            out.append("    <stanza>\n" + inner + "\n    </stanza>")
            stanza.clear()

    for ln in body:
        if ln.strip() == "":
            flush()
            continue
        kind, payload = line_to_xml(ln, baseline)
        if kind == 'break':
            flush()
            out.append('    <break type="section"/>')
        else:
            stanza.append(payload)
    flush()
    return "\n".join(out)


def parse(text):
    poems = []
    about = None
    keywords = []

    for header, body in split_blocks(text):
        toks = header.split()
        kind = toks[0]

        if kind == "about":
            name, date, uri = toks[1], toks[2], toks[3]
            free = "\n".join(ln.strip() for ln in body if ln.strip())
            about = (name, date, uri, free)

        elif kind == "keywords":
            inline = " ".join(toks[1:]).strip()
            if inline:
                keywords.append(inline)
            keywords += [ln.strip() for ln in body if ln.strip()]

        elif kind == "poem" or kind.startswith("%"):
            form = None
            if kind.startswith("%"):
                form = kind[1:]
                name = toks[1]
                idref = toks[2].lstrip("#")
            else:
                name = toks[1]
                idref = toks[2].lstrip("#")
            baseline = dedent_baseline(body)
            inner = emit_stanzas(body, baseline)
            poems.append((name, idref, form, inner))

    return about, keywords, poems


def to_pxml(text):
    about, keywords, poems = parse(text)
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<poetry>']

    if about:
        name, date, uri, free = about
        parts.append(
            f'  <about name="{escape(name,{chr(34):"&quot;"})}" '
            f'date="{date}" uri="{escape(uri)}">'
        )
        if free:
            for ln in free.splitlines():
                parts.append("    " + escape(ln))
        parts.append("  </about>")

    for kw in keywords:
        parts.append(f"  <keywords>{escape(kw)}</keywords>")

    parts.append("  <poems>")
    for name, idref, form, inner in poems:
        formattr = f' form="{form}"' if form else ""
        parts.append(
            f'    <poem name="{escape(name)}" id="{idref}"{formattr} '
            f'xml:space="preserve">'
        )
        # re-indent inner under poem
        for ln in inner.splitlines():
            parts.append("  " + ln)
        parts.append("    </poem>")
    parts.append("  </poems>")
    parts.append("</poetry>")
    return "\n".join(parts)


if __name__ == "__main__":
    src = sys.stdin.read() if len(sys.argv) < 2 else open(sys.argv[1]).read()
    print(to_pxml(src))
