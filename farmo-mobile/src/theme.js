// FARMO Color Palette — White · Green · Yellow
export const COLORS = {
    // Greens
    primary: '#2E7D32',   // deep forest green
    primaryLight: '#4CAF50',   // medium green
    primaryMid: '#66BB6A',   // app card borders
    primaryPale: '#E8F5E9',   // very light green bg

    // Yellows / Ambers
    accent: '#F9A825',   // golden yellow
    accentLight: '#FFF9C4',   // pale yellow bg
    accentMid: '#FFD54F',   // medium amber
    accentDark: '#F57F17',   // deep amber

    // White / Neutrals
    white: '#FFFFFF',
    offWhite: '#F8FBF8',
    surface: '#F1F8F1',
    surfaceCard: '#FFFFFF',

    // Text
    textDark: '#1B3A1F',
    textMid: '#388E3C',
    textGray: '#5D7560',
    textLight: '#90A893',
    textHint: '#BDBDBD',

    // Status
    success: '#43A047',
    warning: '#FB8C00',
    danger: '#E53935',
    info: '#1E88E5',

    // Divider / Border
    border: '#C8E6C9',
    borderLight: '#E8F5E9',

    // Shadow
    shadow: 'rgba(46,125,50,0.12)',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 20,
        xl: 24,
        xxl: 30,
        hero: 36,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 999,
};

export const SHADOW = {
    card: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
    },
    heavy: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 8,
    },
};
