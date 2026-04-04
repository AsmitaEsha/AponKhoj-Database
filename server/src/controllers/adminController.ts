import { db } from '../db.js';
import { Request, Response } from 'express';

export const stats = async (req: Request, res: Response) => {
  try {
    const totalReports = await db.missingPersonReport.count();
    const closedReports = await db.missingPersonReport.count({
      where: { approved: true },
    });
    const activeMissing = Math.max(totalReports - closedReports, 0);
    const users = await db.user.count();
    const newUsersWeek = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const successRate = totalReports > 0 ? Math.round((closedReports / totalReports) * 100 * 10) / 10 : 0;

    const monthlyData = await getMonthlyReportSeries();
    const statusData = getStatusDistribution(totalReports, closedReports, activeMissing);
    const divisions = await getDivisionDistribution();
    const recentUsers = await getRecentUsers();
    const activity = await getActivityFeed();

    res.json({
      stats: {
        totalReports,
        activeMissing,
        reunions: closedReports,
        users,
        newUsersWeek,
        successRate,
      },
      monthlyData,
      statusData,
      divisions,
      recentUsers,
      activity,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching stats: ${(error as any).message}`,
    });
  }
};

export const recentReports = async (req: Request, res: Response) => {
  try {
    const reports = await db.missingPersonReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const mapped = reports.map((report) => ({
      id: report.id,
      name: report.name,
      age: report.age,
      district: report.district,
      status: report.approved ? 'closed' : 'pending',
      date: report.createdAt.toISOString().split('T')[0],
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching recent reports: ${(error as any).message}`,
    });
  }
};

export const moderationStats = async (req: Request, res: Response) => {
  try {
    const pendingReviews = await db.missingPersonReport.count({
      where: { approved: false, status: 'pending' },
    });

    const resolvedToday = await db.missingPersonReport.count({
      where: {
        approved: true,
        updatedAt: {
          gte: new Date(new Date().toDateString()),
        },
      },
    });

    res.json({
      pendingReviews,
      highPriority: 0,
      resolvedToday,
      avgResponseTime: 'N/A',
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching moderation stats: ${(error as any).message}`,
    });
  }
};

export const moderationReports = async (req: Request, res: Response) => {
  try {
    const missingReports = await db.missingPersonReport.findMany({
      where: { approved: false, status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 15,
      include: { user: { select: { email: true } } },
    });

    const foundReports = await db.foundPersonReport.findMany({
      where: { approved: false, status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 10,
      include: { user: { select: { email: true } } },
    });

    const mapped = [
      ...missingReports.map((report) => ({
        id: report.id,
        type: 'missing_report',
        title: `Missing Report: ${report.name}`,
        submittedBy: report.user?.email || 'Unknown',
        date: report.createdAt.toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        description: report.additionalInfo,
        district: report.district,
      })),
      ...foundReports.map((report) => ({
        id: report.id,
        type: 'found_report',
        title: `Found Report: ${report.name}`,
        submittedBy: report.user?.email || 'Unknown',
        date: report.createdAt.toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        description: report.additionalInfo,
        district: report.district,
      })),
    ];

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching moderation reports:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching moderation reports: ${(error as any).message}`,
    });
  }
};

export const moderationFlaggedUsers = async (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
};

export const moderationAppeals = async (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
};

async function getMonthlyReportSeries() {
  const series = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const count = await db.missingPersonReport.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    series.push({
      label: date.toLocaleString('default', { month: 'short' }),
      value: count,
    });
  }

  return series;
}

function getStatusDistribution(total: number, closed: number, active: number) {
  const segments = [
    { label: 'Pending', value: active, color: '#f59e0b' },
    { label: 'Verified', value: 0, color: '#3b82f6' },
    { label: 'Matched', value: 0, color: '#8b5cf6' },
    { label: 'Closed', value: closed, color: '#10b981' },
  ];

  return segments.map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));
}

async function getDivisionDistribution() {
  const reports = await db.missingPersonReport.findMany({
    select: { district: true },
  });

  const counts = new Map<string, number>();
  reports.forEach((report) => {
    const district = report.district || 'Unknown';
    counts.set(district, (counts.get(district) || 0) + 1);
  });

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const max = sorted[0]?.[1] || 0;

  return sorted.map(([name, count]) => ({
    name,
    count,
    max,
  }));
}

async function getRecentUsers() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return users.map((user) => ({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    joined: getTimeAgo(user.createdAt),
  }));
}

async function getActivityFeed() {
  const reports = await db.missingPersonReport.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const activity = [
    ...reports.map((report) => ({
      text: report.approved
        ? `Report approved: ${report.name}`
        : `New report submitted: ${report.name}`,
      time: getTimeAgo(report.updatedAt),
      type: report.approved ? 'verify' : 'system',
      ts: report.updatedAt.getTime(),
    })),
    ...users.map((user) => ({
      text: `New user registered: ${user.email}`,
      time: getTimeAgo(user.createdAt),
      type: 'user',
      ts: user.createdAt.getTime(),
    })),
  ];

  return activity.sort((a, b) => b.ts - a.ts).slice(0, 8);
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}