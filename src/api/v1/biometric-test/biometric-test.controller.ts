import { Request, Response, NextFunction } from 'express';
import biometricTestService from './biometric-test.service';
import { successResponse } from '../../../common/utils';
import { BadRequestException } from '../../../common/exceptions';

class BiometricTestController {
  async insert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Query param "id" is required');
      }
      const record = await biometricTestService.create(id);
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
