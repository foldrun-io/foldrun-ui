"use client";

// Radix menus, selects and sliders do not read the page's direction by
// themselves: without this they open left-to-right on a right-to-left page.
// Render it once around the app, with the same value as `<html dir>`.
//
//   <DirectionProvider dir="rtl">{children}</DirectionProvider>

import { Direction } from "radix-ui";

export const DirectionProvider = Direction.Provider;
export const useDirection = Direction.useDirection;
