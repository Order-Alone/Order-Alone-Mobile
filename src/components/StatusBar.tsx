import styled from "@emotion/styled";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #0b0b0f;
  padding: 12px 12px 6px;
`;

const Time = styled.span`
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Signal = styled.span`
  display: inline-flex;
  gap: 2px;
  & > span {
    display: block;
    width: 3px;
    border-radius: 2px;
    background: #0b0b0f;
  }
  & > span:nth-of-type(1) {
    height: 6px;
  }
  & > span:nth-of-type(2) {
    height: 8px;
  }
  & > span:nth-of-type(3) {
    height: 10px;
  }
`;

const Wifi = styled.span`
  width: 14px;
  height: 10px;
  border: 2px solid #0b0b0f;
  border-radius: 50% 50% 0 0;
  border-bottom: 0;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background: #0b0b0f;
    border-radius: 50%;
  }
`;

const Battery = styled.span`
  width: 22px;
  height: 11px;
  border: 1.8px solid #0b0b0f;
  border-radius: 3px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 1px;
  &::after {
    content: "";
    position: absolute;
    right: -3px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 6px;
    border-radius: 1px;
    background: #0b0b0f;
  }
`;

const BatteryLevel = styled.span`
  display: block;
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #0b0b0f, #1f2937);
  border-radius: 2px;
`;

export function StatusBar() {
  return (
    <Bar>
      <Time>9:41</Time>
      <Icons aria-hidden>
        <Signal>
          <span />
          <span />
          <span />
        </Signal>
        <Wifi />
        <Battery>
          <BatteryLevel />
        </Battery>
      </Icons>
    </Bar>
  );
}

export default StatusBar;
