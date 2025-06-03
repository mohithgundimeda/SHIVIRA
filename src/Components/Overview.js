import React from 'react';
import { Avatar, List } from 'antd';
import styles from '../Styles/Itinerary.module.css';

export default function Overview({ overview = null, highlights = [], note = [] }) {
  const isNoteTab = note.length > 0 && !overview && !highlights.length;

  return (
    <div className={styles.overviewContainer}>
      {!isNoteTab && overview && (
        <div className={styles.overviewText}>
          <p>{overview}</p>
        </div>
      )}

      {!isNoteTab && highlights.length > 0 && (
        <div className={ styles.highlightsSection}>
          <h4 className={styles.highlightsHeading}>Highlights</h4>
          <List
            itemLayout="horizontal"
            dataSource={highlights}
            className={styles.List}
            renderItem={(item, index) => (
              <List.Item key={`highlight-${index}`} className={styles.highlightItem}>
                <List.Item.Meta
                  avatar={<Avatar src="/static/logo4.png" />}
                  description={item}
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {isNoteTab && note.length > 0 && (
        <div className={styles.highlightsSection}>
          <h4 className={styles.highlightsHeading}>Note</h4>
          <List
            itemLayout="horizontal"
            dataSource={note}
            className={styles.List}
            renderItem={(item, index) => (
              <List.Item key={`note-${index}`} className={styles.highlightItem}>
                <List.Item.Meta
                  avatar={<Avatar src="/static/logo4.png" />}
                  description={item}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}