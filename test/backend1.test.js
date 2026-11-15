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

test("Backend 1 exposes all contact routes", async () => {
  const routes = [
    ["POST", "/api/contacts", "create handler"],
    ["GET", "/api/contacts", "findAll handler"],
    ["DELETE", "/api/contacts", "deleteAll handler"],
    ["GET", "/api/contacts/favorite", "findAllFavorite handler"],
    ["GET", "/api/contacts/507f1f77bcf86cd799439011", "findOne handler"],
    ["PUT", "/api/contacts/507f1f77bcf86cd799439011", "update handler"],
    ["DELETE", "/api/contacts/507f1f77bcf86cd799439011", "delete handler"],
  ];

  for (const [method, path, message] of routes) {
    const response = await fetch(`${baseUrl}${path}`, { method });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message });
  }
});

test("unknown URL returns a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/not-defined`);
  expect(response.status).toBe(404);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(await response.json()).toEqual({ message: "Resource not found" });
});
