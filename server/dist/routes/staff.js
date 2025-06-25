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
router.post('/register/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffname, phonenumber, password, bloodbankId, bloodbankpassword } = req.body;
        const [bloodbank] = yield database_1.default.query("SELECT * FROM bloodbank WHERE id = ?", [bloodbankId]);
        if (!bloodbank) {
            res.status(404).json({ message: "Bloodbank doesn't exist ! Please enter valid bloodbankId" });
            return;
        }
        const [bbank] = yield database_1.default.query("SELECT password FROM bloodbank WHERE id = ? ", [bloodbankId]);
        const bbhashedPassword = bbank[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(bloodbankpassword, bbhashedPassword);
        if (!check) {
            res.status(400).json({ message: "Wrong Blood Bank Password" });
            return;
        }
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(password);
        const [staff] = yield database_1.default.query("INSERT INTO staff (staffname,phonenumber,password,bloodbank_id) VALUES (?,?,?,?)", [staffname, phonenumber, hashedPassword, bloodbankId]);
        const insertId = staff.insertId;
        res.status(201).json({ message: "Staff Registered Successfully", StaffId: insertId });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post('/login/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId, password } = req.body;
        const [staff] = yield database_1.default.query("SELECT id,password,staffname FROM staff WHERE id = ? ", [staffId]);
        if (!staff) {
            res.status(404).json({ message: "Staff not Found" });
            return;
        }
        const hashedPassword = staff[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (check) {
            const token = jwt.sign({ id: staff[0].id, name: staff[0].staffname, role: "staff" }, SECRET_KEY, { expiresIn: "15d" });
            res.cookie("BNToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ message: "Login Successful" });
            return;
        }
        else {
            res.status(400).json({ message: "Wrong password" });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.get("/details/staff/:staffId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId } = req.params;
        const cacheKey = `staff:${staffId}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ staff: JSON.parse(cacheData) });
            return;
        }
        const [staff] = yield database_1.default.query("SELECT * FROM staff WHERE id = ? ", [staffId]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(staff));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ staff: staff });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Staff Details" });
    }
}));
exports.default = router;
