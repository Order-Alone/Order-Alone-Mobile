import { useState } from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";

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

const TopSpacer = styled.div`
  height: 36px;
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

const SecondaryLink = styled(Link)`
  display: inline-flex;
  width: 100%;
  height: 56px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background: #d7fbbf;
  color: #2f6f1a;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
`;

function Login() {
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!accountId || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login({ accountId, password });
      navigate("/home");
    } catch (err) {
      setError("로그인에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <Screen>
        <TopSpacer />
        <Mascot src="/logo.svg" alt="" aria-hidden />
        <form onSubmit={handleSubmit}>
          <InputGroup>
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
            로그인
          </PrimaryButton>
        </form>
        <SecondaryLink to="/signup">회원가입</SecondaryLink>
      </Screen>
    </AppShell>
  );
}

export default Login;
