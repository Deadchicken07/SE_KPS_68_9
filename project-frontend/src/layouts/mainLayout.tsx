import React, { useState } from 'react';
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import Test from "../components/login/Home";


const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('หน้าหลัก', 'main', <PieChartOutlined />),
  getItem('ทำเเบบทดสอบ', 'exam', <UserOutlined />, [
    getItem('เเบบทดสอบที่1', 'exam1'),
    getItem('เเบบทดสอบที่2', 'exam2'),
  ]),
  getItem('บุคคลากร', 'staff', <UserOutlined />, [
    getItem('จิตเเพทย์', 'psychiatrist'),
    getItem('นักจิตวิทยา', 'psychology'),
    getItem('เภสัชกร', 'phamacy'),
  ]),
  getItem('นัดหมายเเพทย์', 'appointment', <DesktopOutlined />),
  getItem('ติดต่อเรา', 'contact', <DesktopOutlined />),
];

const       App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{padding: 16}}>
          <div style={{color: "#fff", fontSize: 28 ,}}>
            Mauga
          </div>
          <div style={{color: "#fff", fontSize: 16 ,}}>
            คลินิกปัญหาสุขภาพจิต
          </div>
        </div>
        <Menu theme="dark" defaultSelectedKeys={['main']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background:"#001529" }}>
          {/* <div style={{padding: 16, justifyContent: 'end'}}>
              <div style={{fontSize: 24 , color: '#fff' }}>
                Hello
              </div>
          </div> */}
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            Bill is a cat.
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;