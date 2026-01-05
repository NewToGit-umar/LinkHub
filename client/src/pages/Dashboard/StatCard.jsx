import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  gradient,
}) => {
  const gradientClasses = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500",
  };

  const shadowClasses = {
    blue: "shadow-blue-500/30",
    green: "shadow-green-500/30",
    purple: "shadow-purple-500/30",
    orange: "shadow-orange-500/30",
  };

  const bgClasses = {
    blue: "from-blue-50 to-indigo-50",
    green: "from-green-50 to-emerald-50",
    purple: "from-purple-50 to-pink-50",
    orange: "from-orange-50 to-red-50",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-indigo-600 transition-colors">
            {value}
          </p>
          {trend && (
            <div
              className={`inline-flex items-center mt-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                trend.isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              <span>{trend.value}% from last month</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${
            gradient || gradientClasses[color]
          } shadow-lg ${
            shadowClasses[color]
          } group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
