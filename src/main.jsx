import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Initialize theme from localStorage or system preference
try {
	const saved = localStorage.getItem('theme');
	let theme = saved;
	if (!theme) {
		const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = prefersDark ? 'dark' : 'light';
	}
	document.documentElement.dataset.theme = theme;
	if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
} catch (e) {
	// ignore (e.g., SSR or blocked localStorage)
}

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);