/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/watching";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

jest.mock("@/lib/serverAuth");
jest.mock("@/lib/prismadb", () => ({
  profile: { findFirst: jest.fn() },
  movie: { findUnique: jest.fn() },
  tvShow: { findUnique: jest.fn() },
  watching: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

const mockServerAuth = serverAuth as jest.MockedFunction<typeof serverAuth>;
const mockProfileFindFirst = prismadb.profile.findFirst as any;
const mockMovieFindUnique = prismadb.movie.findUnique as any;
const mockWatchingFindFirst = prismadb.watching.findFirst as any;
const mockWatchingUpdate = prismadb.watching.update as any;
const mockWatchingCreate = prismadb.watching.create as any;
const mockWatchingDeleteMany = prismadb.watching.deleteMany as any;

describe("/api/watching", () => {
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
    mockServerAuth.mockResolvedValue({ currentUser: { id: "u1" } } as any);
  });

  it("creates a new watching record (POST)", async () => {
    req = {
      method: "POST",
      body: {
        mediaId: "m1",
        profileId: "p1",
        mediaType: "movie",
        progress: 10,
        source: "local",
      },
    } as any;
    mockProfileFindFirst.mockResolvedValue({ id: "p1", userId: "u1" });
    mockMovieFindUnique.mockResolvedValue({ id: "m1" });
    mockWatchingFindFirst.mockResolvedValue(null);
    mockWatchingCreate.mockResolvedValue({ id: "w1", contentId: "m1" });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: "w1" }));
  });

  it("updates an existing watching record (POST)", async () => {
    req = {
      method: "POST",
      body: {
        mediaId: "m1",
        profileId: "p1",
        mediaType: "movie",
        progress: 50,
      },
    } as any;
    mockProfileFindFirst.mockResolvedValue({ id: "p1", userId: "u1" });
    mockWatchingFindFirst.mockResolvedValue({ id: "w1", contentId: "m1" });
    mockWatchingUpdate.mockResolvedValue({ id: "w1", progress: 50 });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 50 })
    );
  });

  it("deletes watching records (DELETE)", async () => {
    req = { method: "DELETE", body: { mediaId: "m1", profileId: "p1" } } as any;
    mockProfileFindFirst.mockResolvedValue({ id: "p1", userId: "u1" });
    mockWatchingDeleteMany.mockResolvedValue({ count: 1 });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(204);
    expect(end).toHaveBeenCalled();
  });
});
