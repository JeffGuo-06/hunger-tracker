import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native";
import { colors } from "../theme";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: colors.bg[1], borderTopColor: colors.bg[2] }, tabBarActiveTintColor: colors.bg[4], tabBarInactiveTintColor: colors.text[2], headerShown: false}}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}  
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="eat"
        options={{
          title: "Muck",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={28} name="hamburger" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={20} name="user-friends" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={20} name="user-circle" color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}
