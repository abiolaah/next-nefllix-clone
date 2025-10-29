/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/favourites";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

jest.mock("@/lib/serverAuth");
jest.mock("@/lib/prismadb", () => ({
  profile: { findFirst: jest.fn() },
  favourite: { findMany: jest.fn() },
  movie: { findUnique: jest.fn() },
  tvShow: { findUnique: jest.fn() },
}));

const mockServerAuth = serverAuth as jest.MockedFunction<typeof serverAuth>;
const mockProfileFindFirst = prismadb.profile.findFirst as any;
const mockFavouriteFindMany = prismadb.favourite.findMany as any;
const mockMovieFindUnique = prismadb.movie.findUnique as any;
const mockTvFindUnique = prismadb.tvShow.findUnique as any;

describe("/api/favourites", () => {
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

  it("returns 404 when profile invalid", async () => {
    mockProfileFindFirst.mockResolvedValue(null);
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(404);
  });

  it("returns combined favourites from local sources", async () => {
    mockProfileFindFirst.mockResolvedValue({ id: "p1", userId: "u1" });
    mockFavouriteFindMany.mockResolvedValue([
      { contentId: "m1", contentType: "movie", source: "local" },
      { contentId: "t1", contentType: "tv", source: "local" },
    ]);
    mockMovieFindUnique.mockResolvedValue({ id: "m1", title: "Local Movie" });
    mockTvFindUnique.mockResolvedValue({
      id: "t1",
      title: "Local TV",
      numberOfSeasons: 3,
    });

    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "m1", source: "local" }),
        expect.objectContaining({ id: "t1", source: "local" }),
      ])
    );
  });
});
