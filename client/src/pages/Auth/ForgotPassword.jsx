import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, AlertCircle, Loader, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/**
 * Forgot Password Page Component
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setValidationError("");
  };

  const validateForm = () => {
    if (!email) {
      setValidationError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {!submitted ? (
            <>
              {/* Header */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center mb-8"
              >
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  Forgot Password?
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 dark:text-gray-400"
                >
                  No worries! We'll send you instructions to reset your
                  password.
                </motion.p>
              </motion.div>

              {/* Error Alert */}
              {(error || validationError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error || validationError}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email Input */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </motion.form>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                Remember your password?{" "}
                <Link
                  to="/auth/login"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </motion.div>

                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  Check Your Email
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 dark:text-gray-400 mb-4"
                >
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white break-all">
                    {email}
                  </span>
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="text-sm text-gray-600 dark:text-gray-400 mb-6"
                >
                  If you don't receive an email in the next few minutes, please
                  check your spam folder or try again.
                </motion.p>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Try another email address
                </motion.button>
              </motion.div>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                <Link
                  to="/auth/login"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Back to login
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
        >
          © 2024 LinkHub. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
