import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Priority } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Priority
      </Text>
      <View
        style={[
          styles.segmentedContainer,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Normal Button */}
        <TouchableOpacity
          style={[
            styles.segmentButton,
            value === 'normal' && [
              styles.activeSegment,
              { backgroundColor: colors.card, borderColor: colors.border },
            ],
          ]}
          onPress={() => onChange('normal')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: value === 'normal' ? colors.primary : colors.textSecondary,
                fontWeight: value === 'normal' ? '600' : '400',
              },
            ]}
          >
            Normal
          </Text>
        </TouchableOpacity>

        {/* Important Button */}
        <TouchableOpacity
          style={[
            styles.segmentButton,
            value === 'important' && [
              styles.activeSegment,
              { backgroundColor: colors.card, borderColor: colors.border },
            ],
          ]}
          onPress={() => onChange('important')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={
              value === 'important' ? colors.danger : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  value === 'important' ? colors.danger : colors.textSecondary,
                fontWeight: value === 'important' ? '600' : '400',
              },
            ]}
          >
            Important
          </Text>
        </TouchableOpacity>
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
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
  },
});
