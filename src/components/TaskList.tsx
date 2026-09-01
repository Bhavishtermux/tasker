import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, TaskSectionData } from '../types/task';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useAppTheme } from '../context/ThemeContext';

interface TaskListProps {
  sections: TaskSectionData[];
  onPressTask: (task: Task) => void;
  isSearchActive?: boolean;
  searchQuery?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  sections,
  onPressTask,
  isSearchActive = false,
  searchQuery = '',
  isRefreshing = false,
  onRefresh,
}) => {
  const { colors } = useAppTheme();

  const renderSectionHeader = ({
    section,
  }: {
    section: TaskSectionData;
  }) => {
    const getHeaderDetails = () => {
      switch (section.type) {
        case 'morning':
          return { icon: 'weather-sunset-up', label: 'Morning' };
        case 'afternoon':
          return { icon: 'white-balance-sunny', label: 'Afternoon' };
        case 'evening':
          return { icon: 'weather-night', label: 'Evening' };
        case 'overdue':
          return { icon: 'alert-circle-outline', label: 'Overdue' };
        case 'today':
          return { icon: 'calendar-today', label: 'Today' };
        case 'tomorrow':
          return { icon: 'calendar-arrow-right', label: 'Tomorrow' };
        case 'upcoming':
          return { icon: 'calendar-clock', label: 'Upcoming' };
        case 'completed':
          return { icon: 'check-all', label: 'Completed' };
        default:
          return { icon: 'format-list-bulleted', label: section.title };
      }
    };

    const header = getHeaderDetails();

    return (
      <View
        style={[
          styles.sectionHeaderContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons
            name={header.icon as any}
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary },
            ]}
          >
            {header.label}
          </Text>
        </View>
      </View>
    );
  };

  if (sections.length === 0) {
    return (
      <EmptyState isSearch={isSearchActive} searchQuery={searchQuery} />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskItem task={item} onPress={() => onPressTask(item)} />
      )}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.text]}
            tintColor={colors.text}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 96,
    paddingTop: 4,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
