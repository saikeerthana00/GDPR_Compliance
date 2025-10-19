import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsGrid1X2Fill, BsChevronRight } from "react-icons/bs";
import { HiX } from "react-icons/hi";

function Sidebar({ openSidebarToggle, OpenSidebar, setActiveCard }) {
  const location = useLocation();

  if (!openSidebarToggle) return null;

  return (
    <aside className="bg-white h-full w-64 shadow-md z-40 fixed">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="py-6 px-6 flex justify-between items-center border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Your Observatory
          </h1>
          <button
            onClick={OpenSidebar}
            className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                    location.pathname === "/"
                      ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <BsGrid1X2Fill
                    className={`mr-3 text-lg ${
                      location.pathname === "/"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span>Dashboard</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setActiveCard("Browsing History")}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BsChevronRight className="mr-3 text-gray-400" />
                  <span>Browsing History</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveCard("Search History")}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BsChevronRight className="mr-3 text-gray-400" />
                  <span>Search History</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveCard("Login Information")}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BsChevronRight className="mr-3 text-gray-400" />
                  <span>Login Information</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveCard("Off Platform Activity")}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BsChevronRight className="mr-3 text-gray-400" />
                  <span>Off Platform Activity</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveCard("Comments")}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BsChevronRight className="mr-3 text-gray-400" />
                  <span>Comments</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 p-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                YO
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-900">
                  Know Your Data
                </p>
                <p className="text-xs text-gray-500">Analytics Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
