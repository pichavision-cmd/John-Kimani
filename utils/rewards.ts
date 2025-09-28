// This file can contain logic related to user rewards, points, etc.

export const calculatePoints = (action: string): number => {
    switch (action) {
        case 'complete_profile':
            return 100;
        case 'add_reminder':
            return 10;
        case 'daily_login':
            return 5;
        default:
            return 0;
    }
};

export const checkForAchievements = (profile: any, actions: string[]) => {
    const achievements: string[] = [];
    if (profile.isComplete) {
        achievements.push('Profile Pro');
    }
    if (actions.filter(a => a === 'add_reminder').length >= 5) {
        achievements.push('Super Organized');
    }
    return achievements;
};
