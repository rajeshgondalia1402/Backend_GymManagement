import { Request, Response } from 'express';
import * as gymOwnerLeadService from './gym-owner-lead.service';
import { successResponse, errorResponse } from '../../../common/utils/response.util';
import logger from '../../../common/utils/logger.util';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.sendOtp(req.body);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Gym-owner-lead send OTP error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.verifyOtp(req.body);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Gym-owner-lead verify OTP error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.register(req.body);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Gym-owner-lead register error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const checkSession = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.checkSession(req.body.email);
    return successResponse(res, result, 'Session status retrieved');
  } catch (error: any) {
    logger.error('Gym-owner-lead check session error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const checkMobile = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.checkMobile(req.body);
    return successResponse(res, result, 'Mobile check completed');
  } catch (error: any) {
    logger.error('Gym-owner-lead check mobile error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.resendOtp(req.body.email);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Gym-owner-lead resend OTP error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await gymOwnerLeadService.forgotPassword(req.body.email);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    logger.error('Gym-owner-lead forgot-password error', { error: error.message });
    return errorResponse(res, error.message, 400);
  }
};
