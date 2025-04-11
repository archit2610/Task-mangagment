import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {emailVerificationMailgenContent,sendEmail,forgotPasswordMailgenContent} from "../utils/mail.js";
import  crypto  from "crypto";
import {options} from "../utils/constants.js"

const registerUser = asyncHandler(async (req, res) => {

  const { email, username, password, role } = req.body;

  if (!email || !username || !password){
    throw new ApiError (400,"All fiels are required")
  };

  const exsistinguser = await User.findOne({email});

  if (exsistinguser) {
  throw new ApiError (400,"User with same email already exsists");
  }

  const user = await User.create({
    email,
    username,
    password,
  });
  console.log(user);

  const token = user.generateTemporaryToken();
  user.emailVerificationToken = token.hashedToken;
  user.emailVerificationExpiry = token.tokenExpiry;
  await user.save();
  
  await sendEmail ({
    email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      username,
      `/api/v1/healthcheck/verify/${token.unHashedToken}`
    ),
});

console.log(`/api/v1/healthcheck/verify/${token.unHashedToken}`);

const newuser =  await User.findById(user._id);

if (!newuser){
  throw new ApiError (400,'Error while registering new user')
}

res.status(200).json(new ApiResponse(200,newuser,"User registered successfully"));

});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!email || !username || !password){
    throw new ApiError (400,"All fiels are required")
  };

  const user = await User.findOne({email});

  if (!user) {
  throw new ApiError (400,"User with email does not exsists");
}

  if (!user.isPasswordCorrect(password)){
  throw new ApiError (400,"Incorrect password");
  }
  
  if (!user.isEmailVerified){
  throw new ApiError (400,"please verify user first");
  }
  
  const accesstoken =  await user.generateAccessToken();
  const refreshtoken = await user.generateRefreshToken();

  user.refreshToken = refreshtoken;
  await user.save()

  res.status(400)
  .cookie("accessToken",accesstoken,options)
  .cookie("refreshToken",refreshtoken,options)
  .json(new ApiResponse(200,{
    accesstoken,
    refreshtoken
  },
  'User logged in succesfully'
));

});

const logoutUser = asyncHandler(async (req, res) => {
  
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );
  
  res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},'User logged out succesfully'))
  //validation
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    throw new ApiError (400,'Invalid or Expiry token')
  }
  
  const hashedtoken = crypto.createHash("sha256").update(token).digest("hex");
  
  const user = await User.findOne({
    emailVerificationToken: hashedtoken,
    emailVerificationExpiry: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new ApiError (400,'Invalid or Expiry token')
  }
  
  user.isEmailVerified = true;
  user.emailVerificationExpiry =  undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse,{},'user verified  successfully')
  console.log(user.isEmailVerified);
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const user = User.findOne(email);
  const token = user.generateTemporaryToken();
  user.emailVerificationToken = token.hashedToken;
  user.emailVerificationExpiry = token.tokenExpiry;
  await user.save();
  
  await sendEmail ({
    email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      username,
      `/api/v1/healthcheck/verify/${token.unHashedToken}`
    ),
});

console.log(`/api/v1/healthcheck/verify/${token.unHashedToken}`);
  //validation
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  if (!token) {
    throw new ApiError (200,'Invalid or Expired Token')
  }
  if (!newPassword) {
    throw new ApiError (200,'Enter new password')
  }

  const hashedtoken = crypto.createHash("sha256").update(token).digest("hex");
  
  const user = await User.findOne({
    forgotPasswordToken: hashedtoken,
    forgotPasswordExpiry: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new ApiError (400,'Invalid or Expiry token')
  }
  
  user.password = newPassword;
  user.forgotPasswordToken =  undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse,{},'password changed successfully')
  console.log(user.password);
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshtoken = req.cookies?.refreshToken;
  
  if(!incomingrefreshtoken) {
    throw new ApiError(401,'Please login first')
  }

  try {
    const decodedToken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET,);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingrefreshtoken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const accessToken =  await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save()

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshoken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshtoken: refreshToken },
          "Access token refreshed",
        ),
      );
} catch (error) {
  throw new ApiError (400,'Invalid refresh token')
}
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username} = req.body;

  const user =  await User.findOne({email});
  
  if (!user) {
    throw new ApiError(400,'User not regisetered')
  }

  const token = user.generateTemporaryToken();
  user.forgotPasswordToken = token.hashedToken;
  user.forgotPasswordExpiry = token.tokenExpiry;
  await user.save();
  
  await sendEmail ({
    email,
    subject: "Verify your email",
    mailgenContent: forgotPasswordMailgenContent(
      username,
      `/api/v1/healthcheck/forgotpassword/${token.unHashedToken}`
    ),
});

console.log(`/api/v1/healthcheck/forgotpassword/${token.unHashedToken}`);
  
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const user =  await User.findOne({email});

  if (!user) {
    throw new ApiError (400,'Invalid email')
  }
  if (!user.isPasswordCorrect(oldPassword)){
    throw new ApiError (400,'Please enter current password')
  }

  user.password = newPassword;
  await user.save()

  console.log('New password: ',user.password)
  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user =  await User.findById(req.user._id);
  res.status(200).json(200,{user},'User fetched succesfully')
  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
