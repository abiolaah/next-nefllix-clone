/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/register";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

jest.mock("@/lib/prismadb", () => ({
  user: { findUnique: jest.fn(), create: jest.fn() },
}));
jest.mock("bcrypt", () => ({ hash: jest.fn(() => Promise.resolve("hashed")) }));

describe("Workflow: user registration", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let status: jest.Mock;
  let json: jest.Mock;
  let end: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    status = jest.fn().mockReturnThis();
    json = jest.fn().mockReturnThis();
    end = jest.fn().mockReturnThis();
    res = { status, json, end } as any;
  });

  it("rejects non-POST methods", async () => {
    req = { method: "GET" } as any;
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(405);
  });

  it("returns 422 if email already in use", async () => {
    req = {
      method: "POST",
      body: { email: "a@b.com", name: "A", password: "p" },
    } as any;
    (prismadb.user.findUnique as any).mockResolvedValue({ id: "u1" });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(422);
  });

  it("creates a user and profile on success", async () => {
    req = {
      method: "POST",
      body: { email: "a@b.com", name: "A", password: "p" },
    } as any;
    (prismadb.user.findUnique as any).mockResolvedValue(null);
    (prismadb.user.create as any).mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      profiles: [{ id: "p1" }],
    });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: "u1" }));
  });
});
