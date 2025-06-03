import React from 'react';
import { Collapse, theme } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import styles from '../Styles/Itinerary.module.css';

export default function DayData({ daysData = [] }) {
  const { token } = theme.useToken();

  if (!daysData.length) return null;

  const sortedDaysData = [...daysData].sort((a, b) => a.day_number - b.day_number);

  const panelStyle = {
    marginBottom: '1.5rem',
    background: '#cbc9c7',
    borderRadius: token.borderRadiusLG,
    border: 'none',
    fontFamily: '"Quicksand", sans-serif',
    textTransform: 'uppercase',
  };

  const items = sortedDaysData.map((day) => ({
    key: `day-${day.day_number}`,
    label: `DAY ${day.day_number}: ${day.heading}`,
    children: <p className={styles.dayActivity}>{day.activity}</p>,
    style: panelStyle,
    className: styles.dayPanel,
  }));

  return (
    <div className={styles.dayDataContainer}>
      <Collapse
        bordered={false}
        defaultActiveKey={['day-1']}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        style={{ background: '#0000' }}
        items={items}
      />
    </div>
  );
}