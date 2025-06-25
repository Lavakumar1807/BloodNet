"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const redisclient_1 = __importDefault(require("../redisclient"));
const hashPassword_1 = require("../hashPassword");
const router = express_1.default.Router();
const jwt = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRE_TIME = process.env.REDIS_EXPIRE_TIME;
router.get('/bloodbanks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'bloodbanks';
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ bloodbanks: JSON.parse(cacheData), count: cacheData.length });
            return;
        }
        const [bloodbanks] = yield database_1.default.query("SELECT * FROM bloodbank");
        const bloodBankCount = bloodbanks.length;
        yield redisclient_1.default.set(cacheKey, JSON.stringify(bloodbanks));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ bloodbanks: bloodbanks, count: bloodBankCount });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.get('/bloodbanklocations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'locations';
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ locations: JSON.parse(cacheData) });
            return;
        }
        const [locations] = yield database_1.default.query("SELECT DISTINCT location FROM bloodbank");
        yield redisclient_1.default.set(cacheKey, JSON.stringify(locations));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ locations: locations });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.get('/bloodbanks/:location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location } = req.params;
        const cacheKey = `bloodbanks:${location}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ bloodbanks: JSON.parse(cacheData) });
            return;
        }
        const [bloodbanks] = yield database_1.default.query("SELECT * FROM bloodbank WHERE location = ? ", [location]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(bloodbanks));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ bloodbanks: bloodbanks });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.post('/register/bloodbank', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankname, location, contactnumber, password } = req.body;
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(password);
        const [bloodbank] = yield database_1.default.query("INSERT INTO bloodbank (bloodbankname,location,contactnumber,password) VALUES (?,?,?,?)", [bloodbankname, location, contactnumber, hashedPassword]);
        const insertId = bloodbank.insertId;
        res.status(201).json({ message: "BloodBank created", bloodbankId: insertId });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post("/login/bloodbank", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankname, password } = req.body;
        const [bloodbank] = yield database_1.default.query("SELECT id,password FROM bloodbank WHERE bloodbankname = ?", [bloodbankname]);
        if (!bloodbank) {
            res.status(404).json({ message: "No BloodBank Found" });
            return;
        }
        const hashedPassword = bloodbank[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (check) {
            const token = jwt.sign({ id: bloodbank[0].id, name: bloodbankname, role: "bloodbank" }, SECRET_KEY, { expiresIn: "15d" });
            res.cookie("BNToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ message: "Login Successful :)" });
        }
        else {
            res.status(400).json({ message: "Wrong password" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.get("/details/bloodbank/:bloodBankId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodBankId } = req.params;
        const cacheKay = `bloodbank:${bloodBankId}`;
        const cacheData = yield redisclient_1.default.get(cacheKay);
        if (cacheData) {
            res.status(200).json({ bloodbank: JSON.parse(cacheData) });
            return;
        }
        const [bloodbank] = yield database_1.default.query("SELECT * FROM bloodbank WHERE id = ? ", [bloodBankId]);
        yield redisclient_1.default.set(cacheKay, JSON.stringify(bloodbank));
        yield redisclient_1.default.expire(cacheKay, EXPIRE_TIME);
        res.status(200).json({ bloodbank: bloodbank });
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Blood Bank Details" });
    }
}));
router.get("/bloodbank/transactions/:bloodbankId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankId } = req.params;
        const cacheKey = `bloodbankTransactions:${bloodbankId}`;
        const cacheTransactionData = yield redisclient_1.default.get(cacheKey);
        if (!cacheTransactionData) {
            const [transactions] = yield database_1.default.query(`SELECT 
            bs.quantity, 
            bs.collected_date, 
            bs.donor_id, 
            d.donorname, 
            d.phonenumber, 
            d.bloodgroup, 
            d.role
          FROM bloodspecimen bs
          JOIN donor d ON bs.donor_id = d.id
          WHERE bs.bloodbank_id = ?`, [bloodbankId]);
            yield redisclient_1.default.set(cacheKey, JSON.stringify(transactions));
            yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
            res.status(200).json({ transactions });
            return;
        }
        const transactions = JSON.parse(cacheTransactionData);
        res.status(200).json({ transactions });
    }
    catch (error) {
        res.status(500).json({ message: "Error in Donating Blood" });
    }
}));
router.get("/bloodbank/bloodinventory/:bloodbankId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankId } = req.params;
        const cacheKey = `bloodInventory:${bloodbankId}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ bloodspecimen: JSON.parse(cacheData) });
            return;
        }
        const [bloodInventory] = yield database_1.default.query(`SELECT 
            bs.*, 
            d.donorname, 
            d.phonenumber 
          FROM bloodspecimen bs
          JOIN donor d ON bs.donor_id = d.id
          WHERE bs.bloodbank_id = ?`, [bloodbankId]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(bloodInventory));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ bloodspecimen: bloodInventory });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Blood Inventory" });
    }
}));
router.post("/bloodbank/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankId, title, message, role } = req.body;
        yield database_1.default.query("INSERT INTO notifications (bloodbank_id,role,title,message) VALUES (?,?,?,?)", [bloodbankId, role, title, message]);
        res.status(200).json({ message: "Notification sent successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error in sending notifications" });
    }
}));
router.get("/bloodbank/:bloodbankId/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bloodbankId } = req.params;
        const [notifications] = yield database_1.default.query("SELECT * FROM notifications WHERE bloodbank_id = ?", [bloodbankId]);
        res.status(200).json({ notifications: notifications });
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching notifications" });
    }
}));
exports.default = router;
