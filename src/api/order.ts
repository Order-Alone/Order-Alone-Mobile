import { request } from "./client";

export type OrderItem = {
  img: string;
  name: string;
};

export type OrderSelection = {
  category: string;
  item: OrderItem;
  topping: null | { group: string; item: OrderItem }[];
};

export type OrderRecord = {
  menu_id: string;
  game_id: string;
  menu_name: string;
  menu_description: string;
  level: number;
  selection: OrderSelection;
  created_at: string;
  id: string;
};

export type ScoreOrderResponse = {
  order_id: string;
  correct: boolean;
  expected: {
    category: string;
    menu_name: string;
    topping_names: string[];
  };
};

export const getOrdersByGame = (gameId: string, limit = 100) =>
  request<OrderRecord[]>(`/order/game/${gameId}?limit=${limit}`);

export const scoreOrder = (payload: {
  order_id: string;
  game_id: string;
  category: string;
  menu_name: string;
  topping_names: string[];
}) =>
  request<ScoreOrderResponse>("/order/score", {
    method: "POST",
    body: payload,
  });

export const requestNextOrder = (gameId: string) =>
  request<OrderRecord>("/order", {
    method: "POST",
    body: { game_id: gameId },
  });
