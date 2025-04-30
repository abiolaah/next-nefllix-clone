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

    if (req.method === "DELETE") {
      const { profileId } = req.query;

      // Ensure profileId provided is valid
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ error: "Invalid profile ID" });
      }

      // For all methods, verify the profile belongs to the current user
      const profile = await prismadb.profile.findUnique({
        where: {
          id: profileId,
        },
      });

      if (!profile || profile.userId !== currentUser.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Delete the profile
      await prismadb.profile.delete({
        where: {
          id: profileId,
        },
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === "PUT") {
      const { profileId } = req.query;
      const { name, pin } = req.body;

      // Ensure profileId provided is valid
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ error: "Invalid profile ID" });
      }

      // For all methods, verify the profile belongs to the current user
      const profile = await prismadb.profile.findUnique({
        where: {
          id: profileId,
        },
      });

      if (!profile || profile.userId !== currentUser.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Delete the profile
      const updatedProfile = await prismadb.profile.update({
        where: {
          id: profileId,
        },
        data: {
          name,
          pin,
          hasPin: pin ? true : false,
        },
      });

      return res.status(200).json(updatedProfile);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
