import { useState } from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";

const AppShell = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  background-image: url("/배경.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Screen = styled.main`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 28px 20px 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const BackIcon = styled.img`
  width: 26px;
  height: 26px;
`;

const Mascot = styled.img`
  width: 140px;
  height: 140px;
  object-fit: contain;
  align-self: center;
  margin: 6px 0 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Input = styled.input`
  width: 100%;
  height: 54px;
  border-radius: 12px;
  border: 2px solid #72b04b;
  padding: 0 14px;
  font-size: 20px;
  outline: none;
  background: #ffffff;

  ::placeholder {
    color: #9ca3af;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #ef4444;
  font-weight: 600;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #2f8f0e;
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  margin-top: 18px;

  &:disabled {
    background: #c7d7c0;
    color: #eef2e6;
  }
`;

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!name || !accountId || !password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await signup({ name, accountId, password });
      navigate("/");
    } catch (err) {
      setError("회원가입에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <Screen>
        <BackLink to="/" aria-label="뒤로가기">
          <BackIcon src="/back.svg" alt="" aria-hidden />
        </BackLink>
        <Mascot src="/logo.svg" alt="" aria-hidden />
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              placeholder="아이디를 입력해주세요"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            />
            <Input
              placeholder="비밀번호를 입력해주세요"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </InputGroup>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            회원가입
          </PrimaryButton>
        </form>
      </Screen>
    </AppShell>
  );
}

export default Signup;
