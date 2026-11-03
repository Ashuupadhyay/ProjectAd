import React from "react";
import { Link } from "react-router-dom";
import rodioLogo from "../../src/assets/rodiologo.jpeg";

const HomePage = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1920')",
        }}
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl px-6 text-center">

        {/* Logo */}
        <img
          src={rodioLogo}
          alt="Rodio Tradelink"
          className="w-24 h-24 mx-auto mb-5 rounded-3xl object-contain bg-white p-2 shadow-xl"
        />

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Backend Panel
        </h1>

        <p className="text-slate-300 mb-10">
          Select your login portal to continue
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/admin"
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 p-8 text-white shadow-xl transition-all hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold mb-2">Admin</h2>
            <p className="text-sm text-blue-100">
              Admin Login Portal
            </p>
          </Link>

          <Link
            to="/employee"
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 p-8 text-white shadow-xl transition-all hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold mb-2">Employee</h2>
            <p className="text-sm text-orange-100">
              Employee Login Portal
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;