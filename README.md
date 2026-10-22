# RingSafe: Smart Doorstep Guardian 🛡️📦

> AI-Powered Doorstep Verification & Delivery Security Dashboard built for the Amazon Developer Hackathon (Ring Track).

[![Live Demo](https://img.shields.io/badge/Demo-Live_Deployment-brightgreen)]([https://ringsafe-devpostamazon.vercel.app/))
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview
RingSafe addresses alert fatigue and delivery security at the doorstep. Built to interface with the **Amazon Ring Developer Playground / Ring Webhooks**, RingSafe simulates an intelligent 1080p camera feed coupled with real-time visual verification of carriers, trusted residents, and suspicious nighttime visitors.

## Key Features
- **Doorstep Stream Simulation:** Switch between real-world scenarios (Amazon Carrier drop-off, Unknown Visitor, Verified Resident) with interactive overlays and bounding boxes.
- **Ring Webhook Engine:** Simulates real-time inbound payloads (`device.motion_detected`, `doorbell.ding`, `package.detected`).
- **AI Verification Badge:** Instant risk score classification (0-100%) and automated smart actions (e.g., auto-unlock smart lock, trigger porch lighting, log to cloud audit).
- **Developer Audit Panel:** Inspect raw JSON-RPC and Ring webhook responses directly in the dashboard.

## Tech Stack
- **Framework:** Next.js / React (v0 by Vercel)
- **Styling:** Tailwind CSS, shadcn/ui primitives, Lucide Icons
- **Deployment:** Vercel Global Edge Network
- **API Spec:** Conforms to Amazon Ring Developer API event standards

## Quickstart
```bash
git clone [https://github.com/YOUR_USERNAME/ringsafe-guardian.git](https://github.com/YOUR_USERNAME/ringsafe-guardian.git)
cd ringsafe-guardian
npm install
npm run dev
