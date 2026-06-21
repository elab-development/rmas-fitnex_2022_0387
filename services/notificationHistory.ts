import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_REMINDERS } from '../constants/reminders';

const STORAGE_KEY = '@fitnex_notification_log';
const MAX_ITEMS = 100;

export type NotificationHistoryItem = {
  id: string;
  title: string;
  body: string;
  date: string; // ISO timestamp
  type: 'reminder' | 'instant';
};

/**
 * Persist a notification into local history so it can be shown later
 * in the "all notifications sent so far" list.
 */
export async function logNotification(
  title: string,
  body: string,
  type: NotificationHistoryItem['type'] = 'instant'
) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: NotificationHistoryItem[] = raw ? JSON.parse(raw) : [];

    const entry: NotificationHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      date: new Date().toISOString(),
      type,
    };

    const updated = [entry, ...existing].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log('notificationHistory log error:', error);
  }
}

/**
 * Daily reminders fire on a schedule even if the app is closed, so the OS
 * may never hand us a "received" event to log. To make sure the list still
 * reflects reality, we compute which of today's scheduled reminders should
 * already have fired by now and treat those as virtual history entries.
 */
function getTodaysPassedReminders(): NotificationHistoryItem[] {
  const now = new Date();
  const items: NotificationHistoryItem[] = [];

  for (const reminder of DAILY_REMINDERS) {
    const reminderTime = new Date();
    reminderTime.setHours(reminder.hour, reminder.minute, 0, 0);

    if (reminderTime.getTime() <= now.getTime()) {
      items.push({
        id: `daily-${reminder.hour}-${reminder.minute}-${now.toDateString()}`,
        title: reminder.title,
        body: reminder.body,
        date: reminderTime.toISOString(),
        type: 'reminder',
      });
    }
  }

  return items;
}

/**
 * Returns every notification "sent" up to the moment this is called:
 * real logged entries (instant + actually-received) merged with computed
 * daily reminders whose time has already passed today, de-duplicated.
 */
export async function getNotificationHistory(): Promise<NotificationHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: NotificationHistoryItem[] = raw ? JSON.parse(raw) : [];

    const todayKey = new Date().toDateString();
    const storedTodayTitles = new Set(
      stored.filter((item) => new Date(item.date).toDateString() === todayKey).map((item) => item.title)
    );

    const virtual = getTodaysPassedReminders().filter((item) => !storedTodayTitles.has(item.title));

    const merged = [...stored, ...virtual];
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return merged;
  } catch (error) {
    console.log('notificationHistory get error:', error);
    return [];
  }
}

export async function clearNotificationHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log('notificationHistory clear error:', error);
  }
}