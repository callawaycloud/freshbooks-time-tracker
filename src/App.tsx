import React from "react";
import { Card, Layout } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import "./App.css";
import { TimeEntryCard } from "./components/TimeEntryCard";

function App() {
  return (
    <Layout>
      <Layout.Content>
        <Card title="Freshbook's Time Tracker">
          <ClockCircleOutlined /> Hello World
          <TimeEntryCard countStart={2} active={false} />
          <TimeEntryCard countStart={60} active={true} />
        </Card>
      </Layout.Content>
    </Layout>
  );
}

export default App;
