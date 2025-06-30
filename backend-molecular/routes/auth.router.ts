import { Router } from "express";
import passport from "../auth/passport";
import { loginController } from "../controllers/auth/login-controller";
import { callbackController } from "../controllers/auth/callback-controller";
import { profileController } from "../controllers/auth/profile-controller";
import { logOutController } from "../controllers/auth/logout-controller";

const router = Router();

router.get("/login", loginController);
router.get("/callback/zitadel", callbackController);
router.get("/profile", passport.authenticate("jwt", { session: false }), profileController);
router.get("/logout", logOutController);

export default router;
