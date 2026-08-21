import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { OAuthUser } from "@shared/oauth";

/* =========================================================
   ENVIRONMENT CONFIGURATION
========================================================= */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;

const JWT_SECRET =
  process.env.JWT_SECRET || "your-jwt-secret-key";

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:8080";

/* =========================================================
   GOOGLE OAUTH CONFIGURATION
========================================================= */

const GOOGLE_CALLBACK_URL =
  `${CLIENT_URL}/api/auth/google/callback`;

const googleOAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

/* =========================================================
   TYPES
========================================================= */

interface GoogleUserInfo {
  id?: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

/* =========================================================
   GOOGLE OAUTH INITIATION
========================================================= */

export const initiateGoogleAuth: RequestHandler = (
  req,
  res,
) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error(
        "GOOGLE_CLIENT_ID is missing from environment variables",
      );

      return res.status(500).json({
        success: false,
        error: "Google OAuth client ID is not configured",
      });
    }

    if (!GOOGLE_CLIENT_SECRET) {
      console.error(
        "GOOGLE_CLIENT_SECRET is missing from environment variables",
      );

      return res.status(500).json({
        success: false,
        error: "Google OAuth client secret is not configured",
      });
    }

    const authUrl =
      googleOAuth2Client.generateAuthUrl({
        access_type: "offline",

        /*
         * OpenID + profile + email gives us:
         *
         * id
         * email
         * name
         * given_name
         * family_name
         * picture
         */
        scope: [
          "openid",
          "email",
          "profile",
        ],

        prompt: "consent",
      });

    console.log(
      "Redirecting user to Google OAuth...",
    );

    res.redirect(authUrl);
  } catch (error) {
    console.error(
      "Google OAuth initiation error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: "OAuth initiation failed",
    });
  }
};

/* =========================================================
   GOOGLE OAUTH CALLBACK
========================================================= */

export const handleGoogleCallback: RequestHandler =
  async (req, res) => {
    try {
      const { code } = req.query;

      if (
        !code ||
        typeof code !== "string"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "No authorization code received",
        });
      }

      /* ===============================================
         1. Exchange authorization code for Google tokens
      =============================================== */

      const { tokens } =
        await googleOAuth2Client.getToken(
          code,
        );

      googleOAuth2Client.setCredentials(
        tokens,
      );

      if (!tokens.access_token) {
        console.error(
          "Google did not return an access token",
        );

        throw new Error(
          "Google access token missing",
        );
      }

      /* ===============================================
         2. Retrieve Google user information
      =============================================== */

      const userInfoResponse =
        await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization:
                `Bearer ${tokens.access_token}`,
            },
          },
        );

      if (!userInfoResponse.ok) {
        const responseText =
          await userInfoResponse.text();

        console.error(
          "Google user-info request failed:",
          userInfoResponse.status,
          responseText,
        );

        throw new Error(
          `Google user-info request failed: ${userInfoResponse.status}`,
        );
      }

      const userInfo =
        (await userInfoResponse.json()) as GoogleUserInfo;

      /*
       * Useful while testing.
       *
       * This does NOT log OAuth secrets.
       */
      console.log(
        "Google user info:",
        userInfo,
      );

      console.log(
        "Google UserInfo picture:",
        userInfo.picture ||
          "No picture returned from UserInfo endpoint",
      );

      /* ===============================================
         3. Picture fallback using Google ID token
      =============================================== */

      let googleProfilePicture =
        userInfo.picture || "";

      /*
       * Normally the UserInfo endpoint returns picture.
       *
       * If it doesn't, try reading the picture claim
       * from Google's ID token.
       */
      if (
        !googleProfilePicture &&
        tokens.id_token &&
        GOOGLE_CLIENT_ID
      ) {
        try {
          const ticket =
            await googleOAuth2Client.verifyIdToken(
              {
                idToken:
                  tokens.id_token,
                audience:
                  GOOGLE_CLIENT_ID,
              },
            );

          const payload =
            ticket.getPayload();

          if (payload?.picture) {
            googleProfilePicture =
              payload.picture;

            console.log(
              "Google picture recovered from ID token:",
              googleProfilePicture,
            );
          }
        } catch (
          idTokenError
        ) {
          console.error(
            "Unable to read Google profile picture from ID token:",
            idTokenError,
          );
        }
      }

      /* ===============================================
         4. Validate required user information
      =============================================== */

      if (!userInfo.email) {
        throw new Error(
          "Google did not return an email address",
        );
      }

      /*
       * Use Google ID if available.
       * Email is used only as fallback.
       */
      const googleUserId =
        userInfo.id ||
        userInfo.email;

      const googleName =
        userInfo.name ||
        userInfo.email.split("@")[0];

      /* ===============================================
         5. Create application OAuth user
      =============================================== */

      const user: OAuthUser = {
        id: googleUserId,
        email: userInfo.email,
        name: googleName,

        /*
         * This is what Login.tsx receives
         * and saves as userProfileImage.
         */
        picture:
          googleProfilePicture ||
          undefined,

        provider: "google",
      };

      console.log(
        "OAuth user being returned to frontend:",
        {
          id: user.id,
          email: user.email,
          name: user.name,
          picture:
            user.picture ||
            "No profile picture",
          provider: user.provider,
        },
      );

      /* ===============================================
         6. Generate application JWT
      =============================================== */

      const accessToken =
        jwt.sign(
          {
            userId: user.id,
            email: user.email,
            provider:
              user.provider,
          },
          JWT_SECRET,
          {
            expiresIn: "24h",
          },
        );

      /* ===============================================
         7. Redirect back to React application
      =============================================== */

      const redirectUrl =
        `${CLIENT_URL}/` +
        `?auth=success` +
        `&token=${encodeURIComponent(
          accessToken,
        )}` +
        `&user=${encodeURIComponent(
          JSON.stringify(user),
        )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error(
        "Google OAuth callback error:",
        error,
      );

      const redirectUrl =
        `${CLIENT_URL}/` +
        `?auth=error` +
        `&message=${encodeURIComponent(
          "Google authentication failed",
        )}`;

      res.redirect(redirectUrl);
    }
  };

/* =========================================================
   APPLE OAUTH INITIATION
========================================================= */

export const initiateAppleAuth: RequestHandler =
  (req, res) => {
    try {
      if (!APPLE_CLIENT_ID) {
        return res.status(500).json({
          success: false,
          error:
            "Apple OAuth not configured",
        });
      }

      const params =
        new URLSearchParams({
          response_type: "code",
          response_mode:
            "form_post",
          client_id:
            APPLE_CLIENT_ID,

          redirect_uri:
            `${CLIENT_URL}/api/auth/apple/callback`,

          scope: "name email",
        });

      const authUrl =
        `https://appleid.apple.com/auth/authorize?${params.toString()}`;

      res.redirect(authUrl);
    } catch (error) {
      console.error(
        "Apple OAuth initiation error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Apple OAuth initiation failed",
      });
    }
  };

