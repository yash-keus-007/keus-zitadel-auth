import { zitaDelConfig } from "../../config/authConfig";


export const logOutController = async (req:any, res:any) => {
    try {
      const logoutUrl = `${zitaDelConfig.issuer}/   `;
      res.clearCookie("profile");
      res.redirect(logoutUrl);

    } catch (error: any) {
        res.status(500).json({
            error: 'Logout failed',
            message: error.message || 'An error occurred during logout'
            });
        
        console.error(error);
    }
  }