from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "wollie-money-plan-visual-system.pdf"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Verdana.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Verdana Bold.ttf"
pdfmetrics.registerFont(TTFont("Wollie", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("Wollie-Bold", FONT_BOLD))

INK = colors.HexColor("#081A2B")
MUTED = colors.HexColor("#657383")
LINE = colors.HexColor("#D9E0E5")
TRACK = colors.HexColor("#EDF1F2")
GREEN = colors.HexColor("#00956F")
GREEN_LIGHT = colors.HexColor("#DDF5EC")
AMBER = colors.HexColor("#C47700")
AMBER_LIGHT = colors.HexColor("#FFF2D7")
RED = colors.HexColor("#C62828")
RED_LIGHT = colors.HexColor("#FCE7E7")
WHITE = colors.white
PAPER = colors.HexColor("#FBFCFB")

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
MARGIN_TOP = 21 * mm
MARGIN_BOTTOM = 17 * mm
CONTENT_W = PAGE_W - (2 * MARGIN_X)


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="WTitle", fontName="Wollie-Bold", fontSize=27, leading=32,
    textColor=INK, spaceAfter=5 * mm,
))
styles.add(ParagraphStyle(
    name="WDeck", fontName="Wollie", fontSize=11.2, leading=17,
    textColor=MUTED, spaceAfter=6 * mm,
))
styles.add(ParagraphStyle(
    name="WH1", fontName="Wollie-Bold", fontSize=18, leading=23,
    textColor=INK, spaceBefore=2 * mm, spaceAfter=4 * mm,
))
styles.add(ParagraphStyle(
    name="WH2", fontName="Wollie-Bold", fontSize=11.2, leading=15,
    textColor=INK, spaceBefore=3 * mm, spaceAfter=1.5 * mm,
))
styles.add(ParagraphStyle(
    name="WBody", fontName="Wollie", fontSize=8.6, leading=13.2,
    textColor=INK, spaceAfter=2.5 * mm,
))
styles.add(ParagraphStyle(
    name="WSmall", fontName="Wollie", fontSize=7.1, leading=10.2,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="WLabel", fontName="Wollie-Bold", fontSize=6.7, leading=8.5,
    textColor=MUTED, tracking=1.1,
))
styles.add(ParagraphStyle(
    name="WCallout", fontName="Wollie-Bold", fontSize=12.5, leading=18,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="WCell", fontName="Wollie", fontSize=7.1, leading=10.2,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="WCellHead", fontName="Wollie-Bold", fontSize=6.8, leading=9,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="WRef", fontName="Wollie", fontSize=6.3, leading=9.3,
    textColor=MUTED,
))


def p(text: str, style: str = "WBody") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(text: str) -> Paragraph:
    return Paragraph(f"<font color='#00956F'>●</font>&nbsp;&nbsp;{text}", styles["WBody"])


