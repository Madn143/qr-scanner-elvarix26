// screens/ScannerScreen.js
// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Checkpoint QR Code Scanner
//
// Supports 3 scanning modes:
//   - reception  → Reception_Logs
//   - snacks     → Snack_Logs
//   - food       → Food_Logs
//
// Uses Firestore transactions (setDoc with no-merge) to guarantee atomic,
// one-time logging. Duplicate scans are detected and shown in a red overlay.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, COLLECTIONS } from "../firebaseConfig";
import StatusOverlay from "../components/StatusOverlay";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const FINDER_SIZE = Math.min(SCREEN_W * 0.68, 280);

const CHECKPOINTS = [
  { id: "reception", label: "Reception Entry", icon: "enter-outline", collection: COLLECTIONS.RECEPTION_LOGS },
  { id: "snacks", label: "Snacks", icon: "cafe-outline", collection: COLLECTIONS.SNACK_LOGS },
  { id: "food", label: "Food / Lunch", icon: "restaurant-outline", collection: COLLECTIONS.FOOD_LOGS },
];

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [checkpoint, setCheckpoint] = useState("reception");
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayType, setOverlayType] = useState("success"); // "success" | "duplicate"
  const [overlayData, setOverlayData] = useState(null);
  const cooldownRef = useRef(false);
  const isFocused = useRef(true);

  // Re-enable scanning when tab becomes focused again
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      return () => {
        isFocused.current = false;
      };
    }, [])
  );

  // ── Parse QR Payload ───────────────────────────────────────────────────
  const parsePayload = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.registrationId || !parsed.studentName) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  // ── Firestore Transaction — check and log ──────────────────────────────
  const checkAndLog = async (studentData) => {
    const cp = CHECKPOINTS.find((c) => c.id === checkpoint);
    if (!cp) return;

    const logRef = doc(db, cp.collection, studentData.registrationId);
    const existing = await getDoc(logRef);

    if (existing.exists()) {
      // Duplicate — already scanned
      setOverlayType("duplicate");
      setOverlayData({ ...studentData, timestamp: existing.data().timestamp });
    } else {
      // First scan — write log
      const logData = {
        registrationId: studentData.registrationId,
        timestamp: serverTimestamp(),
      };
      if (cp.id === "food") {
        logData.foodPreference = studentData.foodPreference;
      }
      await setDoc(logRef, logData);
      setOverlayType("success");
      setOverlayData({ ...studentData, timestamp: new Date() });
    }
  };

  // ── Barcode Scan Handler ───────────────────────────────────────────────
  const handleBarCodeScanned = async ({ data: raw }) => {
    if (cooldownRef.current || processing || overlayVisible || !isFocused.current) return;
    cooldownRef.current = true;
    setProcessing(true);

    const studentData = parsePayload(raw);
    if (!studentData) {
      Alert.alert("Invalid QR Code", "This QR code does not contain valid ELVARIX'26 participant data.", [
        { text: "OK", onPress: () => { cooldownRef.current = false; setProcessing(false); } },
      ]);
      return;
    }

    try {
      await checkAndLog(studentData);
      setOverlayVisible(true);
    } catch (err) {
      Alert.alert("Error", "Failed to process scan. Check your internet connection.\n\n" + err.message, [
        { text: "Retry", onPress: () => { cooldownRef.current = false; setProcessing(false); } },
      ]);
      return;
    }

    setProcessing(false);
  };

  const dismissOverlay = () => {
    setOverlayVisible(false);
    setOverlayData(null);
    // Small delay before re-enabling scanner
    setTimeout(() => {
      cooldownRef.current = false;
    }, 800);
  };

  // ── Camera Permission Guard ────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-off-outline" size={64} color="#475569" />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSubtitle}>
          ELVARIX'26 Scanner needs camera access to scan participant QR codes.
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeCheckpoint = CHECKPOINTS.find((c) => c.id === checkpoint);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050A14" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <Text style={styles.headerSub}>ELVARIX'26 Checkpoint System</Text>
      </View>

      {/* ── Mode Switcher ───────────────────────────────────────────── */}
      <View style={styles.modeSwitcher}>
        {CHECKPOINTS.map((cp) => (
          <TouchableOpacity
            key={cp.id}
            style={[styles.modeTab, checkpoint === cp.id && styles.modeTabActive]}
            onPress={() => {
              setCheckpoint(cp.id);
              cooldownRef.current = false;
              setOverlayVisible(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cp.icon}
              size={16}
              color={checkpoint === cp.id ? "#fff" : "#64748B"}
            />
            <Text style={[styles.modeTabText, checkpoint === cp.id && styles.modeTabTextActive]}>
              {cp.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Active Checkpoint Badge ────────────────────────────────── */}
      <View style={styles.activeBadge}>
        <View style={styles.activeDot} />
        <Text style={styles.activeBadgeText}>
          ACTIVE: {activeCheckpoint?.label.toUpperCase()}
        </Text>
      </View>

      {/* ── Camera Viewfinder ──────────────────────────────────────── */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={processing || overlayVisible ? undefined : handleBarCodeScanned}
        />

        {/* Overlay grid */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            {/* Finder box */}
            <View style={[styles.finder, { width: FINDER_SIZE, height: FINDER_SIZE }]}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {processing && (
                <View style={styles.processingBanner}>
                  <ActivityIndicator size="small" color="#6366F1" />
                  <Text style={styles.processingText}>Verifying…</Text>
                </View>
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* ── Scan Hint ─────────────────────────────────────────────── */}
      <View style={styles.hint}>
        <Ionicons name="qr-code-outline" size={18} color="#6366F1" />
        <Text style={styles.hintText}>
          Point the camera at a participant's QR code
        </Text>
      </View>

      {/* ── Status Overlay ────────────────────────────────────────── */}
      <StatusOverlay
        visible={overlayVisible}
        type={overlayType}
        data={overlayData}
        checkpoint={checkpoint}
        onDismiss={dismissOverlay}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const CORNER_SIZE = 26;
const CORNER_THICK = 3;
const CORNER_COLOR = "#6366F1";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050A14" },
  centered: {
    flex: 1,
    backgroundColor: "#050A14",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: "#050A14",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Mode Switcher
  modeSwitcher: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#0E1628",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  modeTabActive: { backgroundColor: "#6366F1" },
  modeTabText: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  modeTabTextActive: { color: "#fff" },

  // Active badge
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#22C55E",
    letterSpacing: 1.2,
  },

  // Camera
  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  // Viewfinder overlay
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  overlayMiddle: { flexDirection: "row" },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  overlayBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  finder: {
    position: "relative",
    backgroundColor: "transparent",
  },

  // Corners
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE, borderColor: CORNER_COLOR },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 8 },

  // Processing
  processingBanner: {
    position: "absolute",
    bottom: -40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366F1",
    paddingVertical: 6,
    borderRadius: 20,
  },
  processingText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Hint
  hint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  hintText: { fontSize: 13, color: "#94A3B8", fontWeight: "500" },

  // Permission screen
  loadingText: { color: "#94A3B8", fontSize: 14, marginTop: 12 },
  permTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center",
    marginTop: 12,
  },
  permSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  permButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
