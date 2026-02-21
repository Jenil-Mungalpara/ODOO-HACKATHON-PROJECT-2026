import { MdCheck } from 'react-icons/md';

export default function Wizard({ steps = [], currentStep = 0, children }) {
  return (
    <div>
      <div className="wizard-steps">
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className={`wizard-step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}>
              <div className="wizard-step-number">
                {i < currentStep ? <MdCheck /> : i + 1}
              </div>
              <div className="wizard-step-label">{step}</div>
            </div>
            {i < steps.length - 1 && (
              <div className={`wizard-connector ${i < currentStep ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        {children}
      </div>
    </div>
  );
}
