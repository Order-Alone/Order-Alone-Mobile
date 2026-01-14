import styled from "@emotion/styled";

export type RankingEntry = {
  rank: number;
  name: string;
  score: number;
};

type Props = {
  entries: RankingEntry[];
};

const Card = styled.div`
  background: #d9f3c9;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 6px 16px rgba(66, 141, 40, 0.12);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #d9f3c9;
  border-radius: 12px;
  padding: 10px 8px;
  font-weight: 700;
  color: #0f172a;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Rank = styled.span`
  width: 38px;
  text-align: left;
`;

const Name = styled.span`
  font-weight: 600;
  color: #0f172a;
`;

const Score = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

export function RankingList({ entries }: Props) {
  return (
    <Card>
      {entries.map((entry) => (
        <Row key={entry.rank}>
          <Left>
            <Rank>{entry.rank}위</Rank>
            <Name>{entry.name}</Name>
          </Left>
          <Score>{entry.score.toLocaleString()}점</Score>
        </Row>
      ))}
    </Card>
  );
}

export default RankingList;
