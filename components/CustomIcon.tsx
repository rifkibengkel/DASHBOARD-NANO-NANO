import React from 'react';
import {
  QuestionOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  InboxOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  AimOutlined,
  TagOutlined,
  HeatMapOutlined,
  CrownOutlined,
  TrophyOutlined,
  BarChartOutlined
} from '@ant-design/icons';

interface IconSelectorProps {
  type: string;
}

const IconSelector: React.FC<IconSelectorProps> = (props: IconSelectorProps) => {
  const Icons = {
    QuestionOutlined: <QuestionOutlined />,
    DashboardOutlined: <DashboardOutlined />,
    SettingOutlined: <SettingOutlined />,
    LogoutOutlined: <LogoutOutlined />,
    InboxOutlined: <InboxOutlined />,
    UnorderedListOutlined: <UnorderedListOutlined />,
    TeamOutlined: <TeamOutlined />,
    LineChartOutlined: <LineChartOutlined />,
    PieChartOutlined: <PieChartOutlined />,
    CloseCircleOutlined: <CloseCircleOutlined />,
    CheckCircleOutlined: <CheckCircleOutlined />,
    AimOutlined: <AimOutlined />,
    TagOutlined: <TagOutlined />,
    HeatMapOutlined: <HeatMapOutlined />,
    CrownOutlined : <CrownOutlined />,
    TrophyOutlined: <TrophyOutlined />,
    BarChartOutlined: <BarChartOutlined />
  };

  const getIcon = (type: string) => {
    // Default Icon when not found
    let comp = <QuestionOutlined />;

    let typeNew = type ? type : "";

    // Default is Outlined when no theme was appended (ex: 'smile')
    if (!typeNew.match(/.+(Outlined|Filled|TwoTone)$/i)) {
      typeNew += 'Outlined';
    }

    // If found by key then return value which is component
    const found = Object.entries(Icons).find(([k]) => k.toLowerCase() === typeNew.toLowerCase());
    if (found) {
      [, comp] = found;
    }

    return comp;
  };

  return getIcon(props.type);
};

export default IconSelector;