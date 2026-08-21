import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Activity,
  Users,
  BarChart3,
  Video,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  User,
  Mail,
  Lock,
  Building,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   AUTH HEADERS
========================================================= */

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/* =========================================================
   LOGIN COMPONENT
========================================================= */

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    role: "",
    agreeTerms: false,
  });

  const [resetForm, setResetForm] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [
    isResetModalOpen,
    setIsResetModalOpen,
  ] = useState(false);

  const [resetStep, setResetStep] =
    useState(1);

  const [resetMessage, setResetMessage] =
    useState("");

  /* =========================================================
     DEMO CREDENTIALS
  ========================================================= */

  const validCredentials = [
    {
      email: "demo@aflanalytics.com",
      password: "demo123",
    },
    {
      email: "admin@aflanalytics.com",
      password: "admin123",
    },
    {
      email: "coach@aflanalytics.com",
      password: "coach123",
    },
    {
      email: "analyst@aflanalytics.com",
      password: "analyst123",
    },
  ];

  /* =========================================================
     NORMAL EMAIL LOGIN
  ========================================================= */

  const handleLogin = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    await new Promise((resolve) =>
      setTimeout(resolve, 1500),
    );

    if (
      !loginForm.email ||
      !loginForm.password
    ) {
      setError(
        "Please enter both email and password",
      );

      setIsLoading(false);
      return;
    }

    const storedUsers = JSON.parse(
      localStorage.getItem(
        "registeredUsers",
      ) || "[]",
    );

    const allValidCredentials = [
      ...validCredentials,
      ...storedUsers,
    ];

    const matchedCredential =
      allValidCredentials.find(
        (cred: any) =>
          cred.email.toLowerCase() ===
            loginForm.email.toLowerCase() &&
          cred.password ===
            loginForm.password,
      );

    if (matchedCredential) {
      /*
       * Clear any previous OAuth profile
       * information before starting a normal
       * email-based login.
       */
      localStorage.removeItem(
        "userProfileImage",
      );

      localStorage.removeItem(
        "oauthUser",
      );

      localStorage.removeItem(
        "authProvider",
      );

      localStorage.setItem(
        "isAuthenticated",
        "true",
      );

      localStorage.setItem(
        "userEmail",
        loginForm.email,
      );

      localStorage.setItem(
        "access_token",
        "mock_access_token",
      );

      localStorage.setItem(
        "refresh_token",
        "mock_refresh_token",
      );

      /*
       * If this is a user created through
       * the signup form, save their profile
       * information as well.
       */
      if (
        matchedCredential.firstName ||
        matchedCredential.lastName
      ) {
        const fullName = [
          matchedCredential.firstName,
          matchedCredential.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        localStorage.setItem(
          "userName",
          fullName,
        );
      } else {
        /*
         * Give demo accounts readable names.
         */
        const email =
          loginForm.email.toLowerCase();

        if (
          email ===
          "demo@aflanalytics.com"
        ) {
          localStorage.setItem(
            "userName",
            "Demo User",
          );
        } else if (
          email ===
          "admin@aflanalytics.com"
        ) {
          localStorage.setItem(
            "userName",
            "AFL Administrator",
          );
        } else if (
          email ===
          "coach@aflanalytics.com"
        ) {
          localStorage.setItem(
            "userName",
            "AFL Coach",
          );
        } else if (
          email ===
          "analyst@aflanalytics.com"
        ) {
          localStorage.setItem(
            "userName",
            "AFL Analyst",
          );
        }
      }

      if (matchedCredential.role) {
        localStorage.setItem(
          "userRole",
          matchedCredential.role,
        );
      }

      navigate(
        "/afl-dashboard",
        {
          replace: true,
        },
      );
    } else {
      setError(
        "Invalid email or password. Try demo@aflanalytics.com / demo123 or use your signup credentials",
      );
    }

    setIsLoading(false);
  };

  /* =========================================================
     SIGN UP
  ========================================================= */

  const handleSignup = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    if (
      !signupForm.firstName ||
      !signupForm.lastName ||
      !signupForm.email ||
      !signupForm.password ||
      !signupForm.organization
    ) {
      setError(
        "Please fill all required fields",
      );

      setIsLoading(false);
      return;
    }

    if (
      signupForm.password !==
      signupForm.confirmPassword
    ) {
      setError(
        "Passwords do not match",
      );

      setIsLoading(false);
      return;
    }

    if (!signupForm.agreeTerms) {
      setError(
        "Please agree to the terms of service",
      );

      setIsLoading(false);
      return;
    }

    const existingUsers = JSON.parse(
      localStorage.getItem(
        "registeredUsers",
      ) || "[]",
    );

    const userExists =
      existingUsers.some(
        (user: any) =>
          user.email.toLowerCase() ===
          signupForm.email.toLowerCase(),
      );

    if (userExists) {
      setError(
        "An account with this email already exists. Please login instead.",
      );

      setIsLoading(false);
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 2000),
    );

    const newUser = {
      email: signupForm.email,
      password: signupForm.password,
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      organization:
        signupForm.organization,
      role: signupForm.role,
    };

    const updatedUsers = [
      ...existingUsers,
      newUser,
    ];

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedUsers),
    );

    /* Authentication */

    localStorage.setItem(
      "isAuthenticated",
      "true",
    );

    localStorage.setItem(
      "userEmail",
      signupForm.email,
    );

    localStorage.setItem(
      "userName",
      `${signupForm.firstName} ${signupForm.lastName}`,
    );

    if (signupForm.role) {
      localStorage.setItem(
        "userRole",
        signupForm.role,
      );
    }

    localStorage.setItem(
      "access_token",
      "mock_access_token",
    );

    localStorage.setItem(
      "refresh_token",
      "mock_refresh_token",
    );

    /* Clear previous OAuth information */

    localStorage.removeItem(
      "userProfileImage",
    );

    localStorage.removeItem(
      "oauthUser",
    );

    localStorage.removeItem(
      "authProvider",
    );

    setSignupForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
      role: "",
      agreeTerms: false,
    });

    navigate(
      "/afl-dashboard",
      {
        replace: true,
      },
    );

    setIsLoading(false);
  };

  /* =========================================================
     DEMO LOGIN
  ========================================================= */

  const demoLogin = () => {
    setLoginForm({
      email:
        "demo@aflanalytics.com",
      password: "demo123",
      rememberMe: true,
    });
  };

  /* =========================================================
     GOOGLE / APPLE OAUTH
  ========================================================= */

  const handleGoogleAuth = () => {
    window.location.href =
      "/api/auth/google";
  };

  const handleAppleAuth = () => {
    window.location.href =
      "/api/auth/apple";
  };

  /* =========================================================
     OAUTH CALLBACK

     oauth.ts redirects back with:

     ?auth=success
     &token=...
     &user={...}
  ========================================================= */

  useEffect(() => {
    const urlParams =
      new URLSearchParams(
        window.location.search,
      );

    const authStatus =
      urlParams.get("auth");

    const token =
      urlParams.get("token");

    const userParam =
      urlParams.get("user");

    const errorMessage =
      urlParams.get("message");

    if (
      authStatus === "success" &&
      token &&
      userParam
    ) {
      try {
        const user = JSON.parse(
          decodeURIComponent(userParam),
        );

        console.log(
          "OAuth user received:",
          user,
        );

        /*
         * Authentication information
         */
        localStorage.setItem(
          "isAuthenticated",
          "true",
        );

        localStorage.setItem(
          "authToken",
          token,
        );

        /*
         * Other parts of the application
         * use access_token, so save the
         * OAuth token under this key too.
         */
        localStorage.setItem(
          "access_token",
          token,
        );

        /*
         * User information for Profile.tsx
         */
        localStorage.setItem(
          "userEmail",
          user.email || "",
        );

        localStorage.setItem(
          "userName",
          user.name || "",
        );

        localStorage.setItem(
          "authProvider",
          user.provider ||
            "google",
        );

        /*
         * Google OAuth normally returns
         * user.picture.
         *
         * Profile.tsx reads:
         *
         * userProfileImage
         */
        if (user.picture) {
          localStorage.setItem(
            "userProfileImage",
            user.picture,
          );
        } else {
          localStorage.removeItem(
            "userProfileImage",
          );
        }

        /*
         * Save complete OAuth user object.
         * Useful later for profile/RBAC.
         */
        localStorage.setItem(
          "oauthUser",
          JSON.stringify(user),
        );

        /*
         * Remove previous locally stored
         * role only when appropriate.
         *
         * Google users can choose their
         * Player/Coach/Analyst role later
         * from the Profile page.
         */

        /*
         * Remove OAuth query parameters
         * from the address bar.
         */
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        /*
         * Redirect after successful login.
         */
        navigate(
          "/afl-dashboard",
          {
            replace: true,
          },
        );
      } catch (oauthError) {
        console.error(
          "Error parsing OAuth user data:",
          oauthError,
        );

        setError(
          "Authentication failed. Please try again.",
        );
      }
    } else if (
      authStatus === "error"
    ) {
      setError(
        errorMessage
          ? decodeURIComponent(
              errorMessage,
            )
          : "OAuth authentication failed. Please try again.",
      );

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );
    }
  }, [navigate]);

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword =
    async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      setIsLoading(true);
      setError("");

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1500),
      );

      if (resetForm.email) {
        setResetMessage(
          `Reset link sent to ${resetForm.email}`,
        );

        setResetStep(2);
      } else {
        setError(
          "Please enter a valid email address",
        );
      }

      setIsLoading(false);
    };

  /* =========================================================
     VERIFY RESET CODE
  ========================================================= */

  const handleVerifyResetCode =
    async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      setIsLoading(true);
      setError("");

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000),
      );

      if (
        resetForm.resetCode ===
        "123456"
      ) {
        setResetStep(3);
      } else {
        setError(
          "Invalid verification code. Try '123456' for demo.",
        );
      }

      setIsLoading(false);
    };

  /* =========================================================
     RESET PASSWORD
  ========================================================= */

  const handleResetPassword =
    async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      setIsLoading(true);
      setError("");

      if (
        resetForm.newPassword !==
        resetForm.confirmNewPassword
      ) {
        setError(
          "Passwords do not match",
        );

        setIsLoading(false);
        return;
      }

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1500),
      );

      setResetStep(4);

      setIsLoading(false);
    };

  /* =========================================================
     CLOSE RESET MODAL
  ========================================================= */

  const closeResetModal = () => {
    setIsResetModalOpen(false);

    setResetStep(1);

    setResetForm({
      email: "",
      resetCode: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setError("");
    setResetMessage("");
  };

  /* =========================================================
     FEATURE CARDS
  ========================================================= */

  const features = [
    {
      icon: Activity,
      title:
        "Player Performance",
      description:
        "Real-time player statistics and performance metrics",
    },
    {
      icon: Users,
      title:
        "Crowd Monitoring",
      description:
        "Stadium crowd density and safety analytics",
    },
    {
      icon: BarChart3,
      title:
        "Advanced Analytics",
      description:
        "Comprehensive reporting and data insights",
    },
    {
      icon: Video,
      title:
        "Video Analysis",
      description:
        "AI-powered match video analysis and highlights",
    },
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">

      {/* ================= HEADER ================= */}

      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-3">

              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AFL Analytics
                </h1>

                <p className="text-sm text-gray-600">
                  Professional Sports Analytics Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">

              <Badge
                variant="outline"
                className="hidden sm:flex"
              >
                <Monitor className="w-3 h-3 mr-1" />
                Web App
              </Badge>

              <Badge variant="outline">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile Optimized
              </Badge>

            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <div className="container mx-auto px-4 py-8">

        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* ============== LEFT SIDE ============== */}

            <div className="space-y-6">

              <div className="space-y-4">

                <Badge
                  variant="secondary"
                  className="w-fit"
                >
                  <Shield className="w-3 h-3 mr-1" />

                  Trusted by AFL Teams
                </Badge>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">

                  Professional AFL

                  <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Analytics Platform
                  </span>

                </h2>

                <p className="text-lg text-gray-600">
                  Comprehensive player performance
                  tracking, crowd monitoring, and
                  match analytics designed specifically
                  for Australian Football League
                  professionals.
                </p>

              </div>

              {/* Feature Cards */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {features.map(
                  (feature, index) => {
                    const Icon =
                      feature.icon;

                    return (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg border shadow-sm"
                      >
                        <div className="flex items-start space-x-3">

                          <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-green-600" />
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900">
                              {feature.title}
                            </h4>

                            <p className="text-sm text-gray-600">
                              {
                                feature.description
                              }
                            </p>
                          </div>

                        </div>
                      </div>
                    );
                  },
                )}

              </div>

              {/* Demo Access */}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">

                <div className="flex items-center space-x-2 mb-2">

                  <User className="w-4 h-4 text-blue-600" />

                  <span className="font-medium text-blue-900">
                    Demo Access
                  </span>

                </div>

                <p className="text-sm text-blue-700 mb-3">
                  Try the platform with demo credentials
                  to explore all features
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={demoLogin}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Load Demo Credentials
                </Button>

              </div>
            </div>

            {/* ============== RIGHT SIDE ============== */}

            <div className="w-full max-w-md mx-auto">

              <Card className="shadow-lg">

                <CardHeader className="text-center">

                  <CardTitle className="text-2xl">
                    Welcome Back
                  </CardTitle>

                  <CardDescription>
                    Sign in to access your AFL analytics
                    dashboard
                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <Tabs
                    defaultValue="login"
                    className="w-full"
                  >

                    <TabsList className="grid w-full grid-cols-2">

                      <TabsTrigger value="login">
                        Sign In
                      </TabsTrigger>

                      <TabsTrigger value="signup">
                        Sign Up
                      </TabsTrigger>

                    </TabsList>

                    {/* ===================================
                        LOGIN TAB
                    =================================== */}

                    <TabsContent
                      value="login"
                      className="space-y-4"
                    >

                      {error && (
                        <Alert variant="destructive">

                          <AlertDescription>
                            {error}
                          </AlertDescription>

                        </Alert>
                      )}

                      {/* OAuth Buttons */}

                      <div className="space-y-3">

                        {/* Google */}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full relative"
                          onClick={
                            handleGoogleAuth
                          }
                        >

                          <svg
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 24 24"
                          >

                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />

                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />

                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />

                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />

                          </svg>

                          Continue with Google

                        </Button>

                        {/* Apple */}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full relative bg-black text-white hover:bg-gray-800"
                          onClick={
                            handleAppleAuth
                          }
                        >

                          <svg
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                          </svg>

                          Continue with Apple

                        </Button>

                        {/* Divider */}

                        <div className="relative">

                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>

                          <div className="relative flex justify-center text-xs uppercase">

                            <span className="bg-background px-2 text-muted-foreground">
                              Or continue with email
                            </span>

                          </div>
                        </div>
                      </div>

                      {/* Email Login Form */}

                      <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                      >

                        {/* Email */}

                        <div className="space-y-2">

                          <Label htmlFor="email">
                            Email Address
                          </Label>

                          <div className="relative">

                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={
                                loginForm.email
                              }
                              onChange={(e) =>
                                setLoginForm({
                                  ...loginForm,
                                  email:
                                    e.target
                                      .value,
                                })
                              }
                              className="pl-10"
                              required
                            />

                          </div>
                        </div>

                        {/* Password */}

                        <div className="space-y-2">

                          <Label htmlFor="password">
                            Password
                          </Label>

                          <div className="relative">

                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="password"
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="Enter your password"
                              value={
                                loginForm.password
                              }
                              onChange={(e) =>
                                setLoginForm({
                                  ...loginForm,
                                  password:
                                    e.target
                                      .value,
                                })
                              }
                              className="pl-10 pr-10"
                              required
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(
                                  !showPassword,
                                )
                              }
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >

                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}

                            </button>
                          </div>
                        </div>

                        {/* Remember / Forgot */}

                        <div className="flex items-center justify-between">

                          <div className="flex items-center space-x-2">

                            <Checkbox
                              id="remember"
                              checked={
                                loginForm.rememberMe
                              }
                              onCheckedChange={(
                                checked,
                              ) =>
                                setLoginForm({
                                  ...loginForm,
                                  rememberMe:
                                    checked as boolean,
                                })
                              }
                            />

                            <Label
                              htmlFor="remember"
                              className="text-sm"
                            >
                              Remember me
                            </Label>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setIsResetModalOpen(
                                true,
                              )
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </button>

                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                          disabled={
                            isLoading
                          }
                        >

                          {isLoading ? (
                            <div className="flex items-center">

                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                              Signing In...

                            </div>
                          ) : (
                            "Sign In"
                          )}

                        </Button>

                      </form>

                    </TabsContent>

                    {/* ===================================
                        SIGNUP TAB
                    =================================== */}

                    <TabsContent
                      value="signup"
                      className="space-y-4"
                    >

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* OAuth Signup Buttons */}

                      <div className="space-y-3">

                        {/* Google */}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full relative"
                          onClick={
                            handleGoogleAuth
                          }
                        >

                          <svg
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 24 24"
                          >

                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />

                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />

                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />

                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />

                          </svg>

                          Sign up with Google

                        </Button>

                        {/* Apple */}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full relative bg-black text-white hover:bg-gray-800"
                          onClick={
                            handleAppleAuth
                          }
                        >

                          <svg
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                          </svg>

                          Sign up with Apple

                        </Button>

                        {/* Divider */}

                        <div className="relative">

                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>

                          <div className="relative flex justify-center text-xs uppercase">

                            <span className="bg-background px-2 text-muted-foreground">
                              Or sign up with email
                            </span>

                          </div>
                        </div>

                      </div>

                      {/* Signup Form */}

                      <form
                        onSubmit={handleSignup}
                        className="space-y-4"
                      >

                        {/* Name */}

                        <div className="grid grid-cols-2 gap-3">

                          <div className="space-y-2">

                            <Label htmlFor="firstName">
                              First Name
                            </Label>

                            <Input
                              id="firstName"
                              placeholder="John"
                              value={
                                signupForm.firstName
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  firstName:
                                    e.target.value,
                                })
                              }
                              required
                            />

                          </div>

                          <div className="space-y-2">

                            <Label htmlFor="lastName">
                              Last Name
                            </Label>

                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={
                                signupForm.lastName
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  lastName:
                                    e.target.value,
                                })
                              }
                              required
                            />

                          </div>
                        </div>

                        {/* Email */}

                        <div className="space-y-2">

                          <Label htmlFor="signupEmail">
                            Email Address
                          </Label>

                          <div className="relative">

                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="signupEmail"
                              type="email"
                              placeholder="your@email.com"
                              value={
                                signupForm.email
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  email:
                                    e.target.value,
                                })
                              }
                              className="pl-10"
                              required
                            />

                          </div>
                        </div>

                        {/* Organization */}

                        <div className="space-y-2">

                          <Label htmlFor="organization">
                            Organization
                          </Label>

                          <div className="relative">

                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="organization"
                              placeholder="AFL Team or Organization"
                              value={
                                signupForm.organization
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  organization:
                                    e.target.value,
                                })
                              }
                              className="pl-10"
                              required
                            />

                          </div>
                        </div>

                        {/* Password */}

                        <div className="space-y-2">

                          <Label htmlFor="signupPassword">
                            Password
                          </Label>

                          <div className="relative">

                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="signupPassword"
                              type="password"
                              placeholder="Create a strong password"
                              value={
                                signupForm.password
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  password:
                                    e.target.value,
                                })
                              }
                              className="pl-10"
                              required
                            />

                          </div>
                        </div>

                        {/* Confirm Password */}

                        <div className="space-y-2">

                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>

                          <div className="relative">

                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Confirm your password"
                              value={
                                signupForm.confirmPassword
                              }
                              onChange={(e) =>
                                setSignupForm({
                                  ...signupForm,
                                  confirmPassword:
                                    e.target.value,
                                })
                              }
                              className="pl-10"
                              required
                            />

                          </div>
                        </div>

                        {/* Terms */}

                        <div className="flex items-center space-x-2">

                          <Checkbox
                            id="terms"
                            checked={
                              signupForm.agreeTerms
                            }
                            onCheckedChange={(
                              checked,
                            ) =>
                              setSignupForm({
                                ...signupForm,
                                agreeTerms:
                                  checked as boolean,
                              })
                            }
                            required
                          />

                          <Label
                            htmlFor="terms"
                            className="text-sm"
                          >

                            I agree to the{" "}

                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                            >
                              Terms of Service
                            </button>

                            {" "}and{" "}

                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                            >
                              Privacy Policy
                            </button>

                          </Label>

                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                          disabled={
                            isLoading
                          }
                        >

                          {isLoading ? (
                            <div className="flex items-center">

                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                              Creating Account...

                            </div>
                          ) : (
                            "Create Account"
                          )}

                        </Button>

                      </form>

                    </TabsContent>

                  </Tabs>

                </CardContent>

              </Card>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          FORGOT PASSWORD MODAL
      ===================================================== */}

      <Dialog
        open={isResetModalOpen}
        onOpenChange={
          setIsResetModalOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-2">

              {resetStep > 1 &&
                resetStep < 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResetStep(
                        Math.max(
                          1,
                          resetStep - 1,
                        ),
                      )
                    }
                    className="p-0 h-6 w-6"
                  >

                    <ArrowLeft className="h-4 w-4" />

                  </Button>
                )}

              {resetStep === 1 &&
                "Reset Password"}

              {resetStep === 2 &&
                "Enter Verification Code"}

              {resetStep === 3 &&
                "Create New Password"}

              {resetStep === 4 &&
                "Password Reset Complete"}

            </DialogTitle>

            <DialogDescription>

              {resetStep === 1 &&
                "Enter your email to receive a reset link"}

              {resetStep === 2 &&
                "Check your email for a verification code"}

              {resetStep === 3 &&
                "Enter your new password"}

              {resetStep === 4 &&
                "Your password has been successfully reset"}

            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4">

            {error && (
              <Alert variant="destructive">

                <AlertDescription>
                  {error}
                </AlertDescription>

              </Alert>
            )}

            {resetMessage &&
              resetStep === 2 && (
                <Alert>

                  <Mail className="h-4 w-4" />

                  <AlertDescription>
                    {resetMessage}
                  </AlertDescription>

                </Alert>
              )}

            {/* STEP 1 */}

            {resetStep === 1 && (
              <form
                onSubmit={
                  handleForgotPassword
                }
                className="space-y-4"
              >

                <div className="space-y-2">

                  <Label htmlFor="resetEmail">
                    Email Address
                  </Label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={
                        resetForm.email
                      }
                      onChange={(e) =>
                        setResetForm({
                          ...resetForm,
                          email:
                            e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />

                  </div>

                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading
                  }
                >

                  {isLoading ? (
                    <div className="flex items-center">

                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                      Sending Reset Link...

                    </div>
                  ) : (
                    "Send Reset Link"
                  )}

                </Button>

              </form>
            )}

            {/* STEP 2 */}

            {resetStep === 2 && (
              <form
                onSubmit={
                  handleVerifyResetCode
                }
                className="space-y-4"
              >

                <div className="space-y-2">

                  <Label htmlFor="resetCode">
                    Verification Code
                  </Label>

                  <Input
                    id="resetCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={
                      resetForm.resetCode
                    }
                    onChange={(e) =>
                      setResetForm({
                        ...resetForm,
                        resetCode:
                          e.target.value,
                      })
                    }
                    maxLength={6}
                    required
                  />

                  <p className="text-xs text-gray-600">

                    For demo purposes, use
                    code:{" "}

                    <strong>
                      123456
                    </strong>

                  </p>

                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading
                  }
                >

                  {isLoading ? (
                    <div className="flex items-center">

                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                      Verifying...

                    </div>
                  ) : (
                    "Verify Code"
                  )}

                </Button>

              </form>
            )}

            {/* STEP 3 */}

            {resetStep === 3 && (
              <form
                onSubmit={
                  handleResetPassword
                }
                className="space-y-4"
              >

                <div className="space-y-2">

                  <Label htmlFor="newPassword">
                    New Password
                  </Label>

                  <div className="relative">

                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={
                        resetForm.newPassword
                      }
                      onChange={(e) =>
                        setResetForm({
                          ...resetForm,
                          newPassword:
                            e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />

                  </div>

                </div>

                <div className="space-y-2">

                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>

                  <div className="relative">

                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={
                        resetForm.confirmNewPassword
                      }
                      onChange={(e) =>
                        setResetForm({
                          ...resetForm,
                          confirmNewPassword:
                            e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />

                  </div>

                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading
                  }
                >

                  {isLoading ? (
                    <div className="flex items-center">

                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                      Resetting Password...

                    </div>
                  ) : (
                    "Reset Password"
                  )}

                </Button>

              </form>
            )}

            {/* STEP 4 */}

            {resetStep === 4 && (
              <div className="text-center space-y-4">

                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">

                  <CheckCircle className="w-8 h-8 text-green-600" />

                </div>

                <div>

                  <h3 className="font-medium text-green-900">
                    Success!
                  </h3>

                  <p className="text-sm text-green-700">
                    Your password has been reset
                    successfully.
                  </p>

                </div>

                <Button
                  onClick={
                    closeResetModal
                  }
                  className="w-full"
                >
                  Continue to Sign In
                </Button>

              </div>
            )}

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}