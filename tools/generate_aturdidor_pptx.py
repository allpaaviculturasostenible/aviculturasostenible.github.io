from __future__ import annotations

import html
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "presentaciones" / "aturdidor"
OUT_FILE = OUT_DIR / "aturdidor-infografias-allpa-crece.pptx"
MEDIA_DIR = OUT_DIR / "media"

EMU = 914400
SLIDE_W = 12192000
SLIDE_H = 6858000

NAVY = "123D57"
ORANGE = "F47C20"
INK = "1F2A33"
MUTED = "65727D"
PAPER = "F7F5F1"
WHITE = "FFFFFF"
LINE = "DAD6CE"
GREEN = "407C59"
RED = "B64739"
DARK_GREEN = "0B4A26"
LIGHT_GREEN = "EEF7E7"
GRASS = "3F8E2F"
LIME = "B8D978"


def emu(inches: float) -> int:
    return int(inches * EMU)


def esc(value: str) -> str:
    return html.escape(value, quote=False)


def prep_media() -> list[Path]:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    source = ROOT / "assets" / "allpa_aturdidor_productos" / "aturdidor-un-pollo-base-placeholder.png"
    img = Image.open(source).convert("RGBA")

    hero = img.crop((390, 105, 1240, 1135))
    hero_path = MEDIA_DIR / "aturdidor-cono-crop.png"
    hero.save(hero_path)

    full_path = MEDIA_DIR / "aturdidor-un-pollo.png"
    img.save(full_path)

    return [hero_path, full_path]


def rounded(img: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, img.size[0], img.size[1]), radius=radius, fill=255)
    out = Image.new("RGBA", img.size, (255, 255, 255, 0))
    out.paste(img, (0, 0), mask)
    return out


def solid_fill(color: str) -> str:
    return f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'


def line(color: str = LINE, width: int = 12700) -> str:
    return f'<a:ln w="{width}">{solid_fill(color)}</a:ln>'


def shape_rect(
    obj_id: int,
    name: str,
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str | None,
    ln: str | None = None,
    radius: bool = False,
) -> str:
    fill_xml = solid_fill(fill) if fill else "<a:noFill/>"
    line_xml = ln if ln is not None else "<a:ln><a:noFill/></a:ln>"
    geom = "roundRect" if radius else "rect"
    return f"""
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="{obj_id}" name="{esc(name)}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>
          {fill_xml}
          {line_xml}
        </p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
      </p:sp>"""


def text_box(
    obj_id: int,
    name: str,
    x: float,
    y: float,
    w: float,
    h: float,
    paragraphs: list[dict],
    fill: str | None = None,
    ln: str | None = None,
    radius: bool = False,
    margin: int = 91440,
) -> str:
    fill_xml = solid_fill(fill) if fill else "<a:noFill/>"
    line_xml = ln if ln is not None else "<a:ln><a:noFill/></a:ln>"
    geom = "roundRect" if radius else "rect"
    body = []
    for p in paragraphs:
        runs = p.get("runs") or [{"text": p.get("text", "")}]
        algn = p.get("align", "l")
        mar_l = p.get("margin_left", 0)
        bullet = p.get("bullet", False)
        ppr = f'<a:pPr algn="{algn}" marL="{mar_l}">'
        if bullet:
            ppr += '<a:buChar char="•"/>'
        ppr += "</a:pPr>"
        r_xml = []
        for run in runs:
            size = int(run.get("size", p.get("size", 20)) * 100)
            color = run.get("color", p.get("color", INK))
            bold = ' b="1"' if run.get("bold", p.get("bold", False)) else ""
            italic = ' i="1"' if run.get("italic", False) else ""
            text = run.get("text", "")
            r_xml.append(
                f'<a:r><a:rPr lang="es-CO" sz="{size}"{bold}{italic}>'
                f'{solid_fill(color)}<a:latin typeface="Aptos"/></a:rPr><a:t>{esc(text)}</a:t></a:r>'
            )
        body.append(f"<a:p>{ppr}{''.join(r_xml)}</a:p>")
    return f"""
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="{obj_id}" name="{esc(name)}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>
          {fill_xml}
          {line_xml}
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" lIns="{margin}" tIns="{margin}" rIns="{margin}" bIns="{margin}"/>
          <a:lstStyle/>
          {''.join(body)}
        </p:txBody>
      </p:sp>"""


