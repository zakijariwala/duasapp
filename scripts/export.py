#!/usr/bin/env python3
"""
export.py — Raaz-o-Neyaz PWA data exporter
Usage: python export.py path/to/database.db path/to/docs/data/

Reads the SQLite database and produces:
  data/categories.json
  data/nav.json          (full subindex tree)
  data/search.json       (lightweight index for client-side search)
  data/lines/{id}.json   (one file per subindex that has lines)
"""

import sqlite3
import json
import os
import sys
import re
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────────

ARABIC_SEGMENT_COUNT = 20  # ArabicText1 … ArabicText20

# Languages we export (Gujarati excluded — sparse data)
LANGS = {
    "en":    "English",
    "rurdu": "RUrdu",
    "urdu":  "Urdu",
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

def nullstrip(v):
    """Return None for empty/whitespace strings, else strip."""
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def build_arabic_segments(row):
    """
    Collapse ArabicText1…20 + colour signs into a list of segment objects.
    Only includes non-null segments.
    """
    segments = []
    for i in range(1, ARABIC_SEGMENT_COUNT + 1):
        text = nullstrip(row[f"ArabicText{i}"])
        if text is None:
            continue
        seg = {"text": text}
        green = nullstrip(row[f"ArabicGreenSign{i}"])
        red   = nullstrip(row[f"ArabicRedSign{i}"])
        blue  = nullstrip(row[f"ArabicBlueSign{i}"])
        if green: seg["green"] = green
        if red:   seg["red"]   = red
        if blue:  seg["blue"]  = blue
        segments.append(seg)
    return segments if segments else None


def image_to_datauri(b64str):
    """Wrap a raw base64 string as a PNG data URI."""
    if not b64str:
        return None
    s = b64str.strip()
    if s.startswith("data:"):
        return s
    return f"data:image/png;base64,{s}"


def build_line_obj(row):
    """Convert a lines row (as dict) into a clean export object."""
    line_type = "image" if row["EnglishImage"] else "text"

    obj = {
        "id":   row["Id"],
        "type": line_type,
        "seq":  row["Sequence"],
    }

    if line_type == "image":
        obj["images"] = {}
        for lang, col_prefix in [("en", "English"), ("rurdu", "RUrdu"), ("urdu", "Urdu")]:
            uri = image_to_datauri(row[f"{col_prefix}Image"])
            if uri:
                obj["images"][lang] = uri
        return obj

    # ── Text line ──────────────────────────────────────────────────────────
    # Titles
    titles = {k: nullstrip(row[f"{v}Title"]) for k, v in LANGS.items()}
    if any(titles.values()):
        obj["title"] = titles

    # Descriptions
    descs = {k: nullstrip(row[f"{v}Description"]) for k, v in LANGS.items()}
    if any(descs.values()):
        obj["desc"] = descs

    # Arabic
    arabic_segs = build_arabic_segments(row)
    if arabic_segs:
        obj["arabic"] = arabic_segs
    rarabic = nullstrip(row["RArabic"])
    if rarabic:
        obj["rarabic"] = rarabic

    # Translations
    trans = {k: nullstrip(row[v]) for k, v in LANGS.items()}
    if any(trans.values()):
        obj["trans"] = trans

    # Flags
    if row["IsRed"]:
        obj["isRed"] = True
    if row["MinimizeDescriptionLine"]:
        obj["minimizeDesc"] = True

    return obj


# ─── Main export ─────────────────────────────────────────────────────────────

def export(db_path: str, out_dir: str):
    out = Path(out_dir)
    lines_dir = out / "lines"
    lines_dir.mkdir(parents=True, exist_ok=True)

    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    print("▶ Exporting categories.json …")
    cur.execute("""
        SELECT Id, Number, EnglishName, RUrduName, UrduName
        FROM categories
        WHERE IsVisible = 1
        ORDER BY Number
    """)
    categories = []
    for r in cur.fetchall():
        categories.append({
            "id":    r["Id"],
            "num":   r["Number"],
            "en":    nullstrip(r["EnglishName"]),
            "rurdu": nullstrip(r["RUrduName"]),
            "urdu":  nullstrip(r["UrduName"]),
        })
    (out / "categories.json").write_text(
        json.dumps(categories, ensure_ascii=False), encoding="utf-8"
    )
    print(f"   {len(categories)} categories")

    print("▶ Building subindex tree …")
    cur.execute("""
        SELECT Id, ParentId, Level, Number, HasChildren,
               EnglishIndexName, RUrduIndexName, UrduIndexName,
               EnglishName, RUrduName, UrduName,
               CategoryId, AudioIndexId, IsVisible
        FROM subindex
        ORDER BY Level, Number
    """)
    all_nodes = {}
    for r in cur.fetchall():
        node = {
            "id":       r["Id"],
            "parentId": r["ParentId"],
            "level":    r["Level"],
            "num":      r["Number"],
            "hasKids":  bool(r["HasChildren"]),
            "catId":    r["CategoryId"],
            "title": {
                "en":    nullstrip(r["EnglishIndexName"]),
                "rurdu": nullstrip(r["RUrduIndexName"]),
                "urdu":  nullstrip(r["UrduIndexName"]),
            },
            "name": {
                "en":    nullstrip(r["EnglishName"]),
                "rurdu": nullstrip(r["RUrduName"]),
                "urdu":  nullstrip(r["UrduName"]),
            },
        }
        if r["AudioIndexId"]:
            node["audioId"] = r["AudioIndexId"]
        all_nodes[node["id"]] = node

    # Attach children lists
    tree_roots = []  # level-0 nodes keyed by categoryId
    cat_children = {}  # categoryId → [level-0 nodes]

    for node in all_nodes.values():
        parent_id = node["parentId"]
        # Level-0 nodes have ParentId = categoryId (1–7)
        if parent_id in [1, 2, 3, 4, 5, 6, 7] and node["level"] == 0:
            cat_children.setdefault(parent_id, []).append(node)
        elif parent_id in all_nodes:
            parent = all_nodes[parent_id]
            parent.setdefault("children", []).append(node)

    # Sort children by num
    def sort_children(node):
        if "children" in node:
            node["children"].sort(key=lambda x: x["num"])
            for child in node["children"]:
                sort_children(child)

    nav = {}
    for cat_id, children in cat_children.items():
        children.sort(key=lambda x: x["num"])
        for child in children:
            sort_children(child)
        nav[str(cat_id)] = children

    (out / "nav.json").write_text(
        json.dumps(nav, ensure_ascii=False, separators=(',', ':')),
        encoding="utf-8"
    )
    print(f"   {len(all_nodes)} subindex nodes written to nav.json")

    print("▶ Exporting audio index …")
    cur.execute("""
        SELECT Id, Number, EnglishIndexName, RUrduIndexName, UrduIndexName,
               QuranQaari1Audio, QuranQaari2Audio, QuranQaari3Audio, QuranQaari4Audio,
               QuranWithTranslationAudio, NonQuranAudio, CategoryId
        FROM audioindex
    """)
    audio = []
    for r in cur.fetchall():
        entry = {
            "id":    r["Id"],
            "num":   r["Number"],
            "catId": r["CategoryId"],
            "title": {
                "en":    nullstrip(r["EnglishIndexName"]),
                "rurdu": nullstrip(r["RUrduIndexName"]),
                "urdu":  nullstrip(r["UrduIndexName"]),
            },
            "audio": {}
        }
        for col, key in [
            ("QuranQaari1Audio", "q1"),
            ("QuranQaari2Audio", "q2"),
            ("QuranQaari3Audio", "q3"),
            ("QuranQaari4Audio", "q4"),
            ("QuranWithTranslationAudio", "qt"),
            ("NonQuranAudio", "other"),
        ]:
            v = nullstrip(r[col])
            if v: entry["audio"][key] = v
        if entry["audio"]:
            audio.append(entry)
    (out / "audio.json").write_text(
        json.dumps(audio, ensure_ascii=False), encoding="utf-8"
    )
    print(f"   {len(audio)} audio entries")

    print("▶ Fetching all lines (this may take a moment) …")
    # Build all lines columns dynamically
    arabic_cols = []
    for i in range(1, ARABIC_SEGMENT_COUNT + 1):
        arabic_cols += [
            f"ArabicText{i}", f"ArabicGreenSign{i}",
            f"ArabicRedSign{i}", f"ArabicBlueSign{i}"
        ]
    all_cols = ", ".join([
        "l.Id", "l.Sequence",
        "l.EnglishTitle", "l.RUrduTitle", "l.UrduTitle",
        "l.EnglishDescription", "l.RUrduDescription", "l.UrduDescription",
        "l.English", "l.RUrdu", "l.Urdu",
        "l.RArabic",
        "l.EnglishImage", "l.RUrduImage", "l.UrduImage",
        "l.IsRed", "l.MinimizeDescriptionLine",
    ] + [f"l.{c}" for c in arabic_cols] + [
        "lm.SubindexId", "lm.Number as LineNumber"
    ])

    cur.execute(f"""
        SELECT {all_cols}
        FROM linesmetadata lm
        JOIN lines l ON l.Id = lm.LinesId
        ORDER BY lm.SubindexId, lm.Number
    """)

    print("▶ Grouping lines by subindex and writing JSON files …")
    current_sid  = None
    current_lines = []
    files_written = 0
    search_index  = []
    deep_search_index = []

    def flush(sid, lns):
        nonlocal files_written
        node = all_nodes.get(sid, {})
        title = node.get("title", {})
        payload = {
            "subindexId": sid,
            "title": title,
            "lines": lns,
        }
        path = lines_dir / f"{sid}.json"
        path.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
            encoding="utf-8"
        )
        files_written += 1

        # ── 1. Build search.json entry (lightweight) ───────────────────────
        first_arabic = None
        first_en     = None
        for ln in lns:
            if ln["type"] == "text":
                if not first_arabic and ln.get("arabic"):
                    first_arabic = ln["arabic"][0]["text"]
                if not first_en and ln.get("trans", {}).get("en"):
                    first_en = ln["trans"]["en"][:120]
                if first_arabic and first_en:
                    break
        search_index.append({
            "id":    sid,
            "catId": node.get("catId"),
            "t": {
                "en":    title.get("en"),
                "rurdu": title.get("rurdu"),
                "urdu":  title.get("urdu"),
            },
            "preview": {
                "arabic": first_arabic,
                "en":     first_en,
            }
        })

        # ── 2. Build deep_search.json entry (heavyweight content) ───────────
        content_parts = []
        if title:
            content_parts.extend([v for v in title.values() if v])
        
        for ln in lns:
            if ln["type"] == "text":
                if ln.get("title"):   content_parts.extend([v for v in ln["title"].values() if v])
                if ln.get("desc"):    content_parts.extend([v for v in ln["desc"].values() if v])
                if ln.get("rarabic"): content_parts.append(ln["rarabic"])
                if ln.get("arabic"):  content_parts.extend([seg["text"] for seg in ln["arabic"]])
                if ln.get("trans"):   content_parts.extend([v for v in ln["trans"].values() if v])
        
        # Lowercase and join for efficient matching
        deep_search_index.append({
            "id": sid,
            "c": " ".join(content_parts).lower()
        })

    for r in cur:
        row  = dict(r)
        sid  = row["SubindexId"]
        if sid != current_sid:
            if current_sid is not None:
                flush(current_sid, current_lines)
            current_sid   = sid
            current_lines = []
        current_lines.append(build_line_obj(row))

    if current_sid is not None:
        flush(current_sid, current_lines)

    print(f"   {files_written} line files written")

    print("▶ Writing search.json …")
    (out / "search.json").write_text(
        json.dumps(search_index, ensure_ascii=False, separators=(',', ':')),
        encoding="utf-8"
    )
    print(f"   {len(search_index)} searchable entries")

    print("▶ Writing deep_search.json …")
    (out / "deep_search.json").write_text(
        json.dumps(deep_search_index, ensure_ascii=False, separators=(',', ':')),
        encoding="utf-8"
    )
    print(f"   {len(deep_search_index)} deep searchable entries")

    con.close()
    print("\n✅ Export complete!")
    print(f"   Output directory: {out.resolve()}")

    # Size report
    total = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"   Total size: {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python export.py <database.db> <output_dir>")
        sys.exit(1)
    export(sys.argv[1], sys.argv[2])
