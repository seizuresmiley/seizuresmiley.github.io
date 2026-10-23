"""Render typographic site assets with Pillow and Noto Sans CJK JP (no image generation).
Usage: python generate-assets.py /path/to/noto-font-directory
Requires Pillow and fonttools. Font directory must contain NotoSansCJKjp-{Bold,Regular}.otf.
Fonts: https://github.com/notofonts/noto-cjk (SIL Open Font License).
"""
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

FONTS = Path(sys.argv[1])
OUT = Path(__file__).resolve().parents[1] / 'assets'
OUT.mkdir(exist_ok=True)
PINK, BLUE, INK, PAPER = '#b62069', '#49b9de', '#302737', '#fff8fc'

def font(size, weight='Bold'):
    return ImageFont.truetype(str(FONTS / f'NotoSansCJKjp-{weight}.otf'), size)

def text(draw, xy, value, size, color, weight='Bold'):
    draw.text(xy, value, font=font(size, weight), fill=color, anchor='lt')

def centered(draw, value, center, top, size, color):
    f = font(size)
    w = draw.textlength(value, font=f)
    draw.text((center-w/2, top), value, font=f, fill=color, anchor='lt')

og = Image.new('RGB', (1200, 630), PAPER)
d = ImageDraw.Draw(og)
d.rectangle((0, 0, 1199, 11), fill=PINK)
d.rectangle((0, 618, 1199, 629), fill=BLUE)
text(d, (76, 136), 'アイカツ！アンコール', 70, PINK)
text(d, (76, 248), '店舗一覧', 100, INK)
text(d, (80, 500), 'hasunosoraschoolidol.club/aikatsu/', 28, '#6a5b68', 'Regular')
og.save(OUT / 'og-image.png', optimize=True)

# Draw at 4x the largest output size, then downsample for sharp small icons.
home = Image.new('RGB', (2048, 2048), PINK)
d = ImageDraw.Draw(home)
centered(d, 'アイ', 1024, 390, 640, 'white')
centered(d, 'カツ', 1024, 1060, 640, 'white')
d.rectangle((0, 1910, 2047, 2047), fill=BLUE)
for size, name in [(180,'apple-touch-icon.png'), (192,'icon-192.png'), (512,'icon-512.png')]:
    home.resize((size,size), Image.Resampling.LANCZOS).save(OUT/name, optimize=True)

fav = Image.new('RGB', (1024,1024), PINK)
d = ImageDraw.Draw(fav)
centered(d, 'ア', 512, 194, 690, 'white')
d.rectangle((0, 944, 1023, 1023), fill=BLUE)
for size in (16,32,48):
    fav.resize((size,size),Image.Resampling.LANCZOS).save(OUT/f'favicon-{size}.png', optimize=True)
fav.save(OUT/'favicon.ico', sizes=[(16,16),(32,32),(48,48)])

# Outline the character so SVG rendering never depends on installed Japanese fonts.
tt = TTFont(FONTS/'NotoSansCJKjp-Bold.otf')
glyphs = tt.getGlyphSet()
glyph = glyphs[tt.getBestCmap()[ord('ア')]]
pen = SVGPathPen(glyphs)
glyph.draw(pen)
(OUT/'favicon.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="{PINK}"/><path d="{pen.getCommands()}" transform="translate(167 819) scale(.69 -.69)" fill="white"/><path d="M0 944h1024v80H0z" fill="{BLUE}"/></svg>\n''')
print('Created OG image, outlined SVG favicon, ICO, PNG favicons, and 180/192/512px icons.')
