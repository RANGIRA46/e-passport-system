import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Btn, Input, Select } from '../../components/ui/index.jsx'
import { StepBar } from '../../components/shared/Charts.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const STEPS = ['Personal Info', 'Documents', 'Appointment', 'Payment']
const SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30']
const TAKEN = ['08:30','10:00']

export default function Apply() {
  const [step, setStep]     = useState(1)
  const [type, setType]     = useState('passport')
  const [docs, setDocs]     = useState({ photo: false, nid_front: false, nid_back: false, birth: false })
  const [slot, setSlot]     = useState(null)
  const [method, setMethod] = useState('mtn')
  const [done, setDone]     = useState(false)
  const { showToast }       = useToast()
  const navigate            = useNavigate()
  const allDocs             = Object.values(docs).every(Boolean)

  function handleSubmit() {
    showToast('Application submitted successfully! Reference: APP-2026-0043')
    setDone(true)
  }

  if (done) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: 540, margin: '0 auto' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 8 }}>Application Submitted!</div>
      <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Your reference number is</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1A56DB', background: '#EFF6FF', padding: '10px 24px', borderRadius: 10, display: 'inline-block', marginBottom: 24 }}>APP-2026-0043</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>You will receive an SMS and email notification when your application status changes.</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Btn onClick={() => navigate('/portal/status')}>Track Application</Btn>
        <Btn variant="secondary" onClick={() => { setStep(1); setDone(false); setSlot(null); setDocs({ photo: false, nid_front: false, nid_back: false, birth: false }) }}>Apply Again</Btn>
      </div>
    </div>
  )

  return (
    <div className="fade-in" style={{ maxWidth: 660, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>New Application</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Complete all 4 steps to submit your application</div>
      </div>
      <div style={{ marginTop: 20 }}>
        <StepBar current={step} steps={STEPS} />
      </div>

      <Card>
        {/* STEP 1 — Personal Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>Personal Information</div>
            <Select label="Application Type" value={type} onChange={e => setType(e.target.value)} required options={[
              { value: 'passport',  label: '🛂  Passport Application' },
              { value: 'visa',      label: '🌍  Visa Application' },
              { value: 'renewal',   label: '🔄  Passport Renewal' },
              { value: 'emergency', label: '🚨  Emergency Passport' }
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Full Name"      value="BARAKA Johnson"      readOnly required />
              <Input label="National ID"    value="1199880012345678"    readOnly required />
              <Input label="Date of Birth"  type="date" defaultValue="1988-04-15" required />
              <Input label="Place of Birth" placeholder="e.g. Kigali"  required />
              <Select label="Gender" options={[{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }, { value: 'x', label: 'Prefer not to say' }]} />
              <Input label="Phone Number" value="+250 788 123 456" readOnly required />
            </div>
            <Input label="Additional Notes" placeholder="Any relevant information…" rows={2} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn onClick={() => setStep(2)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* STEP 2 — Documents */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>Upload Documents</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>All documents must be clear, legible scans. PDF, JPG, or PNG — max 5MB each.</div>
            {[
              { key: 'photo',     label: 'Passport Photo',      hint: 'White background, recent — max 2MB' },
              { key: 'nid_front', label: 'National ID — Front', hint: 'PDF or JPG — max 5MB' },
              { key: 'nid_back',  label: 'National ID — Back',  hint: 'PDF or JPG — max 5MB' },
              { key: 'birth',     label: 'Birth Certificate',   hint: 'PDF or JPG — max 5MB' }
            ].map(doc => (
              <div key={doc.key} onClick={() => setDocs(d => ({ ...d, [doc.key]: !d[doc.key] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: docs[doc.key] ? '1.5px solid #10B981' : '1.5px dashed #D1D5DB', background: docs[doc.key] ? '#ECFDF5' : '#FAFAFA', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: docs[doc.key] ? '#10B981' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: docs[doc.key] ? '#fff' : '#6B7280', fontSize: 16, flexShrink: 0, transition: 'all 0.2s' }}>
                  {docs[doc.key] ? '✓' : '⬆'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{doc.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{docs[doc.key] ? '✓ Uploaded successfully' : doc.hint}</div>
                </div>
                <div style={{ fontSize: 11, color: docs[doc.key] ? '#065F46' : '#1A56DB', fontWeight: 600 }}>{docs[doc.key] ? 'Uploaded' : 'Click to upload'}</div>
              </div>
            ))}
            {!allDocs && <div style={{ fontSize: 11, color: '#C27803', background: '#FFFBEB', padding: '8px 12px', borderRadius: 8, border: '1px solid #FCD34D' }}>⚠️  Please upload all required documents to continue</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
              <Btn onClick={() => setStep(3)} disabled={!allDocs}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* STEP 3 — Appointment */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>Book Biometric Appointment</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>You must visit a DGIE office to have your fingerprints and photo taken.</div>
            <Select label="Select Location" required options={[
              { value: 'kigali',    label: 'Kigali DGIE Main Office — KN 3 Avenue' },
              { value: 'musanze',   label: 'Musanze District Office' },
              { value: 'huye',      label: 'Huye District Office' },
              { value: 'rubavu',    label: 'Rubavu / Gisenyi Office' },
              { value: 'nyagatare', label: 'Nyagatare District Office' }
            ]} />
            <Input label="Select Date" type="date" required />
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Available Time Slots <span style={{ color: '#E02424' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {SLOTS.map(s => (
                  <button key={s} type="button" disabled={TAKEN.includes(s)} onClick={() => setSlot(s)}
                    style={{ padding: '8px 4px', borderRadius: 8, border: slot === s ? '2px solid #1A56DB' : '1.5px solid #E5E7EB', background: TAKEN.includes(s) ? '#F3F4F6' : slot === s ? '#EFF6FF' : '#fff', color: TAKEN.includes(s) ? '#D1D5DB' : slot === s ? '#1A56DB' : '#374151', fontSize: 12, fontWeight: 600, cursor: TAKEN.includes(s) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    {s}
                    {TAKEN.includes(s) && <div style={{ fontSize: 9, color: '#D1D5DB' }}>Taken</div>}
                  </button>
                ))}
              </div>
            </div>
            {slot && <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#065F46' }}>✅  Slot selected: <strong>{slot}</strong> — Kigali DGIE Main Office</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={() => setStep(4)} disabled={!slot}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* STEP 4 — Payment */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>Review &amp; Pay</div>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Summary</div>
              {[['Type', type.charAt(0).toUpperCase() + type.slice(1) + ' Application'], ['Name', 'BARAKA Johnson'], ['National ID', '1199880012345678'], ['Appointment', `${slot} — Kigali DGIE`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#6B7280' }}>{k}:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#FFF7ED', borderRadius: 10, padding: '14px 16px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>FEE BREAKDOWN</div>
              {[['Application Fee', 'RWF 50,000'], ['Processing Fee', 'RWF 5,000'], ['Total', 'RWF 55,000']].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, fontWeight: i === 2 ? 800 : 400, borderTop: i === 2 ? '1px solid #FED7AA' : 'none', paddingTop: i === 2 ? 8 : 0, color: i === 2 ? '#0A2342' : '#374151' }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>Payment Method <span style={{ color: '#E02424' }}>*</span></label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ id: 'mtn', label: 'MTN Mobile Money', icon: '📱' }, { id: 'card', label: 'Bank Card', icon: '💳' }].map(m => (
                  <div key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: method === m.id ? '2px solid #1A56DB' : '1.5px solid #E5E7EB', background: method === m.id ? '#EFF6FF' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: method === m.id ? '#1A56DB' : '#374151' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              {method === 'mtn'  && <div style={{ marginTop: 12 }}><Input label="MTN Phone Number" placeholder="+250 7XX XXX XXX" helpText="You will receive a payment prompt on this number" /></div>}
              {method === 'card' && <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}><Input label="Card Number" placeholder="XXXX XXXX XXXX XXXX" /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><Input label="Expiry" placeholder="MM / YY" /><Input label="CVV" placeholder="XXX" /></div></div>}
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
              <input type="checkbox" style={{ marginTop: 2 }} />
              I confirm all information provided is true and accurate, and understand that false information is a criminal offence under Rwanda immigration law.
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Btn variant="secondary" onClick={() => setStep(3)}>← Back</Btn>
              <Btn onClick={handleSubmit} style={{ minWidth: 220, justifyContent: 'center' }}>🔒  Submit &amp; Pay RWF 55,000</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
