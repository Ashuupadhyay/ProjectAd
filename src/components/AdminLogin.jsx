import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  RefreshCw,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();

  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  useEffect(() => {
    const attempts = Number(
      localStorage.getItem("admin_login_attempts") || 0
    );

    const lockUntil = Number(
      localStorage.getItem("admin_lock_until") || 0
    );

    setFailedAttempts(attempts);

    if (lockUntil && Date.now() < lockUntil) {
      setIsLocked(true);
    } else {
      localStorage.removeItem("admin_lock_until");
      setIsLocked(false);
      setLockTimeLeft("");
    }
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    const lockUntil = Number(
      localStorage.getItem("admin_lock_until") || 0
    );

    const update = () => {
      const difference = lockUntil - Date.now();

      if (difference <= 0) {
        setIsLocked(false);
        setLockTimeLeft("");

        localStorage.removeItem("admin_lock_until");
        localStorage.removeItem("admin_login_attempts");

        setFailedAttempts(0);
        return;
      }

      const hours = Math.floor(
        difference / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );

      const seconds = Math.floor(
        (difference % (1000 * 60)) / 1000
      );

      setLockTimeLeft(
        `${hours}h ${minutes}m ${seconds}s`
      );
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [isLocked]);

  const handleWrongPassword = () => {
    const newAttempts = failedAttempts + 1;

    setFailedAttempts(newAttempts);

    localStorage.setItem(
      "admin_login_attempts",
      String(newAttempts)
    );

    if (newAttempts >= 5) {
      const lockUntil =
        Date.now() + 24 * 60 * 60 * 1000;

      localStorage.setItem(
        "admin_lock_until",
        String(lockUntil)
      );

      setIsLocked(true);

      setLoginError(
        "5 wrong attempts. Admin login 24 hours ke liye locked hai."
      );
    } else {
      setLoginError(
        `Wrong password. ${5 - newAttempts} attempts remaining.`
      );
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) return;

    if (!inputPassword.trim()) {
      setLoginError("Password enter karo.");
      return;
    }

    setIsLoadingLogin(true);
    setLoginError("");

    try {
    //   const response = await API.post(
    //     "/api/admin/verify-password",
    //     {
    //       password: inputPassword,
    //     },
    //     {
    //     //   withCredentials: true,
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    





const response = await fetch(
  "http://localhost:5001/api/admin/verify-password",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: inputPassword,
    }),
  }
);

const data = await response.json();

if (!response.ok || !data.success) {
  handleWrongPassword();
  setInputPassword("");
  return;
}



    

      setInputPassword("");
      setFailedAttempts(0);

      localStorage.removeItem("admin_login_attempts");
      localStorage.removeItem("admin_lock_until");

      navigate("/admindashboard");
    } catch (error) {
      console.error("Admin Login Error:", error);

      setLoginError(
        "Server se connection nahi ho pa raha."
      );
    } finally {
      setIsLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,.35) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />

        <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_25px_#3b82f6] animate-ping" />

        <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_25px_#f59e0b] animate-ping" />

        <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_20px_#06b6d4] animate-ping" />

        <div className="absolute bottom-20 right-1/4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_20px_#3b82f6] animate-ping" />

        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-pulse" />

        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] animate-pulse" />

      </div>

      <div className="w-full max-w-md relative z-10">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-8 text-white text-center">

            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-black">RODIO</span>{" "}
              <span className="text-orange-600">
                Tradelink
              </span>
            </h1>

            <p className="text-blue-100 mt-1">
              Admin Control Panel
            </p>

          </div>

          <div className="p-8">

            {isLocked ? (

              <div className="text-center">

                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <Lock size={30} />
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  Admin Locked
                </h2>

                <p className="text-gray-500 mt-2">
                  Too many wrong password attempts.
                </p>

                <div className="mt-5 bg-red-50 rounded-xl p-4">

                  <p className="text-sm text-red-600">
                    Try again after
                  </p>

                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {lockTimeLeft}
                  </p>

                </div>

              </div>

            ) : (

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Password
                  </label>

                  <div className="relative">

                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={inputPassword}
                      onChange={(e) =>
                        setInputPassword(e.target.value)
                      }
                      placeholder="Enter admin password"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {loginError && (

                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex gap-2">

                    <AlertTriangle
                      size={18}
                      className="shrink-0"
                    />

                    <span>{loginError}</span>

                  </div>

                )}

                <button
                  type="submit"
                  disabled={isLoadingLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >

                  {isLoadingLogin ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Login to Admin
                    </>
                  )}

                </button>

                <p className="text-center text-xs text-red-400">
                  Failed attempts: {failedAttempts}/5
                </p>

              </form>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
export default AdminLogin;