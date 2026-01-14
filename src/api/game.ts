import { request } from "./client";

export type GameRecord = {
  user_id: string;
  menu_id: string;
  score: number;
  date: string;
  id: string;
  user_name: string;
};

export type StartGameResponse = {
  order: {
    id: string;
    menu_id: string;
    game_id: string;
    selection: {
      category: string;
      item: { img: string; name: string };
      topping: null | { group: string; item: { img: string; name: string } }[];
    };
  };
};

export const startGame = (menuId: string) =>
  request<StartGameResponse>("/game/start", {
    method: "POST",
    body: { menu_id: menuId },
  });

export const endGame = (gameId: string) =>
  request<{ game_id: string; score: number }>("/game/end", {
    method: "POST",
    body: { game_id: gameId },
  });

export const getMyGames = (limit?: number) => {
  const query = typeof limit === "number" ? `?limit=${limit}` : "";
  return request<GameRecord[]>(`/game/${query}`);
};

export const getTopGames = (limit = 10) =>
  request<GameRecord[]>(`/game/top?limit=${limit}`);

export const getBestGame = () => request<GameRecord>("/game/best");
