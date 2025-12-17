import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Instagram, Twitter, Youtube, Globe, Mail, ArrowLeft } from 'lucide-react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const demoLinks = [{
  id: 1,
  title: 'My Portfolio Website',
  url: 'https://example.com',
  icon: Globe
}, {
  id: 2,
  title: 'Latest YouTube Video',
  url: 'https://youtube.com',
  icon: Youtube
}, {
  id: 3,
  title: 'Shop My Store',
  url: 'https://shop.example.com',
  icon: Globe
}, {
  id: 4,
  title: 'Newsletter Signup',
  url: 'https://newsletter.example.com',
  icon: Mail
}, {
  id: 5,
  title: 'Book a Consultation',
  url: 'https://booking.example.com',
  icon: Globe
}];
const socialLinks = [{
  icon: Instagram,
  url: 'https://instagram.com',
  color: 'hover:text-pink-600'
}, {
  icon: Twitter,
  url: 'https://twitter.com',
  color: 'hover:text-blue-400'
}, {
  icon: Youtube,
  url: 'https://youtube.com',
  color: 'hover:text-red-600'
}];
export function Profile({
  onNavigate
}) {
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50",
    children: [/*#__PURE__*/_jsx("div", {
      className: "max-w-2xl mx-auto px-6 pt-6",
      children: /*#__PURE__*/_jsxs(Button, {
        variant: "ghost",
        onClick: () => onNavigate('landing'),
        className: "mb-4",
        children: [/*#__PURE__*/_jsx(ArrowLeft, {
          className: "w-4 h-4 mr-2"
        }), " Back"]
      })
    }), /*#__PURE__*/_jsxs("div", {
      className: "max-w-2xl mx-auto px-6 py-12",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "text-center mb-8",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "relative inline-block mb-4",
          children: [/*#__PURE__*/_jsxs(Avatar, {
            className: "w-28 h-28 border-4 border-white shadow-xl",
            children: [/*#__PURE__*/_jsx(AvatarImage, {
              src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
            }), /*#__PURE__*/_jsx(AvatarFallback, {
              children: "JD"
            })]
          }), /*#__PURE__*/_jsx("div", {
            className: "absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"
          })]
        }), /*#__PURE__*/_jsx("h1", {
          className: "text-3xl mb-2",
          children: "@johndoe"
        }), /*#__PURE__*/_jsx("p", {
          className: "text-gray-600 max-w-md mx-auto mb-6",
          children: "Content Creator & Designer \uD83C\uDFA8 | Sharing my journey in tech and creativity | Let's connect!"
        }), /*#__PURE__*/_jsx("div", {
          className: "flex items-center justify-center gap-4 mb-8",
          children: socialLinks.map((social, index) => /*#__PURE__*/_jsx("a", {
            href: social.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: `w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all ${social.color}`,
            children: /*#__PURE__*/_jsx(social.icon, {
              className: "w-5 h-5"
            })
          }, index))
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "space-y-4",
        children: demoLinks.map(link => /*#__PURE__*/_jsx("a", {
          href: link.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "block group",
          children: /*#__PURE__*/_jsx("div", {
            className: "bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 hover:-translate-y-1",
            children: /*#__PURE__*/_jsxs("div", {
              className: "flex items-center justify-between",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "flex items-center gap-4",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-all",
                  children: /*#__PURE__*/_jsx(link.icon, {
                    className: "w-6 h-6 text-purple-600"
                  })
                }), /*#__PURE__*/_jsx("span", {
                  className: "text-lg",
                  children: link.title
                })]
              }), /*#__PURE__*/_jsx("div", {
                className: "w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors",
                children: /*#__PURE__*/_jsx("svg", {
                  className: "w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /*#__PURE__*/_jsx("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M9 5l7 7-7 7"
                  })
                })
              })]
            })
          })
        }, link.id))
      }), /*#__PURE__*/_jsx("div", {
        className: "mt-12 text-center",
        children: /*#__PURE__*/_jsxs("div", {
          className: "bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl",
          children: [/*#__PURE__*/_jsx("h3", {
            className: "text-2xl mb-2",
            children: "Create Your Own LinkHub"
          }), /*#__PURE__*/_jsx("p", {
            className: "mb-4 opacity-90",
            children: "Get started in seconds - it's free!"
          }), /*#__PURE__*/_jsx(Button, {
            onClick: () => onNavigate('auth'),
            className: "bg-white text-purple-600 hover:bg-gray-100",
            children: "Sign Up Free"
          })]
        })
      }), /*#__PURE__*/_jsx("div", {
        className: "mt-8 text-center",
        children: /*#__PURE__*/_jsx("button", {
          onClick: () => onNavigate('dashboard'),
          className: "text-sm text-gray-500 hover:text-purple-600 transition-colors",
          children: "View Dashboard \u2192"
        })
      })]
    })]
  });
}