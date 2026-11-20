import React from 'react';
import {
  buildVaccineItemPayload,
  buildGrowthItemPayload,
  buildMilestoneItemPayload,
  deriveVaccineStatus,
  normalizeVaccineStatus,
  formatDisplayDate,
  toIsoDateString,
} from '../src/screens/completeProfileScreens/innerScreens/vaccinationPayloadUtils';

describe('Vaccination Flow & API Payload Builders', () => {
  describe('Vaccines API Payload Builder', () => {
    it('builds CASE 1: new vaccine with dose and full info', () => {
      const payload = buildVaccineItemPayload(
        {
          vaccineName: 'Influenza',
          dose: 'Yearly dose',
          dateGiven: '30 Oct 2026',
          givenAt: 'Little Steps Clinic',
          batchNumber: 'FLU26-0931',
          nextDue: '30 Oct 2027',
          remindMe: true,
          remindTiming: '2 weeks before',
        },
        {
          certificateScanId: '60a24944-ebb2-4d18-8bcf-e1e9dd214872',
          remindMemberIds: ['f3941dc1-9332-4bf5-9f7a-616b76854102'],
        },
      );

      expect(payload).toEqual({
        name: 'Influenza',
        dose: 'YEARLY',
        nextDueOn: '2027-10-30',
        reminderLeadDays: [14],
        remindMemberIds: ['f3941dc1-9332-4bf5-9f7a-616b76854102'],
        doses: [
          {
            dose: 'YEARLY',
            givenOn: '2026-10-30',
            givenAt: 'Little Steps Clinic',
            batchNumber: 'FLU26-0931',
            certificateScanId: '60a24944-ebb2-4d18-8bcf-e1e9dd214872',
          },
        ],
      });
    });

    it('builds CASE 2: edit existing vaccine with id', () => {
      const payload = buildVaccineItemPayload(
        {
          vaccineName: 'Hepatitis B',
          dose: 'Dose 3',
          dateGiven: '2027-05-10',
          givenAt: 'Little Steps Clinic',
          batchNumber: 'HEPB27-0099',
          nextDue: '',
          remindMe: false,
        },
        {
          id: 'existing-vaccine-123',
        },
      );

      expect(payload.id).toBe('existing-vaccine-123');
      expect(payload.dose).toBe('DOSE_3');
      expect(payload.doses[0].dose).toBe('DOSE_3');
      expect(payload.doses[0].givenOn).toBe('2027-05-10');
      expect(payload.doses[0].batchNumber).toBe('HEPB27-0099');
      expect(payload.nextDueOn).toBeUndefined();
    });
  });

  describe('Growth API Payload Builder', () => {
    it('builds growth payload with metric height & weight and next measure date', () => {
      const payload = buildGrowthItemPayload({
        heightCm: 132,
        weightKg: 28,
        measuredOn: '2026-10-12',
        remindMe: true,
      });

      expect(payload).toEqual({
        heightCm: 132,
        weightKg: 28,
        measuredOn: '2026-10-12',
        nextMeasureOn: '2027-01-12',
      });
    });
  });

  describe('Milestones API Payload Builder', () => {
    it('builds milestone payload with type and pulse sharing', () => {
      const payload = buildMilestoneItemPayload({
        title: 'Swam a full length of the pool',
        achievedOn: '2026-11-08',
        type: 'Physical',
        sharedToPulse: true,
      });

      expect(payload).toEqual({
        title: 'Swam a full length of the pool',
        achievedOn: '2026-11-08',
        type: 'PHYSICAL',
        sharedToPulse: true,
      });
    });
  });

  describe('Status & Date Utils', () => {
    it('correctly normalizes vaccine status from backend enum or derived dates', () => {
      expect(normalizeVaccineStatus('DUE')).toBe('due');
      expect(normalizeVaccineStatus('UPCOMING')).toBe('upcoming');
      expect(normalizeVaccineStatus('DONE')).toBe('done');
      expect(normalizeVaccineStatus('COMPLETE')).toBe('done');
      expect(normalizeVaccineStatus(undefined, null)).toBe('done');
    });

    it('formats ISO dates correctly for UI', () => {
      expect(formatDisplayDate('2026-10-30')).toBe('30 Oct 2026');
      expect(toIsoDateString('30 Oct 2026')).toBe('2026-10-30');
    });
  });
});

