// ─── Order Success Card (styled-components) ──────────────────────────────────
// Rendered under Screen 4 (result) when paymentResult.status === 'SUCCESS'.
// Replaces the plain "Back to Shop" button block for the success branch only;
// the failure branch (Try Again / Back to Shop) is untouched.

import styled from 'styled-components'

export const StyledWrapper = styled.div`
  .success-card {
    width: 100%;
    border-radius: 16px;
    background: linear-gradient(135deg, #FFFFFF 0%, #FAFAF9 100%);
    border: 1.5px solid #E7DDD5;
    padding: 28px 24px;
    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
    box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.08);
  }

  .success-card .badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .success-card .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #15803D;
    box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
  }

  .success-card .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #15803D;
  }

  .success-card h3 {
    font-size: 1.05rem;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }

  .success-card p {
    font-size: 13px;
    color: #78716C;
    line-height: 1.55;
    margin: 0 0 22px;
  }

  .success-card .actions {
    display: flex;
    gap: 10px;
  }

  .success-card button {
    flex: 1;
    padding: 12px 0;
    border-radius: 10px;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  .success-card button:active {
    transform: scale(0.97);
  }

  .success-card .btn-primary {
    background: #0F172A;
    color: #FFFFFF;
  }

  .success-card .btn-primary:hover {
    opacity: 0.92;
  }

  .success-card .btn-secondary {
    background: #FFFFFF;
    color: #0F172A;
    border: 1.5px solid #E7DDD5;
  }

  .success-card .btn-secondary:hover {
    background: #F7F5F2;
  }
`

export function OrderSuccessCard({ onTrackPackage, onViewHistory }) {
    return (
        <StyledWrapper>
            <div className="success-card">
                <div className="badge-row">
                    <span className="dot" />
                    <span className="label">Order Confirmed</span>
                </div>
                <h3>You're all set!</h3>
                <p>
                    We've started preparing your order. You can track its progress
                    or browse your full order history any time.
                </p>
                <div className="actions">
                    <button className="btn-secondary" onClick={onViewHistory}>
                        History
                    </button>
                    <button className="btn-primary" onClick={onTrackPackage}>
                        Track my package
                    </button>
                </div>
            </div>
        </StyledWrapper>
    )
}