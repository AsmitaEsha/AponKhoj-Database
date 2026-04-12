import { db } from '../db.js';
import { Request, Response } from 'express';
import { CloudinaryService } from '../services/cloudinaryService.js';

const cloudinaryService = new CloudinaryService();

function normalizeDistrictValue(value?: string | null): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Notify all users in the same district about a new missing person report.
 * Called after a report is approved and published.
 * The reporter themselves are excluded.
 */
async function notifyDistrictUsers(
  reportId: number,
  reporterUserId: number,
  district: string,
  personName: string
): Promise<void> {
  try {
    const normalizedDistrict = normalizeDistrictValue(district);
    if (!normalizedDistrict) return;

    // Find candidate users (district/location may be in either field for legacy records)
    const candidateUsers = await db.user.findMany({
      where: {
        id: { not: reporterUserId },
      },
      select: { id: true, district: true, location: true },
    });

    const usersInDistrict = candidateUsers.filter((u) => {
      const userDistrict = normalizeDistrictValue(u.district || u.location);
      return userDistrict === normalizedDistrict;
    });

    if (usersInDistrict.length === 0) return;

    // Bulk-create one area alert per user
    await db.alertNotification.createMany({
      data: usersInDistrict.map((u) => ({
        userId: u.id,
        reportId: reportId,
        district: district,
        title: '🔔 আপনার এলাকায় নিখোঁজ রিপোর্ট',
        message: `আপনার এলাকায় একটি নিখোঁজ রিপোর্ট হয়েছে — "${personName}"।`,
        isRead: false,
      })),
    });
  } catch (err) {
    // Non-critical — log but don't block the response
    console.error('Failed to send district notifications:', err);
  }
}

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
      districtId,
      address,
      clothingDescription,
      additionalInfo,
      contactPersonName,
      contactPhone,
    } = req.body;
    const userId = (req as any).userId;

    // Handle districtId or district string
    let resolvedDistrictId: number | null = null;
    let resolvedDistrictName: string = '';

    if (districtId) {
      const districtRecord = await db.district.findUnique({
        where: { id: parseInt(districtId) }
      });
      if (districtRecord) {
        resolvedDistrictId = districtRecord.id;
        resolvedDistrictName = districtRecord.name;
      }
    } else {
      const trimmedDistrict = typeof district === 'string' ? district.trim() : '';
      
      if (trimmedDistrict) {
        // Try to find matching district in database
        const districtRecord = await db.district.findFirst({
          where: {
            OR: [
              { name: { contains: trimmedDistrict } },
              { bn: { contains: trimmedDistrict } }
            ]
          }
        });

        if (districtRecord) {
          resolvedDistrictId = districtRecord.id;
          resolvedDistrictName = districtRecord.name;
        } else {
          resolvedDistrictName = trimmedDistrict;
        }
      }
    }

    if (!name || !resolvedDistrictName || !contactPersonName || !contactPhone) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: {
          name: !name ? ['Name is required'] : undefined,
          district: !resolvedDistrictName ? ['District is required'] : undefined,
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
        district: resolvedDistrictName,
        districtId: resolvedDistrictId,
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

/**
 * Get paginated published missing reports with server-side filters
 * Query params: district, age_min, age_max, gender, search, sort, page, per_page
 */
export const getPublished = async (req: Request, res: Response) => {
  try {
    const {
      district,
      age_min,
      age_max,
      gender,
      search,
      sort = 'newest',
      page = '1',
      per_page = '9',
    } = req.query;

    // Build where clause dynamically
    const where: any = {
      approved: true,
      status: 'published',
    };

    // Filter by district
    if (district && typeof district === 'string' && district !== 'all') {
      where.district = district;
    }

    // Filter by age range
    const ageMin = age_min && typeof age_min === 'string' ? parseInt(age_min) : null;
    const ageMax = age_max && typeof age_max === 'string' ? parseInt(age_max) : null;

    if (ageMin !== null && ageMin > 0) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [{ age: null }, { age: { gte: ageMin } }],
      });
    }

    if (ageMax !== null && ageMax < 100) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [{ age: null }, { age: { lte: ageMax } }],
      });
    }

    // Filter by gender
    if (gender && typeof gender === 'string' && gender !== 'all') {
      where.gender = gender;
    }

    // Search by name - NO mode parameter for MS SQL
    if (search && typeof search === 'string' && search.trim()) {
      where.name = {
        contains: search.trim(),
      };
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    const sortValue = typeof sort === 'string' ? sort : 'newest';
    switch (sortValue) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'age_asc':
        orderBy = [{ age: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
        break;
      case 'age_desc':
        orderBy = [{ age: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Pagination
    const perPageNum = typeof per_page === 'string' ? parseInt(per_page) : 9;
    const pageNum = typeof page === 'string' ? parseInt(page) : 1;
    const perPage = Math.min(perPageNum || 9, 50);
    const pageNumber = Math.max(pageNum || 1, 1);
    const skip = (pageNumber - 1) * perPage;

    // Fetch total count and reports
    const [total, reports] = await Promise.all([
      db.missingPersonReport.count({ where }),
      db.missingPersonReport.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    const lastPage = Math.ceil(total / perPage) || 1;

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
      reports: mapped,
      total,
      per_page: perPage,
      current_page: pageNumber,
      last_page: lastPage,
      count: mapped.length,
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
    const { limit = '50' } = req.query;

    const reports = await db.missingPersonReport.findMany({
      where: {
        approved: false,
        status: 'pending',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(typeof limit === 'string' ? limit : '50'),
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

    const wasAlreadyPublished = report.approved && report.status === 'published';

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
        message: `আপনার নিখোঁজ রিপোর্ট "${report.name}" অনুমোদন করা হয়েছে। এটি এখন সার্চ পেজে প্রদর্শিত হচ্ছে।`,
        reportType: 'missing_person',
        reportId: parseInt(id),
      },
    });

    // Send area alert only after report approval/publish
    if (!wasAlreadyPublished) {
      await notifyDistrictUsers(report.id, report.userId, report.district, report.name);
    }

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