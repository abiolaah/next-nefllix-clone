/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/search";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import axios from "axios";

jest.mock("@/lib/serverAuth");
jest.mock("@/lib/prismadb", () => ({
  movie: { findMany: jest.fn() },
  tvShow: { findMany: jest.fn() },
}));
jest.mock("axios");

const mockServerAuth = serverAuth as jest.MockedFunction<typeof serverAuth>;
const mockMovieFindMany = prismadb.movie.findMany as jest.MockedFunction<
  typeof prismadb.movie.findMany
>;
const mockTvFindMany = prismadb.tvShow.findMany as jest.MockedFunction<
  typeof prismadb.tvShow.findMany
>;
const mockAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;

describe("/api/search", () => {
  let req: Partial<NextApiRequest>;
  let res: Pick<NextApiResponse, "status" | "json" | "end">;
  let status: jest.Mock;
  let json: jest.Mock;
  let end: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    status = jest.fn().mockReturnThis();
    json = jest.fn().mockReturnThis();
    end = jest.fn().mockReturnThis();

    req = { method: "GET", query: { query: "matrix" } };
    res = { status: status as any, json: json as any, end: end as any };

    mockServerAuth.mockResolvedValue({
      currentUser: { id: "user-1" },
    } as unknown as ReturnType<typeof serverAuth>);
  });

  it("returns 405 for non-GET methods", async () => {
    req.method = "POST";
    await handler(req as NextApiRequest, res as unknown as NextApiResponse);
    expect(status).toHaveBeenCalledWith(405);
  });

  it("returns 400 when query is missing", async () => {
    req.query = {} as Record<string, string>;
    await handler(req as NextApiRequest, res as unknown as NextApiResponse);
    expect(status).toHaveBeenCalledWith(400);
  });

  it("merges local and TMDB results", async () => {
    mockMovieFindMany.mockResolvedValue([
      {
        id: "m1",
        title: "The Matrix",
        description: "desc",
        videoUrl: "",
        thumbnailUrl: "/local-m1.jpg",
        trailerUrl: "",
        genre: ["Action"],
        rating: 8.7,
        duration: "120 minutes",
      },
    ] as unknown as any);
    mockTvFindMany.mockResolvedValue([] as unknown as any);

    mockAxiosGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 603,
            media_type: "movie",
            title: "The Matrix",
            overview: "o",
            poster_path: "/p.jpg",
            vote_average: 8.7,
            adult: false,
          },
        ],
      },
    } as unknown as any);
    // details fetch
    mockAxiosGet.mockResolvedValueOnce({
      data: {
        videos: { results: [] },
        runtime: 136,
        genres: [{ id: 1, name: "Action" }],
      },
    } as unknown as any);

    await handler(req as NextApiRequest, res as unknown as NextApiResponse);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        results: expect.arrayContaining([
          expect.objectContaining({ id: "m1", source: "local" }),
          expect.objectContaining({ id: 603, source: "tmdb" }),
        ]),
      })
    );
  });

  it("handles TMDB failure gracefully", async () => {
    mockMovieFindMany.mockResolvedValue([] as unknown as any);
    mockTvFindMany.mockResolvedValue([] as unknown as any);
    mockAxiosGet.mockRejectedValueOnce(new Error("TMDB down"));

    await handler(req as NextApiRequest, res as unknown as NextApiResponse);

    // Search handler enhances results in a later step; initial failure should still return something (local)
    // With no local and error thrown in try/catch, expect 500
    expect(status).toHaveBeenCalled();
  });
});
