import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate = (schema: ZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("Validation error:", error);
        const validationErrors = error.flatten().fieldErrors;
        res.status(400).json({
          error: "Validation failed",
          details: validationErrors,
        });
        return;
      }
      next(error);
    }
  };
};
