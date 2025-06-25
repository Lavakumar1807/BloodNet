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
router.get("/donorcount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = "donorcount";
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ count: cacheData });
            return;
        }
        const [donor] = yield database_1.default.query("SELECT COUNT(*) as bbcount FROM donor");
        const donorCount = donor[0].bbcount;
        yield redisclient_1.default.set(cacheKey, donorCount);
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ count: donorCount });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post("/register/donor", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorname, dob, age, phonenumber, gender, bloodgroup, password, staffId, staffpassword } = req.body;
        const [staff] = yield database_1.default.query("SELECT * FROM staff WHERE id = ?", [staffId]);
        if (!staff) {
            res.status(404).json({ message: "Staff doesn't exist ! Please enter valid bloodbankId" });
            return;
        }
        const [staffPwd] = yield database_1.default.query("SELECT password FROM staff WHERE id = ? ", [staffId]);
        const hashedstaffPwd = staffPwd[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(staffpassword, hashedstaffPwd);
        if (!check) {
            res.status(400).json({ message: "Wrong Staff Password" });
            return;
        }
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(password);
        const [donor] = yield database_1.default.query("INSERT INTO donor (donorname,dateofbirth,age,bloodgroup,gender,phonenumber,password,staff_id) values (?,?,?,?,?,?,?,?)", [donorname, dob, age, bloodgroup, gender, phonenumber, hashedPassword, staffId]);
        const insertId = donor.insertId;
        res.status(201).json({ message: "Donor Registered Successfully", DonorId: insertId });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post("/login/donor", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorId, password } = req.body;
        const [donor] = yield database_1.default.query("SELECT id,password,donorname From donor WHERE id = (?)", [donorId]);
        if (!donor) {
            res.status(404).json({ message: "Donor not Found" });
            return;
        }
        const hashedPassword = donor[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (check) {
            const token = jwt.sign({ id: donor[0].id, name: donor[0].donorname, role: "donor" }, SECRET_KEY, { expiresIn: "15d" });
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
router.get("/details/donor/:donorId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorId } = req.params;
        const cacheKey = `donor:${donorId}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ donor: JSON.parse(cacheData) });
            return;
        }
        const [donor] = yield database_1.default.query("SELECT * FROM donor WHERE id = ? ", [donorId]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(donor));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ donor: donor });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Donor Details" });
        return;
    }
}));
router.post("/donate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorId, password, bloodQuantity, expDate, bloodbankId, bloodbankpassword } = req.body;
        const [donor] = yield database_1.default.query("SELECT * FROM donor WHERE id = ?", [donorId]);
        const bloodGroup = donor[0].bloodgroup;
        const hashedPassword = donor[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (!check) {
            res.status(401).json({ message: "Wrong Password" });
            return;
        }
        const [bloodbank] = yield database_1.default.query("SELECT password FROM bloodbank WHERE id = ?", [bloodbankId]);
        const hashedBBPassword = bloodbank[0].password;
        const BBcheck = yield (0, hashPassword_1.comparePasswords)(bloodbankpassword, hashedBBPassword);
        if (!BBcheck) {
            res.status(401).json({ message: "Wrong Blood Bank Password" });
            return;
        }
        yield database_1.default.query("INSERT INTO bloodspecimen (blood_group,quantity,expiry_date,donor_id,bloodbank_id) VALUES (?,?,?,?,?)", [bloodGroup, bloodQuantity, expDate, donorId, bloodbankId]);
        res.status(200).json({ message: "Blood Donated Successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error in Donating Blood" });
    }
}));
router.get("/donor/transactions/:donorId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorId } = req.params;
        const cacheKey = `donorTransactions:${donorId}`;
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ transactions: JSON.parse(cacheData) });
            return;
        }
        const [transactions] = yield database_1.default.query(`SELECT 
              bs.quantity, 
              bs.collected_date, 
              bs.bloodbank_id,
              bb.bloodbankname
            FROM bloodspecimen bs
            JOIN bloodbank bb ON bs.bloodbank_id = bb.id
            WHERE bs.donor_id = ?`, [donorId]);
        yield redisclient_1.default.set(cacheKey, JSON.stringify(transactions));
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ transactions });
    }
    catch (error) {
        res.status(500).json({ message: "Error in Donating Blood" });
    }
}));
exports.default = router;
