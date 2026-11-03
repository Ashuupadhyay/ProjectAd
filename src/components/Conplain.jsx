import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  MessageSquareWarning,
  LogOut,
} from "lucide-react";

import ComplaintForm from "./Complainform";
import ComplaintStatus from "./Complainstatus";
import rodioLogo from "../../src/assets/rodiologo.jpeg";

const Conplain = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "form",
      label: "Create Complaint",
      icon: FilePlus,
    },
    {
      id: "status",
      label: "Complaint Status",
      icon: ClipboardList,
    },
  ];

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSubmitComplaint = async (formData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token not found. Please login again.");
    }

    const response = await fetch(
      "http://rodiotradelink.info/api/admin-created-users/complaints/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Complaint submission failed");
    }

    setActivePage("status");
    return result;
  };

  const renderPage = () => {
    switch (activePage) {
      case "form":
        return (
          <ComplaintForm
            onSubmitComplaint={handleSubmitComplaint}
            onBack={() => setActivePage("dashboard")}
            onViewStatus={() => setActivePage("status")}
          />
        );

      case "status":
        return <ComplaintStatus />;

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Complaint Dashboard
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleNavigation("form")}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md sm:p-6"
              >
                <div className="rounded-xl bg-blue-50 p-4 text-blue-600">
                  <FilePlus size={30} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create Complaint
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Register a new customer complaint.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigation("status")}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md sm:p-6"
              >
                <div className="rounded-xl bg-green-50 p-4 text-green-600">
                  <ClipboardList size={30} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Complaint Status
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and manage complaint records.
                  </p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <img
              src={rodioLogo}
              alt="Rodio Tradelink"
              className="h-11 w-11 rounded-3xl object-contain"
            />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Rodio CRM
              </h2>
              <p className="text-xs text-slate-500">
                Management System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-base font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={21} />
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-base font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={21} />
              Logout
            </button>
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700">
            Complaint Management
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Customer Support Panel
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-base font-bold text-slate-800 sm:text-lg">
              {navigationItems.find((item) => item.id === activePage)?.label ||
                "Complaint Dashboard"}
            </h2>
          </div>
        </header>

        <div className="w-full p-3 sm:p-5 lg:p-7">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Conplain;