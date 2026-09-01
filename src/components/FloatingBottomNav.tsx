import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../context/ThemeContext';

interface FloatingBottomNavProps {
  currentTab: 'tasks' | 'progress' | 'settings';
  isSearchActive: boolean;
  onSelectTab: (tab: 'tasks' | 'progress' | 'settings') => void;
  onToggleSearch: () => void;
  onPressAdd: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  isSearchActive,
  onSelectTab,
  onToggleSearch,
  onPressAdd,
}) => {
  const { colors, isDark } = useAppTheme();

  const handleTabPress = (tab: 'tasks' | 'progress' | 'settings') => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onSelectTab(tab);
  };

  const handleSearchPress = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onToggleSearch();
  };

  const handleAddPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    onPressAdd();
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.dock,
          {
            backgroundColor: colors.dockBackground,
            borderColor: colors.dockBorder,
          },
        ]}
      >
        {/* Search Action */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isSearchActive && [
              styles.activeButton,
              { backgroundColor: colors.surfaceVariant },
            ],
          ]}
          onPress={handleSearchPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={isSearchActive ? colors.text : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Tasks Tab */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            currentTab === 'tasks' && !isSearchActive && [
              styles.activeButton,
              { backgroundColor: colors.surfaceVariant },
            ],
          ]}
          onPress={() => handleTabPress('tasks')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="checkbox-marked-outline"
            size={20}
            color={
              currentTab === 'tasks' && !isSearchActive
                ? colors.text
                : colors.textSecondary
            }
          />
        </TouchableOpacity>

        {/* Progress Tab */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            currentTab === 'progress' && [
              styles.activeButton,
              { backgroundColor: colors.surfaceVariant },
            ],
          ]}
          onPress={() => handleTabPress('progress')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chart-box-outline"
            size={20}
            color={
              currentTab === 'progress' ? colors.text : colors.textSecondary
            }
          />
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            currentTab === 'settings' && [
              styles.activeButton,
              { backgroundColor: colors.surfaceVariant },
            ],
          ]}
          onPress={() => handleTabPress('settings')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={20}
            color={
              currentTab === 'settings' ? colors.text : colors.textSecondary
            }
          />
        </TouchableOpacity>

        {/* Create (+) Action */}
        <TouchableOpacity
          style={[styles.iconButton, styles.addButton]}
          onPress={handleAddPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 28,
    borderWidth: 1,
    gap: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    borderRadius: 19,
  },
  addButton: {
    marginLeft: 2,
  },
});
