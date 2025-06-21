import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthNav from "./AuthNav";
import AuthImage from "./AuthImage";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthPage = () => {
  const [view, setView] = useState("login"); 
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [successViewType, setSuccessViewType] = useState(null);

  const handleSuccess = (viewType) => {
    console.log("Success handler triggered with viewType:", viewType);
    setSuccessViewType(viewType);
    setIsSuccess(true);
    console.log("Setting timeout for navigation...");
    setTimeout(() => {
      console.log("Attempting navigation to /home");
      navigate("/home");
    }, 3500);
  };

  const handleSwitchView = (newView) => {
    if (!isSuccess) setView(newView);
  };

  // --- Animation Variants ---
  const formVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  };
  const formTransition = { duration: 0.4, ease: "easeInOut" };

  // Exit animations for Nav wrapper and the Form Content wrapper
  const navExitVariant = { 
    x: "100%", 
    opacity: 0,
    zIndex: 0 // Add this to ensure it goes under
  };
  const formContentExitVariant = { 
    x: "-100%", 
    opacity: 0,
    zIndex: 0 // Add this to ensure it goes under
  };
  const exitTransition = { 
    duration: 0.6, 
    ease: "easeInOut", 
    delay: 0.1 
  };

  return (
    // Main Container
    <div className="fixed inset-0 flex items-center justify-center p-4">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: "#e3efff",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23e4d6fb' fill-opacity='0.46'%3E%3Cpath fill-rule='evenodd' d='M11 0l5 20H6l5-20zm42 31a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM0 72h40v4H0v-4zm0-8h31v4H0v-4zm20-16h20v4H20v-4zM0 56h40v4H0v-4zm63-25a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM53 41a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-30 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-28-8a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zM56 5a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zm-3 46a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 0l5 20H16l5-20zm43 64v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zM36 13h4v4h-4v-4zm4 4h4v4h-4v-4zm-4 4h4v4h-4v-4zm8-8h4v4h-4v-4z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Background Overlay Gradient Layer */}
      <div className="fixed inset-0 z-1 bg-gradient-to-br from-white/40 via-indigo-100/40 to-blue-100/20" />

      {/*Content layer*/}
      <div className={`relative flex w-full max-w-4xl h-[32rem] rounded-2xl overflow-hidden ${isSuccess ? '' : 'shadow-2xl'}`}>
        {/* Navigation Section */}
        <AnimatePresence>
          {!isSuccess && (
            <motion.div
              key="auth-nav-wrapper"
              className="relative w-1/12 h-full flex-shrink-0 z-10 bg-white"
              initial={false}
              exit={navExitVariant}
              transition={exitTransition}
            >
              <AuthNav currentView={view} onSwitchView={handleSwitchView} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Image Section */}
        <motion.div
          className="relative h-full flex items-center justify-center z-20"
          initial={false}
          animate={{ width: isSuccess ? '100%' : '50%' }}
          transition={isSuccess ? { duration: 0.7, ease: 'easeInOut' } : { duration: 0 }}
        >
          <div className="w-full flex items-center justify-center">
            <AuthImage
              view={isSuccess ? successViewType : view}
              isSuccess={isSuccess}
            />
          </div>
        </motion.div>

        {/* Form Section */}
        <AnimatePresence>
          {!isSuccess && (
            <motion.div
              key="form-section"
              className="relative w-5/12 h-full flex-shrink-0 flex items-center justify-center p-8 md:p-10 bg-[#F9FAFB] z-0"
              initial={false}
              exit={formContentExitVariant}
              transition={exitTransition}
            >
              <div className="w-full h-full flex items-center justify-center">
                {/* AnimatePresence for switching between Login/Signup Forms */}
                <AnimatePresence mode="wait">
                  {view === "login" && (
                    <motion.div
                      key="login-form-inner"
                      variants={formVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={formTransition}
                      className="w-full max-w-xs sm:max-w-sm"
                    >
                      <LoginForm onSuccess={() => handleSuccess("login")} />
                    </motion.div>
                  )}
                  {view === "signup" && (
                    <motion.div
                      key="signup-form-inner"
                      variants={formVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={formTransition}
                      className="w-full max-w-xs sm:max-w-sm"
                    >
                      <SignupForm onSuccess={() => handleSuccess("signup")} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
