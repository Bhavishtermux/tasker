import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RepeatRule, RepeatType } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';

interface RepeatSelectorProps {
  value: RepeatRule;
  onChange: (rule: RepeatRule) => void;
}

interface RepeatOption {
  type: RepeatType;
  label: string;
}

const REPEAT_OPTIONS: RepeatOption[] = [
  { type: 'none', label: "Doesn't repeat" },
  { type: 'daily', label: 'Every day' },
  { type: 'weekly', label: 'Every week' },
  { type: 'monthly', label: 'Every month' },
  { type: 'custom', label: 'Custom' },
];

const DAYS_OF_WEEK = [
  { day: 0, label: 'S' },
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
];

export const RepeatSelector: React.FC<RepeatSelectorProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useAppTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [customInterval, setCustomInterval] = useState(
    value.interval ? String(value.interval) : '1'
  );

  const currentOption =
    REPEAT_OPTIONS.find((r) => r.type === value.type) || REPEAT_OPTIONS[0];

  const handleSelect = (option: RepeatOption) => {
    setShowDropdown(false);
    if (option.type === 'custom') {
      const interval = parseInt(customInterval, 10) || 1;
      onChange({
        type: 'custom',
        interval,
        daysOfWeek: value.daysOfWeek || [],
      });
    } else {
      onChange({
        type: option.type,
        interval: 1,
        daysOfWeek: option.type === 'weekly' ? value.daysOfWeek : undefined,
      });
    }
  };

  const handleIntervalChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustomInterval(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0) {
      onChange({
        ...value,
        interval: num,
      });
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = value.daysOfWeek || [];
    const exists = currentDays.includes(day);
    const updated = exists
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    onChange({
      ...value,
      daysOfWeek: updated,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Repeat</Text>

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setShowDropdown(!showDropdown)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="repeat"
          size={18}
          color={value.type === 'none' ? colors.textSecondary : colors.primary}
        />
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {value.type === 'custom'
            ? `Every ${value.interval || 1} day(s)`
            : currentOption.label}
        </Text>
        <MaterialCommunityIcons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Dropdown list */}
      {showDropdown && (
        <View
          style={[
            styles.optionsList,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {REPEAT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    value.type === opt.type
                      ? colors.primaryLight
                      : 'transparent',
                },
              ]}
              onPress={() => handleSelect(opt)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      value.type === opt.type ? colors.primary : colors.text,
                    fontWeight: value.type === opt.type ? '600' : '400',
                  },
                ]}
              >
                {opt.label}
              </Text>
              {value.type === opt.type && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Custom repeat controls */}
      {value.type === 'custom' && (
        <View style={styles.customContainer}>
          <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
            Repeat every:
          </Text>
          <TextInput
            style={[
              styles.customInput,
              {
                backgroundColor: colors.surfaceVariant,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            keyboardType="numeric"
            value={customInterval}
            onChangeText={handleIntervalChange}
            maxLength={3}
          />
          <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
            days
          </Text>
        </View>
      )}

      {/* Weekly Days selection */}
      {(value.type === 'weekly' || value.type === 'custom') && (
        <View style={styles.daysContainer}>
          <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>
            On days:
          </Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = (value.daysOfWeek || []).includes(d.day);
              return (
                <TouchableOpacity
                  key={d.day}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surfaceVariant,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleDayOfWeek(d.day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
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
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  optionsList: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
  },
  customContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
  },
  customInput: {
    width: 60,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  daysContainer: {
    marginTop: 10,
  },
  daysLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
  },
});
