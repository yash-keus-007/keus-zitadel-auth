import { users } from "../../db/users";
import { getRoutePermissions } from "../../utils/helpers"


export const profileController = async (req:any, res:any) => {
    try {
      const currentUser = req.user as any;
      if (!(currentUser?.id && users.has(currentUser.id))) {
        const profile = {
          ...currentUser,
          routePermissions: getRoutePermissions(currentUser?.roles || []),
        };
        users.set(currentUser.id, profile);
      }
      res.json({ profile: users.get(currentUser.id) });

    } catch (error: any) {
      console.error("Error fetching profile:", error);

      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'Invalid or expired access token' });
      }

      res.status(500).json({
        error: 'Error fetching profile',
        message: error.message,
      });
    }
  }