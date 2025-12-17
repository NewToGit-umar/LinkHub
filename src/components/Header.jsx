import { Link as IconLink } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Header({ onLoginClick, onSignUpClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const nav = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  }

  return /*#__PURE__*/_jsx("header", {
    className: "w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50",
    children: /*#__PURE__*/_jsxs("div", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between bg-[rgba(0,0,0,0)]",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-2",
        children: [/*#__PURE__*/_jsx("div", {
          className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B4BFF] to-[#7B6EFF] flex items-center justify-center",
          children: /*#__PURE__*/_jsx(IconLink, { className: "w-5 h-5 text-white" })
        }), /*#__PURE__*/_jsx(Link, { to: "/", className: "text-xl", style: { fontFamily: 'Poppins, sans-serif' }, children: "LinkHub" })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-3",
        children: [/*#__PURE__*/_jsx(Button, { variant: "ghost", onClick: () => nav('/login'), className: "hover:bg-gray-100", children: "Login" }), /*#__PURE__*/_jsx(Button, { onClick: () => nav('/signup'), className: "bg-[#5B4BFF] hover:bg-[#4B3BEF] text-white rounded-2xl shadow-lg shadow-[#5B4BFF]/20", children: "Sign Up" }), /*#__PURE__*/_jsx(Button, { variant: "ghost", onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'), children: theme === 'light' ? 'Dark' : 'Light' }), /*#__PURE__*/_jsx(Button, { variant: "ghost", onClick: handleLogout, children: "Logout" })]
      })]
    })
  });
}