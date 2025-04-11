import { Router } from "express";
import { registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    resendEmailVerification,
    forgotPasswordRequest,
    resetForgottenPassword,
    changeCurrentPassword,
    refreshAccessToken,
    getCurrentUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { 
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator, } from "../validators/index.js";
import {auth} from "../middlewares/jwt.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").get(auth, logoutUser);
router.route("/verify/:token").get(verifyEmail);
router.route("resendEmailVerification").get(resendEmailVerification);
router.route("/forgotpassword").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/forgotpassword/:token").post(userResetForgottenPasswordValidator(),validate,resetForgottenPassword);
router.route("/changecurrentpassword").post(userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/refreshaccesstoken").get(auth, refreshAccessToken);
router.route("/profile").get(auth, getCurrentUser);

export default router;
