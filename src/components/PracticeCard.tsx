import styled from "@emotion/styled";

export type PracticeCardProps = {
  title: string;
  description: string;
  accentSrc: string;
  tone: "food" | "coffee" | "dessert";
};

const toneBg: Record<PracticeCardProps["tone"], string> = {
  food: "#fff7dc",
  coffee: "#d7ebd6",
  dessert: "#fdddec",
};

const Card = styled.article<{ tone: PracticeCardProps["tone"] }>`
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  padding: 13px 0 0 20px;
  gap: 15px;
  background: ${({ tone }) => toneBg[tone]};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 400;
`;

const Accent = styled.img`
  width: 106px;
  height: 75px;
  object-fit: contain;
  flex-shrink: 0;
  margin: 0;
`;

export function PracticeCard({
  title,
  description,
  accentSrc,
  tone,
}: PracticeCardProps) {
  return (
    <Card tone={tone}>
      <div>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </div>
      <Accent src={accentSrc} alt="" />
    </Card>
  );
}

export default PracticeCard;
