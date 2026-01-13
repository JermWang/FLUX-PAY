"use client";

import { useState, useEffect, useRef } from "react";

export type TransferModalData = {
  amount: number;
  destination: string;
  resolvedAddress: string;
  hopCount: number;
  estimatedTimeMs: number;
  feeApplied: boolean;
  feeSol: number;
  planId: string;
  firstBurnerPubkey: string;
  fundingExpiresAtUnixMs?: number;
};

type TransferModalProps = {
  isOpen: boolean;
  data: TransferModalData | null;
  onConfirm: (editedAmount: number, editedDestination: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function TransferModal({ isOpen, data, onConfirm, onCancel, isLoading }: TransferModalProps) {
  const [editedAmount, setEditedAmount] = useState("");
  const [editedDestination, setEditedDestination] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [fundingSecondsLeft, setFundingSecondsLeft] = useState<number | null>(null);
  const expiryNotifiedRef = useRef(false);

  // Initialize editable fields when modal opens
  useEffect(() => {
    if (data) {
      setEditedAmount(String(data.amount));
      setEditedDestination(data.destination);
      setHasChanges(false);
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen || !data || typeof data.fundingExpiresAtUnixMs !== "number") {
      setFundingSecondsLeft(null);
      expiryNotifiedRef.current = false;
      return;
    }

    const expiresAt = Number(data.fundingExpiresAtUnixMs);
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
      setFundingSecondsLeft(null);
      expiryNotifiedRef.current = false;
      return;
    }

    expiryNotifiedRef.current = false;

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setFundingSecondsLeft(left);

      if (left <= 0 && !expiryNotifiedRef.current) {
        expiryNotifiedRef.current = true;
        fetch("/api/transfer/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.planId }),
          cache: "no-store",
        }).catch(() => null);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const estimatedTimeLabel =
    data.estimatedTimeMs > 0
      ? data.estimatedTimeMs < 60_000
        ? `~${Math.ceil(data.estimatedTimeMs / 1000)}s`
        : `~${Math.ceil(data.estimatedTimeMs / 60000)} min`
      : "—";
  const currentAmount = parseFloat(editedAmount) || 0;
  const estimatedUsd = (currentAmount * 180).toFixed(2); // Rough SOL price estimate
  const netAmount = currentAmount > 0 ? Math.max(0, currentAmount - (data.feeApplied ? data.feeSol : 0)) : 0;
  const fundingExpired = fundingSecondsLeft != null && fundingSecondsLeft <= 0;

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid number input
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEditedAmount(value);
      setHasChanges(true);
    }
  };

  const handleDestinationChange = (value: string) => {
    setEditedDestination(value);
    setHasChanges(true);
  };

  const handleConfirm = () => {
    const amount = parseFloat(editedAmount) || data.amount;
    onConfirm(amount, editedDestination || data.destination);
  };

  return (
    <div className="transfer-modal-overlay" onClick={onCancel}>
      <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="transfer-modal-header">
          <h2>Private Transfer</h2>
          <button className="transfer-modal-close" onClick={onCancel} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="transfer-modal-body">
          {fundingSecondsLeft != null && (
            <div className="transfer-modal-section">
              <label className="transfer-modal-label">Funding Window</label>
              <div className="transfer-modal-output-row">
                <span className="transfer-modal-output-amount">{formatElapsedTime(fundingSecondsLeft)}</span>
              </div>
              {fundingExpired && (
                <div className="transfer-modal-warning">
                  <span>Funding window expired. Please restart the transfer.</span>
                </div>
              )}
            </div>
          )}

          {/* From Section */}
          <div className="transfer-modal-section">
            <label className="transfer-modal-label">From</label>
            <div className="transfer-modal-input-row">
              <input
                type="text"
                className="transfer-modal-amount-input"
                value={editedAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
              <div className="transfer-modal-token">
                <div className="transfer-modal-token-icon">◎</div>
                <div className="transfer-modal-token-info">
                  <span className="transfer-modal-token-name">SOL</span>
                  <span className="transfer-modal-token-chain">On Solana</span>
                </div>
              </div>
            </div>
            <span className="transfer-modal-usd">${estimatedUsd}</span>
          </div>

          {/* Arrow */}
          <div className="transfer-modal-arrow-container">
            <div className="transfer-modal-arrow-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>

          {/* To Section */}
          <div className="transfer-modal-section">
            <label className="transfer-modal-label">To</label>
            <div className="transfer-modal-output-row">
              <span className="transfer-modal-output-amount">{netAmount > 0 ? netAmount.toFixed(6) : "0"}</span>
              <div className="transfer-modal-token">
                <div className="transfer-modal-token-icon">◎</div>
                <div className="transfer-modal-token-info">
                  <span className="transfer-modal-token-name">SOL</span>
                  <span className="transfer-modal-token-chain">On Solana</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Address */}
          <div className="transfer-modal-section transfer-modal-section--address">
            <label className="transfer-modal-label">Receiving Wallet Address</label>
            <input
              type="text"
              className="transfer-modal-address-input"
              value={editedDestination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="Enter wallet address or .sol domain"
              disabled={isLoading}
            />
          </div>

          {/* Route Info */}
          <div className="transfer-modal-route">
            <div className="transfer-modal-route-badge">Private</div>
            <div className="transfer-modal-route-info">
              <span className="transfer-modal-route-hops">{data.hopCount} hops</span>
              <span className="transfer-modal-route-time">{estimatedTimeLabel}</span>
              <span className="transfer-modal-route-fee">
                {`${data.feeSol.toFixed(4)} SOL fee (1%)`}
              </span>
            </div>
          </div>

          {hasChanges && (
            <div className="transfer-modal-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>You&apos;ve made changes. A new routing plan will be created.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="transfer-modal-footer">
          <button
            className="transfer-modal-proceed-btn"
            onClick={handleConfirm}
            disabled={isLoading || fundingExpired || !editedAmount || !editedDestination}
          >
            {isLoading ? (
              <>
                <span className="transfer-modal-spinner"></span>
                Processing...
              </>
            ) : hasChanges ? (
              "Update & Proceed"
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
