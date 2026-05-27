import { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { computeTargets } from '../lib/macros.js';

export function SettingsModal({ open, onClose, settings, onSave }) {
  const [weight, setWeight] = useState(settings.weight || '');
  const [startDate, setStartDate] = useState(settings.startDate || '');

  useEffect(() => {
    if (open) {
      setWeight(settings.weight || '');
      setStartDate(settings.startDate || '');
    }
  }, [open, settings]);

  const numericWeight = Number(weight) || 0;
  const targets = computeTargets(numericWeight);

  const submit = (e) => {
    e?.preventDefault?.();
    onSave({
      weight: numericWeight,
      startDate: startDate || settings.startDate,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Setup & Targets" testId="modal-settings">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="weight-input" className="label">Bodyweight (lbs)</label>
          <input
            id="weight-input"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="50"
            max="500"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input tabular"
            placeholder="e.g. 180"
            data-testid="input-weight"
            required
          />
        </div>

        <div>
          <label htmlFor="start-input" className="label">Sprint Start Date</label>
          <input
            id="start-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input tabular"
            data-testid="input-start-date"
          />
          <p className="text-xs text-ink-500 mt-1.5">
            Sets Day 1. Leave blank to start today on first save.
          </p>
        </div>

        <div className="card-tight p-4">
          <p className="label !mb-2">Daily Targets (auto)</p>
          <ul className="grid grid-cols-2 gap-3 text-sm tabular">
            <TargetRow label="Calories" value={targets.calories} unit="kcal" />
            <TargetRow label="Protein" value={targets.protein} unit="g" />
            <TargetRow label="Carbs" value={targets.carbs} unit="g" />
            <TargetRow label="Fats" value={targets.fats} unit="g" />
            <TargetRow label="Water" value={targets.water} unit="oz" />
          </ul>
          <p className="text-[11px] text-ink-500 mt-3 leading-snug">
            cal = lb &times; 17 &nbsp;&middot;&nbsp; protein = lb &times; 1.0 &nbsp;&middot;&nbsp;
            carbs = lb &times; 2.25 &nbsp;&middot;&nbsp; fats = lb &times; 0.45
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1" onClick={onClose} data-testid="button-settings-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" data-testid="button-settings-save">
            Save Targets
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TargetRow({ label, value, unit }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-ink-700/60 last:border-none pb-1.5 last:pb-0">
      <span className="text-ink-400 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-ink-100 font-semibold">
        {value}
        <span className="text-ink-500 text-xs font-normal ml-1">{unit}</span>
      </span>
    </li>
  );
}
