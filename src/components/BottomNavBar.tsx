import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../context/ThemeContext';

export type TabName = 'tasks' | 'progress' | 'settings';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
}

const TABS: { id: TabName; label: string; icon: string; activeIcon: string }[] = [
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'checkbox-marked-circle-outline',
    activeIcon: 'checkbox-marked-circle',
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: 'chart-box-outline',
    activeIcon: 'chart-box',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'cog-outline',
    activeIcon: 'cog',
  },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { colors, isDark } = useAppTheme();
  const screenWidth = Dimensions.get('window').width;
  const navWidth = Math.min(screenWidth - 32, 380);
  const tabWidth = (navWidth - 8) / 3;

  const activeIndex = TABS.findIndex((t) => t.id === currentTab);
  const indicatorPosition = useRef(new Animated.Value(activeIndex * tabWidth)).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeIndex * tabWidth,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth]);

  const handlePress = (tab: TabName) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onSelectTab(tab);
  };

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.dockContainer,
          {
            width: navWidth,
            backgroundColor: colors.dockBackground,
            borderColor: colors.dockBorder,
          },
        ]}
      >
        {/* Smooth Sliding Active Indicator Pill */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth,
              backgroundColor: isDark ? '#1C2333' : '#E2E8F0',
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />

        {/* Tab Buttons */}
        {TABS.map((tab) => {
          const isActive = tab.id === currentTab;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => handlePress(tab.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={21}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.text : colors.textMuted,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 16 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 26,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 3,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
