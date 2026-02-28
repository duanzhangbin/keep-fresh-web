import schedule from 'node-schedule';
import prisma from '../lib/prisma.js';
import { sendReminderNotification } from '../services/push.service.js';

const scheduledJobs: Map<string, schedule.Job> = new Map();

function getExpiringItems(userId: string, daysAhead: number) {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.item.findMany({
    where: {
      userId,
      status: 0,
      expDate: {
        gte: today.toISOString().split('T')[0],
        lte: futureDate.toISOString().split('T')[0],
      },
    },
    select: {
      name: true,
      expDate: true,
    },
  });
}

export async function checkAndSendReminders() {
  console.log('开始检查过期物品提醒...');

  const users = await prisma.user.findMany({
    include: {
      settings: true,
    },
  });

  for (const user of users) {
    const settings = user.settings;
    if (!settings || !settings.pushEnabled) {
      continue;
    }

    const hasSubscription = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (!hasSubscription) {
      continue;
    }

    const expiringItems = await getExpiringItems(user.id, settings.reminderThreshold);
    
    if (expiringItems.length > 0) {
      console.log(`用户 ${user.id} 有 ${expiringItems.length} 件即将过期`);
      await sendReminderNotification(
        user.id,
        expiringItems.map((item: { name: string; expDate: string | null }) => ({
          name: item.name,
          expDate: item.expDate || '',
        }))
      );
    }
  }

  console.log('提醒检查完成');
}

export function scheduleReminderForUser(userId: string, time: string) {
  const [hour, minute] = time.split(':').map(Number);
  
  const existingJob = scheduledJobs.get(userId);
  if (existingJob) {
    existingJob.cancel();
  }

  const job = schedule.scheduleJob({ hour, minute }, async () => {
    await checkAndSendReminders();
  });

  if (job) {
    scheduledJobs.set(userId, job);
    console.log(`为用户 ${userId} 设置了提醒任务: ${time}`);
  }
}

export function cancelReminderForUser(userId: string) {
  const existingJob = scheduledJobs.get(userId);
  if (existingJob) {
    existingJob.cancel();
    scheduledJobs.delete(userId);
    console.log(`已取消用户 ${userId} 的提醒任务`);
  }
}

export async function initializeAllReminders() {
  const users = await prisma.user.findMany({
    include: {
      settings: true,
    },
  });

  for (const user of users) {
    if (user.settings?.pushEnabled && user.settings?.reminderTime) {
      scheduleReminderForUser(user.id, user.settings.reminderTime);
    }
  }

  console.log(`已为 ${users.length} 个用户初始化提醒任务`);
}

export function stopAllReminders() {
  for (const [userId, job] of scheduledJobs) {
    job.cancel();
    console.log(`已停止用户 ${userId} 的提醒任务`);
  }
  scheduledJobs.clear();
}
