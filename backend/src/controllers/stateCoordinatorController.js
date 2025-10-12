import Trainer from '../models/Trainer.js';
import StateCoordinator from '../models/StateLevelVc.js';

export  const  assignCoordinatorToMultipleTrainers = async (req, res) => {
    try {
        // 1. Get the coordinatorId and an array of trainerIds from the body.
        const { coordinatorId, trainerIds } = req.body;

        // 2. Validate the input.
        if (!coordinatorId || !trainerIds || !Array.isArray(trainerIds) || trainerIds.length === 0) {
            return res.status(400).json({ message: 'Please provide a coordinatorId and a non-empty array of trainerIds.' });
        }

        // 3. Use updateMany to assign the coordinator to all specified trainers at once.
        const result = await Trainer.updateMany(
            { _id: { $in: trainerIds } }, // The filter: finds all trainers whose ID is in the array
            { $set: { coordinatorId: coordinatorId } } // The update: sets the coordinatorId field
        );

        // 4. Send a success response.
        res.status(200).json({
            message: `Successfully assigned coordinator to trainers.`,
            data: {
                matchedCount: result.matchedCount, // How many trainers were found
                modifiedCount: result.modifiedCount // How many were actually updated
            }
        });

    } catch (error) {
        console.error('Error during bulk assignment:', error);
        res.status(500).json({ message: 'Server error during bulk assignment.', error: error.message });
    }
};

export const singleAssignCoordinatorToTrainer = async (req, res) => {
    try {
        // 1. Get the trainer's ID from the URL and the coordinator's ID from the body.
        const { trainerId } = req.params;
        const { coordinatorId } = req.body;

        // 2. Basic validation.
        if (!coordinatorId) {
            return res.status(400).json({ message: 'Please provide a coordinatorId.' });
        }

        // 3. Find the trainer and coordinator to ensure they both exist.
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found.' });
        }

        const coordinator = await StateCoordinator.findById(coordinatorId);
        if (!coordinator) {
            return res.status(404).json({ message: 'Coordinator not found.' });
        }

        // 4. Perform the assignment and save the updated trainer.
        trainer.coordinatorId = coordinatorId;
        const updatedTrainer = await trainer.save();

        // 5. Send a success response.
        res.status(200).json({
            message: 'Trainer has been successfully assigned to the coordinator.',
            data: updatedTrainer
        });

    } catch (error) {
        console.error('Error assigning coordinator:', error);
        res.status(500).json({ message: 'Server error during assignment.', error: error.message });
    }
};


/**
 * @desc   Get all trainers assigned to the logged-in state coordinator
 * @route  GET /api/coordinators/my-trainers
 * @access Private (StateCoordinator)
 */
export const getMyAssignedTrainers = async (req, res) => {
    try {
        // 1. Get the coordinator's ID from the authenticated user's token.
        // This ID is added to `req` by your authentication middleware.
        const coordinatorId = req.user.id;

        // 2. Find all trainers in the database where the 'coordinatorId' matches.
        const trainers = await Trainer.find({ coordinatorId: coordinatorId })
            .populate('schoolId', 'name UDISE_Code') // Optional: Get school details
            .populate('tradeId', 'name');           // Optional: Get trade name

        // 3. Check if any trainers were found.
        if (!trainers || trainers.length === 0) {
            return res.status(200).json({
                message: 'No trainers are currently assigned to you.',
                data: []
            });
        }

        // 4. Send the successful response with the list of trainers.
        res.status(200).json({
            message: `Successfully retrieved ${trainers.length} trainers.`,
            data: trainers
        });

    } catch (error) {
        console.error('Error fetching assigned trainers:', error);
        res.status(500).json({ message: 'Server error while fetching trainers.' });
    }
};
// Controller for the coordinator
export const getPendingRequests = async (req, res) => {
    try {
        const coordinatorId = req.user.id; // From authenticated coordinator's token

        // Find all requests assigned to this coordinator that are 'pending'
        const requests = await AttendanceCorrectionRequest.find({
            coordinatorId: coordinatorId,
            status: 'pending'
        })
        .populate('trainerId', 'fullName email') // Get trainer's name and email
        .populate('attendanceId', 'date schoolId'); // Get original attendance date

        res.status(200).json({ data: requests });

    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};


// Controller for the coordinator
export const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, coordinatorComment } = req.body; // status must be 'approved' or 'rejected'
        const coordinatorId = req.user.id;

        // Find the request
        const request = await AttendanceCorrectionRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }
        
        // Security check: ensure this coordinator is the one assigned to the request
        if (request.coordinatorId.toString() !== coordinatorId) {
            return res.status(403).json({ message: "You are not authorized to action this request." });
        }

        // If the request is approved, update the original attendance record
        if (status === 'approved') {
            await Attendance.findByIdAndUpdate(request.attendanceId, {
                status: 'present',
                // You could also add default check-in/out times here if needed
                // checkInTime: ...,
                // totalMinutesWorked: ...
            });
        }
        
        // Update the request itself
        request.status = status;
        if(coordinatorComment) request.coordinatorComment = coordinatorComment;
        await request.save();

        res.status(200).json({ message: `Request has been successfully ${status}.`, data: request });

    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