def image_pic(obj_id: int, name: str, rid: str, x: float, y: float, w: float, h: float) -> str:
    return f"""
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="{obj_id}" name="{esc(name)}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="{rid}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>"""


def title(slide: list[str], obj_id: int, eyebrow: str, heading: str, sub: str | None = None) -> int:
    slide.append(
        text_box(
            obj_id,
            "Eyebrow",
            0.65,
            0.38,
            4.0,
            0.35,
            [{"text": eyebrow.upper(), "size": 11, "bold": True, "color": ORANGE}],
            margin=0,
        )
    )
    obj_id += 1
    slide.append(
        text_box(
            obj_id,
            "Title",
            0.6,
            0.68,
            7.8,
            0.9,
            [{"text": heading, "size": 31, "bold": True, "color": NAVY}],
            margin=0,
        )
    )
    obj_id += 1
    if sub:
        slide.append(
            text_box(
                obj_id,
                "Subtitle",
                0.62,
                1.52,
                7.0,
                0.55,
                [{"text": sub, "size": 14, "color": MUTED}],
                margin=0,
            )
        )
        obj_id += 1
    return obj_id


def brand(slide: list[str], obj_id: int) -> int:
    slide.append(shape_rect(obj_id, "Brand dot", 11.55, 0.35, 0.22, 0.22, ORANGE, radius=True))
    obj_id += 1
    slide.append(
        text_box(
            obj_id,
            "Brand",
            11.82,
            0.29,
            0.9,
            0.35,
            [{"text": "ALLPA", "size": 9.5, "bold": True, "color": NAVY}],
            margin=0,
        )
    )
    return obj_id + 1


def slide_xml(shapes: list[str]) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm>
      </p:grpSpPr>
      {''.join(shapes)}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def slide_rels(image_targets: list[str]) -> str:
    rels = [
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
    ]
    for idx, target in enumerate(image_targets):
        rels.append(
            f'<Relationship Id="rId{idx + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{target}"/>'
        )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {''.join(rels)}
