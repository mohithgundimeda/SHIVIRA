import { Tabs } from 'antd';
import React, { useMemo } from 'react';
import styles from '../Styles/Itinerary.module.css';
import Overview from './Overview.js';
import DayData from './DayData.js';
import InAndExclusions from './InAndExclusions.js';
import TAndC from './TAndC.js';
import { useIsMobile } from './useIsMobile.js';

export default function Tabscomponent({ overview, highlights, daysData, inclusions, exclusions, note }) {
  const isMobile = useIsMobile();

  const sections = useMemo(() => [
    overview || highlights?.length ? 'OVERVIEW' : null,
    daysData?.length ? 'ITINERARY' : null,
    inclusions?.length || exclusions?.length ? 'INCLUSIONS & EXCLUSIONS' : null,
    note?.length ? 'NOTE' : null,
    'TERMS & CONDITIONS',
  ].filter(Boolean), [overview, highlights, daysData, inclusions, exclusions, note]);

  const renderTabContent = (section) => {
    switch (section) {
      case 'OVERVIEW':
        return <Overview overview={overview} highlights={highlights || []} />;
      case 'ITINERARY':
        return <DayData daysData={daysData || []} />;
      case 'INCLUSIONS & EXCLUSIONS':
        return <InAndExclusions inclusions={inclusions || []} exclusions={exclusions || []} />;
      case 'NOTE':
        return <Overview note={note || []} />;
      case 'TERMS & CONDITIONS':
        return <TAndC/>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.tabsContainer} style={{ width: isMobile ? '100%' : '80%' }}>
      <Tabs
        tabPosition={isMobile ? 'top' : 'left'}
        size="small"
        tabBarGutter={isMobile ? 15 : 20}
        items={sections.map((section, index) => ({
          label: (
            <span style={{ fontSize: isMobile ? '11px' : undefined }}>
              {section}
            </span>
          ),
          key: String(index),
          children: renderTabContent(section),
        }))}
      />
    </div>
  );
}