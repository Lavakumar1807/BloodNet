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
router.post("/register/hospital", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalname, contactnumber, password, bloodbankid, bloodbankpassword } = req.body;
        const [bloodbank] = yield database_1.default.query("SELECT * FROM bloodbank WHERE id = ?", [bloodbankid]);
        if (!bloodbank) {
            res.status(404).json({ message: "Blood Bank doesn't exist ! Please enter valid bloodbankid" });
            return;
        }
        const [BloodBankpwd] = yield database_1.default.query("SELECT password FROM bloodbank WHERE id = ? ", [bloodbankid]);
        const hashedBloodBankPwd = BloodBankpwd[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(bloodbankpassword, hashedBloodBankPwd);
        if (!check) {
            res.status(400).json({ message: "Wrong Blood Bank Password" });
            return;
        }
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(password);
        const [hospital] = yield database_1.default.query("INSERT INTO hospital (hospitalname,contactnumber,password,bloodbank_id) values (?,?,?,?)", [hospitalname, contactnumber, hashedPassword, bloodbankid]);
        console.log(hospital);
        const insertId = hospital.insertId;
        res.status(201).json({ message: "Hospital Registered Successfully", HospitaltId: insertId });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post("/login/hospital", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("hii");
        const { hospitalId, password } = req.body;
        const [hospital] = yield database_1.default.query("SELECT id,password,hospitalname From hospital WHERE id = (?)", [hospitalId]);
        console.log(hospital);
        if (!hospital) {
            res.status(404).json({ message: "Recipient not Found" });
            return;
        }
        const hashedPassword = hospital[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (check) {
            const token = jwt.sign({ id: hospital[0].id, name: hospital[0].hospitalname, role: "hospital" }, SECRET_KEY, { expiresIn: "15d" });
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
        res.status(500).json({ message: "Server not found ", Error: error });
    }
}));
router.get("/details/hospital/:hospitalId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.params;
        const cacheKey = `hospital:${hospitalId}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ hospital: JSON.parse(cacheData) });
            return;
        }
        const [hospital] = yield database_1.default.query("SELECT * FROM hospital WHERE id = ? ", [hospitalId]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(hospital));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ hospital: hospital });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Hospital Details" });
        return;
    }
}));
exports.default = router;
