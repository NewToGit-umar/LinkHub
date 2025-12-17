import { Button } from './ui/button';
import { ArrowRight, Link2, BarChart3, Palette, Zap } from 'lucide-react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Landing({
  onNavigate
}) {
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50",
    children: [/*#__PURE__*/_jsxs("nav", {
      className: "flex items-center justify-between px-6 py-4 max-w-7xl mx-auto",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-2",
        children: [/*#__PURE__*/_jsx("div", {
          className: "w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center",
          children: /*#__PURE__*/_jsx(Link2, {
            className: "w-6 h-6 text-white"
          })
        }), /*#__PURE__*/_jsx("span", {
          className: "text-xl",
          children: "LinkHub"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-4",
        children: [/*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          onClick: () => onNavigate('auth'),
          children: "Log in"
        }), /*#__PURE__*/_jsxs(Button, {
          onClick: () => onNavigate('auth'),
          className: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          children: ["Get Started ", /*#__PURE__*/_jsx(ArrowRight, {
            className: "w-4 h-4 ml-2"
          })]
        })]
      })]
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-7xl mx-auto px-6 py-20 text-center",
      children: [/*#__PURE__*/_jsx("div", {
        className: "inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full text-purple-700",
        children: "\u2728 One link, infinite possibilities"
      }), /*#__PURE__*/_jsx("h1", {
        className: "text-6xl mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent",
        children: "Your Hub for Every Link"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-xl text-gray-600 mb-8 max-w-2xl mx-auto",
        children: "Connect your audience to all your content with one powerful link. Simple, beautiful, and built for creators."
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex gap-4 justify-center",
        children: [/*#__PURE__*/_jsxs(Button, {
          size: "lg",
          onClick: () => onNavigate('auth'),
          className: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          children: ["Start for Free ", /*#__PURE__*/_jsx(ArrowRight, {
            className: "w-5 h-5 ml-2"
          })]
        }), /*#__PURE__*/_jsx(Button, {
          size: "lg",
          variant: "outline",
          onClick: () => onNavigate('profile'),
          children: "View Demo"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "mt-16 relative",
        children: [/*#__PURE__*/_jsx("div", {
          className: "absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl"
        }), /*#__PURE__*/_jsx("div", {
          className: "relative bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200",
          children: /*#__PURE__*/_jsxs("div", {
            className: "flex gap-8 items-center",
            children: [/*#__PURE__*/_jsx("div", {
              className: "flex-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 min-h-[400px] flex items-center justify-center",
              children: /*#__PURE__*/_jsxs("div", {
                className: "text-center",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-4"
                }), /*#__PURE__*/_jsx("div", {
                  className: "h-4 bg-gray-200 rounded w-32 mx-auto mb-6"
                }), /*#__PURE__*/_jsx("div", {
                  className: "space-y-3",
                  children: [1, 2, 3, 4].map(i => /*#__PURE__*/_jsx("div", {
                    className: "h-14 bg-white rounded-xl shadow-sm"
                  }, i))
                })]
              })
            }), /*#__PURE__*/_jsxs("div", {
              className: "flex-1",
              children: [/*#__PURE__*/_jsx("h3", {
                className: "text-2xl mb-4",
                children: "Beautiful, Customizable Links"
              }), /*#__PURE__*/_jsx("p", {
                className: "text-gray-600 mb-6",
                children: "Create a stunning page that represents your brand perfectly. Customize colors, add your logo, and make it uniquely yours."
              }), /*#__PURE__*/_jsxs("ul", {
                className: "space-y-3",
                children: [/*#__PURE__*/_jsxs("li", {
                  className: "flex items-center gap-2 text-gray-700",
                  children: [/*#__PURE__*/_jsx("div", {
                    className: "w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center",
                    children: /*#__PURE__*/_jsx("div", {
                      className: "w-2 h-2 bg-purple-600 rounded-full"
                    })
                  }), "Unlimited links"]
                }), /*#__PURE__*/_jsxs("li", {
                  className: "flex items-center gap-2 text-gray-700",
                  children: [/*#__PURE__*/_jsx("div", {
                    className: "w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center",
                    children: /*#__PURE__*/_jsx("div", {
                      className: "w-2 h-2 bg-purple-600 rounded-full"
                    })
                  }), "Custom themes"]
                }), /*#__PURE__*/_jsxs("li", {
                  className: "flex items-center gap-2 text-gray-700",
                  children: [/*#__PURE__*/_jsx("div", {
                    className: "w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center",
                    children: /*#__PURE__*/_jsx("div", {
                      className: "w-2 h-2 bg-purple-600 rounded-full"
                    })
                  }), "Analytics included"]
                })]
              })]
            })]
          })
        })]
      })]
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-7xl mx-auto px-6 py-20",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "text-center mb-16",
        children: [/*#__PURE__*/_jsx("h2", {
          className: "text-4xl mb-4",
          children: "Everything you need to grow"
        }), /*#__PURE__*/_jsx("p", {
          className: "text-xl text-gray-600",
          children: "Powerful features designed for modern creators"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4",
            children: /*#__PURE__*/_jsx(Link2, {
              className: "w-6 h-6 text-purple-600"
            })
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-xl mb-2",
            children: "Unlimited Links"
          }), /*#__PURE__*/_jsx("p", {
            className: "text-gray-600",
            children: "Add as many links as you want. No limits, no restrictions."
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4",
            children: /*#__PURE__*/_jsx(BarChart3, {
              className: "w-6 h-6 text-blue-600"
            })
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-xl mb-2",
            children: "Advanced Analytics"
          }), /*#__PURE__*/_jsx("p", {
            className: "text-gray-600",
            children: "Track clicks, views, and engagement in real-time."
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4",
            children: /*#__PURE__*/_jsx(Palette, {
              className: "w-6 h-6 text-pink-600"
            })
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-xl mb-2",
            children: "Custom Themes"
          }), /*#__PURE__*/_jsx("p", {
            className: "text-gray-600",
            children: "Personalize your page with colors and styles."
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4",
            children: /*#__PURE__*/_jsx(Zap, {
              className: "w-6 h-6 text-green-600"
            })
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-xl mb-2",
            children: "Lightning Fast"
          }), /*#__PURE__*/_jsx("p", {
            className: "text-gray-600",
            children: "Optimized for speed and performance."
          })]
        })]
      })]
    }), /*#__PURE__*/_jsx("section", {
      className: "max-w-7xl mx-auto px-6 py-20",
      children: /*#__PURE__*/_jsxs("div", {
        className: "bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white",
        children: [/*#__PURE__*/_jsx("h2", {
          className: "text-4xl mb-4",
          children: "Ready to get started?"
        }), /*#__PURE__*/_jsx("p", {
          className: "text-xl mb-8 opacity-90",
          children: "Join thousands of creators using LinkHub"
        }), /*#__PURE__*/_jsxs(Button, {
          size: "lg",
          onClick: () => onNavigate('auth'),
          className: "bg-white text-purple-600 hover:bg-gray-100",
          children: ["Create Your Hub ", /*#__PURE__*/_jsx(ArrowRight, {
            className: "w-5 h-5 ml-2"
          })]
        })]
      })
    }), /*#__PURE__*/_jsx("footer", {
      className: "border-t border-gray-200 py-8",
      children: /*#__PURE__*/_jsx("div", {
        className: "max-w-7xl mx-auto px-6 text-center text-gray-600",
        children: /*#__PURE__*/_jsx("p", {
          children: "\xA9 2025 LinkHub. All rights reserved."
        })
      })
    })]
  });
}