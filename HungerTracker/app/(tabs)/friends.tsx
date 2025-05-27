import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { colors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import AddContacts from "../components/AddContacts";
import { Ionicons } from "@expo/vector-icons";

export default function Friends() {
  const [search, setSearch] = useState("");

  return (
    
    <SafeAreaView style={styles.container} edges={["top"]}>
      
      <Text style={styles.text}>Friends</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.text[2]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends..."
          placeholderTextColor={colors.text[2]}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView>
      <AddContacts /> 
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[2],
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: colors.text[1],
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text[2],
    fontSize: 16,
    fontWeight: "normal",
    textAlign: 'left',
    marginTop: 4,
  },
  searchBar: {
    width: '90%',
    height: 40,
    flexDirection: 'row',      
    alignItems: 'center',     
    backgroundColor: colors.bg[1],
    borderRadius: 12,
    paddingHorizontal: 12,    
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,                   
    color: colors.text[1],
    fontSize: 16,
  },
});