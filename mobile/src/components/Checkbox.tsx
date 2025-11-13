import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onCheckedChange(!checked)}>
      <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
        {checked && <Check color="#ffffff" size={16} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkedCheckbox: {
    backgroundColor: '#FF69B4',
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
  },
});
