export type DailyReminder = {
  title: string;
  body: string;
  hour: number;
  minute: number;
};

export const DAILY_REMINDERS: DailyReminder[] = [
  {
    title: '🌅 Rise & Grind!',
    body: 'Champions wake up early. Log your breakfast and start strong! 💪',
    hour: 7,
    minute: 30,
  },
  {
    title: '🔥 Morning Check-in',
    body: "Your goals don't care about your excuses. Let's move! 🏃",
    hour: 9,
    minute: 0,
  },
  {
    title: '🥗 Fuel Your Body',
    body: 'You are what you eat. Log your lunch and stay on track!',
    hour: 12,
    minute: 30,
  },
  {
    title: '⚡ Afternoon Boost',
    body: "The only bad workout is the one that didn't happen. GO! 🏋️",
    hour: 15,
    minute: 0,
  },
  {
    title: '💪 Workout Reminder',
    body: 'Your future self will thank you. Time to hit the gym! 🎯',
    hour: 17,
    minute: 30,
  },
  {
    title: '🍽️ Dinner Time',
    body: "Don't forget to log your dinner. Every meal counts! 🥦",
    hour: 19,
    minute: 0,
  },
  {
    title: '📊 Daily Summary',
    body: 'How did you do today? Check your Fitnex Score! 🏆',
    hour: 21,
    minute: 0,
  },
  {
    title: '🌙 Night Recovery',
    body: 'Rest is part of the process. Great work today, champion! ⭐',
    hour: 22,
    minute: 0,
  },
];