import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import RankingList from "../components/RankingList";
import PracticeCard from "../components/PracticeCard";
import type { RankingEntry } from "../components/RankingList";
import type { PracticeCardProps } from "../components/PracticeCard";
import { getBestGame, getTopGames } from "../api/game";
import { getMenuSummary } from "../api/menu";
import { useNavigate } from "react-router-dom";

const fallbackPractices: PracticeCardProps[] = [
  {
    title: "음식점 주문기",
    description:
      "햄버거, 중식집 등 다양한 음식점의 주문기를 연습해볼 수 있어요! 상급자 추천",
    accentSrc: "/food1.png",
    tone: "food",
  },
  {
    title: "커피숍 주문기",
    description: "커피숍 주문기를 연습해볼 수 있어요! 난이도 중급자 추천",
    accentSrc: "/food2.png",
    tone: "coffee",
  },
  {
    title: "아이스크림 주문기",
    description: "아이스크림 주문기를 연습해볼 수 있어요! 초보자 추천!!",
    accentSrc: "/food3.png",
    tone: "dessert",
  },
];

const AppShell = styled.div`
  min-height: 100vh;
  padding: 28px 18px 48px;
  background: #ffffff;
`;

const Screen = styled.main`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ScoreSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 30px;
  font-weight: 700;
`;

const ScoreTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
`;

const Crown = styled.span``;

const ScoreValue = styled.div``;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-weight: 400;
  font-size: 20px;
`;

const CtaSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Highlight = styled.p`
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  line-height: 1.6;
`;

const SectionTitle = styled.p`
  margin: 2px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
`;

const PracticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Span = styled.span`
  font-weight: 700;
`;

const CardLink = styled.button`
  text-decoration: none;
  color: inherit;
  border: none;
  padding: 0;
  background: transparent;
  text-align: left;
`;

function Home() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [practiceItems, setPracticeItems] =
    useState<
      (PracticeCardProps & {
        menuId?: string;
      })[]
    >(fallbackPractices);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getTopGames(3);
        if (!mounted) return;
        const mapped = data.slice(0, 3).map((entry, index) => ({
          rank: index + 1,
          name: entry.user_name,
          score: entry.score,
        }));
        setRankings(mapped);
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
        const data = await getBestGame();
        if (!mounted) return;
        setBestScore(data.score);
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
        const data = await getMenuSummary(3);
        if (!mounted) return;
        const mapped = data.slice(0, 3).map((item, index) => ({
          ...fallbackPractices[index],
          title: item.name,
          description: item.description,
          menuId: item.id,
        }));
        if (mapped.length > 0) setPracticeItems(mapped);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const firstVisuals = practiceItems[0];
  const secondVisuals = practiceItems[1];

  return (
    <AppShell>
      <Screen>
        <ScoreSection>
          <ScoreHeader>
            <ScoreTitle>
              <Title>최고기록</Title>
              <Crown aria-hidden>{"\uD83D\uDC51"}</Crown>
            </ScoreTitle>
            <ScoreValue>{bestScore}점</ScoreValue>
          </ScoreHeader>
          <Subtitle>
            현재 <Span>랭킹</Span>이에요! {"\uD83D\uDD25"}
          </Subtitle>
          <RankingList entries={rankings} />
        </ScoreSection>

        <CtaSection>
          <Highlight>
            혼자서도 충분히 할 수 있습니다!
            <br />
            <strong>
              나홀로 주문과 함께 주문기를 익혀보세요 {"\uD83E\uDD80"}
            </strong>
          </Highlight>
          <SectionTitle>주문기를 연습해보세요!</SectionTitle>
          <PracticeList>
            {practiceItems.slice(0, 3).map((item, index) => {
              const accentSrc =
                index === 0 && secondVisuals
                  ? secondVisuals.accentSrc
                  : index === 1 && firstVisuals
                    ? firstVisuals.accentSrc
                    : item.accentSrc;
              const tone =
                index === 0 && secondVisuals
                  ? secondVisuals.tone
                  : index === 1 && firstVisuals
                    ? firstVisuals.tone
                    : item.tone;
              return (
                <CardLink
                  key={item.menuId ?? `${item.title}-${index}`}
                  type="button"
                  onClick={() =>
                    navigate("/kiosk", { state: { menuId: item.menuId } })
                  }
                >
                  <PracticeCard {...item} accentSrc={accentSrc} tone={tone} />
                </CardLink>
              );
            })}
          </PracticeList>
        </CtaSection>
      </Screen>
    </AppShell>
  );
}

export default Home;
