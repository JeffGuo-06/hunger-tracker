export const colors = {
  text: {
    1: "#FFFFFF",      // Text Primary
    2: "#AEAEAE",    // Text Secondary\
    3: "#707070"
  },
  acc: {
    p1: "#D732A8",      // Color Primary1
    p2: "#A78BFA",      // Color Primary2
    s1: "#D732A8",    // Color Secondary1
  },
  bg: {
    1: "rgb(10, 10, 10)",    // Background 1
    2: "rgb(41, 41, 41)",    // Background 2
    3: "rgb(143, 143, 143)",    // Background 3
    4: "rgb(255, 255, 255)",    // Background 4
  },
  grad: {
    p1: ['#D732A8', '#FF8D4D'] as const,   //   ⬅︎  two-colour array
  },
  border: "#3A3A3A",  // Border color
  buttonText: "#0F0F0F",
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};
  
export const fontSizes = {
    small: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
};

const theme = {
  colors,
  spacing,
  fontSizes,
};

export default theme;

