import webpush from 'web-push';
import prisma from '../lib/prisma.js';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  'mailto:support@freshkeep.app',
  vapidPublicKey,
  vapidPrivateKey
);

export function getVapidPublicKey() {
  return vapidPublicKey;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function saveSubscription(userId: string, subscription: PushSubscription) {
  const existing = await prisma.pushSubscription.findFirst({
    where: {
      userId,
      endpoint: subscription.endpoint,
    },
  });

  if (!existing) {
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }
}

export async function deleteSubscription(userId: string, endpoint: string) {
  await prisma.pushSubscription.deleteMany({
    where: {
      userId,
      endpoint,
    },
  });
}

export async function sendPushNotification(userId: string, title: string, body: string) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({
          title,
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      );
    } catch (error: any) {
      console.error('Push notification error:', error.statusCode);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription.delete({
          where: { id: sub.id },
        });
      }
    }
  }
}

export async function sendReminderNotification(userId: string, expiringItems: { name: string; expDate: string }[]) {
  if (expiringItems.length === 0) return;

  const title = 'FreshKeep 提醒';
  const body = `您有 ${expiringItems.length} 件物品即将过期：\n${expiringItems
    .slice(0, 3)
    .map(item => `- ${item.name} (${item.expDate})`)
    .join('\n')}${expiringItems.length > 3 ? `\n...等${expiringItems.length}件` : ''}`;

  await sendPushNotification(userId, title, body);
}
