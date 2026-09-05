'use client';

import React from 'react';

export interface RoadmapCardProps {
  title: string;
  description: string;
  impact?: 'High' | 'Medium' | 'Low';
  estimatedSavings?: number;
  status?: 'recommended' | 'in_progress' | 'completed';
  onSelect?: () => void;
}

const IMPACT_BADGE_CLASS: Record<'High' | 'Medium' | 'Low', string> = {
  Low: 'bg-success-subtle text-success border border-success-subtle',
  Medium: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  High: 'bg-danger-subtle text-danger border border-danger-subtle',
};

export default function RoadmapCard({
  title,
  description,
  impact = 'Medium',
  estimatedSavings = 0,
  onSelect,
}: RoadmapCardProps) {
  return (
    <div
      onClick={onSelect}
      className="card border border-light-subtle bg-light p-3 rounded-3 cursor-pointer hover-shadow transition-all"
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div className="d-flex align-items-start gap-3">
          <i className="bi bi-exclamation-circle-fill text-warning fs-5 mt-1"></i>
          <div>
            <h6 className="fw-bold text-dark mb-1">{title}</h6>
            <p className="text-muted small mb-0">{description}</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 shrink-0 w-100 w-sm-auto pt-2 pt-sm-0 border-top border-sm-0">
          <span className={`badge rounded-pill ${IMPACT_BADGE_CLASS[impact]}`}>
            {impact} Impact
          </span>
          <span className="fw-bold text-dark">
            +₹{estimatedSavings.toLocaleString('en-IN')}
          </span>
          <i className="bi bi-arrow-right text-muted"></i>
        </div>
      </div>
    </div>
  );
}