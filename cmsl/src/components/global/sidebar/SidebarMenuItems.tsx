import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { SidebarIcons } from "../../../constants/image-constant";
import type { SidebarIconKey } from "../../../constants/image-constant";


interface Props {
  isExpanded: boolean;
}

const menuItems: { label: string; iconKey: SidebarIconKey; path: string }[] = [
  { label: "Home", iconKey: "home", path: "/" },
  { label: "Transaction", iconKey: "transaction", path: "/transaction" },
  { label: "Book Store", iconKey: "bookStore", path: "/book-store" },
];

const SidebarMenuItems = ({ isExpanded }: Props) => {
  const location = useLocation();

  return (
    <ul className="mt-24 space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const iconSrc = isActive
          ? SidebarIcons[item.iconKey].black
          : SidebarIcons[item.iconKey].white;

        return (
          <li key={item.label}>
            <Link to={item.path}>
              <div
                className={`flex items-center px-2 py-2 rounded-md mx-2 transition-colors duration-200 ${
                  isActive
                    ? "bg-[#E5E5E5] text-black"
                    : "text-white hover:bg-[#27272A]"
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <motion.img
                    key={iconSrc}
                    src={iconSrc}
                    alt={item.label}
                    className="w-5 h-5 object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <motion.div
                  className="ml-3 overflow-hidden"
                  initial={false}
                  animate={{ width: isExpanded ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className={`block whitespace-nowrap transition-opacity duration-300 ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarMenuItems;
