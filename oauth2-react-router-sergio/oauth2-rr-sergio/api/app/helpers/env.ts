/**
 * This module is responsible for validating the environment variables
 * used in the application.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { z } from "zod";

const EnviromentSchema = z.object({
	PORT: z.coerce.number().optional().default(4000),
	ISSUER: z.string(),
	ISSUER_HOST: z.string(),
	AUDIENCE: z.string(),
});

export default EnviromentSchema.parse(process.env);
