import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReminderRule, ReminderPreset } from '../types/task';
import { useAppTheme } from '../context/ThemeContext';

interface ReminderSelectorProps {
  value: ReminderRule;
  onChange: (rule: ReminderRule) => void;
}

interface PresetOption {
  preset: ReminderPreset;
  label: string;
  offsetMinutes: number;
}

const PRESET_OPTIONS: PresetOption[] = [
  { preset: 'none', label: 'None', offsetMinutes: 0 },
  { preset: 'at_time', label: 'At task time', offsetMinutes: 0 },
  { preset: '5m', label: '5m before', offsetMinutes: 5 },
  { preset: '10m', label: '10m before', offsetMinutes: 10 },
  { preset: '30m', label: '30m before', offsetMinutes: 30 },
  { preset: '1h', label: '1h before', offsetMinutes: 60 },
  { preset: 'custom', label: 'Custom', offsetMinutes: 15 },
];

export const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useAppTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(
    value.customMinutes ? String(value.customMinutes) : '15'
  );

  const currentOption =
    PRESET_OPTIONS.find((p) => p.preset === value.preset) || PRESET_OPTIONS[0];

  const handleSelect = (option: PresetOption) => {
    setShowDropdown(false);
    if (option.preset === 'custom') {
      const minutes = parseInt(customMinutes, 10) || 15;
      onChange({
        preset: 'custom',
        offsetMinutes: minutes,
        customMinutes: minutes,
      });
    } else {
      onChange({
        preset: option.preset,
        offsetMinutes: option.offsetMinutes,
      });
    }
  };

  const handleCustomMinutesChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustomMinutes(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0) {
      onChange({
        preset: 'custom',
        offsetMinutes: num,
        customMinutes: num,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Reminder
      </Text>

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
          name={value.preset === 'none' ? 'bell-off-outline' : 'bell-outline'}
          size={18}
          color={value.preset === 'none' ? colors.textSecondary : colors.primary}
        />
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {value.preset === 'custom'
            ? `${value.offsetMinutes}m before`
            : currentOption.label}
        </Text>
        <MaterialCommunityIcons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Dropdown Options */}
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
          {PRESET_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.preset}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    value.preset === opt.preset
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
                      value.preset === opt.preset
                        ? colors.primary
                        : colors.text,
                    fontWeight: value.preset === opt.preset ? '600' : '400',
                  },
                ]}
              >
                {opt.label}
              </Text>
              {value.preset === opt.preset && (
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

      {/* Custom minutes input */}
      {value.preset === 'custom' && (
        <View style={styles.customContainer}>
          <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
            Minutes before task:
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
            value={customMinutes}
            onChangeText={handleCustomMinutesChange}
            maxLength={4}
          />
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
    width: 80,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'center',
  },
});
