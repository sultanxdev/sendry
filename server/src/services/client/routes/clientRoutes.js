import express from "express";
import clientDependencies from "../Dependencies/dependencies.js"
import authenticate from "../../../shared/middlewares/authenticate.js"

// Create a new router instance
const router = express.Router();

// Destructure the clientController from the dependencies
const { clientController } = clientDependencies.controller

// Apply authentication middleware to all routes in this router
router.use(authenticate);

// Current client for logged-in user
router.get("/clients/current", (req, res, next) => clientController.getCurrentClient(req, res, next));

// API keys convenience routes for logged-in user
router.get("/api-keys", (req, res, next) => clientController.getMyApiKeys(req, res, next));
router.post("/api-keys", (req, res, next) => clientController.createMyApiKey(req, res, next));

// Onboard a new client
router.post("/admin/clients/onboard", (req, res, next) => clientController.createClient(req, res, next));
router.post("/admin/clients", (req, res, next) => clientController.createClient(req, res, next));

// Create a user for a client
router.post("/admin/clients/:clientId/users", (req, res, next) => clientController.createClientUser(req, res, next));

// Create API key for a client (supports both hyphen and slash routes)
router.post("/admin/clients/:clientId/api-keys", (req, res, next) => clientController.createApiKey(req, res, next));
router.post("/admin/clients/:clientId/api/keys", (req, res, next) => clientController.createApiKey(req, res, next));

// Get all API keys for a client (supports both hyphen and slash routes)
router.get("/admin/clients/:clientId/api-keys", (req, res, next) => clientController.getClientApiKeys(req, res, next));
router.get("/admin/clients/:clientId/api/keys", (req, res, next) => clientController.getClientApiKeys(req, res, next));

export default router;