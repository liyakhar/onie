#!/usr/bin/env python3
"""Write Google Search Console HTML verification file when GOOGLE_SITE_VERIFICATION is set."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

token = os.environ.get("GOOGLE_SITE_VERIFICATION", "").strip()
if not token:
    print("GOOGLE_SITE_VERIFICATION not set — skipping GSC HTML file.")
    raise SystemExit(0)

filename = f"google{token}.html"
content = f"google-site-verification: {filename}\n"
path = PUBLIC / filename
path.write_text(content, encoding="utf-8")
print(f"Wrote {path}")
