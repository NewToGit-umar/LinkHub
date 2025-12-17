import { GripVertical, ExternalLink, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LinkCard({
  title,
  url,
  visible = true,
  onDelete,
  onToggleVisibility,
  draggable = true
}) {
  return /*#__PURE__*/_jsxs("div", {
    className: "bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3",
    children: [draggable && /*#__PURE__*/_jsx(GripVertical, {
      className: "w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing"
    }), /*#__PURE__*/_jsxs("div", {
      className: "flex-1 min-w-0",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-2 mb-1",
        children: [/*#__PURE__*/_jsx(ExternalLink, {
          className: "w-4 h-4 text-[#5B4BFF] flex-shrink-0"
        }), /*#__PURE__*/_jsx("span", {
          className: "truncate",
          children: title
        })]
      }), /*#__PURE__*/_jsx("p", {
        className: "text-sm text-[#555555] truncate",
        children: url
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "flex items-center gap-2",
      children: [onToggleVisibility && /*#__PURE__*/_jsx(Button, {
        variant: "ghost",
        size: "sm",
        onClick: onToggleVisibility,
        className: "hover:bg-gray-100",
        children: visible ? /*#__PURE__*/_jsx(Eye, {
          className: "w-4 h-4 text-gray-600"
        }) : /*#__PURE__*/_jsx(EyeOff, {
          className: "w-4 h-4 text-gray-400"
        })
      }), onDelete && /*#__PURE__*/_jsx(Button, {
        variant: "ghost",
        size: "sm",
        onClick: onDelete,
        className: "hover:bg-red-50",
        children: /*#__PURE__*/_jsx(Trash2, {
          className: "w-4 h-4 text-red-500"
        })
      })]
    })]
  });
}