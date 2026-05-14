import { Router, type IRouter } from "express";
import productsRouter from "./products";
import transactionsRouter from "./transactions";
import statsRouter from "./stats";
import loginRouter from "./login";

const router: IRouter = Router();

router.use(loginRouter);
router.use(productsRouter);
router.use(transactionsRouter);
router.use(statsRouter);

export default router;
