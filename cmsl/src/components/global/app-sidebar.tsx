import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import SidebarMenuItems from "../global/sidebar/SidebarMenuItems";

const AppSidebar = () => {
  const [open, setOpen] = useState(true);
  const [hoverOpen, setHoverOpen] = useState(false);

  const isExpanded = open || hoverOpen;

  return (
    <div
      className={`relative h-screen overflow-hidden bg-[#171717] border-r border-[#27272A] transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => {
        if (!open) setHoverOpen(true);
      }}
      onMouseLeave={() => {
        if (!open) setHoverOpen(false);
      }}
    >
      {/* Top-left toggle button */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={() => setOpen(!open)}
          className="text-white p-2 rounded hover:bg-[#27272A] transition-colors"
        >
          <motion.div
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.div>
        </button>
      </div>

      {/* Menu items */}
   <div className="mt-14 overflow-y-auto h-[calc(100vh-56px)]">
  <SidebarMenuItems isExpanded={isExpanded} />
</div>
    </div>
  );
};

export default AppSidebar;
