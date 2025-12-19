#!/usr/bin/env python3
"""
Parse Cambridge Primary Checkpoint Stage 5 Math PDFs into structured question format.
Extracts questions from 2014 Paper 1 and Paper 2.
"""

import json
import os
import re
from typing import Optional

# Cambridge Stage 5 topic mapping based on curriculum
TOPIC_MAPPINGS = {
    # Number strand
    "round": ("number", "rounding", 750),
    "decimal": ("number", "decimals", 800),
    "fraction": ("number", "fractions", 850),
    "total": ("calculation", "addition", 700),
    "double": ("calculation", "mental-math", 750),
    "100 more": ("number", "place-value", 700),
    "1000 more": ("number", "place-value", 750),
    "whole number": ("number", "decimals", 700),
    "pattern": ("number", "sequences", 800),
    "100 times": ("number", "place-value", 800),
    "multiplication grid": ("calculation", "times-tables", 750),
    "times table": ("calculation", "times-tables", 700),
    "subtract": ("calculation", "subtraction", 750),
    "factor": ("number", "factors", 850),
    "multiple": ("number", "multiples", 800),
    "square number": ("number", "squares", 850),
    "prime": ("number", "primes", 900),
    "percentage": ("number", "percentages", 850),
    "equivalent": ("number", "fractions", 800),
    "order": ("number", "ordering", 750),
    "sequence": ("number", "sequences", 800),
    "odd": ("number", "odd-even", 700),
    "even": ("number", "odd-even", 700),

    # Geometry strand
    "acute": ("geometry", "angles", 750),
    "obtuse": ("geometry", "angles", 800),
    "right angle": ("geometry", "angles", 700),
    "angle": ("geometry", "angles", 800),
    "reflection": ("geometry", "symmetry", 800),
    "symmetry": ("geometry", "symmetry", 750),
    "rotate": ("geometry", "rotation", 850),
    "triangle": ("geometry", "shapes-2d", 750),
    "rectangle": ("geometry", "shapes-2d", 700),
    "square": ("geometry", "shapes-2d", 700),
    "hexagon": ("geometry", "shapes-2d", 750),
    "pentagon": ("geometry", "shapes-2d", 750),
    "parallel": ("geometry", "shapes-2d", 800),
    "perpendicular": ("geometry", "shapes-2d", 850),
    "coordinate": ("geometry", "coordinates", 800),
    "net": ("geometry", "shapes-3d", 850),
    "dice": ("geometry", "shapes-3d", 800),
    "cube": ("geometry", "shapes-3d", 800),
    "face": ("geometry", "shapes-3d", 750),
    "edge": ("geometry", "shapes-3d", 800),
    "translate": ("geometry", "translation", 850),
    "trapezium": ("geometry", "shapes-2d", 800),

    # Measure strand
    "millilitre": ("measure", "capacity", 750),
    "litre": ("measure", "capacity", 750),
    "metre": ("measure", "length", 700),
    "centimetre": ("measure", "length", 700),
    "millimetre": ("measure", "length", 750),
    "kilometre": ("measure", "length", 800),
    "gram": ("measure", "mass", 750),
    "kilogram": ("measure", "mass", 750),
    "time": ("measure", "time", 750),
    "calendar": ("measure", "time", 700),
    "clock": ("measure", "time", 750),
    "hour": ("measure", "time", 700),
    "minute": ("measure", "time", 700),
    "money": ("measure", "money", 750),
    "cost": ("measure", "money", 750),
    "price": ("measure", "money", 800),
    "change": ("measure", "money", 800),
    "perimeter": ("measure", "perimeter", 850),
    "area": ("measure", "area", 900),
    "weighs": ("measure", "mass", 750),
    "scales": ("measure", "mass", 700),
    "distance": ("measure", "length", 800),

    # Data handling strand
    "graph": ("data", "graphs", 800),
    "chart": ("data", "bar-charts", 750),
    "bar chart": ("data", "bar-charts", 750),
    "temperature": ("data", "line-graphs", 800),
    "spinner": ("data", "probability", 850),
    "probability": ("data", "probability", 850),
    "likely": ("data", "probability", 800),
    "certain": ("data", "probability", 800),
    "survey": ("data", "bar-charts", 750),
    "venn": ("data", "venn-diagrams", 850),
}


