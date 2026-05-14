import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pulsaRouter from "./pulsa";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pulsaRouter);

export default router;
