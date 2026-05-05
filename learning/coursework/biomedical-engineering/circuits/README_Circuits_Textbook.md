# Circuits (Electric) 11th Ed – Claude Project Setup

## File location

- **Full textbook:** `Circuits (Electric) 11th Ed.pdf` (hard link to School folder)
- **Size:** ~31 MB — above Claude’s ~30 MB per-file limit

## Using with Claude projects

Because the full PDF exceeds the limit, use the split script:

```bash
pip install pypdf
python split_pdf_for_claude.py
```

This creates `Circuits_Electric_11th_Ed_part_001.pdf`, `part_002.pdf`, etc. (~50 pages each, under 30 MB).

Add these part files to your Claude project one at a time when you need them.
