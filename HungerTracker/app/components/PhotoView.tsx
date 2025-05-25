import { Image } from "expo-image";
import { Alert, View, Text, StyleSheet  } from "react-native";
import IconButton from "./IconButton";
import { shareAsync } from "expo-sharing";
import { saveToLibraryAsync } from "expo-media-library";
import CustomButton from "./CustomButton";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { colors } from "../theme";

interface PhotoViewProps {
  photo: string;
  setPhoto: React.Dispatch<React.SetStateAction<string>>;
}
export default function PhotoView({ photo, setPhoto }: PhotoViewProps) {
  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 1,
          paddingTop: 50,
          right: 20,
        }}
      >
        <IconButton
          onPress={() => setPhoto("")}
          iosName={"xmark"}
          androidName="close"
        />
      </View>
      <Image
        source={photo}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 5,
        }}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Post"
          handlePress={() => {
            Alert.alert("Post");
          }}
          containerStyles="bg-acc-p1 rounded-xl min-h-[56px]"
          textStyles="text-white font-psemibold text-lg"
          isLoading={false}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
});
