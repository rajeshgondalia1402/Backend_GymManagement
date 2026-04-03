import { Request, Response } from 'express';
import * as vacancyService from './trainer-vacancy.service';
import { successResponse, paginatedResponse, errorResponse } from '../../../common/utils/response.util';
import logger from '../../../common/utils/logger.util';

export const createVacancy = async (req: Request, res: Response) => {
  try {
    const result = await vacancyService.createVacancy(req.body);
    return successResponse(res, result, 'Vacancy created successfully', 201);
  } catch (error: any) {
    logger.error('Create vacancy error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const updateVacancy = async (req: Request, res: Response) => {
  try {
    const { gymOwnerLeadEmail, ...updateData } = req.body;
    const result = await vacancyService.updateVacancy(req.params.id, gymOwnerLeadEmail, updateData);
    return successResponse(res, result, 'Vacancy updated successfully');
  } catch (error: any) {
    logger.error('Update vacancy error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const deleteVacancy = async (req: Request, res: Response) => {
  try {
    const { gymOwnerLeadEmail } = req.body;
    const result = await vacancyService.deleteVacancy(req.params.id, gymOwnerLeadEmail);
    return successResponse(res, result, 'Vacancy deleted successfully');
  } catch (error: any) {
    logger.error('Delete vacancy error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const getMyVacancies = async (req: Request, res: Response) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }
    const result = await vacancyService.getMyVacancies(email);
    return successResponse(res, result, 'Vacancies retrieved successfully');
  } catch (error: any) {
    logger.error('Get my vacancies error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const searchVacancies = async (req: Request, res: Response) => {
  try {
    const { items, total, page, limit } = await vacancyService.searchVacancies(req.query as any);
    return paginatedResponse(res, items, page, limit, total, 'Vacancies retrieved successfully');
  } catch (error: any) {
    logger.error('Search vacancies error', { error: error.message });
    return errorResponse(res, error.message, 500);
  }
};

export const getVacancy = async (req: Request, res: Response) => {
  try {
    const result = await vacancyService.getVacancy(req.params.id);
    return successResponse(res, result, 'Vacancy retrieved');
  } catch (error: any) {
    logger.error('Get vacancy error', { error: error.message });
    return errorResponse(res, error.message, 404);
  }
};
