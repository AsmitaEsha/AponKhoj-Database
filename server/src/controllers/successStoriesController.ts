import { db } from '../db.js';
import { Request, Response } from 'express';
import cloudinary from 'cloudinary';

/* ─────────────────────────────────────────────────────────────
   PUBLIC  GET /api/success-stories
   Returns only published stories (public facing)
───────────────────────────────────────────────────────────── */
export const getPublishedStories = async (req: Request, res: Response) => {
  try {
    const { division, page = '1', limit = '9' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 9, 50);
    const skip = (parseInt(page) - 1) * take;

    const where: any = { status: 'published' };
    if (division && division !== 'all') where.division = division;

    const [stories, total] = await Promise.all([
      db.successStory.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take,
        skip,
        select: {
          id: true, title: true, summary: true, personName: true,
          division: true, district: true, photoUrl: true,
          daysLost: true, reunionDate: true, publishedAt: true,
          createdAt: true,
        },
      }),
      db.successStory.count({ where }),
    ]);

    res.json({
      stories,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error fetching published stories:', error);
    res.status(500).json({ message: 'Failed to fetch success stories' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUBLIC  GET /api/success-stories/:id
   Returns a single published story with full content
───────────────────────────────────────────────────────────── */
export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const story = await db.successStory.findFirst({
      where: { id: parseInt(id), status: 'published' },
      include: {
        admin: { select: { firstName: true, lastName: true } },
        missingReport: { select: { id: true, name: true, district: true } },
      },
    });

    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Failed to fetch story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  GET /api/success-stories/admin/all
   Returns ALL stories (any status) for admin management
───────────────────────────────────────────────────────────── */
export const getAllStoriesAdmin = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 10, 100);
    const skip = (parseInt(page) - 1) * take;

    const where: any = {};
    if (status && status !== 'all') where.status = status;

    const [stories, total] = await Promise.all([
      db.successStory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          admin: { select: { firstName: true, lastName: true } },
          missingReport: { select: { id: true, name: true } },
        },
      }),
      db.successStory.count({ where }),
    ]);

    res.json({
      stories,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error fetching admin stories:', error);
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  POST /api/success-stories
   Create a new draft or published story
───────────────────────────────────────────────────────────── */
export const createStory = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const {
      title, content, summary, personName, division, district,
      daysLost, reunionDate, missingReportId, status = 'draft', imageBase64,
    } = req.body;

    if (!title || !content || !personName || !division) {
      return res.status(400).json({ message: 'Title, content, person name and division are required' });
    }

    let photoUrl: string | undefined;
    let cloudinaryPublicId: string | undefined;

    if (imageBase64) {
      const upload = await cloudinary.v2.uploader.upload(imageBase64, {
        folder: 'aponkhoj/success-stories',
        transformation: [{ width: 1200, height: 800, crop: 'fill' }],
      });
      photoUrl = upload.secure_url;
      cloudinaryPublicId = upload.public_id;
    }

    const story = await db.successStory.create({
      data: {
        title,
        content,
        summary: summary || content.slice(0, 200),
        personName,
        division,
        district,
        daysLost: daysLost ? parseInt(daysLost) : undefined,
        reunionDate: reunionDate ? new Date(reunionDate) : undefined,
        missingReportId: missingReportId ? parseInt(missingReportId) : undefined,
        status,
        publishedAt: status === 'published' ? new Date() : undefined,
        photoUrl,
        cloudinaryPublicId,
        createdBy: adminId,
      },
    });

    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Failed to create story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  PUT /api/success-stories/:id
   Update a story (edit content, status, publish/unpublish)
───────────────────────────────────────────────────────────── */
export const updateStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, content, summary, personName, division, district,
      daysLost, reunionDate, missingReportId, status, imageBase64,
    } = req.body;

    const existing = await db.successStory.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ message: 'Story not found' });

    let photoUrl = existing.photoUrl ?? undefined;
    let cloudinaryPublicId = existing.cloudinaryPublicId ?? undefined;

    if (imageBase64) {
      // Delete old image if exists
      if (existing.cloudinaryPublicId) {
        await cloudinary.v2.uploader.destroy(existing.cloudinaryPublicId).catch(() => {});
      }
      const upload = await cloudinary.v2.uploader.upload(imageBase64, {
        folder: 'aponkhoj/success-stories',
        transformation: [{ width: 1200, height: 800, crop: 'fill' }],
      });
      photoUrl = upload.secure_url;
      cloudinaryPublicId = upload.public_id;
    }

    const wasPublished = existing.status === 'published';
    const isPublishing = status === 'published' && !wasPublished;

    const story = await db.successStory.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(summary !== undefined && { summary: summary || content?.slice(0, 200) }),
        ...(personName && { personName }),
        ...(division && { division }),
        ...(district !== undefined && { district }),
        ...(daysLost !== undefined && { daysLost: daysLost ? parseInt(daysLost) : null }),
        ...(reunionDate !== undefined && { reunionDate: reunionDate ? new Date(reunionDate) : null }),
        ...(missingReportId !== undefined && { missingReportId: missingReportId ? parseInt(missingReportId) : null }),
        ...(status && { status, publishedAt: isPublishing ? new Date() : (status === 'draft' ? null : existing.publishedAt) }),
        ...(imageBase64 && { photoUrl, cloudinaryPublicId }),
      },
    });

    res.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: 'Failed to update story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  PATCH /api/success-stories/:id/publish
   Quick toggle publish/unpublish
───────────────────────────────────────────────────────────── */
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.successStory.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ message: 'Story not found' });

    const newStatus = existing.status === 'published' ? 'draft' : 'published';
    const story = await db.successStory.update({
      where: { id: parseInt(id) },
      data: {
        status: newStatus,
        publishedAt: newStatus === 'published' ? new Date() : null,
      },
    });

    res.json(story);
  } catch (error) {
    console.error('Error toggling story publish:', error);
    res.status(500).json({ message: 'Failed to update story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  DELETE /api/success-stories/:id
   Delete a story and its Cloudinary image
───────────────────────────────────────────────────────────── */
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.successStory.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ message: 'Story not found' });

    if (existing.cloudinaryPublicId) {
      await cloudinary.v2.uploader.destroy(existing.cloudinaryPublicId).catch(() => {});
    }

    await db.successStory.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Failed to delete story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN  GET /api/success-stories/admin/stats
   Quick stats for dashboard widget
───────────────────────────────────────────────────────────── */
export const getStoryStats = async (req: Request, res: Response) => {
  try {
    const [total, published, drafts] = await Promise.all([
      db.successStory.count(),
      db.successStory.count({ where: { status: 'published' } }),
      db.successStory.count({ where: { status: 'draft' } }),
    ]);
    res.json({ total, published, drafts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
