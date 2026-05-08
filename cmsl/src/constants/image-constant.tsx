// image-constant.ts
import BookW from "../assets/sidebarIcons/books-piled-w.png";
import BookB from "../assets/sidebarIcons/books-piled-b.png";
import TransactionW from "../assets/sidebarIcons/recent-w.png";
import TransactionB from "../assets/sidebarIcons/recent-b.png";
import HomeW from "../assets/sidebarIcons/home-w.png";
import HomeB from "../assets/sidebarIcons/home-b.png";
import Checkout from "../assets/navicons/return-box.png";
import Store from "../assets/navicons/store.png";
import Profile from "../assets/navicons/profile.png";

export const SidebarIcons = {
  home: {
    white: HomeW,
    black: HomeB,
  },
  transaction: {
    white: TransactionW,
    black: TransactionB,
  },
  bookStore: {
    white: BookW,
    black: BookB,
  },
} as const;

export type SidebarIconKey = keyof typeof SidebarIcons;

export const NavbarIcons = {
  profile: Profile,
  store: Store, 
  checkout: Checkout,
} as const;

export type NavbarIconKey = keyof typeof NavbarIcons;
