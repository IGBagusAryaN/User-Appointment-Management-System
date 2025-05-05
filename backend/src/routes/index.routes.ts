import { Router } from "express";
import authRoutes from './routes.controllers.ts/auth.route'
import userRoutes from './routes.controllers.ts/user.route'
import appointmentRoutes from './routes.controllers.ts/appointment.route'

const router = Router();

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/appointment', appointmentRoutes)

export default router;