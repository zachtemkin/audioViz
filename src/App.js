import React from "react";
import styled from "styled-components";
import Visualizer from "./components/visualizer";

const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: #333;
`;

function App() {
  return (
    <Page>
      <Visualizer />
    </Page>
  );
}

export default App;
