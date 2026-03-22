// ── CRM TypeScript Interfaces & Demo Data ──

// ─── Enums / Types ──────────────────────────────────────────
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED';
export type LeadScore = 'HOT' | 'WARM' | 'COLD';
export type LeadSource = 'WEB' | 'REFERRAL' | 'SOCIAL' | 'EMAIL' | 'EVENT' | 'COLD_CALL' | 'OTHER';
export type OpportunityStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK';
export type CampaignType = 'EMAIL' | 'SMS' | 'SOCIAL' | 'EVENT';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// ─── Interfaces ─────────────────────────────────────────────
export interface CrmContact {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    company: string;
    accountId?: string;
    lastActivity?: string;
    createdAt: string;
}

export interface CrmAccount {
    id: string;
    name: string;
    industry: string;
    size: string;
    revenue: string;
    website?: string;
    contactIds: string[];
    createdAt: string;
}

export interface CrmLead {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    source: LeadSource;
    status: LeadStatus;
    score: LeadScore;
    notes?: string;
    createdAt: string;
}

export interface CrmOpportunity {
    id: string;
    title: string;
    company: string;
    contactName: string;
    value: number;
    probability: number;
    stage: OpportunityStage;
    expectedCloseDate: string;
    notes?: string;
    createdAt: string;
}

export interface CrmActivity {
    id: string;
    type: ActivityType;
    subject: string;
    contactName?: string;
    dealTitle?: string;
    notes?: string;
    duration?: number;
    outcome?: string;
    timestamp: string;
}

export interface CrmCampaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    budget: number;
    spent: number;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    startDate: string;
    endDate?: string;
    createdAt: string;
}

