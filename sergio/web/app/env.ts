/**
 * This module is responsible for validating the environment variables
 * used in the application. It uses the `zod` library to define a schema
 * for the environment variables and then parses the `process.env`.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { z } from "zod";

const EnviromentSchema = z.object({
	ISSUER: z.string(),
	ISSUER_HOST: z.string(),
	AUDIENCE: z.string(),
	CLIENT_ID: z.string(),
	CLIENT_SECRET: z.string(),
	SESSION_SECRET: z.string(),
	RESOURCE_HOST: z.string(),
});

export default EnviromentSchema.parse(process.env);
