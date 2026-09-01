import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  const { colors, isDark } = useAppTheme();
  const isImportant = value === 'important';

  const [trackWidth, setTrackWidth] = useState(300);
  const pillWidth = (trackWidth - 8) / 2;

  const indicatorPos = useRef(new Animated.Value(isImportant ? pillWidth : 0)).current;

  useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: isImportant ? pillWidth : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isImportant, pillWidth]);

  const handleSelect = (p: Priority) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onChange(p);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Priority
      </Text>
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.cardBorder,
          },
        ]}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: pillWidth,
              backgroundColor: isImportant
                ? colors.danger + '25'
                : isDark
                ? '#232A3B'
                : '#E2E8F0',
              borderColor: isImportant ? colors.danger : 'transparent',
              borderWidth: isImportant ? 1 : 0,
              transform: [{ translateX: indicatorPos }],
            },
          ]}
        />

        {/* Normal Button */}
        <TouchableOpacity
          style={[styles.segmentBtn, { width: pillWidth }]}
          onPress={() => handleSelect('normal')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: !isImportant ? colors.text : colors.textSecondary,
                fontWeight: !isImportant ? '700' : '500',
              },
            ]}
          >
            Normal
          </Text>
        </TouchableOpacity>

        {/* Important Button */}
        <TouchableOpacity
          style={[styles.segmentBtn, { width: pillWidth }]}
          onPress={() => handleSelect('important')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="star"
            size={15}
            color={isImportant ? colors.danger : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: isImportant ? colors.danger : colors.textSecondary,
                fontWeight: isImportant ? '700' : '500',
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
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
  },
  slidingPill: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 9,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 13,
  },
});
