import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method === "POST") {
      const { name, avatar } = req.body;

      // Check if user already has max profiles
      const userProfiles = await prismadb.profile.count({
        where: {
          userId: currentUser.id,
        },
      });

      if (userProfiles >= 4) {
        return res.status(400).json({ error: "Maximum profiles reached" });
      }

      const profile = await prismadb.profile.create({
        data: {
          userId: currentUser.id,
          name,
          avatar,
          hasPin: false,
        },
      });

      return res.status(200).json(profile);
    }

    if (req.method === "GET") {
      const profiles = await prismadb.profile.findMany({
        where: {
          userId: currentUser.id,
        },
      });

      return res.status(200).json(profiles);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
