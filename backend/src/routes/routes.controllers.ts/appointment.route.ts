import { Router } from "express";
import {
  createAppointment,
  deleteAppointment,
  getMyAppointments,
  updateAppointment,
} from "../../controllers/appointment.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/", authenticate, createAppointment);
router.get("/", authenticate, getMyAppointments);
router.put("/update/:appointmentId", authenticate, updateAppointment);
router.delete("/delete/:appointmentId",authenticate , deleteAppointment);

export default router;
