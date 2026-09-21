// screens/PassGeneratorScreen.js
// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — On-Spot Pass Generator
//
// Flow:
//   1. Fill form (Name, College, Reg Type, Food Pref, Events)
//   2. Tap "Generate Pass"
//   3. Record saved to Firestore Attendees collection
//   4. Digital pass rendered with QR code
//   5. Tap "Save / Share Pass" → ViewShot → expo-sharing
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS } from "../firebaseConfig";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import DigitalPass from "../components/DigitalPass";
import EventCheckboxGroup from "../components/EventCheckboxGroup";

// ── Registration Type & Food Pref Options ─────────────────────────────────
const REG_TYPES = ["Internal", "External"];
const FOOD_PREFS = ["Veg", "Non-Veg"];

// ── ID Generator ──────────────────────────────────────────────────────────
const generateId = () => "ELVA" + Math.floor(1000 + Math.random() * 9000);

export default function PassGeneratorScreen() {
  // Form state
  const [studentName, setStudentName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [registrationType, setRegistrationType] = useState("Internal");
  const [foodPreference, setFoodPreference] = useState("Veg");
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Pass state
  const [passData, setPassData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const viewShotRef = useRef(null);

  // ── Form Validation ──────────────────────────────────────────────────
  const validate = () => {
    if (!studentName.trim()) return "Please enter the student name.";
    if (!collegeName.trim()) return "Please enter the college name.";
    if (selectedEvents.length === 0) return "Please select at least one event.";
    return null;
  };

  // ── Generate Pass & Save to Firestore ────────────────────────────────
  const handleGenerate = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Validation Error", err);
      return;
    }

    setSaving(true);
    const registrationId = generateId();

    const record = {
      registrationId,
      studentName: studentName.trim(),
      collegeName: collegeName.trim(),
      registrationType,
      foodPreference,
      events: selectedEvents,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, COLLECTIONS.ATTENDEES, registrationId), record);
      setPassData(record);
      setShowForm(false);
    } catch (err) {
      Alert.alert("Error", "Failed to save registration. Check your internet connection.\n\n" + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Share / Save Pass Image ──────────────────────────────────────────
  const handleShare = async () => {
    if (!viewShotRef.current) return;
    setSharing(true);
    try {
      const uri = await viewShotRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `ELVARIX'26 Pass — ${passData.studentName}`,
        });
      } else {
        Alert.alert("Sharing unavailable", "This device does not support sharing. The pass image has been saved to your gallery.");
      }
    } catch (err) {
      Alert.alert("Export Error", err.message);
    } finally {
      setSharing(false);
    }
  };

  // ── Reset to generate another pass ──────────────────────────────────
  const handleReset = () => {
    setPassData(null);
    setStudentName("");
    setCollegeName("");
    setRegistrationType("Internal");
    setFoodPreference("Veg");
    setSelectedEvents([]);
    setShowForm(true);
  };

  // ────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050A14" />

        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {!showForm && (
              <TouchableOpacity onPress={handleReset} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#6366F1" />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {showForm ? "Generate Pass" : "Entry Pass Ready"}
              </Text>
              <Text style={styles.headerSub}>
                {showForm
                  ? "On-Spot Registration · ELVARIX'26"
                  : `ID: ${passData?.registrationId} · Tap share to export`}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {showForm ? (
            /* ── REGISTRATION FORM ──────────────────────────────────── */
            <View style={styles.form}>
              {/* Student Name */}
              <FormLabel label="Student Name" required />
              <TextInput
                style={styles.input}
                placeholder="e.g. Madan Kumar"
                placeholderTextColor="#4B5563"
                value={studentName}
                onChangeText={setStudentName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* College Name */}
              <FormLabel label="College Name" required />
              <TextInput
                style={styles.input}
                placeholder="e.g. Grace College of Engineering"
                placeholderTextColor="#4B5563"
                value={collegeName}
                onChangeText={setCollegeName}
                autoCapitalize="words"
                returnKeyType="done"
              />

              {/* Registration Type */}
              <FormLabel label="Registration Type" />
              <View style={styles.pillRow}>
                {REG_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.pill, registrationType === t && styles.pillActive]}
                    onPress={() => setRegistrationType(t)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, registrationType === t && styles.pillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Food Preference */}
              <FormLabel label="Food Preference" />
              <View style={styles.pillRow}>
                {FOOD_PREFS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.pill,
                      foodPreference === f && styles.pillActive,
                      foodPreference === f && f === "Non-Veg" && styles.pillNonVeg,
                    ]}
                    onPress={() => setFoodPreference(f)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pillIcon}>{f === "Veg" ? "🥗" : "🍗"}</Text>
                    <Text style={[styles.pillText, foodPreference === f && styles.pillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Events */}
              <FormLabel label="Registered Events" required />
              <Text style={styles.eventsNote}>Select all events the participant is joining</Text>
              <EventCheckboxGroup
                selected={selectedEvents}
                onChange={setSelectedEvents}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.generateBtn, saving && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="qr-code-outline" size={20} color="#fff" />
                    <Text style={styles.generateBtnText}>Generate Entry Pass</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* ── DIGITAL PASS VIEW ──────────────────────────────────── */
            <View style={styles.passContainer}>
              {/* Share Button */}
              <TouchableOpacity
                style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
                onPress={handleShare}
                disabled={sharing}
                activeOpacity={0.8}
              >
                {sharing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="share-social-outline" size={20} color="#fff" />
                    <Text style={styles.shareBtnText}>Save / Share Pass</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Captured Pass */}
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1.0 }}
                style={styles.viewShot}
              >
                <DigitalPass data={passData} />
              </ViewShot>

              {/* Generate Another */}
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={18} color="#94A3B8" />
                <Text style={styles.resetBtnText}>Generate Another Pass</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────

function FormLabel({ label, required }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.formLabel}>{label}</Text>
      {required && <Text style={styles.requiredMark}>*</Text>}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050A14" },
  scrollContent: { paddingBottom: 48 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: "#050A14",
    borderBottomWidth: 1,
    borderBottomColor: "#0E1628",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6366F122",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 0.4,
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // Form
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 6,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 14, marginBottom: 6 },
  formLabel: { fontSize: 13, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.8 },
  requiredMark: { fontSize: 14, color: "#EF4444", fontWeight: "800" },
  eventsNote: { fontSize: 12, color: "#475569", marginBottom: 10, marginTop: -2 },
  input: {
    backgroundColor: "#0E1628",
    borderWidth: 1.5,
    borderColor: "#1E2A3A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#F1F5F9",
    fontWeight: "500",
  },

  // Pills (reg type / food pref)
  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E1628",
    borderWidth: 1.5,
    borderColor: "#1E2A3A",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  pillActive: { borderColor: "#6366F1", backgroundColor: "#1A1F3A" },
  pillNonVeg: { borderColor: "#EF4444", backgroundColor: "#2A0A0A" },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  pillTextActive: { color: "#E2E8F0", fontWeight: "700" },

  // Generate button
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    gap: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  // Pass view
  passContainer: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  viewShot: { borderRadius: 20, overflow: "hidden" },

  // Share button
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 10,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  shareBtnDisabled: { opacity: 0.6 },
  shareBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },

  // Reset button
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#1E2A3A",
    borderRadius: 14,
    backgroundColor: "#0E1628",
  },
  resetBtnText: { fontSize: 14, fontWeight: "600", color: "#94A3B8" },
});
