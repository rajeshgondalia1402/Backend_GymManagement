import { Router } from 'express';
import * as controller from './trainer-vacancy.controller';

const router = Router();

// Public: search & get vacancies
router.get('/search', controller.searchVacancies);
router.get('/my', controller.getMyVacancies);
router.get('/:id', controller.getVacancy);

// Gym owner: CRUD (auth via email in body)
router.post('/', controller.createVacancy);
router.put('/:id', controller.updateVacancy);
router.delete('/:id', controller.deleteVacancy);

export { router as trainerVacancyRoutes };
