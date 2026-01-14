import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";
import { getBestGame, getMyGames } from "../api/game";
import { getOrdersByGame } from "../api/order";
import type { GameRecord } from "../api/game";
import type { OrderRecord } from "../api/order";

type BestScore = {
  score: number;
  date: string;
};

type ResultState = {
  score: number;
  bestScores?: BestScore[];
  successOrders?: string[];
  gameId?: string | null;
};

const AppShell = styled.div`
  min-height: 100vh;
  padding: 24px 16px 40px;
  background: #ffffff;
`;

const Screen = styled.main`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 26px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #94a3b8;
  font-weight: 600;
`;

const ScoreCard = styled.section`
  background: #f3f4f6;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ScoreRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  padding: 10px 12px;
  background: ${({ highlight }) => (highlight ? "#d7fbbf" : "#ffffff")};
`;

const ScoreValue = styled.div`
  font-weight: 700;
`;

const ScoreDate = styled.div`
  color: #94a3b8;
  font-weight: 600;
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 700;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OrderItem = styled.div`
  background: #d7fbbf;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 600;
`;

const HomeButton = styled.button`
  margin-top: auto;
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  background: #2f8f0e;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(2, 10).replace(/-/g, ".");
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const mapOrderLabel = (order: OrderRecord) => {
  const base = order.selection.item.name;
  const toppings = order.selection.topping ?? [];
  if (toppings.length === 0) return base;
  return `${base} (${toppings.map((item) => item.item.name).join("/")})`;
};

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | undefined;
  const [bestGame, setBestGame] = useState<BestScore | null>(null);
  const [myGames, setMyGames] = useState<GameRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getBestGame();
        if (!mounted) return;
        setBestGame({ score: data.score, date: formatDate(data.date) });
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getMyGames();
        if (!mounted) return;
        setMyGames(data);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const gameId = state?.gameId;
    if (!gameId) return;
    let mounted = true;
    const load = async () => {
      try {
        const data = await getOrdersByGame(gameId, 100);
        if (!mounted) return;
        setOrders(data);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [state?.gameId]);

  const bestScores = useMemo(() => {
    if (myGames.length > 0) {
      return [...myGames]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((entry) => ({
          score: entry.score,
          date: formatDate(entry.date),
        }));
    }
    if (state?.bestScores) return state.bestScores.slice(0, 5);
    if (bestGame) {
      return [bestGame];
    }
    return [
      { score: 9999, date: "25.06.18" },
      { score: 9999, date: "25.06.18" },
      { score: 7942, date: "25.10.28" },
      { score: 1, date: "25.06.18" },
      { score: 1, date: "25.06.18" },
    ];
  }, [myGames, state?.bestScores, bestGame]);

  const currentScore = state?.score ?? bestScores[0]?.score ?? 0;
  const successOrders = orders.length
    ? orders.map(mapOrderLabel)
    : state?.successOrders && state.successOrders.length > 0
      ? state.successOrders
      : [];

  return (
    <AppShell>
      <Screen>
        <Title>게임 종료</Title>
        <Subtitle>성공적인 주문입니다!!</Subtitle>

        <ScoreCard>
          {bestScores.map((entry, index) => (
            <ScoreRow
              key={`${entry.score}-${entry.date}-${index}`}
              highlight={entry.score === currentScore}
            >
              <ScoreValue>{entry.score}점</ScoreValue>
              <ScoreDate>{entry.date}</ScoreDate>
            </ScoreRow>
          ))}
        </ScoreCard>

        <SectionTitle>성공한 주문</SectionTitle>
        {successOrders.length > 0 ? (
          <OrderList>
            {successOrders.map((order, index) => (
              <OrderItem key={`${order}-${index}`}>{order}</OrderItem>
            ))}
          </OrderList>
        ) : (
          <OrderItem>성공한 주문이 없습니다</OrderItem>
        )}

        <HomeButton onClick={() => navigate("/home")}>
          홈으로 돌아가기
        </HomeButton>
      </Screen>
    </AppShell>
  );
}

export default Result;
