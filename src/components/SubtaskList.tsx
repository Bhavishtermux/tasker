import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subtask } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';

interface SubtaskListProps {
  subtasks: Subtask[];
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
  onEditSubtask?: (id: string, newTitle: string) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const { colors } = useAppTheme();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAdd = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
      </Text>

      {/* Existing subtasks */}
      {subtasks.map((st) => (
        <View
          key={st.id}
          style={[
            styles.subtaskItem,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.checkTouch}
            onPress={() => onToggleSubtask(st.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={st.isCompleted ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20}
              color={st.isCompleted ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.subtaskTitle,
              {
                color: st.isCompleted ? colors.textMuted : colors.text,
                textDecorationLine: st.isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {st.title}
          </Text>

          <TouchableOpacity
            style={styles.deleteTouch}
            onPress={() => onDeleteSubtask(st.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add Subtask Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={colors.textSecondary}
          style={styles.plusIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Add a subtask..."
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
          >
            <MaterialCommunityIcons name="arrow-up" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
  },
  checkTouch: {
    marginRight: 10,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
  },
  deleteTouch: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  plusIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
