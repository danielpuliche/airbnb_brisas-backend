import { validationResult } from "express-validator";

/**
 * Middleware que centraliza la respuesta de validación.
 * Úsalo después de los checks de express-validator.
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    // Normaliza errores a un formato consistente
    const mapped = errors.array().map(e => ({
        field: e.path,
        message: e.msg,
        value: e.value,
        location: e.location
    }));

    return res.status(400).json({
        error: "VALIDATION_ERROR",
        errors: mapped
    });
}

export { handleValidation };