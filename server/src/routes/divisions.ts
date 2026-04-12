import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * GET /api/divisions
 * Fetch all divisions with their districts
 * Query params:
 *   - withDistricts: boolean (default: true) - Include districts with each division
 */
router.get('/', async (req: any, res: any) => {
  try {
    const withDistricts = req.query.withDistricts !== 'false';

    const divisions = withDistricts
      ? await db.division.findMany({
          include: {
            districts: {
              select: { id: true, name: true, bn: true, createdAt: true },
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        })
      : await db.division.findMany({
          orderBy: { name: 'asc' }
        });

    res.json({
      success: true,
      data: divisions,
      count: divisions.length
    });
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});

/**
 * GET /api/divisions/:divisionId
 * Fetch a single division with its districts
 */
router.get('/:divisionId', async (req: any, res: any) => {
  try {
    const { divisionId } = req.params;

    const division = await db.division.findUnique({
      where: { id: parseInt(divisionId) },
      include: {
        districts: {
          select: { id: true, name: true, bn: true, createdAt: true },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    res.json({
      success: true,
      data: division
    });
  } catch (error) {
    console.error('Error fetching division:', error);
    res.status(500).json({ error: 'Failed to fetch division' });
  }
});

/**
 * GET /api/divisions/:divisionId/districts
 * Fetch districts for a specific division
 */
router.get('/:divisionId/districts', async (req: any, res: any) => {
  try {
    const { divisionId } = req.params;

    const districts = await db.district.findMany({
      where: { divisionId: parseInt(divisionId) },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: districts,
      count: districts.length
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

export default router;
