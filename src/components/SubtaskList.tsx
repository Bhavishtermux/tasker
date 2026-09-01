import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Subtask } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';

interface SubtaskListProps {
  subtasks: Subtask[];
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
}

const SubtaskRow: React.FC<{
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ subtask, onToggle, onDelete }) => {
  const { colors } = useAppTheme();
  const [scale] = useState(new Animated.Value(1));

  const handleToggle = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  return (
    <View
      style={[
        styles.subtaskItem,
        {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.checkTouch}
        onPress={handleToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.checkboxCircle,
            {
              borderColor: subtask.isCompleted
                ? colors.primary
                : colors.checkboxBorder,
              backgroundColor: subtask.isCompleted
                ? colors.primary
                : 'transparent',
              transform: [{ scale }],
            },
          ]}
        >
          {subtask.isCompleted && (
            <MaterialCommunityIcons
              name="check"
              size={12}
              color={colors.checkboxCheck}
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      <Text
        style={[
          styles.subtaskTitle,
          {
            color: subtask.isCompleted ? colors.textMuted : colors.text,
            textDecorationLine: subtask.isCompleted ? 'line-through' : 'none',
          },
        ]}
      >
        {subtask.title}
      </Text>

      <TouchableOpacity
        style={styles.deleteTouch}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons
          name="close"
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const { colors } = useAppTheme();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.isCompleted).length;

  const handleAdd = () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Subtasks
        </Text>
        {subtasks.length > 0 && (
          <View
            style={[
              styles.counterBadge,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.counterText,
                {
                  color:
                    completedCount === subtasks.length
                      ? colors.success
                      : colors.textSecondary,
                },
              ]}
            >
              {completedCount}/{subtasks.length}
            </Text>
          </View>
        )}
      </View>

      {/* Subtask list */}
      {subtasks.map((st) => (
        <SubtaskRow
          key={st.id}
          subtask={st}
          onToggle={() => onToggleSubtask(st.id)}
          onDelete={() => onDeleteSubtask(st.id)}
        />
      ))}

      {/* Add Subtask Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="plus"
          size={18}
          color={colors.textSecondary}
          style={styles.plusIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Add subtask..."
          placeholderTextColor={colors.textMuted}
          value={newSubtaskTitle}
          onChangeText={setNewSubtaskTitle}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        {newSubtaskTitle.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={14}
              color={colors.checkboxCheck}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
  },
  checkTouch: {
    marginRight: 10,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 13.5,
  },
  deleteTouch: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  plusIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
