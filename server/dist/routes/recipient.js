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
const hashPassword_1 = require("../hashPassword");
const router = express_1.default.Router();
const jwt = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET;
router.post("/register/recipient", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientname, dob, age, phonenumber, gender, bloodgroup, password, staffId, staffpassword } = req.body;
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
        const [recipient] = yield database_1.default.query("INSERT INTO recipient (recipientname,dateofbirth,age,bloodgroup,gender,phonenumber,password,staff_id) values (?,?,?,?,?,?,?,?)", [recipientname, dob, age, bloodgroup, gender, phonenumber, hashedPassword, staffId]);
        const insertId = recipient.insertId;
        res.status(201).json({ message: "Recipient Registered Successfully", RecipientId: insertId });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
router.post("/login/recipient", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId, password } = req.body;
        const [recipient] = yield database_1.default.query("SELECT id,password,recipientname From recipient WHERE id = (?)", [recipientId]);
        if (recipient.length == 0) {
            res.status(404).json({ message: "Recipient not Found" });
            return;
        }
        const hashedPassword = recipient[0].password;
        const check = yield (0, hashPassword_1.comparePasswords)(password, hashedPassword);
        if (check) {
            const token = jwt.sign({ id: recipient[0].id, name: recipient[0].recipientname, role: "recipient" }, SECRET_KEY, { expiresIn: "15d" });
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
router.get("/details/recipient/:recipientId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId } = req.params;
        const [recipient] = yield database_1.default.query("SELECT * FROM recipient WHERE id = ? ", [recipientId]);
        res.status(200).json({ recipient: recipient });
    }
    catch (error) {
        res.status(500).json({ message: "Error in fetching Recipient Details" });
    }
}));
router.get("/recipient/transactions/:recipientId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId } = req.params;
        const [transactions] = yield database_1.default.query("SELECT * FROM transactions WHERE recipient_id = ? ", [recipientId]);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.post("/requestblood", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId, password, bloodGroup, bloodQuantity, bloodbankId, bloodbankPassword } = req.body;
        const [recipientRows] = yield database_1.default.query("SELECT password FROM recipient WHERE id = ?", [recipientId]);
        if (recipientRows.length === 0 || !(yield (0, hashPassword_1.comparePasswords)(password, recipientRows[0].password))) {
            res.status(401).json({ message: "Invalid recipient credentials" });
            return;
        }
        const [bbRows] = yield database_1.default.query("SELECT password FROM bloodbank WHERE id = ?", [bloodbankId]);
        if (bbRows.length === 0 || !(yield (0, hashPassword_1.comparePasswords)(bloodbankPassword, bbRows[0].password))) {
            res.status(401).json({ message: "Invalid blood bank credentials" });
            return;
        }
        const [specimens] = yield database_1.default.query(`SELECT * FROM bloodspecimen 
       WHERE blood_group = ? AND bloodbank_id = ? AND status = 'available'
       ORDER BY collected_date ASC`, [bloodGroup, bloodbankId]);
        let remaining = parseInt(bloodQuantity);
        for (const specimen of specimens) {
            if (remaining <= 0)
                break;
            const { id, quantity } = specimen;
            if (quantity <= remaining) {
                yield database_1.default.query("UPDATE bloodspecimen SET status = 'reserved' WHERE id = ?", [id]);
                remaining -= quantity;
            }
            else {
                yield database_1.default.query("UPDATE bloodspecimen SET quantity = ? WHERE id = ?", [quantity - remaining, id]);
                remaining = 0;
            }
        }
        if (remaining > 0) {
            res.status(400).json({ message: "Insufficient blood available to fulfill request." });
            return;
        }
        yield database_1.default.query("INSERT INTO bloodrequests (recipient_id, bloodbank_id, blood_group, quantity) VALUES (?, ?, ?, ?)", [recipientId, bloodbankId, bloodGroup, bloodQuantity]);
        res.status(200).json({ message: "Blood request fulfilled and recorded." });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
router.get("/recipient/requestblood/:recipientId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId } = req.params;
        const [transactions] = yield database_1.default.query("SELECT * FROM bloodrequests WHERE recipient_id = ? ", [recipientId]);
        const transaction = transactions;
        res.status(200).json({ transactions: transaction });
    }
    catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
exports.default = router;
