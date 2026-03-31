// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Comportement de la notification quand l'app est ouverte (on veut qu'elle s'affiche quand même)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerSystemNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('system-alerts', {
      name: 'Alerte du Système',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500], // Double vibration menaçante
      lightColor: '#ef4444', // Rouge "Pénalité"
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission refusée. Le Système ne peut pas envoyer d\'alertes.');
      return false;
    }
    return true;
  }
  return false;
}

export async function schedulePenaltyWarning() {
  // On annule les anciennes alertes pour éviter les spams
  await Notifications.cancelAllScheduledNotificationsAsync();

  // On programme l'alerte pour 21h00 tous les jours
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ AVERTISSEMENT DU SYSTÈME",
      body: "Tes quêtes quotidiennes ne sont pas terminées. La faiblesse a un prix... Complète-les avant minuit pour éviter la pénalité.",
      sound: true,
      color: "#ef4444", // Couleur rouge sur Android
    },
    trigger: {
      hour: 21,
      minute: 0,
      repeats: true,
    },
  });
  console.log("⏰ Menace du Système programmée pour 21h00");
}

export async function cancelSystemWarning() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("✅ Quêtes accomplies : Menace du Système désactivée");
}