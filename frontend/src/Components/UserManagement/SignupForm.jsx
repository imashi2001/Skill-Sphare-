import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, Eye, EyeOff, AlertCircle, Briefcase, Calendar } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const SignupForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    occupation: "",
    birthday: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [emailError, setEmailError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough
    ].filter(Boolean).length;

    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Moderate";
    return "Strong";
  };

  // Email format validation
  const validateEmail = (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Extract domain part
    const domain = email.split('@')[1];
    
    // List of valid top-level domains
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'biz', 'info', 'name', 'pro',
      'aero', 'coop', 'museum', 'ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an',
      'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be',
      'bf', 'bg', 'bh', 'bi', 'bj', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bv', 'bw',
      'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn',
      'co', 'cr', 'cu', 'cv', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz',
      'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo',
      'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp',
      'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu',
      'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo',
      'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la',
      'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md',
      'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt',
      'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl',
      'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl',
      'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw',
      'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn',
      'so', 'sr', 'st', 'su', 'sv', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj',
      'tk', 'tl', 'tm', 'tn', 'to', 'tp', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug',
      'uk', 'um', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf',
      'ws', 'ye', 'yt', 'yu', 'za', 'zm', 'zw'
    ];

    // Check if domain has a valid TLD
    const tld = domain.split('.').pop().toLowerCase();
    if (!validTLDs.includes(tld)) {
      return false;
    }

    // List of common valid email providers
    const validProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
      'aol.com', 'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com',
      'gmx.com', 'tutanota.com', 'fastmail.com', 'hushmail.com', 'mail.ru',
      'inbox.com', 'hubspot.com', 'salesforce.com', 'microsoft.com', 'amazon.com',
      'apple.com', 'google.com', 'facebook.com', 'linkedin.com', 'twitter.com',
      'github.com', 'gitlab.com', 'bitbucket.org', 'atlassian.com', 'slack.com',
      'trello.com', 'asana.com', 'basecamp.com', 'notion.so', 'figma.com',
      'adobe.com', 'autodesk.com', 'cisco.com', 'dell.com', 'hp.com',
      'ibm.com', 'intel.com', 'microsoft.com', 'oracle.com', 'sap.com',
      'vmware.com', 'accenture.com', 'deloitte.com', 'ey.com', 'kpmg.com',
      'pwc.com', 'mckinsey.com', 'bain.com', 'bcg.com', 'boozallen.com',
      'oliverwyman.com', 'atkearney.com', 'rolandberger.com', 'strategyand.com',
      'leidos.com', 'northropgrumman.com', 'lockheedmartin.com', 'raytheon.com',
      'boeing.com', 'airbus.com', 'rolls-royce.com', 'ge.com', 'siemens.com',
      'abb.com', 'schneider-electric.com', 'rockwellautomation.com', 'honeywell.com',
      'emerson.com', 'yokogawa.com', 'endress.com', 'krohne.com', 'vega.com',
      'wika.com', 'abbott.com', 'baxter.com', 'bectondickinson.com', 'johnsonandjohnson.com',
      'medtronic.com', 'philips.com', 'roche.com', 'siemens-healthineers.com', 'stryker.com',
      'thermofisher.com', 'zoetis.com', 'astrazeneca.com', 'bayer.com', 'bristolmyerssquibb.com',
      'eli Lilly.com', 'gilead.com', 'glaxosmithkline.com', 'merck.com', 'novartis.com',
      'pfizer.com', 'sanofi.com', 'takeda.com', 'teva.com', 'viatris.com'
    ];

    // Check if domain is from a valid provider
    if (!validProviders.includes(domain.toLowerCase())) {
      return false;
    }

    return true;
  };

  // Check if email exists
  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/email?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  // Real-time validation effects
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength("");
    }
  }, [formData.password]);

  useEffect(() => {
    if (formData.email) {
      if (!validateEmail(formData.email)) {
        setEmailError("Please enter a valid email address from a recognized provider");
      } else {
        // Check if email exists
        const checkEmail = async () => {
          const exists = await checkEmailExists(formData.email);
          if (exists) {
            setEmailError("Email already exists");
          } else {
            setEmailError("");
          }
        };
        checkEmail();
      }
    } else {
      setEmailError("");
    }
  }, [formData.email]);

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address from a recognized provider";
    } else if (emailError === "Email already exists") {
      errors.email = "Email already exists";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.occupation.trim()) {
      errors.occupation = "Occupation is required";
    } else if (formData.occupation.length > 100) {
      errors.occupation = "Occupation must be less than 100 characters";
    }

    if (!formData.birthday) {
      errors.birthday = "Birthday is required";
    } else {
      const selectedDate = new Date(formData.birthday);
      const today = new Date();
      
      // Reset time part to compare only dates
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate >= today) {
        errors.birthday = "Birthday must be a date in the past";
      }
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
      const response = await axios.post("http://localhost:8080/api/users", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        occupation: formData.occupation,
        birthday: formData.birthday,
        provider: "local"
      });

      if (response.status === 201) {
        console.log("Signup successful, calling onSuccess");
        onSuccess();
      }
    } catch (error) {
      console.error("Signup error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = "An error occurred during signup";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid input data";
        } else if (error.response.status === 409) {
          errorMessage = "Username or email already exists";
        } else {
          errorMessage = error.response.data.message || "An error occurred during signup";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      showErrorAlert("Signup Failed", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "text-red-500";
      case "Moderate":
        return "text-yellow-500";
      case "Strong":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 font-roboto">
      <h2 className="text-xl md:text-3xl font-bold text-center text-[#111827] mb-4">Create Account</h2>

      {/* Name Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "name" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.name && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.name}
          </p>
        )}
      </div>

      {/* Username Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "username" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.username && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.username}
          </p>
        )}
      </div>

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
        {(validationErrors.email || emailError) && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.email || emailError}
          </p>
        )}
      </div>

      {/* Occupation Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "occupation" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <Briefcase size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            name="occupation"
            placeholder="Occupation"
            value={formData.occupation}
            onChange={handleChange}
            onFocus={() => setFocusedField("occupation")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.occupation && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.occupation}
          </p>
        )}
      </div>

      {/* Birthday Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "birthday" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            onFocus={() => setFocusedField("birthday")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins text-gray-400 placeholder-gray-400"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.birthday && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.birthday}
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
        {formData.password && (
          <div className="flex items-center space-x-2">
            <div className={`text-xs ${getPasswordStrengthColor()}`}>
              Password Strength: {passwordStrength}
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  passwordStrength === "Weak" ? "bg-red-500 w-1/3" :
                  passwordStrength === "Moderate" ? "bg-yellow-500 w-2/3" :
                  passwordStrength === "Strong" ? "bg-green-500 w-full" :
                  "w-0"
                }`}
              />
            </div>
          </div>
        )}
        {validationErrors.password && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1">
        <div className={`relative ${focusedField === "confirmPassword" ? "shadow-[0_4px_10px_rgba(59,130,246,0.4)] border-gray-300 rounded-md" : ""}`}>
          <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out font-poppins"
            disabled={isLoading}
            required
          />
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Sign Up Button */}
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
          <UserPlus size={20} className="mr-[8px]"/>
        )}
        {isLoading ? "Creating Account..." : "Sign Up"}
      </motion.button>
    </form>
  );
};

export default SignupForm;
