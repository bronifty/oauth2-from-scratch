/**
 * This context is used in `web/app/views/contacts/_layout.tsx` to store the
 * authenticated API client instance.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { unstable_createContext } from "react-router";
import type { APIClient } from "~/clients/api";

export const apiContext = unstable_createContext<APIClient>();
