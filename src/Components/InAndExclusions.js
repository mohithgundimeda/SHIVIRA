import React from 'react';
import { Flex, Splitter, List, Avatar, Typography } from 'antd';
import styles from '../Styles/Itinerary.module.css';
import { useIsMobile } from './useIsMobile';

const InAndExclusions = ({ inclusions = [], exclusions = [] }) => {
  const isMobile = useIsMobile();

  if (!inclusions.length && !exclusions.length) {
    return <div />;
  }

  const renderList = (data, title) => (
    <Flex vertical className={styles.listContainer}>
      <Typography.Title level={4} className={styles.listHeading}>
        {title}
      </Typography.Title>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item key={index} className={styles.listItem}>
            <List.Item.Meta
              avatar={<Avatar src="/static/logo4.png" />}
              description={item}
            />
          </List.Item>
        )}
      />
    </Flex>
  );

  if (isMobile) {
    return (
      <div className={styles.inExContainer}>
        <Flex vertical gap="large">
          {inclusions.length > 0 && renderList(inclusions, 'Inclusions')}
          {exclusions.length > 0 && renderList(exclusions, 'Exclusions')}
        </Flex>
      </div>
    );
  }

  return (
    <div className={styles.inExContainer}>
      <Splitter >
        <Splitter.Panel resizable={false} collapsible min="40%" defaultSize="50%">
          {renderList(inclusions, 'Inclusions')}
        </Splitter.Panel>
        <Splitter.Panel resizable={false} collapsible min="40%">
          {renderList(exclusions, 'Exclusions')}
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};

export default InAndExclusions;