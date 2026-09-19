import { Router } from "express";
import kartingController from "./karting.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();


router.get("/",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), kartingController.getAll);
router.get("/:id",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), kartingController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), kartingController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), kartingController.update);
router.delete("/:id",verifyRoles("EMPLEADO","ADMIN"),kartingController.delete);
export default router;
