import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FeatureCard({
  icon: Icon,
  title,
  description
}) {
  return /*#__PURE__*/_jsxs("div", {
    className: "bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
    children: [/*#__PURE__*/_jsx("div", {
      className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B4BFF] to-[#7B6EFF] flex items-center justify-center mb-6",
      children: /*#__PURE__*/_jsx(Icon, {
        className: "w-7 h-7 text-white"
      })
    }), /*#__PURE__*/_jsx("h3", {
      className: "mb-3",
      children: title
    }), /*#__PURE__*/_jsx("p", {
      className: "text-[#555555]",
      children: description
    })]
  });
}