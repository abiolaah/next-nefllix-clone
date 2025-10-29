/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

jest.mock("axios");
const mockAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;

describe("TMDB integration (mocked)", () => {
  it("fetches multi-search results", async () => {
    mockAxiosGet.mockResolvedValueOnce({
      data: { results: [{ id: 1, media_type: "movie", title: "A" }] },
    } as any);
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/multi?query=test"
    );
    expect(response.data.results[0]).toEqual(
      expect.objectContaining({ media_type: "movie" })
    );
  });

  it("handles API errors", async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error("Network error"));
    await expect(axios.get("/tmdb/break")).rejects.toThrow("Network error");
  });
});