def card(content, bg=WHITE, border=LINE, padding=5 * mm, widths=None):
    data = [[content]]
    table = Table(data, colWidths=widths or [CONTENT_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.7, border),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


class ProgressPair(Flowable):
    def __init__(self, funded: float, spent_ratio: float, overspent: bool = False, width=92 * mm):
        super().__init__()
        self.width = width
        self.height = 16 * mm
        self.funded = max(0, min(1, funded))
        self.spent_ratio = max(0, min(1, spent_ratio))
        self.overspent = overspent

    def draw(self):
        c = self.canv
        label_y = self.height - 3.5 * mm
        bar_h = 2.7 * mm
        c.setFont("Wollie-Bold", 6.3)
        c.setFillColor(MUTED)
        c.drawString(0, label_y, "FUNDED")
        c.setFillColor(TRACK)
        c.roundRect(0, label_y - 5 * mm, self.width, bar_h, 1.35 * mm, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.roundRect(0, label_y - 5 * mm, self.width * self.funded, bar_h, 1.35 * mm, fill=1, stroke=0)

        y2 = 2 * mm
        c.setFont("Wollie-Bold", 6.3)
        c.setFillColor(MUTED)
        c.drawString(0, y2 + 4.5 * mm, "USED")
        c.setFillColor(TRACK)
        c.roundRect(0, y2, self.width, bar_h, 1.35 * mm, fill=1, stroke=0)
        c.setFillColor(RED if self.overspent else (AMBER if self.spent_ratio >= .8 else INK))
        c.roundRect(0, y2, self.width * self.spent_ratio, bar_h, 1.35 * mm, fill=1, stroke=0)


class FundingMeter(Flowable):
    def __init__(self, funded: float, width=68 * mm):
        super().__init__()
        self.width = width
        self.height = 8 * mm
        self.funded = max(0, min(1, funded))

    def draw(self):
        c = self.canv
        c.setFont("Wollie-Bold", 6.3)
        c.setFillColor(MUTED)
        c.drawString(0, 5.6 * mm, "RESERVED")
        c.setFillColor(TRACK)
        c.roundRect(0, 0, self.width, 2.7 * mm, 1.35 * mm, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.roundRect(0, 0, self.width * self.funded, 2.7 * mm, 1.35 * mm, fill=1, stroke=0)


@dataclass
class RowState:
    name: str
    primary: str
    secondary: str
    funded: float
    used: float
    status: str
    status_color: colors.Color
    overspent: bool = False


class MoneyRow(Flowable):
    def __init__(self, state: RowState, width=CONTENT_W):
        super().__init__()
        self.width = width
        self.height = 35 * mm
        self.state = state

    def draw(self):
        s = self.state
        c = self.canv
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.roundRect(0, 0, self.width, self.height, 3 * mm, fill=1, stroke=1)

        c.setFont("Wollie-Bold", 10)
        c.setFillColor(INK)
        c.drawString(5 * mm, self.height - 7.5 * mm, s.name)
        c.setFont("Wollie-Bold", 9)
        c.drawRightString(self.width - 5 * mm, self.height - 7.5 * mm, s.primary)

        c.setFont("Wollie", 6.7)
        c.setFillColor(MUTED)
        c.drawString(5 * mm, self.height - 13 * mm, s.secondary)

        c.setFont("Wollie-Bold", 6.5)
        c.setFillColor(s.status_color)
        c.drawRightString(self.width - 5 * mm, self.height - 13 * mm, s.status)

        pair = ProgressPair(s.funded, s.used, s.overspent, width=self.width - 10 * mm)
        pair.canv = c
        c.saveState()
        c.translate(5 * mm, 3.2 * mm)
        pair.draw()
        c.restoreState()

class AllocationStrip(Flowable):
    def __init__(self, width=CONTENT_W):
        super().__init__()
        self.width = width
        self.height = 27 * mm
        self.parts = [
            ("Spent", 0.24, INK, "EUR 2,080"),
            ("Available", 0.25, GREEN, "EUR 2,170"),
            ("Reserved", 0.48, colors.HexColor("#82CDB8"), "EUR 4,166"),
            ("Unallocated", 0.03, colors.HexColor("#C9D2D8"), "EUR 264"),
        ]

    def draw(self):
        c = self.canv
        y = self.height - 8 * mm
        x = 0
        for _, ratio, color, _ in self.parts:
            w = self.width * ratio
            c.setFillColor(color)
            c.rect(x, y, w, 6 * mm, fill=1, stroke=0)
            x += w
        legend_y = 1.5 * mm
        x = 0
        col_w = self.width / len(self.parts)
        for label, _, color, value in self.parts:
            c.setFillColor(color)
            c.circle(x + 1.5 * mm, legend_y + 2 * mm, 1.1 * mm, fill=1, stroke=0)
            c.setFillColor(INK)
            c.setFont("Wollie-Bold", 6.4)
            c.drawString(x + 4 * mm, legend_y + 2.5 * mm, label)
            c.setFillColor(MUTED)
            c.setFont("Wollie", 6.2)
            c.drawString(x + 4 * mm, legend_y - 1.1 * mm, value)
            x += col_w


def page_chrome(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFont("Wollie", 6.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN_X, 8 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def two_col(left, right, ratio=(0.5, 0.5), gap=6 * mm):
    w1 = (CONTENT_W - gap) * ratio[0]
    w2 = CONTENT_W - gap - w1
    t = Table([[left, right]], colWidths=[w1, w2], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), gap),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def matrix(headers, rows, widths):
    data = [[p(x, "WCellHead") for x in headers]]
    for row in rows:
        data.append([p(x, "WCell") for x in row])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN_LIGHT),
        ("GRID", (0, 0), (-1, -1), .45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
    ]))
    return t


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frame = Frame(MARGIN_X, MARGIN_BOTTOM, CONTENT_W, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
                  id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4, leftMargin=MARGIN_X, rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
        title="Wollie Money Plan Visual System",
        author="Wollie product research",
        subject="Funding, spending, reserves, and goals visual model",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=page_chrome)])

    story = []

    # 1 - Cover
    story += [Spacer(1, 18 * mm), p("PRODUCT RESEARCH / AUGUST 2026", "WLabel"), Spacer(1, 4 * mm)]
    story += [p("A calmer Money plan", "WTitle")]
    story += [p("A research-backed visual system for funding, spending, tax reserves, savings, and pension goals.", "WDeck")]
    story += [Spacer(1, 9 * mm)]
    cover_callout = [
        p("THE DECISION", "WLabel"), Spacer(1, 2 * mm),
        p("Funding progress stays green. Spending pressure gets its own meter. Red means money is genuinely over or overdue - never merely incomplete.", "WCallout"),
    ]
    story += [card(cover_callout, bg=GREEN_LIGHT, border=GREEN, padding=7 * mm), Spacer(1, 9 * mm)]
    story += [two_col(
        [p("Why this matters", "WH2"), p("The current row makes a healthy Rent envelope look dangerous because one bar mixes funding completeness with money already spent.")],
        [p("What changes", "WH2"), p("Spending, reserves, and goals get different row models while staying inside one shared Money plan.")],
    )]
    story += [Spacer(1, 31 * mm), p("Prepared for Wollie product, design, and engineering", "WSmall")]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 2 - Answer + evidence
    story += [p("The short answer", "WH1")]
    story += [card([
        p("YES - KEEP FUNDING GREEN", "WLabel"), Spacer(1, 1.5 * mm),
        p("A partial green bar means progress. Its length and amount show how complete it is. A checkmark says fully funded. Neutral grey shows what remains.", "WCallout"),
    ], bg=GREEN_LIGHT, border=GREEN), Spacer(1, 5 * mm)]
    story += [two_col(
        [p("Funding asks", "WH2"), p("How much of the plan target has this month's income made available?"), bullet("Positive progress"), bullet("Never red just because income is still arriving")],
        [p("Usage asks", "WH2"), p("How much of the available money has already been used?"), bullet("Amber when running low"), bullet("Red only after available money is exceeded")],
    ), Spacer(1, 5 * mm)]
    story += [p("What the strongest products reveal", "WH2")]
    story += [matrix(
        ["Product", "Pattern", "Lesson for Wollie"],
        [
            ["YNAB", "One optional bar combines target status, spent, available, and overspend through hue and shading.", "Powerful, but it needs a legend. Do not copy yellow underfunding into proportional allocation."],
            ["Monarch", "Monthly budget uses Planned / Actual / Remaining. Goals use balance, target, contribution, and projection.", "Monthly availability and long-term progress are different jobs."],
            ["Monzo / N26 / Revolut / bunq", "Pots, Spaces, and dedicated accounts are real separated balances.", "Wollie must say 'reserved in plan' until money actually moves."],
            ["WCAG / USWDS / NN/g", "Color needs a second signal; bars work best for one named quantitative idea.", "Use two labeled meters and explicit amounts."],
        ],
        [27 * mm, 66 * mm, CONTENT_W - 93 * mm],
    )]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 3 - Visual grammar
    story += [p("One visual grammar", "WH1")]
    story += [p("Use length for quantity. Use color for categorical status. Always add words or an icon.")]
    color_rows = [
        ["EMERALD", "Secured money and positive progress", "Funding, reserve progress, goal balance"],
        ["INK", "Money used or neutral actual", "Normal spending"],
        ["AMBER", "Attention soon", "Running low; projected short"],
        ["RED", "Genuine negative state", "Overspent; over-allocated; overdue and short"],
        ["GREY", "Remainder or not started", "Unfunded track; unavailable state"],
    ]
    data = [[p("TOKEN", "WCellHead"), p("MEANING", "WCellHead"), p("USE", "WCellHead")]]
    swatches = [GREEN, INK, AMBER, RED, colors.HexColor("#AAB5BC")]
    for row, swatch in zip(color_rows, swatches):
        data.append([p(f"<font color='{swatch.hexval()}'><b>●</b></font>&nbsp; {row[0]}", "WCell"), p(row[1], "WCell"), p(row[2], "WCell")])
    t = Table(data, colWidths=[36 * mm, 58 * mm, CONTENT_W - 94 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN_LIGHT), ("GRID", (0, 0), (-1, -1), .45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm), ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [t, Spacer(1, 6 * mm)]
    story += [two_col(
        card([p("DO", "WLabel"), Spacer(1, 1 * mm), p("EUR 450 available"), p("EUR 550 still to fund", "WSmall")], bg=GREEN_LIGHT, border=GREEN, widths=[(CONTENT_W - 6 * mm) / 2]),
        card([p("DO NOT", "WLabel"), Spacer(1, 1 * mm), p("EUR 450 left", "WCallout"), p("A red bar with no explanation", "WSmall")], bg=RED_LIGHT, border=RED, widths=[(CONTENT_W - 6 * mm) / 2]),
    ), Spacer(1, 7 * mm)]
    story += [p("Accessibility contract", "WH2"), bullet("Text or an icon repeats every amber and red state."), bullet("Meters have accessible names with amount, denominator, and status."), bullet("Contrast remains readable in monochrome; color is never the only clue.")]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 4 - Spending rows
    story += [p("Spending envelopes: show both answers", "WH1")]
    story += [p("The primary number is what the household can still spend. Funding and usage sit below as two thin, labeled meters.")]
    examples = [
        RowState("Food", "EUR 800 left", "EUR 1,000 funded of EUR 1,000 target - EUR 200 spent", 1.0, .2, "FULLY FUNDED", GREEN),
        RowState("Food", "EUR 450 available", "EUR 450 funded of EUR 1,000 target - EUR 0 spent", .45, 0, "EUR 550 STILL TO FUND", MUTED),
        RowState("Food", "EUR 50 left", "EUR 450 funded of EUR 1,000 target - EUR 400 spent", .45, .89, "RUNNING LOW", AMBER),
        RowState("Food", "EUR 50 over", "EUR 450 funded of EUR 1,000 target - EUR 500 spent", .45, 1.0, "OVERSPENT", RED, True),
    ]
    for example in examples:
        story += [MoneyRow(example), Spacer(1, 3 * mm)]
    story += [p("Threshold", "WH2"), p("Start with amber when less than 20% of funded money remains. Upgrade later to a pace-aware warning using day of month and category history. Partial funding itself remains neutral.")]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 5 - Reserve and goal
    story += [p("Reserves and goals need different truth", "WH1")]
    reserve_box = [
        p("TAX / 40% OF INCOME", "WLabel"), Spacer(1, 1 * mm),
        p("EUR 3,472 reserved in plan", "WCallout"),
        p("40% of EUR 8,680 income - EUR 0 contributed", "WSmall"), Spacer(1, 3 * mm),
        FundingMeter(1.0, width=68 * mm),
        p("Only the Funding meter is used. A dated tax liability adds an On track / Projected short status.", "WSmall"),
    ]
    goal_box = [
        p("PENSION GOAL", "WLabel"), Spacer(1, 1 * mm),
        p("EUR 24,800 of EUR 60,000", "WCallout"),
        p("This month: EUR 2,249 planned - EUR 2,000 contributed", "WSmall"), Spacer(1, 4 * mm),
        p("41%", "WH2"),
        Table([["", ""]], colWidths=[29 * mm, 41 * mm], rowHeights=[3 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), GREEN), ("BACKGROUND", (1, 0), (1, 0), TRACK),
        ])), Spacer(1, 3 * mm),
        p("On track for June 2031", "WSmall"),
    ]
    half = (CONTENT_W - 6 * mm) / 2
    story += [two_col(
        card(reserve_box, bg=WHITE, border=LINE, widths=[half]),
        card(goal_box, bg=WHITE, border=LINE, widths=[half]),
    ), Spacer(1, 6 * mm)]
    story += [p("The language contract", "WH2")]
    story += [matrix(
        ["Word", "Use only when"],
        [
            ["Funded", "Income is assigned inside the monthly plan."],
            ["Reserved in plan", "Money is virtually earmarked but has not necessarily moved."],
            ["Contributed", "A real transfer, pension payment, or goal-linked transaction is observed."],
            ["Goal balance", "A real linked account balance or reconciled saved amount backs it."],
            ["Spent", "A real household purchase or bill consumed value."],
        ],
        [40 * mm, CONTENT_W - 40 * mm],
    ), Spacer(1, 4 * mm)]
    story += [card([p("A pension transfer is saved/invested, not spent.", "WCallout"), p("Market growth changes goal balance but is not a contribution.", "WSmall")], bg=GREEN_LIGHT, border=GREEN)]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 6 - Page hierarchy and charts
    story += [p("The page and chart system", "WH1")]
    story += [p("Keep one Money plan page. Split it into <b>Spend this month</b> and <b>Goals & reserves</b>. Both use the same income, but they answer different questions.")]
    story += [p("Overview allocation", "WH2"), AllocationStrip(), Spacer(1, 3 * mm)]
    story += [p("The segments are mutually exclusive: income equals spent + available + reserved + unallocated. Transfers are excluded. Contributions sit in reserved/saved, never in spent.", "WSmall"), Spacer(1, 6 * mm)]
    story += [two_col(
        [p("Spending category detail", "WH2"), bullet("Six-month bars: Target vs Spent"), bullet("Summary: average and variance"), bullet("Filtered transactions below"), bullet("Optional rollover history")],
        [p("Goal detail", "WH2"), bullet("Balance timeline"), bullet("Target reference + target date"), bullet("Dotted projection"), bullet("Contribution / withdrawal markers")],
    ), Spacer(1, 7 * mm)]
    story += [card([
        p("CHART RULE", "WLabel"), Spacer(1, 1 * mm),
        p("Use sorted bars for category comparison and lines for change over time. Avoid a pie chart for progress. If a one-month composition is shown, a bar list remains easier to compare.", "WCallout"),
    ], bg=GREEN_LIGHT, border=GREEN)]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 7 - Accounting contract
    story += [p("One transaction, one role", "WH1")]
    story += [p("This is the engineering rule that keeps every chart honest.")]
    role_data = [
        [p("INCOME", "WLabel"), p("Adds money to allocate", "WCell"), p("Salary, business income", "WCell")],
        [p("EXPENSE", "WLabel"), p("Reduces a spending envelope", "WCell"), p("Groceries, rent, travel purchase", "WCell")],
        [p("CONTRIBUTION", "WLabel"), p("Builds a reserve or goal", "WCell"), p("Pension payment, savings transfer", "WCell")],
        [p("TRANSFER", "WLabel"), p("Moves household money only", "WCell"), p("Card repayment, own-account transfer", "WCell")],
    ]
    t = Table(role_data, colWidths=[32 * mm, 61 * mm, CONTENT_W - 93 * mm], rowHeights=[18 * mm] * 4)
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), .45, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, -1), GREEN_LIGHT),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [t, Spacer(1, 7 * mm)]
    story += [two_col(
        card([p("CARD PURCHASE", "WLabel"), Spacer(1, 1 * mm), p("EUR 200 groceries", "WCallout"), p("Expense -> Food used increases by EUR 200", "WSmall")], bg=WHITE, border=LINE, widths=[(CONTENT_W - 6 * mm) / 2]),
        card([p("CARD REPAYMENT", "WLabel"), Spacer(1, 1 * mm), p("EUR 200 payment", "WCallout"), p("Transfer -> ignored by spend and income", "WSmall")], bg=WHITE, border=LINE, widths=[(CONTENT_W - 6 * mm) / 2]),
    ), Spacer(1, 5 * mm)]
    story += [card([p("Result", "WLabel"), p("Food shows EUR 200 used once. The repayment cannot double count it. A pension contribution appears in Saved/invested, not Spent this month.", "WCallout")], bg=GREEN_LIGHT, border=GREEN)]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 8 - Build sequence and acceptance
    story += [p("Build sequence", "WH1")]
    phases = [
        ("01", "Correct the data meaning", "Add spending / reserve / goal purpose. Split funding progress, usage state, and schedule risk."),
        ("02", "Replace the row", "Render two meters for spending; reserve and goal templates for long-term money."),
        ("03", "Fix summaries", "Use available, reserved, saved/invested, and unallocated. Exclude transfers and contributions from spend."),
        ("04", "Add intelligence", "Percent-of-income reserves, account-backed goals, target-date projections, and pace-aware warnings."),
    ]
    phase_rows = []
    for number, title, body in phases:
        phase_rows.append([p(number, "WLabel"), p(f"<b>{title}</b><br/><font color='#657383'>{body}</font>", "WCell")])
    pt = Table(phase_rows, colWidths=[18 * mm, CONTENT_W - 18 * mm], rowHeights=[20 * mm] * 4)
    pt.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), .45, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, -1), GREEN_LIGHT),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [pt, Spacer(1, 6 * mm)]
    story += [p("Non-negotiable acceptance checks", "WH2")]
    checks = [
        "45% funded with no spend is green + grey, never amber or red.",
        "EUR 1,000 funded and EUR 200 spent says EUR 800 left.",
        "EUR 500 spent from EUR 450 available says EUR 50 over and is red.",
        "Virtual Tax says Reserved in plan; a real matched movement says Contributed.",
        "Pension, savings, card repayments, and own-account transfers do not inflate Spent.",
    ]
    story += [card([bullet(x) for x in checks], bg=WHITE, border=LINE)]
    story += [PageBreak(), Spacer(1, 18 * mm)]

    # 9 - Sources and limits
    story += [p("Sources and limits", "WH1")]
    story += [p("Primary product documentation is current through 29 August 2026. Forum evidence is used only to identify confusion patterns, not to estimate prevalence.")]
    refs = [
        ("1", "YNAB - Visual Progress Bars", "https://support.ynab.com/en_us/progress-bars-a-guide-SkDEhot09"),
        ("2", "YNAB - Colors and Icons in Your Plan", "https://support.ynab.com/en_us/colors-and-icons-in-your-plan-HJQv_XHko"),
        ("3", "Monarch - Creating Your Budget", "https://help.monarch.com/hc/en-us/articles/360048883631-Creating-Your-Budget-in-Monarch"),
        ("4", "Monarch - Using Save Up Goals", "https://help.monarch.com/hc/en-us/articles/44373182867476-Using-Save-Up-Goals"),
        ("5", "Goodbudget - Goals and Annual Envelopes", "https://goodbudget.com/help/customize-your-goodbudget/goals-and-annuals/"),
        ("6", "Monzo - What is a Pot?", "https://monzo.com/help/budgeting-overdrafts-savings/what-is-a-pot"),
        ("7", "N26 - How Spaces works", "https://support.n26.com/en-eu/app-and-features/spaces/how-does-spaces-work"),
        ("8", "Revolut - Income Sorter", "https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/using-the-income-sorter-feature/"),
        ("9", "bunq - Easy Budgeting", "https://help.bunq.com/articles/easy-budgeting"),
        ("10", "bunq - Money Insights", "https://help.bunq.com/articles/your-budgeting-screen"),
        ("11", "W3C - WCAG 2.2 Use of Color", "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color"),
        ("12", "USWDS - Data visualizations", "https://designsystem.digital.gov/components/data-visualizations/"),
        ("13", "NN/g - Making Charts and Graphs Easier to Understand", "https://www.nngroup.com/articles/dashboards-preattentive/"),
    ]
    ref_flow = []
    for n, title, url in refs:
        ref_flow.append(p(f"<b>{n}.</b> <link href='{url}' color='#00956F'>{title}</link><br/><font color='#657383'>{url}</font>", "WRef"))
        ref_flow.append(Spacer(1, 1.2 * mm))
    story += ref_flow
    story += [Spacer(1, 3 * mm), card([
        p("VALIDATION STILL NEEDED", "WLabel"), Spacer(1, 1 * mm),
        p("Run a five-person household usability test before broad rollout. Ask each person to find: funded amount, available amount, whether money actually moved, and whether action is needed.", "WCallout"),
    ], bg=AMBER_LIGHT, border=AMBER)]

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build()
