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
    const isOverdue = section.type === 'overdue';
    const isCompleted = section.type === 'completed';

    const getHeaderIcon = () => {
      switch (section.type) {
        case 'overdue':
          return 'alert-circle-outline';
        case 'today':
          return 'calendar-today';
        case 'tomorrow':
          return 'calendar-arrow-right';
        case 'upcoming':
          return 'calendar-clock';
        case 'completed':
          return 'check-all';
        default:
          return 'calendar';
      }
    };

    return (
      <View
        style={[
          styles.sectionHeaderContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons
            name={getHeaderIcon()}
            size={14}
            color={
              isOverdue
                ? colors.danger
                : isCompleted
                ? colors.success
                : colors.primary
            }
          />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isOverdue
                  ? colors.danger
                  : isCompleted
                  ? colors.textSecondary
                  : colors.text,
              },
            ]}
          >
            {section.title}
          </Text>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: isOverdue
                  ? colors.importantBadge
                  : colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.countText,
                {
                  color: isOverdue ? colors.danger : colors.textSecondary,
                },
              ]}
            >
              {section.data.length}
            </Text>
          </View>
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
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
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
    gap: 7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
