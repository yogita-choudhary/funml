#!/usr/bin/env python3
from pathlib import Path
import argparse
import subprocess
import shutil
import re
import json


PROJECT_TITLE = "ECE 4252/6252 – FunML Lecture Notes"

CSS = """
body {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}
main {
  max-width: 1000px;
  padding: 32px;
  margin: auto;
}
h1, h2, h3 {
  line-height: 1.25;
}
nav {
  background: #f6f8fa;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}
nav a {
  margin-right: 12px;
  text-decoration: none;
  font-weight: 500;
}
"""


def run(cmd):
  print(" ".join(cmd))
  subprocess.check_call(cmd)


def extract_title(tex_path):
  text = tex_path.read_text(errors="ignore")
  m = re.search(r"Lecture\s+\d+[:\-]?\s*(.*)", text)
  if m:
    return m.group(0)
  return tex_path.stem


def lecture_number_from_dir(lec_dir: Path):
  m = re.search(r"lecture\s*(\d+)", lec_dir.name, re.IGNORECASE)
  return m.group(1) if m else ""


def pick_main_tex(tex_files, lecture_number: str):
  def score(tex_path: Path):
    name = tex_path.stem.lower()
    points = 0
    if "in-class" in name or "exercise" in name or "solution" in name:
      points -= 100
    if "add-on" in name or "addon" in name:
      points -= 60
    if name == "main":
      points += 60
    if lecture_number:
      if f"lecture{lecture_number}" in name:
        points += 40
      if re.search(rf"\bl{lecture_number}\b", name):
        points += 35
      if f"l{lecture_number}_" in name:
        points += 35
    if "notes" in name:
      points += 20
    if "template" in name:
      points += 10
    return points

  return sorted(tex_files, key=lambda p: (-score(p), p.name.lower()))[0]


def find_extras(tex_files):
  exercise_tex = None
  solution_tex = None
  for tex in tex_files:
    name = tex.stem.lower()
    if "in-class exercise solution" in name or ("solution" in name and "exercise" in name):
      solution_tex = tex
    elif "in-class exercise" in name:
      exercise_tex = tex
  return exercise_tex, solution_tex


def build_single_html(tex: Path, out_html_path: Path, out_root: Path, title: str):
  tex_text = tex.read_text(errors="ignore")
  tex_text = re.sub(r"\{\\bf\s+([^}]+)\}", r"\\textbf{\1}", tex_text)
  tmp_tex = out_root / f"_{out_html_path.stem}.tex"
  tmp_tex.write_text(tex_text)

  tmp_html = out_root / f"_{out_html_path.stem}.html"

  run([
    "pandoc",
    str(tmp_tex),
    "--mathjax",
    "--standalone",
    "--number-sections",
    "--shift-heading-level-by=1",
    "--number-offset=1",
    "-o", str(tmp_html),
  ])

  body = tmp_html.read_text(errors="ignore")

  final_html = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>{title}</title>
  <link rel="stylesheet" href="../assets/style.css"/>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
<nav>
  <a href="../index.html">Home</a>
</nav>
<main>
{body}
</main>
</body>
</html>
"""

  out_html_path.write_text(final_html)
  tmp_html.unlink()
  tmp_tex.unlink()


def build_site(src_root: Path, out_root: Path, write_index: bool):
  lectures_out = out_root / "lectures"
  assets_out = out_root / "assets"

  lectures_out.mkdir(parents=True, exist_ok=True)
  assets_out.mkdir(parents=True, exist_ok=True)

  # CSS for lecture pages
  (assets_out / "style.css").write_text(CSS)

  # Copy images
  img_dir = src_root / "img"
  if img_dir.exists():
    shutil.copytree(img_dir, lectures_out / "img", dirs_exist_ok=True)

  lecture_pages = []
  resources = {}

  for lec_dir in sorted(src_root.glob("Lecture*")):
    if not lec_dir.is_dir():
      continue

    tex_files = list(lec_dir.glob("*.tex"))
    if not tex_files:
      continue

    lecture_number = lecture_number_from_dir(lec_dir)
    tex = pick_main_tex(tex_files, lecture_number)
    title = extract_title(tex)
    out_html = f"{lec_dir.name}.html"
    build_single_html(tex, lectures_out / out_html, out_root, title)

    exercise_tex, solution_tex = find_extras(tex_files)
    lecture_key = lec_dir.name
    resources[lecture_key] = {}

    if exercise_tex:
      exercise_out = f"{lecture_key}_exercise.html"
      build_single_html(
        exercise_tex,
        lectures_out / exercise_out,
        out_root,
        f"{lecture_key} In-class Exercise",
      )
      resources[lecture_key]["exercise"] = f"lectures/{exercise_out}"

    if solution_tex:
      solution_out = f"{lecture_key}_exercise_solutions.html"
      build_single_html(
        solution_tex,
        lectures_out / solution_out,
        out_root,
        f"{lecture_key} In-class Exercise Solutions",
      )
      resources[lecture_key]["solution"] = f"lectures/{solution_out}"

    lecture_pages.append((title, out_html))

  (lectures_out / "resources.json").write_text(json.dumps(resources, indent=2))

  if write_index:
    links = "\\n".join(
      f'<li><a href="lectures/{f}">{t}</a></li>'
      for t, f in lecture_pages
    )

    index_html = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>{PROJECT_TITLE}</title>
  <link rel="stylesheet" href="assets/style.css"/>
</head>
<body>
<main>
  <h1>{PROJECT_TITLE}</h1>
  <ul>
    {links}
  </ul>
</main>
</body>
</html>
"""

    (out_root / "index.html").write_text(index_html)


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument(
    "--src",
    default="source/raw",
    help="Path to extracted lecture source (default: source/raw)",
  )
  parser.add_argument(
    "--out",
    default=".",
    help="Output root for the website (default: current dir)",
  )
  parser.add_argument(
    "--write-index",
    action="store_true",
    help="Also generate index.html (off by default to avoid overwriting)",
  )
  args = parser.parse_args()

  src_root = Path(args.src).resolve()
  out_root = Path(args.out).resolve()

  build_site(src_root, out_root, args.write_index)
  print("✔ Lectures built → open lectures/*.html")


if __name__ == "__main__":
  main()
