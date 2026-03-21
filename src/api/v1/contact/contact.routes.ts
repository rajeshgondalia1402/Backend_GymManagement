import { Router } from 'express';
import { handleContactForm } from './contact.controller';

const router = Router();

router.post('/', handleContactForm);

export { router as contactRoutes };
