#!/usr/bin/env python3
"""Simple Flask API exposing a stub equation solver."""

from __future__ import annotations

import os
from flask import Flask, jsonify, request
from sympy import symbols, solve
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)


def create_app() -> Flask:
    app = Flask(__name__)

    @app.after_request
    def add_cors_headers(response):  # type: ignore[override]
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    @app.get("/solve")
    def solve_eqn():
        equation = (request.args.get("equation") or "").strip()
        for char in equation:
            if char not in "0123456789+-*/^.x= ()":
                return jsonify({"error": f"Invalid characters in equation '{char}'"}), 400
        if not equation:
            return jsonify({"error": "Missing 'equation' query parameter"}), 400


        transformations = (
            standard_transformations + (implicit_multiplication_application,)
        )

        x = symbols('x')
        equation = equation.replace('^', '**')

        if '=' in equation:
            left, right = equation.split('=', 1)
            expr = parse_expr(left, transformations=transformations) - parse_expr(right, transformations=transformations)
        else:
            expr = parse_expr(equation, transformations=transformations)

        solutions = solve(expr, x)

        if not solutions:
            return "Solution not found"
        elif len(solutions) == 1:
            return jsonify({"result": f"x = {solutions}"})
        else:
            # Join multiple solutions with commas
            return jsonify({"result": f"x = {', '.join([str(s) for s in solutions])}"})

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({"message": "Equation API. Try /solve?equation=1+1"})

    return app


def run() -> None:
    port = int(os.environ.get("PORT", 8000))
    app = create_app()
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    run()
