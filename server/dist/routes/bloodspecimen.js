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
const router = express_1.default.Router();
const EXPIRE_TIME = process.env.REDIS_EXPIRE_TIME;
router.get("/bloodunitcount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = "bloodUnitCount";
        const cacheData = yield redisclient_1.default.get(cacheKey);
        if (cacheData) {
            res.status(200).json({ message: "From redis", count: Number(cacheData) });
            return;
        }
        const [bloodbank] = yield database_1.default.query("SELECT SUM(quantity) as unitcount FROM bloodspecimen");
        const bloodUnitCount = bloodbank[0].unitcount || 0;
        yield redisclient_1.default.set(cacheKey, bloodUnitCount);
        yield redisclient_1.default.expire(cacheKey, EXPIRE_TIME);
        res.status(200).json({ count: Number(bloodUnitCount) });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", Error: error });
        return;
    }
}));
exports.default = router;
