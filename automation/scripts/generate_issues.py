import csv
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_CSV = os.path.join(BASE_DIR, "input", "contractor_checklist.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

TEMPLATE = """# Issue Report

## Title
{title}

## Current Behavior
{description}

## Expected Behavior
{expected}

## Steps to Reproduce
1. Open the app
2. Navigate to: {category} → {subtask}
3. Observe: {description}

## Files Involved
{files}

## Acceptance Criteria
1. {expected}
2. No unmatched routes
3. No crashes

## Constraints
- No redesigns
- No UI rebuilds
- Only fix existing behavior
"""

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

with open(INPUT_CSV, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        status = row["status"].strip().lower()

        if status in ("pending", "fail"):
            title = f"[{row['Category']}] {row['Subtask']} Issue"
            filename = f"{row['StepNumber']}_{row['Category']}_{row['Subtask']}.md"
            filepath = os.path.join(OUTPUT_DIR, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(TEMPLATE.format(
                    title=title,
                    description=row["Description"],
                    expected=row["ExpectedOutcome"],
                    category=row["Category"],
                    subtask=row["Subtask"],
                    files=row["FilesInvolved"]
                ))

print("DONE — Issue files created in:", OUTPUT_DIR)
