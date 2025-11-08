

export interface Party {
    id: string;
    userId: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    createdAt: string;
}

export interface InvoiceItem {
    product: string;
    qty: number;
    rate: number;
    perKg: number;
    total: number;
}

export interface Invoice {
    id: string;
    userId: string;
    partyId: string;
    items: InvoiceItem[];
    grandTotal: number;
    createdAt: string;
}
