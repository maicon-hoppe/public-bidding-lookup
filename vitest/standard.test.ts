import { describe, it, expect } from 'vitest';
import type { TableContract } from "../src/lib/types";

const WEBSITE_URL = new URL("http://localhost:5173");

describe("API response", () => {
    it("blocks malformed requests", async () => {
        const response1 = await fetch(`${WEBSITE_URL.toString()}contratos_json?quantity=1`);
        const response2 = await fetch(`${WEBSITE_URL.toString()}contratos_json?offset=1`);
        const response1Json = await response1.json();
        const response2Json = await response2.json();

        expect(response1Json).toBe("Request Malformed.");
        expect(response2Json).toBe("Request Malformed.");
    });

    it("limits response length", async () => {
        const response = await fetch(`${WEBSITE_URL.toString()}contratos_json?quantity=1000&offset=0`);
        const responseJson = await response.text();

        expect(responseJson).toContain('quantity must be a value between 1 and');
    });

    it("returns the right amount of entries", async () => {
        const quantity0to10 = parseInt(`${Math.random() * 10}`);
        const response = await fetch(`${WEBSITE_URL.toString()}contratos_json?quantity=${quantity0to10}&offset=0`);
        const responseJson = await response.json() as TableContract[];

        await expect(responseJson.length).toBe(quantity0to10);
    });
});