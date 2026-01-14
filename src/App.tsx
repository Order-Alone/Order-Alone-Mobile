import { Global, css } from "@emotion/react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
import Result from "./pages/Result";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <>
      <Global
        styles={css`
          @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

          :root {
            font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo",
              "Segoe UI", system-ui, -apple-system, sans-serif;
            font-size: 20px;
            line-height: 1.5;
            font-weight: 400;
            color: #0f172a;
            background-color: #ffffff;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #ffffff;
            min-height: 100vh;
            -webkit-tap-highlight-color: transparent;
          }

          #root {
            min-height: 100vh;
          }
        `}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </>
  );
}

export default App;
