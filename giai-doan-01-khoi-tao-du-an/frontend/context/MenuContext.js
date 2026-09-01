"use client";

import { createContext, useContext } from "react";

export const MenuContext = createContext({ openMenu: () => {} });

export function useMenu() {
  return useContext(MenuContext);
}
