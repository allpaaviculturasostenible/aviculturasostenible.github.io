from __future__ import annotations

import zipfile
from pathlib import Path

from PIL import Image, ImageOps

import generate_aturdidor_pptx as base


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "presentaciones" / "plantillas"
OUT_FILE = OUT_DIR / "plantillas-infografias-allpa-crece.pptx"
MEDIA_DIR = OUT_DIR / "media"

SLIDE_SIZE = 7.5

DARK_GREEN = base.DARK_GREEN
GREEN = base.GREEN
GRASS = base.GRASS
LIME = base.LIME
LIGHT_GREEN = base.LIGHT_GREEN
NAVY = base.NAVY
ORANGE = base.ORANGE
PAPER = base.PAPER
WHITE = base.WHITE
INK = base.INK
MUTED = base.MUTED
LINE = base.LINE


def prep_media() -> dict[str, Path]:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    aturdidor = Image.open(ROOT / "assets" / "allpa_aturdidor_productos" / "aturdidor-un-pollo-base-placeholder.png").convert("RGBA")
    conos = Image.open(ROOT / "assets" / "allpa_conos_productos_webp" / "base_5_conos_allpa_tech_1200.png").convert("RGBA")

    wide_aturdidor = ImageOps.fit(aturdidor, (1200, 520), method=Image.Resampling.LANCZOS, centering=(0.56, 0.47))
    detail_aturdidor = ImageOps.fit(aturdidor, (1050, 430), method=Image.Resampling.LANCZOS, centering=(0.38, 0.48))
    square_aturdidor = ImageOps.fit(aturdidor, (1080, 1080), method=Image.Resampling.LANCZOS, centering=(0.54, 0.48))
    wide_conos = ImageOps.fit(conos, (1200, 520), method=Image.Resampling.LANCZOS, centering=(0.52, 0.46))

    paths = {
        "aturdidor_wide": MEDIA_DIR / "template-aturdidor-wide.png",
        "aturdidor_detail": MEDIA_DIR / "template-aturdidor-detail.png",
        "aturdidor_square": MEDIA_DIR / "template-aturdidor-square.png",
        "conos_wide": MEDIA_DIR / "template-conos-wide.png",
    }
    base.rounded(wide_aturdidor, 58).save(paths["aturdidor_wide"])
    base.rounded(detail_aturdidor, 52).save(paths["aturdidor_detail"])
    base.rounded(square_aturdidor, 72).save(paths["aturdidor_square"])
    base.rounded(wide_conos, 58).save(paths["conos_wide"])
    return paths


def footer(shapes: list[str], oid: int, dark: bool = False) -> int:
    color = WHITE if dark else DARK_GREEN
    tag = "D9E8D1" if dark else INK
    rule = LIME if dark else GRASS
    shapes.append(base.shape_rect(oid, "Footer line", 0.48, 6.88, 6.55, 0.025, rule))
    oid += 1
    shapes.append(base.text_box(oid, "Footer brand", 0.48, 7.06, 1.75, 0.25, [{"text": "ALLPA CRECE", "size": 14, "bold": True, "color": color}], margin=0))
    oid += 1
    shapes.append(base.text_box(oid, "Footer tag", 2.55, 7.08, 4.1, 0.25, [{"text": "Calidad que se nota. Resultados que crecen.", "size": 9.5, "color": tag}], margin=0))
    return oid + 1


def add_leaf(shapes: list[str], oid: int, x: float, y: float) -> int:
    shapes.append(base.shape_rect(oid, "Leaf circle", x, y, 0.86, 0.86, None, base.line(LIME, 31750), radius=True))
    oid += 1
    shapes.append(base.shape_rect(oid, "Leaf 1", x + 0.12, y + 0.22, 0.42, 0.28, LIME, radius=True))
    oid += 1
    shapes.append(base.shape_rect(oid, "Leaf 2", x + 0.43, y + 0.3, 0.35, 0.24, "D7ECA4", radius=True))
    return oid + 1


