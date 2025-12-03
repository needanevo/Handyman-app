import csv
import requests
import sys

BASE_URL = "https://therealjohnson.com"

def test_endpoint(method, path):
    url = BASE_URL + path

    try:
        if method == "get":
            r = requests.get(url, timeout=10)
        elif method == "post":
            r = requests.post(url, timeout=10)
        elif method == "put":
            r = requests.put(url, timeout=10)
        elif method == "delete":
            r = requests.delete(url, timeout=10)
        else:
            return ("fail", f"Unknown method: {method}")

        return ("pass" if r.status_code < 500 else "fail",
                f"HTTP {r.status_code}")

    except Exception as e:
        return ("fail", str(e))

if len(sys.argv) < 2:
    print("Usage: python run_endpoint_tests.py <csv_file>")
    sys.exit(1)

csv_path = sys.argv[1]

with open(csv_path, newline='', encoding="utf-8") as f:
    reader = csv.DictReader(f)
    print("DEBUG CSV HEADERS:", reader.fieldnames)

    for row in reader:
        method = row["method"].strip().lower()
        path = row["route"].strip()

        status, notes = test_endpoint(method, path)
        print(f"{method.upper()} {path} → {status.upper()} ({notes})")
