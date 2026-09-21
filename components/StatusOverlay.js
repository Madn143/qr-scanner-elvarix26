// components/StatusOverlay.js
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen animated overlay shown after a QR scan.
// "success" → green approved card
// "duplicate" → red already-claimed card
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CHECKPOINT_LABELS = {
  reception: "Reception Entry",
  snacks: "Snacks / Refreshments",
  food: "Food / Lunch",
};

export default function StatusOverlay({ visible, type, data, checkpoint, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !data) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "#0D3320" : "#3A0D0D";
  const accentColor = isSuccess ? "#22C55E" : "#EF4444";
  const iconName = isSuccess ? "checkmark-circle" : "close-circle";
  const headline = isSuccess ? "✅ APPROVED" : "🚫 ALREADY CLAIMED";
  const subHeadline = isSuccess
    ? `Checked in at ${CHECKPOINT_LABELS[checkpoint]}`
    : `Duplicate scan at ${CHECKPOINT_LABELS[checkpoint]}`;

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: bgColor, borderColor: accentColor, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Icon + Headline */}
            <Ionicons name={iconName} size={72} color={accentColor} style={styles.icon} />
            <Text style={[styles.headline, { color: accentColor }]}>{headline}</Text>
            <Text style={[styles.subHeadline, { color: accentColor + "CC" }]}>{subHeadline}</Text>

            <View style={[styles.divider, { backgroundColor: accentColor + "40" }]} />

            {/* Student Details */}
            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              <InfoRow label="Name" value={data.studentName} accent={accentColor} />
              <InfoRow label="Reg ID" value={data.registrationId} accent={accentColor} />
              <InfoRow label="College" value={data.collegeName} accent={accentColor} />
              <InfoRow label="Type" value={data.registrationType} accent={accentColor} />
              <InfoRow label="Food" value={data.foodPreference} accent={accentColor} />
              {data.events && data.events.length > 0 && (
                <InfoRow label="Events" value={data.events.join(", ")} accent={accentColor} />
              )}
              {data.timestamp && (
                <InfoRow
                  label={isSuccess ? "Checked in at" : "Originally scanned"}
                  value={formatTimestamp(data.timestamp)}
                  accent={accentColor}
                />
              )}
            </ScrollView>

            <View style={[styles.divider, { backgroundColor: accentColor + "40" }]} />

            <Text style={styles.dismissHint}>Tap anywhere outside to dismiss</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: accent + "99" }]}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: "90%",
  },
  icon: { marginBottom: 8 },
  headline: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subHeadline: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 16,
  },
  detailScroll: {
    width: "100%",
    maxHeight: 260,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    width: 110,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F1F5F9",
    flex: 1,
    textAlign: "right",
  },
  dismissHint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
});
