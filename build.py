from pathlib import Path
import base64, zipfile, io, shutil
root=Path(__file__).parent
public=root/"public"
if public.exists(): shutil.rmtree(public)
public.mkdir()
data="".join(p.read_text().strip() for p in sorted(root.glob("site_*.b64")))
raw=base64.b64decode(data)
with zipfile.ZipFile(io.BytesIO(raw)) as z:
    z.extractall(public)
print(f"Published {len(list(public.rglob('*')))} entries")
