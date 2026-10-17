import assert from "node:assert/strict";
export async function testPannaKidsApi({ mf, db, adminCookie, userCookie }) {
  const path = "/api/products/panna-kids/inquiries";
  const configuration = {
    schemaVersion: 1,
    catalogueVersion: 1,
    productId: "panna-kids",
    id: crypto.randomUUID(),
    revision: 3,
    name: "Panna test",
    color: "blue",
    surface: "epdm",
    branding: true,
    installation: "request",
    city: "Warszawa",
    site: "existing",
    desiredMonth: "2027-05",
  };
  const input = {
    submissionId: crypto.randomUUID(),
    configuration,
    contact: {
      name: "Test User",
      email: "panna-test@example.test",
      company: "Test",
      note: "<script>not executed</script>",
    },
    acknowledged: true,
  };
  async function send(body = input, expected = 201, extra = {}) {
    const r = await mf.dispatchFetch("https://gamefields.test" + path, {
      method: "POST",
      headers: {
        Origin: "https://gamefields.test",
        "Content-Type": "application/json",
        ...extra,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    const d = await r.json();
    assert.equal(r.status, expected, JSON.stringify(d));
    assert.equal(r.headers.get("cache-control"), "no-store");
    return d;
  }
  await send(input, 403, { Origin: "https://other.test" });
  await send(input, 415, { "Content-Type": "text/plain" });
  await send("{", 400);
  await send("x".repeat(17000), 413);
  await send(
    { ...input, configuration: { ...configuration, priceNetPln: 1 } },
    400,
  );
  await send({ ...input, acknowledged: false }, 400);
  await db.exec(
    "ALTER TABLE panna_kids_inquiries RENAME TO temporarily_unavailable",
  );
  await send(input, 503);
  await db.exec(
    "ALTER TABLE temporarily_unavailable RENAME TO panna_kids_inquiries",
  );
  const received = await send();
  assert.equal(received.status, "received");
  assert.equal(received.engineeringApproval, "REQUIRED");
  assert.equal(received.contact, undefined);
  const retries = await Promise.all([send(), send()]);
  for (const retry of retries)
    assert.equal(retry.reference, received.reference);
  await send(
    { ...input, configuration: { ...configuration, revision: 4 } },
    409,
  );
  const stored = await db
    .prepare("SELECT * FROM panna_kids_inquiries WHERE id=?")
    .bind(received.reference)
    .first();
  assert.deepEqual(JSON.parse(stored.configuration_json), configuration);
  assert.deepEqual(JSON.parse(stored.contact_json), input.contact);
  assert.equal(JSON.parse(stored.commercial_snapshot_json).approved, false);
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM panna_kids_inquiries").first())
      .n,
    1,
  );
  for (let i = 0; i < 4; i++)
    await send({ ...input, submissionId: crypto.randomUUID() });
  await send({ ...input, submissionId: crypto.randomUUID() }, 429);
  assert.equal(
    (await send()).reference,
    received.reference,
    "Retries remain idempotent after rate limit",
  );
  const anon = await mf.dispatchFetch("https://gamefields.test" + path);
  assert.equal(anon.status, 401);
  const forbidden = await mf.dispatchFetch("https://gamefields.test" + path, {
    headers: { Cookie: userCookie },
  });
  assert.equal(forbidden.status, 403);
  const admin = await mf.dispatchFetch("https://gamefields.test" + path, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(admin.status, 200);
  const list = await admin.json();
  assert.equal(list.inquiries.length, 5);
  assert.equal(
    list.inquiries.find((r) => r.reference === received.reference).configuration
      .revision,
    3,
  );
  console.log(
    "PASS: Panna Kids real database persistence, immutable snapshots, idempotent retries, validation, failure states, rate limit and administrator-only access.",
  );
}
