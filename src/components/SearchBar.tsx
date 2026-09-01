import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onClose,
  placeholder = 'Search tasks and notes...',
}) => {
  const { colors } = useAppTheme();
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      onClose();
    });
  };

  const barHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  const barOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: barHeight,
          opacity: barOpacity,
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={19}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoFocus
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={17}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },
  actionBtn: {
    padding: 3,
  },
});
