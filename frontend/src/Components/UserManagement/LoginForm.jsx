import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import googleIcon from "../../assets/google.png"; // Correct import for Google icon
import facebookIcon from "../../assets/facebook.png"; // Correct import for Facebook icon

// functional component that takes a prop onSuccess (called after a successful login).
const LoginForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Check if we're returning from OAuth2 login
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');

    if (error) {
      showErrorAlert("Login Failed", "Failed to login with Google. Please try again.");
    } else if (success) {
      // You might want to fetch user data here or handle the success case
      onSuccess();
    }
  }, []);

  //Updates the form fields and clears validation error for that field.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
     setValidationErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };
  
//Checks if email and password are provided and if email is valid.
//Updates the validationErrors state and returns true or false
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "error",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
      customClass: {
        popup: "font-poppins",
        title: "text-lg",
        confirmButton: "text-sm"
      }
    });
  };
  
  //Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      const errorMessages = Object.values(validationErrors).filter(Boolean);
      if (errorMessages.length > 0) {
        showErrorAlert("Validation Error", errorMessages.join("\n"));
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Store the token and userId in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('user', JSON.stringify({ 
          name: response.data.name,
          userId: response.data.userId,
          email: response.data.email,
          country: response.data.country,
          city: response.data.city,
          profileImage: response.data.profileImage
        }));
        onSuccess();
      }
    } catch (error) {
      console.error("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = "An error occurred during login";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid input data";
        } else {
          errorMessage = error.response.data.message || "An error occurred during login";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      showErrorAlert("Login Failed", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 font-roboto">
      <h2 className="text-xl md:text-3xl font-bold text-center text-[#111827] mb-6">Welcome Back!</h2>

      {/* Email Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "email" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.email && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "password" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
          <div 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-200 ease-in-out"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </div>
        </div>
        {validationErrors.password && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </p>
      )}

      {/* Login Button */}
      <motion.button
        type="submit"
        className="w-full flex justify-center items-center py-2 px-4 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out font-poppins"
        disabled={isLoading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-[20px] w-[20px] border-b-[2px] border-white mr-[8px]"></div>
        ) : (
          <LogIn size={20} className="mr-[8px]"/>
        )}
        {isLoading ? "Logging In..." : "Login"}
      </motion.button>

      {/* Remember Me and Forgot Password */}
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
          />
          <span className="text-xs text-gray-600 font-poppins">Remember me</span>
        </label>
        <a href="#" className="text-xs text-[#EF476F] hover:text-blue-500 font-poppins">
          Forgot password?
        </a>
      </div>

      {/* Social Login Section */}
      <div className="mt-4">
        <p className="text-center text-sm text-gray-400 mt-6 mb-3 font-poppins">Log in with</p>
        <div className="flex justify-center space-x-4">
          <img 
            src={googleIcon} 
            alt="Google" 
            className="w-6 h-6 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
            onClick={() => {
              window.location.href = "http://localhost:8080/oauth2/authorization/google";
            }}
          />
          <img 
            src={facebookIcon} 
            alt="Facebook" 
            className="w-6 h-6 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
            onClick={() => {
              window.location.href = "http://localhost:8080/oauth2/authorization/facebook";
            }}
          />
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
