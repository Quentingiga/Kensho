// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 1️⃣ CONFIGURATION
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 2️⃣ ENREGISTREMENT
export async function registerSystemNotifications() {
  console.log("🛡️ [Initialisation] Vérification du Système...");
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('system-alerts', {
      name: 'Alerte du Système',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#ef4444',
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
      console.log("❌ Permissions refusées.");
      return false;
    }
    return true;
  }
  return false;
}

let updateTimeout;

// 3️⃣ LA FONCTION MAÎTRESSE (Enfin propre et infaillible)
export function updateSystemNotifications(quests) {
  if (updateTimeout) clearTimeout(updateTimeout);

  updateTimeout = setTimeout(async () => {
    console.log("🚀 [Système] Purge et reprogrammation...");
    
    try {
      // Nettoyage total
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
      
      // ☀️ ALARME DU MATIN (8h00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "☀️ PROTOCOLE MATINAL",
          body: "Le Système t'observe. Commence tes quêtes.",
          sound: true,
          color: "#06b6d4",
        },
        trigger: {
          type: 'daily', // 🎯 LE MOT MAGIQUE QUI BLOQUE LE DÉCLENCHEMENT IMMÉDIAT
          hour: 8,
          minute: 0,
          channelId: Platform.OS === 'android' ? 'system-alerts' : undefined,
        },
      });

      // ⚠️ ALARMES DU SOIR (21h00)
      const unfinishedQuests = quests.filter(q => q.daily && !q.done);

      if (unfinishedQuests.length > 0) {
        for (const q of unfinishedQuests) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ RAPPEL NOCTURNE",
              body: `Quête incomplète : "${q.title}" (Rang ${q.diff}). Dépêche-toi.`,
              sound: true,
              color: "#ef4444",
            },
            trigger: {
              type: 'daily', // 🎯 LE MOT MAGIQUE
              hour: 21,
              minute: 0,
              channelId: Platform.OS === 'android' ? 'system-alerts' : undefined,
            },
          });
        }
        console.log(`🎯 [Bilan] Alertes programmées pour 8h00 et 21h00 (${unfinishedQuests.length} quêtes).`);
      } else {
        console.log("🎯 [Bilan] Quêtes finies. Seule l'alerte de 8h00 est active.");
      }

    } catch (error) {
      console.error("❌ Erreur globale :", error);
    }
  }, 2000); 
}