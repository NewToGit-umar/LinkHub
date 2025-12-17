import { Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LinkPage({
  username = "johndoe",
  name = "John Doe",
  bio = "Creator • Designer • Developer",
  avatar,
  theme = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  links = [{
    title: "My Portfolio",
    url: "https://example.com"
  }, {
    title: "Latest YouTube Video",
    url: "https://youtube.com"
  }, {
    title: "Shop My Merch",
    url: "https://shop.example.com"
  }, {
    title: "Book a Consultation",
    url: "https://calendly.com"
  }],
  socials = [{
    type: "instagram",
    url: "https://instagram.com"
  }, {
    type: "youtube",
    url: "https://youtube.com"
  }, {
    type: "twitter",
    url: "https://twitter.com"
  }, {
    type: "email",
    url: "mailto:hello@example.com"
  }]
}) {
  const getSocialIcon = type => {
    switch (type) {
      case "instagram":
        return Instagram;
      case "youtube":
        return Youtube;
      case "twitter":
        return Twitter;
      case "email":
        return Mail;
      default:
        return Mail;
    }
  };
  return /*#__PURE__*/_jsx("div", {
    className: "min-h-screen w-full flex items-center justify-center p-4 sm:p-8",
    style: {
      background: theme
    },
    children: /*#__PURE__*/_jsxs("div", {
      className: "w-full max-w-xl",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "text-center mb-8",
        children: [/*#__PURE__*/_jsx("div", {
          className: "w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center shadow-xl",
          children: /*#__PURE__*/_jsx("div", {
            className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/40"
          })
        }), /*#__PURE__*/_jsxs("h2", {
          className: "text-white mb-2",
          children: ["@", username]
        }), /*#__PURE__*/_jsx("h3", {
          className: "text-white mb-2",
          children: name
        }), /*#__PURE__*/_jsx("p", {
          className: "text-white/90",
          children: bio
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "space-y-4 mb-8",
        children: links.map((link, index) => /*#__PURE__*/_jsx("a", {
          href: link.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "block w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg group",
          children: /*#__PURE__*/_jsx("span", {
            className: "group-hover:translate-x-1 inline-block transition-transform",
            children: link.title
          })
        }, index))
      }), /*#__PURE__*/_jsx("div", {
        className: "flex justify-center gap-4",
        children: socials.map((social, index) => {
          const Icon = getSocialIcon(social.type);
          return /*#__PURE__*/_jsx("a", {
            href: social.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg",
            children: /*#__PURE__*/_jsx(Icon, {
              className: "w-5 h-5"
            })
          }, index);
        })
      }), /*#__PURE__*/_jsx("div", {
        className: "text-center mt-12",
        children: /*#__PURE__*/_jsxs("p", {
          className: "text-white/60 text-sm",
          children: ["Made with ", /*#__PURE__*/_jsx("span", {
            className: "text-white",
            children: "LinkHub"
          })]
        })
      })]
    })
  });
}