import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useTasks } from '../../src/context/TaskContext';
import { DateSelector } from '../../src/components/DateSelector';
import { TimeSelector } from '../../src/components/TimeSelector';
import { ReminderSelector } from '../../src/components/ReminderSelector';
import { RepeatSelector } from '../../src/components/RepeatSelector';
import { PrioritySelector } from '../../src/components/PrioritySelector';
import { SubtaskList } from '../../src/components/SubtaskList';
import { ConfirmationModal } from '../../src/components/ConfirmationModal';
import { Priority, ReminderRule, RepeatRule, Subtask } from '../../src/types/task';
import { formatCompletedAt } from '../../src/utils/dateUtils';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { tasks, updateTask, deleteTask, toggleTaskCompletion } = useTasks();

  const existingTask = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState<Priority>('normal');
  const [reminder, setReminder] = useState<ReminderRule>({
    preset: 'none',
    offsetMinutes: 0,
  });
  const [repeat, setRepeat] = useState<RepeatRule>({
    type: 'none',
    interval: 1,
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setNotes(existingTask.notes || '');
      setDueDate(existingTask.dueDate);
      setIsAllDay(existingTask.isAllDay);
      setDueTime(existingTask.dueTime || '18:00');
      setPriority(existingTask.priority);
      setReminder(existingTask.reminder || { preset: 'none', offsetMinutes: 0 });
      setRepeat(existingTask.repeat || { type: 'none', interval: 1 });
      setSubtasks(existingTask.subtasks || []);
      setIsCompleted(existingTask.isCompleted);
      setCompletedAt(existingTask.completedAt);
    }
  }, [existingTask]);

  if (!existingTask) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Task not found.
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary, marginTop: 16 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.saveButtonText, { color: colors.checkboxCheck }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddSubtask = (subtaskTitle: string) => {
    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: subtaskTitle,
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
  };

  const handleToggleComplete = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    await toggleTaskCompletion(existingTask.id);
    router.back();
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    await deleteTask(existingTask.id);
    router.back();
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    await updateTask(existingTask.id, {
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      dueDate,
      dueTime: isAllDay ? undefined : dueTime,
      isAllDay,
      priority,
      reminder,
      repeat,
      subtasks,
    });

    router.back();
  };

  const isTitleInvalid = hasSubmitted && !title.trim();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Task
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.deleteHeaderButton}
              onPress={() => setShowDeleteModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={colors.danger}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveButtonText, { color: colors.checkboxCheck }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status banner if completed */}
          {isCompleted && (
            <View
              style={[
                styles.completedBanner,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={colors.success}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.completedBannerTitle, { color: colors.text }]}>
                  Completed
                </Text>
                <Text
                  style={[
                    styles.completedBannerSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatCompletedAt(completedAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Task Title <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderColor: isTitleInvalid ? colors.danger : colors.cardBorder,
                },
              ]}
              placeholder="Task title"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            {isTitleInvalid && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                Task title is required.
              </Text>
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Notes
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="Add details, instructions, or links..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Date Selector */}
          <DateSelector selectedDate={dueDate} onSelectDate={setDueDate} />

          {/* Time Selector */}
          <TimeSelector
            isAllDay={isAllDay}
            onToggleAllDay={setIsAllDay}
            dueTime={dueTime}
            onSelectTime={setDueTime}
          />

          {/* Priority */}
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* Reminder */}
          <ReminderSelector value={reminder} onChange={setReminder} />

          {/* Repeat */}
          <RepeatSelector value={repeat} onChange={setRepeat} />

          {/* Subtasks */}
          <SubtaskList
            subtasks={subtasks}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />

          {/* Quick Mark Complete / Uncomplete */}
          <TouchableOpacity
            style={[
              styles.statusActionButton,
              {
                backgroundColor: isCompleted
                  ? colors.surfaceVariant
                  : colors.primaryLight,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isCompleted ? 'undo' : 'check'}
              size={18}
              color={colors.text}
            />
            <Text style={[styles.statusActionText, { color: colors.text }]}>
              {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Task?"
        message={`Are you sure you want to delete "${existingTask.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteHeaderButton: {
    padding: 4,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveButtonText: {
    fontWeight: '700',
    fontSize: 13.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  completedBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  completedBannerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  fieldGroup: {
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  notesInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 70,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  statusActionText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
});
