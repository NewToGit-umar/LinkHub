import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { jsx as _jsx } from "react/jsx-runtime";

createRoot(document.getElementById("root")).render(/*#__PURE__*/_jsx(BrowserRouter, { children: /*#__PURE__*/_jsx(App, {}) }));