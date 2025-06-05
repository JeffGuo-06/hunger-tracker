import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
    runOnJS,
    useAnimatedGestureHandler,
    ReanimatedLogLevel,
    configureReanimatedLogger
} from 'react-native-reanimated';
import { Link } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

configureReanimatedLogger({ 
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
});

export default function Post({ post }: { post: { id: string, user: { name: string, profileImage: any }, subtitle: string, imageUrl: any, comments: number } }) {
    const scale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const initialFocalX = useSharedValue(0);
    const initialFocalY = useSharedValue(0);
    const isInitialPinch = useSharedValue(true);
    const lastScale = useSharedValue(1);
    const lastOffsetX = useSharedValue(0);
    const lastOffsetY = useSharedValue(0);

    // Sensitivity factors
    const ZOOM_SENSITIVITY = 0.7;
    const PAN_SENSITIVITY = 0.6;

    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            const imageCenter = SCREEN_WIDTH / 2;
            initialFocalX.value = e.focalX - imageCenter;
            initialFocalY.value = e.focalY - imageCenter;
            isInitialPinch.value = true;
        })
        .onUpdate((e) => {
            const targetScale = 1 + (e.scale - 1) * ZOOM_SENSITIVITY;
            scale.value = withSpring(targetScale, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            
            if (scale.value > 1) {
                const imageCenter = SCREEN_WIDTH / 2;
                const currentFocalX = e.focalX - imageCenter;
                const currentFocalY = e.focalY - imageCenter;

                if (isInitialPinch.value) {
                    offsetX.value = withSpring(-initialFocalX.value * (scale.value - 1) * PAN_SENSITIVITY, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                    offsetY.value = withSpring(-initialFocalY.value * (scale.value - 1) * PAN_SENSITIVITY, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                    isInitialPinch.value = false;
                }
                const targetOffsetX = (currentFocalX - initialFocalX.value) * scale.value * PAN_SENSITIVITY;
                const targetOffsetY = (currentFocalY - initialFocalY.value) * scale.value * PAN_SENSITIVITY;
                offsetX.value = withSpring(targetOffsetX, {
                    damping: 50,
                    stiffness: 400,
                    mass: 0.5
                });
                offsetY.value = withSpring(targetOffsetY, {
                    damping: 50,
                    stiffness: 400,
                    mass: 0.5
                });
            }
        })
        .onEnd(() => {
            scale.value = withSpring(1, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            offsetX.value = withSpring(0, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            offsetY.value = withSpring(0, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            isInitialPinch.value = true;
        }); 

    const panGesture = Gesture.Pan()
        .onUpdate(() => {
            // Panning is handled by the pinch gesture
        })
        .minPointers(2)
        .maxPointers(2)
        .enabled(scale.value > 1);

    const composed = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
            { scale: scale.value },
        ],
    }));

    const zoomIndicatorStyle = useAnimatedStyle(() => ({
        opacity: scale.value > 1 ? 1 : 0,
    }));

    const commentButtonStyle = useAnimatedStyle(() => ({
        opacity: scale.value > 1 ? 0 : 1,
        transform: [
            { scale: scale.value > 1 ? 0.8 : 1 }
        ]
    }));

    return (
        <View style={styles.container}>
            <Link href="/(stack)/viewprofile" asChild>
                <TouchableOpacity style={styles.header}>
                    <Image source={post.user.profileImage} style={styles.profileImage} />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{post.user.name}</Text>
                        <Text style={styles.subtitle}>{post.subtitle}</Text>
                    </View>
                </TouchableOpacity>
            </Link>
            <View style={styles.imageContainer}>
                <GestureDetector gesture={composed}>
                    <Animated.View style={styles.imageContainer}>
                        <Animated.Image 
                            source={post.imageUrl} 
                            style={[styles.image, animatedStyle]}
                            resizeMode="cover"
                        />
                    </Animated.View>
                </GestureDetector>
                <Animated.View style={[styles.commentOverlay, commentButtonStyle]}>
                    <View style={styles.infoContainer}>
                        <Ionicons name="chatbubble" size={24} color={colors.text[1]} />
                        <Text style={styles.comments}>{post.comments}</Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        backgroundColor: colors.bg[1],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: { 
        marginLeft: 10,
    },
    userName: { 
        fontWeight: 'bold', 
        fontSize: 16,
        color: colors.text[1],
    },
    subtitle: {
        fontSize: 12,
        color: colors.text[2],
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    commentOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        shadowColor: 'rgb(0, 0, 0)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    comments: {
        marginLeft: 5,
        color: colors.text[1],
        fontWeight: '500',
    },
});