import { Request, Response, NextFunction } from 'express';
import biometricTestService from './biometric-test.service';
import { successResponse } from '../../../common/utils';

class BiometricTestController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { memberId } = req.body;
      const record = await biometricTestService.create(memberId);
      successResponse(res, record, 'Biometric test record created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await biometricTestService.getAll();
      successResponse(res, records, 'Biometric test records retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new BiometricTestController();
