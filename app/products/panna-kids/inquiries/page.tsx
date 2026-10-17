"use client";
import { useState } from "react";
import {
  pannaSummary,
  type PannaConfiguration,
} from "../../../../lib/products/panna-kids";
import styles from "../panna-kids.module.css";
type Inquiry = {
  reference: string;
  configuration: PannaConfiguration;
  contact: { name: string; email: string; company: string; note: string };
  commercialTarget: {
    priceNetPln: number;
    sourceStatus: string;
    approved: boolean;
  };
  createdAt: number;
  status: string;
};
export default function PannaKidsInquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [message, setMessage] = useState(
    "Dostęp wyłącznie dla administratora GAMEFIELDS.",
  );
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      const response = await fetch("/api/products/panna-kids/inquiries", {
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setMessage(
          "Zaloguj się na konto uprawnionego administratora. Dane klientów nie są dostępne publicznie.",
        );
        return;
      }
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.inquiries))
        throw new Error("Unavailable");
      setRows(data.inquiries);
      setMessage(
        data.inquiries.length
          ? "Ostatnie 50 zapytań. Status przyjęcia nie zatwierdza projektu ani oferty."
          : "Brak zapisanych zapytań.",
      );
    } catch {
      setMessage(
        "Nie udało się odczytać zapytań. Sprawdź połączenie i dostępność bazy danych.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="/products/panna-kids">
          GAMEFIELDS
        </a>
        <a href="/play/auth">Logowanie</a>
      </header>
      <section className={styles.configurator}>
        <p className={styles.eyebrow}>PANNA KIDS / OBSŁUGA SPRZEDAŻY</p>
        <h1>Zapytania o ofertę.</h1>
        <button className={styles.primary} disabled={busy} onClick={load}>
          {busy ? "Wczytywanie…" : "Wczytaj zapytania"}
        </button>
        <p role="status">{message}</p>
        {rows.map((r) => (
          <article className={styles.staticNotice} key={r.reference}>
            <p>
              {r.reference} · {new Date(r.createdAt).toLocaleString("pl-PL")} ·{" "}
              {r.status}
            </p>
            <h2>{r.configuration.name}</h2>
            <p>
              {r.contact.name} / {r.contact.company}
            </p>
            <a href={`mailto:${r.contact.email}`}>{r.contact.email}</a>
            <p>{r.contact.note}</p>
            <dl className={styles.summary}>
              {pannaSummary(r.configuration)
                .filter(([key]) => key !== "Roboczy cel cenowy")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <p>
              Zapisany cel cenowy:{" "}
              {new Intl.NumberFormat("pl-PL").format(
                r.commercialTarget.priceNetPln,
              )}{" "}
              zł netto / {r.commercialTarget.sourceStatus}. Zatwierdzony:{" "}
              {r.commercialTarget.approved ? "tak" : "nie"}.
            </p>
            <p>
              Roboczy cel cenowy w tym szkicu nie jest zatwierdzoną ofertą.
              Engineer Gate: wymagana weryfikacja.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
