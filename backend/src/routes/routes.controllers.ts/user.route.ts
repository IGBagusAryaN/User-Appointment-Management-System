import { Router } from "express";
import { getAllUsers, getCurrentUser, getUserById} from "../../controllers/user.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.get('/current-user', authenticate, getCurrentUser);
router.get('/:id', authenticate, getUserById);
router.get('/', authenticate, getAllUsers);

export default router;
