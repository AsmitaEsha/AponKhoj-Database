import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * GET /api/districts
 * Fetch all districts with optional filtering
 * Query params:
 *   - divisionId: number - Filter by division ID
 *   - search: string - Search districts by name
 */
router.get('/', async (req: any, res: any) => {
  try {
    const { divisionId, search } = req.query;
    
    const where: any = {};
    
    if (divisionId) {
      where.divisionId = parseInt(divisionId);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bn: { contains: search } }
      ];
    }

    const districts = await db.district.findMany({
      where,
      include: {
        division: {
          select: { id: true, name: true, bn: true }
        }
      },
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

/**
 * GET /api/districts/:districtId
 * Fetch a single district with its division
 */
router.get('/:districtId', async (req: any, res: any) => {
  try {
    const { districtId } = req.params;

    const district = await db.district.findUnique({
      where: { id: parseInt(districtId) },
      include: {
        division: {
          select: { id: true, name: true, bn: true }
        }
      }
    });

    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ error: 'Failed to fetch district' });
  }
});

export default router;
