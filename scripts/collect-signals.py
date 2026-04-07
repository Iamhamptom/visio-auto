#!/usr/bin/env python3
"""
Signal Collector — finds real car buyers using web scraping.
Runs locally with Playwright for browser-based scraping.
Pushes signals directly to Supabase.

Usage: python3 scripts/collect-signals.py [--area Polokwane] [--brand Toyota]
"""
import json, urllib.request, urllib.parse, re, time, sys, os, subprocess

# Load env
env = {}
with open("/Users/hga/visio-auto/.env.local") as f:
    for line in f:
        if "=" in line and not line.startswith("#"):
            k, v = line.strip().split("=", 1)
            env[k] = v.strip('"')

SUPA_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPA_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
HEADERS = {"apikey": SUPA_KEY, "Authorization": f"Bearer {SUPA_KEY}", "Content-Type": "application/json", "User-Agent": "VisioAuto/1.0"}

# Parse args
area = "Gauteng"
brand = ""
for i, arg in enumerate(sys.argv):
    if arg == "--area" and i+1 < len(sys.argv): area = sys.argv[i+1]
    if arg == "--brand" and i+1 < len(sys.argv): brand = sys.argv[i+1]

print(f"SIGNAL COLLECTOR — Area: {area}, Brand: {brand or 'all'}")
print("=" * 60)

# ─── INTENT DETECTION ────────────────────────────────────
STRONG_INTENT = [
    "looking to buy", "want to buy", "need a car", "need a bakkie",
    "in the market for", "budget of", "test drive", "recommend a dealer",
    "which dealership", "finance approved", "ready to buy", "urgently need",
    "soek n", "wil koop", "te koop gesoek", "anyone selling",
    "where can i find", "how much", "price of",
]

MODERATE_INTENT = [
    "looking for a", "thinking of buying", "which is better",
    "first car", "car shopping", "should i buy", "save up for",
    "my next car", "upgrading", "recommend",
]

SA_LOCATIONS = {
    "johannesburg": ("Johannesburg", "Gauteng"), "joburg": ("Johannesburg", "Gauteng"),
    "pretoria": ("Pretoria", "Gauteng"), "centurion": ("Centurion", "Gauteng"),
    "sandton": ("Sandton", "Gauteng"), "midrand": ("Midrand", "Gauteng"),
    "fourways": ("Fourways", "Gauteng"), "cape town": ("Cape Town", "Western Cape"),
    "durban": ("Durban", "KwaZulu-Natal"), "umhlanga": ("Umhlanga", "KwaZulu-Natal"),
    "polokwane": ("Polokwane", "Limpopo"), "nelspruit": ("Nelspruit", "Mpumalanga"),
    "bloemfontein": ("Bloemfontein", "Free State"), "east london": ("East London", "Eastern Cape"),
    "port elizabeth": ("Port Elizabeth", "Eastern Cape"), "rustenburg": ("Rustenburg", "North West"),
    "potchefstroom": ("Potchefstroom", "North West"), "stellenbosch": ("Stellenbosch", "Western Cape"),
    "george": ("George", "Western Cape"), "kimberley": ("Kimberley", "Northern Cape"),
    "gauteng": ("Gauteng", "Gauteng"), "western cape": ("Cape Town", "Western Cape"),
    "kwazulu": ("Durban", "KwaZulu-Natal"), "limpopo": ("Polokwane", "Limpopo"),
}

VEHICLES = {
    "hilux": "Toyota Hilux", "fortuner": "Toyota Fortuner", "ranger": "Ford Ranger",
    "everest": "Ford Everest", "polo": "Volkswagen Polo", "golf": "Volkswagen Golf",
    "bmw": "BMW", "320i": "BMW 320i", "x3": "BMW X3", "mercedes": "Mercedes-Benz",
    "c-class": "Mercedes C-Class", "tucson": "Hyundai Tucson", "creta": "Hyundai Creta",
    "navara": "Nissan Navara", "jimny": "Suzuki Jimny", "cx-5": "Mazda CX-5",
    "d-max": "Isuzu D-MAX", "bakkie": "Bakkie", "suv": "SUV", "sedan": "Sedan",
}

