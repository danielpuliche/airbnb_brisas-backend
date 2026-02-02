import { Router } from "express";
import crypto from "crypto";

const router = Router();

// In-memory database (temporary until we connect PostgreSQL + Prisma)
const dbMem = {
    hosts: [
        // initial example
        { id: "demo-1", name: "Invitado Demo", documentId: "123", phoneNumber: "3000000000", email: "demo@correo.com" }
    ]
};

// Basic validation
function validateHost(body) {
    const errors = [];
    if (!body?.name || String(body.name).trim() === "") {
        errors.push("El nombre es obligatorio");
    }
    if (body?.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
        errors.push("El correo no es válido");
    }
    return errors;
}

// Create new host
router.post("/", (req, res) => {
    try {
        const errors = validateHost(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const newHost = {
            id: crypto.randomUUID(),
            name: String(req.body.name).trim(),
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
router.get("/", (req, res) => {
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
router.get("/:id", (req, res) => {
    const item = dbMem.hosts.find(h => h.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Huésped no encontrado" });
    return res.json(item);
});

// Update host by ID
router.put("/:id", (req, res) => {
    const idx = dbMem.hosts.findIndex(h => h.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Huésped no encontrado" });

    const current = dbMem.hosts[idx];
    const actualizado = {
        ...current,
        nombre: req.body.nombre ? String(req.body.nombre).trim() : current.name,
        documento: req.body.documento?.trim() ?? current.documentId,
        telefono: req.body.telefono?.trim() ?? current.phoneNumber,
        correo: req.body.correo?.trim() ?? current.correo
    };

    const errors = validateHost(actualizado);
    if (errors.length) return res.status(400).json({ errors });

    dbMem.hosts[idx] = actualizado;
    return res.json(actualizado);
});

// Delete host (soft delete would be better with DB; here we delete)
router.delete("/:id", (req, res) => {
    const before = dbMem.hosts.length;
    dbMem.hosts = dbMem.hosts.filter(h => h.id !== req.params.id);
    if (dbMem.hosts.length === before) {
        return res.status(404).json({ error: "Huésped no encontrado" });
    }
    return res.status(204).send();
});

export default router;