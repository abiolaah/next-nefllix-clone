import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
import { jest } from "@jest/globals";

// Use proper type casting to avoid TypeScript errors
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Properly typed fetch mock
global.fetch = jest.fn(
  () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }) as Promise<Response>
);