</Relationships>"""


def build_slides() -> tuple[list[str], list[list[Path]]]:
    hero_path, _full_path = prep_media()
    slides: list[str] = []
    slide_media: list[list[Path]] = []

    # Slide 1
    s: list[str] = []
    oid = 2
    s.append(shape_rect(oid, "Background", 0, 0, 13.333, 7.5, PAPER))
    oid += 1
    oid = brand(s, oid)
    s.append(shape_rect(oid, "Hero image panel", 8.0, 0.0, 5.333, 7.5, "ECE6DD"))
    oid += 1
    s.append(image_pic(oid, "Aturdidor crop", "rId2", 8.05, 0.85, 4.65, 5.65))
    oid += 1
    s.append(shape_rect(oid, "Orange rail", 0.0, 0.0, 0.16, 7.5, ORANGE))
    oid += 1
    s.append(
        text_box(
            oid,
            "Cover title",
            0.65,
            1.05,
            6.9,
            1.65,
            [
                {"text": "Aturdidor", "size": 46, "bold": True, "color": NAVY},
                {"text": "Anestesia electrica para ordenar el manejo antes del beneficio", "size": 20, "color": INK},
            ],
            margin=0,
        )
    )
    oid += 1
    s.append(
        text_box(
            oid,
            "Cover copy",
            0.7,
            3.0,
            6.25,
            0.75,
            [
                {
                    "text": "Una solucion que puede empezar basica y crecer hacia estaciones de mayor capacidad, con garantia y ruta de retoma.",
                    "size": 16,
                    "color": MUTED,
                }
            ],
            margin=0,
        )
    )
    oid += 1
    badges = [("110V · 60Hz", "Alimentacion estandar"), ("1 año", "Garantia"), ("Retoma", "Actualizacion por etapas")]
    for i, (big, small) in enumerate(badges):
        x = 0.72 + i * 2.25
        s.append(shape_rect(oid, f"Badge {i}", x, 4.18, 1.95, 0.92, WHITE, line(LINE), radius=True))
        oid += 1
        s.append(
            text_box(
                oid,
                f"Badge text {i}",
                x + 0.13,
                4.28,
                1.68,
                0.65,
                [
                    {"text": big, "size": 16, "bold": True, "color": NAVY},
                    {"text": small, "size": 9.5, "color": MUTED},
                ],
                margin=0,
            )
        )
        oid += 1
    s.append(
        text_box(
            oid,
            "Footer note",
            0.72,
            6.78,
            6.6,
            0.3,
            [{"text": "Borrador editable para ajustar argumentos comerciales y datos tecnicos.", "size": 9.5, "color": MUTED}],
            margin=0,
        )
    )
    slides.append(slide_xml(s))
    slide_media.append([hero_path])

    # Slide 2
    s = []
    oid = 2
    s.append(shape_rect(oid, "Background", 0, 0, 13.333, 7.5, WHITE))
    oid += 1
    oid = brand(s, oid)
    oid = title(
        s,
        oid,
        "Como funciona",
        "Del manejo manual a un punto controlado de aturdimiento",
        "La clave del mensaje: no es solo electricidad; es una estacion que ordena el paso previo al beneficio.",
    )
    steps = [
        ("1", "Conectar", "Alimentacion 110V · 60Hz."),
        ("2", "Ubicar el ave", "El cono/base ayuda a estabilizar el manejo."),
        ("3", "Activar", "La carga se aplica al pulsar el boton."),
        ("4", "Continuar el flujo", "El ave queda lista para el siguiente paso del beneficio."),
    ]
    for i, (num, head, body) in enumerate(steps):
        x = 0.75 + i * 3.05
        s.append(shape_rect(oid, f"Step card {i}", x, 2.25, 2.48, 2.35, PAPER, line(LINE), radius=True))
        oid += 1
        s.append(shape_rect(oid, f"Step circle {i}", x + 0.18, 2.48, 0.55, 0.55, ORANGE, radius=True))
        oid += 1
        s.append(text_box(oid, f"Step number {i}", x + 0.34, 2.59, 0.22, 0.25, [{"text": num, "size": 13, "bold": True, "color": WHITE}], margin=0))
        oid += 1
        s.append(text_box(oid, f"Step text {i}", x + 0.2, 3.05, 2.05, 1.1, [{"text": head, "size": 17, "bold": True, "color": NAVY}, {"text": body, "size": 12.5, "color": MUTED}], margin=0))
        oid += 1
        if i < 3:
            s.append(shape_rect(oid, f"Connector {i}", x + 2.54, 3.34, 0.34, 0.06, ORANGE, radius=True))
            oid += 1
    s.append(
        text_box(
            oid,
            "Bottom definition",
            0.85,
            5.28,
            11.65,
            0.92,
            [
                {
                    "runs": [
                        {"text": "Definicion simple para ventas: ", "bold": True, "color": NAVY},
                        {"text": "aturdimiento rapido que deja al ave inconsciente antes del desangrado. Bien aplicado, reduce dolor, estres y movimientos bruscos durante el proceso.", "color": INK},
                    ],
                    "size": 15,
                }
            ],
            fill="F2F7F4",
            ln=line("BFD8C8"),
            radius=True,
        )
    )
    slides.append(slide_xml(s))
    slide_media.append([])

    # Slide 3
    s = []
    oid = 2
    s.append(shape_rect(oid, "Background", 0, 0, 13.333, 7.5, PAPER))
    oid += 1
    oid = brand(s, oid)
    oid = title(
        s,
        oid,
        "Por que importa",
        "El equipo protege el proceso cuando la produccion crece",
        "Tres argumentos para comunicar valor sin sonar tecnico de mas.",
    )
    values = [
        ("Bienestar", "Reduce improvisacion en un momento sensible del beneficio."),
        ("Ritmo", "Crea un punto fijo antes del desangrado y disminuye esperas entre pasos."),
        ("Crecimiento", "Permite iniciar con una version accesible y actualizar con retoma."),
    ]
    colors = [GREEN, NAVY, ORANGE]
    for i, (head, body) in enumerate(values):
        x = 0.75 + i * 4.15
        s.append(shape_rect(oid, f"Value card {i}", x, 2.1, 3.55, 1.75, WHITE, line(LINE), radius=True))
        oid += 1
        s.append(shape_rect(oid, f"Value stripe {i}", x, 2.1, 0.12, 1.75, colors[i], radius=True))
        oid += 1
        s.append(text_box(oid, f"Value text {i}", x + 0.34, 2.35, 2.85, 1.0, [{"text": head, "size": 18, "bold": True, "color": NAVY}, {"text": body, "size": 12.5, "color": MUTED}], margin=0))
        oid += 1
    s.append(
        text_box(
            oid,
            "Growth title",
            0.78,
            4.45,
            3.1,
            0.35,
            [{"text": "Ruta de compra", "size": 15, "bold": True, "color": NAVY}],
            margin=0,
        )
    )
    oid += 1
    route = [
        ("Basico", "$400 mil", "Caja electronica y electrodos"),
        ("Un pollo", "$800 mil promo", "Base, cono, soporte y caja"),
        ("Industrial", "$2 millones", "Sistema rotatorio de 3 conos"),
    ]
    for i, (name, price, desc) in enumerate(route):
        x = 0.8 + i * 4.0
        s.append(shape_rect(oid, f"Route pill {i}", x, 5.0, 3.25, 0.95, WHITE, line(LINE), radius=True))
        oid += 1
        s.append(text_box(oid, f"Route text {i}", x + 0.18, 5.12, 2.8, 0.65, [{"text": f"{name} · {price}", "size": 13, "bold": True, "color": NAVY}, {"text": desc, "size": 9.5, "color": MUTED}], margin=0))
        oid += 1
        if i < 2:
            s.append(shape_rect(oid, f"Route connector {i}", x + 3.37, 5.43, 0.42, 0.06, ORANGE, radius=True))
            oid += 1
    s.append(text_box(oid, "Retoma note", 0.82, 6.45, 9.5, 0.35, [{"text": "Mensaje clave: el cliente no compra una isla; compra un primer paso dentro de Allpa Crece.", "size": 11.5, "bold": True, "color": NAVY}], margin=0))
    slides.append(slide_xml(s))
    slide_media.append([])

    # Slide 4
    s = []
    oid = 2
    s.append(shape_rect(oid, "Background", 0, 0, 13.333, 7.5, WHITE))
    oid += 1
    oid = brand(s, oid)
    oid = title(
        s,
        oid,
        "Vs competidores",
        "Comparar por etapa, no solo por precio",
        "Usar esta matriz para conversaciones comerciales; reemplazar categorias por marcas cuando tengamos datos comprobados.",
    )
    headers = ["Criterio", "Allpa Crece", "Improvisado / manual", "Equipo sin ruta"]
    col_x = [0.7, 3.45, 6.45, 9.55]
    col_w = [2.45, 2.65, 2.85, 2.75]
    y0 = 2.05
    for i, h in enumerate(headers):
        fill = NAVY if i == 1 else PAPER
        color = WHITE if i == 1 else NAVY
        s.append(shape_rect(oid, f"Header {i}", col_x[i], y0, col_w[i], 0.58, fill, line(LINE), radius=True))
        oid += 1
        s.append(text_box(oid, f"Header text {i}", col_x[i] + 0.12, y0 + 0.14, col_w[i] - 0.24, 0.24, [{"text": h, "size": 11.5, "bold": True, "color": color}], margin=0))
        oid += 1
    rows = [
        ("Control del proceso", "Punto fijo de anestesia electrica", "Variable segun operario", "Depende del diseño"),
        ("Inversion inicial", "Entrada basica y versiones por etapa", "Baja, pero con mas riesgo operativo", "Alta si se compra sobredimensionado"),
        ("Actualizacion", "Retoma despues de evaluacion tecnica", "No hay ruta clara", "Puede exigir cambio completo"),
        ("Soporte", "Garantia de 1 año y asesoria por WhatsApp", "Sin respaldo formal", "Depende del proveedor"),
        ("Capacidad", "Basico, un pollo o rotatorio de 3 conos", "Limitada y poco repetible", "Puede superar la necesidad actual"),
    ]
    for r, row in enumerate(rows):
        y = 2.78 + r * 0.72
        for c, text in enumerate(row):
            fill = "F2F7F4" if c == 1 else WHITE
            color = NAVY if c == 0 else INK
            s.append(shape_rect(oid, f"Cell {r}-{c}", col_x[c], y, col_w[c], 0.58, fill, line("E4E0D8"), radius=True))
            oid += 1
            s.append(text_box(oid, f"Cell text {r}-{c}", col_x[c] + 0.12, y + 0.1, col_w[c] - 0.24, 0.32, [{"text": text, "size": 9.7, "bold": c == 0, "color": color}], margin=0))
            oid += 1
    s.append(
        text_box(
            oid,
            "Closing line",
            0.82,
            6.65,
            11.2,
            0.32,
            [{"text": "Argumento final: Allpa no vende solo el aturdidor; vende una ruta para ordenar y escalar el beneficio.", "size": 12, "bold": True, "color": NAVY}],
            margin=0,
        )
    )
    slides.append(slide_xml(s))
    slide_media.append([])

    return slides, slide_media


def content_types(slide_count: int) -> str:
    slide_overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
  <Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
  <Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  {slide_overrides}
</Types>"""


