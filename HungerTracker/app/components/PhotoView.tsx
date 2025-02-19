import { Image } from "expo-image";
import { Alert, View, Text } from "react-native";
import IconButton from "./IconButton";
import { shareAsync } from "expo-sharing";
import { saveToLibraryAsync } from "expo-media-library";
import CustomButton from "./CustomButton";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

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
      <View className="absolute bottom-4 px-4 w-full">
        <CustomButton
          title="Post"
          handlePress={() => {
            Alert.alert("Post");
          }}
          textStyles="text-white"
          isLoading={false}
        />
      </View>
    </Animated.View>
  );
}