def detect_intent(text):
    lower = text.lower()
    if any(kw in lower for kw in STRONG_INTENT): return "strong"
    if any(kw in lower for kw in MODERATE_INTENT): return "medium"
    return "weak"

def detect_location(text):
    lower = text.lower()
    for kw, (city, province) in SA_LOCATIONS.items():
        if kw in lower: return city, province
    return area, ""

def detect_vehicle(text):
    lower = text.lower()
    for kw, vehicle in VEHICLES.items():
        if kw in lower: return vehicle
    return None

def insert_signal(signal):
    data = json.dumps(signal).encode()
    req = urllib.request.Request(f"{SUPA_URL}/rest/v1/va_signals", data=data, headers=HEADERS)
    try:
        urllib.request.urlopen(req)
        return True
    except:
        return False

# ─── GOOGLE SCRAPING (via curl, no API) ──────────────────
def google_scrape(query, num=10):
    """Scrape Google search results without API"""
    results = []
    encoded = urllib.parse.quote(query)
    url = f"https://www.google.com/search?q={encoded}&num={num}&gl=za&hl=en"

    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
        "Accept-Language": "en-ZA,en;q=0.9",
    })

    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="ignore")

        # Extract snippets from Google results
        # Google wraps snippets in various div classes
        snippets = re.findall(r'<div[^>]*class="[^"]*(?:VwiC3b|IsZvec|s3v9rd)[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
        titles = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
        links = re.findall(r'<a[^>]*href="/url\?q=(https?://[^&"]+)', html)

        for i in range(min(len(snippets), num)):
            text = re.sub(r'<[^>]+>', '', snippets[i]).strip()
            title = re.sub(r'<[^>]+>', '', titles[i]).strip() if i < len(titles) else ""
            link = urllib.parse.unquote(links[i]) if i < len(links) else ""
            if text:
                results.append({"title": title, "snippet": text, "url": link})
    except Exception as e:
        print(f"  Google scrape failed: {e}")

    return results

# ─── COLLECT SIGNALS ─────────────────────────────────────
all_signals = []

# 1. Facebook group buying intent
print("\n[1/5] Facebook — car buying intent...")
fb_queries = [
    f'"looking for a" (car OR bakkie OR hilux OR ranger) site:facebook.com {area}',
    f'"want to buy" (car OR suv OR bakkie) site:facebook.com South Africa',
    f'"need a car" OR "need a bakkie" site:facebook.com {area}',
]
if brand:
    fb_queries.append(f'"looking for" "{brand}" site:facebook.com South Africa')

for q in fb_queries:
    results = google_scrape(q, 5)
    for r in results:
        intent = detect_intent(r["snippet"])
        if intent == "weak": continue
        city, province = detect_location(r["snippet"])
        vehicle = detect_vehicle(r["snippet"])
        all_signals.append({
            "signal_type": "social_intent",
            "title": f"Facebook: {r['title'][:60]}",
            "description": r["snippet"][:200],
            "data_source": "facebook",
            "source_url": r["url"],
            "signal_strength": "strong" if intent == "strong" else "medium",
            "buying_probability": 70 if intent == "strong" else 45,
            "area": city, "city": city, "province": province,
            "vehicle_type_likely": vehicle,
            "is_processed": False,
        })
    time.sleep(3)

print(f"  Found {len(all_signals)} Facebook signals")

# 2. YouTube comment intent
print("\n[2/5] YouTube — car review comments...")
yt_queries = [
    f'"looking to buy" OR "how much" OR "where can i buy" site:youtube.com South Africa car {area}',
    f'"recommend a dealer" OR "which dealership" site:youtube.com {area} car',
]
if brand:
    yt_queries.append(f'"{brand}" review South Africa "how much" OR "price" site:youtube.com')

yt_start = len(all_signals)
for q in yt_queries:
    results = google_scrape(q, 5)
    for r in results:
        intent = detect_intent(r["snippet"])
        if intent == "weak": continue
        city, province = detect_location(r["snippet"])
        vehicle = detect_vehicle(r["snippet"])
        all_signals.append({
            "signal_type": "social_intent",
            "title": f"YouTube: {r['title'][:60]}",
            "description": r["snippet"][:200],
            "data_source": "youtube",
            "source_url": r["url"],
            "signal_strength": "strong" if intent == "strong" else "medium",
            "buying_probability": 65 if intent == "strong" else 40,
            "area": city, "city": city, "province": province,
            "vehicle_type_likely": vehicle,
            "is_processed": False,
        })
    time.sleep(3)

print(f"  Found {len(all_signals) - yt_start} YouTube signals")

# 3. CIPC new businesses (need vehicles)
print("\n[3/5] CIPC — new companies needing vehicles...")
cipc_queries = [
    f'"new company" OR "recently registered" transport OR logistics OR construction {area} South Africa',
    f'"CIPC" OR "company registration" fleet OR vehicles OR transport {area}',
]
cipc_start = len(all_signals)
for q in cipc_queries:
    results = google_scrape(q, 5)
    for r in results:
        city, province = detect_location(r["snippet"])
        all_signals.append({
            "signal_type": "new_business",
            "title": f"New Business: {r['title'][:60]}",
            "description": r["snippet"][:200],
            "data_source": "cipc",
            "source_url": r["url"],
            "signal_strength": "medium",
            "buying_probability": 55,
            "area": city, "city": city, "province": province,
            "vehicle_type_likely": "Commercial/Fleet",
            "is_processed": False,
        })
    time.sleep(3)

print(f"  Found {len(all_signals) - cipc_start} CIPC signals")

# 4. Property — relocations
print("\n[4/5] Property — new homeowners...")
prop_queries = [
    f'"just bought" OR "new home" OR "moved to" {area} South Africa',
    f'"new development" OR "estate" handover OR occupied {area}',
]
prop_start = len(all_signals)
for q in prop_queries:
    results = google_scrape(q, 5)
    for r in results:
        city, province = detect_location(r["snippet"])
        all_signals.append({
            "signal_type": "relocation",
            "title": f"Relocation: {r['title'][:60]}",
            "description": r["snippet"][:200],
            "data_source": "property",
            "source_url": r["url"],
            "signal_strength": "medium",
            "buying_probability": 50,
            "area": city, "city": city, "province": province,
            "vehicle_type_likely": "SUV/Sedan",
            "is_processed": False,
        })
    time.sleep(3)

print(f"  Found {len(all_signals) - prop_start} property signals")

# 5. LinkedIn — job changes / promotions
print("\n[5/5] LinkedIn — career changes...")
li_queries = [
    f'"started a new position" OR "excited to announce" OR "new role" {area} site:linkedin.com',
    f'"fleet manager" OR "operations director" OR "procurement" {area} hiring site:linkedin.com',
]
li_start = len(all_signals)
for q in li_queries:
    results = google_scrape(q, 5)
    for r in results:
        city, province = detect_location(r["snippet"])
        name_match = re.search(r'([A-Z][a-z]+ [A-Z][a-z]+)', r["title"])
        all_signals.append({
            "signal_type": "job_change",
            "title": f"Career: {r['title'][:60]}",
            "description": r["snippet"][:200],
            "person_name": name_match.group(1) if name_match else None,
            "data_source": "linkedin",
            "source_url": r["url"],
            "signal_strength": "medium",
            "buying_probability": 50,
            "area": city, "city": city, "province": province,
            "vehicle_type_likely": None,
            "is_processed": False,
        })
    time.sleep(3)

print(f"  Found {len(all_signals) - li_start} LinkedIn signals")

# ─── INSERT TO SUPABASE ──────────────────────────────────
print(f"\n{'=' * 60}")
print(f"TOTAL SIGNALS: {len(all_signals)}")

if SUPA_URL and SUPA_KEY:
    inserted = 0
    for signal in all_signals:
        if insert_signal(signal):
            inserted += 1
    print(f"Inserted {inserted}/{len(all_signals)} signals into va_signals")
else:
    print("No Supabase credentials — saving to file only")

# Save to file
with open("/Users/hga/visio-auto/leads/COLLECTED_SIGNALS.json", "w") as f:
    json.dump(all_signals, f, indent=2)
print(f"Saved to leads/COLLECTED_SIGNALS.json")

# Summary by type
from collections import Counter
types = Counter(s["signal_type"] for s in all_signals)
sources = Counter(s["data_source"] for s in all_signals)
print(f"\nBy type: {dict(types)}")
print(f"By source: {dict(sources)}")
