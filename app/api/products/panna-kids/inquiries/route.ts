import { getD1 } from "@/db";
import {
  PANNA_KIDS_TARGET,
  pannaInquirySchema,
} from "@/lib/products/panna-kids";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { requirePlayAdmin } from "@/lib/play-admin";
import { playError } from "@/lib/play-http";
import { assertSameOrigin } from "@/lib/play-http";
const response = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return response({ error: "INVALID_ORIGIN" }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return response({ error: "JSON_REQUIRED" }, 415);
  const reader = request.body?.getReader();
  if (!reader) return response({ error: "INVALID_REQUEST" }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) {
      await reader.cancel();
      return response({ error: "REQUEST_TOO_LARGE" }, 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return response({ error: "INVALID_JSON" }, 400);
  }
  const parsed = pannaInquirySchema.safeParse(raw);
  if (!parsed.success) return response({ error: "INVALID_REQUEST" }, 400);
  const { submissionId, configuration, contact } = parsed.data;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(parsed.data)),
  );
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  try {
    const db = getD1();
    const previous = await db
      .prepare(
        "SELECT id,payload_hash FROM panna_kids_inquiries WHERE submission_id=?",
      )
      .bind(submissionId)
      .first<{ id: string; payload_hash: string }>();
    if (previous)
      return previous.payload_hash === hash
        ? response(
            {
              ok: true,
              reference: previous.id,
              status: "received",
              engineeringApproval: "REQUIRED",
            },
            201,
          )
        : response({ error: "SUBMISSION_CONFLICT" }, 409);
    const id = `PK-${crypto.randomUUID()}`;
    // One atomic insert: retries with the same submission id cannot duplicate a lead.
    await db
      .prepare(
        `INSERT INTO panna_kids_inquiries
      (id,submission_id,payload_hash,configuration_json,contact_json,commercial_snapshot_json,catalogue_version,status,created_at)
      SELECT ?,?,?,?,?,?,?,'received',? WHERE (SELECT count(*) FROM panna_kids_inquiries WHERE lower(json_extract(contact_json,'$.email'))=? AND created_at>?)<5 ON CONFLICT(submission_id) DO NOTHING`,
      )
      .bind(
        id,
        submissionId,
        hash,
        JSON.stringify(configuration),
        JSON.stringify(contact),
        JSON.stringify(PANNA_KIDS_TARGET),
        configuration.catalogueVersion,
        Date.now(),
        contact.email.toLowerCase(),
        Date.now() - 3600_000,
      )
      .run();
    const stored = await db
      .prepare(
        "SELECT id,payload_hash FROM panna_kids_inquiries WHERE submission_id=?",
      )
      .bind(submissionId)
      .first<{ id: string; payload_hash: string }>();
    if (!stored) return response({ error: "RATE_LIMITED" }, 429);
    if (stored.payload_hash !== hash)
      return response({ error: "SUBMISSION_CONFLICT" }, 409);
    return response(
      {
        ok: true,
        reference: stored.id,
        status: "received",
        engineeringApproval: "REQUIRED",
      },
      201,
    );
  } catch {
    // No customer data or database internals in responses/logs; never report success before persistence.
    return response({ error: "INQUIRY_STORAGE_UNAVAILABLE" }, 503);
  }
}

// Personal data is readable only by the existing verified GAMEFIELDS administrator role.
export async function GET() {
  try {
    await requirePlayAdmin(await requireCurrentPlayUser());
    const result = await getD1()
      .prepare(
        "SELECT id,configuration_json,contact_json,commercial_snapshot_json,status,created_at FROM panna_kids_inquiries ORDER BY created_at DESC LIMIT 50",
      )
      .all<{
        id: string;
        configuration_json: string;
        contact_json: string;
        commercial_snapshot_json: string;
        status: string;
        created_at: number;
      }>();
    return response(
      {
        ok: true,
        inquiries: result.results.map((r) => ({
          reference: r.id,
          configuration: JSON.parse(r.configuration_json),
          contact: JSON.parse(r.contact_json),
          commercialTarget: JSON.parse(r.commercial_snapshot_json),
          status: r.status,
          createdAt: r.created_at,
        })),
      },
      200,
    );
  } catch (error) {
    return playError(error);
  }
}