/* =========================================================
   APPLE OAUTH CALLBACK
========================================================= */

export const handleAppleCallback: RequestHandler =
  async (req, res) => {
    try {
      const {
        code,
        user,
      } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          error:
            "No authorization code received",
        });
      }

      /*
       * Apple only sends the `user`
       * object the first time the user
       * authorises the application.
       */
      let userData: {
        firstName: string;
        lastName: string;
        email: string;
      } | null = null;

      if (user) {
        const parsedUser =
          typeof user === "string"
            ? JSON.parse(user)
            : user;

        userData = {
          firstName:
            parsedUser.name
              ?.firstName || "",

          lastName:
            parsedUser.name
              ?.lastName || "",

          email:
            parsedUser.email || "",
        };
      }

      /*
       * NOTE:
       *
       * This remains a temporary/demo
       * Apple implementation.
       *
       * A production implementation should
       * exchange Apple's authorization code
       * and validate Apple's ID token.
       */
      const oauthUser: OAuthUser =
        {
          id:
            `apple_${Date.now()}`,

          email:
            userData?.email ||
            "apple.user@example.com",

          name: userData
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : "Apple User",

          provider: "apple",
        };

      /* ===============================================
         Generate application JWT
      =============================================== */

      const accessToken =
        jwt.sign(
          {
            userId:
              oauthUser.id,

            email:
              oauthUser.email,

            provider:
              oauthUser.provider,
          },
          JWT_SECRET,
          {
            expiresIn:
              "24h",
          },
        );

      /* ===============================================
         Redirect to frontend
      =============================================== */

      const redirectUrl =
        `${CLIENT_URL}/` +
        `?auth=success` +
        `&token=${encodeURIComponent(
          accessToken,
        )}` +
        `&user=${encodeURIComponent(
          JSON.stringify(
            oauthUser,
          ),
        )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error(
        "Apple OAuth callback error:",
        error,
      );

      const redirectUrl =
        `${CLIENT_URL}/` +
        `?auth=error` +
        `&message=${encodeURIComponent(
          "Apple authentication failed",
        )}`;

      res.redirect(redirectUrl);
    }
  };

/* =========================================================
   VERIFY APPLICATION JWT
========================================================= */

export const verifyToken: RequestHandler =
  (req, res) => {
    try {
      const { token } =
        req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error:
            "No token provided",
        });
      }

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET,
        );

      res.json({
        success: true,
        user: decoded,
      });
    } catch (error) {
      console.error(
        "Token verification error:",
        error,
      );

      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
  };