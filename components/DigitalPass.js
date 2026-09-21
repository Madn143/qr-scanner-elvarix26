// components/DigitalPass.js
// ─────────────────────────────────────────────────────────────────────────────
// Visual Entry Pass — mirrors the official ELVARIX'26 participant card.
// Designed to be captured by react-native-view-shot and shared/saved.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function DigitalPass({ data }) {
  if (!data) return null;

  const qrPayload = JSON.stringify({
    registrationId: data.registrationId,
    studentName: data.studentName,
    collegeName: data.collegeName,
    events: data.events,
    foodPreference: data.foodPreference,
    registrationType: data.registrationType,
  });

  return (
    <View style={styles.pass}>
      {/* ── HEADER BAND ─────────────────────────────────────────── */}
      <View style={styles.headerBand}>
        <View style={styles.headerLeft}>
          <Text style={styles.eventTitle}>ELVARIX'26</Text>
          <Text style={styles.passTitle}>OFFICIAL PARTICIPANT ENTRY PASS</Text>
        </View>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>E</Text>
          <Text style={styles.logoSub}>'26</Text>
        </View>
      </View>

      {/* ── REGISTRATION ID BADGE ───────────────────────────────── */}
      <View style={styles.idBadge}>
        <Text style={styles.idLabel}>REGISTRATION ID</Text>
        <Text style={styles.idValue}>{data.registrationId}</Text>
      </View>

      {/* ── BODY: QR + PROFILE ─────────────────────────────────── */}
      <View style={styles.body}>
        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <QRCode
            value={qrPayload}
            size={160}
            backgroundColor="transparent"
            color="#0F172A"
            quietZone={6}
          />
          <Text style={styles.qrHint}>Scan at all checkpoints</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <SectionHeader label="PARTICIPANT PROFILE" />
          <ProfileRow icon="👤" label="Name" value={data.studentName} />
          <SectionHeader label="COLLEGE" />
          <ProfileRow icon="🏛️" label="" value={data.collegeName} />
          <SectionHeader label="FOOD PREFERENCE" />
          <ProfileRow
            icon={data.foodPreference === "Veg" ? "🥗" : "🍗"}
            label=""
            value={data.foodPreference}
          />
          <SectionHeader label="REGISTRATION TYPE" />
          <View style={[styles.typeBadge, data.registrationType === "Internal" ? styles.badgeInternal : styles.badgeExternal]}>
            <Text style={styles.typeBadgeText}>{data.registrationType}</Text>
          </View>
        </View>
      </View>

      {/* ── REGISTERED EVENTS ───────────────────────────────────── */}
      <View style={styles.eventsSection}>
        <SectionHeader label="REGISTERED EVENTS" />
        <View style={styles.eventsList}>
          {data.events && data.events.length > 0 ? (
            data.events.map((evt, i) => (
              <View key={i} style={styles.eventTag}>
                <Text style={styles.eventTagDot}>●</Text>
                <Text style={styles.eventTagText}>{evt}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEvents}>No events registered</Text>
          )}
        </View>
      </View>

      {/* ── IMPORTANT INSTRUCTIONS ─────────────────────────────── */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>⚠ IMPORTANT INSTRUCTIONS</Text>
        {[
          "Show this QR at the entrance for attendance verification.",
          "Keep this pass ready while collecting refreshments or food.",
          "Present the same QR before entering your registered events.",
          "This pass is valid only for the named participant.",
        ].map((line, i) => (
          <View key={i} style={styles.instructionRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.instructionText}>{line}</Text>
          </View>
        ))}
      </View>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>
          ELVARIX'26 · SEPTEMBER 23, 2026 · GRACE COLLEGE OF ENGINEERING
        </Text>
      </View>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileIcon}>{icon}</Text>
      <Text style={styles.profileValue} numberOfLines={2}>
        {label ? `${label}: ` : ""}{value}
      </Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const GOLD = "#F59E0B";
const DARK_BG = "#0A0F1E";
const CARD_BG = "#0E1628";
const SURFACE = "#141E33";
const ACCENT = "#6366F1";

const styles = StyleSheet.create({
  pass: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
    borderWidth: 1.5,
    borderColor: ACCENT + "60",
  },

  // Header
  headerBand: {
    backgroundColor: DARK_BG,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  headerLeft: { flex: 1 },
  eventTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: GOLD,
    letterSpacing: 3,
  },
  passTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.8,
    marginTop: 2,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  logoText: { fontSize: 20, fontWeight: "900", color: "#fff", lineHeight: 22 },
  logoSub: { fontSize: 9, fontWeight: "800", color: "#C7D2FE", lineHeight: 11 },

  // ID Badge
  idBadge: {
    backgroundColor: ACCENT + "22",
    borderBottomWidth: 1,
    borderBottomColor: ACCENT + "44",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: ACCENT,
    letterSpacing: 1.5,
  },
  idValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 2,
  },

  // Body
  body: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  qrWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qrHint: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  profileSection: { flex: 1, gap: 4 },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: GOLD,
    letterSpacing: 1.2,
  },

  // Profile Row
  profileRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginLeft: 12 },
  profileIcon: { fontSize: 13, marginTop: 1 },
  profileValue: { fontSize: 13, fontWeight: "600", color: "#E2E8F0", flex: 1 },

  // Type Badge
  typeBadge: {
    alignSelf: "flex-start",
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  badgeInternal: { backgroundColor: "#166534" },
  badgeExternal: { backgroundColor: "#7C3AED" },
  typeBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 1 },

  // Events
  eventsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: SURFACE,
  },
  eventsList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2, marginLeft: 12 },
  eventTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  eventTagDot: { fontSize: 8, color: ACCENT },
  eventTagText: { fontSize: 12, fontWeight: "600", color: "#CBD5E1" },
  noEvents: { fontSize: 12, color: "#64748B", marginLeft: 12 },

  // Instructions
  instructionsBox: {
    backgroundColor: "#1A0A0A",
    borderTopWidth: 1.5,
    borderTopColor: "#7F1D1D",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  instructionsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FCA5A5",
    letterSpacing: 1,
    marginBottom: 4,
  },
  instructionRow: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  bulletDot: { color: "#F87171", fontSize: 11, lineHeight: 18 },
  instructionText: { fontSize: 11, color: "#FCA5A5", lineHeight: 18, flex: 1 },

  // Footer
  footer: {
    backgroundColor: DARK_BG,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  footerLine: {
    width: "100%",
    height: 1.5,
    backgroundColor: GOLD + "60",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
