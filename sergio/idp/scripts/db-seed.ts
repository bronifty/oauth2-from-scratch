/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Database } from "bun:sqlite";
import seed from "../app/db/seed";
seed(new Database("./db.sqlite"));