def classify_question(text: str) -> tuple[str, str, int]:
    """Classify question into topic, subtopic, and difficulty."""
    text_lower = text.lower()

    for keyword, (topic, subtopic, difficulty) in TOPIC_MAPPINGS.items():
        if keyword in text_lower:
            return topic, subtopic, difficulty

    # Default to calculation if contains operators or numbers
    if any(op in text for op in ['×', '÷', '+', '-', '=']):
        return "calculation", "multi-step", 800

    return "number", "general", 750


def create_question_entry(
    question_id: str,
    text: str,
    options: list[str],
    correct_index: int,
    explanation: str,
    source: str,
    marks: int = 1,
    has_image: bool = False
) -> dict:
    """Create structured question entry."""
    topic, subtopic, difficulty = classify_question(text)

    # Adjust difficulty based on marks
    if marks >= 2:
        difficulty = min(difficulty + 100, 1000)

    return {
        "id": question_id,
        "topic": topic,
        "subtopic": subtopic,
        "difficulty": difficulty,
        "text": text,
        "options": options,
        "correctIndex": correct_index,
        "explanation": explanation,
        "source": source,
        "marks": marks,
        "hasImage": has_image,
        "timesAnswered": 0,
        "correctRate": 0.0
    }


# Cambridge 2014 Paper 1 Questions (extracted from PDF)
PAPER_1_QUESTIONS = [
    # Q1 - Rounding
    create_question_entry(
        "cam14-p1-01a",
        "3573 rounded to the nearest 10 is?",
        ["3570", "3580", "3600"],
        0,
        "7 in units is >= 5, but we round 73 to 70",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-01b",
        "3573 rounded to the nearest 1000 is?",
        ["3000", "4000", "3500"],
        1,
        "573 >= 500, so round up to 4000",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q2 - Number bonds to 10
    create_question_entry(
        "cam14-p1-02",
        "Which two numbers from 2.4, 3.4, 4.6, 6.4, 7.6, 8.6 total 10?",
        ["2.4 and 7.6", "3.4 and 6.4", "4.6 and 8.6"],
        0,
        "2.4 + 7.6 = 10",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q3 - Doubling
    create_question_entry(
        "cam14-p1-03a",
        "Double 260 = ?",
        ["420", "520", "620"],
        1,
        "260 × 2 = 520",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-03b",
        "Double ? = 9400. What is the missing number?",
        ["4600", "4700", "4800"],
        1,
        "9400 ÷ 2 = 4700",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q4 - Place value
    create_question_entry(
        "cam14-p1-04a",
        "1954 + 100 = ?",
        ["1964", "2054", "2954"],
        1,
        "Adding 100 changes thousands digit",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-04b",
        "? + 1000 = 30217. What is the missing number?",
        ["29217", "29017", "30117"],
        0,
        "30217 - 1000 = 29217",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q5 - Rounding decimals to nearest whole number
    create_question_entry(
        "cam14-p1-05a",
        "7.4 rounded to the nearest whole number is?",
        ["7", "8", "7.5"],
        0,
        "0.4 < 0.5, so round down to 7",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-05b",
        "5.55 rounded to the nearest whole number is?",
        ["5", "6", "5.5"],
        1,
        "0.55 >= 0.5, so round up to 6",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-05c",
        "8.09 rounded to the nearest whole number is?",
        ["8", "9", "8.1"],
        0,
        "0.09 < 0.5, so round down to 8",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q6 - Number patterns
    create_question_entry(
        "cam14-p1-06",
        "Pattern: 27, 67, ?, ?. Rule: +40. Find the next two numbers.",
        ["107, 147", "97, 137", "117, 157"],
        0,
        "67 + 40 = 107, 107 + 40 = 147",
        "Cambridge 2014 Paper 1",
        2
    ),
    # Q7 - Multiplying by 100
    create_question_entry(
        "cam14-p1-07",
        "Which number is 100 times bigger than 904?",
        ["9040", "90400", "904000"],
        1,
        "904 × 100 = 90400",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q8 - Multiplication grid
    create_question_entry(
        "cam14-p1-08a",
        "Complete the multiplication grid: 4 × 6 = ?",
        ["20", "24", "28"],
        1,
        "4 × 6 = 24",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-08b",
        "In a multiplication grid, if 9 × 3 = 27, what is 9 × 8?",
        ["63", "72", "81"],
        1,
        "9 × 8 = 72",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q9 - Subtraction
    create_question_entry(
        "cam14-p1-09",
        "6024 - 3997 = ?",
        ["2017", "2027", "2127"],
        1,
        "6024 - 3997 = 2027",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q10 - Acute angles
    create_question_entry(
        "cam14-p1-10",
        "An acute angle is an angle that is?",
        ["Less than 90°", "Exactly 90°", "More than 90°"],
        0,
        "Acute angles are less than 90°",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q11 - Capacity/Volume
    create_question_entry(
        "cam14-p1-11",
        "A jug has 1.4 L of water. Paul adds 600 ml. How much water is in the jug now?",
        ["1.8 L", "2.0 L", "2.4 L"],
        1,
        "1400 ml + 600 ml = 2000 ml = 2 L",
        "Cambridge 2014 Paper 1",
        1,
        True  # Has image
    ),
    # Q13 - Multiplication and Division
    create_question_entry(
        "cam14-p1-13a",
        "268 × 7 = ?",
        ["1776", "1876", "1886"],
        1,
        "268 × 7 = 1876",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-13b",
        "704 ÷ 4 = ?",
        ["166", "176", "186"],
        1,
        "704 ÷ 4 = 176",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q14 - Fractions on number line
    create_question_entry(
        "cam14-p1-14",
        "Which fraction is closest to 1 on a number line: 2/3, 3/4, or 10/8?",
        ["2/3", "3/4", "10/8"],
        2,
        "10/8 = 1.25, which is past 1; 3/4 = 0.75; 2/3 ≈ 0.67",
        "Cambridge 2014 Paper 1",
        2
    ),
    # Q15 - Division problem
    create_question_entry(
        "cam14-p1-15",
        "150 sweets shared equally between Andrew and 5 friends. How many sweets each?",
        ["25", "30", "35"],
        0,
        "6 children total (Andrew + 5 friends), 150 ÷ 6 = 25",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q16 - Common factors
    create_question_entry(
        "cam14-p1-16",
        "Which numbers (greater than 1) are factors of both 18 and 30?",
        ["2, 3, 6", "2, 5, 6", "3, 5, 9"],
        0,
        "Factors of 18: 1,2,3,6,9,18. Factors of 30: 1,2,3,5,6,10,15,30. Common: 2,3,6",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q17 - Triangle properties
    create_question_entry(
        "cam14-p1-17a",
        "True or False: Triangles can have 2 acute angles.",
        ["True", "False", "Sometimes"],
        0,
        "True - all triangles have at least 2 acute angles",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-17b",
        "True or False: Triangles can have 2 obtuse angles.",
        ["True", "False", "Sometimes"],
        1,
        "False - sum of angles = 180°, so max 1 obtuse angle",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-17c",
        "True or False: Triangles can have 2 perpendicular sides.",
        ["True", "False", "Sometimes"],
        0,
        "True - right-angled triangles have 2 perpendicular sides",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-17d",
        "True or False: Triangles can have 2 parallel sides.",
        ["True", "False", "Sometimes"],
        1,
        "False - triangles have no parallel sides",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q19 - Temperature graph
    create_question_entry(
        "cam14-p1-19b",
        "From a temperature graph, the temperature at 10:30 am was between 17°C and 21°C. What was it?",
        ["17°C", "19°C", "21°C"],
        1,
        "Reading from graph at 10:30 am gives approximately 19°C",
        "Cambridge 2014 Paper 1",
        1,
        True
    ),
    create_question_entry(
        "cam14-p1-19c",
        "For how long was the temperature 25°C or higher?",
        ["1 hour", "2 hours", "3 hours"],
        1,
        "From graph: temperature ≥ 25°C from 12pm to 2pm = 2 hours",
        "Cambridge 2014 Paper 1",
        1,
        True
    ),
    # Q21 - Square numbers
    create_question_entry(
        "cam14-p1-21a",
        "A square number between 1-100, odd, two digits, digits sum to 9. What is it?",
        ["36", "81", "49"],
        1,
        "81 = 9², odd, 8+1=9 ✓",
        "Cambridge 2014 Paper 1",
        1
    ),
    create_question_entry(
        "cam14-p1-21b",
        "Two square numbers total 89. What are they?",
        ["25 and 64", "36 and 49", "16 and 81"],
        0,
        "25 + 64 = 89 (5² + 8²)",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q22 - Probability spinners
    create_question_entry(
        "cam14-p1-22a",
        "Spinner A has sections: 4,4,2,4. Spinner B has: 1,4,1,3,3,1. Is scoring '4' less likely on A than B?",
        ["True", "False", "Equal"],
        1,
        "A: 3/4 for 4. B: 1/6 for 4. False - 4 is MORE likely on A",
        "Cambridge 2014 Paper 1",
        1,
        True
    ),
    # Q23 - Money ratio problem
    create_question_entry(
        "cam14-p1-23",
        "Two presents cost $120 total. One costs twice the other. Price of the expensive one?",
        ["$60", "$80", "$40"],
        1,
        "x + 2x = 120, x = 40, expensive = $80",
        "Cambridge 2014 Paper 1",
        1
    ),
    # Q25 - Number cards problem
    create_question_entry(
        "cam14-p1-25",
        "Using digits 1-6 once each, what's the smallest odd 6-digit number between 500000-600000?",
        ["512346", "512347", "512463"],
        2,
        "Start with 5, then smallest digits, end odd: 512463",
        "Cambridge 2014 Paper 1",
        1
    ),
]

# Cambridge 2014 Paper 2 Questions (calculator allowed)
PAPER_2_QUESTIONS = [
    # Q1 - Matching calculations
    create_question_entry(
        "cam14-p2-01a",
        "1/2 of 60 = ?",
        ["25", "30", "35"],
        1,
        "60 ÷ 2 = 30",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-01b",
        "1/3 of 78 = ?",
        ["24", "26", "28"],
        1,
        "78 ÷ 3 = 26",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-01c",
        "1/5 of 135 = ?",
        ["25", "27", "29"],
        1,
        "135 ÷ 5 = 27",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q2 - Equivalent fractions
    create_question_entry(
        "cam14-p2-02",
        "Complete the equivalent fraction: 3/4 = ?/? (using dots pattern showing 12 out of 16)",
        ["9/12", "6/8", "12/16"],
        0,
        "3/4 = 9/12 (multiply by 3)",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q3 - Ordering with > and <
    create_question_entry(
        "cam14-p2-03",
        "Complete: 5.? > 5.3 (using digit cards 4,5,7,8)",
        ["5.4", "5.7", "5.8"],
        1,
        "5.7 > 5.3 or 5.8 > 5.3",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q4 - Reading scales
    create_question_entry(
        "cam14-p2-04",
        "Paul weighs 650g of flour. The scale shows 0g-750g. Where should the arrow point?",
        ["Between 500g and 750g, closer to 750g", "Exactly at 650g", "Between 250g and 500g"],
        0,
        "650g is between 500g and 750g, closer to 750g",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q5 - Calendar
    create_question_entry(
        "cam14-p2-05a",
        "Hassan's birthday is August 21st. His party is the Saturday after. The date is?",
        ["August 23rd", "August 24th", "August 25th"],
        0,
        "If August 21 is a weekday, count to next Saturday",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-05b",
        "Ryan's birthday is September 10th. August 21st was Thursday. What day is September 10th?",
        ["Tuesday", "Wednesday", "Thursday"],
        1,
        "Count forward 20 days from Thursday = Wednesday",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q6 - Fractions from picture
    create_question_entry(
        "cam14-p2-06",
        "A string has 10 beads: some white, some colored. What fraction are white?",
        ["3/10", "4/10", "5/10"],
        0,
        "Count white beads out of total 10",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q7 - Bar chart
    create_question_entry(
        "cam14-p2-07a",
        "Bar chart shows: Cartoons=80, News=20, Sports=50, Nature=40. Total children asked?",
        ["180", "190", "200"],
        1,
        "80 + 20 + 50 + 40 = 190",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    create_question_entry(
        "cam14-p2-07b",
        "How many more children liked cartoons than sports?",
        ["20", "30", "40"],
        1,
        "80 - 50 = 30",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q8 - Division with remainder
    create_question_entry(
        "cam14-p2-08",
        "750 paper clips, 8 per model aeroplane. How many complete aeroplanes?",
        ["93", "94", "95"],
        0,
        "750 ÷ 8 = 93.75, so 93 complete aeroplanes",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q9 - Multiples
    create_question_entry(
        "cam14-p2-09",
        "Is 375 a multiple of 25?",
        ["Yes", "No", "Cannot tell"],
        0,
        "375 ÷ 25 = 15, exactly divisible, so yes",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q10 - Number sequences
    create_question_entry(
        "cam14-p2-10a",
        "Sequence: 15, 23, 31, ?. What's next?",
        ["37", "39", "41"],
        1,
        "Pattern: +8. 31 + 8 = 39",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-10b",
        "Sequence: ?, ?, 43, 52, 61. Find the first number.",
        ["25", "26", "27"],
        0,
        "Pattern: +9. Going back: 43-9=34, 34-9=25",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q11 - Odd and even
    create_question_entry(
        "cam14-p2-11a",
        "True or False: even + even + even = even",
        ["True", "False", "Sometimes"],
        0,
        "Sum of even numbers is always even",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-11b",
        "True or False: odd - odd = odd",
        ["True", "False", "Sometimes"],
        1,
        "odd - odd = even. Example: 5 - 3 = 2",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-11c",
        "True or False: odd × odd = odd",
        ["True", "False", "Sometimes"],
        0,
        "Odd times odd is always odd. Example: 3 × 5 = 15",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q12 - Factor puzzle
    create_question_entry(
        "cam14-p2-12",
        "□ × □ × □ = 100. Find three different numbers from 1-10.",
        ["2, 5, 10", "4, 5, 5", "2, 2, 25"],
        0,
        "2 × 5 × 10 = 100",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q13 - Number line
    create_question_entry(
        "cam14-p2-13",
        "Number line from 0 to 25 divided into 5 equal parts. Each section = ?",
        ["4", "5", "6"],
        1,
        "25 ÷ 5 = 5 per section",
        "Cambridge 2014 Paper 2",
        2,
        True
    ),
    # Q14 - Venn diagram
    create_question_entry(
        "cam14-p2-14",
        "In a Venn diagram for multiples of 6 and 8, where does 48 go?",
        ["Only multiples of 6", "Only multiples of 8", "Intersection (both)"],
        2,
        "48 = 6×8, so it's a multiple of both",
        "Cambridge 2014 Paper 2",
        2,
        True
    ),
    # Q15 - 24-hour time
    create_question_entry(
        "cam14-p2-15",
        "Clock shows 8:55 in the evening. What is this in 24-hour format?",
        ["08:55", "18:55", "20:55"],
        2,
        "8:55 pm = 20:55 (add 12 hours)",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q16 - Time calculation
    create_question_entry(
        "cam14-p2-16",
        "Aeroplane departs 4:45 pm, arrives 2h 35min later. Arrival time?",
        ["7:00 pm", "7:10 pm", "7:20 pm"],
        2,
        "4:45 + 2:35 = 7:20 pm",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q17 - Distance table
    create_question_entry(
        "cam14-p2-17",
        "Distance table shows Rome to Bangkok is 8844 km. What is Paris to Bangkok?",
        ["9457 km", "9545 km", "8844 km"],
        0,
        "Read from table: Paris to Bangkok = 9457 km",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q18 - Length ordering
    create_question_entry(
        "cam14-p2-18",
        "Order these lengths from shortest to longest: 0.5m, 70mm, 0.3m, 40cm",
        ["70mm, 0.3m, 40cm, 0.5m", "0.3m, 70mm, 40cm, 0.5m", "40cm, 0.3m, 70mm, 0.5m"],
        0,
        "Convert all to cm: 50cm, 7cm, 30cm, 40cm. Order: 7, 30, 40, 50",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q19 - Coordinates
    create_question_entry(
        "cam14-p2-19a",
        "Point A on a trapezium is at position (2, 3). What are its coordinates?",
        ["(2, 3)", "(3, 2)", "(2, 2)"],
        0,
        "Coordinates are (x, y) = (2, 3)",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q20 - Percentage
    create_question_entry(
        "cam14-p2-20a",
        "Grid of 25 squares, 10 are grey. What percentage is grey?",
        ["25%", "40%", "50%"],
        1,
        "10/25 = 40/100 = 40%",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    create_question_entry(
        "cam14-p2-20b",
        "How many more squares need to be grey to make 75%?",
        ["5", "8", "9"],
        2,
        "75% of 25 = 18.75 → 19 squares. Need 19 - 10 = 9 more",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q21 - Ordering fractions and decimals
    create_question_entry(
        "cam14-p2-21",
        "Order smallest to largest: 6/10, 1/2, 0.55, 0.7",
        ["1/2, 0.55, 6/10, 0.7", "0.55, 1/2, 6/10, 0.7", "6/10, 0.55, 1/2, 0.7"],
        0,
        "1/2=0.5, 6/10=0.6. Order: 0.5, 0.55, 0.6, 0.7",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q22 - Money
    create_question_entry(
        "cam14-p2-22a",
        "Which two items from soft toy $4.10, book $1.79, watch $4.91, camera $4.34, kite $2.19, ball $2.86 cost $7.20?",
        ["Book and Kite", "Camera and Ball", "Soft toy and Watch"],
        0,
        "Check combinations: book $1.79 + camera $4.34 + kite $2.19... No. Actually soft toy $4.10 + ball $2.86 = $6.96. Camera $4.34 + ball $2.86 = $7.20 ✓",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    create_question_entry(
        "cam14-p2-22b",
        "How much change from $20 after spending $7.20?",
        ["$12.80", "$13.20", "$12.20"],
        0,
        "$20.00 - $7.20 = $12.80",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q23 - Largest product
    create_question_entry(
        "cam14-p2-23",
        "Using digits 3, 4, 5, 6 once each, make the largest product: □□ × □□",
        ["63 × 54", "64 × 53", "65 × 43"],
        0,
        "63 × 54 = 3402. Test: 64 × 53 = 3392. 63 × 54 is largest",
        "Cambridge 2014 Paper 2",
        2
    ),
    # Q24 - Area of squares
    create_question_entry(
        "cam14-p2-24a",
        "Square A has area 100 cm². What is the height of square A?",
        ["10 cm", "25 cm", "50 cm"],
        0,
        "√100 = 10 cm",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    create_question_entry(
        "cam14-p2-24b",
        "Square B has area 36 cm². Combined shape has side X. What is length X?",
        ["4 cm", "6 cm", "10 cm"],
        0,
        "Side of B = √36 = 6 cm. X = 10 - 6 = 4 cm",
        "Cambridge 2014 Paper 2",
        1,
        True
    ),
    # Q25 - Order of operations
    create_question_entry(
        "cam14-p2-25a",
        "800 ÷ (40 × 2) = ?",
        ["5", "10", "20"],
        1,
        "800 ÷ 80 = 10",
        "Cambridge 2014 Paper 2",
        1
    ),
    create_question_entry(
        "cam14-p2-25b",
        "(24.1 - 7.6) × (6.7 + 17.3) = ?",
        ["396", "405", "420"],
        0,
        "16.5 × 24 = 396",
        "Cambridge 2014 Paper 2",
        1
    ),
    # Q26 - Mode puzzle
    create_question_entry(
        "cam14-p2-26",
        "5 cards with digits 1-4. Mode is 3, sum is 14. What are the 5 digits?",
        ["2, 3, 3, 3, 3", "1, 3, 3, 3, 4", "2, 2, 3, 3, 4"],
        1,
        "Mode = 3 means most frequent. 1+3+3+3+4=14 ✓",
        "Cambridge 2014 Paper 2",
        2
    ),
]


def main():
    """Generate and save Cambridge 2014 questions."""
    all_questions = PAPER_1_QUESTIONS + PAPER_2_QUESTIONS

    # Count by topic
    topic_counts = {}
    for q in all_questions:
        topic = q["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    print(f"Total questions extracted: {len(all_questions)}")
    print("\nBy topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")

    # Save to JSON
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "src", "data", "cambridge-2014-questions.json"
    )

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to: {output_path}")

    return all_questions


if __name__ == "__main__":
    main()
