import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NeedsAttentionHeader,
  NeedsAttentionFilterPills,
  AttentionSectionCard,
} from './components';
import {
  ATTENTION_FILTER_PILLS,
  ATTENTION_SECTIONS,
} from './mockData';
import {
  AttentionFilterType,
  AttentionItem,
  AttentionSectionGroup,
} from './types';

export interface NeedsAttentionScreenProps {
  initialFilter?: AttentionFilterType;
  onBack?: () => void;
  onItemPress?: (item: AttentionItem) => void;
  onRemindPress?: (item: AttentionItem) => void;
}

const NeedsAttentionScreen: React.FC<NeedsAttentionScreenProps> = ({
  initialFilter = 'all',
  onBack,
  onItemPress,
  onRemindPress,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<AttentionFilterType>(initialFilter);

  // Filter sections based on selected pill
  const filteredSections = useMemo<AttentionSectionGroup[]>(() => {
    if (selectedFilter === 'all') {
      return ATTENTION_SECTIONS;
    }
    return ATTENTION_SECTIONS.filter((sec) => sec.key === selectedFilter);
  }, [selectedFilter]);

  const handleRemind = useCallback(
    (item: AttentionItem) => {
      if (onRemindPress) {
        onRemindPress(item);
      } else {
        Alert.alert(
          'Reminder Sent',
          `Notification sent to ${item.assignee || 'member'} for "${item.title}".`
        );
      }
    },
    [onRemindPress]
  );

  const handleItemPress = useCallback(
    (item: AttentionItem) => {
      if (onItemPress) {
        onItemPress(item);
      } else {
        Alert.alert(item.title, item.subtitle);
      }
    },
    [onItemPress]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <NeedsAttentionHeader onBackPress={onBack} />

      {/* Filter Horizontal Pills */}
      <NeedsAttentionFilterPills
        pills={ATTENTION_FILTER_PILLS}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* Scrollable Attention Sections */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.map((section) => (
          <AttentionSectionCard
            key={section.key}
            section={section}
            onItemPress={handleItemPress}
            onRemindPress={handleRemind}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

export default NeedsAttentionScreen;
