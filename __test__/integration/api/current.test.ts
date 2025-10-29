import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/current";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { User, Profile } from "@/generated/prisma";

// Create proper types for our mocks
type ServerAuthResult = {
  currentUser: User;
};

type UserWithProfiles = User & {
  profiles: Profile[];
};

jest.mock("@/lib/serverAuth");
jest.mock("@/lib/prismadb", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

// Type the mock for typescript
const mockServerAuth = serverAuth as jest.MockedFunction<typeof serverAuth>;
const mockPrismaFindUnique = prismadb.user.findUnique as jest.MockedFunction<
  typeof prismadb.user.findUnique
>;

describe("/api/current", () => {
  // Mock request and response objects
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    // Reset all mocks befoe each test
    jest.clearAllMocks();

    // Set up the mock response object
    mockJson = jest.fn().mockReturnThis();
    mockEnd = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, end: mockEnd });

    mockRes = {
      status: mockStatus,
    };

    // Set up the mock request object
    mockReq = {
      method: "GET",
    };

    // Setup the serverAuth mock with default successful response
    const mockUser: User = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      emailVerified: null,
      image: "",
      hashedPassword: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockServerAuth.mockResolvedValue({
      currentUser: mockUser,
    } as ServerAuthResult);

    // Setup the Prisma mock with default successful response
    const mockProfiles: Profile[] = [
      {
        id: "profile1",
        name: "Profile 1",
        avatar: "https://example.com/avatar1.jpg",
        userId: "user123",
        hasPin: false,
        pin: "",
      },
      {
        id: "profile2",
        name: "Profile 2",
        avatar: "https://example.com/avatar2.jpg",
        userId: "user123",
        hasPin: false,
        pin: "",
      },
    ];

    const mockUserWithProfiles: UserWithProfiles = {
      ...mockUser,
      profiles: mockProfiles,
    };

    mockPrismaFindUnique.mockResolvedValue(mockUserWithProfiles);
  });

  //   Test 1
  it("returns 405 for non-Get methods", async () => {
    mockReq.method = "POST";

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(405);
    expect(mockEnd).toHaveBeenCalled();
  });

  //   Test 2
  it("returns the current user with profiles when authenticated", async () => {
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Verify serverAuth was called
    expect(mockServerAuth).toHaveBeenCalledWith(mockReq, mockRes);

    // Verify Prisma findUnique was called with correct parameters
    expect(mockPrismaFindUnique).toHaveBeenCalledWith({
      where: {
        email: "test@example.com",
      },
      include: {
        profiles: true,
      },
    });

    // Verify response status and body
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user123",
        email: "test@example.com",
        profiles: expect.arrayContaining([
          expect.objectContaining({
            id: "profile1",
            name: "Profile 1",
          }),
          expect.objectContaining({
            id: "profile2",
            name: "Profile 2",
          }),
        ]),
      })
    );
  });

  // Test 3
  it("returns 400 when serverAuth throws on error", async () => {
    // Mock serverAuth to throw an error
    mockServerAuth.mockRejectedValue(new Error("Authentication failed"));

    // Spy on console.log to prevent error from showing in test output
    jest.spyOn(console, "log").mockImplementation(() => {});

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockEnd).toHaveBeenCalled();
  });

  // Test 4
  it("returns 400 when prisma query fails", async () => {
    // Mock prismaFindUnique to throw an error
    mockPrismaFindUnique.mockRejectedValue(new Error("Database error"));

    // Spy on console.log to prevent error from showing in test output
    jest.spyOn(console, "log").mockImplementation(() => {});

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockEnd).toHaveBeenCalled();
  });
});
