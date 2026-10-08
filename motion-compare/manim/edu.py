"""Identical educational scenario #1 - Manim Community.

Scenario (same in every engine): Pythagorean theorem.
  title -> draw right triangle (legs a, b, hypotenuse c)
  -> grow squares on each side (a², b², c²) -> show a² + b² = c²
10 s @ 30 fps, 1280x720.
"""
from manim import *
import numpy as np

BG = "#0B1020"
COL_A = "#4CC9F0"
COL_B = "#F72585"
COL_C = "#06D6A0"
TRI = "#FFD166"
TXT = "#E6EDF3"


def P(px: float, py: float) -> np.ndarray:
    """Map a 1280x720 pixel coordinate into Manim world coordinates."""
    return np.array([(px - 640) / 90.0, (360 - py) / 90.0, 0.0])


class Pythagoras(Scene):
    def construct(self):
        self.camera.background_color = BG

        # ---- geometry (pixels: C right angle, A top of leg a, B end of leg b)
        title = Text("Pythagorean Theorem", font_size=58, weight=BOLD, color=TXT)
        title.move_to(P(640, 66))
        subtitle = Text(
            "A right triangle with legs a, b and hypotenuse c",
            font_size=24,
            color="#9FB3C8",
        )
        subtitle.move_to(P(640, 116))

        # squares on each side
        sq_a = Polygon(
            P(440, 350), P(560, 350), P(560, 470), P(440, 470),
            fill_color=COL_A, fill_opacity=0.22, stroke_color=COL_A, stroke_width=3,
        )
        sq_b = Polygon(
            P(560, 470), P(720, 470), P(720, 630), P(560, 630),
            fill_color=COL_B, fill_opacity=0.22, stroke_color=COL_B, stroke_width=3,
        )
        sq_c = Polygon(
            P(560, 350), P(720, 470), P(840, 310), P(680, 190),
            fill_color=COL_C, fill_opacity=0.22, stroke_color=COL_C, stroke_width=3,
        )
        squares = VGroup(sq_a, sq_b, sq_c).shift(UP * 0.5)

        # triangle edges (drawn on top of the squares)
        edge_a = Line(P(560, 470), P(560, 350), color=TRI, stroke_width=5)
        edge_b = Line(P(560, 470), P(720, 470), color=TRI, stroke_width=5)
        edge_c = Line(P(560, 350), P(720, 470), color=TRI, stroke_width=5)
        triangle = VGroup(edge_a, edge_b, edge_c).shift(UP * 0.5)

        # right-angle marker at C
        right_angle = Polygon(
            P(560, 470), P(560, 446), P(584, 446), P(584, 470),
            stroke_color=TRI, stroke_width=3, fill_opacity=0,
        ).shift(UP * 0.5)

        # side labels
        lab_a = Text("a", font_size=30, color=COL_A).move_to(P(578, 412))
        lab_b = Text("b", font_size=30, color=COL_B).move_to(P(646, 450))
        lab_c = Text("c", font_size=30, color=COL_C).move_to(P(618, 406))
        side_labels = VGroup(lab_a, lab_b, lab_c).shift(UP * 0.5)

        # square area labels
        area_a = Text("a\u00b2", font_size=34, color=COL_A).move_to(P(500, 410))
        area_b = Text("b\u00b2", font_size=34, color=COL_B).move_to(P(640, 550))
        area_c = Text("c\u00b2", font_size=34, color=COL_C).move_to(P(700, 330))
        area_labels = VGroup(area_a, area_b, area_c).shift(UP * 0.5)

        # equation
        equation = VGroup(
            Text("a\u00b2", font_size=52, color=COL_A),
            Text(" + ", font_size=52, color=TXT),
            Text("b\u00b2", font_size=52, color=COL_B),
            Text(" = ", font_size=52, color=TXT),
            Text("c\u00b2", font_size=52, color=COL_C),
        ).arrange(RIGHT, buff=0.14)
        equation.move_to(P(640, 690))

        # ---------------------------------------------------------------- beats
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.2)
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=0.8)

        self.play(
            LaggedStart(*[Create(e) for e in triangle], lag_ratio=0.35),
            run_time=1.6,
        )
        self.play(Create(right_angle), run_time=0.4)
        self.play(
            LaggedStart(*[FadeIn(l, shift=UP * 0.15) for l in side_labels], lag_ratio=0.2),
            run_time=0.5,
        )

        self.play(
            LaggedStart(
                *[FadeIn(s, scale=0.7) for s in squares],
                lag_ratio=0.25,
            ),
            run_time=1.5,
        )
        self.play(
            LaggedStart(*[FadeIn(l, scale=0.8) for l in area_labels], lag_ratio=0.2),
            run_time=0.7,
        )
        self.play(FadeIn(equation, shift=UP * 0.2), run_time=1.0)
        self.play(
            sq_c.animate.set_fill(COL_C, opacity=0.45).set_stroke(COL_C, width=6),
            run_time=0.4,
        )
        self.play(
            sq_c.animate.set_fill(COL_C, opacity=0.22).set_stroke(COL_C, width=3),
            run_time=0.4,
        )
        self.wait(1.5)
