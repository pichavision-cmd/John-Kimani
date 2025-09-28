import React from 'react';

export interface ForumPost {
    id: number;
    author: string;
    avatarUrl: string;
    content: string;
    timestamp: string;
    locationUrl?: string;
}

export interface Reminder {
    id: number;
    text: string;
    dateTime: string; // ISO string
}

export interface RiderProfile {
    fullName: string;
    idNumber: string;
    phoneNumber: string;
    passportPhoto: string; // base64 string
    operatingArea: string;
    motorbikeReg: string;
    drivingLicenceNo: string;
    licenceClass: string;
    ntsaCertificate: string; // base64 string
    ntsaCertificateName: string;
    saccoName: string;
    saccoMembershipNo: string;
    insurancePolicyNo: string;
    insuranceExpiry: string; // date string
}

export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string; // ISO string
    description: string;
}

export interface SafetyVideo {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    language: 'English' | 'Swahili';
}

export interface GovNotice {
    id: number;
    title: string;
    content: string;
    date: string; // date string
    category: string;
}

export interface FinancialProduct {
    id: number;
    provider: string;
    type: 'Insurance' | 'Loan';
    name: string;
    features: string[];
    contactUrl: string;
}

export interface RideRequest {
    id: number;
    customerName: string;
    pickup: string;
    destination: string;
    estimatedFare: number;
    status: 'pending' | 'accepted' | 'declined';
}

export interface CustomerFeedback {
    id: number;
    customerName: string;
    rating: number;
    comment: string;
    date: string; // ISO string
}

export interface Game {
    id: number;
    title: string;
    description: string;
    type: 'quiz' | 'trivia';
}

export interface MusicShare {
    id: number;
    user: string;
    avatarUrl: string;
    songTitle: string;
    artist: string;
    platform: string;
    url: string;
}

export interface MarketplaceItem {
    id: number;
    name: string;
    price: number;
    seller: string;
    imageUrl: string;
    category: 'Gear' | 'Parts' | 'Phones';
}

export interface HealthTip {
    id: number;
    title: string;
    content: string;
    category: string;
}

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

export interface Alert {
    id: number;
    rider: string;
    plate: string;
    type: string;
    gps: string;
    time: string;
    timeISO: string;
    status: 'new' | 'acknowledged' | 'in-progress' | 'resolved';
}

export interface ChatMessage {
    id: number;
    sender: 'admin' | 'rider';
    text?: string;
    audioSrc?: string; // base64 encoded audio
    duration?: number; // in seconds
    timestamp: string; // ISO string
}

export interface Conversation {
    id: number;
    riderId: number; // to link with a member
    riderName: string;
    avatarUrl: string;
    messages: ChatMessage[];
}