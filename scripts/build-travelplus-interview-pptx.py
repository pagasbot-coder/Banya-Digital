#!/usr/bin/env python3
"""Travel+ Natural interview deck v1.14.3 — copy expand, structured blocks."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree
import os
import shutil

W = Inches(13.333)
H = Inches(7.5)

BG = RGBColor(0xF5, 0xF3, 0xEF)
ACCENT = RGBColor(0x2A, 0x55, 0x4A)
INK = RGBColor(0x1A, 0x1A, 0x1A)
MUTED = RGBColor(0x5C, 0x5C, 0x5C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
LINE = RGBColor(0xD4, 0xCE, 0xC4)

# Font stack #4: Manrope (display) + Golos Text (body)
FONT_DISPLAY = "Manrope"
FONT_BODY = "Golos Text"
FOOTER_TEXT = "Natural · пример презентации"

MARGIN_X = Inches(0.5)
CONTENT_TOP = Inches(1.05)
CARD_H = Inches(5.55)
GAP = Inches(0.28)
CARD_W = (W - 2 * MARGIN_X - GAP) / 2
STRIP_H = Inches(0.09)
CARD_PAD_X = Inches(0.38)
CARD_PAD_TOP = Inches(0.42)
CARD_PAD_BOTTOM = Inches(0.3)
TF_MARGIN_X = Pt(4)
TF_MARGIN_TOP = Pt(2)
TF_MARGIN_BOTTOM = Pt(2)


def pick_font(size=16, bold=False):
    if bold or size >= 19:
        return FONT_DISPLAY
    return FONT_BODY


def set_run(run, size=16, bold=False, color=INK, name=None):
    name = name or pick_font(size, bold)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("a:rFonts"))
    if rFonts is None:
        rFonts = etree.SubElement(rPr, qn("a:rFonts"))
    for attr in ("ascii", "hAnsi", "cs", "eastAsia"):
        rFonts.set(attr, name)


def configure_text_frame(tf, anchor=MSO_ANCHOR.TOP):
    tf.word_wrap = True
    tf.auto_size = None
    tf.vertical_anchor = anchor
    tf.margin_left = TF_MARGIN_X
    tf.margin_right = TF_MARGIN_X
    tf.margin_top = TF_MARGIN_TOP
    tf.margin_bottom = TF_MARGIN_BOTTOM


def add_bg(slide):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
    shp.fill.solid()
    shp.fill.fore_color.rgb = BG
    shp.line.fill.background()
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.1), H)
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT
    bar.line.fill.background()


def add_footer(slide, page, total=12):
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, MARGIN_X, Inches(6.85), W - 2 * MARGIN_X, Inches(0.015)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = LINE
    line.line.fill.background()
    box = slide.shapes.add_textbox(MARGIN_X, Inches(6.95), Inches(10.5), Inches(0.35))
    tf = box.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = FOOTER_TEXT
    set_run(r, 11, False, MUTED, FONT_BODY)
    box2 = slide.shapes.add_textbox(Inches(11.5), Inches(6.95), Inches(1.4), Inches(0.35))
    tf2 = box2.text_frame
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.RIGHT
    r2 = p2.add_run()
    r2.text = f"{page} / {total}"
    set_run(r2, 11, False, MUTED, FONT_BODY)


def add_title(slide, text):
    box = slide.shapes.add_textbox(MARGIN_X, Inches(0.28), Inches(12.3), Inches(0.55))
    tf = box.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = text
    set_run(r, 26, True, ACCENT)
    rule = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, MARGIN_X, Inches(0.88), Inches(2.2), Inches(0.04)
    )
    rule.fill.solid()
    rule.fill.fore_color.rgb = ACCENT
    rule.line.fill.background()


def add_card(slide, left, top, width, height):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shp.fill.solid()
    shp.fill.fore_color.rgb = CARD
    shp.line.color.rgb = LINE
    shp.line.width = Pt(1)
    try:
        shp.adjustments[0] = 0.06
    except Exception:
        pass
    strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, STRIP_H)
    strip.fill.solid()
    strip.fill.fore_color.rgb = ACCENT
    strip.line.fill.background()
    return shp


def write_block(slide, left, top, width, height, lines, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    configure_text_frame(tf)
    tf.clear()
    for i, item in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = item.get("align", align)
        p.space_before = Pt(item.get("before", 0))
        p.space_after = Pt(item.get("after", 8))
        p.line_spacing = item.get("line_spacing", 1.18)
        r = p.add_run()
        r.text = item["text"]
        size = item.get("size", 16)
        bold = item.get("bold", False)
        set_run(r, size, bold, item.get("color", INK), item.get("font", pick_font(size, bold)))
    return box


def card_header(text):
    return {
        "text": text,
        "size": 15,
        "bold": True,
        "color": ACCENT,
        "after": 12,
        "before": 0,
        "font": FONT_DISPLAY,
    }


def body(text, **kw):
    d = {"text": text, "size": 16, "bold": False, "color": INK, "after": 8}
    d.update(kw)
    return d


def muted(text, **kw):
    d = {"text": text, "size": 14, "bold": False, "color": MUTED, "after": 6}
    d.update(kw)
    return d


def strong(text, **kw):
    d = {"text": text, "size": 16, "bold": True, "color": INK, "after": 8}
    d.update(kw)
    return d


def dense(text, **kw):
    d = {"text": text, "size": 15, "bold": False, "color": INK, "after": 6}
    d.update(kw)
    return d


def footnote(text, **kw):
    d = {"text": text, "size": 12, "bold": False, "color": MUTED, "before": 18, "after": 0}
    d.update(kw)
    return d


def labeled(title, text, **kw):
    gap = kw.pop("gap", 10)
    return [
        strong(title, size=15, after=2),
        dense(text, after=gap, **{k: v for k, v in kw.items() if k != "gap"}),
    ]



def card_text_area(left, top, width, height):
    """Text box inset: below accent strip, with horizontal and bottom padding."""
    tx = left + CARD_PAD_X
    ty = top + STRIP_H + CARD_PAD_TOP
    tw = width - 2 * CARD_PAD_X
    th = height - STRIP_H - CARD_PAD_TOP - CARD_PAD_BOTTOM
    return tx, ty, tw, th


def two_cards(slide):
    left = MARGIN_X
    right = MARGIN_X + CARD_W + GAP
    add_card(slide, left, CONTENT_TOP, CARD_W, CARD_H)
    add_card(slide, right, CONTENT_TOP, CARD_W, CARD_H)
    return card_text_area(left, CONTENT_TOP, CARD_W, CARD_H), card_text_area(
        right, CONTENT_TOP, CARD_W, CARD_H
    )


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    blank = prs.slide_layouts[6]

    # 1 Title
    s = prs.slides.add_slide(blank)
    add_bg(s)
    panel = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(5.1), H)
    panel.fill.solid()
    panel.fill.fore_color.rgb = ACCENT
    panel.line.fill.background()
    write_block(
        s,
        Inches(0.55),
        Inches(2.15),
        Inches(4.2),
        Inches(3.2),
        [
            {"text": "Павел Биджиев", "size": 30, "bold": True, "color": WHITE, "after": 14},
            {"text": "Продакт / бренд-логика", "size": 17, "color": WHITE, "after": 8},
            {
                "text": "Физические товары · HoReCa amenities",
                "size": 14,
                "color": RGBColor(0xC8, 0xDD, 0xD6),
                "after": 0,
            },
        ],
    )
    write_block(
        s,
        Inches(5.7),
        Inches(2.0),
        Inches(6.9),
        Inches(3.8),
        [
            {"text": "Travel+ Natural", "size": 32, "bold": True, "color": ACCENT, "after": 12},
            {"text": "Своя натуральная линейка:", "size": 19, "color": INK, "after": 4},
            {"text": "от рамки до пилота", "size": 19, "color": INK, "after": 18},
            {
                "text": "Подготовка · АК-Сервис / Travel+ · Кириши",
                "size": 14,
                "color": MUTED,
                "after": 6,
            },
            {"text": "Образец презентации · не оферта", "size": 14, "color": MUTED, "after": 0},
        ],
    )

    # 2 Role
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Как понял роль")
    add_footer(s, 2)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Travel+"),
            *labeled("Поставка на номер", "One-stop: косметика, тапочки, наборы"),
            *labeled(
                "Контур производства",
                "Своё производство и сборка; закупки и производство в Китае",
            ),
            *labeled("Фокус роли", "Товар от идеи до полки и маржи.", gap=0),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Роль здесь"),
            *labeled("Ассортимент", "Новинки и позиция в доме брендов"),
            *labeled("Продукт", "Доказательства до выхода на витрину"),
            *labeled("Связка", "Технолог → продажи → экономика → поставка", gap=0),
        ],
    )

    # 3 Gap
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Дыра на витрине")
    add_footer(s, 3)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Рынок"),
            *labeled(
                "Конкуренты",
                "ЕТС Natural · MEZO · Natura Siberica (чужой премиум в каталоге)",
            ),
            *labeled("Сила Travel+", "Массовый и средний сегмент"),
            *labeled("Дыра", "Своей Natural с документами нет", gap=0),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Ценовая лестка (не оферта)"),
            *labeled("Hotel Line", "12–15 ₽ / 30 мл"),
            *labeled("ЕТС Natural", "18 ₽ / 25 мл"),
            *labeled("Natura Siberica", "30–40 ₽ и выше"),
            *labeled("Место Natural", "Между Hotel Line и Natura Siberica", gap=0),
        ],
    )

    # 4 Portfolio
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Дом линеек")
    add_footer(s, 4)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Портфель"),
            *labeled("Hotel Line", "Цена и базовый сегмент"),
            *labeled("Fleur / Aquatique / La Nuit", "Дизайн и аромат"),
            *labeled("Natural", "Натуральность и документы"),
            *labeled("Natura Siberica", "Чужой премиум в каталоге"),
            *labeled("СТМ", "Отдельный проект под логотип отеля", gap=0),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Как не мешать линейки"),
            *labeled("Fleur", "Закрывает дизайн и аромат в номере"),
            *labeled("Natural", "Закрывает запрос eco и пакет документов"),
            *labeled("Между собой", "Не конкурируют — разные задачи"),
            *labeled(
                "На объекте",
                "Стандартные номера — Hotel Line или Fleur; wellness-этаж — Natural",
                gap=0,
            ),
        ],
    )

    # 5 Promise
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Обещание + StoryBrand")
    add_footer(s, 5)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Обещание"),
            *labeled("Суть", "Мягкий уход с понятной натуральностью"),
            *labeled(
                "Для кого",
                "Отель, которому важен комфорт гостя и спокойная проверка документов",
            ),
            *labeled("Состав", "Согласованные границы + блок «простыми словами» на этикетке"),
            *labeled("Пакет", "Документы Travel+, one-stop на номер"),
            *labeled(
                "В номере",
                "Ощущение после использования, не только надпись на флаконе",
                gap=0,
            ),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("BrandScript"),
            *labeled(
                "Герой",
                "Закупщик eco / wellness: выглядеть «зеленее» без дыры в бюджете и в бумагах",
            ),
            *labeled("Проводник", "Travel+ Natural — своя линейка и один договор на номер"),
            *labeled("План", "Сегмент → образец с документами → пилот на этаже"),
            *labeled(
                "Гость",
                "После дороги — мягче, чем ожидал; натуральность без громких обещаний",
                gap=0,
            ),
        ],
    )

    # 6 DoD
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Готовность продукта перед рынком")
    add_footer(s, 6)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Чеклист"),
            *labeled("Натуральность", "Метод расчёта и доля ингредиентов", gap=8),
            *labeled(
                "Документы",
                "Пакет как у Hotel Line и Fleur + лист состава Natural",
                gap=8,
            ),
            *labeled("Происхождение", "Origin зафиксирован письменно", gap=8),
            *labeled("Тест", "Слепой тест запаха и ощущения с гостями", gap=8),
            *labeled("Этикетка", "Блок «простыми словами»", gap=8),
            *labeled("Экономика", "Себестоимость и коридор цены на полке", gap=8),
            *labeled("Поставка", "Срок, минимальный заказ, правила брака", gap=0),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Как читать"),
            *labeled(
                "Правило",
                "Каждый пункт обязателен; пока не закрыт — в продажи и на витрину не выходим",
            ),
            *labeled("COSMOS", "Знака нет — говорим честно, не обещаем сертификат", gap=0),
        ],
    )

    # 7 Pitch
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Питч закупщику (30 секунд)")
    add_footer(s, 7)
    pitch_w = W - 2 * MARGIN_X
    pitch_h = Inches(4.75)
    add_card(s, MARGIN_X, CONTENT_TOP, pitch_w, pitch_h)
    px, py, pw, ph = card_text_area(MARGIN_X, CONTENT_TOP, pitch_w, pitch_h)
    footnote_h = Inches(0.48)
    main_h = ph - footnote_h
    write_block(
        s,
        px,
        py,
        pw,
        main_h,
        [
            *labeled(
                "Задача",
                "Отель хочет выглядеть экологичнее — без риска для гостя "
                "и без пробелов в документах",
            ),
            *labeled(
                "Предложение",
                "Travel+ Natural: пакет как у Hotel Line и Fleur "
                "(декларация, INCI, протоколы по запросу)",
            ),
            *labeled(
                "На номер",
                "Состав с блоком «простыми словами», один договор на весь номер",
                gap=8,
            ),
            *labeled("Шаг 1", "Сегмент eco / wellness и объект", gap=8),
            *labeled("Шаг 2", "Образец с этикеткой и документами", gap=8),
            *labeled("Шаг 3", "Пилот на этаже или в корпусе", gap=0),
        ],
    )
    write_block(
        s,
        px,
        py + main_h,
        pw,
        footnote_h,
        [
            footnote(
                "Отрицания (COSMOS, происхождение, цена Hotel Line) — только в блоке возражений.",
                before=0,
            )
        ],
    )

    # 8 Objections
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Поле: возражения и риски")
    add_footer(s, 8)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Возражения и ответы"),
            *labeled(
                "COSMOS в тендере обязателен",
                "Знака нет — Natural в КП не ставим. Hotel Line или отказ.",
                gap=8,
            ),
            *labeled(
                "«Natural по цене Hotel Line»",
                "Нет. Другая себестоимость и позиция на полке.",
                gap=8,
            ),
            *labeled(
                "СТМ / логотип отеля",
                "Отдельный проект. Не маскируем под Natural.",
                gap=8,
            ),
            *labeled(
                "«Где произведено?»",
                "Только зафиксированное происхождение. Без догадок.",
                gap=0,
            ),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Полевая дисциплина"),
            *labeled("Реестр рисков", "Один лист в пульте — 14 пунктов"),
            *labeled("Сегмент", "Не размываем: Natural не уходит в эконом-запрос"),
            *labeled(
                "Цена",
                "Не продаём Natural вместо Hotel Line по цене базовой линейки",
                gap=0,
            ),
        ],
    )

    # 9 Pilot
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Пилот: успех, провал, выход")
    add_footer(s, 9)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Успех"),
            *labeled("Клиенты", "Три пилотных объекта", gap=8),
            *labeled("Повтор", "Заказ повторяют минимум два из трёх", gap=8),
            *labeled("Опрос", "Мягкость и ощущение натуральности — не ниже 70%", gap=8),
            *labeled("Цена", "Natural не ушёл в эконом Hotel Line", gap=8),
            footnote("Цифры сценария — учебный пример, не отчёт завода."),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Провал и выход"),
            *labeled(
                "Провал",
                "Повтор у меньше двух из трёх — или метрики ниже 60%",
                gap=8,
            ),
            *labeled("Действие", "Останавливаем масштабирование", gap=8),
            *labeled("Диагноз", "Бренд-менеджер — в течение двух недель", gap=8),
            *labeled("Второй круг", "Снова провал → закрываем линейку", gap=8),
            footnote("Пороги — для учебного сценария в пульте, не KPI завода."),
        ],
    )

    # 10 Logistics
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Поставки и экономика (Китай)")
    add_footer(s, 10)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Экономика"),
            *labeled("Прайс", "Только после себестоимости на складе в Киришах"),
            *labeled("Hotel Line", "Выше по цене", gap=8),
            *labeled("ЕТС Natural", "Рядом по цене", gap=8),
            *labeled("Natura Siberica", "Ниже по цене", gap=8),
            *labeled("Стратегия", "Не воюем копейкой с ЕТС", gap=8),
            *labeled("Выигрыш", "Пакет документов и ощущение в номере", gap=0),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Поставка из Китая"),
            *labeled("Шаг 1", "Сравниваем заводы в цене FOB", gap=8),
            *labeled("Шаг 2", "Логистику до Кириши — отдельной строкой", gap=8),
            *labeled(
                "Шаг 3",
                "Полная цена = FOB + фрахт + таможня + довоз + запас",
                gap=8,
            ),
            *labeled("Срок", "Дата «на складе», не «завод отгрузил»", gap=8),
            *labeled(
                "Происхождение",
                "Не зафиксировано — не называем «российское»",
                gap=0,
            ),
        ],
    )

    # 11 Cost expertise
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Себестоимость: как считаю")
    add_footer(s, 11)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Цена на складе"),
            *labeled("FOB", "База сравнения заводов — отдельно от логистики", gap=8),
            *labeled("Доставка", "Фрахт, экспедитор, довоз до Кириши", gap=8),
            *labeled("Таможня", "Пошлина, НДС, брокер", gap=8),
            *labeled("Запас", "Брак, пересорт, курс", gap=8),
            *labeled(
                "Итог",
                "Сумма строк = цена на складе → из неё прайс и маржа",
                gap=8,
            ),
            footnote("Без этой таблицы прайс Natural не утверждаю."),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Правила расчёта"),
            *labeled("Заводы", "Минимум два FOB в сравнении до контракта", gap=8),
            *labeled("Прайс", "Только после landed cost, не «с потолка»", gap=8),
            *labeled("Маржа", "Natural и Hotel Line — разная экономика", gap=8),
            *labeled("Срок в КП", "Дата «на складе», не «завод отгрузил»", gap=8),
            *labeled(
                "Коридор",
                "Выше Hotel Line, рядом с ЕТС, ниже Natura Siberica",
                gap=0,
            ),
        ],
    )

    # 12 Close — join the team
    s = prs.slides.add_slide(blank)
    add_bg(s)
    add_title(s, "Итог")
    add_footer(s, 12)
    L, R = two_cards(s)
    write_block(
        s,
        *L,
        [
            card_header("Почему Travel+"),
            *labeled(
                "Задача",
                "Физический товар: своё производство, Китай, дыра Natural на полке",
                gap=8,
            ),
            *labeled(
                "Роль",
                "От рамки линейки до пилота — продукт, цена, документы, поставка",
                gap=8,
            ),
            *labeled(
                "Старт",
                "Блокеры этапа 2 с технологом и пилотный сегмент eco / wellness",
                gap=0,
            ),
        ],
    )
    write_block(
        s,
        *R,
        [
            card_header("Готов присоединиться"),
            *labeled(
                "Направление",
                "Вести Natural и работать с линейкой в этом контуре",
                gap=8,
            ),
            *labeled(
                "Подход",
                "Цифры и рамка в руках у продаж и завода — не презентация ради слайдов",
                gap=8,
            ),
            *labeled("Финал", "Буду рад присоединиться к команде. Спасибо. Вопросы?", gap=0),
        ],
    )

    out = "knowledge-base/presentation-travelplus-interview.pptx"
    prs.save(out)
    dests = [
        "АК/presentation-travelplus-interview.pptx",
        "/opt/cursor/artifacts/presentation-travelplus-interview.pptx",
        "/opt/cursor/artifacts/АК/presentation-travelplus-interview.pptx",
        "/home/ubuntu/АК/presentation-travelplus-interview.pptx",
        "/home/ubuntu/Desktop/АК/presentation-travelplus-interview.pptx",
    ]
    for dest in dests:
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        shutil.copy2(out, dest)
    print("saved", out, "slides", len(prs.slides))
    return out


if __name__ == "__main__":
    build()
