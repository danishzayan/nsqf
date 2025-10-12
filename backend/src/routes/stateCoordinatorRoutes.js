 // In your trainer routes file (e.g., trainerRoutes.js)
import express from 'express';
import { assignCoordinatorToMultipleTrainers,  singleAssignCoordinatorToTrainer ,getPendingRequests ,updateRequestStatus ,getMyAssignedTrainers } from '../controllers/stateCoordinatorController.js';
import {protect} from '../middleware/coordinatorAuth.js';
const router = express.Router();

// PUT /api/trainers/:trainerId/assign-coordinator
router.put('/assign-coordinator/traner', assignCoordinatorToMultipleTrainers);
router.put('/:trainerId/assign-coordinator', singleAssignCoordinatorToTrainer);
router.get('/getPandngRequests/:correction-requests', protect,getPendingRequests);
router.put('/updateRequestStatus/:requestId', protect,updateRequestStatus);
router.get('/my-trainers', protect, getMyAssignedTrainers);

export default router; 