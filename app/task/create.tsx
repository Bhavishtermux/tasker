import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useSettings } from '../../src/context/SettingsContext';
import { useTasks } from '../../src/context/TaskContext';
import { DateSelector } from '../../src/components/DateSelector';
import { TimeSelector } from '../../src/components/TimeSelector';
import { ReminderSelector } from '../../src/components/ReminderSelector';
import { RepeatSelector } from '../../src/components/RepeatSelector';
import { PrioritySelector } from '../../src/components/PrioritySelector';
import { SubtaskList } from '../../src/components/SubtaskList';
import { getTodayDateString } from '../../src/utils/dateUtils';
import { Priority, ReminderRule, RepeatRule, Subtask } from '../../src/types/task';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { settings } = useSettings();
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [isAllDay, setIsAllDay] = useState(false);
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState<Priority>(settings.defaultPriority || 'normal');
  const [reminder, setReminder] = useState<ReminderRule>({
    preset: settings.defaultReminderPreset || 'none',
    offsetMinutes: 0,
  });
  const [repeat, setRepeat] = useState<RepeatRule>({
    type: 'none',
    interval: 1,
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleAddSubtask = (subtaskTitle: string) => {
    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: subtaskTitle,
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
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

    await addTask({
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
            <MaterialCommunityIcons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            New Task
          </Text>
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              placeholder="e.g. Buy groceries"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
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

          {/* Priority Selector */}
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* Reminder Selector */}
          <ReminderSelector value={reminder} onChange={setReminder} />

          {/* Repeat Selector */}
          <RepeatSelector value={repeat} onChange={setRepeat} />

          {/* Subtasks */}
          <SubtaskList
            subtasks={subtasks}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
});
