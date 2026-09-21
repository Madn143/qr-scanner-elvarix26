// App.js
// ─────────────────────────────────────────────────────────────────────────────
// Root component — Bottom Tab Navigator with 2 tabs:
//   Tab 1: ScannerScreen  (QR checkpoint scanner)
//   Tab 2: PassGeneratorScreen  (on-spot registration & pass export)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import ScannerScreen from "./screens/ScannerScreen";
import PassGeneratorScreen from "./screens/PassGeneratorScreen";

const Tab = createBottomTabNavigator();

// ── Custom Tab Bar Icon ───────────────────────────────────────────────────

function TabIcon({ name, focused, color }) {
  return (
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
      <Ionicons name={name} size={22} color={focused ? "#fff" : color} />
    </View>
  );
}

// ── Tab Bar Label ─────────────────────────────────────────────────────────

function TabLabel({ label, focused }) {
  return (
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  );
}

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: tabStyles.tabBar,
          tabBarActiveTintColor: "#6366F1",
          tabBarInactiveTintColor: "#475569",
          tabBarShowLabel: true,
        }}
      >
        <Tab.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? "qr-code" : "qr-code-outline"} focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused, color }) => (
              <TabLabel label="Scanner" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="PassGenerator"
          component={PassGeneratorScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? "id-card" : "id-card-outline"} focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused, color }) => (
              <TabLabel label="Pass Generator" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#080D1A",
    borderTopColor: "#0F1A2E",
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  iconWrapper: {
    width: 40,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#6366F1",
    fontWeight: "700",
  },
});
