import { request } from "./client";

export type MenuSummary = {
  id: string;
  name: string;
  description: string;
};

export type MenuItem = { name: string; img: string };
export type ToppingGroup = { name: string; items: MenuItem[] };

export type MenuCategory = {
  kategorie: string;
  menus: MenuItem[];
  toping: ToppingGroup[];
};

export type MenuDetail = {
  id: string;
  name: string;
  description: string;
  level: number;
  data: MenuCategory[];
};

export const getMenuSummary = (limit = 100) =>
  request<MenuSummary[]>(`/menu/summary?limit=${limit}`);

export const getMenuDetail = (menuId: string) =>
  request<MenuDetail>(`/menu/${menuId}`);