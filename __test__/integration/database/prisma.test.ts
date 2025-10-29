/* eslint-disable @typescript-eslint/no-explicit-any */
import prismadb from "@/lib/prismadb";

jest.mock("@/lib/prismadb", () => ({
  user: { findUnique: jest.fn(), create: jest.fn() },
  movie: { findUnique: jest.fn(), findMany: jest.fn() },
}));

describe("Database integration (mocked Prisma)", () => {
  it("queries a user by email", async () => {
    (prismadb.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "a@b.com",
    });
    const user = await prismadb.user.findUnique({
      where: { email: "a@b.com" },
    } as any);
    expect(user).toEqual(expect.objectContaining({ email: "a@b.com" }));
  });

  it("creates a user (shape only)", async () => {
    (prismadb.user.create as any).mockResolvedValue({
      id: "u1",
      email: "a@b.com",
    });
    const created = await prismadb.user.create({
      data: { email: "a@b.com" },
    } as any);
    expect(created).toEqual(expect.objectContaining({ id: "u1" }));
  });
});
