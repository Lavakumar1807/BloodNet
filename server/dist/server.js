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
const bloodbank_1 = __importDefault(require("./routes/bloodbank"));
const staff_1 = __importDefault(require("./routes/staff"));
const donor_1 = __importDefault(require("./routes/donor"));
const hospital_1 = __importDefault(require("./routes/hospital"));
const recipient_1 = __importDefault(require("./routes/recipient"));
const bloodspecimen_1 = __importDefault(require("./routes/bloodspecimen"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./database"));
const jwt = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookieParser = require("cookie-parser");
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Welcome to BloodNet");
});
const SECRET_KEY = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
    const token = req.cookies.BNToken;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: "Invalid token" });
            return;
        }
        req.user = decoded;
        next();
    });
};
app.use('/', bloodbank_1.default);
app.use('/', staff_1.default);
app.use('/', donor_1.default);
app.use('/', recipient_1.default);
app.use('/', hospital_1.default);
app.use('/', bloodspecimen_1.default);
app.get("/me", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user) {
            res.status(200).json({ check: true, user: user });
        }
        else {
            res.status(404).json({ check: false });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
app.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("BNToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
        });
        res.status(200).json({ message: "Logged out" });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
app.get("/bloodavailability/:location/:bloodgroup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = req.params.location;
        const bloodgroup = req.params.bloodgroup;
        const [bloodavailability] = yield database_1.default.query("SELECT bs.quantity,bs.collected_date,bs.bloodbank_id,bs.expiry_date,b.bloodbankname,b.contactnumber FROM bloodspecimen bs JOIN bloodbank b ON b.id = bs.bloodbank_id WHERE b.location = ? AND bs.blood_group = ?", [location, bloodgroup]);
        res.status(200).json({ bloodavailability: bloodavailability });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
app.get("/:role/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.params;
        const [notifications] = yield database_1.default.query("SELECT * FROM notifications WHERE role = ? OR role = 'all' ", [role]);
        const enrichedNotifications = yield Promise.all(notifications.map((notification) => __awaiter(void 0, void 0, void 0, function* () {
            const bloodbankId = notification.bloodbank_id;
            const [bloodbank] = yield database_1.default.query("SELECT bloodbankname FROM bloodbank WHERE id = ?", [bloodbankId]);
            const bloodbankname = bloodbank[0].bloodbankname;
            return Object.assign(Object.assign({}, notification), { bloodbankname });
        })));
        res.status(200).json({ notifications: enrichedNotifications });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
    }
}));
app.listen(PORT, () => {
    console.log("Running on port : ", PORT);
});
