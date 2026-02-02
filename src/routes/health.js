import { application, Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
    res.json({ ok: true, service: 'api', timestamp: new Date().toISOString() });
});

export default router;