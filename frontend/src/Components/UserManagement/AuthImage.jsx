import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "react-lottie-player";
import regGif from "../../assets/reg.gif";
import log1Gif from "../../assets/log1.gif";
import NewsAnimation from "../../assets/NewsFeed.json";
import logGif3 from "../../assets/logGif3.gif";
import rmH1 from "../../assets/rmH1.png";
import rmH2 from "../../assets/rmH2.png";
import welcome from "../../assets/Welcome.gif";
import signupsuc from "../../assets/SignUpSuc.gif";
import rightLAnimation from "../../assets/rightLine.json";

const AuthImage = ({ view, isSuccess }) => {
  // --- Animation Variants ---
  const contentVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 0.35, // Delay the content animation
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  const gridVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentTransition = { 
    duration: 0.4, 
    ease: "easeInOut",width: { duration: 0.5, ease: [0.4, 0, 0.2, 1]  } // Custom easing for width
    
  };

  // --- Success Content ---
  const getSuccessContent = (viewType) => {
    const loginContent = {
      image: welcome,
      title: "Login Successful!",
      message: "Welcome back. Redirecting to home page...",
      animation: rightLAnimation,
      imageSize: "max-w-[220px] sm:max-w-[420px]",
      animationSize: "max-w-[100px] sm:max-w-[150px]"
    };

    const signupContent = {
      image: signupsuc,
      title: "Sign Up Successful!",
      message: "Welcome to Aspira! Redirecting to home page...",
      animation: rightLAnimation,
      imageSize: "max-w-[220px] sm:max-w-[420px]",
      animationSize: "max-w-[100px] sm:max-w-[150px]"
    };

    return viewType === "login" ? loginContent : signupContent;
  };

  const successContent = (
    <motion.div
      key="success-content-wrapper"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={contentTransition}
      className="w-full h-full flex items-center justify-center p-4"
    >
      <div className="flex items-center justify-center gap-8">
        {/* Left: Static Image */}
        <div className="flex-shrink-0">
          <img
            src={getSuccessContent(view).image}
            alt="Success"
            className={getSuccessContent(view).imageSize}
          />
        </div>
        {/* Right: Message and GIF */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300 text-center">
            {getSuccessContent(view).title}
          </h1>
          <p className="mb-3 text-sm sm:text-sm text-white/80 text-center">
            {getSuccessContent(view).message}
          </p>
          <Lottie
            animationData={getSuccessContent(view).animation}
            play
            loop
            speed={0.8}
            className={getSuccessContent(view).animationSize}
          />
        </div>
      </div>
    </motion.div>
  );

  // ---Login Image Content ---
  const loginImageContent = (
    <motion.div
      key="login-grid"
      variants={gridVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={contentTransition}
      className="w-full max-w-lg sm:max-w-2xl flex flex-col items-start"
    >
      <div className="grid grid-cols-4 grid-rows-4 gap-[14px] w-full h-[350px] sm:h-[400px]">
        {[
         {
            id: 1,
            src: rmH1,
            alt: "Animated Alert",
            type: "image",
            colSpan: "col-span-2",
            rowSpan: "row-span-2",
          },
          {
            id: 2,
            src: log1Gif,
            alt: "Animated Icon 2",
            type: "image",
            colSpan: "col-span-2",
            rowSpan: "row-span-1",
          },
          {
            id: 3,
            src: NewsAnimation,
            alt: "Empty Box",
            type: "lottie",
            colSpan: "col-span-2",
            rowSpan: "row-span-2",
          },
          {
            id: 4,
            src: logGif3,
            alt: "Empty Box 1",
            type: "image",
            colSpan: "col-span-2",
            rowSpan: "row-span-1",
            className: "bg-transparent"
          },
          {
            id: 5,
            src: rmH2,
            alt: "Empty Box 2",
            type: "image",
            colSpan: "col-span-4",
            rowSpan: "row-span-1",
          },
        ].map((item) => (
            <div
            key={item.id}
            className={`${item.className || 'bg-white/25'} backdrop-blur-sm rounded-md flex items-center justify-center shadow-md hover:shadow-l hover:scale-[1.03] transition-all duration-300 ease-in-out overflow-hidden 
              ${item.colSpan || "col-span-1"} ${item.rowSpan || "row-span-1"}`}
          >
            {item.type === "lottie" ? (
              <Lottie
                animationData={item.src}
                play
                loop
                speed={0.8}
                style={{ width: "100%", height: "100%" }}
              />
            ) : item.type === "image" ? (
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/60 text-sm text-center px-2">
                {item.alt}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  // --- Sign Up Grid Content ---
  const signupGridContent = (
    <motion.div
      key="login-animation-wrapper"
      variants={gridVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={contentTransition}
      className="w-full h-full flex flex-col items-center justify-center text-center p-4"
    >
      <div className="relative top-0 left-0 w-full">
        <h1 className="text-left text-[20px] font-semibold text-blue-300 mb-4">
          Start Your Journey...
        </h1>
      </div> 
      <img
        src={regGif}
        alt="SignUpAnimation"
        className="w-full max-w-[450px] h-auto object-contain"
      />
    </motion.div>
  );

  return (
    <div
      className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 
      bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4754E6] via-[#4754E6] to-[#525fe4]  
      bg-blend-multiply text-white font-poppins">
      <AnimatePresence mode="wait">
        {isSuccess
          ? (
            <motion.div
              initial={{ width: "50%", opacity: 0 }}
              animate={{ 
                width: "100%",
                opacity: 1,
                transition: {
                  width: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.3 }
                }
              }}
              className="w-full h-full"
            >
              {successContent}
            </motion.div>
          )
          : view === "login"
          ? loginImageContent
          : signupGridContent}
      </AnimatePresence>
    </div>
  );
};

export default AuthImage;
