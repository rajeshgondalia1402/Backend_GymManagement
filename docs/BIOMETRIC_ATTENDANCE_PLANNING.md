# Biometric Attendance System - Detailed Planning Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Feasibility Analysis](#feasibility-analysis)
3. [Recommended Biometric Hardware](#recommended-biometric-hardware)
4. [Budget/Low-Cost Device Options](#budgetlow-cost-device-options)
5. [SecuGen Hamster Pro 20 Setup Guide](#secugen-hamster-pro-20-setup-guide)
6. [Door Lock Integration](#door-lock-integration)
7. [System Architecture](#system-architecture)
8. [Database Schema Design](#database-schema-design)
9. [API Endpoints Design](#api-endpoints-design)
10. [Integration Workflow](#integration-workflow)
11. [Frontend Implementation](#frontend-implementation)
12. [Security Considerations](#security-considerations)
13. [Implementation Phases](#implementation-phases)
14. [Cost Estimation](#cost-estimation)

---

## Executive Summary

This document outlines the comprehensive plan for implementing a biometric fingerprint attendance system in the Gym Management application. The system will allow registered members to mark their attendance using a fingerprint scanner through a **web browser-based interface**, with automatic date-based tracking and role-based visibility.

### Key Features
- Fingerprint-based member authentication via web browser
- One attendance entry per member per day
- Real-time attendance marking
- Gym Owner dashboard for attendance reports
- Member self-service attendance history
- Cross-platform support (Windows & macOS) via WebUSB API
- No desktop application installation required

---

## Feasibility Analysis

### Is Biometric Fingerprint Attendance Possible via Web Browser?

**YES** - Biometric fingerprint attendance is feasible through web browsers using the **WebUSB API**.

### Technical Feasibility

| Aspect | Feasibility | Notes |
|--------|-------------|-------|
| Hardware Integration | ✅ High | USB fingerprint scanners with WebUSB support |
| Web Integration | ✅ High | WebUSB API (Chrome, Edge, Opera) |
| Cross-Platform | ✅ High | Windows & macOS supported via WebUSB |
| Database Storage | ✅ High | Fingerprint templates stored as encrypted binary |
| Real-time Processing | ✅ High | Modern scanners process in <1 second |

### WebUSB API Overview

The **WebUSB API** allows web applications to communicate directly with USB devices from the browser, eliminating the need for desktop applications or browser extensions.

| Feature | Details |
|---------|---------|
| **Browser Support** | Chrome 61+, Edge 79+, Opera 48+ |
| **macOS Support** | ✅ Full support |
| **Windows Support** | ✅ Full support |
| **Linux Support** | ✅ Full support |
| **iOS/Safari** | ❌ Not supported |
| **Firefox** | ❌ Not supported (security concerns) |
| **HTTPS Required** | ✅ Yes (or localhost) |

### Browser Compatibility Matrix

| Browser | Windows | macOS | Linux | Recommended |
|---------|---------|-------|-------|-------------|
| **Google Chrome** | ✅ | ✅ | ✅ | ✅ Primary |
| **Microsoft Edge** | ✅ | ✅ | ✅ | ✅ Recommended |
| **Opera** | ✅ | ✅ | ✅ | Secondary |
| Safari | ❌ | ❌ | ❌ | Not Supported |
| Firefox | ❌ | ❌ | ❌ | Not Supported |

**Note:** For gyms, we recommend using **Google Chrome** or **Microsoft Edge** on the kiosk computer for attendance marking.

---

## Recommended Biometric Hardware

### Primary Recommendation: SecuGen Hamster Pro 20

| Specification | Details |
|--------------|---------|
| **Model** | SecuGen Hamster Pro 20 (HU20) |
| **Price Range** | $79 - $120 USD |
| **OS Support** | Windows 7/8/10/11, macOS, Linux |
| **Interface** | USB 2.0 (WebUSB compatible) |
| **Resolution** | 500 DPI optical |
| **WebUSB Support** | ✅ Yes (with JavaScript SDK) |
| **Template Size** | ~400 bytes per fingerprint |
| **FAR/FRR** | 0.001% / 0.1% |
| **Capture Time** | <1 second |
| **Durability** | IP65 rated, scratch-resistant |

**Why SecuGen for Web Integration?**
- Excellent WebUSB compatibility
- JavaScript SDK available for browser integration
- Cross-platform (Windows & macOS)
- Industry standard in gym/fitness industry
- No driver installation required on modern OS
- Cost-effective

### Alternative Options (WebUSB Compatible)

#### Option 2: DigitalPersona U.are.U 4500

| Specification | Details |
|--------------|---------|
| **Model** | U.are.U 4500 |
| **Price Range** | $100 - $150 USD |
| **OS Support** | Windows, macOS, Linux |
| **WebUSB Support** | ✅ Yes |
| **Best For** | High-volume environments |

#### Option 3: Futronic FS80H

| Specification | Details |
|--------------|---------|
| **Model** | Futronic FS80H |
| **Price Range** | $60 - $90 USD |
| **OS Support** | Windows, macOS, Linux |
| **WebUSB Support** | ✅ Yes (via generic USB) |
| **Best For** | Budget-friendly web integration |

### Hardware Comparison Matrix (WebUSB Focus)

| Feature | SecuGen HU20 | DigitalPersona 4500 | Futronic FS80H |
|---------|--------------|---------------------|----------------|
| Windows Support | ✅ | ✅ | ✅ |
| macOS Support | ✅ | ✅ | ✅ |
| WebUSB Compatible | ✅ | ✅ | ✅ |
| JavaScript SDK | ✅ | ✅ | ⚠️ Limited |
| Price | $$ | $$$ | $ |
| Durability | High | High | Medium |
| **Recommended** | ✅ Primary | Secondary | Budget |

### Important: WebUSB Device Setup

For WebUSB to work, the device must:
1. Be connected via USB (not Bluetooth)
2. Have a compatible USB interface descriptor
3. Not be claimed by a kernel driver (may require driver unbinding on some systems)

```
Windows Setup:
- Chrome/Edge automatically handles USB access
- May need to install WinUSB driver via Zadig tool (one-time setup)

macOS Setup:
- Works out of the box with Chrome/Edge
- No additional drivers needed
```

---

## Budget/Low-Cost Device Options

For gyms on a tight budget, here are **affordable alternatives** that still work with your web application.

### Budget Fingerprint Scanners (For Web App Integration)

```
┌─────────────────────────────────────────────────────────────────┐
│              BUDGET FINGERPRINT SCANNERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Futronic FS80H (BEST BUDGET - WebUSB)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $35-50 USD                                            │
│  • Resolution: 500 DPI                                          │
│  • Interface: USB 2.0                                           │
│  • WebUSB: ✅ Yes (with some configuration)                     │
│  • OS: Windows, Linux, macOS                                    │
│  • SDK: Free SDK available                                      │
│  • Best for: Budget web app integration                         │
│  • Buy: Amazon, AliExpress                                      │
│                                                                  │
│  2. Aratek A600 (Budget + Reliable)                             │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $40-60 USD                                            │
│  • Resolution: 500 DPI                                          │
│  • Interface: USB 2.0                                           │
│  • WebUSB: ✅ Yes                                               │
│  • OS: Windows, Linux, macOS                                    │
│  • SDK: Free JavaScript SDK                                     │
│  • Best for: Small gyms                                         │
│  • Buy: Amazon, Aratek official                                 │
│                                                                  │
│  3. ZKTeco ZK4500 (Budget Desktop Scanner)                      │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $30-45 USD                                            │
│  • Resolution: 500 DPI                                          │
│  • Interface: USB 2.0                                           │
│  • WebUSB: ⚠️ Limited (needs SDK)                               │
│  • OS: Windows, Linux                                           │
│  • SDK: Free ZK SDK                                             │
│  • Best for: Very tight budget                                  │
│  • Buy: AliExpress, Amazon                                      │
│                                                                  │
│  4. Mantra MFS100 (Popular in India)                            │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $25-40 USD                                            │
│  • Resolution: 500 DPI                                          │
│  • Interface: USB 2.0                                           │
│  • WebUSB: ⚠️ Via local service                                 │
│  • OS: Windows, Linux, Android                                  │
│  • SDK: Free RD Service                                         │
│  • Best for: India market, Aadhaar integration                  │
│  • Buy: Amazon India, Flipkart                                  │
│                                                                  │
│  5. Generic USB Fingerprint Scanner (Cheapest)                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $15-25 USD                                            │
│  • Resolution: 500 DPI                                          │
│  • Interface: USB 2.0                                           │
│  • WebUSB: ⚠️ May need custom driver                            │
│  • OS: Windows                                                  │
│  • SDK: Generic SDK                                             │
│  • Best for: Testing/prototype only                             │
│  • Buy: AliExpress                                              │
│  • ⚠️ NOT recommended for production                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Budget All-in-One Access Control (Scanner + Door Relay)

```
┌─────────────────────────────────────────────────────────────────┐
│         BUDGET ALL-IN-ONE ACCESS CONTROL DEVICES                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  These devices include: Scanner + Relay + Controller            │
│  No computer needed at door!                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  1. ZKTeco K40 (BEST BUDGET ALL-IN-ONE) ★★★★★                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $55-80 USD                                            │
│  • Fingerprints: 1,000                                          │
│  • Records: 80,000                                              │
│  • Built-in Relay: ✅ Yes                                       │
│  • Network: TCP/IP, USB                                         │
│  • Web API: ✅ Yes (ZKTeco SDK)                                 │
│  • Display: 2.8" TFT                                            │
│  • Exit Button: ✅ Yes                                          │
│  • Door Sensor: ✅ Yes                                          │
│  • Buy: AliExpress ($55-65), Amazon ($70-80)                    │
│                                                                  │
│  2. Realand A-C030 (Very Cheap)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $40-55 USD                                            │
│  • Fingerprints: 1,000                                          │
│  • Records: 50,000                                              │
│  • Built-in Relay: ✅ Yes                                       │
│  • Network: TCP/IP, USB                                         │
│  • Web API: ⚠️ Limited                                          │
│  • Display: 2.4" TFT                                            │
│  • Buy: AliExpress                                              │
│                                                                  │
│  3. ZKTeco LX50 (Entry Level)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $45-60 USD                                            │
│  • Fingerprints: 500                                            │
│  • Records: 50,000                                              │
│  • Built-in Relay: ✅ Yes                                       │
│  • Network: USB only (no TCP/IP)                                │
│  • Web API: ⚠️ Via USB sync                                     │
│  • Display: 2.4" TFT                                            │
│  • Buy: AliExpress, Amazon                                      │
│                                                                  │
│  4. Generic Fingerprint Access Control                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Price: $35-50 USD                                            │
│  • Fingerprints: 500-1000                                       │
│  • Built-in Relay: ✅ Yes                                       │
│  • Network: Varies                                              │
│  • Web API: ❌ Usually not                                      │
│  • Buy: AliExpress                                              │
│  • ⚠️ No brand support, limited integration                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Budget Comparison Table

```
┌─────────────────────────────────────────────────────────────────┐
│              BUDGET DEVICE COMPARISON                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    │ Futronic  │ ZKTeco   │ ZKTeco  │ Realand  │
│  FEATURE           │ FS80H     │ ZK4500   │ K40     │ A-C030   │
│  ─────────────────────────────────────────────────────────────  │
│  Type              │ Scanner   │ Scanner  │ All-in-1│ All-in-1 │
│  Price             │ $35-50    │ $30-45   │ $55-80  │ $40-55   │
│  Door Relay        │ No*       │ No*      │ Yes     │ Yes      │
│  Computer Needed   │ Yes       │ Yes      │ No      │ No       │
│  Web Integration   │ WebUSB    │ SDK      │ TCP/IP  │ Limited  │
│  Offline Working   │ No        │ No       │ Yes     │ Yes      │
│  Fingerprint Cap.  │ Unlimited │ Unlimited│ 1,000   │ 1,000    │
│  Quality           │ Good      │ Medium   │ Good    │ Medium   │
│  Support           │ Good      │ Medium   │ Good    │ Poor     │
│  Recommended       │ ✅ Yes    │ Budget   │ ✅ Best │ ⚠️ Risky │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  * Needs separate USB relay module ($10-15) for door control    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### BEST BUDGET SETUP: Complete Shopping Lists

#### Option A: Scanner + Relay (Web App Native) - $75-100

```
┌─────────────────────────────────────────────────────────────────┐
│        BUDGET OPTION A: WEB APP NATIVE CONTROL                   │
│        Total: $75-100 (excluding door lock)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HARDWARE LIST:                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  □ Futronic FS80H Scanner          $35-50    AliExpress/Amazon  │
│  □ USB Relay Module (1-channel)    $8-12     AliExpress         │
│  □ Electric Strike Lock            $25-40    AliExpress         │
│  □ 12V 2A Power Supply             $5-8      AliExpress         │
│  □ Wires & Connectors              $5        Local store        │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL:                            $78-115                       │
│                                                                  │
│  PROS:                                                           │
│  ✓ Cheapest option with web integration                         │
│  ✓ Full control from your web app                               │
│  ✓ Real-time attendance                                         │
│  ✓ Unlimited fingerprints (stored in your DB)                   │
│                                                                  │
│  CONS:                                                           │
│  ✗ Requires computer running at door                            │
│  ✗ Won't work if computer/internet is down                      │
│  ✗ Futronic SDK may need some setup                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Option B: All-in-One Device - $100-150 (RECOMMENDED BUDGET)

```
┌─────────────────────────────────────────────────────────────────┐
│        BUDGET OPTION B: ALL-IN-ONE (RECOMMENDED)                 │
│        Total: $100-150                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HARDWARE LIST:                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  □ ZKTeco K40                      $55-80    AliExpress/Amazon  │
│  □ Electric Strike Lock            $25-40    AliExpress         │
│  □ 12V 3A Power Supply             $8-12     AliExpress         │
│  □ Exit Button                     $3-5      AliExpress         │
│  □ Network Cable                   $5        Local store        │
│  □ Wires & Connectors              $5        Local store        │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL:                            $101-147                      │
│                                                                  │
│  PROS:                                                           │
│  ✓ No computer needed at door                                   │
│  ✓ Works even if internet is down                               │
│  ✓ Built-in relay (less wiring)                                 │
│  ✓ Can sync with your web app                                   │
│  ✓ Professional appearance                                      │
│                                                                  │
│  CONS:                                                           │
│  ✗ Limited to 1,000 fingerprints                                │
│  ✗ Sync is not real-time (every few minutes)                    │
│  ✗ Need to enroll fingers on device                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Option C: Absolute Minimum Budget - $60-80

```
┌─────────────────────────────────────────────────────────────────┐
│        OPTION C: ABSOLUTE MINIMUM (Testing/Small Gym)            │
│        Total: $60-80                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HARDWARE LIST:                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  □ ZKTeco ZK4500 Scanner           $30-40    AliExpress         │
│  □ USB Relay Module                $8-10     AliExpress         │
│  □ Electric Bolt Lock (basic)      $15-20    AliExpress         │
│  □ 12V 1A Power Supply             $4-6      AliExpress         │
│  □ Wires                           $3-4      Local store        │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL:                            $60-80                        │
│                                                                  │
│  ⚠️ WARNINGS:                                                    │
│  • Not recommended for production                                │
│  • Limited SDK support                                           │
│  • May have reliability issues                                   │
│  • Good for testing/prototype only                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Budget Recommendation Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              BUDGET RECOMMENDATION SUMMARY                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR BUDGET          RECOMMENDED SETUP              TOTAL COST │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  $60-80              ZK4500 + Relay + Basic Lock     $60-80    │
│  (Testing only)      ⚠️ Not for production                      │
│                                                                  │
│  $80-120             Futronic FS80H + Relay + Lock   $80-115   │
│  (Tight budget)      ✅ Good for small gym with PC              │
│                                                                  │
│  $100-150            ZKTeco K40 + Lock               $100-150  │
│  (Best value)        ✅ RECOMMENDED - No PC needed ★            │
│                                                                  │
│  $150-200            ZKTeco F18 + Lock               $150-200  │
│  (Professional)      ✅ Best for medium gyms                    │
│                                                                  │
│  $200-300            SecuGen HU20 + Relay + Lock     $185-250  │
│  (Premium)           ✅ Best web integration                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ★ BEST BUDGET CHOICE: ZKTeco K40 ($55-80)                     │
│    + Electric Lock ($25-40) + Power Supply ($10)               │
│    = TOTAL: $90-130                                             │
│                                                                  │
│  This gives you:                                                │
│  • Professional fingerprint scanner                             │
│  • Built-in door relay                                          │
│  • Works without computer                                       │
│  • TCP/IP for web sync                                          │
│  • 1,000 fingerprint capacity                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Where to Buy (Budget Options)

```
┌─────────────────────────────────────────────────────────────────┐
│              WHERE TO BUY BUDGET DEVICES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ALIEXPRESS (Cheapest - 2-4 weeks shipping)                     │
│  ─────────────────────────────────────────────────────────────  │
│  • ZKTeco K40: $55-65                                           │
│  • ZKTeco ZK4500: $25-35                                        │
│  • Futronic FS80H: $30-40                                       │
│  • Electric Locks: $15-30                                       │
│  • USB Relay: $6-10                                             │
│  Search: "fingerprint access control" or "ZKTeco K40"           │
│                                                                  │
│  AMAZON (Faster shipping, slightly higher price)                │
│  ─────────────────────────────────────────────────────────────  │
│  • ZKTeco K40: $70-90                                           │
│  • ZKTeco F18: $100-130                                         │
│  • Futronic FS80H: $45-55                                       │
│  • Electric Locks: $30-50                                       │
│                                                                  │
│  INDIA SPECIFIC                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Amazon.in: ZKTeco devices ₹4,000-8,000                       │
│  • Flipkart: Mantra MFS100 ₹2,000-3,000                        │
│  • IndiaMART: Bulk pricing available                            │
│                                                                  │
│  TIPS FOR BUYING:                                                │
│  • Check seller ratings (4+ stars)                              │
│  • Look for "ZKTeco Official Store" on AliExpress               │
│  • Buy from sellers with >95% positive feedback                 │
│  • Consider shipping time vs price                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SecuGen Hamster Pro 20 Setup Guide

### Complete Setup for Web Application

This section provides step-by-step instructions for setting up the SecuGen Hamster Pro 20 fingerprint scanner with your web application.

### Hardware Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│              SecuGen Hamster Pro 20 (HU20) Specifications        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SENSOR                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Type: Optical                                                │
│  • Resolution: 500 DPI                                          │
│  • Sensing Area: 16.26mm x 18.29mm (0.64" x 0.72")             │
│  • Image Size: 260 x 300 pixels                                 │
│  • Grayscale: 256 levels (8-bit)                               │
│                                                                  │
│  PERFORMANCE                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  • Capture Time: < 1 second                                     │
│  • False Acceptance Rate (FAR): 0.001%                         │
│  • False Rejection Rate (FRR): 0.1%                            │
│  • Template Size: ~400 bytes (ISO 19794-2)                     │
│                                                                  │
│  INTERFACE                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Connection: USB 2.0 Full Speed                               │
│  • Cable Length: 6 feet (1.8m)                                  │
│  • Power: USB powered (no external power needed)                │
│                                                                  │
│  PHYSICAL                                                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Dimensions: 35mm x 65mm x 26mm                              │
│  • Weight: 110g                                                 │
│  • Operating Temp: 0°C to 40°C                                  │
│  • IP Rating: IP65 (dust & water resistant)                    │
│                                                                  │
│  USB IDENTIFIERS (For WebUSB)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Vendor ID: 0x1162 (4450 decimal)                            │
│  • Product ID: 0x0320 (800 decimal)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Hardware Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    HARDWARE SETUP STEPS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. UNBOX THE SCANNER                                           │
│     • SecuGen Hamster Pro 20 unit                               │
│     • USB cable (attached)                                      │
│     • Quick start guide                                         │
│                                                                  │
│  2. CONNECT TO COMPUTER                                         │
│     • Plug USB cable into available USB 2.0/3.0 port           │
│     • Avoid USB hubs if possible (direct connection better)    │
│     • Blue LED will light up when powered                       │
│                                                                  │
│  3. WAIT FOR DRIVER INSTALLATION                                │
│     Windows:                                                     │
│     • Windows 10/11 will auto-install drivers                   │
│     • Check Device Manager → "Biometric Devices"                │
│     • Should show "SecuGen USB Fingerprint Reader"              │
│                                                                  │
│     macOS:                                                       │
│     • No drivers needed (plug and play)                         │
│     • System Preferences → Security & Privacy → Allow           │
│                                                                  │
│  4. VERIFY CONNECTION                                           │
│     • LED should be solid blue (ready)                          │
│     • Blinking = processing                                     │
│     • Off = not connected/powered                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Windows WebUSB Driver Setup (One-Time)

For WebUSB to work on Windows, you may need to replace the default driver with WinUSB driver using **Zadig** tool.

```
┌─────────────────────────────────────────────────────────────────┐
│              WINDOWS WINUSB DRIVER INSTALLATION                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WHY THIS IS NEEDED:                                            │
│  Windows uses a proprietary driver that blocks WebUSB access.   │
│  We need to replace it with the generic WinUSB driver.          │
│                                                                  │
│  STEPS:                                                          │
│                                                                  │
│  1. Download Zadig from: https://zadig.akeo.ie/                 │
│     • Download "zadig-2.8.exe" (or latest version)              │
│                                                                  │
│  2. Connect SecuGen scanner to USB port                         │
│                                                                  │
│  3. Run Zadig as Administrator                                  │
│     • Right-click → "Run as administrator"                      │
│                                                                  │
│  4. In Zadig:                                                   │
│     • Menu → Options → "List All Devices" (check this)          │
│     • From dropdown, select "SecuGen USB FP Device"             │
│     • If not visible, try different USB port                    │
│                                                                  │
│  5. Configure driver replacement:                               │
│     • Driver to install: WinUSB (v6.x.xxxx.xxxxx)              │
│     • Click "Replace Driver" button                             │
│     • Wait for completion (may take 1-2 minutes)               │
│                                                                  │
│  6. Verify installation:                                        │
│     • Device Manager → Universal Serial Bus devices             │
│     • Should show "SecuGen USB FP Device" (not Biometric)       │
│                                                                  │
│  ⚠️  NOTE: This is a one-time setup per computer.               │
│  After this, WebUSB will work in Chrome/Edge.                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: macOS Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    macOS SETUP (Simple)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  macOS works out of the box with WebUSB!                        │
│                                                                  │
│  STEPS:                                                          │
│                                                                  │
│  1. Connect SecuGen scanner via USB                             │
│     • Use USB-A to USB-C adapter if needed for newer Macs      │
│                                                                  │
│  2. Open Chrome or Edge browser                                 │
│                                                                  │
│  3. Navigate to your gym application kiosk URL                  │
│                                                                  │
│  4. When prompted for USB access:                               │
│     • Click "Connect Scanner"                                   │
│     • Select "SecuGen" from the browser popup                   │
│     • Click "Connect"                                           │
│                                                                  │
│  5. If macOS asks for permission:                               │
│     • System Preferences → Security & Privacy                   │
│     • Allow Chrome/Edge to access USB devices                   │
│                                                                  │
│  That's it! No drivers or additional software needed.           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Browser Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                BROWSER CONFIGURATION FOR WEBUSB                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GOOGLE CHROME                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  1. Enable WebUSB (usually enabled by default)                  │
│     • chrome://flags → Search "WebUSB"                          │
│     • Ensure it's set to "Enabled" or "Default"                 │
│                                                                  │
│  2. Check USB permissions                                       │
│     • chrome://settings/content/usbDevices                      │
│     • Your site should be listed after first connection         │
│                                                                  │
│  3. For kiosk mode, launch Chrome with:                         │
│     chrome.exe --kiosk https://yourdomain.com/kiosk/attendance  │
│                                                                  │
│  MICROSOFT EDGE                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  1. Same process as Chrome (Chromium-based)                     │
│     • edge://flags → WebUSB                                     │
│     • edge://settings/content/usbDevices                        │
│                                                                  │
│  2. For kiosk mode:                                             │
│     msedge.exe --kiosk https://yourdomain.com/kiosk/attendance  │
│                                                                  │
│  IMPORTANT NOTES                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • HTTPS is REQUIRED (except localhost)                         │
│  • User must grant permission via browser popup                 │
│  • Permission persists until manually revoked                   │
│  • Browser must be in foreground for USB access                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Testing the Scanner

```typescript
// Test script to verify scanner connection in browser console

async function testScanner() {
  // Check WebUSB support
  if (!navigator.usb) {
    console.error('WebUSB not supported in this browser');
    return;
  }

  try {
    // Request device
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x1162 }]  // SecuGen Vendor ID
    });

    console.log('Device selected:', device.productName);

    // Open device
    await device.open();
    console.log('Device opened successfully');

    // Select configuration
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    console.log('Configuration selected');

    // Claim interface
    await device.claimInterface(0);
    console.log('Interface claimed - Scanner ready!');

    // Cleanup
    await device.releaseInterface(0);
    await device.close();
    console.log('Scanner test completed successfully!');

  } catch (error) {
    console.error('Scanner test failed:', error);
  }
}

// Run test
testScanner();
```

### Troubleshooting

```
┌─────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING GUIDE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROBLEM: Scanner not detected in browser                       │
│  ─────────────────────────────────────────────────────────────  │
│  Solutions:                                                      │
│  • Ensure USB cable is properly connected                       │
│  • Try a different USB port                                     │
│  • Windows: Run Zadig to install WinUSB driver                  │
│  • Restart browser after driver installation                    │
│  • Check chrome://device-log for USB errors                     │
│                                                                  │
│  PROBLEM: "Access denied" error                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Solutions:                                                      │
│  • Ensure site is served over HTTPS                             │
│  • Check if another app is using the scanner                    │
│  • Close other browser tabs that might have USB access          │
│  • Revoke and re-grant USB permission in browser settings       │
│                                                                  │
│  PROBLEM: Poor fingerprint quality                              │
│  ─────────────────────────────────────────────────────────────  │
│  Solutions:                                                      │
│  • Clean the scanner surface with soft cloth                    │
│  • Ensure finger is clean and dry                               │
│  • Press finger firmly but not too hard                         │
│  • Center finger on the scanning area                           │
│  • Try a different finger                                       │
│                                                                  │
│  PROBLEM: Scanner LED not lighting up                           │
│  ─────────────────────────────────────────────────────────────  │
│  Solutions:                                                      │
│  • Try a different USB port                                     │
│  • Connect directly to computer (not through hub)               │
│  • Check USB cable for damage                                   │
│  • Test on another computer                                     │
│                                                                  │
│  PROBLEM: Works on Windows but not macOS (or vice versa)        │
│  ─────────────────────────────────────────────────────────────  │
│  Solutions:                                                      │
│  • Windows: Ensure WinUSB driver is installed via Zadig         │
│  • macOS: Check Security & Privacy permissions                  │
│  • Both: Update Chrome/Edge to latest version                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Door Lock Integration

### Is Door Lock Integration Possible?

**YES** - Door lock integration with biometric verification is possible. The door will only unlock when a registered member successfully verifies their fingerprint.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│              BIOMETRIC DOOR ACCESS CONTROL FLOW                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MEMBER                                                         │
│      │                                                           │
│      │ 1. Places finger on scanner                              │
│      ▼                                                           │
│  ┌─────────────────┐                                            │
│  │  SecuGen HU20   │ ──── USB ────┐                             │
│  │  Scanner        │              │                             │
│  └─────────────────┘              │                             │
│                                   ▼                             │
│                          ┌─────────────────┐                    │
│                          │  Kiosk Computer │                    │
│                          │  (Browser)      │                    │
│                          │                 │                    │
│                          │ 2. Capture &    │                    │
│                          │    Process      │                    │
│                          └────────┬────────┘                    │
│                                   │                             │
│                                   │ 3. HTTPS API Call           │
│                                   ▼                             │
│                          ┌─────────────────┐                    │
│                          │  Cloud Backend  │                    │
│                          │                 │                    │
│                          │ 4. Match finger │                    │
│                          │ 5. Check member │                    │
│                          │ 6. Log attend.  │                    │
│                          └────────┬────────┘                    │
│                                   │                             │
│                     ┌─────────────┴─────────────┐               │
│                     │                           │               │
│                     ▼                           ▼               │
│            ┌─────────────┐             ┌─────────────┐          │
│            │  SUCCESS    │             │   FAILED    │          │
│            │  Response   │             │   Response  │          │
│            └──────┬──────┘             └──────┬──────┘          │
│                   │                           │                 │
│                   ▼                           ▼                 │
│         7a. Unlock Door              7b. Door Stays Locked     │
│             Signal                       Show Error             │
│                   │                                             │
│                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DOOR HARDWARE                         │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────┐   │   │
│  │  │   Relay     │───▶│ Electronic  │───▶│   Door     │   │   │
│  │  │   Module    │    │   Lock      │    │            │   │   │
│  │  │   (USB/     │    │(12V/24V)    │    │            │   │   │
│  │  │   Serial)   │    │             │    │            │   │   │
│  │  └─────────────┘    └─────────────┘    └────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Options

#### Option 1: USB Relay Module (Recommended for Web Apps)

The simplest approach is using a USB relay module that can be controlled via WebUSB or Serial API.

```
┌─────────────────────────────────────────────────────────────────┐
│                USB RELAY MODULE APPROACH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HARDWARE REQUIRED:                                              │
│                                                                  │
│  1. USB Relay Module                                             │
│     • Recommended: LCUS-1 USB Relay Module                      │
│     • Price: $10-20 USD                                         │
│     • Channels: 1 (single door) or 2/4/8 (multiple doors)      │
│     • Control: Serial/HID commands via USB                      │
│                                                                  │
│  2. Electronic Door Lock                                        │
│     • Electric Strike Lock (fail-secure)                        │
│     • Magnetic Lock (fail-safe)                                 │
│     • Electric Bolt Lock                                        │
│     • Price: $30-150 USD depending on type                      │
│                                                                  │
│  3. Power Supply                                                │
│     • 12V DC adapter for the lock                               │
│     • Price: $10-20 USD                                         │
│                                                                  │
│  WIRING DIAGRAM:                                                 │
│                                                                  │
│  [Computer USB] ──── [USB Relay] ──── [12V Power]               │
│                           │               │                      │
│                           └───── NO ──────┤                      │
│                                           │                      │
│                                    [Electric Lock]               │
│                                           │                      │
│                                          GND                     │
│                                                                  │
│  NO = Normally Open (lock stays locked, opens on signal)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Option 2: Smart Lock with API

Use a WiFi-enabled smart lock that has an HTTP API.

```
┌─────────────────────────────────────────────────────────────────┐
│                  SMART LOCK API APPROACH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RECOMMENDED SMART LOCKS:                                        │
│                                                                  │
│  1. Nuki Smart Lock (Europe)                                    │
│     • Has HTTP API                                              │
│     • Price: $200-300 USD                                       │
│     • WiFi + Bluetooth                                          │
│                                                                  │
│  2. August Smart Lock Pro (USA)                                 │
│     • Has API via August Connect                                │
│     • Price: $200-250 USD                                       │
│                                                                  │
│  3. TTLock Smart Lock (Budget)                                  │
│     • Has HTTP API                                              │
│     • Price: $50-100 USD                                        │
│     • Popular for commercial use                                │
│                                                                  │
│  FLOW:                                                           │
│                                                                  │
│  Browser ──▶ Your API ──▶ Smart Lock API ──▶ Door Unlocks       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Option 3: Microcontroller (ESP32/Arduino)

For more control, use a microcontroller with WiFi.

```
┌─────────────────────────────────────────────────────────────────┐
│              MICROCONTROLLER APPROACH (Advanced)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HARDWARE:                                                       │
│  • ESP32 Development Board ($5-15)                              │
│  • Relay Module ($3-5)                                          │
│  • 12V Power Supply ($10)                                       │
│  • Electric Lock ($30-150)                                      │
│                                                                  │
│  FLOW:                                                           │
│                                                                  │
│  [Fingerprint Success]                                          │
│         │                                                        │
│         ▼                                                        │
│  [Browser sends HTTP request to ESP32]                          │
│         │                                                        │
│         ▼                                                        │
│  [ESP32 triggers relay for 3 seconds]                           │
│         │                                                        │
│         ▼                                                        │
│  [Door unlocks]                                                  │
│                                                                  │
│  ESP32 CODE EXAMPLE:                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  #include <WiFi.h>                                              │
│  #include <WebServer.h>                                         │
│                                                                  │
│  #define RELAY_PIN 5                                            │
│  WebServer server(80);                                          │
│                                                                  │
│  void unlockDoor() {                                            │
│    digitalWrite(RELAY_PIN, HIGH);                               │
│    delay(3000);  // Keep unlocked for 3 seconds                 │
│    digitalWrite(RELAY_PIN, LOW);                                │
│    server.send(200, "text/plain", "Door unlocked");            │
│  }                                                               │
│                                                                  │
│  void setup() {                                                  │
│    pinMode(RELAY_PIN, OUTPUT);                                  │
│    WiFi.begin("GymWiFi", "password");                          │
│    server.on("/unlock", unlockDoor);                           │
│    server.begin();                                              │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Option 4: All-in-One Biometric Access Control Device (RECOMMENDED)

These are **standalone devices** with built-in fingerprint scanner + door relay. **Best option for "No fingerprint = Door stays locked"**.

```
┌─────────────────────────────────────────────────────────────────┐
│         ALL-IN-ONE BIOMETRIC ACCESS CONTROL DEVICES              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  These devices have EVERYTHING built-in:                        │
│  ✓ Fingerprint Scanner                                          │
│  ✓ Door Relay Controller                                        │
│  ✓ Exit Button Input                                            │
│  ✓ Door Sensor Input                                            │
│  ✓ Network Connectivity (TCP/IP)                                │
│  ✓ Local Storage (works offline)                                │
│  ✓ Web API for integration                                      │
│                                                                  │
│  BEST DEVICES:                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  1. ZKTeco K40 Pro (BEST VALUE)                                 │
│     • Price: $80-120                                            │
│     • Capacity: 3,000 fingerprints                              │
│     • Features: Finger + Card + PIN                             │
│     • Relay: Built-in                                           │
│     • Network: TCP/IP, USB                                      │
│     • Best for: Small gyms (< 500 members)                      │
│                                                                  │
│  2. ZKTeco F18 (RECOMMENDED)                                    │
│     • Price: $100-150                                           │
│     • Capacity: 3,000 fingerprints                              │
│     • Features: Fingerprint + Door control                      │
│     • Relay: Built-in                                           │
│     • Network: TCP/IP, USB                                      │
│     • Best for: Medium gyms (500-2000 members)                  │
│                                                                  │
│  3. ZKTeco MA500                                                │
│     • Price: $120-180                                           │
│     • Capacity: 3,000 fingerprints                              │
│     • Features: Waterproof (IP65), outdoor use                  │
│     • Relay: Built-in                                           │
│     • Best for: Outdoor/entry doors                             │
│                                                                  │
│  4. Hikvision DS-K1T804                                         │
│     • Price: $150-200                                           │
│     • Capacity: 3,000 fingerprints                              │
│     • Features: Fingerprint + Card                              │
│     • Best for: Professional installations                      │
│                                                                  │
│  5. ZKTeco SpeedFace V5L                                        │
│     • Price: $250-400                                           │
│     • Capacity: 6,000 faces + 3,000 fingerprints               │
│     • Features: Face + Finger + Temperature                     │
│     • Best for: Premium/large gyms                              │
│                                                                  │
│  6. Suprema BioEntry W2                                         │
│     • Price: $400-600                                           │
│     • Capacity: 500,000 fingerprints                            │
│     • Features: Enterprise-grade, IP67                          │
│     • Best for: Gym chains, enterprise                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

##### ZKTeco F18 Detailed Specifications (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│              ZKTeco F18 - DETAILED SPECIFICATIONS                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │                                     │                        │
│  │    ┌─────────────────────────┐     │                        │
│  │    │      LCD Display        │     │                        │
│  │    │      2.4" TFT           │     │                        │
│  │    └─────────────────────────┘     │                        │
│  │                                     │                        │
│  │    ┌─────────────────────────┐     │   SPECIFICATIONS:      │
│  │    │                         │     │   ─────────────────    │
│  │    │   Fingerprint Sensor    │     │   • Fingerprints: 3000 │
│  │    │   500 DPI Optical       │     │   • Records: 100,000   │
│  │    │                         │     │   • FAR: 0.0001%       │
│  │    └─────────────────────────┘     │   • FRR: 0.1%          │
│  │                                     │   • Verify: < 1 sec    │
│  │    ┌───┐ ┌───┐ ┌───┐              │                        │
│  │    │ 1 │ │ 2 │ │ 3 │              │   CONNECTIVITY:        │
│  │    └───┘ └───┘ └───┘              │   ─────────────────    │
│  │    ┌───┐ ┌───┐ ┌───┐              │   • TCP/IP (RJ45)      │
│  │    │ 4 │ │ 5 │ │ 6 │              │   • USB Host           │
│  │    └───┘ └───┘ └───┘              │   • RS485 (optional)   │
│  │    ┌───┐ ┌───┐ ┌───┐              │                        │
│  │    │ 7 │ │ 8 │ │ 9 │              │   I/O PORTS:           │
│  │    └───┘ └───┘ └───┘              │   ─────────────────    │
│  │          ┌───┐                     │   • Relay Output (lock)│
│  │          │ 0 │                     │   • Door Sensor Input  │
│  │          └───┘                     │   • Exit Button Input  │
│  │                                     │   • Alarm Output       │
│  └─────────────────────────────────────┘   • Wiegand In/Out    │
│                                                                  │
│  POWER: DC 12V (same as door lock - single power supply!)      │
│  DIMENSIONS: 158mm x 108mm x 35mm                               │
│  OPERATING TEMP: 0°C to 45°C                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

##### ZKTeco F18 Wiring Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              ZKTeco F18 WIRING DIAGRAM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌──────────────────┐                         │
│                    │    ZKTeco F18    │                         │
│                    │                  │                         │
│   12V Power ──────▶│ +12V        GND │◀────── GND              │
│   Supply           │                  │                         │
│                    │ NC ──────────────│──┐                      │
│                    │ COM ─────────────│──┼─▶ Electric Lock (+)  │
│                    │                  │  │                      │
│                    │ SENSOR ──────────│──┼─▶ Door Sensor        │
│                    │ GND ─────────────│──┼─▶ Door Sensor GND    │
│                    │                  │  │                      │
│                    │ BUTTON ──────────│──┼─▶ Exit Button        │
│                    │ GND ─────────────│──┼─▶ Exit Button GND    │
│                    │                  │  │                      │
│   Router ─────────▶│ RJ45 (TCP/IP)   │  │                      │
│                    │                  │  │                      │
│                    └──────────────────┘  │                      │
│                                          │                      │
│                    ┌─────────────────────┘                      │
│                    │                                            │
│                    ▼                                            │
│              Electric Lock (-)◀────── 12V GND                   │
│                                                                  │
│   ─────────────────────────────────────────────────────────    │
│                                                                  │
│   COMPONENTS NEEDED:                                            │
│   □ ZKTeco F18                    $100-150                      │
│   □ Electric Strike Lock          $50-80                        │
│   □ 12V 3A Power Supply           $15      (powers both!)      │
│   □ Exit Button                   $10                           │
│   □ Door Position Sensor          $10      (optional)           │
│   □ Network Cable (CAT5/6)        $10                           │
│   □ Wiring                        $10                           │
│   ─────────────────────────────────────────────────────────    │
│   TOTAL:                          $205-285                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

##### Integrating ZKTeco with Your Web Application

```
┌─────────────────────────────────────────────────────────────────┐
│         ZKTeco + WEB APPLICATION INTEGRATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  The ZKTeco device works STANDALONE for door access, but can    │
│  sync attendance data with your web application.                │
│                                                                  │
│  OPTION A: Push Mode (Real-time)                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [Member scans finger]                                          │
│         │                                                        │
│         ▼                                                        │
│  [ZKTeco verifies locally] ──▶ [Door Opens]                     │
│         │                                                        │
│         ▼                                                        │
│  [ZKTeco pushes to your API]                                    │
│         │                                                        │
│         ▼                                                        │
│  [Your backend records attendance]                              │
│                                                                  │
│  Your API endpoint receives:                                    │
│  POST /api/v1/zkteco/attendance-webhook                         │
│  {                                                               │
│    "device_id": "F18-001",                                      │
│    "user_id": "12345",                                          │
│    "punch_time": "2024-01-15 06:30:00",                        │
│    "punch_type": "CHECK_IN",                                    │
│    "verify_type": "FINGERPRINT"                                 │
│  }                                                               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  OPTION B: Pull Mode (Periodic Sync)                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Every 5 minutes, your backend:                                 │
│  1. Connects to ZKTeco via SDK                                  │
│  2. Fetches new attendance records                              │
│  3. Maps ZKTeco user_id to your member_id                       │
│  4. Saves to your Attendance table                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  MEMBER ENROLLMENT FLOW:                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  1. Gym owner creates member in your web app                    │
│  2. Your app calls ZKTeco API to add user                       │
│  3. Gym owner enrolls fingerprint on ZKTeco device              │
│  4. Member can now access the gym                               │
│                                                                  │
│  OR (simpler):                                                   │
│                                                                  │
│  1. Enroll member directly on ZKTeco device                     │
│  2. Sync user list to your web app periodically                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

##### ZKTeco API Integration Code Example

```typescript
// backend/src/services/zktecoService.ts

import axios from 'axios';

export class ZKTecoService {
  private deviceIp: string;
  private apiPort: number = 80;

  constructor(deviceIp: string) {
    this.deviceIp = deviceIp;
  }

  // Get all attendance records
  async getAttendanceRecords(startTime: Date, endTime: Date) {
    const response = await axios.get(
      `http://${this.deviceIp}:${this.apiPort}/cgi-bin/recordsdata.cgi`,
      {
        params: {
          starttime: this.formatDate(startTime),
          endtime: this.formatDate(endTime)
        }
      }
    );
    return this.parseRecords(response.data);
  }

  // Add user to device
  async addUser(userId: string, userName: string) {
    const response = await axios.post(
      `http://${this.deviceIp}:${this.apiPort}/cgi-bin/userdata.cgi`,
      {
        cmd: 'add',
        user_id: userId,
        user_name: userName,
        privilege: 0  // 0 = normal user
      }
    );
    return response.data;
  }

  // Delete user from device
  async deleteUser(userId: string) {
    const response = await axios.post(
      `http://${this.deviceIp}:${this.apiPort}/cgi-bin/userdata.cgi`,
      {
        cmd: 'delete',
        user_id: userId
      }
    );
    return response.data;
  }

  // Sync attendance to your database
  async syncAttendance(gymId: string) {
    const lastSync = await this.getLastSyncTime(gymId);
    const records = await this.getAttendanceRecords(lastSync, new Date());

    for (const record of records) {
      await this.saveAttendanceRecord(gymId, record);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private parseRecords(data: string): AttendanceRecord[] {
    // Parse ZKTeco response format
    // Implementation depends on device firmware
    return [];
  }

  private async saveAttendanceRecord(gymId: string, record: any) {
    // Map ZKTeco user_id to your member_id
    // Save to your Attendance table
  }

  private async getLastSyncTime(gymId: string): Promise<Date> {
    // Get last sync timestamp from database
    return new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
  }
}
```

### Device Comparison: Which to Choose?

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE COMPARISON                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    │ SecuGen    │ ZKTeco     │ ZKTeco    │ Suprema │
│  FEATURE           │ + Relay    │ K40 Pro    │ F18       │ BioEntry│
│  ─────────────────────────────────────────────────────────────  │
│  Price             │ $175-205   │ $80-120    │ $100-150  │ $400-600│
│  All-in-One        │ No         │ Yes        │ Yes       │ Yes     │
│  Computer Required │ Yes        │ No         │ No        │ No      │
│  Works Offline     │ No         │ Yes        │ Yes       │ Yes     │
│  Fingerprint Cap.  │ Unlimited* │ 3,000      │ 3,000     │ 500,000 │
│  Built-in Relay    │ No         │ Yes        │ Yes       │ Yes     │
│  LCD Display       │ No         │ Yes        │ Yes       │ Yes     │
│  Keypad            │ No         │ Yes        │ Yes       │ Optional│
│  Card Reader       │ No         │ Optional   │ Optional  │ Yes     │
│  Web API           │ Native**   │ Yes (SDK)  │ Yes (SDK) │ Yes     │
│  Exit Button       │ No         │ Yes        │ Yes       │ Yes     │
│  Door Sensor       │ No         │ Yes        │ Yes       │ Yes     │
│  Weatherproof      │ No         │ No         │ No        │ IP67    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  * Limited by your database                                     │
│  ** SecuGen integrates directly with your web app via WebUSB    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  RECOMMENDATION BY GYM SIZE:                                    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Small Gym (< 200 members):                                     │
│  → ZKTeco K40 Pro ($80-120)                                     │
│    Affordable, easy setup, all features included                │
│                                                                  │
│  Medium Gym (200-1000 members):                                 │
│  → ZKTeco F18 ($100-150) ← BEST CHOICE                         │
│    Professional grade, reliable, good API support               │
│                                                                  │
│  Large Gym (1000-3000 members):                                 │
│  → ZKTeco F18 or MA500 ($100-180)                              │
│    Consider multiple devices for different entry points         │
│                                                                  │
│  Premium/Chain Gyms (3000+ members):                            │
│  → Suprema BioEntry W2 ($400-600)                              │
│    Enterprise features, massive capacity                        │
│                                                                  │
│  Need Native Web App Integration:                               │
│  → SecuGen + USB Relay ($175-205)                              │
│    Real-time, browser-based, full control                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Final Recommendation: ZKTeco F18

```
┌─────────────────────────────────────────────────────────────────┐
│           ★ RECOMMENDED: ZKTeco F18 ($100-150) ★                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WHY ZKTeco F18 IS THE BEST CHOICE:                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✓ All-in-one device (scanner + relay + controller)            │
│  ✓ NO computer needed at the door                              │
│  ✓ Works even if internet is down (stores locally)             │
│  ✓ 3,000 fingerprint capacity (enough for most gyms)           │
│  ✓ 100,000 attendance records storage                          │
│  ✓ Built-in door relay (no extra hardware)                     │
│  ✓ Exit button support (for leaving gym from inside)           │
│  ✓ Door sensor support (detect if door left open)              │
│  ✓ TCP/IP for web integration                                  │
│  ✓ Can sync attendance to your web app                         │
│  ✓ Affordable price ($100-150)                                 │
│  ✓ Reliable brand (ZKTeco is market leader)                    │
│                                                                  │
│  COMPLETE SHOPPING LIST:                                         │
│  ─────────────────────────────────────────────────────────────  │
│  □ ZKTeco F18                          $100-150   Amazon/ZKTeco │
│  □ Electric Strike Lock (12V)          $50-80     Amazon        │
│  □ 12V 3A Power Supply                 $15        Amazon        │
│  □ Exit Button (push to exit)          $10        Amazon        │
│  □ Door Position Sensor (magnetic)     $10        Amazon        │
│  □ Network Cable (CAT5e)               $10        Amazon        │
│  □ Wiring & Connectors                 $10        Hardware store│
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL:                                $205-285                  │
│                                                                  │
│  WHERE TO BUY:                                                   │
│  • Amazon: Search "ZKTeco F18 fingerprint access control"       │
│  • AliExpress: Cheaper, but 2-4 weeks shipping                  │
│  • zkteco.com: Official store, best support                     │
│  • Local security supplier                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Setup: USB Relay + Electric Strike

For **web app native integration** (alternative to all-in-one):

```
┌─────────────────────────────────────────────────────────────────┐
│           RECOMMENDED DOOR LOCK HARDWARE LIST                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ITEM                              PRICE        WHERE TO BUY     │
│  ─────────────────────────────────────────────────────────────  │
│  SecuGen Hamster Pro 20            $100         Amazon/SecuGen  │
│  LCUS-1 USB Relay Module           $15          Amazon/AliExpress│
│  Electric Strike Lock              $40-80       Amazon/Security  │
│  12V 2A Power Adapter              $10          Amazon           │
│  Door Position Sensor (optional)   $10          Amazon           │
│  Wiring & Connectors               $10          Local hardware   │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL                             $185-225                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Door Lock API Integration

#### Database Addition

```prisma
// Add to Gym model
model Gym {
  // ... existing fields ...

  // Door Lock Settings
  doorLockEnabled       Boolean   @default(false)
  doorLockType          DoorLockType?
  doorLockEndpoint      String?   // For API-based locks
  doorLockApiKey        String?   // Encrypted API key
  doorUnlockDuration    Int       @default(3)  // Seconds

  // ... rest of model ...
}

enum DoorLockType {
  USB_RELAY           // SecuGen + USB Relay (web app controlled)
  SMART_LOCK_API      // WiFi smart locks (Nuki, TTLock, etc.)
  ESP32_HTTP          // Custom microcontroller solution
  ZKTECO_DEVICE       // All-in-one ZKTeco F18/K40 (standalone + sync)
  NONE                // No door lock integration
}
```

#### New API Endpoints

```
Base: /api/v1/gym-owner/door-lock

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  GET     │ /settings                   │ Get door lock configuration         │
│  PUT     │ /settings                   │ Update door lock settings           │
│  POST    │ /test                       │ Test door unlock (manual trigger)   │
│  GET     │ /status                     │ Get current door/lock status        │
│  GET     │ /logs                       │ Get door access logs                │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘

Internal (called after successful fingerprint):
┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  POST    │ /api/v1/internal/door/unlock│ Triggered by attendance check-in    │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

#### Modified Check-In Flow with Door Unlock

```typescript
// Backend: attendance.service.ts

async checkInWithDoorUnlock(gymId: string, fingerTemplate: string) {
  // 1. Verify fingerprint and check membership
  const member = await this.verifyFingerprint(gymId, fingerTemplate);

  if (!member) {
    return { success: false, error: 'FINGERPRINT_NOT_FOUND', doorUnlocked: false };
  }

  if (member.membershipStatus !== 'ACTIVE') {
    return { success: false, error: 'MEMBERSHIP_INACTIVE', doorUnlocked: false };
  }

  // 2. Check if already checked in today
  const existingAttendance = await this.getAttendanceToday(member.id);
  if (existingAttendance) {
    // Already checked in - still unlock door but don't create new record
    await this.unlockDoor(gymId);
    return {
      success: true,
      alreadyCheckedIn: true,
      doorUnlocked: true,
      member: member
    };
  }

  // 3. Create attendance record
  const attendance = await this.createAttendance(member.id, gymId);

  // 4. Unlock door
  const doorUnlocked = await this.unlockDoor(gymId);

  return {
    success: true,
    attendance,
    doorUnlocked,
    member
  };
}

async unlockDoor(gymId: string): Promise<boolean> {
  const gym = await this.getGymSettings(gymId);

  if (!gym.doorLockEnabled) {
    return false;  // Door lock not configured
  }

  switch (gym.doorLockType) {
    case 'USB_RELAY':
      // Send signal to frontend to trigger USB relay
      return this.emitDoorUnlockEvent(gymId);

    case 'SMART_LOCK_API':
      // Call smart lock HTTP API
      return this.callSmartLockApi(gym.doorLockEndpoint, gym.doorLockApiKey);

    case 'ESP32_HTTP':
      // Call ESP32 HTTP endpoint
      return this.callEsp32Unlock(gym.doorLockEndpoint);

    default:
      return false;
  }
}
```

#### Frontend: USB Relay Control via Web Serial API

```typescript
// frontend/src/services/doorLockService.ts

export class DoorLockService {
  private port: SerialPort | null = null;

  async connect(): Promise<void> {
    // Request serial port access
    this.port = await navigator.serial.requestPort({
      filters: [
        { usbVendorId: 0x1A86 }  // CH340 USB-Serial (common in relay modules)
      ]
    });

    await this.port.open({ baudRate: 9600 });
  }

  async unlockDoor(durationMs: number = 3000): Promise<void> {
    if (!this.port) {
      throw new Error('Serial port not connected');
    }

    const writer = this.port.writable.getWriter();

    try {
      // Send relay ON command (varies by relay module)
      await writer.write(new Uint8Array([0xA0, 0x01, 0x01, 0xA2]));  // ON

      // Wait for duration
      await new Promise(resolve => setTimeout(resolve, durationMs));

      // Send relay OFF command
      await writer.write(new Uint8Array([0xA0, 0x01, 0x00, 0xA1]));  // OFF

    } finally {
      writer.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }
}

export const doorLockService = new DoorLockService();
```

#### Complete Check-In with Door Unlock (Frontend)

```typescript
// frontend/src/pages/kiosk/AttendanceKiosk.tsx

async function handleFingerprintCapture(template: string) {
  try {
    // 1. Send fingerprint to backend
    const response = await api.post('/attendance/check-in', {
      gymId: gymId,
      fingerTemplate: template,
      deviceId: deviceId
    });

    if (response.data.success) {
      // 2. Show success message
      showWelcome(response.data.member);

      // 3. Unlock door if configured
      if (response.data.doorUnlocked) {
        playSuccessSound();
        showDoorUnlockingAnimation();

        // If using USB relay controlled from browser
        if (doorLockType === 'USB_RELAY') {
          await doorLockService.unlockDoor(3000);
        }
      }

      // 4. Log attendance
      console.log('Attendance recorded:', response.data.attendance);

    } else {
      // Show error - door stays locked
      showError(response.data.error);
      playErrorSound();
    }

  } catch (error) {
    showError('Connection error');
  }
}
```

### Door Lock Security Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│              DOOR LOCK SECURITY BEST PRACTICES                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHYSICAL SECURITY                                               │
│  ─────────────────────────────────────────────────────────────  │
│  • Use fail-secure locks (locked when power fails)              │
│  • Install emergency exit button inside                         │
│  • Have manual key override for emergencies                     │
│  • Protect wiring from tampering                                │
│                                                                  │
│  SYSTEM SECURITY                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • Use HTTPS for all API communications                         │
│  • Authenticate all door unlock requests                        │
│  • Log all door access events                                   │
│  • Set reasonable unlock duration (3-5 seconds)                 │
│  • Rate limit unlock requests                                   │
│                                                                  │
│  FALLBACK OPTIONS                                                │
│  ─────────────────────────────────────────────────────────────  │
│  • Manual unlock button for staff                               │
│  • Key override for emergencies                                 │
│  • Offline mode (if internet fails)                             │
│  • Battery backup for lock power                                │
│                                                                  │
│  MONITORING                                                      │
│  ─────────────────────────────────────────────────────────────  │
│  • Door position sensor (open/closed)                           │
│  • Alert if door held open too long                             │
│  • Alert on multiple failed attempts                            │
│  • Daily access reports for gym owner                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Complete Flow: Fingerprint → Attendance → Door Unlock

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          COMPLETE FLOW: BIOMETRIC ATTENDANCE + DOOR ACCESS                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Member                 Scanner              Browser              Backend              Door Lock
     │                      │                    │                    │                    │
     │  1. Place finger     │                    │                    │                    │
     │ ────────────────────▶│                    │                    │                    │
     │                      │                    │                    │                    │
     │                      │ 2. Capture         │                    │                    │
     │                      │────────────────────▶                    │                    │
     │                      │                    │                    │                    │
     │                      │                    │ 3. Process &       │                    │
     │                      │                    │    Send to API     │                    │
     │                      │                    │───────────────────▶│                    │
     │                      │                    │                    │                    │
     │                      │                    │                    │ 4. Verify finger   │
     │                      │                    │                    │ 5. Check member    │
     │                      │                    │                    │ 6. Check attend.   │
     │                      │                    │                    │ 7. Log attendance  │
     │                      │                    │                    │                    │
     │                      │                    │ 8. Success +       │                    │
     │                      │                    │    unlock=true     │                    │
     │                      │                    │◀───────────────────│                    │
     │                      │                    │                    │                    │
     │                      │                    │ 9. Trigger         │                    │
     │                      │                    │    door unlock     │                    │
     │                      │                    │───────────────────────────────────────▶│
     │                      │                    │                    │                    │
     │                      │                    │                    │              10. Door
     │                      │                    │                    │                  Opens
     │ 11. Show welcome     │                    │                    │                    │
     │     + Enter gym      │                    │                    │                    │
     │◀────────────────────────────────────────────────────────────────────────────────────│
     │                      │                    │                    │                    │
     │                      │                    │                    │              12. Door
     │                      │                    │                    │                  closes
     │                      │                    │                    │              (3 seconds)
     │                      │                    │                    │                    │
     ▼                      ▼                    ▼                    ▼                    ▼
```

---

## System Architecture

### High-Level Architecture (Web-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GYM PREMISES                                       │
│  ┌──────────────────┐    ┌──────────────────────────────────────────────┐  │
│  │  Fingerprint     │    │           WEB BROWSER (Chrome/Edge)           │  │
│  │  Scanner (USB)   │───▶│  ┌────────────────────────────────────────┐  │  │
│  │  SecuGen HU20    │    │  │         KIOSK WEB APPLICATION          │  │  │
│  │                  │◀───│  │  - WebUSB API for scanner access       │  │  │
│  └──────────────────┘    │  │  - Fingerprint capture & processing    │  │  │
│                          │  │  - Real-time attendance marking        │  │  │
│                          │  │  - Member welcome screen               │  │  │
│                          │  └────────────────────────────────────────┘  │  │
│                          └─────────────────────┬────────────────────────┘  │
│                                                │                            │
└────────────────────────────────────────────────┼────────────────────────────┘
                                                 │ HTTPS API Calls
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLOUD INFRASTRUCTURE                               │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  Backend API     │    │  PostgreSQL DB   │    │  File Storage    │      │
│  │  (Node.js)       │───▶│  Attendance +    │    │  (Cloudflare R2) │      │
│  │  /attendance/*   │    │  Biometric Data  │    │  Backup Storage  │      │
│  └────────┬─────────┘    └──────────────────┘    └──────────────────┘      │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                     FRONTEND DASHBOARDS                           │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │      │
│  │  │ Gym Owner   │  │  Trainer    │  │   Member    │               │      │
│  │  │ Attendance  │  │  (View)     │  │  My History │               │      │
│  │  │  Reports    │  │             │  │             │               │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture (Browser-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEB APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              BROWSER (Chrome/Edge)                        │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐  │   │
│  │  │   WebUSB API    │    │   React Frontend            │  │   │
│  │  │                 │    │   (Kiosk Mode)              │  │   │
│  │  │ - requestDevice │    │                             │  │   │
│  │  │ - claimInterface│    │ - BiometricService.ts       │  │   │
│  │  │ - transferIn    │    │ - AttendanceKiosk.tsx       │  │   │
│  │  │ - transferOut   │    │ - FingerprintCapture.tsx    │  │   │
│  │  └────────┬────────┘    └──────────────┬──────────────┘  │   │
│  │           │                            │                  │   │
│  │           └────────────┬───────────────┘                  │   │
│  │                        │                                  │   │
│  └────────────────────────┼──────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    BACKEND API                            │   │
│  │  ┌──────────────────┐    ┌──────────────────┐            │   │
│  │  │ BiometricService │    │ AttendanceService│            │   │
│  │  │                  │    │                  │            │   │
│  │  │ - enrollMember   │    │ - checkIn        │            │   │
│  │  │ - verifyMember   │    │ - checkOut       │            │   │
│  │  │ - matchTemplate  │    │ - getHistory     │            │   │
│  │  └──────────────────┘    └──────────────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### WebUSB Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WebUSB FINGERPRINT FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Connect Scanner" button                        │
│     │                                                            │
│     ▼                                                            │
│  2. Browser shows USB device picker                             │
│     navigator.usb.requestDevice({ filters: [...] })             │
│     │                                                            │
│     ▼                                                            │
│  3. User selects fingerprint scanner                            │
│     │                                                            │
│     ▼                                                            │
│  4. Browser grants access to device                             │
│     device.open() → device.claimInterface(0)                    │
│     │                                                            │
│     ▼                                                            │
│  5. Scanner is ready for capture                                │
│     │                                                            │
│     ▼                                                            │
│  6. User places finger on scanner                               │
│     │                                                            │
│     ▼                                                            │
│  7. Capture fingerprint via WebUSB                              │
│     device.transferIn() / device.transferOut()                  │
│     │                                                            │
│     ▼                                                            │
│  8. Process fingerprint in browser (WASM/JS SDK)                │
│     │                                                            │
│     ▼                                                            │
│  9. Send template to backend API                                │
│     POST /api/v1/attendance/check-in                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### New Tables Required

#### 1. MemberBiometric Table (Fingerprint Templates)

```prisma
// schema.prisma

model MemberBiometric {
  id                  String    @id @default(uuid())
  memberId            String    @unique  // One biometric record per member
  gymId               String              // For gym-scoped queries

  // Fingerprint Templates (Encrypted)
  // Store up to 2 fingers for redundancy
  fingerTemplate1     Bytes?              // Primary finger (encrypted)
  fingerTemplate2     Bytes?              // Backup finger (encrypted)
  fingerPosition1     FingerPosition?     // Which finger (e.g., RIGHT_THUMB)
  fingerPosition2     FingerPosition?

  // Template Metadata
  templateFormat      String    @default("ISO_19794_2")  // ISO standard
  templateVersion     String    @default("1.0")
  quality1            Int?                // Quality score 0-100
  quality2            Int?

  // Enrollment Info
  enrolledAt          DateTime  @default(now())
  enrolledBy          String?             // User ID who enrolled
  lastUpdatedAt       DateTime  @updatedAt
  deviceId            String?             // Scanner used for enrollment

  // Status
  isActive            Boolean   @default(true)
  failedAttempts      Int       @default(0)  // Track failed verifications
  lastFailedAt        DateTime?

  // Relations
  member              Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)
  gym                 Gym       @relation(fields: [gymId], references: [id])
  enrolledByUser      User?     @relation(fields: [enrolledBy], references: [id])

  @@index([gymId])
  @@index([memberId])
  @@map("member_biometrics")
}

enum FingerPosition {
  RIGHT_THUMB
  RIGHT_INDEX
  RIGHT_MIDDLE
  RIGHT_RING
  RIGHT_LITTLE
  LEFT_THUMB
  LEFT_INDEX
  LEFT_MIDDLE
  LEFT_RING
  LEFT_LITTLE
}
```

#### 2. Attendance Table

```prisma
model Attendance {
  id                  String            @id @default(uuid())
  memberId            String
  gymId               String

  // Date & Time
  attendanceDate      DateTime          @db.Date  // Just the date portion
  checkInTime         DateTime                    // Full timestamp
  checkOutTime        DateTime?                   // Optional check-out

  // Duration (auto-calculated)
  durationMinutes     Int?                        // Calculated on check-out

  // Verification Details
  verificationMethod  VerificationMethod
  verificationScore   Int?                        // Match score (0-100)
  deviceId            String?                     // Scanner device ID

  // Status
  status              AttendanceStatus  @default(CHECKED_IN)

  // Manual Override (for corrections)
  isManualEntry       Boolean           @default(false)
  manualEntryBy       String?           // User ID if manual
  manualEntryReason   String?

  // Audit
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  // Relations
  member              Member            @relation(fields: [memberId], references: [id])
  gym                 Gym               @relation(fields: [gymId], references: [id])
  manualEntryUser     User?             @relation(fields: [manualEntryBy], references: [id])

  // Constraints
  @@unique([memberId, attendanceDate])  // One attendance per member per day
  @@index([gymId])
  @@index([memberId])
  @@index([attendanceDate])
  @@index([gymId, attendanceDate])      // Composite for reports
  @@map("attendance")
}

enum AttendanceStatus {
  CHECKED_IN          // Member checked in, hasn't checked out
  CHECKED_OUT         // Member checked out
  ABSENT              // Marked absent (for reporting)
}

enum VerificationMethod {
  FINGERPRINT         // Biometric fingerprint
  MANUAL              // Manual entry by gym owner
  CARD                // RFID card (future)
  FACE                // Face recognition (future)
  QR_CODE             // QR code scan (future)
}
```

#### 3. BiometricDevice Table (Scanner Registration)

```prisma
model BiometricDevice {
  id                  String    @id @default(uuid())
  gymId               String

  // Device Info
  deviceName          String              // "Front Desk Scanner"
  deviceSerial        String    @unique   // Hardware serial number
  deviceModel         String              // "SecuGen Hamster Pro 20"
  deviceType          DeviceType @default(FINGERPRINT)

  // WebUSB Info
  vendorId            Int?                // USB Vendor ID
  productId           Int?                // USB Product ID

  // Connection
  lastSeenAt          DateTime?
  isOnline            Boolean   @default(false)

  // Status
  isActive            Boolean   @default(true)
  registeredAt        DateTime  @default(now())
  registeredBy        String              // User ID

  // Relations
  gym                 Gym       @relation(fields: [gymId], references: [id])
  registeredByUser    User      @relation(fields: [registeredBy], references: [id])

  @@index([gymId])
  @@map("biometric_devices")
}

enum DeviceType {
  FINGERPRINT
  FACE_RECOGNITION
  RFID_CARD
  QR_SCANNER
}
```

#### 4. AttendanceReport Table (Pre-computed Reports)

```prisma
model AttendanceReport {
  id                  String    @id @default(uuid())
  gymId               String

  // Report Period
  reportType          ReportType
  reportDate          DateTime  @db.Date  // For daily reports
  reportMonth         Int?               // For monthly (1-12)
  reportYear          Int

  // Aggregated Stats
  totalMembers        Int
  presentCount        Int
  absentCount         Int
  avgDurationMinutes  Float?
  peakHour            Int?              // Hour with most check-ins (0-23)

  // Generated
  generatedAt         DateTime  @default(now())

  // Relations
  gym                 Gym       @relation(fields: [gymId], references: [id])

  @@unique([gymId, reportType, reportDate])
  @@index([gymId])
  @@map("attendance_reports")
}

enum ReportType {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

### Updated Existing Tables

#### Member Table Addition

```prisma
model Member {
  // ... existing fields ...

  // Add relation
  biometric           MemberBiometric?
  attendances         Attendance[]

  // ... rest of model ...
}
```

#### Gym Table Addition

```prisma
model Gym {
  // ... existing fields ...

  // Add relations
  biometricDevices    BiometricDevice[]
  memberBiometrics    MemberBiometric[]
  attendances         Attendance[]
  attendanceReports   AttendanceReport[]

  // Attendance Settings
  attendanceEnabled   Boolean   @default(false)
  checkInStartTime    String?   @default("05:00")  // 24h format
  checkInEndTime      String?   @default("23:00")
  autoCheckoutTime    String?   @default("23:59")
  requireCheckout     Boolean   @default(false)

  // ... rest of model ...
}
```

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │      Gym        │       │     Member      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │◄──────│ gymId (FK)      │
│ email           │       │ ownerId (FK)────│──────▶│ userId (FK)─────│──┐
│ password        │◄──────│ name            │       │ id (PK)         │  │
│ roleId (FK)     │       │ attendanceEnabled│      │ name            │  │
└────────┬────────┘       │ checkInStartTime │      │ email           │  │
         │                │ checkInEndTime   │      │ membershipStatus│  │
         │                └────────┬─────────┘      └────────┬────────┘  │
         │                         │                         │           │
         │                         │                         │           │
         ▼                         ▼                         ▼           │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐ │
│ BiometricDevice │       │ AttendanceReport│       │ MemberBiometric │ │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤ │
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │ │
│ gymId (FK)──────│──────▶│ gymId (FK)      │       │ memberId (FK)───│─┘
│ deviceSerial    │       │ reportType      │       │ gymId (FK)      │
│ deviceModel     │       │ presentCount    │       │ fingerTemplate1 │
│ vendorId        │       │ absentCount     │       │ fingerPosition1 │
│ productId       │       │ avgDuration     │       │ enrolledBy (FK) │
│ registeredBy(FK)│       └─────────────────┘       │ isActive        │
└─────────────────┘                                 └────────┬────────┘
                                                             │
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │   Attendance    │
                                                    ├─────────────────┤
                                                    │ id (PK)         │
                                                    │ memberId (FK)   │
                                                    │ gymId (FK)      │
                                                    │ attendanceDate  │
                                                    │ checkInTime     │
                                                    │ checkOutTime    │
                                                    │ verificationMethod│
                                                    │ status          │
                                                    │ @@unique(memberId,│
                                                    │   attendanceDate)│
                                                    └─────────────────┘
```

### Database Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name add_biometric_attendance_tables

# Generate Prisma client
npx prisma generate

# Seed initial data (if needed)
npx prisma db seed
```

---

## API Endpoints Design

### Biometric Device Endpoints (Gym Owner)

```
Base: /api/v1/gym-owner/biometric-devices

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  POST    │ /                           │ Register new biometric device       │
│  GET     │ /                           │ List all devices for gym            │
│  GET     │ /:deviceId                  │ Get device details                  │
│  PUT     │ /:deviceId                  │ Update device info                  │
│  DELETE  │ /:deviceId                  │ Deactivate device                   │
│  POST    │ /:deviceId/test             │ Test device connectivity            │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

### Member Biometric Enrollment (Gym Owner)

```
Base: /api/v1/gym-owner/members/:memberId/biometric

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  POST    │ /enroll                     │ Enroll member fingerprint           │
│  GET     │ /status                     │ Check enrollment status             │
│  PUT     │ /update                     │ Update fingerprint template         │
│  DELETE  │ /                           │ Remove biometric data               │
│  POST    │ /verify                     │ Verify fingerprint (test)           │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

### Attendance Marking (Web Kiosk)

```
Base: /api/v1/attendance

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  POST    │ /check-in                   │ Mark attendance via fingerprint     │
│  POST    │ /check-out                  │ Check out via fingerprint           │
│  POST    │ /identify                   │ Identify member by fingerprint      │
│  GET     │ /today/:gymId               │ Get today's attendance for gym      │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘

# Note: These endpoints use device/kiosk authentication token
```

### Attendance Management (Gym Owner)

```
Base: /api/v1/gym-owner/attendance

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  GET     │ /                           │ Get attendance records (paginated)  │
│  GET     │ /today                      │ Get today's attendance summary      │
│  GET     │ /member/:memberId           │ Get member's attendance history     │
│  POST    │ /manual                     │ Manual attendance entry             │
│  PUT     │ /:attendanceId              │ Update attendance record            │
│  GET     │ /reports/daily              │ Daily attendance report             │
│  GET     │ /reports/weekly             │ Weekly attendance report            │
│  GET     │ /reports/monthly            │ Monthly attendance report           │
│  GET     │ /reports/export             │ Export attendance (CSV/PDF)         │
│  GET     │ /analytics                  │ Attendance analytics dashboard      │
│  GET     │ /settings                   │ Get attendance settings             │
│  PUT     │ /settings                   │ Update attendance settings          │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

### Member Attendance (Self-Service)

```
Base: /api/v1/member/attendance

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  GET     │ /my-attendance              │ Get own attendance history          │
│  GET     │ /my-attendance/summary      │ Get attendance summary (stats)      │
│  GET     │ /my-attendance/calendar     │ Get calendar view data              │
│  GET     │ /my-attendance/streak       │ Get attendance streak info          │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

### Admin Attendance (System-wide)

```
Base: /api/v1/admin/attendance

┌──────────┬─────────────────────────────┬─────────────────────────────────────┐
│  Method  │         Endpoint            │            Description              │
├──────────┼─────────────────────────────┼─────────────────────────────────────┤
│  GET     │ /all                        │ All gyms attendance (admin)         │
│  GET     │ /gym/:gymId                 │ Specific gym attendance             │
│  GET     │ /reports/system             │ System-wide reports                 │
│  GET     │ /devices                    │ All biometric devices               │
└──────────┴─────────────────────────────┴─────────────────────────────────────┘
```

### API Request/Response Examples

#### 1. Enroll Member Fingerprint

```typescript
// POST /api/v1/gym-owner/members/:memberId/biometric/enroll

// Request
{
  "fingerTemplate": "base64_encoded_template_data...",
  "fingerPosition": "RIGHT_INDEX",
  "quality": 85,
  "deviceId": "device-uuid-here"
}

// Response (201 Created)
{
  "success": true,
  "message": "Fingerprint enrolled successfully",
  "data": {
    "biometricId": "uuid",
    "memberId": "member-uuid",
    "memberName": "John Doe",
    "fingerPosition": "RIGHT_INDEX",
    "enrolledAt": "2024-01-15T10:30:00Z",
    "quality": 85
  }
}
```

#### 2. Check-In via Fingerprint

```typescript
// POST /api/v1/attendance/check-in

// Request
{
  "gymId": "gym-uuid",
  "fingerTemplate": "base64_encoded_captured_template...",
  "deviceId": "device-uuid"
}

// Response (200 OK)
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendanceId": "attendance-uuid",
    "memberId": "member-uuid",
    "memberName": "John Doe",
    "memberPhoto": "https://...",
    "checkInTime": "2024-01-15T06:30:00Z",
    "status": "CHECKED_IN",
    "greeting": "Good morning, John! Enjoy your workout!"
  }
}

// Response (409 Conflict - Already checked in)
{
  "success": false,
  "error": "ALREADY_CHECKED_IN",
  "message": "You have already checked in today at 06:30 AM",
  "data": {
    "existingCheckIn": "2024-01-15T06:30:00Z"
  }
}
```

#### 3. Get Attendance Report

```typescript
// GET /api/v1/gym-owner/attendance?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20

// Response
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "attendance-uuid",
        "member": {
          "id": "member-uuid",
          "name": "John Doe",
          "memberId": "MEM-001",
          "photo": "https://..."
        },
        "attendanceDate": "2024-01-15",
        "checkInTime": "2024-01-15T06:30:00Z",
        "checkOutTime": "2024-01-15T08:45:00Z",
        "durationMinutes": 135,
        "status": "CHECKED_OUT",
        "verificationMethod": "FINGERPRINT"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "summary": {
      "totalPresent": 45,
      "totalAbsent": 12,
      "avgDuration": 95,
      "peakHour": 7
    }
  }
}
```

---

## Integration Workflow

### Workflow 1: Member Enrollment (Fingerprint Registration via Browser)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MEMBER FINGERPRINT ENROLLMENT (Web Browser)                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Gym Owner                    Browser (Chrome/Edge)                    Backend API
      │                               │                                      │
      │  1. Open Member Details       │                                      │
      │ ─────────────────────────────▶│                                      │
      │                               │                                      │
      │                               │  2. Click "Enroll Fingerprint"       │
      │                               │                                      │
      │                               │  3. Check WebUSB support             │
      │                               │     if (!navigator.usb) { error }    │
      │                               │                                      │
      │                               │  4. Request USB device               │
      │                               │     navigator.usb.requestDevice()    │
      │                               │                                      │
      │  5. Browser shows USB         │                                      │
      │     device picker dialog      │                                      │
      │ ◀─────────────────────────────│                                      │
      │                               │                                      │
      │  6. Select fingerprint        │                                      │
      │     scanner from list         │                                      │
      │ ─────────────────────────────▶│                                      │
      │                               │                                      │
      │                               │  7. Open & claim device              │
      │                               │     device.open()                    │
      │                               │     device.claimInterface(0)         │
      │                               │                                      │
      │  8. Show "Place finger        │                                      │
      │     on scanner" prompt        │                                      │
      │ ◀─────────────────────────────│                                      │
      │                               │                                      │
      │  9. Member places finger      │                                      │
      │ ─────────────────────────────▶│                                      │
      │                               │                                      │
      │                               │  10. Capture via WebUSB              │
      │                               │      device.transferIn()             │
      │                               │      device.transferOut()            │
      │                               │                                      │
      │                               │  11. Process in browser              │
      │                               │      (JS SDK / WASM)                 │
      │                               │                                      │
      │                               │  12. Repeat 3 times for quality      │
      │                               │                                      │
      │                               │  13. Send enrollment to API          │
      │                               │ ─────────────────────────────────────▶│
      │                               │                                      │
      │                               │                                  14. Encrypt &
      │                               │                                      store template
      │                               │                                      │
      │                               │  15. Enrollment success              │
      │                               │ ◀─────────────────────────────────────│
      │                               │                                      │
      │  16. Show success             │                                      │
      │      with member photo        │                                      │
      │ ◀─────────────────────────────│                                      │
      │                               │                                      │
      ▼                               ▼                                      ▼
```

### Workflow 2: Daily Attendance Check-In (Web Kiosk)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DAILY ATTENDANCE CHECK-IN (Web Kiosk)                     │
└─────────────────────────────────────────────────────────────────────────────┘

  Member                      Web Kiosk (Browser)                      Backend API
      │                               │                                      │
      │  1. Approach kiosk            │                                      │
      │     (touch screen to          │                                      │
      │      activate)                │                                      │
      │ ─────────────────────────────▶│                                      │
      │                               │                                      │
      │                               │  2. Show "Place finger               │
      │                               │     to check in"                     │
      │                               │                                      │
      │  3. Place finger on           │                                      │
      │     scanner                   │                                      │
      │ ─────────────────────────────▶│                                      │
      │                               │                                      │
      │                               │  4. Capture via WebUSB               │
      │                               │     device.transferIn()              │
      │                               │                                      │
      │                               │  5. Process fingerprint              │
      │                               │     in browser (JS SDK)              │
      │                               │                                      │
      │                               │  6. POST /attendance/check-in        │
      │                               │ ─────────────────────────────────────▶│
      │                               │                                      │
      │                               │                                  7. Match template
      │                               │                                     against gym
      │                               │                                     members
      │                               │                                      │
      │                               │                                  8. If match found:
      │                               │                                     - Check membership
      │                               │                                       status (ACTIVE)
      │                               │                                     - Check no existing
      │                               │                                       attendance today
      │                               │                                     - Create attendance
      │                               │                                       record
      │                               │                                      │
      │                               │  9. Success response                 │
      │                               │     (member name, photo)             │
      │                               │ ◀─────────────────────────────────────│
      │                               │                                      │
      │  10. Display welcome          │                                      │
      │      "Welcome, John!"         │                                      │
      │      + Photo + Time           │                                      │
      │ ◀─────────────────────────────│                                      │
      │                               │                                      │
      │  11. Audio: "Check-in         │                                      │
      │      successful"              │                                      │
      │ ◀─────────────────────────────│                                      │
      │                               │                                      │
      ▼                               ▼                                      ▼
```

### Workflow 3: Attendance Verification Logic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE CHECK-IN VERIFICATION                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Receive fingerprint  │
                    │  template from browser│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Get all active       │
                    │  biometric templates  │
                    │  for this gym         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  1:N Fingerprint      │
                    │  Matching             │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │  Match Found  │       │  No Match     │
            │  (Score > 60) │       │               │
            └───────┬───────┘       └───────┬───────┘
                    │                       │
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │  Get Member   │       │  Return Error │
            │  Details      │       │  "Fingerprint │
            └───────┬───────┘       │   not found"  │
                    │               └───────────────┘
                    ▼
            ┌───────────────┐
            │  Check Member │
            │  Status       │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌───────┐   ┌───────┐   ┌───────┐
    │ACTIVE │   │EXPIRED│   │INACTIVE│
    └───┬───┘   └───┬───┘   └───┬───┘
        │           │           │
        ▼           ▼           ▼
        │       ┌───────────────────┐
        │       │  Return Warning   │
        │       │  "Membership      │
        │       │   expired/inactive"│
        │       └───────────────────┘
        │
        ▼
┌───────────────────┐
│  Check existing   │
│  attendance today │
└───────┬───────────┘
        │
        ├─────────────────┐
        │                 │
        ▼                 ▼
┌───────────────┐ ┌───────────────┐
│  No Record    │ │  Record Exists│
└───────┬───────┘ └───────┬───────┘
        │                 │
        ▼                 ▼
┌───────────────┐ ┌───────────────┐
│  Create New   │ │  Return Error │
│  Attendance   │ │  "Already     │
│  Record       │ │   checked in" │
└───────┬───────┘ └───────────────┘
        │
        ▼
┌───────────────────┐
│  Return Success   │
│  with Member Info │
└───────────────────┘
```

---

## Frontend Implementation

### WebUSB Biometric Service (Browser-Side)

```typescript
// frontend/src/services/biometricService.ts

export class BiometricService {
  private device: USBDevice | null = null;

  // Check if WebUSB is supported
  isSupported(): boolean {
    return 'usb' in navigator;
  }

  // Request access to fingerprint scanner
  async requestDevice(): Promise<USBDevice> {
    const device = await navigator.usb.requestDevice({
      filters: [
        // SecuGen Hamster Pro 20
        { vendorId: 0x1162, productId: 0x0320 },
        // DigitalPersona U.are.U 4500
        { vendorId: 0x05BA, productId: 0x000A },
        // Add more scanner vendors as needed
      ]
    });

    this.device = device;
    return device;
  }

  // Connect to the scanner
  async connect(): Promise<void> {
    if (!this.device) throw new Error('No device selected');

    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);
  }

  // Capture fingerprint
  async captureFingerprint(): Promise<{
    template: ArrayBuffer;
    quality: number;
  }> {
    if (!this.device) throw new Error('Device not connected');

    // Send capture command
    await this.device.transferOut(1, new Uint8Array([0x01, 0x00]));

    // Read fingerprint data
    const result = await this.device.transferIn(1, 64);

    // Process using JS SDK (vendor-specific)
    const template = this.processRawData(result.data);
    const quality = this.calculateQuality(result.data);

    return { template, quality };
  }

  // Disconnect from scanner
  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.releaseInterface(0);
      await this.device.close();
      this.device = null;
    }
  }

  private processRawData(data: DataView): ArrayBuffer {
    // Vendor-specific processing
    // Convert raw image to minutiae template
    return data.buffer;
  }

  private calculateQuality(data: DataView): number {
    // Calculate quality score 0-100
    return 85;
  }
}

export const biometricService = new BiometricService();
```

### Gym Owner Panel - Attendance Module

#### 1. Attendance Dashboard Page

```typescript
// pages/gym-owner/attendance/AttendanceDashboard.tsx

interface AttendanceDashboardProps {}

// Features:
// - Today's check-in summary (cards)
// - Live attendance feed
// - Quick stats: Present, Absent, Peak hours
// - Recent check-ins list with member photos
// - Calendar view option
// - Date range filter
// - Export button
```

#### 2. Attendance Reports Page

```typescript
// pages/gym-owner/attendance/AttendanceReports.tsx

// Features:
// - Date range picker
// - Filter by member
// - Filter by status (checked in, checked out, absent)
// - Sortable table with columns:
//   - Member photo + name
//   - Member ID
//   - Date
//   - Check-in time
//   - Check-out time
//   - Duration
//   - Status
//   - Verification method
// - Pagination
// - Export to CSV/PDF
```

#### 3. Member Biometric Enrollment (Browser-Based)

```typescript
// components/gym-owner/BiometricEnrollmentDialog.tsx

// Features:
// - Step-by-step wizard:
//   1. Check WebUSB support
//   2. Connect to scanner (browser device picker)
//   3. Select finger position
//   4. Capture fingerprint (3 scans)
//   5. Quality verification
//   6. Confirmation
// - Real-time scanner status
// - Quality score display
// - Error handling & retry
// - Works in Chrome/Edge on Windows & macOS
```

#### 4. Attendance Settings

```typescript
// pages/gym-owner/attendance/AttendanceSettings.tsx

// Features:
// - Enable/disable attendance module
// - Check-in time window (start/end)
// - Auto check-out time
// - Require check-out toggle
// - Device management (WebUSB devices)
// - Notification settings
```

### Member Panel - Attendance View

#### 1. My Attendance Page

```typescript
// pages/member/MyAttendance.tsx

// Features:
// - Current month calendar view
// - Attendance streak display
// - Monthly attendance percentage
// - List view with history
// - Filters: This week, This month, Custom range
```

#### 2. Member Dashboard Integration

```typescript
// components/member/AttendanceWidget.tsx

// Features:
// - Today's status (Checked in / Not yet)
// - This week's attendance
// - Current streak
// - Link to full history
```

### Web Kiosk Mode (Browser Full-Screen)

```typescript
// pages/kiosk/AttendanceKiosk.tsx

// Features:
// - Browser full-screen mode (F11 / Fullscreen API)
// - Large "Place finger" prompt
// - Idle screen with gym branding
// - Success animation with member photo
// - Audio feedback (Web Audio API)
// - Error messages
// - Auto-reconnect to scanner
// - Session persistence via localStorage

// Implementation:
const enterKioskMode = () => {
  document.documentElement.requestFullscreen();
};

// Prevent exit
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    // Re-enter fullscreen after small delay
    setTimeout(enterKioskMode, 100);
  }
});
```

### UI/UX Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   TODAY'S    │  │    WEEKLY    │  │   MONTHLY    │          │
│  │  CHECK-INS   │  │   AVERAGE    │  │  ATTENDANCE  │          │
│  │              │  │              │  │              │          │
│  │     45       │  │     38       │  │     87%      │          │
│  │   members    │  │   per day    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  LIVE ATTENDANCE FEED                              [View All]│ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  ○ John Doe          Checked In      06:30 AM    [View]    │ │
│  │  ○ Jane Smith        Checked In      06:45 AM    [View]    │ │
│  │  ○ Mike Wilson       Checked In      07:00 AM    [View]    │ │
│  │  ○ Sarah Brown       Checked Out     08:30 AM    [View]    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │   PEAK HOURS       │  │   TODAY BY HOUR                    │ │
│  │                    │  │   ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░           │ │
│  │   6:00 - 8:00 AM   │  │   5  6  7  8  9  10 11 12          │ │
│  │   5:00 - 7:00 PM   │  │                                    │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│              WEB KIOSK CHECK-IN SCREEN (Full Browser)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │   [Gym Logo]    │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │   [Fingerprint  │                          │
│                    │    Icon]        │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                  │
│                 Place your finger on the                         │
│                   scanner to check in                            │
│                                                                  │
│                    ────────────────                             │
│                    06:30:45 AM                                  │
│                    January 15, 2024                             │
│                                                                  │
│   [Scanner Status: Connected ✓]   [Browser: Chrome ✓]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

             ↓ AFTER SUCCESSFUL CHECK-IN ↓

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │  [Member Photo] │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                  │
│                     ✓ CHECK-IN SUCCESSFUL                       │
│                                                                  │
│                    Welcome, John Doe!                            │
│                                                                  │
│                    Checked in at 06:30 AM                        │
│                                                                  │
│                    Enjoy your workout!                           │
│                                                                  │
│               [Returns to idle in 5 seconds]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### 1. Fingerprint Template Security

```
┌─────────────────────────────────────────────────────────────────┐
│                   BIOMETRIC DATA SECURITY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ENCRYPTION                                                      │
│  ─────────────────────────────────────────────────────────────  │
│  • AES-256-GCM encryption for templates at rest                 │
│  • Unique encryption key per gym (stored in secrets manager)    │
│  • Templates never stored in plain text                         │
│  • HTTPS/TLS 1.3 for transmission                               │
│                                                                  │
│  TEMPLATE STORAGE                                                │
│  ─────────────────────────────────────────────────────────────  │
│  • Store minutiae templates, NOT raw fingerprint images         │
│  • Templates cannot be reverse-engineered to images             │
│  • ISO 19794-2 format (industry standard)                       │
│  • Maximum 400-800 bytes per template                           │
│                                                                  │
│  ACCESS CONTROL                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Gym-scoped access (owners see only their members)            │
│  • API endpoints require valid JWT + gym ownership              │
│  • Kiosk authentication via secure tokens                       │
│  • Audit logging for all biometric operations                   │
│                                                                  │
│  DATA RETENTION                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Auto-delete templates when member is deactivated             │
│  • GDPR compliance: member can request deletion                 │
│  • Audit trail maintained separately (anonymized)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. WebUSB Security

```typescript
// WebUSB Security Considerations

// 1. HTTPS Required
// WebUSB only works on secure contexts (HTTPS or localhost)

// 2. User Consent
// Browser shows device picker - user must explicitly select device

// 3. Origin Binding
// USB device access is bound to the origin that requested it

// 4. No Background Access
// Device access only works when page is in foreground

// 5. Permission Persistence
// Permissions can be revoked by user at any time
```

### 3. Privacy Compliance

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRIVACY COMPLIANCE CHECKLIST                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GDPR / Data Protection                                          │
│  ☐ Consent collection before enrollment                         │
│  ☐ Clear privacy policy for biometric data                      │
│  ☐ Right to erasure (delete on request)                         │
│  ☐ Data portability option                                      │
│  ☐ Purpose limitation (attendance only)                         │
│  ☐ Storage limitation (delete on membership end)                │
│                                                                  │
│  Member Consent Form (Required Fields)                           │
│  ☐ Member signature/acknowledgment                              │
│  ☐ Purpose of biometric collection                              │
│  ☐ How data will be stored                                      │
│  ☐ Who has access                                               │
│  ☐ Retention period                                             │
│  ☐ Right to withdraw consent                                    │
│                                                                  │
│  Technical Controls                                              │
│  ☐ Encryption at rest and in transit                            │
│  ☐ Access logging and monitoring                                │
│  ☐ Automatic data deletion workflows                            │
│  ☐ Regular security audits                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Error Handling & Spoofing Prevention

```typescript
// Anti-spoofing measures
interface BiometricValidation {
  // Liveness detection (if supported by hardware)
  livenessCheck: boolean;

  // Quality thresholds
  minimumQualityScore: 60;  // Reject poor captures
  minimumMatchScore: 65;    // Reject weak matches

  // Rate limiting
  maxAttemptsPerMinute: 5;  // Prevent brute force
  lockoutAfterFailures: 3;  // Temporary lockout

  // Anomaly detection
  unusualTimeAlert: boolean;  // Check-in at unusual hours
  duplicateAlert: boolean;    // Same person, different member
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DATABASE & API FOUNDATION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ Create Prisma schema for biometric tables                    │
│  ☐ Run database migrations                                      │
│  ☐ Create biometric service layer                               │
│  ☐ Create attendance service layer                              │
│  ☐ Implement basic API endpoints                                │
│  ☐ Add encryption utilities for templates                       │
│  ☐ Write unit tests                                             │
│                                                                  │
│  Deliverables:                                                   │
│  • MemberBiometric table created                                │
│  • Attendance table created                                     │
│  • BiometricDevice table created                                │
│  • Core services implemented                                    │
│  • API routes defined                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: WebUSB Integration (Week 3-4)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: WEBUSB BIOMETRIC INTEGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ Procure SecuGen Hamster Pro 20 scanner                       │
│  ☐ Create WebUSB service in frontend                            │
│  ☐ Implement fingerprint capture via browser                    │
│  ☐ Integrate vendor JavaScript SDK                              │
│  ☐ Create device registration flow                              │
│  ☐ Test on Chrome (Windows & macOS)                             │
│  ☐ Test on Edge (Windows & macOS)                               │
│  ☐ Handle browser compatibility gracefully                      │
│                                                                  │
│  Deliverables:                                                   │
│  • BiometricService.ts for WebUSB                               │
│  • Scanner integration working in browser                       │
│  • Cross-platform testing complete                              │
│  • Browser compatibility documented                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Gym Owner Frontend (Week 5-6)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: GYM OWNER ATTENDANCE FEATURES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ Create Attendance Dashboard page                             │
│  ☐ Create Attendance Reports page                               │
│  ☐ Create Biometric Enrollment dialog (WebUSB)                  │
│  ☐ Create Attendance Settings page                              │
│  ☐ Add biometric status to member details                       │
│  ☐ Implement export functionality (CSV/PDF)                     │
│  ☐ Add manual attendance entry                                  │
│                                                                  │
│  Deliverables:                                                   │
│  • Full attendance dashboard                                    │
│  • Reports with filters and export                              │
│  • Browser-based enrollment UI                                  │
│  • Settings configuration                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Member Frontend (Week 7)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: MEMBER ATTENDANCE FEATURES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ Create My Attendance page                                    │
│  ☐ Create Attendance Calendar component                         │
│  ☐ Create Attendance Streak widget                              │
│  ☐ Add attendance widget to member dashboard                    │
│  ☐ Implement attendance history API                             │
│                                                                  │
│  Deliverables:                                                   │
│  • Member attendance history view                               │
│  • Calendar view with attendance marked                         │
│  • Dashboard widget                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 5: Web Kiosk Mode (Week 8)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: WEB KIOSK CHECK-IN MODE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ Create kiosk route (/kiosk/attendance)                       │
│  ☐ Implement browser fullscreen mode                            │
│  ☐ Design and implement check-in UI                             │
│  ☐ Integrate WebUSB scanner capture                             │
│  ☐ Add success/error animations                                 │
│  ☐ Add audio feedback (Web Audio API)                           │
│  ☐ Handle reconnection to scanner                               │
│  ☐ Create kiosk setup guide for gym owners                      │
│                                                                  │
│  Deliverables:                                                   │
│  • Browser-based kiosk mode                                     │
│  • Full check-in/check-out flow                                 │
│  • Auto-reconnect functionality                                 │
│  • Setup documentation                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 6: Testing & Polish (Week 9)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: TESTING, SECURITY & DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ☐ End-to-end testing                                           │
│  ☐ Cross-browser testing (Chrome, Edge)                         │
│  ☐ Cross-platform testing (Windows, macOS)                      │
│  ☐ Security audit                                               │
│  ☐ Performance testing                                          │
│  ☐ User acceptance testing                                      │
│  ☐ Documentation                                                │
│  ☐ Training materials                                           │
│                                                                  │
│  Deliverables:                                                   │
│  • Test reports                                                 │
│  • Security audit report                                        │
│  • User documentation                                           │
│  • Kiosk setup guide                                            │
│  • Training videos/materials                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cost Estimation

### Hardware Costs (Per Gym)

#### Basic Setup (Attendance Only)

| Item | Quantity | Unit Price | Total |
|------|----------|------------|-------|
| SecuGen Hamster Pro 20 | 1-2 | $100 | $100-200 |
| Touch Screen Monitor (for kiosk) | 1 | $150-300 | $150-300 |
| Mini PC (if using dedicated kiosk) | 1 | $200-400 | $200-400 |
| USB Extension Cable | 1 | $10 | $10 |
| **Total (Basic)** | | | **$460-910** |

**Note:** If using existing computer with Chrome/Edge, cost is just the scanner ($100).

#### With Door Lock Integration

| Item | Quantity | Unit Price | Total |
|------|----------|------------|-------|
| SecuGen Hamster Pro 20 | 1 | $100 | $100 |
| USB Relay Module (LCUS-1) | 1 | $15 | $15 |
| Electric Strike Lock | 1 | $50-80 | $50-80 |
| 12V 2A Power Adapter | 1 | $10 | $10 |
| Door Position Sensor | 1 | $10 | $10 |
| Wiring & Connectors | 1 | $15 | $15 |
| Touch Screen (optional kiosk) | 1 | $150-300 | $150-300 |
| Mini PC (optional kiosk) | 1 | $200-400 | $200-400 |
| **Total (With Door Lock)** | | | **$550-930** |

**Budget Option:** Scanner + Door Lock only = **$200** (using existing computer)

#### Alternative: Smart Lock Option

| Item | Quantity | Unit Price | Total |
|------|----------|------------|-------|
| SecuGen Hamster Pro 20 | 1 | $100 | $100 |
| TTLock Smart Lock (with API) | 1 | $80-150 | $80-150 |
| **Total (Smart Lock)** | | | **$180-250** |

### Software Development Estimate

| Phase | Description | Effort |
|-------|-------------|--------|
| Phase 1 | Database & API | 40-60 hours |
| Phase 2 | WebUSB Integration | 30-50 hours |
| Phase 3 | Gym Owner Frontend | 40-50 hours |
| Phase 4 | Member Frontend | 20-30 hours |
| Phase 5 | Web Kiosk Mode | 25-35 hours |
| Phase 6 | Door Lock Integration | 20-30 hours |
| Phase 7 | Testing & Polish | 25-35 hours |
| **Total** | | **200-290 hours** |

### Ongoing Costs

| Item | Monthly Cost |
|------|--------------|
| Cloud hosting (existing) | Included |
| Database storage increase | ~$5-10 |
| SDK license (if required) | Usually free |
| Smart lock API (if applicable) | $0-10 |
| **Total Monthly** | **$5-20** |

---

## Appendix

### A. WebUSB Biometric Service Example

```typescript
// frontend/src/services/biometricService.ts

export class BiometricService {
  private device: USBDevice | null = null;
  private isConnected: boolean = false;

  // SecuGen Hamster Pro 20 USB IDs
  private static SECUGEN_VENDOR_ID = 0x1162;
  private static SECUGEN_PRODUCT_ID = 0x0320;

  isSupported(): boolean {
    return 'usb' in navigator;
  }

  async requestDevice(): Promise<USBDevice> {
    if (!this.isSupported()) {
      throw new Error('WebUSB is not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: BiometricService.SECUGEN_VENDOR_ID },
          // Add more scanner vendors as needed
        ]
      });

      this.device = device;
      return device;
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        throw new Error('No fingerprint scanner selected. Please select a device.');
      }
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected. Call requestDevice() first.');
    }

    try {
      await this.device.open();

      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }

      await this.device.claimInterface(0);
      this.isConnected = true;

      console.log('Scanner connected successfully');
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Failed to connect to scanner: ${(error as Error).message}`);
    }
  }

  async captureFingerprint(): Promise<{
    template: string;  // Base64 encoded
    quality: number;
  }> {
    if (!this.device || !this.isConnected) {
      throw new Error('Scanner not connected');
    }

    try {
      // Send capture command (vendor-specific)
      const captureCommand = new Uint8Array([0x40, 0x04, 0x00, 0x00]);
      await this.device.transferOut(2, captureCommand);

      // Wait for capture
      await new Promise(resolve => setTimeout(resolve, 500));

      // Read fingerprint data
      const result = await this.device.transferIn(1, 512);

      if (!result.data) {
        throw new Error('No data received from scanner');
      }

      // Process the raw data (vendor-specific SDK processing)
      const template = this.arrayBufferToBase64(result.data.buffer);
      const quality = this.calculateQuality(result.data);

      return { template, quality };
    } catch (error) {
      throw new Error(`Capture failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.device && this.isConnected) {
      try {
        await this.device.releaseInterface(0);
        await this.device.close();
      } catch (error) {
        console.warn('Error disconnecting:', error);
      }
    }

    this.isConnected = false;
    this.device = null;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private calculateQuality(data: DataView): number {
    // Simplified quality calculation
    // In production, use vendor SDK for accurate quality
    let sum = 0;
    for (let i = 0; i < data.byteLength; i++) {
      sum += data.getUint8(i);
    }
    return Math.min(100, Math.floor((sum / data.byteLength) * 100 / 255));
  }
}

export const biometricService = new BiometricService();
```

### B. Encryption Utility Example

```typescript
// backend/src/utils/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encryptTemplate(
  template: Buffer,
  encryptionKey: string
): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(template),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptTemplate(
  encryptedData: Buffer,
  encryptionKey: string
): Buffer {
  const iv = encryptedData.subarray(0, IV_LENGTH);
  const tag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = encryptedData.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}
```

### C. Environment Variables Required

```env
# .env additions for biometric module

# Biometric encryption key (generate with: openssl rand -hex 32)
BIOMETRIC_ENCRYPTION_KEY=your_256_bit_hex_key_here

# Scanner settings
FINGERPRINT_QUALITY_THRESHOLD=60
FINGERPRINT_MATCH_THRESHOLD=65
MAX_ENROLLMENT_ATTEMPTS=5

# Kiosk settings
KIOSK_SESSION_TIMEOUT=28800000  # 8 hours in ms
```

### D. Database Indexes for Performance

```sql
-- For efficient attendance queries
CREATE INDEX idx_attendance_gym_date ON attendance(gym_id, attendance_date);
CREATE INDEX idx_attendance_member_date ON attendance(member_id, attendance_date);

-- For biometric matching
CREATE INDEX idx_biometric_gym_active ON member_biometrics(gym_id) WHERE is_active = true;

-- For reports
CREATE INDEX idx_attendance_date_status ON attendance(attendance_date, status);
```

### E. Kiosk Setup Guide for Gym Owners

```
┌─────────────────────────────────────────────────────────────────┐
│                    KIOSK SETUP GUIDE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUIREMENTS:                                                   │
│  • Computer with Windows 10/11 or macOS 10.15+                  │
│  • Google Chrome or Microsoft Edge (latest version)             │
│  • SecuGen Hamster Pro 20 USB scanner                           │
│  • Internet connection                                          │
│                                                                  │
│  SETUP STEPS:                                                    │
│                                                                  │
│  1. Connect Scanner                                              │
│     - Plug SecuGen scanner into USB port                        │
│     - Wait for driver installation (automatic)                  │
│                                                                  │
│  2. Open Kiosk Mode                                              │
│     - Open Chrome/Edge browser                                  │
│     - Navigate to: https://yourdomain.com/kiosk/attendance      │
│     - Login with gym owner credentials                          │
│                                                                  │
│  3. Connect Scanner in Browser                                   │
│     - Click "Connect Scanner" button                            │
│     - Select your scanner from browser popup                    │
│     - Click "Connect"                                           │
│                                                                  │
│  4. Enter Fullscreen Mode                                        │
│     - Press F11 or click "Enter Kiosk Mode"                     │
│     - Browser will go fullscreen                                │
│                                                                  │
│  5. Test Check-In                                                │
│     - Place enrolled member's finger on scanner                 │
│     - Verify check-in works correctly                           │
│                                                                  │
│  TIPS:                                                           │
│  • Keep Chrome/Edge updated for best WebUSB support             │
│  • Don't close the kiosk browser tab                            │
│  • If scanner disconnects, refresh page and reconnect           │
│  • Set computer to never sleep when plugged in                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Document Version

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial planning document |
| 2.0 | 2024-01-16 | System | Updated to web-only (WebUSB) approach |
| 3.0 | 2024-01-17 | System | Added SecuGen setup guide & Door Lock Integration |
| 4.0 | 2024-01-18 | System | Added All-in-One devices (ZKTeco F18/K40), comparison table, wiring diagrams |

---

## Next Steps

1. **Review this document** with stakeholders
2. **Procure hardware:**
   - SecuGen Hamster Pro 20 scanner ($100)
   - USB Relay Module for door lock ($15)
   - Electric Strike Lock ($50-80)
   - 12V Power Supply ($10)
3. **Test WebUSB** compatibility in target browsers (Chrome/Edge)
4. **Set up SecuGen scanner** following the setup guide
5. **Test door lock hardware** with relay module
6. **Begin Phase 1** implementation
7. **Schedule regular progress reviews**

---

## Quick Reference: Complete Hardware Shopping List

```
┌─────────────────────────────────────────────────────────────────┐
│              HARDWARE SHOPPING LIST (Per Gym)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ESSENTIAL (Attendance + Door Lock):                            │
│  ─────────────────────────────────────────────────────────────  │
│  □ SecuGen Hamster Pro 20              $100    Amazon/SecuGen   │
│  □ LCUS-1 USB Relay Module (1-channel) $15     Amazon           │
│  □ Electric Strike Lock (fail-secure)  $50-80  Amazon/Security  │
│  □ 12V 2A DC Power Adapter             $10     Amazon           │
│  □ 22AWG Wire (10 feet)                $5      Hardware store   │
│  □ Wire Connectors                     $5      Hardware store   │
│                                        ────────                  │
│                              SUBTOTAL: $185-215                  │
│                                                                  │
│  OPTIONAL (Dedicated Kiosk):                                    │
│  ─────────────────────────────────────────────────────────────  │
│  □ 15" Touch Screen Monitor            $150-300  Amazon         │
│  □ Mini PC (Intel NUC / Beelink)       $200-400  Amazon         │
│  □ Door Position Sensor                $10       Amazon         │
│  □ Kiosk Stand/Mount                   $50-100   Amazon         │
│                                        ────────                  │
│                              SUBTOTAL: $410-810                  │
│                                                                  │
│                         GRAND TOTAL: $595-1025                   │
│                                                                  │
│  BUDGET OPTION (Use existing computer):                          │
│  Scanner + Door Lock only              $185-215                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*This document serves as the comprehensive planning guide for implementing browser-based biometric attendance with door lock integration using WebUSB in the Gym Management System. All implementation decisions should reference this document.*
