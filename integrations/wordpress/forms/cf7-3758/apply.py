#!/usr/bin/env python3
"""Update Contact Form 7 form 3758 ("a71dc3a", homepage and /kontakt/) for the photo lead flow, additively.

What changes (everything else on the form stays as it is: recipient, sender, mail body, other messages):
- form: form.html (same three steps and field names as before, plus: up to 3 photos, place-type, optional
  marketing consent, hidden lead-source, new texts),
- mail: attachments get project-photo-2, -3 and project-render (Studio PNG); the subject and body get place type,
  lead source and the Studio link (project-link),
- mail_2: auto-reply to the sender (summary, 1–2 working days, reply-to info@gamefields.eu), without attachments,
- messages.mail_sent_ok: "Dziękujemy. Damian odezwie się w ciągu 1–2 dni roboczych."

Usage:
  python3 apply.py            dry run: reads the live form, saves backup-<time>.json and prints the diff
  python3 apply.py --apply    the same, then saves the form through the CF7 REST API
  python3 apply.py --restore backup-<time>.json   puts a backup back

Credentials: the session proxy authenticates www.gamefields.eu (WordPress application password).
"""
import datetime
import difflib
import json
import pathlib
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
API = "https://www.gamefields.eu/wp-json/contact-form-7/v1/contact-forms/3758"
KEYS = ("form", "mail", "mail_2", "messages", "additional_settings")

EXTRA_BODY = """

— Zdjęcie placu / źródło —
Typ miejsca: [place-type]
Źródło zgłoszenia: [lead-source]
Zgoda na informacje handlowe: [marketing-consent]
Link do konfiguracji w Studio: [project-link]"""

MAIL_2_BODY = """Dzień dobry,

dziękuję za zgłoszenie. Sprawdzę miejsce i odpiszę osobiście w ciągu 1–2 dni roboczych.

Twoje zgłoszenie:
Potrzeba: [project-type]
Typ miejsca: [place-type]
Miejsce: [project-location]
Wymiary: [project-area]
Opis: [your-message]
Twoja konfiguracja w Studio (link ważny 30 dni): [project-link]

Chcesz coś dodać, np. kolejne zdjęcia? Odpowiedz na tę wiadomość.

Zanim odpiszę — zobacz, co teraz budujemy:
Instagram (wzory, montaże, przed i po): https://www.instagram.com/gamefields.eu/
LinkedIn (realizacje dla miast, nabory dotacji): https://www.linkedin.com/company/gamefields
Facebook (nowe boiska w okolicy): https://www.facebook.com/Gamefields.eu

Damian Gawrych
Gamefields — boiska miejskie
info@gamefields.eu · +48 794 911 746
https://www.gamefields.eu/"""


def call(method, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(API, data=data, method=method, headers={"Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def props(doc):
    """CF7 returns the properties at the top level (form, mail, ...) or under "properties", depending on version."""
    src = doc.get("properties", doc)
    return {k: src.get(k) for k in KEYS}


def patched(cur):
    new = json.loads(json.dumps(cur))
    new["form"] = (HERE / "form.html").read_text(encoding="utf-8").strip()
    mail = new["mail"]
    att = mail.get("attachments", "") or ""
    for tag in ("[project-photo]", "[project-photo-2]", "[project-photo-3]", "[project-render]"):
        if tag not in att:
            att = (att + "\n" + tag).strip()
    mail["attachments"] = att
    if "[place-type]" not in mail.get("subject", ""):
        mail["subject"] = (mail.get("subject", "") + " · [place-type] · [lead-source]").strip(" ·")
    if "[lead-source]" not in mail.get("body", ""):
        mail["body"] = mail.get("body", "") + EXTRA_BODY
    m2 = new.get("mail_2") or {}
    m2.update({
        "active": True,
        "subject": "Gamefields — mam Twoje zgłoszenie",
        "sender": mail.get("sender", ""),
        "recipient": "[your-email]",
        "body": MAIL_2_BODY,
        "additional_headers": "Reply-To: info@gamefields.eu",
        "attachments": "",
        "use_html": False,
        "exclude_blank": True,
    })
    new["mail_2"] = m2
    new["messages"] = dict(new.get("messages") or {})
    new["messages"]["mail_sent_ok"] = "Dziękujemy. Damian odezwie się w ciągu 1–2 dni roboczych."
    return new


def show(a, b):
    for k in KEYS:
        x = json.dumps(a.get(k), ensure_ascii=False, indent=1).splitlines()
        y = json.dumps(b.get(k), ensure_ascii=False, indent=1).splitlines()
        d = list(difflib.unified_diff(x, y, f"live:{k}", f"new:{k}", lineterm="", n=1))
        print("\n".join(d) if d else f"= {k}: bez zmian")


def main():
    if "--restore" in sys.argv:
        backup = json.loads((HERE / sys.argv[sys.argv.index("--restore") + 1]).read_text(encoding="utf-8"))
        print(json.dumps(call("POST", backup), ensure_ascii=False)[:300])
        return
    cur = props(call("GET"))
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    (HERE / f"backup-{stamp}.json").write_text(json.dumps(cur, ensure_ascii=False, indent=1), encoding="utf-8")
    new = patched(cur)
    show(cur, new)
    if "--apply" not in sys.argv:
        print(f"\nDry run. Backup: backup-{stamp}.json. Run with --apply to save.")
        return
    res = call("POST", new)
    after = props(call("GET"))
    ok = all(after.get(k) == new.get(k) for k in ("form", "messages"))
    print(json.dumps({"saved": True, "verified_form_and_messages": ok, "status": res.get("status")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
