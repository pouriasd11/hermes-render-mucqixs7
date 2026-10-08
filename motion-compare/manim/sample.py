from manim import *


class ManimSample(Scene):
    """A short motion-graphics sample: title reveal + shapes + closing."""

    def construct(self):
        self.camera.background_color = "#101820"

        title = Text("Manim", font_size=110, weight=BOLD, color="#00BFFF")
        subtitle = Text(
            "Animation engine for explanatory videos",
            font_size=30,
            color="#DDDDDD",
        )
        subtitle.next_to(title, DOWN, buff=0.4)

        # 1) Title slides in from the left and fades in.
        title.shift(LEFT * 6)
        self.play(
            title.animate.shift(RIGHT * 6),
            FadeIn(subtitle, shift=UP * 0.4),
            run_time=1.6,
        )
        self.wait(0.3)

        # 2) Shapes animate in and morph.
        circle = Circle(radius=0.9, color="#FF3366", fill_opacity=0.5)
        square = Square(side_length=1.6, color="#33CC99", fill_opacity=0.5)
        triangle = Triangle(color="#FFCC00", fill_opacity=0.5).scale(1.2)
        shapes = VGroup(circle, square, triangle).arrange(RIGHT, buff=0.8)
        shapes.next_to(subtitle, DOWN, buff=0.9)

        self.play(LaggedStart(*[GrowFromCenter(s) for s in shapes], lag_ratio=0.25))
        self.play(
            Rotate(shapes, angle=TAU / 4, about_point=shapes.get_center()),
            run_time=1.2,
        )
        self.play(shapes.animate.set_color_by_gradient("#00BFFF", "#FF3366"))
        self.wait(0.3)

        # 3) Formula + closing fade.
        # NOTE: Real MathTex requires a working LaTeX install. The conda-forge
        # texlive-core package here has a broken format/perl setup, so we use a
        # Text-based formula to keep the sample self-contained and renderable.
        formula = Text("e^(i\u03c0) + 1 = 0", font_size=64, color="#FFFFFF")
        formula.next_to(shapes, DOWN, buff=0.8)
        self.play(Write(formula), run_time=1.5)
        self.wait(0.5)
        self.play(FadeOut(VGroup(title, subtitle, shapes, formula)))
        self.wait(0.3)
