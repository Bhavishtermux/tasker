import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task, Subtask } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { formatTime12Hour, formatCompletedAt } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { colors, isDark } = useAppTheme();
  const { toggleTaskCompletion, toggleSubtask } = useTasks();
  const [scaleValue] = useState(new Animated.Value(1));
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggleTaskCompletion(task.id);
  };

  const handleSubtaskToggle = (subtask: Subtask) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    toggleSubtask(task.id, subtask.id);
  };

  // Determine duration or time badge label
  const durationBadge =
    task.estimatedMinutes !== undefined && task.estimatedMinutes > 0
      ? `${task.estimatedMinutes} min`
      : task.dueTime && !task.isAllDay
      ? formatTime12Hour(task.dueTime)
      : null;

  // Format category tag e.g. "@coinbase: "
  const hasCategoryTag = !!task.category && task.category.trim().length > 0;
  const categoryTag = hasCategoryTag
    ? task.category.startsWith('@')
      ? `${task.category}: `
      : `@${task.category}: `
    : '';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Pressable
        style={styles.mainPressable}
        onPress={onPress}
        android_ripple={{ color: colors.surfaceVariant }}
      >
        {/* Rounded Squircle Checkbox */}
        <TouchableOpacity
          style={styles.checkboxTouch}
          onPress={handleToggle}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.checkbox,
              {
                borderColor: task.isCompleted
                  ? colors.text
                  : colors.checkboxBorder,
                backgroundColor: task.isCompleted
                  ? colors.text
                  : 'transparent',
                transform: [{ scale: scaleValue }],
              },
            ]}
          >
            {task.isCompleted && (
              <MaterialCommunityIcons
                name="check"
                size={14}
                color={colors.background}
              />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Task Content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.titleText,
              {
                color: task.isCompleted ? colors.textMuted : colors.text,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {categoryTag ? (
              <Text
                style={[
                  styles.tagText,
                  {
                    color: task.isCompleted ? colors.textMuted : colors.text,
                    fontWeight: '700',
                  },
                ]}
              >
                {categoryTag}
              </Text>
            ) : null}
            {task.title}
          </Text>

          {/* Optional notes preview */}
          {!!task.notes && !task.isCompleted && (
            <Text
              style={[styles.notesText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {task.notes}
            </Text>
          )}

          {/* Completed timestamp if completed */}
          {task.isCompleted && !!task.completedAt && (
            <Text style={[styles.completedTimeText, { color: colors.textMuted }]}>
              {formatCompletedAt(task.completedAt)}
            </Text>
          )}

          {/* Subtask pill if present */}
          {totalSubtasks > 0 && !task.isCompleted && (
            <TouchableOpacity
              style={[
                styles.subtaskPill,
                { backgroundColor: colors.surfaceVariant },
              ]}
              onPress={() => setExpandedSubtasks(!expandedSubtasks)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="format-list-checks"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.subtaskPillText, { color: colors.textSecondary }]}
              >
                {completedSubtasks}/{totalSubtasks} subtasks
              </Text>
              <MaterialCommunityIcons
                name={expandedSubtasks ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Duration / Time Pill */}
        {durationBadge && !task.isCompleted && (
          <View
            style={[
              styles.durationBadge,
              { backgroundColor: colors.badgeBackground },
            ]}
          >
            <Text
              style={[styles.durationText, { color: colors.badgeText }]}
            >
              {durationBadge}
            </Text>
          </View>
        )}

        {/* Star for important tasks */}
        {task.priority === 'important' && !task.isCompleted && (
          <View style={styles.starBadge}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.warning}
            />
          </View>
        )}
      </Pressable>

      {/* Expanded Subtasks List */}
      {expandedSubtasks && totalSubtasks > 0 && !task.isCompleted && (
        <View
          style={[
            styles.subtasksContainer,
            {
              backgroundColor: isDark ? '#141418' : '#F4F4F5',
              borderTopColor: colors.cardBorder,
            },
          ]}
        >
          {task.subtasks.map((subtask) => (
            <TouchableOpacity
              key={subtask.id}
              style={styles.subtaskRow}
              onPress={() => handleSubtaskToggle(subtask)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={
                  subtask.isCompleted
                    ? 'checkbox-marked'
                    : 'checkbox-blank-outline'
                }
                size={16}
                color={subtask.isCompleted ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  styles.subtaskRowText,
                  {
                    color: subtask.isCompleted ? colors.textMuted : colors.text,
                    textDecorationLine: subtask.isCompleted
                      ? 'line-through'
                      : 'none',
                  },
                ]}
                numberOfLines={1}
              >
                {subtask.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkboxTouch: {
    marginRight: 14,
    marginTop: 2,
    padding: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6, // rounded squircle
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  tagText: {
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  notesText: {
    fontSize: 12.5,
    marginTop: 4,
    lineHeight: 16,
  },
  completedTimeText: {
    fontSize: 12,
    marginTop: 4,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  starBadge: {
    marginLeft: 6,
    marginTop: 3,
  },
  subtaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  subtaskPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subtasksContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  subtaskRowText: {
    fontSize: 13,
    flex: 1,
  },
});
