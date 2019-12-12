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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
var credentials = new aws_sdk_1.default.SharedIniFileCredentials({ profile: "test-admin" });
aws_sdk_1.default.config.credentials = credentials;
const ecr = new aws_sdk_1.default.ECR({ region: "ap-northeast-1" });
const core = require("@actions/core");
const ECR_IMAGESCAN_WAIT_SEC = 10;
const sleep = (waitSecounds) => new Promise(resolve => setTimeout(resolve, waitSecounds * 1000));
function main() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imageDigest = core.getInput("image-digest", { required: true });
            const imageTag = core.getInput("image-tag", { required: true });
            const repositoryName = core.getInput("repository-name", { required: true });
            const triggerSeverity = core.getInput("trigger-severity", { required: true });
            if (!(triggerSeverity === "INFORMATIONAL" ||
                triggerSeverity === "LOW" ||
                triggerSeverity === "MEDIUM" ||
                triggerSeverity === "HIGH" ||
                triggerSeverity === "CRITICAL")) {
                throw new Error("trigger-severity: INFORMATIONAL | LOW | MEDIUM | HIGH | CRITICAL");
            }
            const imageParams = {
                imageId: {
                    imageDigest,
                    imageTag
                },
                repositoryName
            };
            // start Image Scan
            const startImageScan = yield ecr.startImageScan(imageParams).promise();
            core.info(startImageScan);
            console.log(startImageScan);
            while (true) {
                yield sleep(ECR_IMAGESCAN_WAIT_SEC);
                const imageScanResult = yield ecr.describeImageScanFindings(imageParams).promise();
                core.info(imageScanResult);
                console.log(imageScanResult);
                if (((_a = imageScanResult.imageScanStatus) === null || _a === void 0 ? void 0 : _a.status) === "FAILED") {
                    throw new Error(`ImageScanResult FAILED.  ${imageScanResult.imageScanStatus.description}`);
                }
                if (((_b = imageScanResult.imageScanStatus) === null || _b === void 0 ? void 0 : _b.status) === "COMPLETE") {
                    //@ts-ignore
                    if (!(((_c = imageScanResult.imageScanFindings) === null || _c === void 0 ? void 0 : _c.findingSeverityCounts[triggerSeverity]) != null)) {
                        break;
                    }
                    else {
                        throw new Error(`Find Vulnerability ￿\n ${JSON.stringify(imageScanResult)}`);
                    }
                }
            }
        }
        catch (error) {
            core.debug(error);
            console.log(error);
            core.setFailed(error.message);
        }
    });
}
exports.main = main;
main();
