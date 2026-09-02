import { useFonts } from 'expo-font';

export const FONTS = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extrabold: 'Outfit_800ExtraBold',
  display: 'SpaceGrotesk_700Bold',
};

export function useCustomFonts() {
  return useFonts({
    Outfit_400Regular: require('../assets/fonts/Outfit-Regular.ttf'),
    Outfit_500Medium: require('../assets/fonts/Outfit-Medium.ttf'),
    Outfit_600SemiBold: require('../assets/fonts/Outfit-SemiBold.ttf'),
    Outfit_700Bold: require('../assets/fonts/Outfit-Bold.ttf'),
    Outfit_800ExtraBold: require('../assets/fonts/Outfit-ExtraBold.ttf'),
    SpaceGrotesk_700Bold: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
  });
}
