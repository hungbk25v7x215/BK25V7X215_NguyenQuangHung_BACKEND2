import { afterAll, beforeAll, expect, test } from "bun:test";
import { MongoClient } from "mongodb";

const database = `contactbook_seed_test_${crypto.randomUUID().replaceAll("-", "")}`;
const uri = `mongodb://127.0.0.1:27017/${database}`;
const client = new MongoClient(uri);

beforeAll(() => client.connect());
afterAll(async () => {
  await client.db(database).dropDatabase();
  await client.close();
});

test("seed adds 150 valid contacts once and keeps existing contacts", async () => {
  const contacts = client.db(database).collection("contacts");
  await contacts.insertOne({ name: "Existing contact", email: "keep@example.test" });

  for (let attempt = 0; attempt < 2; attempt++) {
    const child = Bun.spawn(["bun", "run", "seed"], {
      cwd: import.meta.dir.replace(/\/test$/, ""),
      env: { ...process.env, MONGODB_URI: uri },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await child.exited).toBe(0);
  }

  expect(await contacts.countDocuments()).toBe(151);
  expect(await contacts.findOne({ email: "keep@example.test" })).toMatchObject({
    name: "Existing contact",
  });
  expect(await contacts.findOne({ email: "seed001@example.test" })).toMatchObject({
    name: expect.any(String),
    address: expect.any(String),
    phone: expect.any(String),
    favorite: expect.any(Boolean),
  });
  expect(await contacts.findOne({ email: "seed150@example.test" })).not.toBeNull();
  expect(await contacts.countDocuments({ favorite: true })).toBe(30);
});
