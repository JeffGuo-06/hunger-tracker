import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";
import AddContacts from "../components/AddContacts";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
        <Text style={styles.title}>Friends</Text>
        
      <AddContacts />
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
});