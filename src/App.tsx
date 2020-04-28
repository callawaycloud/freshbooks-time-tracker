import React from 'react';
import { Card, Layout } from 'antd';
import {ClockCircleOutlined} from '@ant-design/icons'
import './App.css';

function App() {
  return (
    <Layout>
      <Layout.Content>
        <Card title="Freshbook's Time Tracker">
          <ClockCircleOutlined /> Hello World
        </Card>
      </Layout.Content>
    </Layout>
  );
}

export default App;
