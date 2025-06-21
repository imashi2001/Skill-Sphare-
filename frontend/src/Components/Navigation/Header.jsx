import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, GraduationCap, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/home" },
  { name: "About Us", path: "/about" },
  { name: "Posts", path: "/posts" },
  { name: "Tasks Corner", path: "/TaskCorner" },
  { name: "GameHub", path: "" },
  { name: "Groups", path: "/groups" },
  { name: "Leader Board", path: "/leaderboard" },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-8 py-3 rounded-b-lg">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
        <GraduationCap className="text-blue-600 w-7 h-7" />
        <span className="font-bold text-xl text-gray-800">Aspira</span>
      </div>

      {/* Navigation */}
      <nav className="flex gap-8 items-center">
        {navLinks.map((link, idx) => (
          <motion.button
            key={link.name}
            onClick={() => navigate(link.path)}
            className={`relative font-medium text-sm transition-colors duration-200 ${
              isActive(link.path)
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            }`}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
          >
            {link.name}
            {/* Active underline */}
            {isActive(link.path) && (
              <motion.span
                layoutId="header-underline"
                className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 rounded"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Right side: Notification, Profile, Log In, Sign Up, Logout */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => navigate("/notifications")}
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full hover:bg-blue-50 transition"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-blue-600" />
          {/* Notification dot (optional - to be driven by actual unread count later) */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </motion.button>

        <motion.button
          onClick={() => navigate("/profile")}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full hover:bg-blue-50 transition"
          aria-label="Profile"
        >
          <UserCircle className="w-6 h-6 text-blue-600" />
        </motion.button>

        <button
          onClick={() => navigate("/")}
          className="px-[10px] py-[5px] rounded-md border text-sm border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-[10px] py-[5px] rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
        <button
          onClick={handleLogout}
          className="px-[10px] py-[5px] rounded-md bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
