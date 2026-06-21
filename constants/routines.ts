export type RoutineContent = {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  image?: any;
  intro: string;
  tips: string[];
  icon?: { name: string; set: 'ionicons' | 'material' };
};

export const ROUTINES: Record<string, RoutineContent> = {
  runner: {
    key: 'runner',
    title: "Runner's Diet",
    subtitle: 'Feel your run',
    color: '#E2F4C5',
    image: require('../assets/running-icon.png'),
    intro:
      "Fuel built for distance. A runner's plate balances fast-burning carbs for energy with lean protein for recovery, so you can push further without running on empty.",
    tips: [
      'Eat a carb-rich meal 2-3 hours before a long run, like oats, banana, or whole-grain toast.',
      'Rehydrate with electrolytes, not just water, after sessions over 45 minutes.',
      'Pair every meal with a protein source to speed up muscle recovery.',
      'Keep a quick snack like dates or a banana on hand for runs over 10km.',
      "Don't skip healthy fats. They support joint health over the long run.",
    ],
  },
  cooking: {
    key: 'cooking',
    title: 'Cooking Tips',
    subtitle: 'Fuel your fun',
    color: '#FFEF96',
    image: require('../assets/cooking-icon.png'),
    intro:
      'Good nutrition starts in the kitchen. A few smart habits make healthy eating easier, tastier, and far less time-consuming.',
    tips: [
      'Batch-cook grains and proteins on Sundays to save time during the week.',
      'Roast vegetables at high heat (200°C+) to lock in flavor without extra oil.',
      'Season early, taste often. Layering flavor beats dumping salt at the end.',
      'Keep herbs and spices stocked. They turn simple meals into great ones.',
      'Use a kitchen scale for portions. It is faster and more accurate than guessing.',
    ],
  },
   more: {
    key: 'more',
    title: 'More For You',
    subtitle: 'Fresh ideas every day',
    color: '#E5E0FF',
    icon: { name: 'sparkles', set: 'ionicons' },
    intro:
      "We're building out a full library of routines tailored to your goals — strength, recovery, hydration, sleep, and more. Until that's ready, here are a few simple habits that work for everyone, any day of the week.",
    tips: [
      'Drink a glass of water first thing in the morning to kickstart your metabolism.',
      'Aim for 7-9 hours of sleep — recovery is where progress actually happens.',
      "Move for at least 20 minutes daily, even if it's just a walk.",
      "Plan tomorrow's meals tonight so you're never caught off guard.",
      'Celebrate small wins. Consistency beats intensity.',
    ],
  },
};