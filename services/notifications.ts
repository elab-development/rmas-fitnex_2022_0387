import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export const notificationService = {

  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleDailyReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const reminders = [
        {
            title: '🌅 Rise & Grind!',
            body: 'Champions wake up early. Log your breakfast and start strong! 💪',
            hour: 7,
            minute: 30,
        },
        {
            title: '🔥 Morning Check-in',
            body: 'Your goals don\'t care about your excuses. Let\'s move! 🏃',
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
            body: 'The only bad workout is the one that didn\'t happen. GO! 🏋️',
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
            body: 'Don\'t forget to log your dinner. Every meal counts! 🥦',
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
   

    for (const reminder of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
        },
      });
    }
  },

  async sendInstantNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};