export interface CrmTicket {
    id: string;
    subject: string;
    description: string;
    customerName: string;
    customerEmail: string;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo: string;
    slaDeadline?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── ID Generator ───────────────────────────────────────────
let _counter = Date.now();
export function crmId(): string {
    return 'crm_' + (++_counter).toString(36);
}

// ─── Demo / Seed Data ───────────────────────────────────────

export const SEED_CONTACTS: CrmContact[] = [
    { id: 'ct1', name: 'Sarah Chen', email: 'sarah@techwave.io', phone: '+1 555-0101', role: 'CTO', company: 'TechWave', accountId: 'ac1', lastActivity: '2026-03-08', createdAt: '2026-01-15' },
    { id: 'ct2', name: 'James Miller', email: 'james@greenleaf.co', phone: '+1 555-0102', role: 'CEO', company: 'GreenLeaf Co', accountId: 'ac2', lastActivity: '2026-03-07', createdAt: '2026-01-20' },
    { id: 'ct3', name: 'Maria Garcia', email: 'maria@solarpeak.com', phone: '+1 555-0103', role: 'VP Sales', company: 'SolarPeak', accountId: 'ac3', lastActivity: '2026-03-09', createdAt: '2026-02-01' },
    { id: 'ct4', name: 'David Kim', email: 'david@nexusai.dev', phone: '+1 555-0104', role: 'Product Lead', company: 'NexusAI', accountId: 'ac4', lastActivity: '2026-03-06', createdAt: '2026-02-10' },
    { id: 'ct5', name: 'Lisa Thompson', email: 'lisa@bluehorizon.com', phone: '+1 555-0105', role: 'Procurement Manager', company: 'Blue Horizon', accountId: 'ac5', lastActivity: '2026-03-05', createdAt: '2026-02-15' },
    { id: 'ct6', name: 'Alex Petrov', email: 'alex@quantumdata.io', phone: '+1 555-0106', role: 'Engineering Lead', company: 'QuantumData', lastActivity: '2026-03-04', createdAt: '2026-02-20' },
    { id: 'ct7', name: 'Emily Watts', email: 'emily@cloudnest.co', phone: '+1 555-0107', role: 'Operations Director', company: 'CloudNest', lastActivity: '2026-03-03', createdAt: '2026-03-01' },
];

export const SEED_ACCOUNTS: CrmAccount[] = [
    { id: 'ac1', name: 'TechWave', industry: 'Technology', size: '51-200', revenue: '$12M', contactIds: ['ct1'], createdAt: '2026-01-15' },
    { id: 'ac2', name: 'GreenLeaf Co', industry: 'Agriculture', size: '11-50', revenue: '$4.5M', contactIds: ['ct2'], createdAt: '2026-01-20' },
    { id: 'ac3', name: 'SolarPeak', industry: 'Energy', size: '201-500', revenue: '$45M', contactIds: ['ct3'], createdAt: '2026-02-01' },
    { id: 'ac4', name: 'NexusAI', industry: 'Technology', size: '11-50', revenue: '$8M', website: 'https://nexusai.dev', contactIds: ['ct4'], createdAt: '2026-02-10' },
    { id: 'ac5', name: 'Blue Horizon', industry: 'Logistics', size: '501-1000', revenue: '$120M', contactIds: ['ct5'], createdAt: '2026-02-15' },
];

export const SEED_LEADS: CrmLead[] = [
    { id: 'ld1', name: 'Robert Nash', email: 'r.nash@innovate.co', phone: '+1 555-0201', company: 'Innovate Corp', source: 'WEB', status: 'NEW', score: 'HOT', createdAt: '2026-03-08' },
    { id: 'ld2', name: 'Amy Lin', email: 'amy@startupx.io', phone: '+1 555-0202', company: 'StartupX', source: 'REFERRAL', status: 'CONTACTED', score: 'WARM', createdAt: '2026-03-06' },
    { id: 'ld3', name: 'Carlos Diaz', email: 'carlos@megabuild.com', phone: '+1 555-0203', company: 'MegaBuild', source: 'EVENT', status: 'QUALIFIED', score: 'HOT', createdAt: '2026-03-04' },
    { id: 'ld4', name: 'Nina Patel', email: 'nina@freshfood.co', phone: '+1 555-0204', company: 'FreshFood', source: 'SOCIAL', status: 'NEW', score: 'COLD', createdAt: '2026-03-02' },
    { id: 'ld5', name: 'Tom Bradley', email: 'tom@velocitytech.com', phone: '+1 555-0205', company: 'Velocity Tech', source: 'COLD_CALL', status: 'UNQUALIFIED', score: 'COLD', createdAt: '2026-02-28' },
    { id: 'ld6', name: 'Sophie Martin', email: 'sophie@luxedesign.co', phone: '+1 555-0206', company: 'Luxe Design', source: 'EMAIL', status: 'CONTACTED', score: 'WARM', createdAt: '2026-03-01' },
];

export const SEED_OPPORTUNITIES: CrmOpportunity[] = [
    { id: 'op1', title: 'TechWave Platform License', company: 'TechWave', contactName: 'Sarah Chen', value: 48000, probability: 75, stage: 'NEGOTIATION', expectedCloseDate: '2026-03-20', createdAt: '2026-02-01' },
    { id: 'op2', title: 'GreenLeaf IoT Sensors', company: 'GreenLeaf Co', contactName: 'James Miller', value: 15000, probability: 50, stage: 'PROPOSAL', expectedCloseDate: '2026-03-25', createdAt: '2026-02-10' },
    { id: 'op3', title: 'SolarPeak Integration Suite', company: 'SolarPeak', contactName: 'Maria Garcia', value: 125000, probability: 30, stage: 'QUALIFICATION', expectedCloseDate: '2026-04-15', createdAt: '2026-02-20' },
    { id: 'op4', title: 'NexusAI Data Pipeline', company: 'NexusAI', contactName: 'David Kim', value: 32000, probability: 90, stage: 'NEGOTIATION', expectedCloseDate: '2026-03-15', createdAt: '2026-01-25' },
    { id: 'op5', title: 'Blue Horizon Logistics SaaS', company: 'Blue Horizon', contactName: 'Lisa Thompson', value: 210000, probability: 20, stage: 'PROSPECTING', expectedCloseDate: '2026-05-01', createdAt: '2026-03-01' },
    { id: 'op6', title: 'CloudNest Migration', company: 'CloudNest', contactName: 'Emily Watts', value: 67000, probability: 60, stage: 'PROPOSAL', expectedCloseDate: '2026-04-01', createdAt: '2026-02-15' },
    { id: 'op7', title: 'Innovate Analytics Add-on', company: 'Innovate Corp', contactName: 'Robert Nash', value: 9500, probability: 95, stage: 'CLOSED_WON', expectedCloseDate: '2026-03-05', createdAt: '2026-01-10' },
    { id: 'op8', title: 'StartupX Pilot Program', company: 'StartupX', contactName: 'Amy Lin', value: 5000, probability: 0, stage: 'CLOSED_LOST', expectedCloseDate: '2026-02-28', createdAt: '2026-01-20' },
];

export const SEED_ACTIVITIES: CrmActivity[] = [
    { id: 'av1', type: 'CALL', subject: 'Discovery call with TechWave', contactName: 'Sarah Chen', dealTitle: 'TechWave Platform License', duration: 35, outcome: 'Positive', timestamp: '2026-03-09T14:30:00' },
    { id: 'av2', type: 'EMAIL', subject: 'Proposal sent to GreenLeaf', contactName: 'James Miller', dealTitle: 'GreenLeaf IoT Sensors', timestamp: '2026-03-09T11:00:00' },
    { id: 'av3', type: 'MEETING', subject: 'Quarterly review with SolarPeak', contactName: 'Maria Garcia', dealTitle: 'SolarPeak Integration Suite', duration: 60, outcome: 'Follow-up scheduled', timestamp: '2026-03-08T10:00:00' },
    { id: 'av4', type: 'NOTE', subject: 'Updated pricing for NexusAI deal', dealTitle: 'NexusAI Data Pipeline', notes: 'Client requested 10% volume discount. Approved by manager.', timestamp: '2026-03-08T16:45:00' },
    { id: 'av5', type: 'TASK', subject: 'Send contract to Blue Horizon', contactName: 'Lisa Thompson', dealTitle: 'Blue Horizon Logistics SaaS', notes: 'Legal review pending', timestamp: '2026-03-07T09:00:00' },
    { id: 'av6', type: 'CALL', subject: 'Follow-up with CloudNest', contactName: 'Emily Watts', dealTitle: 'CloudNest Migration', duration: 20, outcome: 'Interested', timestamp: '2026-03-07T15:20:00' },
    { id: 'av7', type: 'EMAIL', subject: 'Welcome email to new lead', contactName: 'Robert Nash', notes: 'Automated welcome sequence triggered', timestamp: '2026-03-06T08:00:00' },
    { id: 'av8', type: 'MEETING', subject: 'Demo presentation for QuantumData', contactName: 'Alex Petrov', duration: 45, outcome: 'Very interested — requesting proposal', timestamp: '2026-03-05T14:00:00' },
];

export const SEED_CAMPAIGNS: CrmCampaign[] = [
    { id: 'cm1', name: 'Spring Product Launch', type: 'EMAIL', status: 'ACTIVE', budget: 5000, spent: 3200, sent: 12500, opened: 4800, clicked: 1200, converted: 85, startDate: '2026-03-01', endDate: '2026-03-31', createdAt: '2026-02-20' },
    { id: 'cm2', name: 'LinkedIn Awareness', type: 'SOCIAL', status: 'ACTIVE', budget: 3000, spent: 1800, sent: 0, opened: 0, clicked: 2400, converted: 32, startDate: '2026-02-15', createdAt: '2026-02-10' },
    { id: 'cm3', name: 'Webinar Series Q1', type: 'EVENT', status: 'COMPLETED', budget: 2000, spent: 1950, sent: 8000, opened: 3200, clicked: 900, converted: 120, startDate: '2026-01-10', endDate: '2026-02-28', createdAt: '2026-01-05' },
    { id: 'cm4', name: 'SMS Flash Sale', type: 'SMS', status: 'DRAFT', budget: 1500, spent: 0, sent: 0, opened: 0, clicked: 0, converted: 0, startDate: '2026-04-01', createdAt: '2026-03-05' },
];

export const SEED_TICKETS: CrmTicket[] = [
    { id: 'tk1', subject: 'Cannot access dashboard', description: 'User reports 403 error when accessing main dashboard', customerName: 'Sarah Chen', customerEmail: 'sarah@techwave.io', priority: 'HIGH', status: 'OPEN', assignedTo: 'Support Team', slaDeadline: '2026-03-10T18:00:00', createdAt: '2026-03-09T10:00:00', updatedAt: '2026-03-09T10:00:00' },
    { id: 'tk2', subject: 'Invoice discrepancy', description: 'Invoice #1042 shows incorrect amount — should be $4,500 not $5,400', customerName: 'James Miller', customerEmail: 'james@greenleaf.co', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'Billing Team', slaDeadline: '2026-03-11T18:00:00', createdAt: '2026-03-08T14:00:00', updatedAt: '2026-03-09T09:30:00' },
    { id: 'tk3', subject: 'Feature request: Bulk export', description: 'Customer requesting ability to bulk export order history as CSV', customerName: 'Maria Garcia', customerEmail: 'maria@solarpeak.com', priority: 'LOW', status: 'OPEN', assignedTo: 'Product Team', createdAt: '2026-03-07T11:00:00', updatedAt: '2026-03-07T11:00:00' },
    { id: 'tk4', subject: 'Payment gateway timeout', description: 'Stripe payments timing out for amounts over $10,000', customerName: 'Lisa Thompson', customerEmail: 'lisa@bluehorizon.com', priority: 'CRITICAL', status: 'IN_PROGRESS', assignedTo: 'Engineering Team', slaDeadline: '2026-03-09T14:00:00', createdAt: '2026-03-09T08:00:00', updatedAt: '2026-03-09T12:00:00' },
    { id: 'tk5', subject: 'Product images not loading', description: 'Thumbnails show broken image icon on store frontend', customerName: 'David Kim', customerEmail: 'david@nexusai.dev', priority: 'HIGH', status: 'RESOLVED', assignedTo: 'Engineering Team', createdAt: '2026-03-06T16:00:00', updatedAt: '2026-03-08T10:00:00' },
];

// ─── localStorage CRUD helpers ──────────────────────────────

function getStore<T>(key: string, seed: T[]): T[] {
    if (typeof window === 'undefined') return seed;
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }
    try { return JSON.parse(raw); } catch { return seed; }
}

