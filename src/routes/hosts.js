import { Router } from "express";
import crypto from "crypto";
import { body, param, query } from "express-validator";

import { handleValidation } from "../middlewares/validate.js";

const router = Router();

// In-memory database (temporary until we connect PostgreSQL + Prisma)
const dbMem = {
    hosts: [
        // initial example
        { id: "demo-1", name: "Invitado Demo", documentId: "123", phoneNumber: "3000000000", email: "demo@correo.com" }
    ]
};

// Validations reusable
const validateIdParam = [
    param("id").isString().trim().notEmpty().withMessage("Id es obligatorio"),
    handleValidation
]

const validatePagination = [
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit debe ser un entero entre 1 y 100"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page debe ser un entero mayor o igual a 1"),
    handleValidation
];

// Create new host
router.post(
    "/",
    [
        body("name").isString().withMessage("El nombre debe ser texto").trim().notEmpty().withMessage("El nombre es obligatorio"),
        body("documentId").optional().isString().trim(),
        body("phoneNumber").optional().isString().trim(),
        body("email").optional().isString().trim().isEmail().withMessage("El correo no es válido"),
        handleValidation
    ],
    (req, res) => {
        try {
            const newHost = {
                id: crypto.randomUUID(),
                name: req.body.name.trim(),
                documentId: req.body.documentId?.trim() || null,
                phoneNumber: req.body.phoneNumber?.trim() || null,
                email: req.body.email?.trim() || null
            };

            dbMem.hosts.push(newHost);
            return res.status(201).json(newHost);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Error creando huésped" });
        }
    });

// List hosts with pagination
router.get(
    "/",
    validatePagination,
    (req, res) => {
        try {
            const take = Math.max(parseInt(req.query.limit || "20", 10), 1);
            const page = Math.max(parseInt(req.query.page || "1", 10), 1);
            const offset = (page - 1) * take;

            const total = dbMem.hosts.length;
            const items = dbMem.hosts.slice(offset, offset + take);

            return res.json({
                page,
                limit: take,
                total,
                items
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Error listando huéspedes" });
        }
    });

// Get host by ID
router.get(
    "/:id",
    validateIdParam,
    (req, res) => {
        const item = dbMem.hosts.find(h => h.id === req.params.id);
        if (!item) return res.status(404).json({ error: "Huésped no encontrado" });
        return res.json(item);
    });

// Update host by ID
router.put(
    "/:id",
    [
        ...validateIdParam,
        body("name").optional().isString().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
        body("documentId").optional().isString().trim(),
        body("phoneNumber").optional().isString().trim(),
        body("email").optional().isString().trim().isEmail().withMessage("El correo no es válido"),
        handleValidation
    ],
    (req, res) => {
        const idx = dbMem.hosts.findIndex(h => h.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: "Huésped no encontrado" });

        const current = dbMem.hosts[idx];
        const actualizado = {
            ...current,
            name: req.body.name ? String(req.body.name).trim() : current.name,
            documentId: req.body.documentId?.trim() ?? current.documentId,
            phoneNumber: req.body.phoneNumber?.trim() ?? current.phoneNumber,
            email: req.body.email?.trim() ?? current.email
        };

        dbMem.hosts[idx] = actualizado;
        return res.json(actualizado);
    });

// Delete host (soft delete would be better with DB; here we delete)
router.delete(
    "/:id",
    validateIdParam,
    (req, res) => {
        const before = dbMem.hosts.length;
        dbMem.hosts = dbMem.hosts.filter(h => h.id !== req.params.id);
        if (dbMem.hosts.length === before) {
            return res.status(404).json({ error: "Huésped no encontrado" });
        }
        return res.status(204).send();
    });

export default router;