"use client";

import { FIRResponse } from "./types";

interface EntitiesTabProps {
  result: FIRResponse;
}

export function EntitiesTab({ result }: EntitiesTabProps) {
  const hasEntities = result.extracted_persons?.length || result.extracted_entities?.locations?.length || result.extracted_phone_numbers?.length || result.extracted_emails?.length || result.extracted_aadhar?.length || result.extracted_vehicle_numbers?.length || result.extracted_pan_numbers?.length || result.extracted_entities?.organizations?.length || result.extracted_entities?.money?.length;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 border-l-2 border-amber-500/30 pl-3">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  const Tag = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
    <span className={`px-3.5 py-2 text-foreground text-sm rounded-xl border border-amber-500/10 shadow-sm hover:border-amber-500/25 hover:shadow-ember transition-forge font-medium ${mono ? 'font-mono' : ''}`} style={{ background: 'rgba(245,158,11,0.04)' }}>{children}</span>
  );

  return (
    <div className="space-y-6">
      {result.extracted_persons?.length > 0 && <Section title="Persons Mentioned">{result.extracted_persons.map((person, idx) => <Tag key={idx}>{person}</Tag>)}</Section>}
      {result.extracted_entities?.locations?.length > 0 && <Section title="Locations">{result.extracted_entities.locations.map((loc, idx) => <Tag key={idx}>{loc}</Tag>)}</Section>}
      {(result.extracted_entities?.dates?.length > 0 || result.extracted_entities?.times?.length > 0) && <Section title="Dates & Times">{result.extracted_entities.dates?.map((date, idx) => <Tag key={`d-${idx}`}>{date}</Tag>)}{result.extracted_entities.times?.map((time, idx) => <Tag key={`t-${idx}`}>{time}</Tag>)}</Section>}
      {result.extracted_phone_numbers?.length > 0 && <Section title="Phone Numbers">{result.extracted_phone_numbers.map((phone, idx) => <Tag key={idx} mono>{phone}</Tag>)}</Section>}
      {result.extracted_emails?.length > 0 && <Section title="Email Addresses">{result.extracted_emails.map((email, idx) => <Tag key={idx} mono>{email}</Tag>)}</Section>}
      {result.extracted_aadhar?.length > 0 && <Section title="Aadhaar Numbers">{result.extracted_aadhar.map((aadhar, idx) => <Tag key={idx} mono>{aadhar}</Tag>)}</Section>}
      {result.extracted_vehicle_numbers?.length > 0 && <Section title="Vehicle Numbers">{result.extracted_vehicle_numbers.map((vehicle, idx) => <Tag key={idx} mono>{vehicle}</Tag>)}</Section>}
      {result.extracted_pan_numbers?.length > 0 && <Section title="PAN Numbers">{result.extracted_pan_numbers.map((pan, idx) => <Tag key={idx} mono>{pan}</Tag>)}</Section>}
      {result.extracted_entities?.organizations?.length > 0 && <Section title="Organizations">{result.extracted_entities.organizations.map((org, idx) => <Tag key={idx}>{org}</Tag>)}</Section>}
      {result.extracted_entities?.money?.length > 0 && <Section title="Monetary Amounts">{result.extracted_entities.money.map((amount, idx) => <Tag key={idx}>{amount}</Tag>)}</Section>}
      {!hasEntities && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-amber-500/10 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.03)' }}><span className="text-3xl opacity-40">&#127991;&#65039;</span></div>
          <p className="text-sm text-muted-foreground font-medium">No specific entities were extracted from the description.</p>
        </div>
      )}
    </div>
  );
}
