import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

admin.initializeApp();

export const validateAppointmentUpdate = functions.onDocumentUpdated(
  "appointments/{appointmentId}",
  async (event) => {
    const after = event.data?.after.data();
    const before = event.data?.before.data();
    if (!after || !before) return;

    const statusChanged = before.status !== after.status;
    if (!statusChanged) return;

    const validStatuses = ["pending", "forwarded", "accepted", "rejected"];
    if (!validStatuses.includes(after.status)) {
      console.error(`Invalid status: ${after.status}`);
      await event.data?.after.ref.update({ status: before.status || "pending" });
      return;
    }

    if (after.status === "rejected" && !after.rejectionReason) {
      await event.data?.after.ref.update({ rejectionReason: "No reason provided" });
    }

    logger.info(
      `Appointment ${event.params.appointmentId} status: ${before.status} -> ${after.status}`
    );
  }
);

export const validateDiagnosisWrite = functions.onDocumentUpdated(
  "patients/{patientId}/data/{dataId}/consultations/{consultationId}",
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    const updates: Record<string, unknown> = {};

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
      await event.data?.after.ref.update(updates);
    }
  }
);

export const validatePatientProfile = functions.onDocumentUpdated(
  "patients/{patientId}",
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    const updates: Record<string, unknown> = {};

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
      await event.data?.after.ref.update(updates);
      logger.info(
        `Fixed patient profile ${event.params.patientId}:`,
        updates
      );
    }
  }
);

export const validateReminderWrite = functions.onDocumentUpdated(
  "patients/{patientId}/data/reminderData/reminders/{reminderId}",
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    const updates: Record<string, unknown> = {};

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
      await event.data?.after.ref.update(updates);
    }
  }
);