def build_slides() -> tuple[list[str], list[list[Path]]]:
    media = prep_media()
    slides: list[str] = []
    slide_media: list[list[Path]] = []

    # 1. Inicio / bienvenida
    s: list[str] = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, DARK_GREEN))
    oid += 1
    s.append(base.shape_rect(oid, "Decor circle 1", 5.32, 0.66, 2.05, 2.05, None, base.line(LIME, 19050), radius=True))
    oid += 1
    s.append(base.shape_rect(oid, "Decor circle 2", -0.65, 4.38, 2.55, 2.55, None, base.line(LIME, 19050), radius=True))
    oid += 1
    s.append(base.image_pic(oid, "Product image", "rId2", 0.62, 0.55, 6.26, 2.25))
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Welcome title",
            0.62,
            3.05,
            3.8,
            1.45,
            [
                {"text": "Bienvenido a", "size": 23, "italic": True, "color": WHITE},
                {"text": "ALLPA", "size": 34, "bold": True, "color": WHITE},
                {"text": "CRECE", "size": 34, "bold": True, "color": LIME},
            ],
            margin=0,
        )
    )
    oid += 1
    oid = add_leaf(s, oid, 5.55, 3.42)
    s.append(
        base.text_box(
            oid,
            "Copy card",
            0.5,
            5.05,
            6.55,
            1.2,
            [
                {"text": "Ordena tu proceso desde el primer equipo.", "size": 20, "bold": True, "color": DARK_GREEN},
                {"text": "Mas control, mas bienestar y una ruta para crecer por etapas.", "size": 15.5, "color": INK},
            ],
            fill=WHITE,
            ln=base.line(LIME, 19050),
            radius=True,
            margin=110000,
        )
    )
    oid += 1
    oid = footer(s, oid, dark=True)
    slides.append(base.slide_xml(s))
    slide_media.append([media["conos_wide"]])

    # 2. Paso
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, LIGHT_GREEN))
    oid += 1
    s.append(base.shape_rect(oid, "Step badge", 0.48, 0.48, 1.55, 0.72, GRASS, radius=True))
    oid += 1
    s.append(base.text_box(oid, "Step number", 0.66, 0.55, 0.48, 0.48, [{"text": "1", "size": 32, "bold": True, "color": WHITE}], margin=0))
    oid += 1
    s.append(base.text_box(oid, "Step word", 1.24, 0.72, 0.62, 0.24, [{"text": "PASO", "size": 14, "bold": True, "color": WHITE}], margin=0))
    oid += 1
    s.append(base.image_pic(oid, "Step image", "rId2", 0.48, 1.5, 6.55, 2.2))
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Step card",
            0.48,
            4.05,
            6.55,
            1.95,
            [
                {"text": "Define el siguiente paso", "size": 23, "bold": True, "color": DARK_GREEN},
                {"text": "Explica una accion concreta que el avicultor pueda imaginar en su proceso.", "size": 15.5, "color": INK},
                {"text": "Usala para guias de uso, instalacion, limpieza o compra por etapas.", "size": 12.5, "color": MUTED},
            ],
            fill=WHITE,
            ln=base.line("D4E0CF", 15240),
            radius=True,
            margin=130000,
        )
    )
    oid += 1
    s.append(base.shape_rect(oid, "Icon circle", 0.74, 4.38, 0.78, 0.78, None, base.line(GRASS, 25400), radius=True))
    oid += 1
    s.append(base.text_box(oid, "Icon symbol", 0.94, 4.58, 0.36, 0.25, [{"text": "OK", "size": 13, "bold": True, "color": GRASS}], margin=0))
    oid += 1
    oid = footer(s, oid)
    slides.append(base.slide_xml(s))
    slide_media.append([media["aturdidor_detail"]])

    # 3. Cierre / CTA
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, "F2F6EA"))
    oid += 1
    s.append(base.shape_rect(oid, "Green corner horizontal", 0, 0, 3.3, 0.82, DARK_GREEN))
    oid += 1
    s.append(base.shape_rect(oid, "Green corner vertical", 0, 0, 0.82, 3.2, DARK_GREEN))
    oid += 1
    s.append(base.image_pic(oid, "Closing image", "rId2", 4.15, 0.72, 2.9, 1.6))
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Closing headline",
            0.62,
            0.92,
            3.45,
            2.0,
            [
                {"text": "LISTO PARA", "size": 27, "color": GRASS},
                {"text": "CRECER", "size": 37, "bold": True, "color": INK},
                {"text": "CON ALLPA", "size": 24, "bold": True, "color": INK},
            ],
            margin=0,
        )
    )
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Closing card",
            0.55,
            3.35,
            6.4,
            1.55,
            [
                {"text": "Escoge la version que acompana tu etapa.", "size": 20, "bold": True, "color": DARK_GREEN},
                {"text": "Cotiza segun tu volumen, presupuesto y siguiente cuello de botella.", "size": 14.5, "color": INK},
            ],
            fill=WHITE,
            ln=base.line("D4E0CF", 15240),
            radius=True,
            margin=120000,
        )
    )
    oid += 1
    for i, label in enumerate(["BASICO", "EMPRENDEDOR", "PLANTA"]):
        x = 0.68 + i * 2.15
        s.append(base.shape_rect(oid, f"Pill {i}", x, 5.36, 1.7, 0.5, GRASS, radius=True))
        oid += 1
        s.append(base.text_box(oid, f"Pill text {i}", x + 0.1, 5.5, 1.5, 0.18, [{"text": label, "size": 10.2, "bold": True, "color": WHITE, "align": "center"}], margin=0))
        oid += 1
    s.append(base.text_box(oid, "CTA", 0.72, 6.18, 5.9, 0.28, [{"text": "Pide asesoria y arma tu ruta de compra por etapas.", "size": 13.5, "bold": True, "color": DARK_GREEN}], margin=0))
    oid += 1
    oid = footer(s, oid)
    slides.append(base.slide_xml(s))
    slide_media.append([media["aturdidor_wide"]])

    # 4. Solo imagen
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, DARK_GREEN))
    oid += 1
    s.append(base.image_pic(oid, "Full image", "rId2", 0.36, 0.44, 6.78, 5.82))
    oid += 1
    s.append(base.shape_rect(oid, "Top label", 0.55, 0.68, 2.4, 0.44, GRASS, radius=True))
    oid += 1
    s.append(base.text_box(oid, "Top label text", 0.76, 0.8, 2.05, 0.18, [{"text": "PRODUCTO EN ACCION", "size": 10.5, "bold": True, "color": WHITE, "align": "center"}], margin=0))
    oid += 1
    s.append(base.text_box(oid, "Photo caption", 0.65, 6.32, 5.9, 0.34, [{"text": "Usa esta plantilla cuando la imagen ya cuenta la historia.", "size": 15.5, "bold": True, "color": WHITE}], margin=0))
    oid += 1
    oid = footer(s, oid, dark=True)
    slides.append(base.slide_xml(s))
    slide_media.append([media["aturdidor_square"]])

    # 5. Solo texto
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, PAPER))
    oid += 1
    s.append(base.shape_rect(oid, "Green block", 0, 0, 1.0, 7.5, DARK_GREEN))
    oid += 1
    s.append(base.shape_rect(oid, "Orange dot", 0.58, 0.62, 0.34, 0.34, ORANGE, radius=True))
    oid += 1
    s.append(base.text_box(oid, "Text only eyebrow", 1.35, 0.74, 3.8, 0.25, [{"text": "MENSAJE CLAVE", "size": 12, "bold": True, "color": GRASS}], margin=0))
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Text only headline",
            1.32,
            1.35,
            5.55,
            2.1,
            [{"text": "Cuando el proceso crece, improvisar sale mas caro.", "size": 33, "bold": True, "color": INK}],
            margin=0,
        )
    )
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Text only body",
            1.35,
            3.8,
            5.35,
            1.12,
            [
                {"text": "Explica una sola idea por tarjeta. El avicultor debe entender el problema, el beneficio y el siguiente paso sin leer demasiado.", "size": 17, "color": DARK_GREEN}
            ],
            margin=0,
        )
    )
    oid += 1
    s.append(base.shape_rect(oid, "Text only callout", 1.35, 5.34, 5.55, 0.72, WHITE, base.line("D4E0CF", 15240), radius=True))
    oid += 1
    s.append(base.text_box(oid, "Text only callout text", 1.58, 5.55, 5.0, 0.22, [{"text": "Ideal para objeciones, promesas y comparaciones simples.", "size": 12.5, "bold": True, "color": DARK_GREEN}], margin=0))
    oid += 1
    oid = footer(s, oid)
    slides.append(base.slide_xml(s))
    slide_media.append([])

    # 6. Estadisticas
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, LIGHT_GREEN))
    oid += 1
    s.append(base.text_box(oid, "Stats title", 0.55, 0.62, 5.8, 0.75, [{"text": "Mide lo que mejora", "size": 31, "bold": True, "color": DARK_GREEN}], margin=0))
    oid += 1
    s.append(base.text_box(oid, "Stats subtitle", 0.58, 1.28, 5.9, 0.36, [{"text": "Una plantilla para resultados, capacidad, ahorro o tiempos de proceso.", "size": 13, "color": INK}], margin=0))
    oid += 1
    stats = [("3x", "Mas orden", "Menos esperas entre pasos"), ("1", "Equipo inicial", "Compra por etapas"), ("110V", "Conexion simple", "Lista para la granja")]
    for i, (big, head, body) in enumerate(stats):
        x = 0.52 + i * 2.22
        s.append(base.shape_rect(oid, f"Stat card {i}", x, 2.1, 1.82, 2.16, WHITE, base.line("D4E0CF", 15240), radius=True))
        oid += 1
        s.append(base.text_box(oid, f"Stat big {i}", x + 0.2, 2.42, 1.35, 0.55, [{"text": big, "size": 29, "bold": True, "color": GRASS, "align": "center"}], margin=0))
        oid += 1
        s.append(base.text_box(oid, f"Stat text {i}", x + 0.18, 3.12, 1.42, 0.85, [{"text": head, "size": 13, "bold": True, "color": DARK_GREEN, "align": "center"}, {"text": body, "size": 9.8, "color": MUTED, "align": "center"}], margin=0))
        oid += 1
    s.append(base.shape_rect(oid, "Progress rail", 0.76, 4.82, 5.95, 0.18, "DCE9D3", radius=True))
    oid += 1
    s.append(base.shape_rect(oid, "Progress fill", 0.76, 4.82, 4.35, 0.18, GRASS, radius=True))
    oid += 1
    s.append(
        base.text_box(
            oid,
            "Stats note",
            0.78,
            5.34,
            5.9,
            0.72,
            [{"text": "Reemplaza estos datos por cifras reales de cada equipo: capacidad, garantia, ahorro, precio o pasos del proceso.", "size": 13.2, "bold": True, "color": DARK_GREEN}],
            margin=0,
        )
    )
    oid += 1
    oid = footer(s, oid)
    slides.append(base.slide_xml(s))
    slide_media.append([])

    # 7. Iconos
    s = []
    oid = 2
    s.append(base.shape_rect(oid, "Background", 0, 0, SLIDE_SIZE, SLIDE_SIZE, DARK_GREEN))
    oid += 1
    s.append(base.text_box(oid, "Icon title", 0.58, 0.58, 5.8, 0.78, [{"text": "4 razones para elegirlo", "size": 29, "bold": True, "color": WHITE}], margin=0))
    oid += 1
    s.append(base.text_box(oid, "Icon subtitle", 0.6, 1.24, 5.9, 0.32, [{"text": "Convierte beneficios tecnicos en mensajes faciles de recordar.", "size": 12.5, "color": "D9E8D1"}], margin=0))
    oid += 1
    icon_cards = [("ON", "Uso simple", "Accion clara para el operario"), ("$", "Compra gradual", "Empieza segun tu etapa"), ("1A", "Garantia", "Respaldo por defectos"), ("UP", "Retoma", "Actualiza cuando creces")]
    for i, (icon, head, body) in enumerate(icon_cards):
        x = 0.62 + (i % 2) * 3.25
        y = 2.05 + (i // 2) * 1.9
        s.append(base.shape_rect(oid, f"Icon card {i}", x, y, 2.75, 1.45, WHITE, base.line(LIME, 15240), radius=True))
        oid += 1
        s.append(base.shape_rect(oid, f"Icon circle {i}", x + 0.2, y + 0.25, 0.72, 0.72, None, base.line(GRASS, 25400), radius=True))
        oid += 1
        s.append(base.text_box(oid, f"Icon text {i}", x + 0.32, y + 0.48, 0.48, 0.18, [{"text": icon, "size": 10.5, "bold": True, "color": GRASS, "align": "center"}], margin=0))
        oid += 1
        s.append(base.text_box(oid, f"Icon copy {i}", x + 1.05, y + 0.28, 1.42, 0.7, [{"text": head, "size": 13.2, "bold": True, "color": DARK_GREEN}, {"text": body, "size": 9.6, "color": MUTED}], margin=0))
        oid += 1
    s.append(base.text_box(oid, "Icon CTA", 0.72, 5.92, 5.9, 0.32, [{"text": "Usala para beneficios, componentes incluidos o diferencias frente a alternativas.", "size": 12.5, "bold": True, "color": LIME}], margin=0))
    oid += 1
    oid = footer(s, oid, dark=True)
    slides.append(base.slide_xml(s))
    slide_media.append([])

    return slides, slide_media


def fixed_parts(slide_count: int) -> dict[str, str]:
    parts = base.fixed_parts(slide_count)
    parts["docProps/core.xml"] = parts["docProps/core.xml"].replace(
        "Infografias Aturdidor Allpa Crece", "Plantillas Infografias Allpa Crece"
    )
    parts["docProps/app.xml"] = parts["docProps/app.xml"].replace("<PresentationFormat>Widescreen</PresentationFormat>", "<PresentationFormat>Square</PresentationFormat>")
    parts["ppt/presentation.xml"] = parts["ppt/presentation.xml"].replace(
        'cx="12192000" cy="6858000" type="wide"', 'cx="6858000" cy="6858000" type="custom"'
    )
    return parts


def write_pptx() -> None:
    slides, slide_media = build_slides()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT_FILE, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path, content in fixed_parts(len(slides)).items():
            zf.writestr(path, content)
        media_index = 1
        for i, slide in enumerate(slides, start=1):
            zf.writestr(f"ppt/slides/slide{i}.xml", slide)
            media_targets = []
            for media in slide_media[i - 1]:
                target_name = f"image{media_index}.png"
                zf.write(media, f"ppt/media/{target_name}")
                media_targets.append(f"../media/{target_name}")
                media_index += 1
            zf.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", base.slide_rels(media_targets))


if __name__ == "__main__":
    write_pptx()
    print(OUT_FILE)
