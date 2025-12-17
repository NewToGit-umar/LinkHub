import { Header } from "./Header";
import { Footer } from "./Footer";
import { FeatureCard } from "./FeatureCard";
import { Button } from "./ui/button";
import { Link2, Palette, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LandingPage({
  onGetStarted
}) {
  const examples = [{
    name: "@sarah_designs",
    bio: "UI/UX Designer & Creator",
    theme: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }, {
    name: "@fitness_coach",
    bio: "Personal Trainer & Nutritionist",
    theme: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  }, {
    name: "@tech_writer",
    bio: "Developer & Content Creator",
    theme: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  }];
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen flex flex-col",
    children: [/*#__PURE__*/_jsx(Header, {
      onLoginClick: onGetStarted,
      onSignUpClick: onGetStarted
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "inline-flex items-center gap-2 px-4 py-2 bg-[#5B4BFF]/10 rounded-full mb-8",
        children: [/*#__PURE__*/_jsx(Sparkles, {
          className: "w-4 h-4 text-[#5B4BFF]"
        }), /*#__PURE__*/_jsx("span", {
          className: "text-sm text-[#5B4BFF]",
          children: "The modern bio link platform"
        })]
      }), /*#__PURE__*/_jsxs("h1", {
        className: "mb-6 max-w-4xl mx-auto font-bold no-underline",
        children: ["Your Digital Identity. ", /*#__PURE__*/_jsx("br", {}), /*#__PURE__*/_jsx("span", {
          className: "bg-gradient-to-r from-[#5B4BFF] to-[#FFAE00] bg-clip-text text-transparent",
          children: "Simplified."
        })]
      }), /*#__PURE__*/_jsx("p", {
        className: "text-xl text-[#555555] mb-10 max-w-2xl mx-auto",
        children: "Create a stunning link page that represents you. Share your content, grow your audience, and track your success."
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex flex-col sm:flex-row gap-4 justify-center",
        children: [/*#__PURE__*/_jsxs(Button, {
          onClick: onGetStarted,
          className: "bg-[#5B4BFF] hover:bg-[#4B3BEF] text-white rounded-2xl px-8 py-6 shadow-xl shadow-[#5B4BFF]/30 transition-all hover:scale-105",
          children: ["Get Started ", /*#__PURE__*/_jsx(ArrowRight, {
            className: "ml-2 w-5 h-5"
          })]
        }), /*#__PURE__*/_jsx(Button, {
          variant: "outline",
          className: "rounded-2xl px-8 py-6 border-2 hover:border-[#5B4BFF] hover:text-[#5B4BFF]",
          children: "See Examples"
        })]
      })]
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20",
      children: [/*#__PURE__*/_jsx("h2", {
        className: "text-center mb-12",
        children: "Trusted by Creators Worldwide"
      }), /*#__PURE__*/_jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-8",
        children: examples.map((example, index) => /*#__PURE__*/_jsx("div", {
          className: "rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300",
          style: {
            background: example.theme
          },
          children: /*#__PURE__*/_jsxs("div", {
            className: "p-8 text-center text-white",
            children: [/*#__PURE__*/_jsx("div", {
              className: "w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center",
              children: /*#__PURE__*/_jsx("div", {
                className: "w-16 h-16 rounded-full bg-white/40"
              })
            }), /*#__PURE__*/_jsx("h4", {
              className: "text-white mb-2",
              children: example.name
            }), /*#__PURE__*/_jsx("p", {
              className: "text-white/80 text-sm mb-6",
              children: example.bio
            }), /*#__PURE__*/_jsx("div", {
              className: "space-y-3",
              children: [1, 2, 3].map(i => /*#__PURE__*/_jsx("div", {
                className: "bg-white/20 backdrop-blur-sm rounded-2xl p-3 hover:bg-white/30 transition-all"
              }, i))
            })]
          })
        }, index))
      })]
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20",
      children: [/*#__PURE__*/_jsx("h2", {
        className: "text-center mb-4",
        children: "Everything You Need"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-center text-[#555555] mb-12 max-w-2xl mx-auto",
        children: "Powerful features to help you share your links and grow your audience"
      }), /*#__PURE__*/_jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-8",
        children: [/*#__PURE__*/_jsx(FeatureCard, {
          icon: Link2,
          title: "Customizable Links",
          description: "Add unlimited links to your profile. Organize, customize, and make them your own."
        }), /*#__PURE__*/_jsx(FeatureCard, {
          icon: Palette,
          title: "Beautiful Themes",
          description: "Choose from stunning pre-made themes or create your own with custom colors and styles."
        }), /*#__PURE__*/_jsx(FeatureCard, {
          icon: BarChart3,
          title: "Detailed Analytics",
          description: "Track clicks, views, and engagement. Understand your audience and optimize your content."
        })]
      })]
    }), /*#__PURE__*/_jsx(Footer, {})]
  });
}