def presentation_xml(slide_count: int) -> str:
    sld_ids = "".join(f'<p:sldId id="{255 + i}" r:id="rId{i}"/>' for i in range(1, slide_count + 1))
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{slide_count + 1}"/></p:sldMasterIdLst>
  <p:sldIdLst>{sld_ids}</p:sldIdLst>
  <p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>"""


def presentation_rels(slide_count: int) -> str:
    rels = [
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, slide_count + 1)
    ]
    rels.append(
        f'<Relationship Id="rId{slide_count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    )
    rels.append(
        f'<Relationship Id="rId{slide_count + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>'
    )
    rels.append(
        f'<Relationship Id="rId{slide_count + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>'
    )
    rels.append(
        f'<Relationship Id="rId{slide_count + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>'
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {''.join(rels)}
</Relationships>"""


def fixed_parts(slide_count: int) -> dict[str, str]:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "[Content_Types].xml": content_types(slide_count),
        "_rels/.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>""",
        "docProps/core.xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Infografias Aturdidor Allpa Crece</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>""",
        "docProps/app.xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>{slide_count}</Slides>
</Properties>""",
        "ppt/presentation.xml": presentation_xml(slide_count),
        "ppt/_rels/presentation.xml.rels": presentation_rels(slide_count),
        "ppt/presProps.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>""",
        "ppt/viewProps.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:viewPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>""",
        "ppt/tableStyles.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>""",
        "ppt/theme/theme1.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Allpa">
  <a:themeElements>
    <a:clrScheme name="Allpa">
      <a:dk1><a:srgbClr val="1F2A33"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="123D57"/></a:dk2><a:lt2><a:srgbClr val="F7F5F1"/></a:lt2>
      <a:accent1><a:srgbClr val="F47C20"/></a:accent1><a:accent2><a:srgbClr val="407C59"/></a:accent2>
      <a:accent3><a:srgbClr val="65727D"/></a:accent3><a:accent4><a:srgbClr val="DAD6CE"/></a:accent4>
      <a:accent5><a:srgbClr val="B64739"/></a:accent5><a:accent6><a:srgbClr val="ECE6DD"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Allpa"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Allpa"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle/></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>""",
        "ppt/slideMasters/slideMaster1.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>""",
        "ppt/slideMasters/_rels/slideMaster1.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>""",
        "ppt/slideLayouts/slideLayout1.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>""",
        "ppt/slideLayouts/_rels/slideLayout1.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>""",
    }


def write_pptx() -> None:
    slides, slide_media = build_slides()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT_FILE, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path, content in fixed_parts(len(slides)).items():
            zf.writestr(path, content)
        media_written: dict[Path, str] = {}
        media_index = 1
        for i, slide in enumerate(slides, start=1):
            zf.writestr(f"ppt/slides/slide{i}.xml", slide)
            media_targets = []
            for media in slide_media[i - 1]:
                target_name = f"image{media_index}.png"
                target = f"ppt/media/{target_name}"
                media_written[media] = target
                zf.write(media, target)
                media_targets.append(f"../media/{target_name}")
                media_index += 1
            zf.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", slide_rels(media_targets))


if __name__ == "__main__":
    write_pptx()
    print(OUT_FILE)
