import { Link2, Palette, BarChart3, Settings, User, LogOut } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Sidebar({
  activeTab,
  onTabChange
}) {
  const menuItems = [{
    id: 'profile',
    icon: User,
    label: 'Profile'
  }, {
    id: 'links',
    icon: Link2,
    label: 'Links'
  }, {
    id: 'themes',
    icon: Palette,
    label: 'Themes'
  }, {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics'
  }, {
    id: 'settings',
    icon: Settings,
    label: 'Settings'
  }];
  return /*#__PURE__*/_jsxs("aside", {
    className: "w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col",
    children: [/*#__PURE__*/_jsx("div", {
      className: "p-6 border-b border-gray-200",
      children: /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-2",
        children: [/*#__PURE__*/_jsx("div", {
          className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B4BFF] to-[#7B6EFF] flex items-center justify-center",
          children: /*#__PURE__*/_jsx(Link2, {
            className: "w-5 h-5 text-white"
          })
        }), /*#__PURE__*/_jsx("span", {
          className: "text-xl",
          style: {
            fontFamily: 'Poppins, sans-serif'
          },
          children: "LinkHub"
        })]
      })
    }), /*#__PURE__*/_jsx("nav", {
      className: "flex-1 p-4",
      children: /*#__PURE__*/_jsx("div", {
        className: "space-y-2",
        children: menuItems.map(item => /*#__PURE__*/_jsxs("button", {
          onClick: () => onTabChange(item.id),
          className: `w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-[#5B4BFF] text-white shadow-lg shadow-[#5B4BFF]/20' : 'text-[#555555] hover:bg-gray-100'}`,
          children: [/*#__PURE__*/_jsx(item.icon, {
            className: "w-5 h-5"
          }), /*#__PURE__*/_jsx("span", {
            children: item.label
          })]
        }, item.id))
      })
    }), /*#__PURE__*/_jsx("div", {
      className: "p-4 border-t border-gray-200",
      children: /*#__PURE__*/_jsxs("button", {
        className: "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all",
        children: [/*#__PURE__*/_jsx(LogOut, {
          className: "w-5 h-5"
        }), /*#__PURE__*/_jsx("span", {
          children: "Logout"
        })]
      })
    })]
  });
}