import * as Notifications from 'expo-notifications';
import { DAILY_REMINDERS } from '../constants/reminders';
import { logNotification } from './notificationHistory';

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

    for (const reminder of DAILY_REMINDERS) {
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

    // Instant notifikacije okidaju odmah, pa ih logujemo odmah
    // umesto da čekamo OS "received" event.
    await logNotification(title, body, 'instant');
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Pozvati jednom (npr. u root layout-u) da bi se svaka notifikacija
   * koja stvarno stigne dok je app otvoren/foregroundovan ulogovala.
   * Vraća subscription da pozivalac može da ga ukloni pri unmount-u.
   */
  registerReceivedListener() {
    return Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      if (title) {
        logNotification(title, body ?? '', 'reminder');
      }
    });
  },
};