export type IconSet = 'ionicons' | 'material';

export type FoodItem = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  icon: string;
  iconSet: IconSet;
  color: string;
};

export type FoodCategory = {
  key: string;
  label: string;
  icon: string;
  iconSet: IconSet;
  items: FoodItem[];
};

// Nutrition values are approximate, per 100g.
export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    key: 'vegetable',
    label: 'Vegetable',
    icon: 'flame',
    iconSet: 'ionicons',
    items: [
      {
        id: 'v1',
        name: 'Broccoli',
        kcal: 55,
        protein: 4,
        carbs: 11,
        fat: 0.6,
        description: 'Rich in vitamin C, K and fiber, plus antioxidants that support immunity and natural detox.',
        icon: 'leaf',
        iconSet: 'ionicons',
        color: '#E2F4C5',
      },
      {
        id: 'v2',
        name: 'Spinach',
        kcal: 23,
        protein: 3,
        carbs: 4,
        fat: 0.4,
        description: 'Packed with iron and folate, great for blood health, energy and bone strength.',
        icon: 'leaf',
        iconSet: 'ionicons',
        color: '#D8F0C2',
      },
      {
        id: 'v3',
        name: 'Carrot',
        kcal: 41,
        protein: 1,
        carbs: 10,
        fat: 0.2,
        description: 'High in beta-carotene (vitamin A), supports eye health and skin, naturally sweet and crunchy.',
        icon: 'nutrition',
        iconSet: 'ionicons',
        color: '#FFE8B8',
      },
      {
        id: 'v4',
        name: 'Bell Pepper',
        kcal: 31,
        protein: 1,
        carbs: 6,
        fat: 0.3,
        description: 'One of the richest sources of vitamin C, low-calorie and full of antioxidants.',
        icon: 'nutrition',
        iconSet: 'ionicons',
        color: '#FFD6D6',
      },
    ],
  },
  {
    key: 'meat',
    label: 'Meat',
    icon: 'heart',
    iconSet: 'ionicons',
    items: [
      {
        id: 'm1',
        name: 'Chicken Breast',
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        description: 'Lean, high-quality protein that supports muscle repair and growth with minimal fat.',
        icon: 'fast-food',
        iconSet: 'ionicons',
        color: '#FFE3E3',
      },
      {
        id: 'm2',
        name: 'Lean Beef',
        kcal: 217,
        protein: 26,
        carbs: 0,
        fat: 11,
        description: 'Excellent source of iron, zinc and B12, essential for energy and red blood cell production.',
        icon: 'fast-food',
        iconSet: 'ionicons',
        color: '#F5D6D6',
      },
      {
        id: 'm3',
        name: 'Salmon',
        kcal: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        description: 'Loaded with omega-3 fatty acids that support heart and brain health, plus quality protein.',
        icon: 'fish',
        iconSet: 'material',
        color: '#FFE0EC',
      },
      {
        id: 'm4',
        name: 'Turkey',
        kcal: 135,
        protein: 30,
        carbs: 0,
        fat: 1,
        description: 'Very lean protein, lower in fat than most red meats — great for lean muscle maintenance.',
        icon: 'food-drumstick',
        iconSet: 'material',
        color: '#FFEFD5',
      },
    ],
  },
  {
    key: 'fruit',
    label: 'Fruit',
    icon: 'food-apple',
    iconSet: 'material',
    items: [
      {
        id: 'f1',
        name: 'Banana',
        kcal: 89,
        protein: 1,
        carbs: 23,
        fat: 0.3,
        description: 'High in potassium and fast-digesting carbs — perfect quick energy before or after exercise.',
        icon: 'food-apple',
        iconSet: 'material',
        color: '#FFF6CC',
      },
      {
        id: 'f2',
        name: 'Apple',
        kcal: 52,
        protein: 0,
        carbs: 14,
        fat: 0.2,
        description: 'Rich in fiber, especially pectin, which supports digestion and keeps you full longer.',
        icon: 'food-apple',
        iconSet: 'material',
        color: '#FFE0E0',
      },
      {
        id: 'f3',
        name: 'Blueberries',
        kcal: 57,
        protein: 1,
        carbs: 14,
        fat: 0.3,
        description: 'Among the highest antioxidant levels of any fruit — may support brain and heart health.',
        icon: 'fruit-cherries',
        iconSet: 'material',
        color: '#E3DFFF',
      },
      {
        id: 'f4',
        name: 'Orange',
        kcal: 47,
        protein: 1,
        carbs: 12,
        fat: 0.1,
        description: 'A classic source of vitamin C and fiber that helps support a healthy immune system.',
        icon: 'fruit-citrus',
        iconSet: 'material',
        color: '#FFE2B8',
      },
    ],
  },
  {
    key: 'carbs',
    label: 'Carbs',
    icon: 'bread-slice',
    iconSet: 'material',
    items: [
      {
        id: 'c1',
        name: 'Brown Rice',
        kcal: 112,
        protein: 3,
        carbs: 24,
        fat: 0.9,
        description: 'A whole grain with more fiber and nutrients than white rice, for steady, lasting energy.',
        icon: 'rice',
        iconSet: 'material',
        color: '#F2E9D8',
      },
      {
        id: 'c2',
        name: 'Oats',
        kcal: 389,
        protein: 17,
        carbs: 66,
        fat: 7,
        description: 'Rich in beta-glucan fiber, known to help lower cholesterol and keep you full for hours.',
        icon: 'bowl-mix',
        iconSet: 'material',
        color: '#EFE3CE',
      },
      {
        id: 'c3',
        name: 'Sweet Potato',
        kcal: 86,
        protein: 2,
        carbs: 20,
        fat: 0.1,
        description: 'Loaded with beta-carotene and fiber — a nutrient-dense alternative to regular potatoes.',
        icon: 'food-variant',
        iconSet: 'material',
        color: '#FFE3C2',
      },
      {
        id: 'c4',
        name: 'Whole Wheat Bread',
        kcal: 247,
        protein: 13,
        carbs: 41,
        fat: 3.4,
        description: 'Provides complex carbs and fiber for sustained energy, plus more nutrients than white bread.',
        icon: 'bread-slice',
        iconSet: 'material',
        color: '#F0DFC4',
      },
    ],
  },
];