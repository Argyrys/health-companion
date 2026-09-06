"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReminderWrite = exports.validatePatientProfile = exports.validateDiagnosisWrite = exports.validateAppointmentUpdate = void 0;
const functions = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const firebase_functions_1 = require("firebase-functions");
admin.initializeApp();
exports.validateAppointmentUpdate = functions.onDocumentUpdated("appointments/{appointmentId}", async (event) => {
    var _a, _b, _c, _d;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    const before = (_b = event.data) === null || _b === void 0 ? void 0 : _b.before.data();
    if (!after || !before)
        return;
    const statusChanged = before.status !== after.status;
    if (!statusChanged)
        return;
    const validStatuses = ["pending", "forwarded", "accepted", "rejected"];
    if (!validStatuses.includes(after.status)) {
        console.error(`Invalid status: ${after.status}`);
        await ((_c = event.data) === null || _c === void 0 ? void 0 : _c.after.ref.update({ status: before.status || "pending" }));
        return;
    }
    if (after.status === "rejected" && !after.rejectionReason) {
        await ((_d = event.data) === null || _d === void 0 ? void 0 : _d.after.ref.update({ rejectionReason: "No reason provided" }));
    }
    firebase_functions_1.logger.info(`Appointment ${event.params.appointmentId} status: ${before.status} -> ${after.status}`);
});
exports.validateDiagnosisWrite = functions.onDocumentUpdated("patients/{patientId}/data/{dataId}/consultations/{consultationId}", async (event) => {
    var _a, _b;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    if (!after)
        return;
    const updates = {};
    if (after.diagnosis !== undefined && typeof after.diagnosis !== "string") {
        updates.diagnosis = "";
    }
    if (after.prescription !== undefined && typeof after.prescription !== "string") {
        updates.prescription = "";
    }
    if (typeof after.diagnosis === "string" && after.diagnosis.length > 5000) {
        updates.diagnosis = after.diagnosis.substring(0, 5000);
    }
    if (Object.keys(updates).length > 0) {
        await ((_b = event.data) === null || _b === void 0 ? void 0 : _b.after.ref.update(updates));
    }
});
exports.validatePatientProfile = functions.onDocumentUpdated("patients/{patientId}", async (event) => {
    var _a, _b;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    if (!after)
        return;
    const updates = {};
    if (after.age !== undefined) {
        const age = Number(after.age);
        if (isNaN(age) || age < 0 || age > 150) {
            updates.age = 0;
        }
    }
    if (after.name !== undefined) {
        const name = String(after.name).trim();
        if (name.length === 0 || name.length > 200) {
            updates.name = "Unknown Patient";
        }
    }
    if (after.gender !== undefined) {
        const validGenders = ["Male", "Female", "Other", "Prefer not to say", ""];
        if (!validGenders.includes(after.gender)) {
            updates.gender = "";
        }
    }
    if (Object.keys(updates).length > 0) {
        await ((_b = event.data) === null || _b === void 0 ? void 0 : _b.after.ref.update(updates));
        firebase_functions_1.logger.info(`Fixed patient profile ${event.params.patientId}:`, updates);
    }
});
exports.validateReminderWrite = functions.onDocumentUpdated("patients/{patientId}/data/reminderData/reminders/{reminderId}", async (event) => {
    var _a, _b;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    if (!after)
        return;
    const updates = {};
    if (after.medicationName !== undefined && typeof after.medicationName !== "string") {
        updates.medicationName = "Unknown";
    }
    if (after.dosage !== undefined && typeof after.dosage !== "string") {
        updates.dosage = "";
    }
    if (after.frequency !== undefined) {
        const validFreqs = ["Daily", "Weekly", "Monthly", "As needed"];
        if (!validFreqs.includes(after.frequency)) {
            updates.frequency = "Daily";
        }
    }
    if (after.reminderTime !== undefined) {
        const time = String(after.reminderTime);
        if (!/^\d{2}:\d{2}$/.test(time)) {
            updates.reminderTime = "08:00";
        }
    }
    if (Object.keys(updates).length > 0) {
        await ((_b = event.data) === null || _b === void 0 ? void 0 : _b.after.ref.update(updates));
    }
});
//# sourceMappingURL=index.js.map