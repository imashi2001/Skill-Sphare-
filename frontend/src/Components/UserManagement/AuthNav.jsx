import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus } from "lucide-react";

const AuthNav = ({ currentView, onSwitchView }) => {
  return (
    <div
      className="
        flex flex-col items-center justify-center 
        space-y-6 sm:space-y-8 
        p-4 sm:p-6 
        bg-white h-full 
        border-r border-gray-200 
        w-[100px]
        font-roboto
      "
    >
      {/* CONDITIONAL INDICATOR for Login */}
      {currentView === "login" && (
        <motion.div
          layoutId="active-nav-indicator"
          className="
            absolute left-0 
            top-[174px] translate-y-1/2 
            w-[4px] h-[80px] 
            bg-[#EF476F] rounded-r-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      {/* CONDITIONAL INDICATOR for Signup */}
      {currentView === "signup" && (
        <motion.div
          layoutId="active-nav-indicator"
          className="
            absolute left-0 
            bottom-[139px] translate-y-1/2 
            w-[4px] h-[80px] 
            bg-[#EF476F] rounded-r-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      {/* Login Button */}
      <button
        title="Sign In"
        onClick={() => onSwitchView("login")}
        className="
          relative p-3 rounded-lg cursor-pointer 
          transition-colors duration-200 ease-in-out 
          w-full flex flex-col items-center space-y-1 text-center group
          mr-5"
      >
        <ShieldCheck
          size={22}
          strokeWidth={1.5}
          className={`transition-colors duration-200 ease-in-out ${
            currentView === "login"
              ? "text-blue-700"
              : "text-gray-400 group-hover:text-blue-600"
          }`}
        />
        <span
          className={`text-xs transition-colors duration-200 ease-in-out ${
            currentView === "login"
              ? "text-blue-700 font-semibold"
              : "text-gray-400 group-hover:text-blue-600"
          }`}
        >
          Sign In
        </span>
      </button>

      {/* Sign Up Button */}
      <button
        title="Sign Up"
        onClick={() => onSwitchView("signup")}
        className="
          relative p-3 rounded-lg cursor-pointer 
          transition-colors duration-200 ease-in-out 
          w-full flex flex-col items-center space-y-1 text-center group
          mr-5
        "
      >
        <UserPlus
          size={22}
          strokeWidth={1.5}
          className={`transition-colors duration-200 ease-in-out ${
            currentView === "signup"
              ? "text-blue-700"
              : "text-gray-400 group-hover:text-blue-600"
          }`}
        />
        <span
          className={`text-xs transition-colors duration-200 ease-in-out ${
            currentView === "signup"
              ? "text-blue-700 font-semibold"
              : "text-gray-400 group-hover:text-blue-600"
          }`}
        >
          Sign Up
        </span>
      </button>
    </div>
  );
};

export default AuthNav;
