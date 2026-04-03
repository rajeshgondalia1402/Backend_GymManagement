import { Request, Response } from 'express';
import * as hireTrainerService from './hire-trainer.service';
import { successResponse, paginatedResponse, errorResponse } from '../../../common/utils/response.util';
import logger from '../../../common/utils/logger.util';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.sendOtp(req.body);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Send OTP error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.verifyOtp(req.body);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Verify OTP error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const checkVerification = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.checkVerification(req.body.email);
    return successResponse(res, result, 'Verification status retrieved');
  } catch (error: any) {
    logger.error('Check verification error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const saveStep = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.saveStep(req.body);
    return successResponse(res, result, 'Step data saved successfully');
  } catch (error: any) {
    logger.error('Save step error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.submitApplication(req.body.email);
    return successResponse(res, { id: result.id }, 'Application submitted successfully');
  } catch (error: any) {
    logger.error('Submit application error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const resumeDraft = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.resumeDraft(req.body.email, req.body.mobile);
    return successResponse(res, result, 'Draft retrieved successfully');
  } catch (error: any) {
    logger.error('Resume draft error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const searchTrainers = async (req: Request, res: Response) => {
  try {
    const { items, total, page, limit } = await hireTrainerService.searchTrainers(req.query as any);
    return paginatedResponse(res, items, page, limit, total, 'Trainers retrieved successfully');
  } catch (error: any) {
    logger.error('Search trainers error', { error: error.message });
    return errorResponse(res, error.message, 500);
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }
    const result = await hireTrainerService.getMyProfile(email);
    return successResponse(res, result, 'Trainer profile retrieved');
  } catch (error: any) {
    logger.error('Get my profile error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const updateTrainerProfile = async (req: Request, res: Response) => {
  try {
    const { email, ...updateData } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }
    const result = await hireTrainerService.updateTrainerProfile(email, updateData);
    return successResponse(res, result, 'Profile updated successfully');
  } catch (error: any) {
    logger.error('Update trainer profile error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const getTrainerProfile = async (req: Request, res: Response) => {
  try {
    const result = await hireTrainerService.getTrainerProfile(req.params.id);
    return successResponse(res, result, 'Trainer profile retrieved');
  } catch (error: any) {
    logger.error('Get trainer profile error', { error: error.message });
    return errorResponse(res, error.message, 404);
  }
};

export const uploadCertificate = async (req: Request, res: Response) => {
  try {
    const { hireTrainerId } = req.body;

    if (!hireTrainerId) {
      return errorResponse(res, 'Trainer application ID is required', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const fileData = {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    const result = await hireTrainerService.uploadCertificate(hireTrainerId, fileData);
    return successResponse(res, result, 'Certificate uploaded successfully', 201);
  } catch (error: any) {
    logger.error('Upload certificate error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};
