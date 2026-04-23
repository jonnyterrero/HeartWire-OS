#!/usr/bin/env python3
"""
Split 'Circuits (Electric) 11th Ed.pdf' into smaller chunks for Claude projects.
Claude has a ~30 MB per-file limit; this PDF is ~31 MB, so it must be split.

Usage:
    pip install pypdf
    python split_pdf_for_claude.py

Output: Circuits_Electric_11th_Ed_part_001.pdf, part_002.pdf, etc.
"""

from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    print("Install pypdf first: pip install pypdf")
    exit(1)

# ~50 pages per chunk keeps each file well under 30 MB
PAGES_PER_CHUNK = 50

SCRIPT_DIR = Path(__file__).parent
SOURCE_PDF = SCRIPT_DIR / "Circuits (Electric) 11th Ed.pdf"
OUTPUT_PREFIX = "Circuits_Electric_11th_Ed_part_"


def main():
    if not SOURCE_PDF.exists():
        print(f"Source not found: {SOURCE_PDF}")
        return

    reader = PdfReader(SOURCE_PDF)
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}")

    chunk_num = 1
    for start in range(0, total_pages, PAGES_PER_CHUNK):
        end = min(start + PAGES_PER_CHUNK, total_pages)
        writer = PdfWriter()

        for i in range(start, end):
            writer.add_page(reader.pages[i])

        out_path = SCRIPT_DIR / f"{OUTPUT_PREFIX}{chunk_num:03d}.pdf"
        with open(out_path, "wb") as f:
            writer.write(f)

        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f"  Created {out_path.name} (pages {start + 1}-{end}, {size_mb:.1f} MB)")
        chunk_num += 1

    print(f"\nDone. Add the part_*.pdf files to your Claude project one at a time.")


if __name__ == "__main__":
    main()
