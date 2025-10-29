/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/reactions";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

jest.mock("@/lib/serverAuth");
jest.mock("@/lib/prismadb", () => ({
  profile: { findFirst: jest.fn() },
  reaction: { findMany: jest.fn() },
  movie: { findUnique: jest.fn() },
  tvShow: { findUnique: jest.fn() },
}));

const mockServerAuth = serverAuth as jest.MockedFunction<typeof serverAuth>;
const mockProfileFindFirst = prismadb.profile.findFirst as any;
const mockReactionFindMany = prismadb.reaction.findMany as any;
const mockMovieFindUnique = prismadb.movie.findUnique as any;
const mockTvFindUnique = prismadb.tvShow.findUnique as any;

describe("/api/reactions", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    status = jest.fn().mockReturnThis();
    json = jest.fn().mockReturnThis();
    req = { method: "GET", query: { profileId: "p1" } } as any;
    res = { status, json } as any;
    mockServerAuth.mockResolvedValue({ currentUser: { id: "u1" } } as any);
  });

  it("rejects non-GET methods", async () => {
    req.method = "POST";
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(405);
  });

  it("validates profileId", async () => {
    req.query = {} as any;
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(400);
  });

  it("returns reactions with local items expanded", async () => {
    mockProfileFindFirst.mockResolvedValue({ id: "p1", userId: "u1" });
    mockReactionFindMany.mockResolvedValue([
      {
        contentId: "m1",
        contentType: "movie",
        source: "local",
        reactionType: "liked",
      },
      {
        contentId: "t1",
        contentType: "tv",
        source: "local",
        reactionType: "loved",
      },
    ]);
    mockMovieFindUnique.mockResolvedValue({ id: "m1", title: "Local Movie" });
    mockTvFindUnique.mockResolvedValue({ id: "t1", title: "Local TV" });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "m1", reactionType: "liked" }),
        expect.objectContaining({ id: "t1", reactionType: "loved" }),
      ])
    );
  });
});
