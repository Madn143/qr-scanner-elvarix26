// components/EventCheckboxGroup.js
// ─────────────────────────────────────────────────────────────────────────────
// Multi-select checkbox group for official ELVARIX'26 events in Pass Generator.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ALL_EVENTS = [
  "Paper Presentation",
  "Blind Coding",
  "UI/UX Design",
  "Tech Quiz",
  "On-Spot Video Editing",
  "Word Dump",
  "Corporate Walk",
  "E-Sports",
];

export default function EventCheckboxGroup({ selected, onChange }) {
  const toggle = (event) => {
    if (selected.includes(event)) {
      onChange(selected.filter((e) => e !== event));
    } else {
      onChange([...selected, event]);
    }
  };

  return (
    <View style={styles.container}>
      {ALL_EVENTS.map((event) => {
        const checked = selected.includes(event);
        return (
          <TouchableOpacity
            key={event}
            style={[styles.row, checked && styles.rowChecked]}
            onPress={() => toggle(event)}
            activeOpacity={0.7}
          >
            <View style={[styles.box, checked && styles.boxChecked]}>
              {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.label, checked && styles.labelChecked]}>{event}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: "#2D3F55",
    gap: 12,
  },
  rowChecked: {
    borderColor: "#6366F1",
    backgroundColor: "#1A1F3A",
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  label: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    flex: 1,
  },
  labelChecked: {
    color: "#E2E8F0",
    fontWeight: "600",
  },
});
