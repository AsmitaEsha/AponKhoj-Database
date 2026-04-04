import { db } from '../db.js';
import { Request, Response } from 'express';
import { CloudinaryService } from '../services/cloudinaryService.js';

const cloudinaryService = new CloudinaryService();

export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      lastSeenDate,
      lastSeenTime,
      district,
      address,
      clothingDescription,
      additionalInfo,
      contactPersonName,
      contactPhone,
    } = req.body;
    const userId = (req as any).userId;

    if (!name || !district || !contactPersonName || !contactPhone) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: {
          name: !name ? ['Name is required'] : undefined,
          district: !district ? ['District is required'] : undefined,
          contactPersonName: !contactPersonName ? ['Contact person name is required'] : undefined,
          contactPhone: !contactPhone ? ['Contact phone is required'] : undefined,
        },
      });
    }

    let photoUrl = null;
    let publicId = null;

    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(req.file, 'aponkhoj/missing-reports');
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: `Photo upload failed: ${uploadResult.message}`,
        });
      }
      photoUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const report = await db.missingPersonReport.create({
      data: {
        userId,
        name,
        age: age ? parseInt(age) : null,
        gender,
        height,
        lastSeenDate: lastSeenDate ? new Date(lastSeenDate) : null,
        lastSeenTime,
        district,
        address,
        clothingDescription,
        additionalInfo,
        contactPersonName,
        contactPhone,
        photoUrl,
        cloudinaryPublicId: publicId,
        status: 'pending',
        approved: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. It will be reviewed by our team.',
      report: {
        id: report.id,
        status: report.status,
        approved: report.approved,
      },
    });
  } catch (error) {
    console.error('Error creating missing person report:', error);
    res.status(500).json({
      success: false,
      message: `An error occurred while submitting the report: ${(error as any).message}`,
    });
  }
};

export const getPublished = async (req: Request, res: Response) => {
  try {
    const reports = await db.missingPersonReport.findMany({
      where: {
        approved: true,
        status: 'published',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = reports.map((report) => ({
      id: report.id,
      name: report.name,
      age: report.age,
      gender: report.gender,
      height: report.height,
      photoUrl: report.photoUrl,
      lastSeenDate: report.lastSeenDate?.toISOString().split('T')[0],
      lastSeenTime: report.lastSeenTime,
      district: report.district,
      address: report.address,
      clothingDescription: report.clothingDescription,
      additionalInfo: report.additionalInfo,
      contactPersonName: report.contactPersonName,
      contactPhone: report.contactPhone,
      createdAt: report.createdAt.toISOString().split('T')[0],
      user: report.user,
    }));

    res.json({
      success: true,
      count: mapped.length,
      reports: mapped,
    });
  } catch (error) {
    console.error('Error fetching published missing reports:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching reports: ${(error as any).message}`,
    });
  }
};

export const getPublishedById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await db.missingPersonReport.findFirst({
      where: {
        id: parseInt(id),
        approved: true,
        status: 'published',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.json({
      success: true,
      report: {
        id: report.id,
        name: report.name,
        age: report.age,
        gender: report.gender,
        height: report.height,
        photoUrl: report.photoUrl,
        lastSeenDate: report.lastSeenDate?.toISOString().split('T')[0],
        lastSeenTime: report.lastSeenTime,
        district: report.district,
        address: report.address,
        clothingDescription: report.clothingDescription,
        additionalInfo: report.additionalInfo,
        contactPersonName: report.contactPersonName,
        contactPhone: report.contactPhone,
        createdAt: report.createdAt.toISOString(),
        user: report.user,
      },
    });
  } catch (error) {
    console.error('Error fetching missing report:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching report details: ${(error as any).message}`,
    });
  }
};

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const totalSubmitted = await db.missingPersonReport.count();
    const totalApproved = await db.missingPersonReport.count({
      where: { approved: true, status: 'published' },
    });
    const totalPending = await db.missingPersonReport.count({
      where: { status: 'pending' },
    });

    res.json({
      success: true,
      totalSubmitted,
      totalApproved,
      totalPending,
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching report stats: ${(error as any).message}`,
    });
  }
};

export const getMyReports = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const reports = await db.missingPersonReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = reports.map((report) => ({
      id: report.id,
      name: report.name,
      age: report.age,
      gender: report.gender,
      height: report.height,
      status: report.status,
      approved: report.approved,
      photoUrl: report.photoUrl,
      lastSeenDate: report.lastSeenDate?.toISOString().split('T')[0],
      lastSeenTime: report.lastSeenTime,
      district: report.district,
      address: report.address,
      clothingDescription: report.clothingDescription,
      additionalInfo: report.additionalInfo,
      contactPersonName: report.contactPersonName,
      contactPhone: report.contactPhone,
      rejectionReason: report.rejectionReason,
      createdAt: report.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      count: mapped.length,
      reports: mapped,
    });
  } catch (error) {
    console.error('Error fetching user missing reports:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching your reports: ${(error as any).message}`,
    });
  }
};