function setStore<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
}

// Generic CRUD factory
function makeCrud<T extends { id: string }>(storageKey: string, seed: T[]) {
    return {
        getAll: (): T[] => getStore<T>(storageKey, seed),
        getById: (id: string): T | undefined => getStore<T>(storageKey, seed).find(i => i.id === id),
        create: (item: T): T[] => {
            const items = getStore<T>(storageKey, seed);
            items.unshift(item);
            setStore(storageKey, items);
            return items;
        },
        update: (id: string, patch: Partial<T>): T[] => {
            const items = getStore<T>(storageKey, seed);
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) items[idx] = { ...items[idx], ...patch };
            setStore(storageKey, items);
            return items;
        },
        remove: (id: string): T[] => {
            let items = getStore<T>(storageKey, seed).filter(i => i.id !== id);
            setStore(storageKey, items);
            return items;
        },
    };
}

export const contactsStore = makeCrud<CrmContact>('crm_contacts', SEED_CONTACTS);
export const accountsStore = makeCrud<CrmAccount>('crm_accounts', SEED_ACCOUNTS);
export const leadsStore = makeCrud<CrmLead>('crm_leads', SEED_LEADS);
export const opportunitiesStore = makeCrud<CrmOpportunity>('crm_opportunities', SEED_OPPORTUNITIES);
export const activitiesStore = makeCrud<CrmActivity>('crm_activities', SEED_ACTIVITIES);
export const campaignsStore = makeCrud<CrmCampaign>('crm_campaigns', SEED_CAMPAIGNS);
export const ticketsStore = makeCrud<CrmTicket>('crm_tickets', SEED_TICKETS);
