"""Rebuild the source-bound text pack. Requires PyMuPDF + local Tesseract eng.
Only pages with a substantial scan and <250 extracted characters receive OCR.
The original PDF stays authoritative; OCR output is not teacher-reviewed content.
"""
from pathlib import Path
import hashlib,json,subprocess,tempfile,concurrent.futures
import fitz
root=Path(__file__).resolve().parents[1]
meta=next(b for b in json.loads((root/'lib/textbooks-data.json').read_text()) if b['id']=='english-xii-supplied')
source=root/'public/textbooks'/f"{meta['id']}-{meta['sha256'][:16]}.pdf"
assert hashlib.sha256(source.read_bytes()).hexdigest()==meta['sha256']
doc=fitz.open(source)
def extract(n):
    local=fitz.open(source);p=local[n];text=p.get_text(sort=True).strip();method='pdf-text'
    if len(text)<250 and p.get_images():
        with tempfile.TemporaryDirectory() as tmp:
            png=Path(tmp)/'page.png';p.get_pixmap(dpi=220).save(png)
            text=subprocess.check_output(['tesseract',str(png),'stdout','-l','eng','--psm','3'],stderr=subprocess.DEVNULL,text=True).strip()
            method='ocr'
    local.close()
    return {'page':n+1,'text':text[:20000],'method':method}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: pages=list(pool.map(extract,range(len(doc))))
pack={'id':meta['id'],'sha256':meta['sha256'],'pageCount':len(doc),'version':1,'status':'source-extracted-not-teacher-reviewed','ocrEngine':'Tesseract 5 eng; 220dpi','pages':pages}
out=root/'public/book-text/english-xii-v1.json';out.write_text(json.dumps(pack,ensure_ascii=False,separators=(',',':')))
print(f'{len(pages)} pages; {sum(p["method"]=="ocr" for p in pages)} OCR pages; {out.stat().st_size} bytes')