export const getPending = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const reports = await db.missingPersonReport.findMany({
      where: {
        approved: false,
        status: 'pending',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
    });

    const mapped = reports.map((report) => ({
      id: report.id,
      type: 'missing_report',
      title: `Missing Report: ${report.name}`,
      submittedBy: report.user?.email || 'Unknown',
      date: report.createdAt.toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      description: report.additionalInfo,
      district: report.district,
      age: report.age,
      gender: report.gender,
      height: report.height,
      photoUrl: report.photoUrl,
      clothingDescription: report.clothingDescription,
      contactPersonName: report.contactPersonName,
      contactPhone: report.contactPhone,
      lastSeenDate: report.lastSeenDate?.toISOString().split('T')[0],
      address: report.address,
      userId: report.userId,
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching pending missing reports:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching pending reports: ${(error as any).message}`,
    });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).userId;

    const report = await db.missingPersonReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const updated = await db.missingPersonReport.update({
      where: { id: parseInt(id) },
      data: {
        approved: true,
        status: 'published',
      },
    });

    await db.adminAction.create({
      data: {
        adminId,
        reportType: 'missing_person',
        reportId: parseInt(id),
        action: 'approved',
      },
    });

    // Notify the report owner
    await db.notification.create({
      data: {
        userId: report.userId,
        type: 'report_approved',
        title: 'রিপোর্ট অনুমোদিত হয়েছে ✅',
        message: `আপনার নিখোঁজ রিপোর্ট "${report.name}" অনুমোদন করা হয়েছে। এটি এখন সার্চ পেজে দেখা যাচ্ছে।`,
        reportType: 'missing_person',
        reportId: parseInt(id),
      },
    });

    res.json({
      success: true,
      message: 'Report approved and published',
      report: {
        id: updated.id,
        status: updated.status,
        approved: updated.approved,
      },
    });
  } catch (error) {
    console.error('Error approving missing report:', error);
    res.status(500).json({
      success: false,
      message: `Error approving report: ${(error as any).message}`,
    });
  }
};

export const reject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).userId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: { reason: ['Reason is required'] },
      });
    }

    const report = await db.missingPersonReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.cloudinaryPublicId) {
      await cloudinaryService.deleteImage(report.cloudinaryPublicId);
    }

    const updated = await db.missingPersonReport.update({
      where: { id: parseInt(id) },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });

    await db.adminAction.create({
      data: {
        adminId,
        reportType: 'missing_person',
        reportId: parseInt(id),
        action: 'rejected',
        reason,
      },
    });

    // Notify the report owner
    await db.notification.create({
      data: {
        userId: report.userId,
        type: 'report_rejected',
        title: 'রিপোর্ট প্রত্যাখ্যান হয়েছে ❌',
        message: `আপনার নিখোঁজ রিপোর্ট "${report.name}" প্রত্যাখ্যান করা হয়েছে। কারণ: ${reason}`,
        reportType: 'missing_person',
        reportId: parseInt(id),
      },
    });

    res.json({
      success: true,
      message: 'Report rejected',
      report: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error('Error rejecting missing report:', error);
    res.status(500).json({
      success: false,
      message: `Error rejecting report: ${(error as any).message}`,
    });
  }
};