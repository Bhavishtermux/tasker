import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  isSearch?: boolean;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isSearch, searchQuery }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
        <MaterialCommunityIcons
          name={isSearch ? 'text-search' : 'checkbox-marked-circle-outline'}
          size={36}
          color={colors.textMuted}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {isSearch ? 'No matching tasks' : 'All caught up!'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isSearch
          ? `No tasks found matching "${searchQuery}".`
          : 'You have no tasks pending. Tap + to add a task.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
