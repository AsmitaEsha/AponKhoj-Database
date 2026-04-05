import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get paginated published missing reports with server-side filters
 * 
 * @param {Object} filters
 * @param {string}  [filters.district]   — exact district name or "all" for all
 * @param {number}  [filters.age_min]    — minimum age
 * @param {number}  [filters.age_max]    — maximum age
 * @param {string}  [filters.gender]     — "male" | "female" | "other" | "all"
 * @param {string}  [filters.search]     — name search string
 * @param {string}  [filters.sort]       — "newest" | "oldest" | "age_asc" | "age_desc"
 * @param {number}  [filters.page]       — page number (default 1)
 * @param {number}  [filters.per_page]   — items per page (default 9)
 * @returns {Promise<Object>}
 */
export const getPublishedReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.district && filters.district !== 'all') {
      params.set('district', filters.district);
    }
    if (filters.age_min && Number(filters.age_min) > 0) {
      params.set('age_min', filters.age_min);
    }
    if (filters.age_max && Number(filters.age_max) < 100) {
      params.set('age_max', filters.age_max);
    }
    if (filters.gender && filters.gender !== 'all') {
      params.set('gender', filters.gender);
    }
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters.sort && filters.sort !== 'newest') {
      params.set('sort', filters.sort);
    }
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page);
    }
    if (filters.per_page) {
      params.set('per_page', filters.per_page);
    }

    const qs = params.toString();
    const url = `${API_URL}/missing-reports/published${qs ? `?${qs}` : ''}`;
    
    console.log('📡 Fetching missing reports from:', url);
    const response = await axios.get(url);

    return {
      success: true,
      reports: response.data.reports || [],
      total: response.data.total || 0,
      last_page: response.data.last_page || 1,
      current_page: response.data.current_page || 1,
    };
  } catch (error) {
    console.error('❌ Fetch reports error:', error.message);
    return {
      success: false,
      reports: [],
      total: 0,
      last_page: 1,
      current_page: 1,
      message: error.response?.data?.message || error.message || 'Failed to fetch reports',
    };
  }
};

/**
 * Get single published report by id
 */
export const getPublishedReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/missing-reports/published/${id}`);
    return {
      success: true,
      report: response.data.report || null,
    };
  } catch (error) {
    console.error('❌ Fetch single report error:', error.message);
    return {
      success: false,
      report: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch report details',
    };
  }
};

/**
 * Get public missing report stats
 */
export const getMissingReportStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/missing-reports/stats`);
    return {
      success: true,
      totalSubmitted: Number(response.data.totalSubmitted || 0),
      totalApproved: Number(response.data.totalApproved || 0),
      totalPending: Number(response.data.totalPending || 0),
    };
  } catch (error) {
    console.error('❌ Fetch report stats error:', error.message);
    return {
      success: false,
      totalSubmitted: 0,
      totalApproved: 0,
      totalPending: 0,
      message: error.message || 'Failed to fetch report stats',
    };
  }
};