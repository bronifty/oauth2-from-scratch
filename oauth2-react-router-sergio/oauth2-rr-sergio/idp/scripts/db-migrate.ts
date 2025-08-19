/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Database } from "bun:sqlite";
import migrate from "../app/db/migrate";
migrate(new Database("./db.sqlite"));
