import { afterAll, beforeAll, expect, test } from "bun:test";
import { once } from "node:events";
import app from "../app.js";

let server;
let baseUrl;

beforeAll(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => server.close());

test("Backend 1 serves the root greeting as JSON", async () => {
  const response = await fetch(baseUrl);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    message: "Chào mừng bạn đến với ứng dụng sổ liên lạc.",
  });
});

test("unknown URL returns a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/not-defined`);
  expect(response.status).toBe(404);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(await response.json()).toEqual({ message: "Resource not found" });
});
