import axios from "axios";
import fetcher from "@/lib/fetcher";

// Mock axios with proper typing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface TestData {
  id: number;
  name: string;
}

describe("fetcher with TypeScript", () => {
  const mockUrl = "https://api.example.com/data";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return typed data when successful", async () => {
    // Arrange
    const mockData: TestData = { id: 1, name: "Test" };
    const mockResponse = { data: mockData };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await fetcher(mockUrl);

    // Assert
    expect(result).toEqual(mockData);
    // Type assertion for TypeScript
    expect((result as TestData).id).toBe(1);
    expect((result as TestData).name).toBe("Test");
  });
});
