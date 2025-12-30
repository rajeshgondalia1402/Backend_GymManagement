import { Response } from 'express';
export declare const successResponse: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const paginatedResponse: <T>(res: Response, items: T[], page: number, limit: number, total: number, message?: string) => Response;
export declare const errorResponse: (res: Response, message?: string, statusCode?: number, error?: string) => Response;
//# sourceMappingURL=response.util.d.ts.map