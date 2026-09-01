import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task, Subtask } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import {
  formatTaskDateBadge,
  formatTime12Hour,
  isOverdueDate,
  formatCompletedAt,
} from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { colors, isDark } = useAppTheme();
  const { toggleTaskCompletion, toggleSubtask } = useTasks();

  // Animations
  const rowScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(task.isCompleted ? 1 : 0)).current;
  const checkBounce = useRef(new Animated.Value(1)).current;
  const strikethroughProgress = useRef(new Animated.Value(task.isCompleted ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(task.isCompleted ? 0.55 : 1)).current;

  const [expandedSubtasks, setExpandedSubtasks] = useState(false);

  const isOverdue = !task.isCompleted && isOverdueDate(task.dueDate);
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(checkScale, {
        toValue: task.isCompleted ? 1 : 0,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: task.isCompleted ? 0.55 : 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(strikethroughProgress, {
        toValue: task.isCompleted ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [task.isCompleted]);

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }

    // Tactile checkbox pop animation
    Animated.sequence([
      Animated.timing(checkBounce, {
        toValue: 0.8,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(checkBounce, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    toggleTaskCompletion(task.id);
  };

  const handlePressIn = () => {
    Animated.timing(rowScale, {
      toValue: 0.98,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(rowScale, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSubtaskToggle = (subtask: Subtask) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    toggleSubtask(task.id, subtask.id);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: rowScale }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isOverdue ? colors.danger + '40' : colors.cardBorder,
          },
        ]}
      >
        <Pressable
          style={styles.mainPressable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.surfaceVariant }}
        >
          {/* Signature Tactile Checkbox */}
          <TouchableOpacity
            style={styles.checkboxTouch}
            onPress={handleToggle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.checkboxOuter,
                {
                  borderColor: task.isCompleted
                    ? colors.primary
                    : isOverdue
                    ? colors.danger
                    : colors.checkboxBorder,
                  transform: [{ scale: checkBounce }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.checkboxFill,
                  {
                    backgroundColor: colors.primary,
                    transform: [{ scale: checkScale }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={13}
                  color={colors.checkboxCheck}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>

          {/* Task Title & Details */}
          <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: task.isCompleted ? colors.textMuted : colors.text,
                    textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>

              {task.priority === 'important' && !task.isCompleted && (
                <View
                  style={[
                    styles.importantBadge,
                    { backgroundColor: colors.importantBadge },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={11}
                    color={colors.importantText}
                  />
                  <Text
                    style={[styles.importantText, { color: colors.importantText }]}
                  >
                    Important
                  </Text>
                </View>
              )}
            </View>

            {/* Optional Notes */}
            {!!task.notes && !task.isCompleted && (
              <Text
                style={[styles.notes, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {task.notes}
              </Text>
            )}

            {/* Metadata (Date/Time, Repeat, Subtasks) */}
            <View style={styles.metaRow}>
              {task.isCompleted ? (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {formatCompletedAt(task.completedAt)}
                </Text>
              ) : (
                <>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name={isOverdue ? 'alert-circle-outline' : 'calendar-outline'}
                      size={12}
                      color={isOverdue ? colors.danger : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: isOverdue ? colors.danger : colors.textSecondary },
                      ]}
                    >
                      {formatTaskDateBadge(task.dueDate)}
                      {!task.isAllDay && task.dueTime
                        ? ` · ${formatTime12Hour(task.dueTime)}`
                        : ''}
                    </Text>
                  </View>

                  {task.repeat && task.repeat.type !== 'none' && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="repeat"
                        size={12}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}

                  {task.reminder && task.reminder.preset !== 'none' && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="bell-outline"
                        size={12}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}

                  {totalSubtasks > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.subtaskPill,
                        {
                          backgroundColor:
                            completedSubtasks === totalSubtasks
                              ? colors.success + '20'
                              : colors.surfaceVariant,
                        },
                      ]}
                      onPress={() => setExpandedSubtasks(!expandedSubtasks)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="format-list-checks"
                        size={11}
                        color={
                          completedSubtasks === totalSubtasks
                            ? colors.success
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.subtaskPillText,
                          {
                            color:
                              completedSubtasks === totalSubtasks
                                ? colors.success
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {completedSubtasks}/{totalSubtasks}
                      </Text>
                      <MaterialCommunityIcons
                        name={expandedSubtasks ? 'chevron-up' : 'chevron-down'}
                        size={11}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </Pressable>

        {/* Subtasks Expanded Preview */}
        {expandedSubtasks && totalSubtasks > 0 && !task.isCompleted && (
          <View
            style={[
              styles.subtasksContainer,
              {
                backgroundColor: isDark ? '#0E1017' : '#F1F5F9',
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
                  size={15}
                  color={subtask.isCompleted ? colors.success : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.subtaskText,
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  card: {
    borderRadius: 16,
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
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkboxFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  importantText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  notes: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
  },
  subtaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subtaskPillText: {
    fontSize: 11,
    fontWeight: '600',
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
    paddingVertical: 4,
  },
  subtaskText: {
    fontSize: 13,
    flex: 1,
  },
});
